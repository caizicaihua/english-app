import {
  MATH_SCHEMA_VERSION,
  type MathAttempt,
  type MathModeProgress,
  type MathPracticeMode,
  type MathProgressData,
  type MathQuestion,
  type MathQuestionType,
  type MathSectionResult,
  type MathWrongQuestion,
  type ScoredMathMode,
} from '../data/math'
import {
  PROGRESS_SCHEMA_VERSION,
  SETTINGS_SCHEMA_VERSION,
  defaultBridgePlanSettings,
  type BridgePlanSettings,
  type DailyStudyPlan,
  type DailyTaskId,
  type DiagnosticDraft,
  type DiagnosticQuestionPlan,
  type DiagnosticQuestionType,
  type DiagnosticResponse,
  type DiagnosticResult,
  type DiagnosticSectionPlan,
  type DiagnosticUnitResult,
  type MasteryLevel,
  type StudySession,
  type StudyTaskType,
  type UnitFollowUpPlan,
  type WordLearningSource,
  type WordLearningState,
  type WordPrioritySignals,
} from '../data/bridgePlan'
import { gradeCatalog } from '../data/gradeCatalog'
import { getMathSkill } from '../data/mathSkills'
import type { SpeechSpeedPreset } from './speech'
import { APP_STORAGE_KEYS, readStoredText, writeStoredText } from './persistence'
import {
  createWordExposureState,
  migrateLegacyWordStates,
  recordWordResult,
} from './mastery'

const STORAGE_KEY = APP_STORAGE_KEYS.progress
const SETTINGS_KEY = APP_STORAGE_KEYS.settings
const MATH_STORAGE_KEY = APP_STORAGE_KEYS.math

const mathQuestionTypes: MathQuestionType[] = ['calc', 'fill', 'compare']
const mathPracticeModes: MathPracticeMode[] = ['paper', 'quick', 'focused', 'review']
const scoredMathModes: ScoredMathMode[] = ['paper', 'quick', 'focused']
const speechSpeedPresets: SpeechSpeedPreset[] = ['slow', 'normal', 'verySlow']
const diagnosticQuestionTypes: DiagnosticQuestionType[] = ['zh2en', 'listen', 'spell']
const studyTaskTypes: StudyTaskType[] = [
  'review',
  'verification',
  'new_words',
  'quiz',
  'diagnostic',
  'math',
]
const dailyTaskIds: DailyTaskId[] = [
  'english_activity',
  'diagnostic',
  'review',
  'verification',
  'new_words',
  'quiz',
  'math',
]

export interface EnglishEvidence {
  id: string
  activityId: string
  skill: 'listening' | 'reading' | 'spelling' | 'speaking'
  correct: boolean
  recordedAt: string
}

export interface ProgressData {
  contentRevision?: number
  englishEvidence?: EnglishEvidence[]
  planSettingsHistory?: Array<{ effectiveDate: string, settings: BridgePlanSettings }>
  schemaVersion: typeof PROGRESS_SCHEMA_VERSION
  completedUnits: Record<string, number>
  learnedWords: string[]
  wrongWords: string[]
  dailyWords: Record<string, number>
  dailyWordIds: Record<string, string[]>
  streak: number
  lastStudyDate: string
  achievements: string[]
  wordMastery: Record<string, WordLearningState>
  unitFollowUpPlans: UnitFollowUpPlan[]
  diagnosticResults: DiagnosticResult[]
  diagnosticDraft: DiagnosticDraft | null
  diagnosticSkippedAt?: string
  studySessions: StudySession[]
  dailyPlans: Record<string, DailyStudyPlan>
}

export interface AppSettings {
  schemaVersion: typeof SETTINGS_SCHEMA_VERSION
  speechSpeed: SpeechSpeedPreset
  bridgePlan: BridgePlanSettings
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function toNonNegativeInteger(value: unknown, fallback = 0): number {
  return isFiniteNumber(value) ? Math.max(0, Math.floor(value)) : fallback
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))]
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function isLocalDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
}

function isMasteryLevel(value: unknown): value is MasteryLevel {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 0 && value <= 4
}

function normalizeNumberRecord(
  value: unknown,
  minimum: number,
  maximum?: number,
): Record<string, number> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
    if (!isFiniteNumber(item)) return []
    const normalized = Math.floor(item)
    if (normalized < minimum || (maximum !== undefined && normalized > maximum)) return []
    return [[key, normalized]]
  }))
}

function normalizeStringArrayRecord(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(Object.entries(value).flatMap(([dateKey, items]) => (
    isLocalDateKey(dateKey) && Array.isArray(items)
      ? [[dateKey, toStringArray(items)]]
      : []
  )))
}

function normalizeWordPrioritySignals(value: unknown): WordPrioritySignals {
  if (!isRecord(value)) return {}

  return {
    ...(value.legacyWrong === true ? { legacyWrong: true } : {}),
    ...(toOptionalString(value.lastWrongAt) ? { lastWrongAt: String(value.lastWrongAt) } : {}),
    ...(toOptionalString(value.lastDiagnosticWeakAt)
      ? { lastDiagnosticWeakAt: String(value.lastDiagnosticWeakAt) }
      : {}),
  }
}

