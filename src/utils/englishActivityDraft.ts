import type { EnglishActivity } from '../data/englishActivities'
import { recordEnglishEvidence } from './englishEvidence'
import { shuffle } from './quiz'
import { getLocalDateKey, recordStudyActivity, type ProgressData } from './storage'

const STORAGE_KEY = 'english_app_english_activity_drafts'
type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface EnglishActivityAnswer {
  questionId: string
  selectedAnswer: string
  skill: 'listening' | 'reading'
  recordedAt: string
}

export interface EnglishActivityDraft {
  activityId: string
  sessionId: string
  startedAt: string
  taskDate: string | null
  currentIndex: number
  elapsedSeconds: number
  answers: EnglishActivityAnswer[]
  questionOptions: Record<string, string[]>
}

function getStorage(): DraftStorage | null {
  try { return typeof window === 'undefined' ? null : window.sessionStorage } catch { return null }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readDrafts(storage: DraftStorage): Record<string, unknown> {
  const raw = storage.getItem(STORAGE_KEY)
  const parsed: unknown = raw ? JSON.parse(raw) : {}
  return isRecord(parsed) ? parsed : {}
}

export function createEnglishActivityDraft(activity: EnglishActivity, now = new Date(), taskDate: string | null = null): EnglishActivityDraft {
  return {
    activityId: activity.id,
    sessionId: `${activity.id}-${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
    startedAt: now.toISOString(),
    taskDate,
    currentIndex: 0,
    elapsedSeconds: 0,
    answers: [],
    questionOptions: Object.fromEntries(activity.questions.map(question => [question.id, shuffle(question.options)])),
  }
}

export function loadEnglishActivityDraft(activity: EnglishActivity, storage = getStorage()): EnglishActivityDraft | null {
  if (!storage) return null
  try {
    const value = readDrafts(storage)[activity.id]
    if (!isRecord(value) || value.activityId !== activity.id || typeof value.sessionId !== 'string'
      || typeof value.startedAt !== 'string' || !Number.isFinite(Date.parse(value.startedAt))
      || !Number.isInteger(value.currentIndex) || Number(value.currentIndex) < 0 || Number(value.currentIndex) > activity.questions.length
      || !Array.isArray(value.answers) || !isRecord(value.questionOptions)) return null
    const answers: EnglishActivityAnswer[] = []
    for (const [index, answer] of value.answers.entries()) {
      const question = activity.questions[index]
      if (!question || !isRecord(answer) || answer.questionId !== question.id
        || typeof answer.selectedAnswer !== 'string' || !question.options.includes(answer.selectedAnswer)
        || (answer.skill !== 'listening' && answer.skill !== 'reading')
        || (question.type === 'reply' && answer.skill !== 'reading')
        || typeof answer.recordedAt !== 'string' || !Number.isFinite(Date.parse(answer.recordedAt))) return null
      answers.push({ questionId: question.id, selectedAnswer: answer.selectedAnswer, skill: answer.skill, recordedAt: answer.recordedAt })
    }
    const currentIndex = Number(value.currentIndex)
    if (answers.length < currentIndex || answers.length > Math.min(currentIndex + 1, activity.questions.length)) return null
    const questionOptions: Record<string, string[]> = {}
    for (const question of activity.questions) {
      const options = value.questionOptions[question.id]
      if (!Array.isArray(options) || options.length !== question.options.length
        || new Set(options).size !== options.length || !options.every(option => question.options.includes(option))) return null
      questionOptions[question.id] = options
    }
    const taskDate = value.taskDate === undefined ? getLocalDateKey(new Date(value.startedAt)) : value.taskDate
    if (taskDate !== null && (typeof taskDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(taskDate))) return null
    return {
      activityId: activity.id, sessionId: value.sessionId, startedAt: value.startedAt,
      taskDate,
      currentIndex, answers, questionOptions,
      elapsedSeconds: typeof value.elapsedSeconds === 'number' && Number.isFinite(value.elapsedSeconds)
        ? Math.max(0, value.elapsedSeconds) : 0,
    }
  } catch { return null }
}

export function saveEnglishActivityDraft(draft: EnglishActivityDraft, storage = getStorage()): void {
  if (!storage) return
  try {
    let drafts: Record<string, unknown> = {}
    try { drafts = readDrafts(storage) } catch { /* Recover an unreadable envelope. */ }
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...drafts, [draft.activityId]: draft }))
  } catch { /* The activity still works when tab storage is unavailable. */ }
}

export function clearEnglishActivityDraft(activityId: string, storage = getStorage()): void {
  if (!storage) return
  try {
    const drafts = readDrafts(storage)
    delete drafts[activityId]
    storage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  } catch { /* Ignore unavailable browser storage. */ }
}

export function applyEnglishActivityAnswer(
  progress: ProgressData,
  draft: EnglishActivityDraft,
  activity: EnglishActivity,
  selectedAnswer: string,
  skill: EnglishActivityAnswer['skill'],
  now = new Date(),
): { progress: ProgressData; draft: EnglishActivityDraft } {
  const question = activity.questions[draft.currentIndex]
  if (!question || draft.activityId !== activity.id || !question.options.includes(selectedAnswer)
    || draft.answers.some(answer => answer.questionId === question.id)) return { progress, draft }
  const answer = {
    questionId: question.id, selectedAnswer,
    skill: question.type === 'reply' ? 'reading' as const : skill,
    recordedAt: now.toISOString(),
  }
  return {
    progress: recordStudyActivity(recordEnglishEvidence(progress, {
      id: `${draft.sessionId}-${question.id}`,
      activityId: activity.id,
      skill: answer.skill,
      correct: selectedAnswer === question.correctAnswer,
      recordedAt: answer.recordedAt,
    }), now),
    draft: { ...draft, answers: [...draft.answers, answer] },
  }
}
