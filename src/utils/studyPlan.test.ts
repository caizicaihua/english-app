import { describe, expect, it } from 'vitest'
import {
  defaultBridgePlanSettings,
  type BridgePlanSettings,
  type UnitFollowUpPlan,
  type WordLearningState,
} from '../data/bridgePlan'
import {
  buildDailyStudyPlan,
  getOrCreateDailyStudyPlan,
  saveDailyStudyPlan,
} from './studyPlan'
import { normalizeProgressData, type ProgressData } from './storage'

function createProgress(overrides: Partial<ProgressData> = {}): ProgressData {
  return {
    ...normalizeProgressData(undefined),
    diagnosticSkippedAt: '2026-07-20T09:00:00.000Z',
    ...overrides,
  }
}

function createWordState(overrides: Partial<WordLearningState> = {}): WordLearningState {
  return {
    level: 1,
    correctStreak: 0,
    wrongCount: 0,
    nextReviewDate: '2026-07-24',
    prioritySignals: {},
    ...overrides,
  }
}

function createSettings(overrides: Partial<BridgePlanSettings> = {}): BridgePlanSettings {
  return {
    ...defaultBridgePlanSettings,
    enabled: true,
    startDate: '2026-07-24',
    ...overrides,
  }
}

describe('daily study plan', () => {
  const date = new Date(2026, 6, 24, 9)

  it('is deterministic for the same progress, settings and date', () => {
    const progress = createProgress()
    const settings = createSettings()

    expect(buildDailyStudyPlan(progress, settings, date)).toEqual(
      buildDailyStudyPlan(progress, settings, date),
    )
  })

  it('keeps ordinary level 0 words out of review and separates new words', () => {
    const progress = createProgress({
      wordMastery: {
        '1-1-1': createWordState({
          level: 0,
          nextReviewDate: undefined,
        }),
        '1-1-2': createWordState(),
        '1-1-3': createWordState({ nextReviewDate: '2026-07-30' }),
        '1-1-4': createWordState({
          level: 2,
          nextReviewDate: '2026-07-30',
          prioritySignals: { lastWrongAt: '2026-07-23T09:00:00.000Z' },
        }),
      },
    })
    const plan = buildDailyStudyPlan(progress, createSettings(), date)

    expect(plan.reviewWordIds).toEqual(['1-1-4', '1-1-2'])
    expect(plan.reviewWordIds).not.toContain('1-1-1')
    expect(plan.newWordIds).toContain('1-1-1')
    expect(plan.newWordIds).not.toContain('1-1-2')
  })

  it('caps reinforcement at 8 and verification at 3', () => {
    const wordMastery = Object.fromEntries(
      Array.from({ length: 5 }, (_, index) => [
        `1-1-${index + 1}`,
        createWordState(),
      ]),
    )
    const followUpPlan: UnitFollowUpPlan = {
      unitKey: '1-2',
      sourceDiagnosticId: 'diagnostic-1',
      reason: 'focus',
      pendingWordIds: ['1-2-1', '1-2-2', '1-2-3', '1-2-4'],
      assessedWordIds: [],
      correctCount: 0,
      createdAt: '2026-07-24T08:00:00.000Z',
    }
    const plan = buildDailyStudyPlan(createProgress({
      wordMastery,
      unitFollowUpPlans: [followUpPlan],
    }), createSettings(), date)

    expect(plan.reviewWordIds).toHaveLength(5)
    expect(plan.verificationWordIds).toHaveLength(3)
    expect(plan.newWordIds).toHaveLength(0)
  })

  it('pauses new words when the reinforcement queue is full', () => {
    const wordMastery = Object.fromEntries(
      Array.from({ length: 9 }, (_, index) => [
        `1-1-${index + 1}`,
        createWordState(),
      ]),
    )
    const plan = buildDailyStudyPlan(
      createProgress({ wordMastery }),
      createSettings(),
      date,
    )

    expect(plan.reviewWordIds).toHaveLength(8)
    expect(plan.newWordIds).toEqual([])
  })

  it('reuses a saved plan and preserves completed tasks after settings change', () => {
    const progress = createProgress()
    const settings = createSettings()
    const initial = buildDailyStudyPlan(progress, settings, date)
    const storedProgress = saveDailyStudyPlan(progress, {
      ...initial,
      completedTaskIds: ['new_words'],
    })

    expect(getOrCreateDailyStudyPlan(storedProgress, settings, date)).toEqual(
      storedProgress.dailyPlans['2026-07-24'],
    )

    const recalculated = getOrCreateDailyStudyPlan(
      storedProgress,
      createSettings({ dailyMinutes: 10 }),
      date,
    )
    expect(recalculated.settingsSignature).not.toBe(initial.settingsSignature)
    expect(recalculated.newWordIds).toHaveLength(3)
    expect(recalculated.completedTaskIds).toContain('new_words')
  })

  it('respects weekly study frequency and the six-week date range', () => {
    const progress = createProgress()
    const settings = createSettings({ studyDaysPerWeek: 3 })
    const friday = buildDailyStudyPlan(
      progress,
      settings,
      new Date(2026, 6, 24, 9),
    )
    const saturday = buildDailyStudyPlan(
      progress,
      settings,
      new Date(2026, 6, 25, 9),
    )
    const afterPlan = buildDailyStudyPlan(
      progress,
      settings,
      new Date(2026, 8, 10, 9),
    )

    expect(friday.quizQuestionCount).toBeGreaterThan(0)
    expect(saturday.quizQuestionCount).toBe(0)
    expect(saturday.newWordIds).toEqual([])
    expect(afterPlan.quizQuestionCount).toBe(0)
  })

  it('uses one diagnostic section as the whole daily task', () => {
    const progress = createProgress({ diagnosticSkippedAt: undefined })
    const plan = buildDailyStudyPlan(progress, createSettings(), date)

    expect(plan.includeDiagnostic).toBe(true)
    expect(plan.quizQuestionCount).toBe(0)
    expect(plan.newWordIds).toEqual([])
    expect(plan.includeMath).toBe(false)
  })
})
