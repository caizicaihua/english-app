import type {
  BridgePlanSettings,
  DailyStudyPlan,
  DailyTaskId,
  UnitFollowUpPlan,
  WordLearningState,
} from '../data/bridgePlan'
import { gradeCatalog } from '../data/words'
import type { ProgressData } from './storage'
import { addLocalDays, recordUnitFollowUpResult } from './mastery'
import { getLocalDateKey, updateWordMastery } from './storage'

interface ReinforcementCandidate {
  wordId: string
  type: 'review' | 'verification'
  priority: number
  dueDate: string
}

function hasPrioritySignal(state: WordLearningState): boolean {
  return state.prioritySignals.legacyWrong === true
    || !!state.prioritySignals.lastWrongAt
    || !!state.prioritySignals.lastDiagnosticWeakAt
}

function getPlanSignature(
  settings: BridgePlanSettings,
  progress: ProgressData,
  dateKey: string,
): string {
  const latestResult = progress.diagnosticResults.at(-1)
  const completedToday = latestResult
    && getLocalDateKey(new Date(latestResult.completedAt)) === dateKey
  const diagnosticState = progress.diagnosticDraft
    ? `draft:${progress.diagnosticDraft.id}`
    : completedToday
      ? `completed-today:${latestResult.id}`
      : progress.diagnosticResults.length === 0 && !progress.diagnosticSkippedAt
        ? 'diagnostic-needed'
        : `diagnostic-ready:${latestResult?.id ?? progress.diagnosticSkippedAt ?? 'skipped'}`

  return [
    settings.startDate,
    settings.studyDaysPerWeek,
    settings.dailyMinutes,
    settings.focus,
    settings.previewGrade2 ? 'preview' : 'no-preview',
    diagnosticState,
  ].join('|')
}

function getReviewCandidates(
  progress: ProgressData,
  dateKey: string,
): ReinforcementCandidate[] {
  return Object.entries(progress.wordMastery).flatMap(([wordId, state]) => {
    if (state.level === 0) return []

    const hasSignal = hasPrioritySignal(state)
    const isDue = !!state.nextReviewDate && state.nextReviewDate <= dateKey
    if (!hasSignal && !isDue) return []

    return [{
      wordId,
      type: 'review' as const,
      priority: hasSignal ? 0 : 10 + state.level,
      dueDate: state.nextReviewDate ?? dateKey,
    }]
  })
}

function getVerificationCandidates(
  plans: UnitFollowUpPlan[],
): ReinforcementCandidate[] {
  const seen = new Set<string>()

  return plans.flatMap(plan => {
    if (plan.completedAt) return []

    return plan.pendingWordIds.flatMap(wordId => {
      if (seen.has(wordId)) return []
      seen.add(wordId)
      return [{
        wordId,
        type: 'verification' as const,
        priority: plan.reason === 'focus' ? 30 : 40,
        dueDate: plan.createdAt,
      }]
    })
  })
}

function selectReinforcementWords(
  progress: ProgressData,
  dateKey: string,
): Pick<DailyStudyPlan, 'reviewWordIds' | 'verificationWordIds'> {
  const reviewCandidates = getReviewCandidates(progress, dateKey)
  const reviewWordIds = new Set(reviewCandidates.map(item => item.wordId))
  const verificationCandidates = getVerificationCandidates(progress.unitFollowUpPlans)
    .filter(item => !reviewWordIds.has(item.wordId))
  const candidates = [...reviewCandidates, ...verificationCandidates]
    .sort((first, second) => (
      first.priority - second.priority
      || first.dueDate.localeCompare(second.dueDate)
      || first.wordId.localeCompare(second.wordId)
    ))
  const selected: ReinforcementCandidate[] = []
  let verificationCount = 0

  for (const candidate of candidates) {
    if (selected.length >= 8) break
    if (candidate.type === 'verification' && verificationCount >= 3) continue
    selected.push(candidate)
    if (candidate.type === 'verification') verificationCount += 1
  }

  return {
    reviewWordIds: selected
      .filter(item => item.type === 'review')
      .map(item => item.wordId),
    verificationWordIds: selected
      .filter(item => item.type === 'verification')
      .map(item => item.wordId),
  }
}

