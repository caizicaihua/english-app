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
import { generateFocusedQuestions, getFocusedQuestionCount, getMathSkill } from '../data/mathSkills'
import { readMathPracticeClock, type MathPracticeClock } from '../utils/mathPracticeClock'
import {
  addMathWrongQuestions,
  getLocalDateKey,
  loadMathProgress,
  loadProgress,
  removeMathWrongQuestions,
  recordStudyActivity,
  saveMathAttempt,
  saveMathProgress,
  saveProgress,
} from '../utils/storage'
import { completeDailyTask, startDailyTask } from '../utils/studyPlan'
import { getMathDailyTaskCompletionDate, matchesMathDailyTask } from '../utils/mathDailyTask'
import {
  clearMathPracticeDraft,
  getMinimumAnsweredCount,
  loadMathPracticeDraft,
  saveMathPracticeDraft,
  type MathPracticeDraft,
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
  if (queryMode === 'quick' || queryMode === 'review' || queryMode === 'paper' || queryMode === 'focused') {
    return queryMode
  }
  if (state.reviewQuestions?.length || state.mode === 'review') return 'review'
  if (state.mode === 'quick' || state.mode === 'focused') return state.mode
  return 'paper'
}

function MathPracticeSession() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as PracticeLocationState
  const mode = getRequestedMode(location.search, state)
  const query = new URLSearchParams(location.search)
  const skill = getMathSkill(query.get('skill'))
  const questionCount = getFocusedQuestionCount(query.get('count'))
  const scope = mode === 'focused' ? `${skill.id}:${questionCount}` : query.get('reviewId') ?? undefined
  const config = mode === 'quick' ? mathQuickConfig : mathPaperConfig
  const [initialSession] = useState<MathPracticeDraft>(() => {
    const reviewQuestions = mode === 'review'
      ? state.reviewQuestions?.length
        ? state.reviewQuestions
        : loadMathProgress().wrongQuestions.map(item => item.question)
      : null
    const draft = loadMathPracticeDraft(mode, new Date(), undefined, scope, mode === 'review' && !scope ? reviewQuestions ?? undefined : undefined)
    if (draft) return { ...draft, savedAt: new Date().toISOString() }

    const questions = reviewQuestions?.map((question, index) => ({ ...question, id: `review-${index + 1}` })) ?? (mode === 'focused'
      ? generateFocusedQuestions(skill.id, questionCount)
      : generateMathPaper(config))
    const durationSeconds = mode === 'focused' || mode === 'review' ? 0 : config.durationSeconds
    const dateKey = getLocalDateKey()
    const plan = loadProgress().dailyPlans[dateKey]
    const planDate = matchesMathDailyTask({ mode, skillId: mode === 'focused' ? skill.id : undefined, totalCount: questions.length }, plan)
      ? dateKey
      : undefined
    return {
      mode,
      scope,
      ...(planDate ? { planDate } : {}),
      ...(mode === 'focused' ? { skillId: skill.id } : {}),
      title: state.title ?? (mode === 'review' ? '错题重练' : mode === 'focused' ? skill.title : config.title),
      questions,
      durationSeconds,
      answers: {},
      timeLeft: durationSeconds,
      ...(durationSeconds > 0 ? { deadlineAt: Date.now() + durationSeconds * 1000 } : {}),
      elapsedSeconds: 0,
      isPaused: false,
      savedAt: new Date().toISOString(),
    }
  })
  const title = initialSession.title
  const questions = initialSession.questions
  const durationSeconds = initialSession.durationSeconds
  const isTimed = durationSeconds > 0
  const clockRef = useRef<MathPracticeClock>({
    durationSeconds,
    deadlineAt: initialSession.deadlineAt,
    elapsedSeconds: initialSession.elapsedSeconds ?? 0,
    activeSince: initialSession.isPaused ? null : Date.parse(initialSession.savedAt),
  })
  const [answers, setAnswers] = useState<Record<string, string>>(initialSession.answers)
  const [timeLeft, setTimeLeft] = useState(initialSession.timeLeft)
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSession.elapsedSeconds ?? 0)
  const [isPaused, setIsPaused] = useState(initialSession.isPaused ?? false)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    questions.find(question => question.type !== 'compare')?.id ?? null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const hasSubmittedRef = useRef(false)
  const questionRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const sessionHeaderRef = useRef<HTMLDivElement | null>(null)
  const keypadRef = useRef<HTMLDivElement | null>(null)
  const latestDraftRef = useRef(initialSession)

  useEffect(() => {
    const dateKey = initialSession.planDate
    if (!dateKey) return
    const progress = loadProgress()
    if (!matchesMathDailyTask({ mode: initialSession.mode, skillId: initialSession.skillId, totalCount: initialSession.questions.length }, progress.dailyPlans[dateKey])) return
    const started = startDailyTask(progress, dateKey, 'math')
    if (started !== progress) saveProgress(started)
  }, [initialSession])

  const sections = useMemo(() => getQuestionSections(questions), [questions])
  const answeredCount = countAnsweredQuestions(questions, answers)
  const minimumAnsweredCount = getMinimumAnsweredCount(mode, questions.length)
  const qualifiesForDailyCompletion = answeredCount >= minimumAnsweredCount
  const activeQuestion = questions.find(question => question.id === activeQuestionId) ?? null
  const isKeypadVisible = !isPaused && !!activeQuestion && activeQuestion.type !== 'compare'

  const submitAttempt = useCallback(() => {
    if (hasSubmittedRef.current) return
    hasSubmittedRef.current = true
    setIsSubmitting(true)
    const attempt = buildMathAttempt({
      title,
      mode,
      skillId: initialSession.skillId,
      questions,
      answers,
      durationSeconds,
      timeSpentSeconds: readMathPracticeClock(clockRef.current).elapsedSeconds,
    })
    let progress = saveMathAttempt(loadMathProgress(), attempt)
    const wrongQuestions = attempt.questions
      .filter(item => item.userAnswer.trim() !== '' && !item.isCorrect)
      .map(item => item.question)
    if (wrongQuestions.length > 0) {
      progress = addMathWrongQuestions(progress, wrongQuestions, attempt.completedAt)
    }
    if (mode === 'review') {
      const correctedReviewKeys = attempt.questions
        .filter(item => item.isCorrect)
        .flatMap(item => [item.question.reviewKey, ...(item.question.sourceReviewKey ? [item.question.sourceReviewKey] : [])])
      if (correctedReviewKeys.length > 0) progress = removeMathWrongQuestions(progress, correctedReviewKeys)
    }
    saveMathProgress(progress)
    if (answeredCount > 0) {
      let learningProgress = recordStudyActivity(loadProgress())
      const planDate = getMathDailyTaskCompletionDate(attempt, initialSession.planDate, learningProgress.dailyPlans)
      if (planDate) {
        learningProgress = completeDailyTask(learningProgress, planDate, 'math')
      }
      saveProgress(learningProgress)
    }
    clearMathPracticeDraft(undefined, { mode, scope })
    navigate('/math/result', { replace: true })
  }, [answers, answeredCount, durationSeconds, initialSession.planDate, initialSession.skillId, mode, navigate, questions, scope, title])

  const submitRef = useRef(submitAttempt)
  useEffect(() => { submitRef.current = submitAttempt }, [submitAttempt])

  const persistDraft = useCallback(() => {
    if (hasSubmittedRef.current) return
    if (questions.length === 0) {
      clearMathPracticeDraft(undefined, { mode, scope })
      return
    }
    saveMathPracticeDraft({
      ...latestDraftRef.current,
      ...readMathPracticeClock(clockRef.current),
      isPaused: !isTimed,
    })
  }, [isTimed, mode, questions.length, scope])

  useEffect(() => {
    latestDraftRef.current = { ...initialSession, answers, timeLeft, elapsedSeconds, isPaused }
    persistDraft()
  }, [answers, elapsedSeconds, initialSession, isPaused, persistDraft, timeLeft])

  const pauseSession = useCallback(() => {
    if (isTimed) return
    const snapshot = readMathPracticeClock(clockRef.current)
    clockRef.current.elapsedSeconds = snapshot.elapsedSeconds
    clockRef.current.activeSince = null
    setElapsedSeconds(snapshot.elapsedSeconds)
    setIsPaused(true)
    setActiveQuestionId(null)
    persistDraft()
  }, [isTimed, persistDraft])

  const resumeSession = () => {
    clockRef.current.activeSince = Date.now()
    setIsPaused(false)
  }

  useEffect(() => {
    if (questions.length === 0) return
    const tick = () => {
      if (hasSubmittedRef.current) return
      const snapshot = readMathPracticeClock(clockRef.current)
      setTimeLeft(snapshot.timeLeft)
      setElapsedSeconds(snapshot.elapsedSeconds)
      if (isTimed && snapshot.timeLeft <= 0) submitRef.current()
    }
    const timer = window.setInterval(tick, 250)
    const onVisibilityChange = () => {
      if (document.hidden) pauseSession()
      else tick()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', persistDraft)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', persistDraft)
      persistDraft()
    }
  }, [isTimed, pauseSession, persistDraft, questions.length])

  const handleSubmitRequest = () => {
    if (isSubmitting || isPaused) return
    if (answeredCount < questions.length) {
      setActiveQuestionId(null)
      setShowSubmitConfirm(true)
      return
    }
    submitAttempt()
  }

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

  const revealQuestion = useCallback((questionId: string) => {
    const node = questionRefs.current[questionId]
    const header = sessionHeaderRef.current
    const keypad = keypadRef.current
    if (!node || !header || !keypad) return
    // Use actual obstruction bounds after layout/animation, including mobile
    // visual viewport changes. A same-card tap must reveal it again as well.
    const viewport = window.visualViewport
    const viewportBottom = viewport ? viewport.offsetTop + viewport.height : document.documentElement.clientHeight
    const visibleTop = header.getBoundingClientRect().bottom + 12
    const visibleBottom = Math.min(keypad.getBoundingClientRect().top, viewportBottom) - 12
    const bounds = node.getBoundingClientRect()
    const targetTop = visibleTop + Math.max(0, (visibleBottom - visibleTop - bounds.height) / 2)
    window.scrollTo({ top: Math.max(0, window.scrollY + bounds.top - targetTop), behavior: 'instant' })
  }, [])

  useEffect(() => {
    if (!isKeypadVisible || !activeQuestionId) return
    const reveal = () => revealQuestion(activeQuestionId)
    const timeout = window.setTimeout(reveal, 180)
    window.addEventListener('resize', reveal)
    window.visualViewport?.addEventListener('resize', reveal)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('resize', reveal)
      window.visualViewport?.removeEventListener('resize', reveal)
    }
  }, [activeQuestionId, isKeypadVisible, revealQuestion])

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
    <div className={isKeypadVisible ? 'pb-80' : 'pb-6'}>
      <div ref={sessionHeaderRef} className="sticky top-[60px] z-40 mb-4">
        <div className={`rounded-2xl bg-white/95 shadow-md px-4 backdrop-blur-sm ${isKeypadVisible ? 'py-2' : 'py-3'}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-gray-800">{title}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                已答 {answeredCount}/{questions.length}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${isTimed && timeLeft <= 60 ? 'text-red-500' : 'text-primary'}`}>
                {isTimed ? formatCountdown(timeLeft) : '不限时'}
              </div>
              {!isKeypadVisible && <div className="text-[11px] text-gray-400">{isTimed ? '离开页面仍继续计时' : `已练 ${formatCountdown(elapsedSeconds)}`}</div>}
            </div>
          </div>
          <div className={`${isKeypadVisible ? 'mt-2' : 'mt-3'} flex items-center justify-between gap-3`}>
            <div className="text-xs text-gray-400">
              当前模式：{getModeLabel(mode)}
            </div>
            <div className="flex gap-2">
              {!isTimed && <button type="button" onClick={pauseSession} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600">暂停</button>}
            <button
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              完成练习
            </button>
            </div>
          </div>
          {!isKeypadVisible && <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>}
        </div>
      </div>

      {mode === 'focused' && (
        <details className="mb-4 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-800">
          <summary className="cursor-pointer font-bold">先看一个例子 · {skill.title}</summary>
          <p className="mt-2 leading-6">{skill.example}</p>
          <p className="mt-1 text-xs">{skill.description}</p>
        </details>
      )}
      <p className="mb-3 text-xs text-gray-500">{isTimed ? '挑战按固定截止时间计时，结束时自动交卷。' : '可以随时暂停；离开页面或切到后台后，回来继续。'}</p>
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
                    onClick={() => {
                      setActiveQuestionId(question.id)
                      window.requestAnimationFrame(() => revealQuestion(question.id))
                    }}
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

                    {question.visual && (
                      <div className="mb-3 flex flex-col gap-1.5" role="img" aria-label={`${question.visual.rows} 排，每排 ${question.visual.columns} 个圆点`}>
                        {Array.from({ length: question.visual.rows }, (_, row) => (
                          <span key={row} className="flex gap-1.5">
                            {Array.from({ length: question.visual!.columns }, (_, column) => <span key={column} className="h-4 w-4 rounded-full bg-indigo-400" />)}
                          </span>
                        ))}
                      </div>
                    )}
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

      {isPaused && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="text-4xl">🌿</div>
            <h3 className="mt-3 text-lg font-bold text-gray-800">练习已暂停</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">答案已保存在当前标签页，休息时间不计入练习用时。</p>
            <button onClick={resumeSession} className="mt-4 w-full rounded-xl bg-primary py-3 font-bold text-white">继续练习</button>
            <button onClick={() => navigate('/math')} className="mt-2 w-full rounded-xl bg-gray-100 py-3 font-bold text-gray-600">返回数学首页</button>
          </div>
        </div>
      )}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="text-4xl">📝</div>
            <h3 className="mt-3 text-lg font-bold text-gray-800">还有题目没做完</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              还有 {questions.length - answeredCount} 题未作答，现在交卷会按错题计算。
              {(mode === 'quick' || mode === 'focused') && !qualifiesForDailyCompletion
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
          ref={keypadRef}
          onAnimationComplete={() => revealQuestion(activeQuestion.id)}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-20 left-0 right-0 z-50"
        >
          <div className="max-w-lg mx-auto px-4">
            <div className="rounded-2xl bg-white shadow-xl p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-sm font-bold text-gray-800">
                  第 {questions.findIndex(item => item.id === activeQuestion.id) + 1} 题 · 数字输入
                </div>
                <button
                  onClick={() => setActiveQuestionId(null)}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600"
                >
                  收起
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {keypadKeys.map(key => (
                  <button
                    key={key}
                    onClick={() => handleDigitInput(key)}
                    disabled={isSubmitting}
                    className={`h-11 sm:h-12 rounded-lg text-base font-bold transition-all ${
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
