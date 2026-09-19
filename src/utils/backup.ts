import { MATH_SCHEMA_VERSION, type MathProgressData } from '../data/math'
import { PROGRESS_SCHEMA_VERSION, SETTINGS_SCHEMA_VERSION } from '../data/bridgePlan'
import {
  loadMathProgress, loadProgress, loadSettings,
  normalizeMathProgressData, normalizeProgressData, normalizeSettingsData,
  type AppSettings, type ProgressData,
} from './storage'
import { APP_STORAGE_KEYS, ENGLISH_DRAFT_KEY, MATH_DRAFT_KEY, replaceStoredValues } from './persistence'

export interface StudyBackup {
  app: 'english-math-study'
  version: 1
  exportedAt: string
  data: { progress: ProgressData, settings: AppSettings, math: MathProgressData }
}

export function createStudyBackup(now = new Date()): StudyBackup {
  return {
    app: 'english-math-study',
    version: 1,
    exportedAt: now.toISOString(),
    data: { progress: loadProgress(), settings: loadSettings(), math: loadMathProgress() },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (isRecord(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}

function hasValidDates(value: unknown): boolean {
  if (Array.isArray(value)) return value.every(hasValidDates)
  if (!isRecord(value)) return true
  return Object.entries(value).every(([key, item]) => {
    if (key.endsWith('At') && (typeof item !== 'string' || !Number.isFinite(Date.parse(item)))) return false
    return hasValidDates(item)
  })
}

/** Import is deliberately stricter than local recovery: malformed files never replace data. */
export function parseStudyBackup(text: string): StudyBackup {
  if (text.length > 10_000_000) throw new Error('备份文件过大，请选择本应用导出的 JSON 备份。')
  let value: unknown
  try { value = JSON.parse(text) } catch { throw new Error('文件不是有效的 JSON 备份，原有数据未更改。') }
  if (!isRecord(value) || value.app !== 'english-math-study' || value.version !== 1) {
    throw new Error('备份格式或版本不受支持，原有数据未更改。')
  }
  if (typeof value.exportedAt !== 'string' || !Number.isFinite(Date.parse(value.exportedAt)) || !isRecord(value.data)) {
    throw new Error('备份缺少导出时间或学习数据，原有数据未更改。')
  }
  const { progress, settings, math } = value.data
  if (!isRecord(progress) || !isRecord(settings) || !isRecord(math)
    || progress.schemaVersion !== PROGRESS_SCHEMA_VERSION
    || settings.schemaVersion !== SETTINGS_SCHEMA_VERSION
    || math.schemaVersion !== MATH_SCHEMA_VERSION) {
    throw new Error('备份的数据版本不受支持，请使用对应版本的应用导出，原有数据未更改。')
  }
  // Validate without applying the normal 180-day retention policy to an older backup.
  const earliest = new Date(0)
  const normalized: StudyBackup = {
    app: 'english-math-study', version: 1, exportedAt: value.exportedAt,
    data: {
      progress: normalizeProgressData(progress, earliest),
      settings: normalizeSettingsData(settings),
      math: normalizeMathProgressData(math, earliest),
    },
  }
  // Math normalization rebuilds scores/totals from details and bounds known modes;
  // requiring exact equality rejects inconsistent imports instead of repairing them silently.
  if (!hasValidDates(value) || stableJson(value) !== stableJson(normalized)) {
    throw new Error('备份内容不完整或存在无效字段，原有数据未更改。')
  }
  return normalized
}

export function importStudyBackup(backup: StudyBackup): { success: boolean, previous: StudyBackup, draftCleared: boolean } {
  const validated = parseStudyBackup(JSON.stringify(backup))
  const previous = createStudyBackup()
  const success = replaceStoredValues({
    [APP_STORAGE_KEYS.progress]: JSON.stringify(normalizeProgressData(validated.data.progress)),
    [APP_STORAGE_KEYS.settings]: JSON.stringify(normalizeSettingsData(validated.data.settings)),
    [APP_STORAGE_KEYS.math]: JSON.stringify(normalizeMathProgressData(validated.data.math)),
  })
  return { success, previous, draftCleared: success && clearStudyDraft() }
}

function clearStudyDraft(): boolean {
  try {
    sessionStorage.removeItem(MATH_DRAFT_KEY)
    sessionStorage.removeItem(ENGLISH_DRAFT_KEY)
    return true
  } catch {
    return false
  }
}

export function resetStudyData(keepSettings = true): { success: boolean, draftCleared: boolean } {
  const success = replaceStoredValues({
    [APP_STORAGE_KEYS.progress]: null,
    [APP_STORAGE_KEYS.math]: null,
    ...(!keepSettings ? { [APP_STORAGE_KEYS.settings]: null } : {}),
  })
  return { success, draftCleared: success && clearStudyDraft() }
}

export function downloadStudyBackup(backup: StudyBackup, prefix = '双科学习备份'): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${prefix}-${backup.exportedAt.slice(0, 10)}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
