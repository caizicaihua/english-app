import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  mathPaperConfig,
  mathQuickConfig,
  type MathPracticeMode,
  type MathQuestion,
  type MathQuestionType,
} from '../data/math'
import { buildMathAttempt, formatCountdown, generateMathPaper } from '../utils/mathPaper'
import {
  addMathWrongQuestions,
  getLocalDateKey,
  loadMathProgress,
  loadProgress,
  removeMathWrongQuestions,
  saveMathAttempt,
  saveMathProgress,
  saveProgress,
} from '../utils/storage'
import { completeDailyTask } from '../utils/studyPlan'
import {
  clearMathPracticeDraft,
  getMinimumAnsweredCount,
  loadMathPracticeDraft,
  saveMathPracticeDraft,
} from '../utils/mathPracticeDraft'

type PracticeLocationState = {
  reviewQuestions?: MathQuestion[]
  title?: string
  mode?: MathPracticeMode
}

type QuestionSection = {
  type: MathQuestionType
  label: string
  questions: MathQuestion[]
}

const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清空', '0', '退格']

function getReviewDuration(questionCount: number): number {
  return Math.min(mathPaperConfig.durationSeconds, Math.max(3 * 60, questionCount * 45))
}

function getQuestionSections(questions: MathQuestion[]): QuestionSection[] {
  const groups = new Map<string, QuestionSection>()

  questions.forEach(question => {
    const current = groups.get(question.type)
    if (current) {
      current.questions.push(question)
      return
    }

    groups.set(question.type, {
      type: question.type,
      label: question.sectionLabel,
      questions: [question],
    })
  })

  return [...groups.values()]
}

function countAnsweredQuestions(questions: MathQuestion[], answers: Record<string, string>): number {
  return questions.filter(question => (answers[question.id] ?? '').trim() !== '').length
}

function getModeLabel(mode: MathPracticeMode): string {
  if (mode === 'quick') return '每日快速练'
  if (mode === 'review') return '错题重练'
  if (mode === 'focused') return '专项练习'
  return '整卷训练'
}

function getRequestedMode(
  search: string,
  state: PracticeLocationState,
): MathPracticeMode {
  const queryMode = new URLSearchParams(search).get('mode')
  if (queryMode === 'quick' || queryMode === 'review' || queryMode === 'paper') {
    return queryMode
  }
  if (state.reviewQuestions?.length || state.mode === 'review') return 'review'
  if (state.mode === 'quick') return 'quick'
  return 'paper'
}

