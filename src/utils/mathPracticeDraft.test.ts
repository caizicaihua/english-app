import { describe, expect, it } from 'vitest'
import type { MathQuestion } from '../data/math'
import {
  clearMathPracticeDraft,
  getMinimumAnsweredCount,
  loadMathPracticeDraft,
  saveMathPracticeDraft,
} from './mathPracticeDraft'

function createMemoryStorage() {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
}

const question: MathQuestion = {
  id: 'calc-1',
  reviewKey: '1+1',
  type: 'calc',
  prompt: '1 + 1 =',
  correctAnswer: '2',
  sectionLabel: '一、算一算',
  expression: '1 + 1',
}

describe('math practice draft', () => {
  it('restores the same mode, questions and answers after refresh', () => {
    const storage = createMemoryStorage()
    saveMathPracticeDraft({
      mode: 'quick',
      title: '每日口算快速练',
      durationSeconds: 300,
      questions: [question],
      answers: { [question.id]: '2' },
      timeLeft: 240,
    }, storage)

    const restored = loadMathPracticeDraft('quick', new Date(), storage)

    expect(restored).toMatchObject({
      mode: 'quick',
      questions: [question],
      answers: { [question.id]: '2' },
    })
    expect(restored?.timeLeft).toBeGreaterThanOrEqual(239)
    expect(loadMathPracticeDraft('paper', new Date(), storage)).toBeNull()

    clearMathPracticeDraft(storage)
    expect(loadMathPracticeDraft('quick', new Date(), storage)).toBeNull()
  })

  it('requires 80 percent of quick practice before daily completion', () => {
    expect(getMinimumAnsweredCount('quick', 20)).toBe(16)
    expect(getMinimumAnsweredCount('paper', 100)).toBe(1)
    expect(getMinimumAnsweredCount('review', 0)).toBe(0)
  })

  it('discards an expired practice instead of auto-submitting stale answers', () => {
    const storage = createMemoryStorage()
    saveMathPracticeDraft({
      mode: 'quick',
      title: '每日口算快速练',
      durationSeconds: 300,
      questions: [question],
      answers: {},
      timeLeft: 5,
    }, storage)
    const [key, raw] = [...storage.values.entries()][0]
    const expired = {
      ...JSON.parse(raw),
      savedAt: new Date(2026, 6, 24, 8).toISOString(),
    }
    storage.setItem(key, JSON.stringify(expired))

    expect(loadMathPracticeDraft(
      'quick',
      new Date(2026, 6, 24, 9),
      storage,
    )).toBeNull()
  })
})
