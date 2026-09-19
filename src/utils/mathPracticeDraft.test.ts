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
    expect(getMinimumAnsweredCount('focused', 8)).toBe(7)
  })

  it('keeps modes and skill scopes separate and clears only the completed session', () => {
    const storage = createMemoryStorage()
    const draft = { title: '专项', durationSeconds: 0, questions: [question], answers: { [question.id]: '2' }, timeLeft: 0, elapsedSeconds: 42 }
    saveMathPracticeDraft({ ...draft, mode: 'focused', skillId: 'addition-carry', scope: 'addition-carry:8', planDate: '2026-09-18' }, storage)
    saveMathPracticeDraft({ ...draft, mode: 'focused', skillId: 'subtraction-borrow', scope: 'subtraction-borrow:8' }, storage)
    saveMathPracticeDraft({ ...draft, mode: 'quick', durationSeconds: 300, timeLeft: 250 }, storage)

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const restored = loadMathPracticeDraft('focused', tomorrow, storage, 'addition-carry:8')
    expect(restored).toMatchObject({ elapsedSeconds: 42, isPaused: true, answers: draft.answers, planDate: '2026-09-18' })
    expect(loadMathPracticeDraft('focused', tomorrow, storage, 'subtraction-borrow:8')?.planDate).toBeUndefined()
    expect(loadMathPracticeDraft('focused', tomorrow, storage, 'addition-carry:6')).toBeNull()
    clearMathPracticeDraft(storage, { mode: 'focused', scope: 'addition-carry:8' })
    expect(loadMathPracticeDraft('focused', tomorrow, storage, 'addition-carry:8')).toBeNull()
    expect(loadMathPracticeDraft('focused', tomorrow, storage, 'subtraction-borrow:8')).not.toBeNull()
    expect(loadMathPracticeDraft('quick', new Date(), storage)).not.toBeNull()
  })

  it('retains answers from a new timed draft that expired while away', () => {
    const storage = createMemoryStorage()
    const now = Date.now()
    saveMathPracticeDraft({
      mode: 'quick', title: '挑战', durationSeconds: 300, questions: [question],
      answers: { [question.id]: '2' }, timeLeft: 5, deadlineAt: now + 5000,
    }, storage)
    const restored = loadMathPracticeDraft('quick', new Date(now + 60000), storage)
    expect(restored).toMatchObject({ timeLeft: 0, answers: { [question.id]: '2' }, deadlineAt: now + 5000 })
  })

  it('restores a review only while its wrong-question membership is unchanged', () => {
    const storage = createMemoryStorage()
    const other = { ...question, id: 'calc-2', reviewKey: '3+2', expression: '3+2', prompt: '3+2 =', correctAnswer: '5' }
    saveMathPracticeDraft({
      mode: 'review', title: '错题', durationSeconds: 0,
      questions: [question, other], answers: { [question.id]: '2' }, timeLeft: 0,
    }, storage)
    expect(loadMathPracticeDraft('review', new Date(), storage, undefined, [other, question])?.answers).toEqual({ [question.id]: '2' })
    expect(loadMathPracticeDraft('review', new Date(), storage, undefined, [other])).toBeNull()
    expect(loadMathPracticeDraft('review', new Date(), storage, undefined, [question, other, { ...other, id: 'calc-3', reviewKey: '5+2' }])).toBeNull()
    expect(loadMathPracticeDraft('review', new Date(), storage, undefined, [])).toBeNull()
  })

  it('continues without throwing when session storage is unavailable', () => {
    const storage = {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('quota') },
      removeItem: () => { throw new Error('denied') },
    }
    expect(loadMathPracticeDraft('quick', new Date(), storage)).toBeNull()
    expect(() => saveMathPracticeDraft({ mode: 'quick', title: '练习', durationSeconds: 300, questions: [question], answers: {}, timeLeft: 300 }, storage)).not.toThrow()
    expect(() => clearMathPracticeDraft(storage)).not.toThrow()
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
      ...JSON.parse(raw).drafts['quick:default'],
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
