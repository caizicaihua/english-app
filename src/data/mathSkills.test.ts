import { describe, expect, it } from 'vitest'
import { generateFocusedQuestions, getFocusedQuestionCount, mathSkills } from './mathSkills'

function evaluate(expression: string): number {
  const tokens = expression.split(' ')
  let value = Number(tokens[0])
  for (let index = 1; index < tokens.length; index += 2) {
    const operand = Number(tokens[index + 1])
    if (tokens[index] === '+') value += operand
    else if (tokens[index] === '−') value -= operand
    else value *= operand
  }
  return value
}

describe('focused math skills', () => {
  it('generates complete unique sets with correct answers, labels and explanations', () => {
    for (const skill of mathSkills) {
      for (const randomValue of [0, 0.13, 0.5, 0.999999]) {
        const questions = generateFocusedQuestions(skill.id, 10, () => randomValue)
        expect(questions).toHaveLength(10)
        expect(new Set(questions.map(question => question.reviewKey)).size).toBe(10)
        for (const question of questions) {
          expect(question.skillId).toBe(skill.id)
          expect(question.explanation).toBeTruthy()
          const answer = Number(question.correctAnswer)
          expect(answer).toBeGreaterThanOrEqual(0)
          expect(answer).toBeLessThanOrEqual(100)
          if (question.type === 'calc') expect(answer).toBe(evaluate(question.expression))
          else {
            expect(question.visual).toBeDefined()
            expect(answer).toBe(question.visual!.rows * question.visual!.columns)
          }
        }
      }
    }
  })

  it('keeps carry and borrow practice in the selected layer', () => {
    for (const skillId of ['addition-basic', 'addition-carry', 'subtraction-basic', 'subtraction-borrow']) {
      for (let run = 0; run < 8; run += 1) {
        for (const question of generateFocusedQuestions(skillId, 10)) {
          if (question.type !== 'calc') throw new Error('Expected calculation')
          const [left, , right] = question.expression.split(' ')
          const a = Number(left)
          const b = Number(right)
          if (skillId.startsWith('addition')) expect(a % 10 + b % 10 >= 10).toBe(skillId.endsWith('carry'))
          else expect(a % 10 < b % 10).toBe(skillId.endsWith('borrow'))
        }
      }
    }
  })

  it('excludes carrying from tens into hundreds in the no-carry skill', () => {
    // This seed used to produce 60 + 40 in the no-carry set.
    let seed = 7
    const questions = generateFocusedQuestions('addition-basic', 10, () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    })
    expect(questions.every(question => Number(question.correctAnswer) < 100)).toBe(true)
  })

  it('keeps multiplication within the selected learned factors', () => {
    for (const question of generateFocusedQuestions('multiplication-2-5', 10)) {
      if (question.type !== 'calc') throw new Error('Expected calculation')
      const factors = question.expression.match(/\d+/g)!.map(Number)
      expect(factors.every(value => value >= 2 && value <= 5)).toBe(true)
    }
    for (const question of generateFocusedQuestions('multiplication-concept', 10)) {
      expect(question.visual!.rows).toBeLessThanOrEqual(5)
      expect(question.visual!.columns).toBeLessThanOrEqual(5)
    }
  })

  it('offers a different question for transfer practice even with constant random input', () => {
    const original = generateFocusedQuestions('multiplication-concept', 1, () => 0)[0]
    const alternate = generateFocusedQuestions('multiplication-concept', 1, () => 0, [original.reviewKey])[0]
    expect(alternate.reviewKey).not.toBe(original.reviewKey)
    expect(alternate.skillId).toBe(original.skillId)
  })

  it('accepts only the supported daily counts', () => {
    expect(['6', '8', '10'].map(getFocusedQuestionCount)).toEqual([6, 8, 10])
    expect(getFocusedQuestionCount('-1')).toBe(8)
    expect(getFocusedQuestionCount('1000')).toBe(8)
    expect(getFocusedQuestionCount(null)).toBe(8)
  })
})
