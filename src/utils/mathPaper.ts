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
type MathRandomSource = () => number

interface ExpressionValue {
  text: string
  value: number
}

function randomInt(randomSource: MathRandomSource, min: number, max: number): number {
  if (max < min) throw new Error(`无效随机范围：${min}-${max}`)
  const randomValue = Math.min(0.999999999, Math.max(0, randomSource()))
  return Math.floor(randomValue * (max - min + 1)) + min
}

function sample<T>(items: T[], randomSource: MathRandomSource): T {
  if (items.length === 0) throw new Error('无法从空数组随机取值')
  return items[randomInt(randomSource, 0, items.length - 1)]
}

function shuffle<T>(items: T[], randomSource: MathRandomSource): T[] {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(randomSource, 0, index)
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

function sectionLabelForType(config: MathPaperConfig, type: MathQuestionType): string {
  return config.sections.find(section => section.type === type)?.label ?? ''
}

function sectionCountForType(config: MathPaperConfig, type: MathQuestionType): number {
  return config.sections.find(section => section.type === type)?.count ?? 0
}

function validateMathPaperConfig(config: MathPaperConfig): void {
  const sectionTypes = config.sections.map(section => section.type)
  const sectionTotal = config.sections.reduce((sum, section) => sum + section.count, 0)
  const calcTotal = Object.values(config.calcCounts).reduce((sum, count) => sum + count, 0)

  if (
    !Number.isInteger(config.totalQuestions)
    || config.totalQuestions <= 0
    || !Number.isInteger(config.durationSeconds)
    || config.durationSeconds <= 0
  ) {
    throw new Error('数学试卷配置的题量和时长必须为正整数')
  }

  if (
    config.sections.some(section => !Number.isInteger(section.count) || section.count < 0)
    || new Set(sectionTypes).size !== sectionTypes.length
    || sectionTotal !== config.totalQuestions
  ) {
    throw new Error('数学试卷分区题量与总题量不一致')
  }

  if (
    Object.values(config.calcCounts).some(count => !Number.isInteger(count) || count < 0)
    || calcTotal !== sectionCountForType(config, 'calc')
  ) {
    throw new Error('数学试卷计算题子类型题量不一致')
  }
}

function createCalcQuestion(
  id: string,
  expression: string,
  answer: number,
  sectionLabel: string,
): MathQuestionCalc {
  return {
    id,
    reviewKey: `calc:${expression}`,
    type: 'calc',
    expression,
    prompt: `${expression} =`,
    correctAnswer: String(answer),
    sectionLabel,
  }
}

function createFillQuestion(
  id: string,
  beforeBlank: string,
  afterBlank: string,
  answer: number,
  sectionLabel: string,
): MathQuestionFill {
  return {
    id,
    reviewKey: `fill:${beforeBlank}( )${afterBlank}`,
    type: 'fill',
    beforeBlank,
    afterBlank,
    prompt: `${beforeBlank}( )${afterBlank}`,
    correctAnswer: String(answer),
    sectionLabel,
  }
}

function createCompareQuestion(
  id: string,
  leftText: string,
  rightText: string,
  symbol: CompareSymbol,
  sectionLabel: string,
): MathQuestionCompare {
  return {
    id,
    reviewKey: `compare:${leftText}|${rightText}`,
    type: 'compare',
    leftText,
    rightText,
    prompt: `${leftText} ? ${rightText}`,
    correctAnswer: symbol,
    sectionLabel,
  }
}

function generateSmallCalcExpression(randomSource: MathRandomSource): ExpressionValue {
  const operator = sample(['+', '-'] as const, randomSource)

  if (operator === '+') {
    const left = randomInt(randomSource, 1, 18)
    const right = randomInt(randomSource, 1, 20 - left)
    return {
      text: `${left}+${right}`,
      value: left + right,
    }
  }

  const left = randomInt(randomSource, 2, 20)
  const right = randomInt(randomSource, 1, left)
  return {
    text: `${left}-${right}`,
    value: left - right,
  }
}

function generateTensCalcExpression(randomSource: MathRandomSource): ExpressionValue {
  const template = sample(
    ['tens+tens', 'unit+tens', 'tens-unit', 'number-tens'] as const,
    randomSource,
  )

  if (template === 'tens+tens') {
    const left = randomInt(randomSource, 1, 8) * 10
    const right = randomInt(randomSource, 1, Math.floor((100 - left) / 10)) * 10
    return {
      text: `${left}+${right}`,
      value: left + right,
    }
  }

  if (template === 'unit+tens') {
    const left = randomInt(randomSource, 1, 9)
    const right = randomInt(randomSource, 1, 9) * 10
    return {
      text: `${left}+${right}`,
      value: left + right,
    }
  }

  if (template === 'tens-unit') {
    const left = randomInt(randomSource, 2, 10) * 10
    const right = randomInt(randomSource, 1, 9)
    return {
      text: `${left}-${right}`,
      value: left - right,
    }
  }

  const left = randomInt(randomSource, 2, 9) * 10 + randomInt(randomSource, 0, 9)
  const right = randomInt(randomSource, 1, Math.floor(left / 10)) * 10
  return {
    text: `${left}-${right}`,
    value: left - right,
  }
}

function generateChainCalcExpression(randomSource: MathRandomSource): ExpressionValue {
  const template = sample(
    ['plus-plus', 'plus-minus', 'minus-plus', 'minus-minus'] as const,
    randomSource,
  )

  if (template === 'plus-plus') {
    const first = randomInt(randomSource, 1, 9)
    const second = randomInt(randomSource, 1, 9)
    const third = randomInt(randomSource, 1, Math.max(1, 20 - first - second))
    return {
      text: `${first}+${second}+${third}`,
      value: first + second + third,
    }
  }

  if (template === 'plus-minus') {
    const first = randomInt(randomSource, 5, 14)
    const second = randomInt(randomSource, 1, Math.min(9, 20 - first))
    const third = randomInt(randomSource, 1, first + second)
    return {
      text: `${first}+${second}-${third}`,
      value: first + second - third,
    }
  }

  if (template === 'minus-plus') {
    const first = randomInt(randomSource, 8, 20)
    const second = randomInt(randomSource, 1, first)
    const current = first - second
    const third = randomInt(randomSource, 1, Math.max(1, 20 - current))
    return {
      text: `${first}-${second}+${third}`,
      value: current + third,
    }
  }

  const first = randomInt(randomSource, 10, 20)
  const second = randomInt(randomSource, 1, first - 1)
  const third = randomInt(randomSource, 1, first - second)
  return {
    text: `${first}-${second}-${third}`,
    value: first - second - third,
  }
}

function buildUniqueCalcQuestions(params: {
  count: number
  generator: (randomSource: MathRandomSource) => ExpressionValue
  idPrefix: string
  usedKeys: Set<string>
  sectionLabel: string
  randomSource: MathRandomSource
}): MathQuestionCalc[] {
  const questions: MathQuestionCalc[] = []
  let attempts = 0

  while (questions.length < params.count && attempts < Math.max(100, params.count * 100)) {
    attempts += 1
    const candidate = params.generator(params.randomSource)
    const reviewKey = `calc:${candidate.text}`
    if (params.usedKeys.has(reviewKey)) continue
    params.usedKeys.add(reviewKey)
    questions.push(createCalcQuestion(
      `${params.idPrefix}-${questions.length + 1}`,
      candidate.text,
      candidate.value,
      params.sectionLabel,
    ))
  }

  return questions
}

function generateCalcQuestions(
  config: MathPaperConfig,
  randomSource: MathRandomSource,
): MathQuestionCalc[] {
  const usedKeys = new Set<string>()
  const sectionLabel = sectionLabelForType(config, 'calc')
  const questions = [
    ...buildUniqueCalcQuestions({
      count: config.calcCounts.within20,
      generator: generateSmallCalcExpression,
      idPrefix: 'calc-within20',
      usedKeys,
      sectionLabel,
      randomSource,
    }),
    ...buildUniqueCalcQuestions({
      count: config.calcCounts.tens,
      generator: generateTensCalcExpression,
      idPrefix: 'calc-tens',
      usedKeys,
      sectionLabel,
      randomSource,
    }),
    ...buildUniqueCalcQuestions({
      count: config.calcCounts.chain,
      generator: generateChainCalcExpression,
      idPrefix: 'calc-chain',
      usedKeys,
      sectionLabel,
      randomSource,
    }),
  ]

  return questions.map((question, index) => ({
    ...question,
    id: `calc-${index + 1}`,
  }))
}

function generateFillQuestions(
  config: MathPaperConfig,
  randomSource: MathRandomSource,
): MathQuestionFill[] {
  const count = sectionCountForType(config, 'fill')
  const sectionLabel = sectionLabelForType(config, 'fill')
  const usedKeys = new Set<string>()
  const questions: MathQuestionFill[] = []
  let attempts = 0

  while (questions.length < count && attempts < Math.max(100, count * 100)) {
    attempts += 1
    const template = sample(
      ['blank-plus', 'plus-blank', 'blank-minus', 'minus-blank'] as const,
      randomSource,
    )
    let beforeBlank = ''
    let afterBlank = ''
    let answer = 0

    if (template === 'blank-plus') {
      const blank = randomInt(randomSource, 1, 20)
      const right = randomInt(randomSource, 1, 20)
      afterBlank = ` + ${right} = ${blank + right}`
      answer = blank
    }

    if (template === 'plus-blank') {
      const left = randomInt(randomSource, 1, 20)
      const blank = randomInt(randomSource, 1, 20)
      beforeBlank = `${left} + `
      afterBlank = ` = ${left + blank}`
      answer = blank
    }

    if (template === 'blank-minus') {
      const blank = randomInt(randomSource, 5, 100)
      const right = randomInt(randomSource, 1, Math.min(20, blank))
      afterBlank = ` - ${right} = ${blank - right}`
      answer = blank
    }

    if (template === 'minus-blank') {
      const left = randomInt(randomSource, 5, 100)
      const blank = randomInt(randomSource, 1, Math.min(20, left))
      beforeBlank = `${left} - `
      afterBlank = ` = ${left - blank}`
      answer = blank
    }

    const reviewKey = `fill:${beforeBlank}( )${afterBlank}`
    if (usedKeys.has(reviewKey)) continue
    usedKeys.add(reviewKey)
    questions.push(createFillQuestion(
      `fill-${questions.length + 1}`,
      beforeBlank,
      afterBlank,
      answer,
      sectionLabel,
    ))
  }

  return questions
}

function expressionForValue(value: number, randomSource: MathRandomSource): string {
  if (value <= 20) {
    const template = sample(['plus', 'minus', 'number'] as const, randomSource)

    if (template === 'plus' && value > 1) {
      const left = randomInt(randomSource, 1, value - 1)
      return `${left}+${value - left}`
    }

    if (template === 'minus') {
      const right = randomInt(randomSource, 1, Math.max(1, 20 - value))
      return `${value + right}-${right}`
    }
  }

  if (value % 10 === 0 && value >= 10 && value <= 90) {
    return sample([
      `${value - 10}+10`,
      `${value + 10}-10`,
      `${value}-0`,
    ], randomSource)
  }

  const adjustment = randomInt(randomSource, 1, Math.min(9, 100 - value))
  return `${value + adjustment}-${adjustment}`
}

function compareSideForValue(
  value: number,
  forceExpression: boolean,
  randomSource: MathRandomSource,
): string {
  if (!forceExpression && randomSource() > 0.5) return String(value)
  return expressionForValue(value, randomSource)
}

function generateCompareQuestions(
  config: MathPaperConfig,
  randomSource: MathRandomSource,
): MathQuestionCompare[] {
  const count = sectionCountForType(config, 'compare')
  const sectionLabel = sectionLabelForType(config, 'compare')
  const symbols = shuffle(
    Array.from({ length: count }, (_, index) => (
      ['>', '<', '='] as CompareSymbol[]
    )[index % 3]),
    randomSource,
  )
  const usedKeys = new Set<string>()
  const questions: MathQuestionCompare[] = []
  let attempts = 0

  while (questions.length < count && attempts < Math.max(100, count * 100)) {
    attempts += 1
    const symbol = symbols[questions.length]
    const base = randomInt(randomSource, 4, 90)
    const delta = randomInt(randomSource, 1, 9)
    const leftValue = symbol === '>' ? base + delta : base
    const rightValue = symbol === '<' ? base + delta : base
    if (leftValue > 100 || rightValue > 100) continue

    const caseType = sample(
      ['number-number', 'expression-number', 'expression-expression'] as const,
      randomSource,
    )
    const leftText = compareSideForValue(
      leftValue,
      caseType !== 'number-number',
      randomSource,
    )
    const rightText = compareSideForValue(
      rightValue,
      caseType === 'expression-expression',
      randomSource,
    )
    const reviewKey = `compare:${leftText}|${rightText}`
    if (usedKeys.has(reviewKey)) continue
    usedKeys.add(reviewKey)
    questions.push(createCompareQuestion(
      `compare-${questions.length + 1}`,
      leftText,
      rightText,
      symbol,
      sectionLabel,
    ))
  }

  return questions
}

export function generateMathPaper(
  config: MathPaperConfig = mathPaperConfig,
  randomSource: MathRandomSource = Math.random,
): MathQuestion[] {
  validateMathPaperConfig(config)

  const questions = [
    ...generateCalcQuestions(config, randomSource),
    ...generateFillQuestions(config, randomSource),
    ...generateCompareQuestions(config, randomSource),
  ]

  if (questions.length !== config.totalQuestions) {
    throw new Error('数学试卷题量生成失败')
  }

  return questions
}

function normalizeAnswer(question: MathQuestion, answer: string | undefined): string {
  const trimmed = answer?.trim() ?? ''
  if (!trimmed) return ''
  if (question.type === 'compare') return trimmed
  if (!/^\d+$/.test(trimmed)) return trimmed
  return String(Number(trimmed))
}

export function buildMathAttempt(params: {
  title: string
  mode: MathPracticeMode
  skillId?: string
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
  const sectionTypes = [...new Set(params.questions.map(question => question.type))]
  const sections: MathSectionResult[] = sectionTypes.map(type => {
    const sectionQuestions = questionResults.filter(item => item.question.type === type)
    return {
      type,
      label: sectionQuestions[0]?.question.sectionLabel ?? '',
      correctCount: sectionQuestions.filter(item => item.isCorrect).length,
      totalCount: sectionQuestions.length,
    }
  })
  const correctCount = questionResults.filter(item => item.isCorrect).length

  return {
    id: `attempt-${Date.now()}`,
    mode: params.mode,
    ...(params.skillId ? { skillId: params.skillId } : {}),
    title: params.title,
    completedAt: new Date().toISOString(),
    durationSeconds: params.durationSeconds,
    timeSpentSeconds: Math.max(0, Math.floor(params.durationSeconds > 0
      ? Math.min(params.durationSeconds, params.timeSpentSeconds)
      : params.timeSpentSeconds)),
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
