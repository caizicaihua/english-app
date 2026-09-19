import { describe, expect, it } from 'vitest'
import type { StudySession } from '../data/bridgePlan'
import type { EnglishEvidence } from './englishEvidence'
import { getEnglishPracticeCount } from './englishStats'
import { normalizeProgressData } from './storage'

const today = '2026-09-20'
function evidence(id: string, recordedAt = '2026-09-20T10:00:00', skill: EnglishEvidence['skill'] = 'reading'): EnglishEvidence {
  return { id, activityId: 'quiz:2-1-1', skill, correct: true, recordedAt }
}
function session(id: string, itemCount: number, overrides: Partial<StudySession> = {}): StudySession {
  return { id, date: today, itemCount, taskType: 'quiz', correctCount: itemCount, durationSeconds: 20, ...overrides }
}

describe('daily English practice count', () => {
  it('counts partial activity answers immediately and deduplicates repeated records', () => {
    const record = evidence('family-session-q1')
    const progress = { ...normalizeProgressData(undefined), englishEvidence: [record, record, evidence('family-session-q2')] }
    expect(getEnglishPracticeCount(progress, today)).toBe(2)
  })

  it('does not add completed sessions to their already counted answers, but retains old sessions', () => {
    const progress = {
      ...normalizeProgressData(undefined),
      englishEvidence: [evidence('quiz-1-r0-q0'), evidence('quiz-1-r0-q1'), evidence('family-q0'), evidence('family-speaking', undefined, 'speaking')],
      studySessions: [session('quiz-1-r0', 2), session('family', 1), session('old-session', 10)],
    }
    expect(getEnglishPracticeCount(progress, today)).toBe(14)
  })

  it('uses each answer date across midnight rather than moving every answer to completion day', () => {
    const progress = {
      ...normalizeProgressData(undefined),
      englishEvidence: [evidence('quiz-1-r0-q0', '2026-09-19T23:59:30'), evidence('quiz-1-r0-q1', '2026-09-20T00:00:30')],
      studySessions: [session('quiz-1-r0', 2)],
    }
    expect(getEnglishPracticeCount(progress, '2026-09-19')).toBe(1)
    expect(getEnglishPracticeCount(progress, today)).toBe(1)
  })

  it('supports earlier quiz and activity session identifiers without double counting', () => {
    const progress = {
      ...normalizeProgressData(undefined),
      englishEvidence: [evidence('quiz-10000-0-0'), evidence('quiz-10000-1-0'), evidence('grade2-family-10000-family-listen-1')],
      studySessions: [session('quiz-30000-daily-quiz', 2), session('activity-grade2-family-10000', 1)],
    }
    expect(getEnglishPracticeCount(progress, today)).toBe(3)
  })

  it('excludes word exposure and math while counting legacy diagnostic sessions', () => {
    const progress = {
      ...normalizeProgressData(undefined),
      studySessions: [session('new', 5, { taskType: 'new_words' }), session('math', 8, { taskType: 'math' }), session('diagnostic', 12, { taskType: 'diagnostic' })],
    }
    expect(getEnglishPracticeCount(progress, today)).toBe(12)
  })
})
