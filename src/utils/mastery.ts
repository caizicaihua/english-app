import type {
  MasteryLevel,
  UnitFollowUpPlan,
  WordLearningSource,
  WordLearningState,
} from '../data/bridgePlan'

const reviewIntervals: Record<MasteryLevel, number | null> = {
  0: null,
  1: 1,
  2: 3,
  3: 7,
  4: 14,
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

export function addLocalDays(dateKey: string, days: number): string {
  const date = parseLocalDateKey(dateKey)
  date.setDate(date.getDate() + days)
  return toLocalDateKey(date)
}

export function stableHash(value: string): number {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function nextReviewDate(level: MasteryLevel, today: string): string | undefined {
  const interval = reviewIntervals[level]
  return interval === null ? undefined : addLocalDays(today, interval)
}

export function createWordExposureState(date = new Date()): WordLearningState {
  const today = toLocalDateKey(date)

  return {
    level: 1,
    correctStreak: 0,
    wrongCount: 0,
    firstSeenAt: date.toISOString(),
    lastReviewedAt: date.toISOString(),
    nextReviewDate: nextReviewDate(1, today),
    prioritySignals: {},
  }
}

export function recordWordResult(
  current: WordLearningState | undefined,
  isCorrect: boolean,
  source: WordLearningSource,
  date = new Date(),
): WordLearningState {
  const today = toLocalDateKey(date)
  const base = current ?? createWordExposureState(date)

  if (!isCorrect) {
    const level = Math.max(1, base.level - 1) as MasteryLevel
    const timestamp = date.toISOString()

    return {
      ...base,
      level,
      correctStreak: 0,
      wrongCount: base.wrongCount + 1,
      firstSeenAt: base.firstSeenAt ?? timestamp,
      lastReviewedAt: timestamp,
      nextReviewDate: nextReviewDate(level, today),
      lastCountedCorrectDate: undefined,
      prioritySignals: {
        ...base.prioritySignals,
        lastWrongAt: timestamp,
        ...(source === 'diagnostic' ? { lastDiagnosticWeakAt: timestamp } : {}),
      },
    }
  }

  const countsToday = base.lastCountedCorrectDate !== today
  const correctStreak = countsToday ? base.correctStreak + 1 : base.correctStreak
  const shouldAdvance = countsToday && correctStreak >= 2
  const level = shouldAdvance
    ? Math.min(4, base.level + 1) as MasteryLevel
    : base.level
  const prioritySignals = level >= 3
    ? {}
    : base.prioritySignals
  const lastMasteredAt = level >= 3 && base.level < 3
    ? date.toISOString()
    : base.lastMasteredAt

  return {
    ...base,
    level,
    correctStreak: shouldAdvance ? 0 : correctStreak,
    firstSeenAt: base.firstSeenAt ?? date.toISOString(),
    lastReviewedAt: date.toISOString(),
    ...(lastMasteredAt ? { lastMasteredAt } : {}),
    nextReviewDate: nextReviewDate(level, today),
    lastCountedCorrectDate: countsToday ? today : base.lastCountedCorrectDate,
    prioritySignals,
  }
}

export function clearWordPrioritySignals(state: WordLearningState): WordLearningState {
  if (Object.keys(state.prioritySignals).length === 0) return state
  return { ...state, prioritySignals: {} }
}

export function migrateLegacyWordStates(
  learnedWords: string[],
  wrongWords: string[],
  migrationDate = new Date(),
): Record<string, WordLearningState> {
  const today = toLocalDateKey(migrationDate)
  const learned = new Set(learnedWords)
  const wrong = new Set(wrongWords)
  const wordIds = [...new Set([...learnedWords, ...wrongWords])]

  return Object.fromEntries(wordIds.map(wordId => {
    if (wrong.has(wordId)) {
      return [wordId, {
        level: 1,
        correctStreak: 0,
        wrongCount: 1,
        lastReviewedAt: migrationDate.toISOString(),
        nextReviewDate: addLocalDays(
          today,
          stableHash(`${wordId}:wrong:v2`) % 7,
        ),
        prioritySignals: { legacyWrong: true },
      } satisfies WordLearningState]
    }

    if (learned.has(wordId)) {
      return [wordId, {
        level: 2,
        correctStreak: 0,
        wrongCount: 0,
        lastReviewedAt: migrationDate.toISOString(),
        nextReviewDate: addLocalDays(
          today,
          stableHash(`${wordId}:learned:v2`) % 21,
        ),
        prioritySignals: {},
      } satisfies WordLearningState]
    }

    throw new Error(`无法迁移单词状态：${wordId}`)
  }))
}

function selectVerificationWords(
  diagnosticId: string,
  unitKey: string,
  wordIds: string[],
  count: number,
): string[] {
  return [...new Set(wordIds)]
    .sort((first, second) => {
      const firstHash = stableHash(`${diagnosticId}:${unitKey}:${first}`)
      const secondHash = stableHash(`${diagnosticId}:${unitKey}:${second}`)
      return firstHash - secondHash || first.localeCompare(second)
    })
    .slice(0, count)
}

export function createUnitFollowUpPlan(params: {
  unitKey: string
  sourceDiagnosticId: string
  reason: 'review' | 'focus'
  unitWordIds: string[]
  sampledWordIds: string[]
  createdAt?: Date
}): UnitFollowUpPlan {
  const sampled = new Set(params.sampledWordIds)
  const candidates = params.unitWordIds.filter(wordId => !sampled.has(wordId))
  const targetCount = params.reason === 'focus' ? 5 : 3
  const createdAt = params.createdAt ?? new Date()

  return {
    unitKey: params.unitKey,
    sourceDiagnosticId: params.sourceDiagnosticId,
    reason: params.reason,
    candidateWordIds: candidates,
    pendingWordIds: selectVerificationWords(
      params.sourceDiagnosticId,
      params.unitKey,
      candidates,
      targetCount,
    ),
    assessedWordIds: [],
    correctCount: 0,
    createdAt: createdAt.toISOString(),
  }
}

export function recordUnitFollowUpResult(params: {
  plan: UnitFollowUpPlan
  wordId: string
  isCorrect: boolean
  answeredAt?: Date
}): UnitFollowUpPlan {
  if (!params.plan.pendingWordIds.includes(params.wordId)) return params.plan

  const answeredAt = params.answeredAt ?? new Date()
  const assessedWordIds = [...new Set([...params.plan.assessedWordIds, params.wordId])]
  const correctCount = params.plan.correctCount + (params.isCorrect ? 1 : 0)
  let pendingWordIds = params.plan.pendingWordIds.filter(wordId => wordId !== params.wordId)

  if (pendingWordIds.length === 0) {
    const accuracy = assessedWordIds.length === 0 ? 1 : correctCount / assessedWordIds.length
    const assessed = new Set(assessedWordIds)
    const remaining = params.plan.candidateWordIds.filter(wordId => !assessed.has(wordId))

    if (accuracy < 0.8 && remaining.length > 0) {
      pendingWordIds = selectVerificationWords(
        params.plan.sourceDiagnosticId,
        params.plan.unitKey,
        remaining,
        2,
      )
    }
  }

  return {
    ...params.plan,
    pendingWordIds,
    assessedWordIds,
    correctCount,
    completedAt: pendingWordIds.length === 0 ? answeredAt.toISOString() : undefined,
  }
}
