import type { MathQuestion } from './math'

export const mathSkills = [
  { id: 'addition-basic', title: '百以内不进位加法', group: '百以内加减', difficulty: 1, description: '先算个位，再算十位。', example: '23 + 14：个位 3 + 4 = 7，十位 2 + 1 = 3，合起来是 37。' },
  { id: 'addition-carry', title: '百以内进位加法', group: '百以内加减', difficulty: 2, description: '个位满十，向十位进一。', example: '28 + 15：先算 28 + 2 = 30，再算 30 + 13 = 43。' },
  { id: 'subtraction-basic', title: '百以内不退位减法', group: '百以内加减', difficulty: 1, description: '相同数位对齐，分别相减。', example: '46 − 23：个位 6 − 3 = 3，十位 4 − 2 = 2，结果是 23。' },
  { id: 'subtraction-borrow', title: '百以内退位减法', group: '百以内加减', difficulty: 2, description: '个位不够减，从十位借一个十。', example: '42 − 18：42 拆成 30 和 12，先算 12 − 8 = 4，再算 30 − 10 = 20，合起来是 24。' },
  { id: 'mixed-chain', title: '百以内连加减', group: '百以内加减', difficulty: 3, description: '从左到右，一步一步算。', example: '35 + 12 − 9：先算 35 + 12 = 47，再算 47 − 9 = 38。' },
  { id: 'multiplication-concept', title: '认识几个几', group: '乘法入门', difficulty: 1, description: '数一数每排几个、一共有几排。', example: '每排 3 个，有 2 排，就是 2 个 3：3 + 3 = 6，也可以写成 3 × 2 = 6。' },
  { id: 'multiplication-2-5', title: '2–5 的乘法', group: '表内乘法', difficulty: 2, description: '用相同加数理解已经学过的口诀。', example: '4 × 3 表示 3 个 4 相加：4 + 4 + 4 = 12。' },
  { id: 'multiplication-6-9', title: '6–9 的乘法', group: '表内乘法', difficulty: 3, description: '已经学过相应口诀后再来练习。', example: '7 × 6 可以先算 7 × 5 = 35，再加一个 7，得到 42。' },
] as const

export type MathSkillId = typeof mathSkills[number]['id']
export const DEFAULT_MATH_SKILL_ID: MathSkillId = 'addition-carry'

export function getMathSkill(id: string | null | undefined) {
  return mathSkills.find(skill => skill.id === id) ?? mathSkills[1]
}

export function getFocusedQuestionCount(value: string | number | null | undefined): number {
  const count = Number(value)
  return [6, 8, 10].includes(count) ? count : 8
}

function buildPool(skillId: MathSkillId): MathQuestion[] {
  const skill = getMathSkill(skillId)
  const result: MathQuestion[] = []
  const add = (expression: string, answer: number, explanation: string, visual?: MathQuestion['visual']) => {
    result.push({
      id: `${skillId}-${result.length}`,
      reviewKey: `${skillId}:${expression}`,
      skillId,
      difficulty: skill.difficulty,
      type: 'calc',
      expression,
      prompt: `${expression} =`,
      correctAnswer: String(answer),
      sectionLabel: skill.title,
      explanation,
      ...(visual ? { visual } : {}),
    })
  }

  if (skillId.startsWith('multiplication')) {
    const start = skillId === 'multiplication-6-9' ? 6 : 2
    const end = skillId === 'multiplication-6-9' ? 9 : 5
    for (let columns = start; columns <= end; columns += 1) {
      for (let rows = 2; rows <= (skillId === 'multiplication-concept' ? 5 : end); rows += 1) {
        const explanation = `${rows} 个 ${columns} 相加：${Array(rows).fill(columns).join(' + ')} = ${rows * columns}，所以 ${columns} × ${rows} = ${rows * columns}。`
        if (skillId === 'multiplication-concept') {
          result.push({
            id: `${skillId}-${rows}-${columns}`,
            reviewKey: `${skillId}:${rows}:${columns}`,
            skillId,
            difficulty: 1,
            type: 'fill',
            beforeBlank: `每排 ${columns} 个，有 ${rows} 排，一共有`,
            afterBlank: '个。',
            prompt: `每排 ${columns} 个，有 ${rows} 排，一共有（ ）个。`,
            correctAnswer: String(rows * columns),
            sectionLabel: skill.title,
            visual: { rows, columns },
            explanation,
          })
        } else add(`${columns} × ${rows}`, rows * columns, explanation)
      }
    }
    return result
  }

  for (let a = 11; a <= 99; a += 1) {
    for (let b = 2; b <= 89; b += 1) {
      const sum = a + b
      const carry = a % 10 + b % 10 >= 10
      if (skillId.startsWith('addition') && sum <= (skillId === 'addition-basic' ? 99 : 100) && carry === (skillId === 'addition-carry')) {
        const toTen = 10 - a % 10
        add(`${a} + ${b}`, sum, carry
          ? `把 ${b} 拆成 ${toTen} 和 ${b - toTen}，先算 ${a} + ${toTen} = ${a + toTen}，再加 ${b - toTen}，得到 ${sum}。`
          : `个位 ${a % 10} + ${b % 10} = ${a % 10 + b % 10}，十位 ${Math.floor(a / 10)} + ${Math.floor(b / 10)} = ${Math.floor(a / 10) + Math.floor(b / 10)}，合起来是 ${sum}。`)
      }
      const borrow = a % 10 < b % 10
      if (skillId.startsWith('subtraction') && a > b && borrow === (skillId === 'subtraction-borrow')) {
        add(`${a} − ${b}`, a - b, borrow
          ? `从十位借一个十：个位 ${a % 10 + 10} − ${b % 10} = ${a % 10 + 10 - b % 10}；十位剩下 ${Math.floor(a / 10) - 1}，减 ${Math.floor(b / 10)}，结果是 ${a - b}。`
          : `个位 ${a % 10} − ${b % 10} = ${a % 10 - b % 10}，十位 ${Math.floor(a / 10)} − ${Math.floor(b / 10)} = ${Math.floor(a / 10) - Math.floor(b / 10)}，合起来是 ${a - b}。`)
      }
      if (skillId === 'mixed-chain' && sum <= 100 && b <= 20) {
        const c = sum % Math.min(19, sum - 1) + 1
        add(`${a} + ${b} − ${c}`, sum - c, `从左到右：先算 ${a} + ${b} = ${sum}，再算 ${sum} − ${c} = ${sum - c}。`)
      }
    }
  }
  return result
}

export function generateFocusedQuestions(
  skillId: string,
  count = 8,
  randomSource: () => number = Math.random,
  excludeReviewKeys: string[] = [],
): MathQuestion[] {
  const pool = buildPool(getMathSkill(skillId).id).filter(question => !excludeReviewKeys.includes(question.reviewKey))
  const targetCount = Math.max(1, Math.min(10, Math.floor(count)))
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.min(0.999999999, Math.max(0, randomSource())) * (index + 1))
    ;[pool[index], pool[other]] = [pool[other], pool[index]]
  }
  return pool.slice(0, targetCount).map((question, index) => ({ ...question, id: `focused-${index + 1}` }))
}
