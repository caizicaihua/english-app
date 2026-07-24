import { describe, expect, it } from 'vitest'
import type { WordLearningState } from '../data/bridgePlan'
import {
  addLocalDays,
  createUnitFollowUpPlan,
  migrateLegacyWordStates,
  recordUnitFollowUpResult,
  recordWordResult,
} from './mastery'

describe('word mastery state machine', () => {
  it('migrates learned words over 21 days and lets wrong evidence win', () => {
    const migrationDate = new Date(2026, 6, 24, 9)
    const states = migrateLegacyWordStates(
      ['1-1-1', '1-1-2'],
      ['1-1-2', '1-1-3'],
      migrationDate,
    )

    expect(states['1-1-1'].level).toBe(2)
    expect(states['1-1-2']).toMatchObject({
      level: 1,
      correctStreak: 0,
      wrongCount: 1,
      prioritySignals: { legacyWrong: true },
    })
    expect(states['1-1-3'].level).toBe(1)

    expect(states['1-1-1'].nextReviewDate! >= '2026-07-24').toBe(true)
    expect(
      states['1-1-1'].nextReviewDate! <= addLocalDays('2026-07-24', 20),
    ).toBe(true)
    expect(states['1-1-2'].nextReviewDate! >= '2026-07-24').toBe(true)
    expect(
      states['1-1-2'].nextReviewDate! <= addLocalDays('2026-07-24', 6),
    ).toBe(true)
  })

  it('counts at most one correct result per day and clears signals at level 3', () => {
    const state: WordLearningState = {
      level: 2,
      correctStreak: 0,
      wrongCount: 1,
      nextReviewDate: '2026-07-24',
      prioritySignals: {
        legacyWrong: true,
        lastWrongAt: '2026-07-23T08:00:00.000Z',
      },
    }
    const first = recordWordResult(state, true, 'review', new Date(2026, 6, 24, 9))
    const repeatedSameDay = recordWordResult(
      first,
      true,
      'review',
      new Date(2026, 6, 24, 15),
    )
    const nextDay = recordWordResult(
      repeatedSameDay,
      true,
      'review',
      new Date(2026, 6, 25, 9),
    )

    expect(first).toMatchObject({ level: 2, correctStreak: 1 })
    expect(repeatedSameDay).toMatchObject({ level: 2, correctStreak: 1 })
    expect(nextDay).toMatchObject({
      level: 3,
      correctStreak: 0,
      prioritySignals: {},
      nextReviewDate: '2026-08-01',
    })
  })

  it('treats a first wrong answer as encountered level 1', () => {
    const state = recordWordResult(
      undefined,
      false,
      'diagnostic',
      new Date(2026, 6, 24, 9),
    )

    expect(state).toMatchObject({
      level: 1,
      correctStreak: 0,
      wrongCount: 1,
      nextReviewDate: '2026-07-25',
    })
    expect(state.prioritySignals.lastDiagnosticWeakAt).toBeTruthy()
  })
})

describe('unit follow-up plans', () => {
  const unitWordIds = Array.from({ length: 10 }, (_, index) => `1-1-${index + 1}`)

  it('selects deterministic verification words without changing sampled words', () => {
    const params = {
      unitKey: '1-1',
      sourceDiagnosticId: 'diagnostic-1',
      reason: 'focus' as const,
      unitWordIds,
      sampledWordIds: ['1-1-1', '1-1-2'],
      createdAt: new Date(2026, 6, 24, 9),
    }
    const first = createUnitFollowUpPlan(params)
    const repeated = createUnitFollowUpPlan(params)

    expect(first.pendingWordIds).toHaveLength(5)
    expect(first.pendingWordIds).toEqual(repeated.pendingWordIds)
    expect(first.pendingWordIds).not.toContain('1-1-1')
    expect(first.pendingWordIds).not.toContain('1-1-2')
  })

  it('extends a low-accuracy verification plan two words at a time', () => {
    let plan = createUnitFollowUpPlan({
      unitKey: '1-1',
      sourceDiagnosticId: 'diagnostic-1',
      reason: 'review',
      unitWordIds,
      sampledWordIds: ['1-1-1', '1-1-2'],
      createdAt: new Date(2026, 6, 24, 9),
    })
    const initialWordIds = [...plan.pendingWordIds]

    initialWordIds.forEach((wordId, index) => {
      plan = recordUnitFollowUpResult({
        plan,
        wordId,
        isCorrect: index === 0,
        remainingUnitWordIds: unitWordIds.filter(id => !['1-1-1', '1-1-2'].includes(id)),
        answeredAt: new Date(2026, 6, 25, 9 + index),
      })
    })

    expect(plan.assessedWordIds).toEqual(expect.arrayContaining(initialWordIds))
    expect(plan.pendingWordIds).toHaveLength(2)
    expect(plan.completedAt).toBeUndefined()
  })
})