function getNewWordLimit(settings: BridgePlanSettings): number {
  if (settings.focus === 'math') return settings.dailyMinutes === 10 ? 2 : 3
  if (settings.dailyMinutes === 10) return 3
  return 5
}

function getCurriculumWordIds(settings: BridgePlanSettings): string[] {
  const grade1WordIds = gradeCatalog
    .find(grade => grade.id === 1)
    ?.units.flatMap(unit => unit.wordIds) ?? []
  const grade2PreviewWordIds = settings.previewGrade2
    ? gradeCatalog
      .find(grade => grade.id === 2)
      ?.units.slice(0, 4)
      .flatMap(unit => unit.wordIds) ?? []
    : []

  return [...grade1WordIds, ...grade2PreviewWordIds]
}

function selectNewWords(
  progress: ProgressData,
  settings: BridgePlanSettings,
  reinforcementWordIds: Set<string>,
  reinforcementCount: number,
): string[] {
  if (reinforcementCount >= 8) return []

  const limit = getNewWordLimit(settings)

  return getCurriculumWordIds(settings)
    .filter(wordId => {
      const state = progress.wordMastery[wordId]
      return (!state || state.level === 0)
        && !progress.learnedWords.includes(wordId)
        && !reinforcementWordIds.has(wordId)
    })
    .slice(0, limit)
}

function shouldIncludeMath(date: Date, settings: BridgePlanSettings): boolean {
  const day = date.getDay()
  if (settings.focus === 'math') return day === 1 || day === 3 || day === 5
  return day === 2 || day === 4
}

function isScheduledStudyDay(date: Date, settings: BridgePlanSettings): boolean {
  const dateKey = getLocalDateKey(date)
  const startDate = settings.startDate || dateKey
  const endDate = addLocalDays(startDate, 41)
  if (dateKey < startDate || dateKey > endDate) return false

  const studyDaysByFrequency: Record<3 | 4 | 5, number[]> = {
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 4, 5],
  }

  return studyDaysByFrequency[settings.studyDaysPerWeek].includes(date.getDay())
}

export function buildDailyStudyPlan(
  progress: ProgressData,
  settings: BridgePlanSettings,
  date = new Date(),
): DailyStudyPlan {
  const dateKey = getLocalDateKey(date)
  const isStudyDay = isScheduledStudyDay(date, settings)
  const latestDiagnosticResult = progress.diagnosticResults.at(-1)
  const completedDiagnosticToday = latestDiagnosticResult
    && getLocalDateKey(new Date(latestDiagnosticResult.completedAt)) === dateKey
  const includeDiagnostic = !!progress.diagnosticDraft
    || !!completedDiagnosticToday
    || (
      progress.diagnosticResults.length === 0
      && !progress.diagnosticSkippedAt
    )

  if (!isStudyDay) {
    return {
      date: dateKey,
      settingsSignature: getPlanSignature(settings, progress, dateKey),
      reviewWordIds: [],
      verificationWordIds: [],
      newWordIds: [],
      includeDiagnostic: false,
      quizQuestionCount: 0,
      includeMath: false,
      completedTaskIds: [],
      generatedAt: date.toISOString(),
    }
  }

  if (includeDiagnostic) {
    return {
      date: dateKey,
      settingsSignature: getPlanSignature(settings, progress, dateKey),
      reviewWordIds: [],
      verificationWordIds: [],
      newWordIds: [],
      includeDiagnostic: true,
      quizQuestionCount: 0,
      includeMath: false,
      completedTaskIds: [],
      generatedAt: date.toISOString(),
    }
  }

  const { reviewWordIds, verificationWordIds } = selectReinforcementWords(progress, dateKey)
  const reinforcementWordIds = new Set([...reviewWordIds, ...verificationWordIds])
  const reinforcementCount = reinforcementWordIds.size
  const newWordIds = selectNewWords(
    progress,
    settings,
    reinforcementWordIds,
    reinforcementCount,
  )

  return {
    date: dateKey,
    settingsSignature: getPlanSignature(settings, progress, dateKey),
    reviewWordIds,
    verificationWordIds,
    newWordIds,
    includeDiagnostic: false,
    quizQuestionCount: settings.dailyMinutes === 10 ? 5 : 10,
    includeMath: shouldIncludeMath(date, settings),
    completedTaskIds: [],
    generatedAt: date.toISOString(),
  }
}

