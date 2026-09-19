import { describe, expect, it } from 'vitest'
import type { DailyStudyPlan } from '../data/bridgePlan'
import { completeEnglishDailyTask } from './englishTaskOwnership'
import { normalizeProgressData, type ProgressData } from './storage'

function plan(date: string): DailyStudyPlan {
  return {
    date, settingsSignature: 'test', reviewWordIds: ['2-1-1'], verificationWordIds: [], newWordIds: ['2-1-2'],
    includeDiagnostic: false, quizQuestionCount: 5, includeMath: false, completedTaskIds: [], generatedAt: `${date}T10:00:00`,
    englishActivityId: 'grade2-family',
  }
}

describe('English task ownership across midnight', () => {
  it('completes the opened day for quizzes, new words and activities without touching the next day', () => {
    const previousDay = '2026-09-19'
    const nextDay = '2026-09-20'
    let progress: ProgressData = { ...normalizeProgressData(undefined), dailyPlans: { [previousDay]: plan(previousDay), [nextDay]: plan(nextDay) } }
    for (const task of ['quiz', 'new_words', 'english_activity'] as const) {
      progress = completeEnglishDailyTask(progress, previousDay, task, task === 'english_activity' ? 'grade2-family' : undefined)
    }
    expect(progress.dailyPlans[previousDay].completedTaskIds).toEqual(['quiz', 'new_words', 'english_activity'])
    expect(progress.dailyPlans[nextDay].completedTaskIds).toEqual([])
  })

  it('does not complete unbound activities, missing old plans or a different activity', () => {
    const progress = { ...normalizeProgressData(undefined), dailyPlans: { '2026-09-20': plan('2026-09-20') } }
    expect(completeEnglishDailyTask(progress, null, 'english_activity', 'grade2-family')).toBe(progress)
    expect(completeEnglishDailyTask(progress, '2026-09-19', 'english_activity', 'grade2-family')).toBe(progress)
    expect(completeEnglishDailyTask(progress, '2026-09-20', 'english_activity', 'grade2-food')).toBe(progress)
  })
})
