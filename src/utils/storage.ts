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
import type { SpeechSpeedPreset } from './speech'
import {
  createWordExposureState,
  migrateLegacyWordStates,
  recordWordResult,
} from './mastery'

const STORAGE_KEY = 'english_app_data'
const SETTINGS_KEY = 'english_app_settings'
const MATH_STORAGE_KEY = 'english_app_math_data'

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
  'diagnostic',
  'review',
  'verification',
  'new_words',
  'quiz',
  'math',
]

export interface ProgressData {
  schemaVersion: typeof PROGRESS_SCHEMA_VERSION
  completedUnits: Record<string, number>
  learnedWords: string[]
  wrongWords: string[]
  dailyWords: Record<string, number>
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
    ...(toOptionalString(value.lastReviewedAt)
      ? { lastReviewedAt: String(value.lastReviewedAt) }
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
    completedUnits: {},
    learnedWords: [],
    wrongWords: [],
    dailyWords: {},
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

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    completedUnits: normalizeNumberRecord(value.completedUnits, 1, 3),
    learnedWords,
    wrongWords,
    dailyWords: normalizeNumberRecord(value.dailyWords, 0),
    streak: toNonNegativeInteger(value.streak),
    lastStudyDate: isLocalDateKey(value.lastStudyDate) ? value.lastStudyDate : '',
    achievements: toStringArray(value.achievements),
    wordMastery: {
      ...migratedWordMastery,
      ...currentWordMastery,
    },
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
  }
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

  return {
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

  const base = { id, reviewKey, type, prompt, correctAnswer, sectionLabel }

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
    correctCount: toNonNegativeInteger(value.correctCount),
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

  const questions = Array.isArray(value.questions)
    ? value.questions.flatMap(item => {
      if (!isRecord(item) || typeof item.userAnswer !== 'string' || typeof item.isCorrect !== 'boolean') {
        return []
      }
      const question = normalizeMathQuestion(item.question)
      return question ? [{ question, userAnswer: item.userAnswer, isCorrect: item.isCorrect }] : []
    })
    : []
  const sections = Array.isArray(value.sections)
    ? value.sections
      .map(normalizeMathSectionResult)
      .filter((item): item is MathSectionResult => !!item)
    : []

  return {
    id,
    mode,
    title,
    completedAt,
    durationSeconds: toNonNegativeInteger(value.durationSeconds),
    timeSpentSeconds: toNonNegativeInteger(value.timeSpentSeconds),
    totalCount: toNonNegativeInteger(value.totalCount, questions.length),
    correctCount: toNonNegativeInteger(
      value.correctCount,
      questions.filter(item => item.isCorrect).length,
    ),
    score: toNonNegativeInteger(value.score),
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
    wrongQuestions: [],
  }
}

export function normalizeMathProgressData(value: unknown): MathProgressData {
  if (!isRecord(value)) return getDefaultMathData()

  const modeProgress = Object.fromEntries(scoredMathModes.flatMap(mode => {
    const normalized = isRecord(value.modeProgress)
      ? normalizeMathModeProgress(value.modeProgress[mode])
      : null
    return normalized ? [[mode, normalized]] : []
  })) as Partial<Record<ScoredMathMode, MathModeProgress>>

  if (toNonNegativeInteger(value.schemaVersion) < MATH_SCHEMA_VERSION) {
    const legacyLastAttempt = normalizeMathAttempt(value.lastAttempt)
    const legacyBestScore = toNonNegativeInteger(value.bestScore)
    if (legacyLastAttempt || legacyBestScore > 0) {
      modeProgress.paper = {
        bestScore: Math.max(legacyBestScore, legacyLastAttempt?.score ?? 0),
        lastAttempt: legacyLastAttempt,
        completedCount: legacyLastAttempt ? 1 : 0,
      }
    }
  }

  return {
    schemaVersion: MATH_SCHEMA_VERSION,
    modeProgress,
    latestAttempt: normalizeMathAttempt(value.latestAttempt),
    wrongQuestions: Array.isArray(value.wrongQuestions)
      ? value.wrongQuestions
        .map(normalizeMathWrongQuestion)
        .filter((item): item is MathWrongQuestion => !!item)
      : [],
  }
}

function loadStoredValue(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function persistStoredValue(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadProgress(): ProgressData {
  const raw = loadStoredValue(STORAGE_KEY)
  const progress = normalizeProgressData(raw)
  if (raw !== undefined) persistStoredValue(STORAGE_KEY, progress)
  return progress
}

export function saveProgress(data: ProgressData): void {
  persistStoredValue(STORAGE_KEY, normalizeProgressData(data))
}

export function loadSettings(): AppSettings {
  const raw = loadStoredValue(SETTINGS_KEY)
  const settings = normalizeSettingsData(raw)
  if (raw !== undefined) persistStoredValue(SETTINGS_KEY, settings)
  return settings
}

export function saveSettings(settings: AppSettings): void {
  persistStoredValue(SETTINGS_KEY, normalizeSettingsData(settings))
}

export function loadMathProgress(): MathProgressData {
  const raw = loadStoredValue(MATH_STORAGE_KEY)
  const progress = normalizeMathProgressData(raw)
  if (raw !== undefined) persistStoredValue(MATH_STORAGE_KEY, progress)
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

export function addDailyWord(data: ProgressData, date = new Date()): ProgressData {
  const today = getLocalDateKey(date)
  const updated = updateStreak(data, date)
  return {
    ...updated,
    dailyWords: {
      ...updated.dailyWords,
      [today]: (updated.dailyWords[today] || 0) + 1,
    },
  }
}

export function markWordLearned(
  data: ProgressData,
  wordId: string,
  date = new Date(),
): ProgressData {
  const isNewWord = !data.learnedWords.includes(wordId)
  const updated = isNewWord ? addDailyWord(data, date) : data
  const wordState = updated.wordMastery[wordId] ?? createWordExposureState(date)

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

export function saveMathAttempt(
  data: MathProgressData,
  attempt: MathAttempt,
  options?: { updateBestScore?: boolean },
): MathProgressData {
  const next = {
    ...data,
    latestAttempt: attempt,
  }

  if (attempt.mode === 'review' || options?.updateBestScore === false) {
    return next
  }

  const current = getMathModeProgress(data, attempt.mode)

  return {
    ...next,
    modeProgress: {
      ...data.modeProgress,
      [attempt.mode]: {
        bestScore: Math.max(current.bestScore, attempt.score),
        lastAttempt: attempt,
        completedCount: current.completedCount + 1,
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
