import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  mathPaperConfig,
  type MathPracticeMode,
  type MathQuestion,
  type MathQuestionType,
} from '../data/math'
import { buildMathAttempt, formatCountdown, generateMathPaper } from '../utils/mathPaper'
import {
  addMathWrongQuestions,
  loadMathProgress,
  removeMathWrongQuestions,
  saveMathAttempt,
  saveMathProgress,
} from '../utils/storage'

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

export default function MathPracticePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as PracticeLocationState
  const reviewQuestions = state.reviewQuestions?.length ? state.reviewQuestions : null
  const mode: MathPracticeMode = reviewQuestions ? 'review' : 'paper'
  const title = state.title ?? (mode === 'review' ? '错题重练' : mathPaperConfig.title)
  const [questions] = useState<MathQuestion[]>(() => reviewQuestions ?? generateMathPaper())
  const durationSeconds = mode === 'paper'
    ? mathPaperConfig.durationSeconds
    : getReviewDuration(questions.length)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    questions.find(question => question.type !== 'compare')?.id ?? null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasSubmittedRef = useRef(false)
  const questionRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const sections = useMemo(() => getQuestionSections(questions), [questions])
  const answeredCount = countAnsweredQuestions(questions, answers)
  const activeQuestion = questions.find(question => question.id === activeQuestionId) ?? null
  const isKeypadVisible = !!activeQuestion && activeQuestion.type !== 'compare'

  const handleSubmit = useCallback(() => {
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
    progress = saveMathAttempt(progress, attempt, { updateBestScore: mode === 'paper' })

    const wrongQuestions = attempt.questions
      .filter(item => !item.isCorrect)
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
    navigate('/math/result', { replace: true })
  }, [answers, durationSeconds, mode, navigate, questions, timeLeft, title])

  useEffect(() => {
    if (hasSubmittedRef.current) return
    if (timeLeft <= 0) {
      const timeout = window.setTimeout(() => {
        handleSubmit()
      }, 0)

      return () => window.clearTimeout(timeout)
    }

    const timer = window.setInterval(() => {
      setTimeLeft(current => current - 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [handleSubmit, timeLeft])

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
              当前模式：{mode === 'review' ? '错题重练' : '整卷训练'}
            </div>
            <button
              onClick={handleSubmit}
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
