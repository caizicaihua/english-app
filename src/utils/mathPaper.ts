import {
  mathPaperConfig,
  type MathAttempt,
  type MathAttemptQuestionResult,
  type MathPaperConfig,
  type MathPracticeMode,
  type MathQuestion,
  type MathQuestionCalc,
  type MathQuestionCompare,
  type MathQuestionFill,
  type MathQuestionType,
  type MathSectionResult,
} from '../data/math'

type CompareSymbol = '>' | '<' | '='

type ExpressionValue = {
  text: string
  value: number
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sample<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)]
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index)
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

function sectionLabelForType(type: MathQuestionType): string {
  return mathPaperConfig.sections.find(section => section.type === type)?.label ?? ''
}

function formatCalcPrompt(expression: string): string {
  return `${expression} =`
}

function formatFillPrompt(beforeBlank: string, afterBlank: string): string {
  return `${beforeBlank}( )${afterBlank}`
}

function formatComparePrompt(leftText: string, rightText: string): string {
  return `${leftText} ? ${rightText}`
}

function createCalcQuestion(id: string, expression: string, answer: number): MathQuestionCalc {
  return {
    id,
    reviewKey: `calc:${expression}`,
    type: 'calc',
    expression,
    prompt: formatCalcPrompt(expression),
    correctAnswer: String(answer),
    sectionLabel: sectionLabelForType('calc'),
  }
}

function createFillQuestion(
  id: string,
  beforeBlank: string,
  afterBlank: string,
  answer: number
): MathQuestionFill {
  return {
    id,
    reviewKey: `fill:${beforeBlank}( )${afterBlank}`,
    type: 'fill',
    beforeBlank,
    afterBlank,
    prompt: formatFillPrompt(beforeBlank, afterBlank),
    correctAnswer: String(answer),
    sectionLabel: sectionLabelForType('fill'),
  }
}

function createCompareQuestion(
  id: string,
  leftText: string,
  rightText: string,
  symbol: CompareSymbol
): MathQuestionCompare {
  return {
    id,
    reviewKey: `compare:${leftText}|${rightText}`,
    type: 'compare',
    leftText,
    rightText,
    prompt: formatComparePrompt(leftText, rightText),
    correctAnswer: symbol,
    sectionLabel: sectionLabelForType('compare'),
  }
}

function generateSmallCalcExpression(): ExpressionValue {
  const operator = sample(['+', '-'] as const)

  if (operator === '+') {
    const left = randomInt(1, 18)
    const right = randomInt(1, 20 - left)
    return {
      text: `${left}+${right}`,
      value: left + right,
    }
  }

  const left = randomInt(2, 20)
  const right = randomInt(1, left)
  return {
    text: `${left}-${right}`,
    value: left - right,
  }
}

function generateTensCalcExpression(): ExpressionValue {
  const templates = ['tens+tens', 'unit+tens', 'tens-unit', 'number-tens'] as const
  const template = sample([...templates])

  if (template === 'tens+tens') {
    const left = randomInt(1, 8) * 10
    const right = randomInt(1, Math.floor((100 - left) / 10)) * 10
    return {
      text: `${left}+${right}`,
      value: left + right,
    }
  }

  if (template === 'unit+tens') {
    const left = randomInt(1, 9)
    const right = randomInt(1, 9) * 10
    if (left + right > 100) return generateTensCalcExpression()
    return {
      text: `${left}+${right}`,
      value: left + right,
    }
  }

  if (template === 'tens-unit') {
    const left = randomInt(2, 10) * 10
    const right = randomInt(1, 9)
    if (left - right < 0) return generateTensCalcExpression()
    return {
      text: `${left}-${right}`,
      value: left - right,
    }
  }

  const left = randomInt(2, 10) * 10 + randomInt(0, 9)
  const maxTens = Math.floor(left / 10)
  const right = randomInt(1, maxTens) * 10
  return {
    text: `${left}-${right}`,
    value: left - right,
  }
}