function normalizeWordLearningState(value: unknown): WordLearningState | null {
  if (!isRecord(value) || !isMasteryLevel(value.level)) return null

  const nextReviewDate = isLocalDateKey(value.nextReviewDate)
    ? value.nextReviewDate
    : undefined
  const level = value.level

  return {
    level,
    correctStreak: toNonNegativeInteger(value.correctStreak),
    wrongCount: toNonNegativeInteger(value.wrongCount),
    ...(toOptionalString(value.firstSeenAt)
      ? { firstSeenAt: String(value.firstSeenAt) }
      : {}),
    ...(toOptionalString(value.lastReviewedAt)
      ? { lastReviewedAt: String(value.lastReviewedAt) }
      : {}),
    ...(toOptionalString(value.lastMasteredAt)
      ? { lastMasteredAt: String(value.lastMasteredAt) }
      : {}),
    ...(level > 0 && nextReviewDate ? { nextReviewDate } : {}),
    ...(isLocalDateKey(value.lastCountedCorrectDate)
      ? { lastCountedCorrectDate: value.lastCountedCorrectDate }
      : {}),
    prioritySignals: normalizeWordPrioritySignals(value.prioritySignals),
  }
}

function normalizeWordMastery(value: unknown): Record<string, WordLearningState> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(Object.entries(value).flatMap(([wordId, item]) => {
    const state = normalizeWordLearningState(item)
    return wordId && state ? [[wordId, state]] : []
  }))
}

function normalizeUnitFollowUpPlan(value: unknown): UnitFollowUpPlan | null {
  if (!isRecord(value)) return null
  const reason = value.reason === 'review' || value.reason === 'focus'
    ? value.reason
    : null
  const unitKey = toOptionalString(value.unitKey)
  const sourceDiagnosticId = toOptionalString(value.sourceDiagnosticId)
  const createdAt = toOptionalString(value.createdAt)

  if (!reason || !unitKey || !sourceDiagnosticId || !createdAt) return null

  return {
    unitKey,
    sourceDiagnosticId,
    reason,
    candidateWordIds: toStringArray(value.candidateWordIds).length > 0
      ? toStringArray(value.candidateWordIds)
      : [...new Set([
        ...toStringArray(value.pendingWordIds),
        ...toStringArray(value.assessedWordIds),
      ])],
    pendingWordIds: toStringArray(value.pendingWordIds),
    assessedWordIds: toStringArray(value.assessedWordIds),
    correctCount: toNonNegativeInteger(value.correctCount),
    createdAt,
    ...(toOptionalString(value.completedAt)
      ? { completedAt: String(value.completedAt) }
      : {}),
  }
}

function normalizeDiagnosticResponse(value: unknown): DiagnosticResponse | null {
  if (!isRecord(value)) return null
  const questionId = toOptionalString(value.questionId)
  const wordId = toOptionalString(value.wordId)
  const unitKey = toOptionalString(value.unitKey)
  const answeredAt = toOptionalString(value.answeredAt)
  const questionType = diagnosticQuestionTypes.includes(value.questionType as DiagnosticQuestionType)
    ? value.questionType as DiagnosticQuestionType
    : null

  if (
    !questionId
    || !wordId
    || !unitKey
    || !answeredAt
    || !questionType
    || typeof value.isCorrect !== 'boolean'
  ) {
    return null
  }

  return {
    questionId,
    wordId,
    unitKey,
    answeredAt,
    questionType,
    isCorrect: value.isCorrect,
  }
}

function normalizeDiagnosticResponses(value: unknown): DiagnosticResponse[] {
  if (!Array.isArray(value)) return []
  return value.map(normalizeDiagnosticResponse).filter((item): item is DiagnosticResponse => !!item)
}

function normalizeDiagnosticUnitResult(value: unknown): DiagnosticUnitResult | null {
  if (!isRecord(value)) return null
  const status = value.status === 'mastered'
    || value.status === 'review'
    || value.status === 'focus'
    ? value.status
    : null

  if (!status || !isFiniteNumber(value.score)) return null

  return {
    score: Math.max(0, Math.min(100, Math.round(value.score))),
    status,
    sampledWordIds: toStringArray(value.sampledWordIds),
  }
}

function normalizeDiagnosticUnitResults(value: unknown): Record<string, DiagnosticUnitResult> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(Object.entries(value).flatMap(([unitKey, item]) => {
    const result = normalizeDiagnosticUnitResult(item)
    return result ? [[unitKey, result]] : []
  }))
}

function normalizeDiagnosticResult(value: unknown): DiagnosticResult | null {
  if (!isRecord(value)) return null
  const id = toOptionalString(value.id)
  const startedAt = toOptionalString(value.startedAt)
  const completedAt = toOptionalString(value.completedAt)
  if (!id || !startedAt || !completedAt) return null

  return {
    id,
    startedAt,
    completedAt,
    unitResults: normalizeDiagnosticUnitResults(value.unitResults),
    weakWordIds: toStringArray(value.weakWordIds),
    responses: normalizeDiagnosticResponses(value.responses),
  }
}

