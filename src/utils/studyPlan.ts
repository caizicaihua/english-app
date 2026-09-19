import type {
  BridgePlanSettings,
  DailyStudyPlan,
  DailyTaskId,
  UnitFollowUpPlan,
  WordLearningState,
} from '../data/bridgePlan'
import { gradeCatalog } from '../data/words'
import { getEnglishActivityForUnit } from '../data/englishActivities'
import type { ProgressData } from './storage'
import { addLocalDays, recordUnitFollowUpResult } from './mastery'
import { getLocalDateKey, updateWordMastery } from './storage'

const DAILY_PLAN_ALGORITHM_VERSION = 3
const studyDaysByFrequency: Record<3 | 4 | 5, number[]> = {
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
}

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
    `plan-v${DAILY_PLAN_ALGORITHM_VERSION}`,
    settings.enabled,
    settings.mode ?? 'bridge',
    settings.gradeId ?? 2,
    settings.semester ?? 'upper',
    settings.englishUnitId ?? 1,
    settings.mathSkillId ?? 'addition-carry',
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
  limit = 8,
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
    if (selected.length >= limit) break
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

export function getCurriculumWordIds(settings: BridgePlanSettings): string[] {
  if (settings.mode === 'semester') {
    const grade = gradeCatalog.find(item => item.id === (settings.gradeId ?? 2))
    const unit = grade?.units.find(item => item.id === (settings.englishUnitId ?? 1))
    return unit?.wordIds ?? []
  }
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

  const semesterLimit = settings.focus === 'math' ? 2 : settings.dailyMinutes === 20 ? 4 : 3
  const itemBudget = settings.dailyMinutes === 10 ? 3 : settings.dailyMinutes === 15 ? 6 : 9
  const limit = settings.mode === 'semester'
    ? Math.max(0, Math.min(semesterLimit, itemBudget - reinforcementCount))
    : getNewWordLimit(settings)

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
  const studyDays = studyDaysByFrequency[settings.studyDaysPerWeek]
  const mathSessionCount = settings.focus === 'math'
    ? Math.min(3, studyDays.length)
    : Math.min(2, studyDays.length)
  const mathDayIndexes = settings.focus === 'math'
    ? Array.from(
      { length: mathSessionCount },
      (_, index) => Math.round(
        index * (studyDays.length - 1) / Math.max(1, mathSessionCount - 1),
      ),
    )
    : Array.from(
      { length: mathSessionCount },
      (_, index) => Math.round(
        (index + 1) * (studyDays.length + 1) / (mathSessionCount + 1),
      ) - 1,
    )
  const mathDays = mathDayIndexes.map(index => studyDays[index])

  return mathDays.includes(date.getDay())
}

export function getStudyDayStatus(date: Date, settings: BridgePlanSettings): NonNullable<DailyStudyPlan['status']> {
  if (!settings.enabled) return 'disabled'
  const dateKey = getLocalDateKey(date)
  const startDate = settings.startDate || dateKey
  if (dateKey < startDate) return 'not-started'
  if (settings.mode !== 'semester' && dateKey > addLocalDays(startDate, 41)) return 'ended'
  return studyDaysByFrequency[settings.studyDaysPerWeek].includes(date.getDay()) ? 'study' : 'rest'
}

export function getPlanStatusMessage(status: DailyStudyPlan['status']): { title: string; description: string } {
  switch (status) {
    case 'disabled': return { title: '先设置学习计划', description: '选择两科当前内容，每天学一点。' }
    case 'not-started': return { title: '计划还没有开始', description: '到了开始日期，就会安排当天的学习内容。' }
    case 'ended': return { title: '暑假计划已结束', description: '切换到学期计划，继续二年级学习。' }
    case 'study': return { title: '今天的内容已学过', description: '可以自由复习，或请家长调整当前单元。' }
    default: return { title: '今天是休息日', description: '不用补做，也可以自由探索喜欢的内容。' }
  }
}

