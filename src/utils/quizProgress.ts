import type { Question } from './quiz'
import { getQuestionSkill, recordEnglishEvidence } from './englishEvidence'
import {
  updateWordMastery,
  recordStudyActivity,
  type ProgressData,
} from './storage'
import {
  recordUnitFollowUpAnswer,
  recordUnitVerification,
} from './studyPlan'

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
  usedReadingFallback?: boolean
  evidenceId?: string
}): ProgressData {
  const answeredAt = params.answeredAt ?? new Date()
  const results = getQuestionWordResults(
    params.question,
    params.isCorrect,
    params.wrongWordIds,
  )

  const updated = results.reduce((progress, result) => {
    if (params.source === 'unit_verification') {
      return recordUnitVerification(progress, result.wordId, result.isCorrect, answeredAt)
    }

    const updated = updateWordMastery(
      progress,
      result.wordId,
      result.isCorrect,
      params.source,
      answeredAt,
    )
    return recordUnitFollowUpAnswer(updated, result.wordId, result.isCorrect, answeredAt)
  }, params.progress)

  return recordStudyActivity(recordEnglishEvidence(updated, {
    id: params.evidenceId ?? `quiz-${answeredAt.getTime()}-${params.question.word.id}-${params.question.type}`,
    activityId: `${params.source}:${params.question.word.id}`,
    skill: getQuestionSkill(params.question.type, params.usedReadingFallback),
    correct: params.isCorrect,
    recordedAt: answeredAt.toISOString(),
  }), answeredAt)
}
