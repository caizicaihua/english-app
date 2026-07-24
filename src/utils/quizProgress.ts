import type { Question } from './quiz'
import {
  updateWordMastery,
  type ProgressData,
} from './storage'
import { recordUnitVerification } from './studyPlan'

export type QuizProgressSource = 'quiz' | 'review' | 'unit_verification'

export interface WordAnswerResult {
  wordId: string
  isCorrect: boolean
}

export function getQuestionWordResults(
  question: Question,
  isCorrect: boolean,
  wrongWordIds: string[] = [],
): WordAnswerResult[] {
  if (question.type !== 'match') {
    return [{ wordId: question.word.id, isCorrect }]
  }

  const wrongIds = new Set(wrongWordIds)
  return (question.matchWords ?? []).map(word => ({
    wordId: word.id,
    isCorrect: !wrongIds.has(word.id),
  }))
}

export function applyQuizAnswer(params: {
  progress: ProgressData
  question: Question
  isCorrect: boolean
  wrongWordIds?: string[]
  source: QuizProgressSource
  answeredAt?: Date
}): ProgressData {
  const answeredAt = params.answeredAt ?? new Date()
  const results = getQuestionWordResults(
    params.question,
    params.isCorrect,
    params.wrongWordIds,
  )

  return results.reduce((progress, result) => (
    params.source === 'unit_verification'
      ? recordUnitVerification(progress, result.wordId, result.isCorrect, answeredAt)
      : updateWordMastery(
        progress,
        result.wordId,
        result.isCorrect,
        params.source,
        answeredAt,
      )
  ), params.progress)
}
