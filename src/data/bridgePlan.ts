export const PROGRESS_SCHEMA_VERSION = 4
export const SETTINGS_SCHEMA_VERSION = 2

export type MasteryLevel = 0 | 1 | 2 | 3 | 4

export type WordLearningSource =
  | 'learn'
  | 'quiz'
  | 'review'
  | 'diagnostic'
  | 'unit_verification'

export interface WordPrioritySignals {
  legacyWrong?: boolean
  lastWrongAt?: string
  lastDiagnosticWeakAt?: string
}

export interface WordLearningState {
  level: MasteryLevel
  correctStreak: number
  wrongCount: number
  firstSeenAt?: string
  lastReviewedAt?: string
  lastMasteredAt?: string
  nextReviewDate?: string
  lastCountedCorrectDate?: string
  prioritySignals: WordPrioritySignals
}

export interface UnitFollowUpPlan {
  unitKey: string
  sourceDiagnosticId: string
  reason: 'review' | 'focus'
  candidateWordIds: string[]
  pendingWordIds: string[]
  assessedWordIds: string[]
  correctCount: number
  createdAt: string
  completedAt?: string
}

export interface BridgePlanSettings {
  enabled: boolean
  startDate: string
  studyDaysPerWeek: 3 | 4 | 5
  dailyMinutes: 10 | 15 | 20
  focus: 'balanced' | 'english' | 'math'
  previewGrade2: boolean
  mode?: 'semester' | 'bridge'
  gradeId?: number
  semester?: 'upper' | 'lower'
  englishUnitId?: number
  mathSkillId?: string
  textbook?: { english: string; math: string; edition: string }
}

export type DiagnosticQuestionType = 'zh2en' | 'listen' | 'spell'

export interface DiagnosticQuestionPlan {
  id: string
  unitKey: string
  wordId: string
  questionType: DiagnosticQuestionType
  phase: 'base' | 'confirmation'
}

export interface DiagnosticSectionPlan {
  id: string
  unitKeys: string[]
  questions: DiagnosticQuestionPlan[]
}

export interface DiagnosticResponse {
  questionId: string
  wordId: string
  unitKey: string
  questionType: DiagnosticQuestionType
  isCorrect: boolean
  answeredAt: string
}

export interface DiagnosticUnitResult {
  score: number
  status: 'mastered' | 'review' | 'focus'
  sampledWordIds: string[]
}

export interface DiagnosticResult {
  id: string
  startedAt: string
  completedAt: string
  unitResults: Record<string, DiagnosticUnitResult>
  weakWordIds: string[]
  responses: DiagnosticResponse[]
}

export interface DiagnosticDraft {
  id: string
  startedAt: string
  currentSection: number
  currentQuestionIndex: number
  sections: DiagnosticSectionPlan[]
  responses: DiagnosticResponse[]
}

export type StudyTaskType =
  | 'review'
  | 'verification'
  | 'new_words'
  | 'quiz'
  | 'diagnostic'
  | 'math'

export interface StudySession {
  id: string
  date: string
  taskType: StudyTaskType
  itemCount: number
  correctCount: number
  durationSeconds: number
}

export type DailyTaskId =
  | 'diagnostic'
  | 'review'
  | 'verification'
  | 'new_words'
  | 'quiz'
  | 'math'
  | 'english_activity'

export interface DailyStudyPlan {
  date: string
  settingsSignature: string
  reviewWordIds: string[]
  verificationWordIds: string[]
  newWordIds: string[]
  includeDiagnostic: boolean
  quizQuestionCount: number
  includeMath: boolean
  completedTaskIds: DailyTaskId[]
  generatedAt: string
  status?: 'study' | 'rest' | 'not-started' | 'ended' | 'disabled'
  mathSkillId?: string
  mathQuestionCount?: number
  englishActivityId?: string
  startedAt?: string
}

export const defaultBridgePlanSettings: BridgePlanSettings = {
  enabled: false,
  startDate: '',
  studyDaysPerWeek: 5,
  dailyMinutes: 15,
  focus: 'balanced',
  previewGrade2: true,
  mode: 'semester',
  gradeId: 2,
  semester: 'upper',
  englishUnitId: 1,
  mathSkillId: 'addition-carry',
  textbook: { english: '', math: '', edition: '' },
}
