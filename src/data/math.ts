export type MathQuestionType = 'calc' | 'fill' | 'compare'

export const MATH_SCHEMA_VERSION = 3

export type MathPracticeMode = 'paper' | 'quick' | 'focused' | 'review'
export type ScoredMathMode = Exclude<MathPracticeMode, 'review'>

export interface MathSectionConfig {
  type: MathQuestionType
  label: string
  count: number
}

export interface MathCalcCounts {
  within20: number
  tens: number
  chain: number
}

export interface MathPaperConfig {
  title: string
  durationSeconds: number
  totalQuestions: number
  sections: MathSectionConfig[]
  calcCounts: MathCalcCounts
}

interface MathQuestionBase {
  id: string
  reviewKey: string
  type: MathQuestionType
  prompt: string
  correctAnswer: string
  sectionLabel: string
  skillId?: string
  difficulty?: 1 | 2 | 3
  explanation?: string
  visual?: { rows: number; columns: number }
  sourceReviewKey?: string
}

export interface MathQuestionCalc extends MathQuestionBase {
  type: 'calc'
  expression: string
}

export interface MathQuestionFill extends MathQuestionBase {
  type: 'fill'
  beforeBlank: string
  afterBlank: string
}

export interface MathQuestionCompare extends MathQuestionBase {
  type: 'compare'
  leftText: string
  rightText: string
}

export type MathQuestion = MathQuestionCalc | MathQuestionFill | MathQuestionCompare

export interface MathAttemptQuestionResult {
  question: MathQuestion
  userAnswer: string
  isCorrect: boolean
}

export interface MathSectionResult {
  type: MathQuestionType
  label: string
  correctCount: number
  totalCount: number
}

export interface MathAttempt {
  id: string
  mode: MathPracticeMode
  skillId?: string
  title: string
  completedAt: string
  durationSeconds: number
  timeSpentSeconds: number
  totalCount: number
  correctCount: number
  score: number
  sections: MathSectionResult[]
  questions: MathAttemptQuestionResult[]
}

export interface MathWrongQuestion {
  reviewKey: string
  question: MathQuestion
  lastWrongAt: string
}

export interface MathProgressData {
  schemaVersion: typeof MATH_SCHEMA_VERSION
  modeProgress: Partial<Record<ScoredMathMode, MathModeProgress>>
  skillProgress?: Record<string, MathModeProgress>
  latestAttempt: MathAttempt | null
  attemptHistory: MathAttempt[]
  wrongQuestions: MathWrongQuestion[]
}

export interface MathModeProgress {
  bestScore: number
  lastAttempt: MathAttempt | null
  completedCount: number
}

export const mathPaperConfig: MathPaperConfig = {
  title: '一年级口算比赛',
  durationSeconds: 15 * 60,
  totalQuestions: 100,
  sections: [
    { type: 'calc', label: '一、算一算', count: 70 },
    { type: 'fill', label: '二、填一填', count: 20 },
    { type: 'compare', label: '三、比大小', count: 10 },
  ],
  calcCounts: {
    within20: 35,
    tens: 20,
    chain: 15,
  },
}

export const mathQuickConfig: MathPaperConfig = {
  title: '每日口算快速练',
  durationSeconds: 5 * 60,
  totalQuestions: 20,
  sections: [
    { type: 'calc', label: '一、算一算', count: 14 },
    { type: 'fill', label: '二、填一填', count: 4 },
    { type: 'compare', label: '三、比大小', count: 2 },
  ],
  calcCounts: {
    within20: 7,
    tens: 4,
    chain: 3,
  },
}