function normalizeDiagnosticQuestion(value: unknown): DiagnosticQuestionPlan | null {
  if (!isRecord(value)) return null
  const id = toOptionalString(value.id)
  const unitKey = toOptionalString(value.unitKey)
  const wordId = toOptionalString(value.wordId)
  const questionType = diagnosticQuestionTypes.includes(value.questionType as DiagnosticQuestionType)
    ? value.questionType as DiagnosticQuestionType
    : null
  const phase = value.phase === 'base' || value.phase === 'confirmation'
    ? value.phase
    : null
  if (!id || !unitKey || !wordId || !questionType || !phase) return null

  return { id, unitKey, wordId, questionType, phase }
}

function normalizeDiagnosticSection(value: unknown): DiagnosticSectionPlan | null {
  if (!isRecord(value)) return null
  const id = toOptionalString(value.id)
  if (!id || !Array.isArray(value.questions)) return null

  const questions = value.questions
    .map(normalizeDiagnosticQuestion)
    .filter((item): item is DiagnosticQuestionPlan => !!item)
  if (questions.length === 0) return null

  return {
    id,
    unitKeys: toStringArray(value.unitKeys),
    questions,
  }
}

function normalizeDiagnosticDraft(value: unknown): DiagnosticDraft | null {
  if (!isRecord(value)) return null
  const id = toOptionalString(value.id)
  const startedAt = toOptionalString(value.startedAt)
  if (!id || !startedAt || !Array.isArray(value.sections)) return null

  const sections = value.sections
    .map(normalizeDiagnosticSection)
    .filter((item): item is DiagnosticSectionPlan => !!item)
  if (sections.length === 0) return null
  const currentSection = Math.min(
    sections.length - 1,
    toNonNegativeInteger(value.currentSection),
  )
  const currentQuestionIndex = Math.min(
    sections[currentSection].questions.length,
    toNonNegativeInteger(value.currentQuestionIndex),
  )

  return {
    id,
    startedAt,
    currentSection,
    currentQuestionIndex,
    sections,
    responses: normalizeDiagnosticResponses(value.responses),
  }
}

function normalizeStudySession(value: unknown): StudySession | null {
  if (!isRecord(value)) return null
  const id = toOptionalString(value.id)
  const taskType = studyTaskTypes.includes(value.taskType as StudyTaskType)
    ? value.taskType as StudyTaskType
    : null

  if (!id || !isLocalDateKey(value.date) || !taskType) return null

  return {
    id,
    date: value.date,
    taskType,
    itemCount: toNonNegativeInteger(value.itemCount),
    correctCount: toNonNegativeInteger(value.correctCount),
    durationSeconds: toNonNegativeInteger(value.durationSeconds),
  }
}

function normalizeStudySessions(value: unknown, now: Date): StudySession[] {
  if (!Array.isArray(value)) return []
  const cutoff = new Date(now)
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - 179)

  return value
    .map(normalizeStudySession)
    .filter((item): item is StudySession => {
      if (!item) return false
      const [year, month, day] = item.date.split('-').map(Number)
      return new Date(year, month - 1, day) >= cutoff
    })
    .sort((first, second) => first.date.localeCompare(second.date))
}

function normalizeDailyStudyPlan(value: unknown): DailyStudyPlan | null {
  if (!isRecord(value)) return null
  const settingsSignature = toOptionalString(value.settingsSignature)
  const generatedAt = toOptionalString(value.generatedAt)
  if (!isLocalDateKey(value.date) || !settingsSignature || !generatedAt) return null

  return {
    date: value.date,
    settingsSignature,
    reviewWordIds: toStringArray(value.reviewWordIds),
    verificationWordIds: toStringArray(value.verificationWordIds),
    newWordIds: toStringArray(value.newWordIds),
    includeDiagnostic: value.includeDiagnostic === true,
    quizQuestionCount: Math.min(10, toNonNegativeInteger(value.quizQuestionCount)),
    includeMath: value.includeMath === true,
    completedTaskIds: Array.isArray(value.completedTaskIds)
      ? [...new Set(value.completedTaskIds.filter((item): item is DailyTaskId => (
        dailyTaskIds.includes(item as DailyTaskId)
      )))]
      : [],
    generatedAt,
    ...(typeof value.startedAt === 'string' && Number.isFinite(Date.parse(value.startedAt)) ? { startedAt: value.startedAt } : {}),
    ...(['study', 'rest', 'not-started', 'ended', 'disabled'].includes(String(value.status))
      ? { status: value.status as DailyStudyPlan['status'] } : {}),
    ...(toOptionalString(value.mathSkillId) ? { mathSkillId: String(value.mathSkillId) } : {}),
    ...(isFiniteNumber(value.mathQuestionCount) ? { mathQuestionCount: Math.min(30, toNonNegativeInteger(value.mathQuestionCount)) } : {}),
    ...(toOptionalString(value.englishActivityId) ? { englishActivityId: String(value.englishActivityId) } : {}),
  }
}

function normalizeDailyStudyPlans(value: unknown): Record<string, DailyStudyPlan> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(Object.entries(value).flatMap(([dateKey, item]) => {
    const plan = normalizeDailyStudyPlan(item)
    return plan && plan.date === dateKey ? [[dateKey, plan]] : []
  }))
}

function getDefaultData(): ProgressData {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    contentRevision: 1,
    completedUnits: {},
    learnedWords: [],
    wrongWords: [],
    dailyWords: {},
    dailyWordIds: {},
    streak: 0,
    lastStudyDate: '',
    achievements: [],
    wordMastery: {},
    unitFollowUpPlans: [],
    diagnosticResults: [],
    diagnosticDraft: null,
    studySessions: [],
    dailyPlans: {},
  }
}

