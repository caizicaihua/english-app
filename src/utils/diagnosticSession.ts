import type { DiagnosticDraft, DiagnosticResult } from '../data/bridgePlan'
import type { GradeSummary } from '../data/words'
import {
  advanceDiagnosticSection,
  answerDiagnosticQuestion,
  buildDiagnosticResult,
  createDiagnosticDraft,
  getCurrentDiagnosticQuestion,
  isDiagnosticComplete,
} from './diagnostic'
import { createUnitFollowUpPlan } from './mastery'
import {
  getLocalDateKey,
  updateWordMastery,
  type ProgressData,
} from './storage'

export function startOrResumeDiagnostic(params: {
  progress: ProgressData
  grade: GradeSummary
  date?: Date
}): { progress: ProgressData; draft: DiagnosticDraft } {
  if (params.progress.diagnosticDraft) {
    return {
      progress: params.progress,
      draft: params.progress.diagnosticDraft,
    }
  }

  const draft = createDiagnosticDraft(params.grade, params.date)
  return {
    progress: {
      ...params.progress,
      diagnosticDraft: draft,
      diagnosticSkippedAt: undefined,
    },
    draft,
  }
}

export function submitDiagnosticAnswer(params: {
  progress: ProgressData
  grade: GradeSummary
  isCorrect: boolean
  answeredAt?: Date
}): ProgressData {
  const draft = params.progress.diagnosticDraft
  if (!draft) return params.progress
  const question = getCurrentDiagnosticQuestion(draft)
  if (!question) return params.progress
  const answeredAt = params.answeredAt ?? new Date()
  const nextDraft = answerDiagnosticQuestion({
    draft,
    grade: params.grade,
    isCorrect: params.isCorrect,
    answeredAt,
  })
  const updated = updateWordMastery(
    params.progress,
    question.wordId,
    params.isCorrect,
    'diagnostic',
    answeredAt,
  )

  return {
    ...updated,
    diagnosticDraft: nextDraft,
  }
}

export function continueDiagnostic(params: {
  progress: ProgressData
}): ProgressData {
  const draft = params.progress.diagnosticDraft
  if (!draft || isDiagnosticComplete(draft)) return params.progress

  return {
    ...params.progress,
    diagnosticDraft: advanceDiagnosticSection(draft),
  }
}

function buildFollowUpPlans(
  result: DiagnosticResult,
  grade: GradeSummary,
  completedAt: Date,
) {
  return Object.entries(result.unitResults).flatMap(([unitKey, unitResult]) => {
    if (unitResult.status === 'mastered') return []
    const unitId = Number(unitKey.split('-')[1])
    const unit = grade.units.find(item => item.id === unitId)
    if (!unit) return []

    return [createUnitFollowUpPlan({
      unitKey,
      sourceDiagnosticId: result.id,
      reason: unitResult.status,
      unitWordIds: unit.wordIds,
      sampledWordIds: unitResult.sampledWordIds,
      createdAt: completedAt,
    })]
  })
}

export function finishDiagnostic(params: {
  progress: ProgressData
  grade: GradeSummary
  completedAt?: Date
}): { progress: ProgressData; result: DiagnosticResult } | null {
  const draft = params.progress.diagnosticDraft
  if (!draft || !isDiagnosticComplete(draft)) return null
  const completedAt = params.completedAt ?? new Date()
  const result = buildDiagnosticResult(draft, completedAt)
  const currentUnitKeys = new Set(Object.keys(result.unitResults))
  const followUpPlans = buildFollowUpPlans(result, params.grade, completedAt)
  const previousResults = params.progress.diagnosticResults
    .filter(item => item.id !== result.id)
  const correctCount = result.responses.filter(response => response.isCorrect).length

  return {
    result,
    progress: {
      ...params.progress,
      diagnosticDraft: null,
      diagnosticSkippedAt: undefined,
      diagnosticResults: [...previousResults, result],
      unitFollowUpPlans: [
        ...params.progress.unitFollowUpPlans
          .filter(plan => !currentUnitKeys.has(plan.unitKey)),
        ...followUpPlans,
      ],
      studySessions: [
        ...params.progress.studySessions,
        {
          id: `session-${result.id}`,
          date: getLocalDateKey(completedAt),
          taskType: 'diagnostic',
          itemCount: result.responses.length,
          correctCount,
          durationSeconds: 0,
        },
      ],
    },
  }
}
