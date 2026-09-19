export const APP_STORAGE_KEYS = {
  progress: 'english_app_data',
  settings: 'english_app_settings',
  math: 'english_app_math_data',
} as const

export const MATH_DRAFT_KEY = 'english_app_math_practice_draft'
export const ENGLISH_DRAFT_KEY = 'english_app_english_activity_drafts'

export interface PersistenceStatus {
  available: boolean
  pendingKeys: string[]
  message: string
}

const pendingValues = new Map<string, string | null>()
const lastKnownValues = new Map<string, string | null>()
const listeners = new Set<() => void>()
let status: PersistenceStatus = { available: true, pendingKeys: [], message: '' }

function updateStatus(message = '') {
  const next = { available: !message && pendingValues.size === 0, pendingKeys: [...pendingValues.keys()], message }
  if (JSON.stringify(next) === JSON.stringify(status)) return
  status = next
  // Reads may happen during render. Notify after the current render completes.
  queueMicrotask(() => listeners.forEach(listener => listener()))
}

export function getPersistenceStatus(): PersistenceStatus {
  return status
}

export function subscribePersistence(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function readStoredText(key: string): string | null {
  if (pendingValues.has(key)) return pendingValues.get(key) ?? null
  try {
    const value = localStorage.getItem(key)
    lastKnownValues.set(key, value)
    return value
  } catch {
    updateStatus('浏览器暂时无法读取学习记录。请保留此页面，并检查浏览器存储权限。')
    return lastKnownValues.get(key) ?? null
  }
}

export function writeStoredText(key: string, value: string | null): boolean {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
    lastKnownValues.set(key, value)
    pendingValues.delete(key)
    updateStatus(pendingValues.size > 0 ? '部分学习记录仅保留在当前页面，请先导出备份。' : '')
    return true
  } catch {
    pendingValues.set(key, value)
    updateStatus('浏览器未能保存学习记录，最新进度暂存在当前页面。请先导出备份，再关闭或刷新。')
    return false
  }
}

export function retryPendingWrites(): boolean {
  for (const [key, value] of [...pendingValues]) writeStoredText(key, value)
  return pendingValues.size === 0
}

/** All-or-rollback replacement, with a memory copy if the browser also rejects rollback. */
export function replaceStoredValues(values: Record<string, string | null>): boolean {
  const previous = new Map<string, string | null>()
  const applied: string[] = []
  try {
    // Do not start a destructive operation if the existing values cannot be read.
    for (const key of Object.keys(values)) {
      previous.set(key, pendingValues.has(key) ? pendingValues.get(key) ?? null : localStorage.getItem(key))
    }
    for (const [key, value] of Object.entries(values)) {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
      applied.push(key)
    }
    Object.entries(values).forEach(([key, value]) => {
      pendingValues.delete(key)
      lastKnownValues.set(key, value)
    })
    updateStatus(pendingValues.size ? '部分学习记录仅保留在当前页面，请先导出备份。' : '')
    return true
  } catch {
    for (const key of applied.reverse()) {
      const value = previous.get(key) ?? null
      try {
        if (value === null) localStorage.removeItem(key)
        else localStorage.setItem(key, value)
        lastKnownValues.set(key, value)
        pendingValues.delete(key)
      } catch {
        pendingValues.set(key, value)
      }
    }
    updateStatus('操作未完成，已保留原有学习记录。请导出备份后重试；关闭页面前请确认备份已下载。')
    return false
  }
}
