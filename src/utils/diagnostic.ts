import type {
  DiagnosticDraft,
  DiagnosticQuestionPlan,
  DiagnosticResponse,
  DiagnosticResult,
  DiagnosticSectionPlan,
  DiagnosticUnitResult,
} from '../data/bridgePlan'
import type { GradeSummary, Word } from '../data/words'
import { stableHash } from './mastery'

const sectionUnitCounts = [3, 3, 3, 2, 2]

function sortDeterministically<T>(
  items: T[],
  getKey: (item: T) => string,
  seed: string,
): T[] {
  return [...items].sort((first, second) => {
    const firstKey = getKey(first)
    const secondKey = getKey(second)
    const firstHash = stableHash(`${seed}:${firstKey}`)
    const secondHash = stableHash(`${seed}:${secondKey}`)
    return firstHash - secondHash || firstKey.localeCompare(secondKey)
  })
}

function createUnitBaseQuestions(params: {
  diagnosticId: string
  gradeId: number
  unitId: number
  unitIndex: number
  wordIds: string[]
}): DiagnosticQuestionPlan[] {
  const unitKey = `${params.gradeId}-${params.unitId}`
  const selectedWordIds = sortDeterministically(
    params.wordIds,
    wordId => wordId,
    `${params.diagnosticId}:${unitKey}:base`,
  ).slice(0, 2)
  const questionTypes = params.unitIndex % 2 === 0
    ? ['zh2en', 'listen'] as const
    : ['listen', 'zh2en'] as const

  return selectedWordIds.map((wordId, index) => ({
    id: `${params.diagnosticId}:${unitKey}:base-${index + 1}`,
    unitKey,
    wordId,
    questionType: questionTypes[index],
    phase: 'base',
  }))
}

export function createDiagnosticDraft(
  grade: GradeSummary,
  date = new Date(),
  diagnosticId = `diagnostic-${date.getTime()}`,
): DiagnosticDraft {
  let unitOffset = 0
  const sections: DiagnosticSectionPlan[] = sectionUnitCounts.map((unitCount, sectionIndex) => {
    const units = grade.units.slice(unitOffset, unitOffset + unitCount)
    const questions = units.flatMap((unit, index) => createUnitBaseQuestions({
      diagnosticId,
      gradeId: grade.id,
      unitId: unit.id,
      unitIndex: unitOffset + index,
      wordIds: unit.wordIds,
    }))
    unitOffset += unitCount

    return {
      id: `${diagnosticId}:section-${sectionIndex + 1}`,
      unitKeys: units.map(unit => `${grade.id}-${unit.id}`),
      questions,
    }
  })

  return {
    id: diagnosticId,
    startedAt: date.toISOString(),
    currentSection: 0,
    currentQuestionIndex: 0,
    sections,
    responses: [],
  }
}

export function getCurrentDiagnosticQuestion(
  draft: DiagnosticDraft,
): DiagnosticQuestionPlan | null {
  return draft.sections[draft.currentSection]?.questions[draft.currentQuestionIndex] ?? null
}

export function isCurrentDiagnosticSectionComplete(draft: DiagnosticDraft): boolean {
  const section = draft.sections[draft.currentSection]
  return !!section && draft.currentQuestionIndex >= section.questions.length
}

export function isDiagnosticComplete(draft: DiagnosticDraft): boolean {
  return draft.currentSection >= draft.sections.length - 1
    && isCurrentDiagnosticSectionComplete(draft)
}

function addConfirmationQuestion(
  draft: DiagnosticDraft,
  question: DiagnosticQuestionPlan,
  grade: GradeSummary,
): DiagnosticDraft {
  const section = draft.sections[draft.currentSection]
  const alreadyHasConfirmation = section.questions.some(item => (
    item.unitKey === question.unitKey && item.phase === 'confirmation'
  ))
  if (alreadyHasConfirmation) return draft

  const unitId = Number(question.unitKey.split('-')[1])
  const unit = grade.units.find(item => item.id === unitId)
  if (!unit) return draft

  const usedWordIds = new Set(section.questions
    .filter(item => item.unitKey === question.unitKey)
    .map(item => item.wordId))
  const confirmationWordId = sortDeterministically(
    unit.wordIds.filter(wordId => !usedWordIds.has(wordId)),
    wordId => wordId,
    `${draft.id}:${question.unitKey}:confirmation`,
  )[0]
  if (!confirmationWordId) return draft

  const confirmationQuestion: DiagnosticQuestionPlan = {
    id: `${draft.id}:${question.unitKey}:confirmation`,
    unitKey: question.unitKey,
    wordId: confirmationWordId,
    questionType: 'spell',
    phase: 'confirmation',
  }
  const sections = draft.sections.map((item, index) => (
    index === draft.currentSection
      ? { ...item, questions: [...item.questions, confirmationQuestion] }
      : item
  ))

  return { ...draft, sections }
}

