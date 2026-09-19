import { describe, expect, it } from 'vitest'
import type { DailyStudyPlan } from '../data/bridgePlan'
import { generateFocusedQuestions } from '../data/mathSkills'
import { buildMathAttempt } from './mathPaper'
import { getMathDailyTaskCompletionDate, matchesMathDailyTask, qualifiesForMathDailyTask } from './mathDailyTask'

const plan = { includeMath: true, mathSkillId: 'addition-carry', mathQuestionCount: 8 } as DailyStudyPlan
function attempt(skillId = 'addition-carry', count = 8, answered = 8) {
  const questions = generateFocusedQuestions(skillId, count)
  return buildMathAttempt({
    mode: 'focused', skillId, title: '专项', durationSeconds: 0, timeSpentSeconds: 120, questions,
    answers: Object.fromEntries(questions.slice(0, answered).map(question => [question.id, question.correctAnswer])),
  })
}

describe('math daily task ownership', () => {
  it('completes only the linked day across midnight and leaves free or legacy sessions unlinked', () => {
    const previousDate = '2026-09-18'
    const nextDate = '2026-09-19'
    const plans = { [previousDate]: { ...plan, date: previousDate }, [nextDate]: { ...plan, date: nextDate } }
    const completedAfterMidnight = { ...attempt(), completedAt: '2026-09-19T00:05:00+08:00' }
    expect(getMathDailyTaskCompletionDate(completedAfterMidnight, previousDate, plans)).toBe(previousDate)
    expect(getMathDailyTaskCompletionDate(completedAfterMidnight, undefined, plans)).toBeUndefined()
    expect(getMathDailyTaskCompletionDate(completedAfterMidnight, previousDate, { [nextDate]: plans[nextDate] })).toBeUndefined()
    expect(getMathDailyTaskCompletionDate(completedAfterMidnight, previousDate, { ...plans, [previousDate]: { ...plans[previousDate], includeMath: false } })).toBeUndefined()
  })

  it('recognizes only a matching planned session as started before any answers', () => {
    const blank = attempt('addition-carry', 8, 0)
    expect(matchesMathDailyTask(blank, plan)).toBe(true)
    expect(qualifiesForMathDailyTask(blank, plan)).toBe(false)
    expect(matchesMathDailyTask(attempt('addition-carry', 6, 0), plan)).toBe(false)
    expect(matchesMathDailyTask(attempt('subtraction-borrow', 8, 0), plan)).toBe(false)
    expect(matchesMathDailyTask(blank, undefined)).toBe(false)
  })

  it('requires the planned skill, enough questions and sufficient answers', () => {
    expect(qualifiesForMathDailyTask(attempt(), plan)).toBe(true)
    expect(qualifiesForMathDailyTask(attempt('subtraction-borrow'), plan)).toBe(false)
    expect(qualifiesForMathDailyTask(attempt('addition-carry', 6, 6), plan)).toBe(false)
    expect(qualifiesForMathDailyTask(attempt('addition-carry', 8, 6), plan)).toBe(false)
    expect(qualifiesForMathDailyTask(attempt(), undefined)).toBe(false)
    expect(qualifiesForMathDailyTask(attempt(), { ...plan, includeMath: false })).toBe(false)
  })

  it('preserves untimed duration and only lets quick mode finish a legacy task', () => {
    const focused = attempt()
    expect(focused.durationSeconds).toBe(0)
    expect(focused.timeSpentSeconds).toBe(120)
    expect(qualifiesForMathDailyTask({ ...focused, mode: 'quick', skillId: undefined }, plan)).toBe(false)
    expect(qualifiesForMathDailyTask({ ...focused, mode: 'quick', skillId: undefined }, { ...plan, mathSkillId: undefined })).toBe(true)
    expect(qualifiesForMathDailyTask({ ...focused, mode: 'review' }, plan)).toBe(false)
  })
})
