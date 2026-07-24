import { describe, expect, it } from 'vitest'
import { mathPaperConfig } from '../data/math'
import { buildMathAttempt, generateMathPaper } from './mathPaper'

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
})