export function buildDailyStudyPlan(
  progress: ProgressData,
  settings: BridgePlanSettings,
  date = new Date(),
): DailyStudyPlan {
  const dateKey = getLocalDateKey(date)
  const status = getStudyDayStatus(date, settings)
  const isSemester = settings.mode === 'semester'
  const latestDiagnosticResult = progress.diagnosticResults.at(-1)
  const completedDiagnosticToday = latestDiagnosticResult
    && getLocalDateKey(new Date(latestDiagnosticResult.completedAt)) === dateKey
  const includeDiagnostic = !isSemester && (!!progress.diagnosticDraft
    || !!completedDiagnosticToday
    || (
      progress.diagnosticResults.length === 0
      && !progress.diagnosticSkippedAt
    ))

  if (status !== 'study') {
    return {
      date: dateKey,
      status,
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
      status,
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

  const reviewLimit = isSemester ? settings.dailyMinutes === 10 ? 3 : settings.dailyMinutes === 15 ? 4 : 6 : 8
  const { reviewWordIds, verificationWordIds } = selectReinforcementWords(progress, dateKey, reviewLimit)
  const reinforcementWordIds = new Set([...reviewWordIds, ...verificationWordIds])
  const reinforcementCount = reinforcementWordIds.size
  const newWordIds = selectNewWords(
    progress,
    settings,
    reinforcementWordIds,
    reinforcementCount,
  )
  const hasEnglishContent = reinforcementCount + newWordIds.length > 0
  const activity = isSemester && (settings.gradeId ?? 2) === 2
    && reinforcementCount < reviewLimit
    && (settings.dailyMinutes >= 15 || !hasEnglishContent)
    ? getEnglishActivityForUnit(settings.englishUnitId ?? 1)
    : undefined

  return {
    date: dateKey,
    status,
    settingsSignature: getPlanSignature(settings, progress, dateKey),
    reviewWordIds,
    verificationWordIds,
    newWordIds,
    includeDiagnostic: false,
    quizQuestionCount: isSemester
      ? !activity && newWordIds.length > 0 ? Math.min(5, newWordIds.length) : 0
      : hasEnglishContent ? settings.dailyMinutes === 10 ? 5 : 10 : 0,
    includeMath: isSemester || shouldIncludeMath(date, settings),
    ...(isSemester ? {
      mathSkillId: settings.mathSkillId ?? 'addition-carry',
      mathQuestionCount: settings.dailyMinutes === 10 || settings.focus === 'english' ? 6 : settings.dailyMinutes === 20 || settings.focus === 'math' ? 10 : 8,
      ...(activity ? { englishActivityId: activity.id } : {}),
    } : {}),
    completedTaskIds: [],
    generatedAt: date.toISOString(),
  }
}

export function getDailyQuizWordIds(plan: DailyStudyPlan): string[] {
  const wordPool: string[] = []
  const seen = new Set<string>()
  const queues = [
    plan.newWordIds,
    plan.reviewWordIds,
    plan.verificationWordIds,
  ]
  const maxQueueLength = Math.max(0, ...queues.map(queue => queue.length))

  for (let index = 0; index < maxQueueLength; index += 1) {
    for (const queue of queues) {
      const wordId = queue[index]
      if (!wordId || seen.has(wordId)) continue
      seen.add(wordId)
      wordPool.push(wordId)
    }
  }

  if (wordPool.length === 0 || plan.quizQuestionCount <= 0) return []

  return Array.from(
    { length: plan.quizQuestionCount },
    (_, index) => wordPool[index % wordPool.length],
  )
}

export function getDailyTaskIds(plan: DailyStudyPlan): DailyTaskId[] {
  return [
    ...(plan.includeDiagnostic ? ['diagnostic' as const] : []),
    ...(plan.reviewWordIds.length > 0 ? ['review' as const] : []),
    ...(plan.verificationWordIds.length > 0 ? ['verification' as const] : []),
    ...(plan.newWordIds.length > 0 ? ['new_words' as const] : []),
    ...(plan.quizQuestionCount > 0 ? ['quiz' as const] : []),
    ...(plan.includeMath ? ['math' as const] : []),
    ...(plan.englishActivityId ? ['english_activity' as const] : []),
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

  // A started semester day is a snapshot. New settings apply on the next day.
  if (existing && settings.mode === 'semester' && hasStartedDailyPlan(progress, existing)) return existing

  if (existing?.settingsSignature === next.settingsSignature) {
    return existing
  }

  const nextTaskIds = new Set(getDailyTaskIds(next))
  return {
    ...next,
    completedTaskIds: existing?.completedTaskIds.filter(taskId => nextTaskIds.has(taskId)) ?? [],
  }
}

export function hasStartedDailyPlan(progress: ProgressData, plan: DailyStudyPlan): boolean {
  if (plan.startedAt || plan.completedTaskIds.length > 0) return true
  const wordIds = [...plan.newWordIds, ...plan.reviewWordIds, ...plan.verificationWordIds]
  return wordIds.some(id => {
    const reviewedAt = progress.wordMastery[id]?.lastReviewedAt
    return reviewedAt && reviewedAt >= plan.generatedAt && getLocalDateKey(new Date(reviewedAt)) === plan.date
  })
}

export function startDailyTask(
  progress: ProgressData,
  dateKey: string,
  taskId: DailyTaskId,
): ProgressData {
  const plan = progress.dailyPlans[dateKey]
  if (!plan || plan.startedAt || !getDailyTaskIds(plan).includes(taskId)) return progress
  return saveDailyStudyPlan(progress, { ...plan, startedAt: new Date().toISOString() })
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
  if (!plan || !getDailyTaskIds(plan).includes(taskId) || plan.completedTaskIds.includes(taskId)) return progress

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

  return recordUnitFollowUpAnswer(updated, wordId, isCorrect, date)
}

export function recordUnitFollowUpAnswer(
  progress: ProgressData,
  wordId: string,
  isCorrect: boolean,
  date = new Date(),
): ProgressData {
  return {
    ...progress,
    unitFollowUpPlans: progress.unitFollowUpPlans.map(plan => (
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
