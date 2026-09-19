import type { DailyStudyPlan } from '../data/bridgePlan'
import type { MathAttempt } from '../data/math'
import { getMinimumAnsweredCount } from './mathPracticeDraft'

export function matchesMathDailyTask(
  attempt: Pick<MathAttempt, 'mode' | 'skillId' | 'totalCount'>,
  plan: DailyStudyPlan | undefined,
): boolean {
  if (!plan?.includeMath || attempt.totalCount <= 0) return false
  if (attempt.mode === 'quick') return !plan.mathSkillId
  return attempt.mode === 'focused'
    && !!attempt.skillId
    && attempt.skillId === plan.mathSkillId
    && attempt.totalCount >= (plan.mathQuestionCount ?? 6)
}

export function qualifiesForMathDailyTask(attempt: MathAttempt, plan: DailyStudyPlan | undefined): boolean {
  if (!matchesMathDailyTask(attempt, plan)) return false
  const answeredCount = attempt.questions.filter(item => item.userAnswer.trim() !== '').length
  return answeredCount >= getMinimumAnsweredCount(attempt.mode, attempt.totalCount)
}

export function getMathDailyTaskCompletionDate(
  attempt: MathAttempt,
  planDate: string | undefined,
  dailyPlans: Record<string, DailyStudyPlan>,
): string | undefined {
  return planDate && qualifiesForMathDailyTask(attempt, dailyPlans[planDate]) ? planDate : undefined
}
