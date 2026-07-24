import { describe, expect, it } from 'vitest'
import { gradeCatalog } from '../data/words'
import {
  advanceDiagnosticSection,
  answerDiagnosticQuestion,
  buildDiagnosticResult,
  createDiagnosticDraft,
  getCurrentDiagnosticQuestion,
  isCurrentDiagnosticSectionComplete,
  isDiagnosticComplete,
} from './diagnostic'
import {
  finishDiagnostic,
  startOrResumeDiagnostic,
  submitDiagnosticAnswer,
} from './diagnosticSession'
import { normalizeProgressData } from './storage'

const grade1 = gradeCatalog.find(grade => grade.id === 1)!

function answerWholeDiagnostic(
  answer: (questionId: string) => boolean,
) {
  let draft = createDiagnosticDraft(
    grade1,
    new Date(2026, 6, 24, 9),
    'diagnostic-test',
  )

  while (!isDiagnosticComplete(draft)) {
    const question = getCurrentDiagnosticQuestion(draft)
    if (!question) {
      draft = advanceDiagnosticSection(draft)
      continue
    }

    draft = answerDiagnosticQuestion({
      draft,
      grade: grade1,
      isCorrect: answer(question.id),
      answeredAt: new Date(2026, 6, 24, 10),
    })

    if (isCurrentDiagnosticSectionComplete(draft) && !isDiagnosticComplete(draft)) {
      draft = advanceDiagnosticSection(draft)
    }
  }

  return draft
}

describe('segmented diagnostic engine', () => {
  it('creates five resumable sections with 26 unique base questions', () => {
    const draft = createDiagnosticDraft(
      grade1,
      new Date(2026, 6, 24, 9),
      'diagnostic-test',
    )
    const questions = draft.sections.flatMap(section => section.questions)

    expect(draft.sections).toHaveLength(5)
    expect(draft.sections.map(section => section.unitKeys.length)).toEqual([3, 3, 3, 2, 2])
    expect(questions).toHaveLength(26)
    expect(new Set(questions.map(question => question.wordId)).size).toBe(26)
    expect(questions.every(question => question.phase === 'base')).toBe(true)
  })

  it('adds at most one spelling confirmation per weak unit', () => {
    let draft = createDiagnosticDraft(
      grade1,
      new Date(2026, 6, 24, 9),
      'diagnostic-test',
    )
    const firstQuestion = getCurrentDiagnosticQuestion(draft)!
    draft = answerDiagnosticQuestion({
      draft,
      grade: grade1,
      isCorrect: false,
      answeredAt: new Date(2026, 6, 24, 10),
    })
    const secondQuestion = getCurrentDiagnosticQuestion(draft)!
    draft = answerDiagnosticQuestion({
      draft,
      grade: grade1,
      isCorrect: false,
      answeredAt: new Date(2026, 6, 24, 10, 1),
    })
    const confirmations = draft.sections[0].questions.filter(question => (
      question.unitKey === firstQuestion.unitKey && question.phase === 'confirmation'
    ))

    expect(secondQuestion.unitKey).toBe(firstQuestion.unitKey)
    expect(confirmations).toHaveLength(1)
    expect(confirmations[0].questionType).toBe('spell')
    expect(confirmations[0].wordId).not.toBe(firstQuestion.wordId)
    expect(confirmations[0].wordId).not.toBe(secondQuestion.wordId)
  })

  it('stays between 26 and 39 questions and produces unit scores', () => {
    const allCorrect = answerWholeDiagnostic(() => true)
    const allWrong = answerWholeDiagnostic(() => false)
    const allCorrectResult = buildDiagnosticResult(allCorrect)
    const allWrongResult = buildDiagnosticResult(allWrong)

    expect(allCorrect.responses).toHaveLength(26)
    expect(allWrong.responses).toHaveLength(39)
    expect(Object.values(allCorrectResult.unitResults)
      .every(result => result.status === 'mastered')).toBe(true)
    expect(Object.values(allWrongResult.unitResults)
      .every(result => result.status === 'focus')).toBe(true)
    expect(allWrongResult.weakWordIds).toHaveLength(39)
  })
})

describe('diagnostic progress integration', () => {
  it('saves draft progress and keeps diagnostic errors out of the ordinary wrong book', () => {
    const initial = normalizeProgressData(undefined)
    const started = startOrResumeDiagnostic({
      progress: initial,
      grade: grade1,
      date: new Date(2026, 6, 24, 9),
    })
    const question = getCurrentDiagnosticQuestion(started.draft)!
    const answered = submitDiagnosticAnswer({
      progress: started.progress,
      grade: grade1,
      isCorrect: false,
      answeredAt: new Date(2026, 6, 24, 10),
    })

    expect(answered.diagnosticDraft?.responses).toHaveLength(1)
    expect(answered.wrongWords).toEqual([])
    expect(answered.wordMastery[question.wordId]).toMatchObject({
      level: 1,
      wrongCount: 1,
    })
    expect(
      answered.wordMastery[question.wordId].prioritySignals.lastDiagnosticWeakAt,
    ).toBeTruthy()
  })

  it('creates immutable results and follow-up plans when completed', () => {
    const completedDraft = answerWholeDiagnostic(questionId => (
      !questionId.includes('1-1:base-1')
    ))
    const progress = {
      ...normalizeProgressData(undefined),
      diagnosticDraft: completedDraft,
    }
    const finished = finishDiagnostic({
      progress,
      grade: grade1,
      completedAt: new Date(2026, 6, 25, 9),
    })

    expect(finished).not.toBeNull()
    expect(finished!.progress.diagnosticDraft).toBeNull()
    expect(finished!.progress.diagnosticResults).toHaveLength(1)
    expect(finished!.progress.unitFollowUpPlans.some(plan => plan.unitKey === '1-1')).toBe(true)
    expect(finished!.progress.studySessions[0]).toMatchObject({
      taskType: 'diagnostic',
      itemCount: completedDraft.responses.length,
    })
  })
})
