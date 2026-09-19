import { describe, expect, it } from 'vitest'
import { englishActivities } from '../data/englishActivities'
import {
  applyEnglishActivityAnswer, clearEnglishActivityDraft, createEnglishActivityDraft,
  loadEnglishActivityDraft, saveEnglishActivityDraft,
} from './englishActivityDraft'
import { getLocalDateKey, normalizeProgressData } from './storage'

function createStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}

const family = englishActivities[0]
const food = englishActivities[1]
const date = new Date(2026, 8, 19, 9)

describe('English activity draft and per-answer activity', () => {
  it('keeps the originally opened task date when an activity is restored after midnight', () => {
    const storage = createStorage()
    const draft = createEnglishActivityDraft(family, new Date(2026, 8, 19, 23, 59), '2026-09-19')
    saveEnglishActivityDraft(draft, storage)
    expect(loadEnglishActivityDraft(family, storage)?.taskDate).toBe('2026-09-19')
    const freePractice = createEnglishActivityDraft(food, date)
    saveEnglishActivityDraft(freePractice, storage)
    expect(loadEnglishActivityDraft(food, storage)?.taskDate).toBeNull()
    const legacy: Partial<typeof draft> = { ...draft }
    delete legacy.taskDate
    storage.setItem('english_app_english_activity_drafts', JSON.stringify({ [family.id]: legacy }))
    expect(loadEnglishActivityDraft(family, storage)?.taskDate).toBe('2026-09-19')
  })

  it('restores an answered question, option order and stable evidence id without counting it twice', () => {
    const storage = createStorage()
    const draft = createEnglishActivityDraft(family, date)
    const question = family.questions[0]
    const answered = applyEnglishActivityAnswer(normalizeProgressData(undefined), draft, family, question.correctAnswer, 'reading', date)
    saveEnglishActivityDraft(answered.draft, storage)
    const restored = loadEnglishActivityDraft(family, storage)!
    expect(restored).toEqual(answered.draft)
    expect(restored.currentIndex).toBe(0)
    expect(restored.answers[0]).toMatchObject({ questionId: question.id, selectedAnswer: question.correctAnswer, skill: 'reading' })
    expect(restored.questionOptions).toEqual(draft.questionOptions)
    expect(answered.progress.lastStudyDate).toBe(getLocalDateKey(date))
    expect(answered.progress.streak).toBe(1)
    const duplicated = applyEnglishActivityAnswer(answered.progress, restored, family, question.correctAnswer, 'reading', date)
    expect(duplicated.progress.englishEvidence).toHaveLength(1)
    expect(duplicated.progress).toBe(answered.progress)
    expect(duplicated.draft).toBe(restored)

    const next = { ...restored, currentIndex: 1, elapsedSeconds: 27 }
    saveEnglishActivityDraft(next, storage)
    expect(loadEnglishActivityDraft(family, storage)).toMatchObject({ currentIndex: 1, elapsedSeconds: 27, sessionId: restored.sessionId })
    const nextAnswer = applyEnglishActivityAnswer(duplicated.progress, next, family, family.questions[1].correctAnswer, 'listening', date)
    expect(nextAnswer.progress.englishEvidence?.map(record => record.skill)).toEqual(['reading', 'listening'])
    expect(nextAnswer.progress.streak).toBe(1)
  })

  it('keeps activities separate and removes only the completed activity', () => {
    const storage = createStorage()
    const familyDraft = createEnglishActivityDraft(family, date)
    const foodDraft = createEnglishActivityDraft(food, date)
    saveEnglishActivityDraft(familyDraft, storage)
    saveEnglishActivityDraft(foodDraft, storage)
    expect(loadEnglishActivityDraft(family, storage)?.sessionId).toBe(familyDraft.sessionId)
    expect(loadEnglishActivityDraft(food, storage)?.sessionId).toBe(foodDraft.sessionId)
    clearEnglishActivityDraft(family.id, storage)
    expect(loadEnglishActivityDraft(family, storage)).toBeNull()
    expect(loadEnglishActivityDraft(food, storage)?.sessionId).toBe(foodDraft.sessionId)
  })

  it('does not accept missing earlier answers or out-of-range question indices', () => {
    const storage = createStorage()
    const draft = createEnglishActivityDraft(family, date)
    saveEnglishActivityDraft({ ...draft, currentIndex: 2 }, storage)
    expect(loadEnglishActivityDraft(family, storage)).toBeNull()
    saveEnglishActivityDraft({ ...draft, currentIndex: 99 }, storage)
    expect(loadEnglishActivityDraft(family, storage)).toBeNull()
    const progress = normalizeProgressData(undefined)
    expect(applyEnglishActivityAnswer(progress, draft, family, 'not an option', 'reading', date).progress).toBe(progress)
  })

  it('recovers at the optional speaking step after all six answers', () => {
    const storage = createStorage()
    let draft = createEnglishActivityDraft(family, date)
    let progress = normalizeProgressData(undefined)
    for (const question of family.questions) {
      const next = applyEnglishActivityAnswer(progress, draft, family, question.correctAnswer, 'reading', date)
      progress = next.progress
      draft = { ...next.draft, currentIndex: next.draft.currentIndex + 1 }
    }
    saveEnglishActivityDraft(draft, storage)
    const restored = loadEnglishActivityDraft(family, storage)!
    expect(restored.currentIndex).toBe(6)
    expect(restored.answers).toHaveLength(6)
    expect(progress.englishEvidence).toHaveLength(6)
    expect(progress.studySessions).toHaveLength(0)
    expect(progress.lastStudyDate).toBe(getLocalDateKey(date))
  })

  it('continues when session storage is blocked or corrupt', () => {
    const denied = {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('denied') },
      removeItem: () => { throw new Error('denied') },
    }
    const draft = createEnglishActivityDraft(family, date)
    expect(loadEnglishActivityDraft(family, denied)).toBeNull()
    expect(() => saveEnglishActivityDraft(draft, denied)).not.toThrow()
    expect(() => clearEnglishActivityDraft(family.id, denied)).not.toThrow()
    const storage = createStorage()
    storage.setItem('english_app_english_activity_drafts', 'broken')
    expect(loadEnglishActivityDraft(family, storage)).toBeNull()
    saveEnglishActivityDraft(draft, storage)
    expect(loadEnglishActivityDraft(family, storage)).toEqual(draft)
  })
})
