import type { StudySession } from '../data/bridgePlan'
import type { EnglishEvidence } from './englishEvidence'
import { getLocalDateKey, type ProgressData } from './storage'

function belongsToSession(evidence: EnglishEvidence, session: StudySession): boolean {
  if (evidence.id.startsWith(`${session.id}-`)) return true
  // Activity sessions from the first draft used an extra prefix on completion.
  if (session.id.startsWith('activity-') && evidence.id.startsWith(`${session.id.slice(9)}-`)) return true
  // Earlier quiz completion ids used end time instead of a shared session id.
  const legacySession = session.id.match(/^quiz-(\d+)-(?:daily-quiz|daily-review|verification|wrong-book|\d+-\d+)$/)
  const legacyEvidence = evidence.id.match(/^quiz-(\d+)-\d+-\d+$/)
  if (!legacySession || !legacyEvidence) return false
  const source = session.taskType === 'review' ? 'review' : session.taskType === 'verification' ? 'unit_verification' : 'quiz'
  return evidence.activityId.startsWith(`${source}:`)
    && Math.abs(Number(legacySession[1]) - Number(legacyEvidence[1]) - session.durationSeconds * 1000) <= 501
}

/** Count actual dated answers; completed sessions only fill gaps in older records. */
export function getEnglishPracticeCount(progress: ProgressData, dateKey: string): number {
  const evidence = [...new Map((progress.englishEvidence ?? []).map(item => [item.id, item])).values()]
  let count = evidence.filter(item => getLocalDateKey(new Date(item.recordedAt)) === dateKey).length
  const consumedIds = new Set<string>()
  const sessions = [...new Map(progress.studySessions.map(session => [session.id, session])).values()]
  for (const session of sessions) {
    if (session.taskType === 'math' || session.taskType === 'new_words') continue
    const linked = evidence.filter(item => item.skill !== 'speaking' && !consumedIds.has(item.id) && belongsToSession(item, session))
    linked.forEach(item => consumedIds.add(item.id))
    if (session.date === dateKey) count += Math.max(0, session.itemCount - linked.length)
  }
  return count
}
