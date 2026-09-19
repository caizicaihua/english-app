import { describe, expect, it } from 'vitest'
import { englishActivities, getEnglishActivityForUnit } from './englishActivities'
import { grade2 } from './grades/grade2'
import { recordEnglishEvidence } from '../utils/englishEvidence'
import { normalizeProgressData } from '../utils/storage'

describe('grade 2 English content', () => {
  it('preserves 138 word ids and corrects the meaning of post office', () => {
    const words = grade2.units.flatMap(unit => unit.words)
    expect(words).toHaveLength(138)
    expect(new Set(words.map(word => word.id)).size).toBe(138)
    expect(words.find(word => word.id === '2-10-6')).toMatchObject({
      en: 'post office', zh: '邮局', example: { en: 'This is a post office.' },
    })
    expect(words.find(word => word.id === '2-3-7')?.en).toBe('rice noodles')
    for (const unit of grade2.units) {
      for (const line of unit.dialogues?.flatMap(dialogue => dialogue.lines) ?? []) {
        expect(line.en).not.toMatch(/We can also learn|We learn .*today/)
        expect(line.zh).not.toBe('')
      }
    }
  })

  it('provides three listening and three reply questions for each supported theme', () => {
    expect(englishActivities.map(activity => activity.unitId)).toEqual([1, 3, 8])
    for (const activity of englishActivities) {
      expect(getEnglishActivityForUnit(activity.unitId)).toBe(activity)
      expect(activity.questions.filter(question => question.type === 'listen')).toHaveLength(3)
      expect(activity.questions.filter(question => question.type === 'reply')).toHaveLength(3)
      expect(new Set(activity.questions.map(question => question.id)).size).toBe(6)
      for (const question of activity.questions) {
        expect(new Set(question.options).size).toBe(3)
        expect(question.options.filter(option => option === question.correctAnswer)).toHaveLength(1)
      }
    }
    expect(getEnglishActivityForUnit(2)).toBeUndefined()
  })

  it('stores parent speaking confirmation without awarding vocabulary mastery', () => {
    const empty = normalizeProgressData(undefined)
    const evidence = {
      id: 'family-speaking-1', activityId: 'grade2-family', skill: 'speaking' as const,
      correct: true, recordedAt: '2026-09-19T09:00:00.000Z',
    }
    const progress = recordEnglishEvidence(empty, evidence)
    expect(progress.englishEvidence).toEqual([evidence])
    expect(progress.wordMastery).toEqual({})
    expect(recordEnglishEvidence(progress, evidence).englishEvidence).toHaveLength(1)
  })
})