export function normalizeProgressData(value: unknown, now = new Date()): ProgressData {
  if (!isRecord(value)) return getDefaultData()

  const learnedWords = toStringArray(value.learnedWords)
  const wrongWords = toStringArray(value.wrongWords)
  const currentWordMastery = normalizeWordMastery(value.wordMastery)
  const migratedWordMastery = migrateLegacyWordStates(learnedWords, wrongWords, now)
  const wordMastery = {
    ...migratedWordMastery,
    ...currentWordMastery,
  }
  const revisedWord = wordMastery['2-10-6']
  if (toNonNegativeInteger(value.contentRevision) < 1 && revisedWord) {
    const nextState = { ...revisedWord, level: 1 as const, correctStreak: 0, nextReviewDate: getLocalDateKey(now) }
    delete nextState.lastCountedCorrectDate
    delete nextState.lastMasteredAt
    wordMastery['2-10-6'] = nextState
    if (!wrongWords.includes('2-10-6')) wrongWords.push('2-10-6')
  }
  const encounteredWordIds = Object.entries(wordMastery)
    .filter(([, state]) => state.level > 0)
    .map(([wordId]) => wordId)

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    contentRevision: 1,
    completedUnits: normalizeNumberRecord(value.completedUnits, 1, 3),
    learnedWords: [...new Set([...learnedWords, ...encounteredWordIds])],
    wrongWords,
    dailyWords: normalizeNumberRecord(value.dailyWords, 0),
    dailyWordIds: normalizeStringArrayRecord(value.dailyWordIds),
    streak: toNonNegativeInteger(value.streak),
    lastStudyDate: isLocalDateKey(value.lastStudyDate) ? value.lastStudyDate : '',
    achievements: toStringArray(value.achievements),
    wordMastery,
    unitFollowUpPlans: Array.isArray(value.unitFollowUpPlans)
      ? value.unitFollowUpPlans
        .map(normalizeUnitFollowUpPlan)
        .filter((item): item is UnitFollowUpPlan => !!item)
      : [],
    diagnosticResults: Array.isArray(value.diagnosticResults)
      ? value.diagnosticResults
        .map(normalizeDiagnosticResult)
        .filter((item): item is DiagnosticResult => !!item)
      : [],
    diagnosticDraft: normalizeDiagnosticDraft(value.diagnosticDraft),
    ...(toOptionalString(value.diagnosticSkippedAt)
      ? { diagnosticSkippedAt: String(value.diagnosticSkippedAt) }
      : {}),
    studySessions: normalizeStudySessions(value.studySessions, now),
    dailyPlans: normalizeDailyStudyPlans(value.dailyPlans),
    ...(Array.isArray(value.englishEvidence) ? { englishEvidence: normalizeEnglishEvidence(value.englishEvidence, now) } : {}),
    ...(Array.isArray(value.planSettingsHistory) ? {
      planSettingsHistory: value.planSettingsHistory.flatMap(item => (
        isRecord(item) && isLocalDateKey(item.effectiveDate) && isRecord(item.settings)
          ? [{ effectiveDate: item.effectiveDate, settings: normalizeBridgePlanSettings(item.settings) }]
          : []
      )).sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate)),
    } : {}),
  }
}

function normalizeEnglishEvidence(value: unknown[], now: Date): EnglishEvidence[] {
  const cutoff = new Date(now)
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - 179)
  return value.flatMap(item => {
    if (!isRecord(item) || !toOptionalString(item.id) || !toOptionalString(item.activityId)
      || !['listening', 'reading', 'spelling', 'speaking'].includes(String(item.skill))
      || typeof item.correct !== 'boolean' || typeof item.recordedAt !== 'string'
      || !Number.isFinite(Date.parse(item.recordedAt)) || new Date(item.recordedAt) < cutoff) return []
    return [{ id: String(item.id), activityId: String(item.activityId), skill: item.skill as EnglishEvidence['skill'], correct: item.correct, recordedAt: item.recordedAt }]
  })
}

function normalizeBridgePlanSettings(value: unknown): BridgePlanSettings {
  if (!isRecord(value)) return { ...defaultBridgePlanSettings }

  const studyDaysPerWeek = value.studyDaysPerWeek === 3
    || value.studyDaysPerWeek === 4
    || value.studyDaysPerWeek === 5
    ? value.studyDaysPerWeek
    : defaultBridgePlanSettings.studyDaysPerWeek
  const dailyMinutes = value.dailyMinutes === 10
    || value.dailyMinutes === 15
    || value.dailyMinutes === 20
    ? value.dailyMinutes
    : defaultBridgePlanSettings.dailyMinutes
  const focus = value.focus === 'balanced'
    || value.focus === 'english'
    || value.focus === 'math'
    ? value.focus
    : defaultBridgePlanSettings.focus

  const grade = gradeCatalog.find(item => item.id === value.gradeId) ?? gradeCatalog.find(item => item.id === 2)!
  const unit = grade.units.find(item => item.id === value.englishUnitId) ?? grade.units[0]

  return {
    mode: value.mode === 'bridge' ? 'bridge' : 'semester',
    gradeId: grade.id,
    semester: value.semester === 'lower' ? 'lower' : 'upper',
    englishUnitId: unit.id,
    mathSkillId: getMathSkill(toOptionalString(value.mathSkillId)).id,
    textbook: {
      english: isRecord(value.textbook) && typeof value.textbook.english === 'string' ? value.textbook.english.slice(0, 100) : '',
      math: isRecord(value.textbook) && typeof value.textbook.math === 'string' ? value.textbook.math.slice(0, 100) : '',
      edition: isRecord(value.textbook) && typeof value.textbook.edition === 'string' ? value.textbook.edition.slice(0, 100) : '',
    },
    enabled: typeof value.enabled === 'boolean'
      ? value.enabled
      : defaultBridgePlanSettings.enabled,
    startDate: isLocalDateKey(value.startDate) ? value.startDate : '',
    studyDaysPerWeek,
    dailyMinutes,
    focus,
    previewGrade2: typeof value.previewGrade2 === 'boolean'
      ? value.previewGrade2
      : defaultBridgePlanSettings.previewGrade2,
  }
}

