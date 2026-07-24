import type {
  MathPracticeMode,
  MathQuestion,
  MathQuestionType,
} from '../data/math'

const MATH_PRACTICE_DRAFT_KEY = 'english_app_math_practice_draft'
const mathPracticeModes: MathPracticeMode[] = ['paper', 'quick', 'focused', 'review']
const mathQuestionTypes: MathQuestionType[] = ['calc', 'fill', 'compare']

export interface MathPracticeDraft {
  mode: MathPracticeMode
  title: string
  durationSeconds: number
  questions: MathQuestion[]
  answers: Record<string, string>
  timeLeft: number
  savedAt: string
}

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMathQuestion(value: unknown): value is MathQuestion {
  if (!isRecord(value)) return false
  if (!mathQuestionTypes.includes(value.type as MathQuestionType)) return false

  const hasCommonFields = [
    value.id,
    value.reviewKey,
    value.prompt,
    value.correctAnswer,
    value.sectionLabel,
  ].every(item => typeof item === 'string')
  if (!hasCommonFields) return false

  if (value.type === 'calc') return typeof value.expression === 'string'
  if (value.type === 'fill') {
    return typeof value.beforeBlank === 'string' && typeof value.afterBlank === 'string'
  }
  return typeof value.leftText === 'string' && typeof value.rightText === 'string'
}

function normalizeDraft(value: unknown, now: Date): MathPracticeDraft | null {
  if (!isRecord(value)) return null
  if (!mathPracticeModes.includes(value.mode as MathPracticeMode)) return null
  if (typeof value.title !== 'string' || value.title.length === 0) return null
  if (!Number.isFinite(value.durationSeconds) || Number(value.durationSeconds) <= 0) return null
  if (!Array.isArray(value.questions)) return null

  const questions = value.questions.filter(isMathQuestion)
  if (questions.length !== value.questions.length || questions.length === 0) return null

  const durationSeconds = Math.floor(Number(value.durationSeconds))
  const storedTimeLeft = Number.isFinite(value.timeLeft)
    ? Math.min(durationSeconds, Math.max(0, Math.floor(Number(value.timeLeft))))
    : durationSeconds
  const savedAt = typeof value.savedAt === 'string' ? new Date(value.savedAt) : new Date(NaN)
  if (Number.isNaN(savedAt.getTime())) return null

  const questionIds = new Set(questions.map(question => question.id))
  const answers = isRecord(value.answers)
    ? Object.fromEntries(Object.entries(value.answers).filter(
      (entry): entry is [string, string] => (
        questionIds.has(entry[0]) && typeof entry[1] === 'string'
      ),
    ))
    : {}
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - savedAt.getTime()) / 1000),
  )
  if (elapsedSeconds >= storedTimeLeft) return null

  return {
    mode: value.mode as MathPracticeMode,
    title: value.title,
    durationSeconds,
    questions,
    answers,
    timeLeft: storedTimeLeft - elapsedSeconds,
    savedAt: savedAt.toISOString(),
  }
}

function getSessionStorage(): DraftStorage | null {
  return typeof window === 'undefined' ? null : window.sessionStorage
}

export function loadMathPracticeDraft(
  mode: MathPracticeMode,
  now = new Date(),
  storage: DraftStorage | null = getSessionStorage(),
): MathPracticeDraft | null {
  if (!storage) return null

  try {
    const raw = storage.getItem(MATH_PRACTICE_DRAFT_KEY)
    if (!raw) return null
    const draft = normalizeDraft(JSON.parse(raw), now)
    return draft?.mode === mode ? draft : null
  } catch {
    return null
  }
}

export function saveMathPracticeDraft(
  draft: Omit<MathPracticeDraft, 'savedAt'>,
  storage: DraftStorage | null = getSessionStorage(),
): void {
  if (!storage) return

  try {
    storage.setItem(MATH_PRACTICE_DRAFT_KEY, JSON.stringify({
      ...draft,
      savedAt: new Date().toISOString(),
    }))
  } catch {
    // A practice can continue even when browser storage is unavailable.
  }
}

export function clearMathPracticeDraft(
  storage: DraftStorage | null = getSessionStorage(),
): void {
  if (!storage) return

  try {
    storage.removeItem(MATH_PRACTICE_DRAFT_KEY)
  } catch {
    // Ignore unavailable browser storage.
  }
}

export function getMinimumAnsweredCount(
  mode: MathPracticeMode,
  totalQuestions: number,
): number {
  if (totalQuestions <= 0) return 0
  if (mode === 'quick') return Math.ceil(totalQuestions * 0.8)
  return 1
}