export function answerDiagnosticQuestion(params: {
  draft: DiagnosticDraft
  grade: GradeSummary
  isCorrect: boolean
  answeredAt?: Date
}): DiagnosticDraft {
  const question = getCurrentDiagnosticQuestion(params.draft)
  if (!question) return params.draft
  if (params.draft.responses.some(response => response.questionId === question.id)) {
    return params.draft
  }

  const answeredAt = params.answeredAt ?? new Date()
  const response: DiagnosticResponse = {
    questionId: question.id,
    wordId: question.wordId,
    unitKey: question.unitKey,
    questionType: question.questionType,
    isCorrect: params.isCorrect,
    answeredAt: answeredAt.toISOString(),
  }
  const withResponse = {
    ...params.draft,
    responses: [...params.draft.responses, response],
  }
  const withConfirmation = !params.isCorrect && question.phase === 'base'
    ? addConfirmationQuestion(withResponse, question, params.grade)
    : withResponse

  return {
    ...withConfirmation,
    currentQuestionIndex: withConfirmation.currentQuestionIndex + 1,
  }
}

export function advanceDiagnosticSection(draft: DiagnosticDraft): DiagnosticDraft {
  if (!isCurrentDiagnosticSectionComplete(draft) || isDiagnosticComplete(draft)) return draft

  return {
    ...draft,
    currentSection: draft.currentSection + 1,
    currentQuestionIndex: 0,
  }
}

function buildUnitResult(responses: DiagnosticResponse[]): DiagnosticUnitResult {
  const correctCount = responses.filter(response => response.isCorrect).length
  const score = responses.length === 0
    ? 0
    : Math.round((correctCount / responses.length) * 100)
  const status = score >= 85
    ? 'mastered'
    : score >= 60
      ? 'review'
      : 'focus'

  return {
    score,
    status,
    sampledWordIds: [...new Set(responses.map(response => response.wordId))],
  }
}

export function buildDiagnosticResult(
  draft: DiagnosticDraft,
  completedAt = new Date(),
): DiagnosticResult {
  const unitKeys = draft.sections.flatMap(section => section.unitKeys)
  const unitResults = Object.fromEntries(unitKeys.map(unitKey => [
    unitKey,
    buildUnitResult(draft.responses.filter(response => response.unitKey === unitKey)),
  ]))

  return {
    id: draft.id,
    startedAt: draft.startedAt,
    completedAt: completedAt.toISOString(),
    unitResults,
    weakWordIds: [...new Set(draft.responses
      .filter(response => !response.isCorrect)
      .map(response => response.wordId))],
    responses: draft.responses,
  }
}

export function getDiagnosticProgress(draft: DiagnosticDraft): {
  answeredCount: number
  currentSection: number
  sectionCount: number
  currentSectionAnswered: number
  currentSectionTotal: number
} {
  const section = draft.sections[draft.currentSection]
  return {
    answeredCount: draft.responses.length,
    currentSection: draft.currentSection + 1,
    sectionCount: draft.sections.length,
    currentSectionAnswered: Math.min(
      draft.currentQuestionIndex,
      section?.questions.length ?? 0,
    ),
    currentSectionTotal: section?.questions.length ?? 0,
  }
}

export function getDiagnosticChoiceWords(
  question: DiagnosticQuestionPlan,
  allWords: Word[],
): Word[] {
  const correctWord = allWords.find(word => word.id === question.wordId)
  if (!correctWord) return []

  const seenEnglish = new Set([correctWord.en.toLowerCase()])
  const distractors = sortDeterministically(
    allWords.filter(word => word.id !== correctWord.id),
    word => word.id,
    `${question.id}:distractors`,
  ).filter(word => {
    const normalized = word.en.toLowerCase()
    if (seenEnglish.has(normalized)) return false
    seenEnglish.add(normalized)
    return true
  }).slice(0, 3)

  return sortDeterministically(
    [correctWord, ...distractors],
    word => word.id,
    `${question.id}:choices`,
  )
}

export function getDiagnosticOverallScore(result: DiagnosticResult): number {
  if (result.responses.length === 0) return 0
  const correctCount = result.responses.filter(response => response.isCorrect).length
  return Math.round((correctCount / result.responses.length) * 100)
}
