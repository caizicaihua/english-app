import { describe, expect, it } from 'vitest'
import { MATH_SCHEMA_VERSION, type MathAttempt } from '../data/math'
import {
  addDailyWord,
  getActiveStreak,
  getMathModeProgress,
  getLocalDateKey,
  normalizeMathProgressData,
  normalizeProgressData,
  normalizeSettingsData,
  recordStudyActivity,
  saveMathAttempt,
  updateStreak,
  type ProgressData,
} from './storage'
import {
  PROGRESS_SCHEMA_VERSION,
  SETTINGS_SCHEMA_VERSION,
} from '../data/bridgePlan'

function createProgress(overrides: Partial<ProgressData> = {}): ProgressData {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    completedUnits: {},
    learnedWords: [],
    wrongWords: [],
    dailyWords: {},
    streak: 0,
    lastStudyDate: '',
    achievements: [],
    wordMastery: {},
    unitFollowUpPlans: [],
    diagnosticResults: [],
    diagnosticDraft: null,
    studySessions: [],
    dailyPlans: {},
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

describe('storage migrations', () => {
  it('migrates legacy progress and remains idempotent after the schema upgrade', () => {
    const migrationDate = new Date(2026, 6, 24, 9)
    const first = normalizeProgressData({
      completedUnits: { '1-1': 2 },
      learnedWords: ['1-1-1', '1-1-2'],
      wrongWords: ['1-1-2', '1-1-3'],
      dailyWords: { '2026-07-23': 2 },
      streak: 3,
      lastStudyDate: '2026-07-23',
      achievements: ['first_word'],
    }, migrationDate)
    const repeated = normalizeProgressData(first, new Date(2026, 7, 10, 9))

    expect(first.schemaVersion).toBe(PROGRESS_SCHEMA_VERSION)
    expect(first.wordMastery['1-1-1'].level).toBe(2)
    expect(first.wordMastery['1-1-2'].level).toBe(1)
    expect(first.wordMastery['1-1-3'].level).toBe(1)
    expect(repeated).toEqual(first)
  })

  it('repairs invalid nested fields without discarding valid progress', () => {
    const progress = normalizeProgressData({
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      completedUnits: { '1-1': 3, broken: 'three' },
      learnedWords: ['1-1-1', null, '1-1-1'],
      wrongWords: [],
      dailyWords: { '2026-07-24': 2, broken: -1 },
      streak: 'many',
      lastStudyDate: 'not-a-date',
      achievements: ['first_word'],
      wordMastery: {
        '1-1-1': {
          level: 4,
          correctStreak: 1,
          wrongCount: 2,
          nextReviewDate: 'bad-date',
          prioritySignals: { legacyWrong: 'yes' },
        },
        broken: { level: 9 },
      },
      unitFollowUpPlans: [],
      diagnosticResults: [],
      diagnosticDraft: null,
      studySessions: [],
      dailyPlans: {},
    }, new Date(2026, 6, 24, 9))

    expect(progress.completedUnits).toEqual({ '1-1': 3 })
    expect(progress.learnedWords).toEqual(['1-1-1'])
    expect(progress.dailyWords).toEqual({ '2026-07-24': 2 })
    expect(progress.streak).toBe(0)
    expect(progress.lastStudyDate).toBe('')
    expect(progress.wordMastery['1-1-1']).toMatchObject({
      level: 4,
      prioritySignals: {},
    })
    expect(progress.wordMastery['1-1-1'].nextReviewDate).toBeUndefined()
    expect(progress.wordMastery.broken).toBeUndefined()
  })

  it('normalizes settings independently and fills nested bridge defaults', () => {
    const settings = normalizeSettingsData({
      speechSpeed: 'normal',
      bridgePlan: {
        enabled: true,
        startDate: '2026-07-24',
        studyDaysPerWeek: 8,
        dailyMinutes: 10,
        focus: 'unknown',
        previewGrade2: false,
      },
    })

    expect(settings).toEqual({
      schemaVersion: SETTINGS_SCHEMA_VERSION,
      speechSpeed: 'normal',
      bridgePlan: {
        enabled: true,
        startDate: '2026-07-24',
        studyDaysPerWeek: 5,
        dailyMinutes: 10,
        focus: 'balanced',
        previewGrade2: false,
      },
    })
  })
})

function createMathAttempt(
  mode: MathAttempt['mode'],
  score: number,
  id = `${mode}-${score}`,
): MathAttempt {
  return {
    id,
    mode,
    title: '测试',
    completedAt: '2026-07-24T09:00:00.000Z',
    durationSeconds: 60,
    timeSpentSeconds: 30,
    totalCount: mode === 'quick' ? 20 : 100,
    correctCount: score,
    score,
    sections: [],
    questions: [],
  }
}

describe('math storage by mode', () => {
  it('migrates the old global score into paper mode', () => {
    const legacyAttempt = createMathAttempt('paper', 82)
    const progress = normalizeMathProgressData({
      bestScore: 91,
      lastAttempt: legacyAttempt,
      latestAttempt: legacyAttempt,
      wrongQuestions: [],
    })

    expect(progress.schemaVersion).toBe(MATH_SCHEMA_VERSION)
    expect(getMathModeProgress(progress, 'paper')).toMatchObject({
      bestScore: 91,
      completedCount: 1,
    })
    expect(progress.latestAttempt?.id).toBe(legacyAttempt.id)
    expect(progress.attemptHistory.map(attempt => attempt.id)).toEqual([legacyAttempt.id])
  })

  it('keeps paper and quick scores separate and excludes review from best scores', () => {
    const empty = normalizeMathProgressData(undefined)
    const afterPaper = saveMathAttempt(empty, createMathAttempt('paper', 88))
    const afterQuick = saveMathAttempt(afterPaper, createMathAttempt('quick', 18))
    const afterReview = saveMathAttempt(afterQuick, createMathAttempt('review', 5))

    expect(getMathModeProgress(afterReview, 'paper').bestScore).toBe(88)
    expect(getMathModeProgress(afterReview, 'quick').bestScore).toBe(18)
    expect('review' in afterReview.modeProgress).toBe(false)
    expect(afterReview.latestAttempt?.mode).toBe('review')
    expect(afterReview.attemptHistory.map(attempt => attempt.id)).toEqual([
      'paper-88',
      'quick-18',
      'review-5',
    ])
  })

  it('keeps only the latest 180 days of math attempt history', () => {
    const oldAttempt = {
      ...createMathAttempt('quick', 12, 'old'),
      completedAt: '2025-12-01T09:00:00.000Z',
    }
    const recentAttempt = createMathAttempt('quick', 18, 'recent')
    const progress = normalizeMathProgressData({
      schemaVersion: MATH_SCHEMA_VERSION,
      modeProgress: {},
      latestAttempt: recentAttempt,
      attemptHistory: [oldAttempt, recentAttempt],
      wrongQuestions: [],
    }, new Date(2026, 6, 24, 9))

    expect(progress.attemptHistory.map(attempt => attempt.id)).toEqual(['recent'])
  })

  it('seeds v3 history from v2 per-mode latest attempts', () => {
    const paperAttempt = createMathAttempt('paper', 90, 'paper-latest')
    const quickAttempt = createMathAttempt('quick', 17, 'quick-latest')
    const progress = normalizeMathProgressData({
      schemaVersion: 2,
      modeProgress: {
        paper: {
          bestScore: 90,
          lastAttempt: paperAttempt,
          completedCount: 2,
        },
        quick: {
          bestScore: 17,
          lastAttempt: quickAttempt,
          completedCount: 3,
        },
      },
      latestAttempt: quickAttempt,
      wrongQuestions: [],
    }, new Date(2026, 6, 24, 9))

    expect(progress.schemaVersion).toBe(3)
    expect(progress.attemptHistory.map(attempt => attempt.id)).toEqual([
      'paper-latest',
      'quick-latest',
    ])
    expect(getMathModeProgress(progress, 'paper').bestScore).toBe(90)
    expect(getMathModeProgress(progress, 'quick').bestScore).toBe(17)
  })
})
