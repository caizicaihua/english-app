import type { MathProgressData } from '../data/math'
import { gradeCatalog } from '../data/words'
import type { ProgressData } from './storage'
import { getLocalDateKey } from './storage'
import { getDailyTaskIds } from './studyPlan'

export interface WeeklyUnitConcern {
  unitKey: string
  unitName: string
  masteryPercent: number
  pendingCount: number
  reason: string
}

export interface WeeklyReport {
  startDate: string
  endDate: string
  hasActivity: boolean
  studyDays: number
  plannedTaskCount: number
  completedTaskCount: number
  completionRate: number | null
  newWordCount: number
  reviewedWordCount: number
  masteredWordCount: number
  grade1MasteredCount: number
  grade1TotalCount: number
  grade1MasteryRate: number
  grade2PreviewCount: number
  grade2PreviewTotal: number
  mathAttemptCount: number
  mathCorrectCount: number
  mathQuestionCount: number
  mathAccuracy: number | null
  mathAverageSeconds: number | null
  concerns: WeeklyUnitConcern[]
  suggestions: string[]
}

function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

function addLocalDays(dateKey: string, days: number): string {
  const date = parseLocalDateKey(dateKey)
  date.setDate(date.getDate() + days)
  return getLocalDateKey(date)
}

function isDateInRange(value: string | undefined, startDate: string, endDate: string): boolean {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const dateKey = getLocalDateKey(date)
  return dateKey >= startDate && dateKey <= endDate
}

export function getLocalWeekRange(date = new Date()): {
  startDate: string
  endDate: string
} {
  const localDate = new Date(date)
  localDate.setHours(12, 0, 0, 0)
  const daysSinceMonday = (localDate.getDay() + 6) % 7
  localDate.setDate(localDate.getDate() - daysSinceMonday)
  const startDate = getLocalDateKey(localDate)

  return {
    startDate,
    endDate: addLocalDays(startDate, 6),
  }
}

function hasPrioritySignal(progress: ProgressData, wordId: string): boolean {
  const signals = progress.wordMastery[wordId]?.prioritySignals
  return !!signals && (
    signals.legacyWrong === true
    || !!signals.lastWrongAt
    || !!signals.lastDiagnosticWeakAt
  )
}

function getUnitConcerns(progress: ProgressData): WeeklyUnitConcern[] {
  const grade1 = gradeCatalog.find(grade => grade.id === 1)
  if (!grade1) return []

  return grade1.units.flatMap(unit => {
    const unitKey = `1-${unit.id}`
    const states = unit.wordIds.map(wordId => progress.wordMastery[wordId])
    const masteredCount = states.filter(state => (state?.level ?? 0) >= 3).length
    const lowMasteryCount = states.filter(state => (
      state && state.level > 0 && state.level < 3
    )).length
    const priorityCount = unit.wordIds.filter(wordId => hasPrioritySignal(progress, wordId)).length
    const followUpPlan = progress.unitFollowUpPlans.find(plan => (
      plan.unitKey === unitKey && !plan.completedAt
    ))
    const pendingCount = followUpPlan?.pendingWordIds.length ?? 0
    const score = priorityCount * 4
      + lowMasteryCount * 2
      + pendingCount * (followUpPlan?.reason === 'focus' ? 3 : 2)

    if (score === 0) return []

    const reason = followUpPlan?.reason === 'focus'
      ? `诊断后还有 ${pendingCount} 个词待验证`
      : priorityCount > 0
        ? `${priorityCount} 个词有近期错误信号`
        : `${lowMasteryCount} 个词仍需巩固`

    return [{
      unitKey,
      unitName: unit.nameZh,
      masteryPercent: Math.round((masteredCount / unit.wordIds.length) * 100),
      pendingCount,
      reason,
      score,
    }]
  })
    .sort((first, second) => (
      second.score - first.score
      || first.unitKey.localeCompare(second.unitKey)
    ))
    .slice(0, 3)
    .map(item => ({
      unitKey: item.unitKey,
      unitName: item.unitName,
      masteryPercent: item.masteryPercent,
      pendingCount: item.pendingCount,
      reason: item.reason,
    }))
}

function buildSuggestions(report: Omit<WeeklyReport, 'suggestions'>): string[] {
  const suggestions: string[] = []

  if (report.concerns.length > 0) {
    suggestions.push(
      `下周先复习“${report.concerns[0].unitName}”，每天只取今日任务里的少量词即可。`,
    )
  } else if (report.grade1MasteryRate >= 80) {
    suggestions.push('一年级基础较稳，可以继续保持复习上限，并逐步加入二年级预习。')
  } else {
    suggestions.push('继续先做一年级到期复习，不需要为了赶进度额外加量。')
  }

  if (report.mathAttemptCount === 0) {
    suggestions.push('下周安排 2 次 20 题数学快速练，保持计算手感即可。')
  } else if ((report.mathAccuracy ?? 100) < 80) {
    suggestions.push('数学先看错题本中的高频题型，暂时不用增加到 100 题整卷。')
  } else {
    suggestions.push('数学正确率稳定，继续以 20 题快速练为主，每周最多做一次整卷。')
  }

  if (report.plannedTaskCount > 0 && (report.completionRate ?? 100) < 70) {
    suggestions.push('本周完成率偏低，下周可减少学习天数或时长，不需要补做欠下的任务。')
  } else {
    suggestions.push('保持当前轻量节奏，完成当天任务后就停止，不追加练习。')
  }

  return suggestions.slice(0, 3)
}

