import { describe, expect, it } from 'vitest'
import type { Unit, Word } from '../data/words'
import { generateQuestions, generateWordCheckQuestions } from '../utils/quiz'

function createWord(id: string, en: string): Word {
  return {
    id,
    en,
    zh: en,
    emoji: '📝',
    example: {
      en: `Please say ${en}.`,
      zh: en,
    },
  }
}

describe('English quiz generation', () => {
  it('creates ten review questions even from a small wrong-word set', () => {
    const words = [
      createWord('1-1-1', 'apple'),
      createWord('1-1-2', 'ball'),
    ]
    const unit: Unit = {
      id: 1,
      name: 'Review',
      nameZh: '重练',
      words,
    }
    const pool = [
      ...words,
      createWord('1-1-3', 'cat'),
      createWord('1-1-4', 'dog'),
      createWord('1-1-5', 'egg'),
    ]

    const questions = generateQuestions(unit, pool)

    expect(questions).toHaveLength(10)
    for (const question of questions) {
      if (question.options) {
        expect(new Set(question.options).size).toBe(question.options.length)
      }
    }
  })

  it('never hides spaces or punctuation in spelling questions', () => {
    const word = createWord('3-1-1', "o'clock time")
    const unit: Unit = {
      id: 1,
      name: 'Phrases',
      nameZh: '短语',
      words: [word],
    }

    const questions = generateQuestions(unit, [word])
    const spellingQuestions = questions.filter(question => question.type === 'spell')

    expect(spellingQuestions.length).toBeGreaterThan(0)
    for (const question of spellingQuestions) {
      for (const index of question.hiddenIndices ?? []) {
        expect(word.en[index]).toMatch(/[a-z]/i)
      }
    }
  })

  it('does not create an unblanked sentence question from an inflected word', () => {
    const word: Word = {
      id: '1-1-1',
      en: 'grape',
      zh: '葡萄',
      emoji: '🍇',
      example: {
        en: 'The grapes are sweet.',
        zh: '葡萄很甜。',
      },
    }
    const unit: Unit = {
      id: 1,
      name: 'Fruit',
      nameZh: '水果',
      words: [word],
    }

    const questions = generateQuestions(unit, [word])

    expect(questions.some(question => question.type === 'sentence')).toBe(false)
  })

  it('creates one focused check for every queued word', () => {
    const words = [
      createWord('1-1-1', 'apple'),
      createWord('1-1-2', 'ball'),
      createWord('1-1-3', 'cat'),
    ]
    const pool = [
      ...words,
      createWord('1-1-4', 'dog'),
      createWord('1-1-5', 'egg'),
    ]

    const questions = generateWordCheckQuestions(words, pool)

    expect(questions).toHaveLength(words.length)
    expect(questions.map(question => question.word.id)).toEqual(
      words.map(word => word.id),
    )
    expect(new Set(questions.map(question => question.word.id)).size).toBe(words.length)
  })
})
