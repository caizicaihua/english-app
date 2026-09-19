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
  skillId?: string
  scope?: string
  deadlineAt?: number
  elapsedSeconds?: number
  isPaused?: boolean
  planDate?: string
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
  if (value.visual !== undefined && (!isRecord(value.visual)
    || !Number.isInteger(value.visual.rows) || !Number.isInteger(value.visual.columns)
    || Number(value.visual.rows) < 1 || Number(value.visual.rows) > 20
    || Number(value.visual.columns) < 1 || Number(value.visual.columns) > 20)) return false

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
  if (!Number.isFinite(value.durationSeconds) || Number(value.durationSeconds) < 0) return null
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
  if (questionIds.size !== questions.length) return null
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
  const deadlineAt = typeof value.deadlineAt === 'number' && Number.isFinite(value.deadlineAt)
    ? value.deadlineAt
    : savedAt.getTime() + storedTimeLeft * 1000
  // Old expired drafts did not have a reliable deadline. New timed drafts retain
  // answers and submit on return, even if the browser was closed at the deadline.
  if (durationSeconds > 0 && value.deadlineAt === undefined && elapsedSeconds >= storedTimeLeft) return null

  return {
    mode: value.mode as MathPracticeMode,
    title: value.title,
    durationSeconds,
    questions,
    answers,
    timeLeft: durationSeconds === 0 ? 0 : Math.max(0, Math.ceil((deadlineAt - now.getTime()) / 1000)),
    savedAt: savedAt.toISOString(),
    ...(typeof value.skillId === 'string' ? { skillId: value.skillId } : {}),
    ...(typeof value.scope === 'string' ? { scope: value.scope } : {}),
    ...(typeof value.planDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.planDate) ? { planDate: value.planDate } : {}),
    ...(durationSeconds > 0 ? { deadlineAt } : {}),
    elapsedSeconds: Number.isFinite(value.elapsedSeconds) ? Math.max(0, Number(value.elapsedSeconds)) : durationSeconds - storedTimeLeft,
    isPaused: durationSeconds === 0,
  }
}

function getSessionStorage(): DraftStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

function draftKey(mode: MathPracticeMode, scope?: string): string {
  return `${mode}:${scope ?? 'default'}`
}

function getStoredDrafts(storage: DraftStorage): Record<string, unknown> {
  const raw = storage.getItem(MATH_PRACTICE_DRAFT_KEY)
  if (!raw) return {}
  const value: unknown = JSON.parse(raw)
  if (!isRecord(value)) return {}
  if (isRecord(value.drafts)) return value.drafts
  if (typeof value.mode === 'string') return { [draftKey(value.mode as MathPracticeMode, typeof value.scope === 'string' ? value.scope : undefined)]: value }
  return {}
}

export function loadMathPracticeDraft(
  mode: MathPracticeMode,
  now = new Date(),
  storage: DraftStorage | null = getSessionStorage(),
  scope?: string,
  currentReviewQuestions?: MathQuestion[],
): MathPracticeDraft | null {
  if (!storage) return null

  try {
    const draft = normalizeDraft(getStoredDrafts(storage)[draftKey(mode, scope)], now)
    if (draft && mode === 'review' && currentReviewQuestions) {
      const currentKeys = new Set(currentReviewQuestions.map(question => question.reviewKey))
      const draftKeys = new Set(draft.questions.map(question => question.reviewKey))
      if (currentKeys.size !== draftKeys.size || [...currentKeys].some(key => !draftKeys.has(key))) return null
    }
    return draft?.mode === mode && draft.scope === scope ? draft : null
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
    let drafts: Record<string, unknown> = {}
    try { drafts = getStoredDrafts(storage) } catch { /* Replace only an unreadable draft envelope. */ }
    drafts[draftKey(draft.mode, draft.scope)] = { ...draft, savedAt: new Date().toISOString() }
    storage.setItem(MATH_PRACTICE_DRAFT_KEY, JSON.stringify({ drafts }))
  } catch {
    // A practice can continue even when browser storage is unavailable.
  }
}

export function clearMathPracticeDraft(
  storage: DraftStorage | null = getSessionStorage(),
  session?: { mode: MathPracticeMode; scope?: string },
): void {
  if (!storage) return

  try {
    if (session) {
      const drafts = getStoredDrafts(storage)
      delete drafts[draftKey(session.mode, session.scope)]
      storage.setItem(MATH_PRACTICE_DRAFT_KEY, JSON.stringify({ drafts }))
    } else storage.removeItem(MATH_PRACTICE_DRAFT_KEY)
  } catch {
    // Ignore unavailable browser storage.
  }
}

export function getMinimumAnsweredCount(
  mode: MathPracticeMode,
  totalQuestions: number,
): number {
  if (totalQuestions <= 0) return 0
  if (mode === 'quick' || mode === 'focused') return Math.ceil(totalQuestions * 0.8)
  return 1
}