export function buildWeeklyReport(
  progress: ProgressData,
  mathProgress: MathProgressData,
  date = new Date(),
): WeeklyReport {
  const { startDate, endDate } = getLocalWeekRange(date)
  const weeklyPlans = Object.values(progress.dailyPlans)
    .filter(plan => plan.date >= startDate && plan.date <= endDate)
  const plannedTaskCount = weeklyPlans
    .reduce((sum, plan) => sum + getDailyTaskIds(plan).length, 0)
  const completedTaskCount = weeklyPlans
    .reduce((sum, plan) => sum + plan.completedTaskIds.length, 0)
  const weeklySessions = progress.studySessions
    .filter(session => session.date >= startDate && session.date <= endDate)
  const weeklyMathAttempts = mathProgress.attemptHistory.filter(attempt => (
    attempt.mode !== 'review'
    && isDateInRange(attempt.completedAt, startDate, endDate)
  ))
  const dailyWordEntries = Object.entries(progress.dailyWords)
    .filter(([dateKey, count]) => dateKey >= startDate && dateKey <= endDate && count > 0)
  const dailyWordIdEntries = Object.entries(progress.dailyWordIds)
    .filter(([dateKey]) => dateKey >= startDate && dateKey <= endDate)
  const firstSeenEntries = Object.entries(progress.wordMastery)
    .filter(([, state]) => isDateInRange(state.firstSeenAt, startDate, endDate))
  const firstSeenStates = firstSeenEntries.map(([, state]) => state)
  const firstSeenCount = firstSeenStates.length
  const newWordIds = new Set([
    ...firstSeenEntries.map(([wordId]) => wordId),
    ...dailyWordIdEntries.flatMap(([, wordIds]) => wordIds),
  ])
  const explicitDailyCounts = new Map(
    dailyWordIdEntries.map(([dateKey, wordIds]) => [dateKey, new Set(wordIds).size]),
  )
  const legacyNewWordCount = dailyWordEntries.reduce((sum, [dateKey, count]) => (
    sum + Math.max(0, count - (explicitDailyCounts.get(dateKey) ?? 0))
  ), 0)
  const masteredStates = Object.values(progress.wordMastery)
    .filter(state => isDateInRange(state.lastMasteredAt, startDate, endDate))
  const masteredWordCount = masteredStates.length
  const studyDates = new Set([
    ...weeklySessions.map(session => session.date),
    ...weeklyMathAttempts.map(attempt => getLocalDateKey(new Date(attempt.completedAt))),
    ...dailyWordEntries.map(([dateKey]) => dateKey),
    ...firstSeenStates.map(state => getLocalDateKey(new Date(state.firstSeenAt!))),
    ...masteredStates.map(state => getLocalDateKey(new Date(state.lastMasteredAt!))),
    ...weeklyPlans
      .filter(plan => plan.completedTaskIds.length > 0)
      .map(plan => plan.date),
  ])
  const grade1WordIds = gradeCatalog
    .find(grade => grade.id === 1)
    ?.units.flatMap(unit => unit.wordIds) ?? []
  const grade2PreviewWordIds = gradeCatalog
    .find(grade => grade.id === 2)
    ?.units.slice(0, 4)
    .flatMap(unit => unit.wordIds) ?? []
  const grade1MasteredCount = grade1WordIds
    .filter(wordId => (progress.wordMastery[wordId]?.level ?? 0) >= 3)
    .length
  const grade2PreviewCount = grade2PreviewWordIds
    .filter(wordId => (progress.wordMastery[wordId]?.level ?? 0) > 0)
    .length
  const mathCorrectCount = weeklyMathAttempts
    .reduce((sum, attempt) => sum + attempt.correctCount, 0)
  const mathQuestionCount = weeklyMathAttempts
    .reduce((sum, attempt) => sum + attempt.totalCount, 0)
  const concerns = getUnitConcerns(progress)
  const baseReport: Omit<WeeklyReport, 'suggestions'> = {
    startDate,
    endDate,
    hasActivity: studyDates.size > 0
      || completedTaskCount > 0
      || firstSeenCount > 0
      || masteredWordCount > 0,
    studyDays: studyDates.size,
    plannedTaskCount,
    completedTaskCount,
    completionRate: plannedTaskCount > 0
      ? Math.round((completedTaskCount / plannedTaskCount) * 100)
      : null,
    newWordCount: newWordIds.size + legacyNewWordCount,
    reviewedWordCount: weeklySessions
      .filter(session => session.taskType === 'review' || session.taskType === 'verification')
      .reduce((sum, session) => sum + session.itemCount, 0),
    masteredWordCount,
    grade1MasteredCount,
    grade1TotalCount: grade1WordIds.length,
    grade1MasteryRate: grade1WordIds.length > 0
      ? Math.round((grade1MasteredCount / grade1WordIds.length) * 100)
      : 0,
    grade2PreviewCount,
    grade2PreviewTotal: grade2PreviewWordIds.length,
    mathAttemptCount: weeklyMathAttempts.length,
    mathCorrectCount,
    mathQuestionCount,
    mathAccuracy: mathQuestionCount > 0
      ? Math.round((mathCorrectCount / mathQuestionCount) * 100)
      : null,
    mathAverageSeconds: weeklyMathAttempts.length > 0
      ? Math.round(
        weeklyMathAttempts.reduce((sum, attempt) => sum + attempt.timeSpentSeconds, 0)
        / weeklyMathAttempts.length,
      )
      : null,
    concerns,
  }

  return {
    ...baseReport,
    suggestions: buildSuggestions(baseReport),
  }
}