function getDefaultSettings(): AppSettings {
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    speechSpeed: 'slow',
    bridgePlan: { ...defaultBridgePlanSettings },
  }
}

export function normalizeSettingsData(value: unknown): AppSettings {
  if (!isRecord(value)) return getDefaultSettings()

  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    speechSpeed: speechSpeedPresets.includes(value.speechSpeed as SpeechSpeedPreset)
      ? value.speechSpeed as SpeechSpeedPreset
      : 'slow',
    bridgePlan: normalizeBridgePlanSettings(value.bridgePlan),
  }
}

function normalizeMathQuestion(value: unknown): MathQuestion | null {
  if (!isRecord(value)) return null
  const type = mathQuestionTypes.includes(value.type as MathQuestionType)
    ? value.type as MathQuestionType
    : null
  const id = toOptionalString(value.id)
  const reviewKey = toOptionalString(value.reviewKey)
  const prompt = toOptionalString(value.prompt)
  const correctAnswer = toOptionalString(value.correctAnswer)
  const sectionLabel = toOptionalString(value.sectionLabel)

  if (!type || !id || !reviewKey || !prompt || !correctAnswer || !sectionLabel) return null

  const base = {
    id, reviewKey, type, prompt, correctAnswer, sectionLabel,
    ...(toOptionalString(value.skillId) ? { skillId: String(value.skillId) } : {}),
    ...(value.difficulty === 1 || value.difficulty === 2 || value.difficulty === 3 ? { difficulty: value.difficulty as 1 | 2 | 3 } : {}),
    ...(toOptionalString(value.explanation) ? { explanation: String(value.explanation) } : {}),
    ...(toOptionalString(value.sourceReviewKey) ? { sourceReviewKey: String(value.sourceReviewKey) } : {}),
    ...(isRecord(value.visual) && isFiniteNumber(value.visual.rows) && isFiniteNumber(value.visual.columns)
      && value.visual.rows > 0 && value.visual.columns > 0 && value.visual.rows <= 20 && value.visual.columns <= 20
      ? { visual: { rows: Math.floor(value.visual.rows), columns: Math.floor(value.visual.columns) } } : {}),
  }

  if (type === 'calc') {
    const expression = toOptionalString(value.expression)
    return expression ? { ...base, type, expression } : null
  }

  if (type === 'fill') {
    if (typeof value.beforeBlank !== 'string' || typeof value.afterBlank !== 'string') return null
    return {
      ...base,
      type,
      beforeBlank: value.beforeBlank,
      afterBlank: value.afterBlank,
    }
  }

  const leftText = toOptionalString(value.leftText)
  const rightText = toOptionalString(value.rightText)
  return leftText && rightText ? { ...base, type, leftText, rightText } : null
}

function normalizeMathSectionResult(value: unknown): MathSectionResult | null {
  if (!isRecord(value)) return null
  const type = mathQuestionTypes.includes(value.type as MathQuestionType)
    ? value.type as MathQuestionType
    : null
  const label = toOptionalString(value.label)
  if (!type || !label) return null

  return {
    type,
    label,
    correctCount: Math.min(toNonNegativeInteger(value.correctCount), toNonNegativeInteger(value.totalCount)),
    totalCount: toNonNegativeInteger(value.totalCount),
  }
}

