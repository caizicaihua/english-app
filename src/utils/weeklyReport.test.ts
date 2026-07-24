import { describe, expect, it } from 'vitest'
import {
  MATH_SCHEMA_VERSION,
  type MathAttempt,
  type MathProgressData,
} from '../data/math'
import type { DailyStudyPlan, WordLearningState } from '../data/bridgePlan'
import { normalizeProgressData, type ProgressData } from './storage'
import { buildWeeklyReport, getLocalWeekRange } from './weeklyReport'

function createWordState(
  level: WordLearningState['level'],
  overrides: Partial<WordLearningState> = {},
): WordLearningState {
  return {
    level,
    correctStreak: 0,
    wrongCount: 0,
    prioritySignals: {},
    ...overrides,
  }
}

function createDailyPlan(
  date: string,
  overrides: Partial<DailyStudyPlan> = {},
): DailyStudyPlan {
  return {
    date,
    settingsSignature: 'test',
    reviewWordIds: ['1-1-1'],
    verificationWordIds: [],
    newWordIds: ['2-1-1'],
    includeDiagnostic: false,
    quizQuestionCount: 0,
    includeMath: false,
    completedTaskIds: ['review'],
    generatedAt: `${date}T08:00:00.000Z`,
    ...overrides,
  }
}

function createMathAttempt(overrides: Partial<MathAttempt> = {}): MathAttempt {
  return {
    id: 'quick-friday',
    mode: 'quick',
    title: '每日口算快速练',
    completedAt: new Date(2026, 6, 24, 10).toISOString(),
    durationSeconds: 300,
    timeSpentSeconds: 240,
    totalCount: 20,
    correctCount: 18,
    score: 18,
    sections: [],
    questions: [],
    ...overrides,
  }
}

function createMathProgress(attempts: MathAttempt[] = []): MathProgressData {
  return {
    schemaVersion: MATH_SCHEMA_VERSION,
    modeProgress: {},
    latestAttempt: attempts.at(-1) ?? null,
    attemptHistory: attempts,
    wrongQuestions: [],
  }
}

function createProgress(overrides: Partial<ProgressData> = {}): ProgressData {
  return {
    ...normalizeProgressData(undefined),
    ...overrides,
  }
}

describe('weekly parent report', () => {
  const friday = new Date(2026, 6, 24, 12)

  it('uses local Monday through Sunday boundaries', () => {
    expect(getLocalWeekRange(friday)).toEqual({
      startDate: '2026-07-20',
      endDate: '2026-07-26',
    })
  })

  it('returns a guided empty state instead of empty metrics', () => {
    const report = buildWeeklyReport(
      createProgress(),
      createMathProgress(),
      friday,
    )

    expect(report.hasActivity).toBe(false)
    expect(report.studyDays).toBe(0)
    expect(report.mathAccuracy).toBeNull()
    expect(report.suggestions).toHaveLength(3)
  })

  it('summarizes tasks, mastery, math and weak units for the current week', () => {
    const tuesday = new Date(2026, 6, 21, 9)
    const wednesday = new Date(2026, 6, 22, 9)
    const progress = createProgress({
      wordMastery: {
        '1-1-1': createWordState(3, {
          firstSeenAt: tuesday.toISOString(),
          lastMasteredAt: wednesday.toISOString(),
          lastReviewedAt: wednesday.toISOString(),
        }),
        '1-1-2': createWordState(1, {
          firstSeenAt: tuesday.toISOString(),
          lastReviewedAt: tuesday.toISOString(),
          prioritySignals: {
            lastWrongAt: tuesday.toISOString(),
          },
        }),
        '2-1-1': createWordState(1, {
          firstSeenAt: tuesday.toISOString(),
          lastReviewedAt: tuesday.toISOString(),
        }),
      },
      studySessions: [{
        id: 'review-monday',
        date: '2026-07-20',
        taskType: 'review',
        itemCount: 3,
        correctCount: 2,
        durationSeconds: 120,
      }],
      dailyPlans: {
        '2026-07-21': createDailyPlan('2026-07-21'),
      },
    })
    const report = buildWeeklyReport(
      progress,
      createMathProgress([createMathAttempt()]),
      friday,
    )

    expect(report.hasActivity).toBe(true)
    expect(report.studyDays).toBe(4)
    expect(report.plannedTaskCount).toBe(2)
    expect(report.completedTaskCount).toBe(1)
    expect(report.completionRate).toBe(50)
    expect(report.newWordCount).toBe(3)
    expect(report.reviewedWordCount).toBe(3)
    expect(report.masteredWordCount).toBe(1)
    expect(report.grade1MasteredCount).toBe(1)
    expect(report.grade2PreviewCount).toBe(1)
    expect(report.mathAttemptCount).toBe(1)
    expect(report.mathAccuracy).toBe(90)
    expect(report.mathAverageSeconds).toBe(240)
    expect(report.concerns[0]).toMatchObject({
      unitKey: '1-1',
      reason: '1 个词有近期错误信号',
    })
  })

  it('excludes attempts outside the selected local week', () => {
    const previousSunday = createMathAttempt({
      id: 'previous-sunday',
      completedAt: new Date(2026, 6, 19, 20).toISOString(),
    })
    const nextMonday = createMathAttempt({
      id: 'next-monday',
      completedAt: new Date(2026, 6, 27, 9).toISOString(),
    })
    const report = buildWeeklyReport(
      createProgress(),
      createMathProgress([previousSunday, nextMonday]),
      friday,
    )

    expect(report.mathAttemptCount).toBe(0)
    expect(report.hasActivity).toBe(false)
  })
})
