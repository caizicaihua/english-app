import { describe, expect, it } from 'vitest'
import type { UnitFollowUpPlan } from '../data/bridgePlan'
import type { Question } from './quiz'
import {
  applyQuizAnswer,
  getQuestionWordResults,
  type WordAnswerResult,
} from './quizProgress'
import { normalizeProgressData } from './storage'

const word = {
  id: '1-1-1',
  en: 'apple',
  zh: '苹果',
  emoji: '🍎',
}

describe('quiz mastery updates', () => {
  it('updates a normal question through the shared mastery state', () => {
    const progress = applyQuizAnswer({
      progress: normalizeProgressData(undefined),
      question: {
        type: 'zh2en',
        word,
        options: ['apple', 'ball'],
        correctAnswer: 'apple',
      },
      isCorrect: false,
      source: 'quiz',
      answeredAt: new Date(2026, 6, 24, 9),
    })

    expect(progress.wordMastery[word.id]).toMatchObject({
      level: 1,
      wrongCount: 1,
    })
    expect(progress.learnedWords).toContain(word.id)
    expect(progress.wrongWords).toContain(word.id)
  })

  it('records every word in a matching question independently', () => {
    const secondWord = { ...word, id: '1-1-2', en: 'ball', zh: '球' }
    const question: Question = {
      type: 'match',
      word,
      correctAnswer: '',
      matchWords: [word, secondWord],
    }

    expect(getQuestionWordResults(question, false, [secondWord.id])).toEqual([
      { wordId: word.id, isCorrect: true },
      { wordId: secondWord.id, isCorrect: false },
    ] satisfies WordAnswerResult[])
  })

  it('removes a verified word from its follow-up plan', () => {
    const followUpPlan: UnitFollowUpPlan = {
      unitKey: '1-1',
      sourceDiagnosticId: 'diagnostic-1',
      reason: 'review',
      candidateWordIds: [word.id],
      pendingWordIds: [word.id],
      assessedWordIds: [],
      correctCount: 0,
      createdAt: '2026-07-24T08:00:00.000Z',
    }
    const progress = applyQuizAnswer({
      progress: {
        ...normalizeProgressData(undefined),
        unitFollowUpPlans: [followUpPlan],
      },
      question: {
        type: 'listen',
        word,
        options: ['apple'],
        correctAnswer: 'apple',
      },
      isCorrect: true,
      source: 'unit_verification',
      answeredAt: new Date(2026, 6, 24, 9),
    })

    expect(progress.unitFollowUpPlans[0]).toMatchObject({
      pendingWordIds: [],
      assessedWordIds: [word.id],
      correctCount: 1,
    })
    expect(progress.unitFollowUpPlans[0].completedAt).toBeTruthy()
  })

  it('settles a pending unit follow-up word from an ordinary review answer', () => {
    const followUpPlan: UnitFollowUpPlan = {
      unitKey: '1-1',
      sourceDiagnosticId: 'diagnostic-1',
      reason: 'review',
      candidateWordIds: [word.id],
      pendingWordIds: [word.id],
      assessedWordIds: [],
      correctCount: 0,
      createdAt: '2026-07-24T08:00:00.000Z',
    }
    const progress = applyQuizAnswer({
      progress: {
        ...normalizeProgressData(undefined),
        unitFollowUpPlans: [followUpPlan],
      },
      question: {
        type: 'zh2en',
        word,
        options: ['apple'],
        correctAnswer: 'apple',
      },
      isCorrect: true,
      source: 'review',
      answeredAt: new Date(2026, 6, 24, 9),
    })

    expect(progress.unitFollowUpPlans[0].pendingWordIds).toEqual([])
    expect(progress.unitFollowUpPlans[0].assessedWordIds).toEqual([word.id])
    expect(progress.unitFollowUpPlans[0].completedAt).toBeTruthy()
  })
})