function normalizeMathAttempt(value: unknown): MathAttempt | null {
  if (!isRecord(value)) return null
  const id = toOptionalString(value.id)
  const title = toOptionalString(value.title)
  const completedAt = toOptionalString(value.completedAt)
  const mode = mathPracticeModes.includes(value.mode as MathPracticeMode)
    ? value.mode as MathPracticeMode
    : null

  if (!id || !title || !completedAt || !mode) return null

  const maximum = mode === 'quick' ? 20 : mode === 'paper' ? 100 : Infinity
  const questions = Array.isArray(value.questions)
    ? value.questions.flatMap(item => {
      if (!isRecord(item) || typeof item.userAnswer !== 'string' || typeof item.isCorrect !== 'boolean') {
        return []
      }
      const question = normalizeMathQuestion(item.question)
      if (!question) return []
      const trimmed = item.userAnswer.trim()
      const userAnswer = question.type !== 'compare' && /^\d+$/.test(trimmed) ? String(Number(trimmed)) : trimmed
      return [{ question, userAnswer, isCorrect: userAnswer === question.correctAnswer }]
    }).slice(0, maximum)
    : []
  const storedSections = Array.isArray(value.sections)
    ? value.sections
      .map(normalizeMathSectionResult)
      .filter((item): item is MathSectionResult => !!item)
    : []
  let remainingSectionBudget = maximum
  const sections = questions.length > 0
    ? [...new Set(questions.map(item => item.question.type))].map(type => {
      const results = questions.filter(item => item.question.type === type)
      return { type, label: results[0].question.sectionLabel, totalCount: results.length, correctCount: results.filter(item => item.isCorrect).length }
    })
    : storedSections.map(section => {
      const totalCount = Math.min(section.totalCount, remainingSectionBudget)
      remainingSectionBudget -= totalCount
      return { ...section, totalCount, correctCount: Math.min(section.correctCount, totalCount) }
    })
  // Legacy summaries may have no question details. Keep their bounded totals.
  const totalCount = questions.length > 0 ? questions.length : sections.length > 0
    ? sections.reduce((sum, section) => sum + section.totalCount, 0)
    : Math.min(maximum, toNonNegativeInteger(value.totalCount))
  const correctCount = questions.length > 0 ? questions.filter(item => item.isCorrect).length : sections.length > 0
    ? sections.reduce((sum, section) => sum + section.correctCount, 0)
    : Math.min(totalCount, toNonNegativeInteger(value.correctCount, toNonNegativeInteger(value.score)))

  return {
    id,
    mode,
    title,
    completedAt,
    durationSeconds: toNonNegativeInteger(value.durationSeconds),
    timeSpentSeconds: toNonNegativeInteger(value.timeSpentSeconds),
    ...(toOptionalString(value.skillId) ? { skillId: String(value.skillId) } : {}),
    totalCount,
    correctCount,
    score: correctCount,
    sections,
    questions,
  }
}

function normalizeMathModeProgress(value: unknown): MathModeProgress | null {
  if (!isRecord(value)) return null

  return {
    bestScore: toNonNegativeInteger(value.bestScore),
    lastAttempt: normalizeMathAttempt(value.lastAttempt),
    completedCount: toNonNegativeInteger(value.completedCount),
  }
}

function normalizeMathWrongQuestion(value: unknown): MathWrongQuestion | null {
  if (!isRecord(value)) return null
  const reviewKey = toOptionalString(value.reviewKey)
  const lastWrongAt = toOptionalString(value.lastWrongAt)
  const question = normalizeMathQuestion(value.question)
  if (!reviewKey || !lastWrongAt || !question) return null
  return { reviewKey, lastWrongAt, question }
}

function getDefaultMathData(): MathProgressData {
  return {
    schemaVersion: MATH_SCHEMA_VERSION,
    modeProgress: {},
    latestAttempt: null,
    attemptHistory: [],
    wrongQuestions: [],
  }
}

function normalizeMathAttemptHistory(
  value: unknown,
  fallbackAttempts: Array<MathAttempt | null>,
  now: Date,
): MathAttempt[] {
  const candidates = Array.isArray(value)
    ? value.map(normalizeMathAttempt).filter((item): item is MathAttempt => !!item)
    : fallbackAttempts.filter((item): item is MathAttempt => !!item)
  const uniqueAttempts = new Map(candidates.map(attempt => [attempt.id, attempt]))
  const cutoff = new Date(now)
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - 179)

  return [...uniqueAttempts.values()]
    .filter(attempt => {
      const completedAt = new Date(attempt.completedAt)
      return !Number.isNaN(completedAt.getTime()) && completedAt >= cutoff
    })
    .sort((first, second) => first.completedAt.localeCompare(second.completedAt))
}

export function normalizeMathProgressData(
  value: unknown,
  now = new Date(),
): MathProgressData {
  if (!isRecord(value)) return getDefaultMathData()

  const modeProgress = Object.fromEntries(scoredMathModes.flatMap(mode => {
    const normalized = isRecord(value.modeProgress)
      ? normalizeMathModeProgress(value.modeProgress[mode])
      : null
    if (!normalized) return []
    const maximum = mode === 'quick' ? 20 : mode === 'paper' ? 100 : Infinity
    const lastAttempt = normalized.lastAttempt?.mode === mode ? normalized.lastAttempt : null
    return [[mode, { ...normalized, lastAttempt, bestScore: Math.min(maximum, Math.max(normalized.bestScore, lastAttempt?.score ?? 0)) }]]
  })) as Partial<Record<ScoredMathMode, MathModeProgress>>

  if (toNonNegativeInteger(value.schemaVersion) < MATH_SCHEMA_VERSION) {
    const legacyLastAttempt = normalizeMathAttempt(value.lastAttempt)
    const legacyBestScore = Math.min(100, toNonNegativeInteger(value.bestScore))
    if (legacyLastAttempt || legacyBestScore > 0) {
      modeProgress.paper = {
        bestScore: Math.max(legacyBestScore, legacyLastAttempt?.score ?? 0),
        lastAttempt: legacyLastAttempt,
        completedCount: legacyLastAttempt ? 1 : 0,
      }
    }
  }

  const latestAttempt = normalizeMathAttempt(value.latestAttempt)
  const attemptHistory = normalizeMathAttemptHistory(
    value.attemptHistory,
    [
      ...Object.values(modeProgress).map(item => item.lastAttempt),
      latestAttempt,
    ],
    now,
  )

  return {
    schemaVersion: MATH_SCHEMA_VERSION,
    modeProgress,
    ...(isRecord(value.skillProgress) ? { skillProgress: Object.fromEntries(Object.entries(value.skillProgress).flatMap(([key, item]) => {
      const normalized = normalizeMathModeProgress(item)
      return key && normalized ? [[key, { ...normalized, bestScore: Math.min(100, normalized.bestScore) }]] : []
    })) } : {}),
    latestAttempt,
    attemptHistory,
    wrongQuestions: Array.isArray(value.wrongQuestions)
      ? value.wrongQuestions
        .map(normalizeMathWrongQuestion)
        .filter((item): item is MathWrongQuestion => !!item)
      : [],
  }
}

