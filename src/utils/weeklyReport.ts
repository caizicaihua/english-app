import type { BridgePlanSettings } from '../data/bridgePlan'
import { getMathSkill } from '../data/mathSkills'
import type { MathProgressData } from '../data/math'
import { gradeCatalog } from '../data/words'
import type { ProgressData } from './storage'
import { getLocalDateKey } from './storage'
import { getDailyTaskIds, getStudyDayStatus } from './studyPlan'

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
  currentGradeName: string
  currentGradeMasteredCount: number
  currentGradeTotal: number
  currentGradeMasteryRate: number
  scheduledStudyDays: number
  completedStudyDays: number
  scheduleCompletionRate: number | null
  scheduleKnownFrom?: string
  englishSkills: Array<{ skill: string; label: string; total: number; correct: number }>
  mathSkills: Array<{ skillId: string; title: string; total: number; correct: number; accuracy: number }>
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

function getUnitConcerns(progress: ProgressData, gradeId = 1): WeeklyUnitConcern[] {
  const grade1 = gradeCatalog.find(grade => grade.id === gradeId)
  if (!grade1) return []

  return grade1.units.flatMap(unit => {
    const unitKey = `${gradeId}-${unit.id}`
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
  } else {
    suggestions.push('英语跟随当前主题，先听懂一句，再试着在生活里说一句，不急着增加新词。')
  }

  if (report.mathAttemptCount === 0) {
    suggestions.push('数学从学校正在学的知识点开始，做一组不限时短练习。')
  } else if ((report.mathAccuracy ?? 100) < 80) {
    const concern = [...report.mathSkills].filter(item => item.total >= 5).sort((a, b) => a.accuracy - b.accuracy)[0]
    suggestions.push(concern ? `数学先回看“${concern.title}”的解题提示，再换数字练一组；不需要加快速度。` : '数学先看错题的解题提示，再换数字验证，少量记录暂不足以判断薄弱知识点。')
  } else {
    suggestions.push('数学继续以不限时专项为主，先理解，再尝试不同数字和情境。')
  }

  if ((report.scheduleCompletionRate ?? report.completionRate ?? 100) < 70) {
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
  settings?: BridgePlanSettings,
): WeeklyReport {
  const { startDate, endDate } = getLocalWeekRange(date)
  const today = getLocalDateKey(date)
  const cutoffDate = today < endDate ? today : endDate
  const weeklyPlans = Object.values(progress.dailyPlans)
    .filter(plan => plan.date >= startDate && plan.date <= cutoffDate)
  const plannedTaskCount = weeklyPlans
    .reduce((sum, plan) => sum + getDailyTaskIds(plan).length, 0)
  const completedTaskCount = weeklyPlans
    .reduce((sum, plan) => sum + getDailyTaskIds(plan).filter(id => plan.completedTaskIds.includes(id)).length, 0)
  const weeklySessions = progress.studySessions
    .filter(session => session.date >= startDate && session.date <= cutoffDate)
  const weeklyMathAttempts = mathProgress.attemptHistory.filter(attempt => (
    isDateInRange(attempt.completedAt, startDate, cutoffDate)
  ))
  const dailyWordEntries = Object.entries(progress.dailyWords)
    .filter(([dateKey, count]) => dateKey >= startDate && dateKey <= cutoffDate && count > 0)
  const dailyWordIdEntries = Object.entries(progress.dailyWordIds)
    .filter(([dateKey]) => dateKey >= startDate && dateKey <= cutoffDate)
  const firstSeenEntries = Object.entries(progress.wordMastery)
    .filter(([, state]) => isDateInRange(state.firstSeenAt, startDate, cutoffDate))
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
    .filter(state => isDateInRange(state.lastMasteredAt, startDate, cutoffDate))
  const masteredWordCount = masteredStates.length
  const evidence = (progress.englishEvidence ?? []).filter(item => isDateInRange(item.recordedAt, startDate, cutoffDate))
  const studyDates = new Set([
    ...weeklySessions.map(session => session.date),
    ...evidence.map(item => getLocalDateKey(new Date(item.recordedAt))),
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
  const currentGrade = gradeCatalog.find(grade => grade.id === (settings?.gradeId ?? 2))!
  const currentWordIds = currentGrade.units.flatMap(unit => unit.wordIds)
  const currentGradeMasteredCount = currentWordIds.filter(id => (progress.wordMastery[id]?.level ?? 0) >= 3).length
  const concerns = getUnitConcerns(progress, settings?.gradeId)
  const history = [...(progress.planSettingsHistory ?? [])].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
  let scheduledStudyDays = 0
  let completedStudyDays = 0
  for (let day = startDate; day <= cutoffDate; day = addLocalDays(day, 1)) {
    const savedPlan = progress.dailyPlans[day]
    const taskIds = savedPlan ? getDailyTaskIds(savedPlan) : []
    const snapshot = history.filter(item => item.effectiveDate <= day).at(-1)
    const scheduled = taskIds.length > 0 || (!!snapshot && getStudyDayStatus(parseLocalDateKey(day), snapshot.settings) === 'study')
    if (!scheduled) continue
    scheduledStudyDays += 1
    if (savedPlan && taskIds.length > 0 && taskIds.every(id => savedPlan.completedTaskIds.includes(id))) completedStudyDays += 1
  }
  const englishSkills = [
    { skill: 'listening', label: '听辨' }, { skill: 'reading', label: '认读与理解' },
    { skill: 'spelling', label: '拼写' }, { skill: 'speaking', label: '家长确认表达' },
  ].map(item => {
    const records = evidence.filter(record => record.skill === item.skill)
    return { ...item, total: records.length, correct: records.filter(record => record.correct).length }
  })
  const mathSkillMap = new Map<string, { skillId: string; title: string; total: number; correct: number }>()
  for (const attempt of weeklyMathAttempts) {
    for (const result of attempt.questions) {
      const skillId = result.question.skillId
      if (!skillId) continue
      const item = mathSkillMap.get(skillId) ?? { skillId, title: getMathSkill(skillId).title, total: 0, correct: 0 }
      item.total += 1
      if (result.isCorrect) item.correct += 1
      mathSkillMap.set(skillId, item)
    }
  }
  const mathSkills = [...mathSkillMap.values()].map(item => ({ ...item, accuracy: Math.round(item.correct / item.total * 100) }))
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
    currentGradeName: currentGrade.name,
    currentGradeMasteredCount,
    currentGradeTotal: currentWordIds.length,
    currentGradeMasteryRate: Math.round(currentGradeMasteredCount / currentWordIds.length * 100),
    scheduledStudyDays,
    completedStudyDays,
    scheduleCompletionRate: scheduledStudyDays ? Math.round(completedStudyDays / scheduledStudyDays * 100) : null,
    scheduleKnownFrom: history[0]?.effectiveDate,
    englishSkills,
    mathSkills,
  }

  return {
    ...baseReport,
    suggestions: buildSuggestions(baseReport),
  }
}
