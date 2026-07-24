import { describe, expect, it } from 'vitest'
import {
  addDailyWord,
  getActiveStreak,
  getLocalDateKey,
  recordStudyActivity,
  updateStreak,
  type ProgressData,
} from './storage'

function createProgress(overrides: Partial<ProgressData> = {}): ProgressData {
  return {
    completedUnits: {},
    learnedWords: [],
    wrongWords: [],
    dailyWords: {},
    streak: 0,
    lastStudyDate: '',
    achievements: [],
    ...overrides,
  }
}

describe('local study dates', () => {
  it('formats the browser local date instead of a UTC date', () => {
    const date = new Date(2026, 6, 24, 1, 30)

    expect(getLocalDateKey(date)).toBe('2026-07-24')
  })

  it('continues a streak from the previous local calendar day', () => {
    const progress = createProgress({
      streak: 3,
      lastStudyDate: '2026-07-23',
    })

    expect(updateStreak(progress, new Date(2026, 6, 24, 0, 15))).toMatchObject({
      streak: 4,
      lastStudyDate: '2026-07-24',
    })
  })

  it('resets a streak after a missed calendar day', () => {
    const progress = createProgress({
      streak: 5,
      lastStudyDate: '2026-07-21',
    })

    expect(updateStreak(progress, new Date(2026, 6, 24, 12))).toMatchObject({
      streak: 1,
      lastStudyDate: '2026-07-24',
    })
    expect(getActiveStreak(progress, new Date(2026, 6, 24, 12))).toBe(0)
  })

  it('records practice without inflating the daily new-word count', () => {
    const progress = createProgress()
    const date = new Date(2026, 6, 24, 9)
    const afterPractice = recordStudyActivity(progress, date)
    const afterWord = addDailyWord(afterPractice, date)

    expect(afterPractice.dailyWords).toEqual({})
    expect(afterPractice.streak).toBe(1)
    expect(afterWord.dailyWords).toEqual({ '2026-07-24': 1 })
    expect(progress.dailyWords).toEqual({})
  })
})