function loadStoredValue(key: string): unknown {
  try {
    const raw = readStoredText(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    // Keep the original malformed value untouched so recovery remains possible.
    return undefined
  }
}

function persistStoredValue(key: string, value: unknown): void {
  writeStoredText(key, JSON.stringify(value))
}

function migrateStoredValue(key: string, raw: unknown, normalized: { schemaVersion: number }) {
  if (!isRecord(raw)) return
  const oldVersion = toNonNegativeInteger(raw.schemaVersion)
  if (oldVersion < normalized.schemaVersion
    || (oldVersion === normalized.schemaVersion && key === STORAGE_KEY && toNonNegativeInteger(raw.contentRevision) < 1)) {
    persistStoredValue(key, normalized)
  }
}

export function loadProgress(): ProgressData {
  const raw = loadStoredValue(STORAGE_KEY)
  const progress = normalizeProgressData(raw)
  migrateStoredValue(STORAGE_KEY, raw, progress)
  return progress
}

export function saveProgress(data: ProgressData): void {
  persistStoredValue(STORAGE_KEY, normalizeProgressData(data))
}

export function loadSettings(): AppSettings {
  const raw = loadStoredValue(SETTINGS_KEY)
  const settings = normalizeSettingsData(raw)
  migrateStoredValue(SETTINGS_KEY, raw, settings)
  return settings
}

export function saveSettings(settings: AppSettings): void {
  persistStoredValue(SETTINGS_KEY, normalizeSettingsData(settings))
}

export function loadMathProgress(): MathProgressData {
  const raw = loadStoredValue(MATH_STORAGE_KEY)
  const progress = normalizeMathProgressData(raw)
  migrateStoredValue(MATH_STORAGE_KEY, raw, progress)
  return progress
}

export function saveMathProgress(data: MathProgressData): void {
  persistStoredValue(MATH_STORAGE_KEY, normalizeMathProgressData(data))
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function updateStreak(data: ProgressData, date = new Date()): ProgressData {
  const today = getLocalDateKey(date)
  if (data.lastStudyDate === today) return data

  const yesterdayDate = new Date(date)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = getLocalDateKey(yesterdayDate)
  const newStreak = data.lastStudyDate === yesterday ? data.streak + 1 : 1

  return { ...data, streak: newStreak, lastStudyDate: today }
}

export function getActiveStreak(data: ProgressData, date = new Date()): number {
  if (!data.lastStudyDate) return 0

  const today = getLocalDateKey(date)
  if (data.lastStudyDate === today) return data.streak

  const yesterdayDate = new Date(date)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  return data.lastStudyDate === getLocalDateKey(yesterdayDate) ? data.streak : 0
}

export function recordStudyActivity(data: ProgressData, date = new Date()): ProgressData {
  return updateStreak(data, date)
}

export function addDailyWord(
  data: ProgressData,
  date = new Date(),
  wordId?: string,
): ProgressData {
  const today = getLocalDateKey(date)
  const updated = updateStreak(data, date)
  const dailyWordIds = wordId
    ? {
      ...updated.dailyWordIds,
      [today]: [...new Set([...(updated.dailyWordIds[today] ?? []), wordId])],
    }
    : updated.dailyWordIds

  return {
    ...updated,
    dailyWords: {
      ...updated.dailyWords,
      [today]: (updated.dailyWords[today] || 0) + 1,
    },
    dailyWordIds,
  }
}

export function markWordLearned(
  data: ProgressData,
  wordId: string,
  date = new Date(),
): ProgressData {
  const isNewWord = !data.learnedWords.includes(wordId)
  const updated = isNewWord ? addDailyWord(data, date, wordId) : data
  const currentState = updated.wordMastery[wordId] ?? createWordExposureState(date)
  const wordState = currentState.firstSeenAt
    ? currentState
    : { ...currentState, firstSeenAt: date.toISOString() }

  return {
    ...updated,
    learnedWords: isNewWord ? [...updated.learnedWords, wordId] : updated.learnedWords,
    wordMastery: {
      ...updated.wordMastery,
      [wordId]: wordState,
    },
  }
}

export function updateWordMastery(
  data: ProgressData,
  wordId: string,
  isCorrect: boolean,
  source: WordLearningSource,
  date = new Date(),
): ProgressData {
  const wordState = recordWordResult(data.wordMastery[wordId], isCorrect, source, date)
  const wrongWords = isCorrect && wordState.level >= 3
    ? data.wrongWords.filter(id => id !== wordId)
    : !isCorrect
      && (source === 'quiz' || source === 'review')
      && !data.wrongWords.includes(wordId)
      ? [...data.wrongWords, wordId]
      : data.wrongWords

  return {
    ...data,
    learnedWords: data.learnedWords.includes(wordId)
      ? data.learnedWords
      : [...data.learnedWords, wordId],
    wrongWords,
    wordMastery: {
      ...data.wordMastery,
      [wordId]: wordState,
    },
  }
}

export function addWrongWord(
  data: ProgressData,
  wordId: string,
  date = new Date(),
): ProgressData {
  return updateWordMastery(data, wordId, false, 'quiz', date)
}

export function removeWrongWord(data: ProgressData, wordId: string): ProgressData {
  const state = data.wordMastery[wordId]
  if (!state) {
    return { ...data, wrongWords: data.wrongWords.filter(id => id !== wordId) }
  }

  const remainingSignals = { ...state.prioritySignals }
  delete remainingSignals.legacyWrong
  delete remainingSignals.lastWrongAt

  return {
    ...data,
    wrongWords: data.wrongWords.filter(id => id !== wordId),
    wordMastery: {
      ...data.wordMastery,
      [wordId]: {
        ...state,
        prioritySignals: remainingSignals,
      },
    },
  }
}

export function completeUnit(
  data: ProgressData,
  gradeId: number,
  unitId: number,
  stars: number,
): ProgressData {
  const key = `${gradeId}-${unitId}`
  const current = data.completedUnits[key] || 0
  if (stars <= current) return data
  return { ...data, completedUnits: { ...data.completedUnits, [key]: stars } }
}

export function addAchievement(data: ProgressData, id: string): ProgressData {
  if (data.achievements.includes(id)) return data
  return { ...data, achievements: [...data.achievements, id] }
}

function mergeWrongQuestions(
  current: MathWrongQuestion[],
  additions: MathWrongQuestion[],
): MathWrongQuestion[] {
  const merged = new Map(current.map(item => [item.reviewKey, item]))

  additions.forEach(item => {
    merged.set(item.reviewKey, item)
  })

  return [...merged.values()].sort((first, second) => (
    second.lastWrongAt.localeCompare(first.lastWrongAt)
  ))
}

export function getMathModeProgress(
  data: MathProgressData,
  mode: ScoredMathMode,
): MathModeProgress {
  return data.modeProgress[mode] ?? {
    bestScore: 0,
    lastAttempt: null,
    completedCount: 0,
  }
}

export function getMathSkillProgress(data: MathProgressData, skillId: string): MathModeProgress {
  return data.skillProgress?.[skillId] ?? { bestScore: 0, lastAttempt: null, completedCount: 0 }
}

export function saveMathAttempt(
  data: MathProgressData,
  attempt: MathAttempt,
  options?: { updateBestScore?: boolean },
): MathProgressData {
  const next = {
    ...data,
    latestAttempt: attempt,
    attemptHistory: [
      ...data.attemptHistory.filter(item => item.id !== attempt.id),
      attempt,
    ],
  }

  if (attempt.mode === 'review' || options?.updateBestScore === false) {
    return next
  }

  if (attempt.mode === 'focused' && attempt.skillId) {
    const current = getMathSkillProgress(data, attempt.skillId)
    const percentage = attempt.totalCount > 0 ? Math.round(attempt.correctCount / attempt.totalCount * 100) : 0
    return {
      ...next,
      skillProgress: {
        ...data.skillProgress,
        [attempt.skillId]: {
          bestScore: Math.max(current.bestScore, percentage),
          lastAttempt: attempt,
          completedCount: current.completedCount + (data.attemptHistory.some(item => item.id === attempt.id) ? 0 : 1),
        },
      },
    }
  }

  const current = getMathModeProgress(data, attempt.mode)

  return {
    ...next,
    modeProgress: {
      ...data.modeProgress,
      [attempt.mode]: {
        bestScore: Math.max(current.bestScore, attempt.score),
        lastAttempt: attempt,
        completedCount: current.completedCount + (data.attemptHistory.some(item => item.id === attempt.id) ? 0 : 1),
      },
    },
  }
}

export function addMathWrongQuestions(
  data: MathProgressData,
  questions: MathQuestion[],
  wrongAt = new Date().toISOString(),
): MathProgressData {
  const additions = questions.map(question => ({
    reviewKey: question.reviewKey,
    question,
    lastWrongAt: wrongAt,
  }))

  return {
    ...data,
    wrongQuestions: mergeWrongQuestions(data.wrongQuestions, additions),
  }
}

export function removeMathWrongQuestion(
  data: MathProgressData,
  reviewKey: string,
): MathProgressData {
  return {
    ...data,
    wrongQuestions: data.wrongQuestions.filter(item => item.reviewKey !== reviewKey),
  }
}

export function removeMathWrongQuestions(
  data: MathProgressData,
  reviewKeys: string[],
): MathProgressData {
  const keySet = new Set(reviewKeys)
  return {
    ...data,
    wrongQuestions: data.wrongQuestions.filter(item => !keySet.has(item.reviewKey)),
  }
}
