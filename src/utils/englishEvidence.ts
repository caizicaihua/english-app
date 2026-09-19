import type { ProgressData } from './storage'
import type { QuestionType } from './quiz'

export type EnglishSkill = 'listening' | 'reading' | 'spelling' | 'speaking'

export interface EnglishEvidence {
  id: string
  activityId: string
  skill: EnglishSkill
  correct: boolean
  recordedAt: string
}

export function getQuestionSkill(type: QuestionType, usedReadingFallback = false): EnglishSkill {
  if (type === 'spell') return 'spelling'
  return type === 'listen' && !usedReadingFallback ? 'listening' : 'reading'
}

export function recordEnglishEvidence(progress: ProgressData, evidence: EnglishEvidence): ProgressData {
  const records = progress.englishEvidence ?? []
  if (records.some(record => record.id === evidence.id)) return progress
  return { ...progress, englishEvidence: [...records, evidence] }
}