function MathPracticeSession() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as PracticeLocationState
  const mode = getRequestedMode(location.search, state)
  const config = mode === 'quick' ? mathQuickConfig : mathPaperConfig
  const [initialSession] = useState(() => {
    const draft = loadMathPracticeDraft(mode)
    if (draft) return draft

    const reviewQuestions = mode === 'review'
      ? state.reviewQuestions?.length
        ? state.reviewQuestions
        : loadMathProgress().wrongQuestions.map(item => item.question)
      : null
    const questions = reviewQuestions ?? generateMathPaper(config)
    const durationSeconds = mode === 'review'
      ? getReviewDuration(questions.length)
      : config.durationSeconds

    return {
      mode,
      title: state.title ?? (mode === 'review' ? '错题重练' : config.title),
      questions,
      durationSeconds,
      answers: {} as Record<string, string>,
      timeLeft: durationSeconds,
      savedAt: new Date().toISOString(),
    }
  })
  const title = initialSession.title
  const questions = initialSession.questions
  const durationSeconds = initialSession.durationSeconds
  const [answers, setAnswers] = useState<Record<string, string>>(initialSession.answers)
  const [timeLeft, setTimeLeft] = useState(initialSession.timeLeft)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    questions.find(question => question.type !== 'compare')?.id ?? null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const hasSubmittedRef = useRef(false)
  const questionRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const sections = useMemo(() => getQuestionSections(questions), [questions])
  const answeredCount = countAnsweredQuestions(questions, answers)
  const minimumAnsweredCount = getMinimumAnsweredCount(mode, questions.length)
  const qualifiesForDailyCompletion = answeredCount >= minimumAnsweredCount
  const activeQuestion = questions.find(question => question.id === activeQuestionId) ?? null
  const isKeypadVisible = !!activeQuestion && activeQuestion.type !== 'compare'

  const submitAttempt = useCallback(() => {
    if (hasSubmittedRef.current) return

    hasSubmittedRef.current = true
    setIsSubmitting(true)

    const attempt = buildMathAttempt({
      title,
      mode,
      questions,
      answers,
      durationSeconds,
      timeSpentSeconds: durationSeconds - timeLeft,
    })

    let progress = loadMathProgress()
    progress = saveMathAttempt(progress, attempt)

    const wrongQuestions = attempt.questions
      .filter(item => item.userAnswer.trim() !== '' && !item.isCorrect)
      .map(item => item.question)

    if (wrongQuestions.length > 0) {
      progress = addMathWrongQuestions(progress, wrongQuestions, attempt.completedAt)
    }

    if (mode === 'review') {
      const correctedReviewKeys = attempt.questions
        .filter(item => item.isCorrect)
        .map(item => item.question.reviewKey)

      if (correctedReviewKeys.length > 0) {
        progress = removeMathWrongQuestions(progress, correctedReviewKeys)
      }
    }

    saveMathProgress(progress)
    if (mode === 'quick' && qualifiesForDailyCompletion) {
      const learningProgress = loadProgress()
      const completedProgress = completeDailyTask(
        learningProgress,
        getLocalDateKey(),
        'math',
      )
      if (completedProgress !== learningProgress) saveProgress(completedProgress)
    }
    clearMathPracticeDraft()
    navigate('/math/result', { replace: true })
  }, [
    answers,
    durationSeconds,
    mode,
    navigate,
    qualifiesForDailyCompletion,
    questions,
    timeLeft,
    title,
  ])

  const handleSubmitRequest = () => {
    if (isSubmitting) return
    if (answeredCount < questions.length) {
      setActiveQuestionId(null)
      setShowSubmitConfirm(true)
      return
    }
    submitAttempt()
  }

  useEffect(() => {
    if (hasSubmittedRef.current) return
    if (questions.length === 0) return
    if (timeLeft <= 0) {
      const timeout = window.setTimeout(() => {
        submitAttempt()
      }, 0)

      return () => window.clearTimeout(timeout)
    }

    const timer = window.setInterval(() => {
      setTimeLeft(current => current - 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [questions.length, submitAttempt, timeLeft])

  useEffect(() => {
    if (hasSubmittedRef.current || questions.length === 0) return

    saveMathPracticeDraft({
      mode,
      title,
      questions,
      durationSeconds,
      answers,
      timeLeft,
    })
  }, [answers, durationSeconds, mode, questions, timeLeft, title])

  const handleDigitInput = (value: string) => {
    if (!activeQuestionId) return

    setAnswers(current => {
      const prev = current[activeQuestionId] ?? ''
      if (value === '清空') {
        return { ...current, [activeQuestionId]: '' }
      }

      if (value === '退格') {
        return { ...current, [activeQuestionId]: prev.slice(0, -1) }
      }

      if (prev.length >= 3) return current
      return { ...current, [activeQuestionId]: `${prev}${value}` }
    })
  }

  const handleCompareAnswer = (questionId: string, symbol: string) => {
    setActiveQuestionId(null)
    setAnswers(current => ({ ...current, [questionId]: symbol }))
  }

  useEffect(() => {
    if (!isKeypadVisible || !activeQuestionId) return

    const node = questionRefs.current[activeQuestionId]
    if (!node) return

    const timeout = window.setTimeout(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)

    return () => window.clearTimeout(timeout)
  }, [activeQuestionId, isKeypadVisible])

  if (questions.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-3 text-xl font-bold text-gray-800">现在没有数学错题</h2>
        <button
          type="button"
          onClick={() => navigate('/math/wrong-book')}
          className="mt-5 rounded-xl bg-primary px-6 py-3 font-bold text-white"
        >
          返回数学错题本
        </button>
      </div>
    )
  }

  return (
    <div className={isKeypadVisible ? 'pb-40' : 'pb-6'}>
      <div className="sticky top-[60px] z-40 mb-4">
        <div className="rounded-2xl bg-white/95 shadow-md px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-gray-800">{title}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                已答 {answeredCount}/{questions.length}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${timeLeft <= 60 ? 'text-red-500' : 'text-primary'}`}>
                {formatCountdown(timeLeft)}
              </div>
              <div className="text-[11px] text-gray-400">倒计时</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-xs text-gray-400">
              当前模式：{getModeLabel(mode)}
            </div>
            <button
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              交卷
            </button>
          </div>
          <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map(section => (
          <section key={section.type} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-gray-800">{section.label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{section.questions.length} 题</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.questions.map(question => {
                const globalIndex = questions.findIndex(item => item.id === question.id) + 1
                const value = answers[question.id] ?? ''
                const isActive = question.id === activeQuestionId

                if (question.type === 'compare') {
                  return (
                    <div
                      key={question.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="text-xs font-bold text-gray-400 mb-2">
                        第 {globalIndex} 题
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1 text-right text-base font-bold text-gray-800">
                          {question.leftText}
                        </div>
                        <div className="flex items-center gap-1">
                          {['>', '<', '='].map(symbol => (
                            <button
                              key={symbol}
                              onClick={() => handleCompareAnswer(question.id, symbol)}
                              className={`h-10 w-10 rounded-lg border text-base font-bold transition-all ${
                                value === symbol
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-gray-200 bg-white text-gray-600'
                              }`}
                            >
                              {symbol}
                            </button>
                          ))}
                        </div>
                        <div className="min-w-0 flex-1 text-left text-base font-bold text-gray-800">
                          {question.rightText}
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <button
                    key={question.id}
                    onClick={() => setActiveQuestionId(question.id)}
                    ref={node => {
                      questionRefs.current[question.id] = node
                    }}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      isActive
                        ? 'border-primary bg-indigo-50 shadow-sm'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-400 mb-2">
                      第 {globalIndex} 题
                    </div>

                    {question.type === 'calc' ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-lg font-bold text-gray-800">{question.expression} =</div>
                        <div className="min-w-[72px] rounded-lg bg-white px-3 py-2 text-center text-lg font-bold text-primary shadow-sm">
                          {value || '___'}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 text-base font-bold text-gray-800">
                          {question.beforeBlank}
                          <span className="inline-flex min-w-[56px] justify-center rounded-lg bg-white px-2 py-2 mx-1 text-primary shadow-sm">
                            {value || '___'}
                          </span>
                          {question.afterBlank}
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="text-4xl">📝</div>
            <h3 className="mt-3 text-lg font-bold text-gray-800">还有题目没做完</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              还有 {questions.length - answeredCount} 题未作答，现在交卷会按错题计算。
              {mode === 'quick' && !qualifiesForDailyCompletion
                ? ` 至少完成 ${minimumAnsweredCount} 题才会计入今日任务。`
                : ''}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="rounded-xl bg-gray-100 py-3 font-bold text-gray-600"
              >
                继续答题
              </button>
              <button
                type="button"
                onClick={submitAttempt}
                className="rounded-xl bg-primary py-3 font-bold text-white"
              >
                确认交卷
              </button>
            </div>
          </div>
        </div>
      )}

      {isKeypadVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-20 left-0 right-0 z-50"
        >
          <div className="max-w-lg mx-auto px-4">
            <div className="rounded-2xl bg-white shadow-xl p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-sm font-bold text-gray-800">数字输入区</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    当前：第 {questions.findIndex(item => item.id === activeQuestion.id) + 1} 题
                  </div>
                </div>
                <button
                  onClick={() => setActiveQuestionId(null)}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600"
                >
                  收起
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {keypadKeys.map(key => (
                  <button
                    key={key}
                    onClick={() => handleDigitInput(key)}
                    disabled={isSubmitting}
                    className={`rounded-lg py-3 text-base font-bold transition-all ${
                      key === '清空'
                        ? 'bg-amber-50 text-amber-700'
                        : key === '退格'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-gray-50 text-gray-700'
                    } disabled:opacity-40`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function MathPracticePage() {
  const location = useLocation()
  return <MathPracticeSession key={location.search} />
}
