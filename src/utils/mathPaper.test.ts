import { describe, expect, it } from 'vitest'
import {
  mathPaperConfig,
  mathQuickConfig,
  type MathPaperConfig,
} from '../data/math'
import { buildMathAttempt, generateMathPaper } from './mathPaper'

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

describe('math paper generation', () => {
  it('always creates a complete paper within the 0-100 number range', () => {
    for (let run = 0; run < 40; run += 1) {
      const questions = generateMathPaper()

      expect(questions).toHaveLength(mathPaperConfig.totalQuestions)
      expect(new Set(questions.map(question => question.reviewKey)).size).toBe(questions.length)

      for (const question of questions) {
        const displayedNumbers = question.prompt.match(/\d+/g)?.map(Number) ?? []
        expect(displayedNumbers.every(value => value >= 0 && value <= 100)).toBe(true)
        expect(Number.isNaN(Number(question.correctAnswer))).toBe(question.type === 'compare')

        if (question.type !== 'compare') {
          const answer = Number(question.correctAnswer)
          expect(answer).toBeGreaterThanOrEqual(0)
          expect(answer).toBeLessThanOrEqual(100)
        }
      }
    }
  })

  it('uses the quick configuration to create exactly 14/4/2 questions', () => {
    for (let run = 0; run < 20; run += 1) {
      const questions = generateMathPaper(mathQuickConfig)
      const counts = {
        calc: questions.filter(question => question.type === 'calc').length,
        fill: questions.filter(question => question.type === 'fill').length,
        compare: questions.filter(question => question.type === 'compare').length,
      }

      expect(questions).toHaveLength(20)
      expect(counts).toEqual({ calc: 14, fill: 4, compare: 2 })
      expect(new Set(questions.map(question => question.reviewKey)).size).toBe(20)
    }
  })

  it('can reproduce a paper with an injected seeded random source', () => {
    const first = generateMathPaper(mathQuickConfig, createSeededRandom(42))
    const repeated = generateMathPaper(mathQuickConfig, createSeededRandom(42))
    const different = generateMathPaper(mathQuickConfig, createSeededRandom(43))

    expect(first).toEqual(repeated)
    expect(first).not.toEqual(different)
  })

  it('supports a single-type focused configuration', () => {
    const focusedConfig: MathPaperConfig = {
      title: '20 以内加减专项',
      durationSeconds: 3 * 60,
      totalQuestions: 8,
      sections: [
        { type: 'calc', label: '20 以内加减', count: 8 },
      ],
      calcCounts: {
        within20: 8,
        tens: 0,
        chain: 0,
      },
    }
    const questions = generateMathPaper(focusedConfig, createSeededRandom(7))

    expect(questions).toHaveLength(8)
    expect(questions.every(question => question.type === 'calc')).toBe(true)
    expect(questions.every(question => question.sectionLabel === '20 以内加减')).toBe(true)
  })

  it('rejects inconsistent section and subtype counts', () => {
    expect(() => generateMathPaper({
      ...mathQuickConfig,
      totalQuestions: 19,
    })).toThrow('分区题量与总题量不一致')

    expect(() => generateMathPaper({
      ...mathQuickConfig,
      calcCounts: {
        ...mathQuickConfig.calcCounts,
        chain: 2,
      },
    })).toThrow('计算题子类型题量不一致')
  })

  it('normalizes numeric answers before scoring', () => {
    const question = generateMathPaper()[0]
    if (question.type === 'compare') throw new Error('Expected a calculation question')

    const attempt = buildMathAttempt({
      title: '测试',
      mode: 'paper',
      questions: [question],
      answers: { [question.id]: `00${question.correctAnswer}` },
      durationSeconds: 60,
      timeSpentSeconds: 10,
    })

    expect(attempt.correctCount).toBe(1)
  })

  it('builds section statistics from the actual quick paper', () => {
    const questions = generateMathPaper(mathQuickConfig, createSeededRandom(9))
    const answers = Object.fromEntries(
      questions.map(question => [question.id, question.correctAnswer]),
    )
    const attempt = buildMathAttempt({
      title: mathQuickConfig.title,
      mode: 'quick',
      questions,
      answers,
      durationSeconds: mathQuickConfig.durationSeconds,
      timeSpentSeconds: 100,
    })

    expect(attempt.sections.map(section => ({
      type: section.type,
      totalCount: section.totalCount,
    }))).toEqual([
      { type: 'calc', totalCount: 14 },
      { type: 'fill', totalCount: 4 },
      { type: 'compare', totalCount: 2 },
    ])
  })
})