export function getDailyTaskIds(plan: DailyStudyPlan): DailyTaskId[] {
  return [
    ...(plan.includeDiagnostic ? ['diagnostic' as const] : []),
    ...(plan.reviewWordIds.length > 0 ? ['review' as const] : []),
    ...(plan.verificationWordIds.length > 0 ? ['verification' as const] : []),
    ...(plan.newWordIds.length > 0 ? ['new_words' as const] : []),
    ...(plan.quizQuestionCount > 0 ? ['quiz' as const] : []),
    ...(plan.includeMath ? ['math' as const] : []),
  ]
}

export function getActiveDailyQueueWordIds(
  progress: ProgressData,
  plan: DailyStudyPlan,
  taskId: 'review' | 'verification',
): string[] {
  if (plan.completedTaskIds.includes(taskId)) return []

  if (taskId === 'verification') {
    const activeWordIds = new Set(progress.unitFollowUpPlans.flatMap(followUpPlan => (
      followUpPlan.completedAt ? [] : followUpPlan.pendingWordIds
    )))
    return plan.verificationWordIds.filter(wordId => activeWordIds.has(wordId))
  }

  return plan.reviewWordIds.filter(wordId => {
    const state = progress.wordMastery[wordId]
    return !!state && (
      hasPrioritySignal(state)
      || (!!state.nextReviewDate && state.nextReviewDate <= plan.date)
    )
  })
}

export function getOrCreateDailyStudyPlan(
  progress: ProgressData,
  settings: BridgePlanSettings,
  date = new Date(),
): DailyStudyPlan {
  const next = buildDailyStudyPlan(progress, settings, date)
  const existing = progress.dailyPlans[next.date]

  if (existing?.settingsSignature === next.settingsSignature) {
    return existing
  }

  const nextTaskIds = new Set(getDailyTaskIds(next))
  return {
    ...next,
    completedTaskIds: existing?.completedTaskIds.filter(taskId => nextTaskIds.has(taskId)) ?? [],
  }
}

export function saveDailyStudyPlan(
  progress: ProgressData,
  plan: DailyStudyPlan,
): ProgressData {
  return {
    ...progress,
    dailyPlans: {
      ...progress.dailyPlans,
      [plan.date]: plan,
    },
  }
}

export function completeDailyTask(
  progress: ProgressData,
  dateKey: string,
  taskId: DailyTaskId,
): ProgressData {
  const plan = progress.dailyPlans[dateKey]
  if (!plan || plan.completedTaskIds.includes(taskId)) return progress

  return saveDailyStudyPlan(progress, {
    ...plan,
    completedTaskIds: [...plan.completedTaskIds, taskId],
  })
}

export function recordUnitVerification(
  progress: ProgressData,
  wordId: string,
  isCorrect: boolean,
  date = new Date(),
): ProgressData {
  const updated = updateWordMastery(
    progress,
    wordId,
    isCorrect,
    'unit_verification',
    date,
  )

  return {
    ...updated,
    unitFollowUpPlans: updated.unitFollowUpPlans.map(plan => (
      plan.pendingWordIds.includes(wordId)
        ? recordUnitFollowUpResult({
          plan,
          wordId,
          isCorrect,
          answeredAt: date,
        })
        : plan
    )),
  }
}

export function getBridgePlanDateRange(settings: BridgePlanSettings): {
  startDate: string
  endDate: string
} {
  const startDate = settings.startDate || getLocalDateKey()
  return {
    startDate,
    endDate: addLocalDays(startDate, 41),
  }
}