function generateChainCalcExpression(): ExpressionValue {
  const template = sample(['plus-plus', 'plus-minus', 'minus-plus', 'minus-minus'] as const)

  if (template === 'plus-plus') {
    const first = randomInt(1, 9)
    const second = randomInt(1, 9)
    const third = randomInt(1, Math.max(1, 20 - first - second))
    return {
      text: `${first}+${second}+${third}`,
      value: first + second + third,
    }
  }

  if (template === 'plus-minus') {
    const first = randomInt(5, 14)
    const second = randomInt(1, Math.min(9, 20 - first))
    const third = randomInt(1, first + second)
    return {
      text: `${first}+${second}-${third}`,
      value: first + second - third,
    }
  }

  if (template === 'minus-plus') {
    const first = randomInt(8, 20)
    const second = randomInt(1, first)
    const current = first - second
    const third = randomInt(1, Math.max(1, 20 - current))
    return {
      text: `${first}-${second}+${third}`,
      value: current + third,
    }
  }

  const first = randomInt(10, 20)
  const second = randomInt(1, first - 1)
  const third = randomInt(1, first - second)
  return {
    text: `${first}-${second}-${third}`,
    value: first - second - third,
  }
}

function buildUniqueQuestions(
  count: number,
  type: MathQuestionType,
  generator: () => ExpressionValue,
  idPrefix: string,
  usedKeys: Set<string>
): MathQuestion[] {
  const questions: MathQuestion[] = []
  let attempts = 0

  while (questions.length < count && attempts < count * 50) {
    attempts += 1
    const candidate = generator()
    const reviewKey = `calc:${candidate.text}`
    if (usedKeys.has(reviewKey)) continue
    usedKeys.add(reviewKey)
    questions.push(createCalcQuestion(`${idPrefix}-${questions.length + 1}`, candidate.text, candidate.value))
  }

  if (questions.length !== count || type !== 'calc') {
    return questions
  }

  return questions
}

function generateCalcQuestions(): MathQuestionCalc[] {
  const usedKeys = new Set<string>()
  const questions = [
    ...buildUniqueQuestions(35, 'calc', generateSmallCalcExpression, 'calc-small', usedKeys),
    ...buildUniqueQuestions(20, 'calc', generateTensCalcExpression, 'calc-tens', usedKeys),
    ...buildUniqueQuestions(15, 'calc', generateChainCalcExpression, 'calc-chain', usedKeys),
  ]

  return questions.map((question, index) => ({
    ...(question as MathQuestionCalc),
    id: `calc-${index + 1}`,
  }))
}

function generateFillQuestions(): MathQuestionFill[] {
  const usedKeys = new Set<string>()
  const questions: MathQuestionFill[] = []
  let attempts = 0

  while (questions.length < 20 && attempts < 1000) {
    attempts += 1
    const template = sample(['blank-plus', 'plus-blank', 'blank-minus', 'minus-blank'] as const)
    let beforeBlank = ''
    let afterBlank = ''
    let answer = 0

    if (template === 'blank-plus') {
      const blank = randomInt(1, 20)
      const right = randomInt(1, 20)
      beforeBlank = ''
      afterBlank = ` + ${right} = ${blank + right}`
      answer = blank
    }

    if (template === 'plus-blank') {
      const left = randomInt(1, 20)
      const blank = randomInt(1, 20)
      beforeBlank = `${left} + `
      afterBlank = ` = ${left + blank}`
      answer = blank
    }

    if (template === 'blank-minus') {
      const blank = randomInt(5, 100)
      const right = randomInt(1, Math.min(20, blank))
      beforeBlank = ''
      afterBlank = ` - ${right} = ${blank - right}`
      answer = blank
    }

    if (template === 'minus-blank') {
      const left = randomInt(5, 100)
      const blank = randomInt(1, Math.min(20, left))
      beforeBlank = `${left} - `
      afterBlank = ` = ${left - blank}`
      answer = blank
    }

    const reviewKey = `fill:${beforeBlank}( )${afterBlank}`
    if (usedKeys.has(reviewKey)) continue
    usedKeys.add(reviewKey)
    questions.push(createFillQuestion(`fill-${questions.length + 1}`, beforeBlank, afterBlank, answer))
  }

  return questions
}

