export type MathQuestionType = 'calc' | 'fill' | 'compare'

export type MathPracticeMode = 'paper' | 'review'

export interface MathSectionConfig {
  type: MathQuestionType
  label: string
  count: number
}

export interface MathPaperConfig {
  title: string
  durationSeconds: number
  totalQuestions: number
  sections: MathSectionConfig[]
}

interface MathQuestionBase {
  id: string
  reviewKey: string
  type: MathQuestionType
  prompt: string
  correctAnswer: string
  sectionLabel: string
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
  bestScore: number
  lastAttempt: MathAttempt | null
  latestAttempt: MathAttempt | null
  wrongQuestions: MathWrongQuestion[]
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
}