function expressionForValue(value: number): string {
  if (value <= 20) {
    const template = sample(['plus', 'minus', 'number'] as const)

    if (template === 'plus' && value > 1) {
      const left = randomInt(1, value - 1)
      const right = value - left
      return `${left}+${right}`
    }

    if (template === 'minus') {
      const right = randomInt(1, Math.max(1, 20 - value))
      const left = value + right
      return `${left}-${right}`
    }
  }

  if (value % 10 === 0 && value >= 10 && value <= 90) {
    return sample([
      `${value - 10}+10`,
      `${value + 10}-10`,
      `${value / 10 - 1}0+10`,
    ])
  }

  const adjustment = randomInt(1, Math.min(9, 100 - value))
  if (value + adjustment <= 100) {
    return `${value + adjustment}-${adjustment}`
  }

  const addend = randomInt(1, Math.min(9, value - 1))
  return `${value - addend}+${addend}`
}

function compareSideForValue(value: number, forceExpression: boolean): string {
  if (!forceExpression && Math.random() > 0.5) {
    return String(value)
  }
  return expressionForValue(value)
}

function generateCompareQuestions(): MathQuestionCompare[] {
  const symbols = shuffle(['>', '>', '>', '>', '<', '<', '<', '=', '=', '='] as CompareSymbol[])
  const usedKeys = new Set<string>()
  const questions: MathQuestionCompare[] = []
  let attempts = 0

  while (questions.length < 10 && attempts < 1000) {
    attempts += 1
    const symbol = symbols[questions.length]
    const base = randomInt(4, 90)
    const delta = randomInt(1, 9)
    const leftValue = symbol === '>'
      ? base + delta
      : symbol === '<'
        ? base
        : base
    const rightValue = symbol === '>'
      ? base
      : symbol === '<'
        ? base + delta
        : base

    if (leftValue > 100 || rightValue > 100) continue

    const caseType = sample(['number-number', 'expression-number', 'expression-expression'] as const)
    const leftText = compareSideForValue(leftValue, caseType !== 'number-number')
    const rightText = compareSideForValue(rightValue, caseType === 'expression-expression')
    const reviewKey = `compare:${leftText}|${rightText}`

    if (usedKeys.has(reviewKey)) continue
    usedKeys.add(reviewKey)
    questions.push(createCompareQuestion(`compare-${questions.length + 1}`, leftText, rightText, symbol))
  }

  return questions
}

export function generateMathPaper(config: MathPaperConfig = mathPaperConfig): MathQuestion[] {
  const calcQuestions = generateCalcQuestions()
  const fillQuestions = generateFillQuestions()
  const compareQuestions = generateCompareQuestions()

  const questions = [...calcQuestions, ...fillQuestions, ...compareQuestions]

  if (questions.length !== config.totalQuestions) {
    throw new Error('数学试卷题量生成失败')
  }

  return questions
}

function normalizeAnswer(question: MathQuestion, answer: string | undefined): string {
  const trimmed = answer?.trim() ?? ''
  if (!trimmed) return ''

  if (question.type === 'compare') {
    return trimmed
  }

  if (!/^\d+$/.test(trimmed)) return trimmed
  return String(Number(trimmed))
}

export function buildMathAttempt(params: {
  title: string
  mode: MathPracticeMode
  questions: MathQuestion[]
  answers: Record<string, string>
  durationSeconds: number
  timeSpentSeconds: number
}): MathAttempt {
  const questionResults: MathAttemptQuestionResult[] = params.questions.map(question => {
    const userAnswer = normalizeAnswer(question, params.answers[question.id])
    return {
      question,
      userAnswer,
      isCorrect: userAnswer === question.correctAnswer,
    }
  })

  const sections: MathSectionResult[] = mathPaperConfig.sections.map(section => {
    const sectionQuestions = questionResults.filter(item => item.question.type === section.type)
    return {
      type: section.type,
      label: section.label,
      correctCount: sectionQuestions.filter(item => item.isCorrect).length,
      totalCount: sectionQuestions.length,
    }
  })

  const correctCount = questionResults.filter(item => item.isCorrect).length

  return {
    id: `attempt-${Date.now()}`,
    mode: params.mode,
    title: params.title,
    completedAt: new Date().toISOString(),
    durationSeconds: params.durationSeconds,
    timeSpentSeconds: Math.max(0, Math.min(params.durationSeconds, params.timeSpentSeconds)),
    totalCount: params.questions.length,
    correctCount,
    score: correctCount,
    sections,
    questions: questionResults,
  }
}

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0')
  const seconds = (safeSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}
