import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { loadGrade, loadWordsByIds, type Grade, type Unit, type Word } from '../data/words'
import {
  generateQuestions,
  generateWordCheckQuestions,
  createSpellingKeyboard,
  shuffle,
  type Question,
} from '../utils/quiz'
import { applyQuizAnswer, type QuizProgressSource } from '../utils/quizProgress'
import {
  loadProgress,
  loadSettings,
  saveProgress,
  completeUnit,
  getLocalDateKey,
  recordStudyActivity,
} from '../utils/storage'
import {
  getActiveDailyQueueWordIds,
  getDailyQuizWordIds,
  getOrCreateDailyStudyPlan,
  saveDailyStudyPlan,
  startDailyTask,
} from '../utils/studyPlan'
import { completeEnglishDailyTask } from '../utils/englishTaskOwnership'
import type { DailyTaskId, StudyTaskType } from '../data/bridgePlan'
import { isSpeechAvailable, speak } from '../utils/speech'
import StarRating from '../components/StarRating'

// --- Sub Components ---

function ChoiceQuestion({ question, onAnswer, gradeColor }: {
  question: Question; onAnswer: (correct: boolean, wrongWordIds?: string[], usedReadingFallback?: boolean) => void; gradeColor: string
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [readingFallback, setReadingFallback] = useState(() => question.type === 'listen' && !isSpeechAvailable())
  const [audioReady, setAudioReady] = useState(false)
  const playback = useRef<(() => void) | undefined>(undefined)
  const answerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const play = useCallback(() => {
    playback.current = speak(question.word.en, 0.8, {
      onEnd: () => setAudioReady(true),
      onUnavailable: () => setReadingFallback(true),
    })
  }, [question.word.en])

  useEffect(() => {
    if (question.type === 'listen') play()
    return () => {
      playback.current?.()
      clearTimeout(answerTimer.current)
    }
  }, [question.type, play])

  const handleSelect = (opt: string) => {
    if (answered || (question.type === 'listen' && !readingFallback && !audioReady)) return
    setSelected(opt)
    setAnswered(true)
    const isCorrect = opt === question.correctAnswer
    answerTimer.current = setTimeout(() => onAnswer(isCorrect, undefined, readingFallback), 800)
  }

  return (
    <div>
      <div className="text-center mb-6">
        {question.type === 'zh2en' ? (
          <>
            <div className="text-5xl mb-3">{question.word.emoji}</div>
            <div className="text-xl font-bold text-gray-800">{question.word.zh}</div>
            <p className="text-sm text-gray-400 mt-1">选出对应的英文单词</p>
          </>
        ) : question.type === 'sentence' ? (
          <>
            <div className="text-5xl mb-3">📝</div>
            <div className="bg-white rounded-2xl shadow-sm p-4 max-w-sm mx-auto text-left">
              <div className="text-base font-bold text-gray-800">{question.sentencePrompt!.en}</div>
              <div className="text-sm text-gray-500 mt-2">{question.sentencePrompt!.zh}</div>
            </div>
            <p className="text-sm text-gray-400 mt-3">根据例句，选出正确的单词</p>
          </>
        ) : question.type === 'dialogue' ? (
          <>
            <div className="text-5xl mb-3">💬</div>
            <div className="bg-white rounded-2xl shadow-sm p-4 max-w-sm mx-auto text-left">
              <div className="text-sm font-bold text-gray-700 mb-3">{question.dialoguePrompt!.title}</div>
              <div className="space-y-2">
                {question.dialoguePrompt!.lines.map((line, index) => (
                  <div key={`${question.word.id}-${index}`} className="rounded-xl bg-gray-50 px-3 py-2.5">
                    <div className="text-xs font-semibold text-gray-400 mb-1">{line.speaker}</div>
                    <div className="text-sm font-semibold text-gray-800">{line.en}</div>
                    <div className="text-xs text-gray-500 mt-1">{line.zh}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">根据对话，选出缺少的单词</p>
          </>
        ) : question.type === 'listen' ? (
          <>
            <div className="text-5xl mb-3">🎧</div>
            <p className="text-sm text-gray-500 mt-1">{readingFallback ? '已改为阅读题：根据中文选单词，本题只记录阅读' : '听发音，选出正确的单词'}</p>
            {readingFallback ? (
              <p className="mt-3 text-xl font-bold text-gray-800">{question.word.zh}</p>
            ) : <button
              onClick={play}
              disabled={answered}
              aria-label="重新播放单词"
              className="mt-3 w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mx-auto active:scale-90 transition-transform"
            >
              🔊
            </button>}
            {!readingFallback && !answered && (
              <button onClick={() => { playback.current?.(); setReadingFallback(true) }} className="mt-3 text-sm text-orange-700 underline">
                没有声音？改做阅读题
              </button>
            )}
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">❓</div>
          </>
        )}
      </div>
      <div className="space-y-3 max-w-xs mx-auto">
        {question.options!.map(opt => {
          let bg = 'bg-white'
          let border = 'border-gray-200'
          if (answered) {
            if (opt === question.correctAnswer) { bg = 'bg-green-50'; border = 'border-green-400' }
            else if (opt === selected) { bg = 'bg-red-50'; border = 'border-red-400' }
          } else if (opt === selected) {
            border = `border-[${gradeColor}]`
          }
          return (
            <motion.button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={answered || (question.type === 'listen' && !readingFallback && !audioReady)}
              animate={answered && opt === selected && opt !== question.correctAnswer ? { x: [0, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-full py-3 px-4 rounded-xl border-2 ${border} ${bg} text-lg font-semibold text-gray-700 active:scale-[0.97] transition-all`}
            >
              {opt}
              {answered && opt === question.correctAnswer && ' ✅'}
              {answered && opt === selected && opt !== question.correctAnswer && ' ❌'}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function MatchQuestion({ question, onAnswer, gradeColor }: {
  question: Question
  onAnswer: (correct: boolean, wrongWordIds?: string[]) => void
  gradeColor: string
}) {
  const words = question.matchWords!
  const shuffledZh = useMemo(() => shuffle(words), [words])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const mistakenWordIds = useRef(new Set<string>())
  const answerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => {
    clearTimeout(answerTimer.current)
    clearTimeout(feedbackTimer.current)
  }, [])

  const handleLeftClick = (id: string) => {
    if (matched.has(id) || wrongPair) return
    setSelectedLeft(id)
    setWrongPair(null)
  }

  const handleRightClick = (id: string) => {
    if (!selectedLeft || matched.has(id) || wrongPair) return
    if (selectedLeft === id) {
      const newMatched = new Set(matched)
      newMatched.add(id)
      setMatched(newMatched)
      setSelectedLeft(null)
      if (newMatched.size === words.length) {
        answerTimer.current = setTimeout(() => onAnswer(mistakes === 0, [...mistakenWordIds.current]), 500)
      }
    } else {
      mistakenWordIds.current.add(selectedLeft)
      mistakenWordIds.current.add(id)
      setWrongPair(id)
      setMistakes(m => m + 1)
      feedbackTimer.current = setTimeout(() => { setWrongPair(null); setSelectedLeft(null) }, 600)
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">🔗</div>
        <p className="text-sm text-gray-400">点击左右两侧进行配对</p>
      </div>
      <div className="flex gap-4 max-w-sm mx-auto">
        <div className="flex-1 space-y-2">
          {words.map(w => (
            <motion.button
              key={w.id}
              onClick={() => handleLeftClick(w.id)}
              disabled={matched.has(w.id) || !!wrongPair}
              animate={wrongPair && selectedLeft === w.id ? { x: [0, -5, 5, -3, 3, 0] } : {}}
              className={`w-full py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                matched.has(w.id)
                  ? 'bg-green-50 border-green-300 text-green-600 opacity-60'
                  : selectedLeft === w.id
                    ? 'border-2 bg-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-700'
              }`}
              style={selectedLeft === w.id && !matched.has(w.id) ? { borderColor: gradeColor } : {}}
            >
              {w.en}
            </motion.button>
          ))}
        </div>
        <div className="flex-1 space-y-2">
          {shuffledZh.map(w => (
            <motion.button
              key={w.id}
              onClick={() => handleRightClick(w.id)}
              disabled={matched.has(w.id) || !!wrongPair}
              animate={wrongPair === w.id ? { x: [0, -5, 5, -3, 3, 0] } : {}}
              className={`w-full py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                matched.has(w.id)
                  ? 'bg-green-50 border-green-300 text-green-600 opacity-60'
                  : wrongPair === w.id
                    ? 'bg-red-50 border-red-400'
                    : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              {w.emoji} {w.zh}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SpellQuestion({ question, onAnswer, gradeColor }: {
  question: Question; onAnswer: (correct: boolean) => void; gradeColor: string
}) {
  const { word, hiddenIndices } = question
  const letters = word.en.split('')
  const [filled, setFilled] = useState<Record<number, string>>({})
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const [keyboardLetters] = useState(() => (
    question.keyboardLetters ?? createSpellingKeyboard(letters, hiddenIndices!)
  ))
  const answerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(answerTimer.current), [])

  const currentSlot = hiddenIndices!.find(i => filled[i] === undefined)

  const handleLetterClick = (letter: string) => {
    if (answered || currentSlot === undefined) return
    const newFilled = { ...filled, [currentSlot]: letter }
    setFilled(newFilled)

    const allFilled = hiddenIndices!.every(i => newFilled[i] !== undefined)
    if (allFilled) {
      const result = letters.map((l, i) => hiddenIndices!.includes(i) ? newFilled[i] : l).join('')
      const correct = result === word.en
      setIsCorrect(correct)
      setAnswered(true)
      answerTimer.current = setTimeout(() => onAnswer(correct), 800)
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{word.emoji}</div>
        <div className="text-xl font-bold text-gray-800">{word.zh}</div>
        <p className="text-sm text-gray-400 mt-1">填入缺少的字母</p>
      </div>

      <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-8 max-w-lg mx-auto" aria-label="待拼写单词">
        {letters.map((l, i) => {
          const isHidden = hiddenIndices!.includes(i)
          const filledLetter = filled[i]
          if (l === ' ') return <span key={i} className="w-3" aria-label="空格" />
          let borderColor = 'border-gray-300'
          if (answered && isHidden) {
            borderColor = filledLetter === l ? 'border-green-400' : 'border-red-400'
          } else if (isHidden && currentSlot === i) {
            borderColor = ''
          }
          return (
            <motion.div
              key={i}
              animate={answered && isHidden && filledLetter !== l ? { x: [0, -4, 4, -2, 2, 0] } : {}}
              className={`w-8 sm:w-10 h-11 shrink-0 rounded-lg border-2 ${borderColor} flex items-center justify-center text-xl font-bold ${
                isHidden
                  ? filledLetter
                    ? answered
                      ? filledLetter === l ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      : 'bg-white text-gray-800'
                    : 'bg-gray-50'
                  : 'bg-white text-gray-800 border-transparent'
              }`}
              style={isHidden && currentSlot === i && !answered ? { borderColor: gradeColor } : {}}
            >
              {isHidden ? (filledLetter || '') : l}
            </motion.div>
          )
        })}
      </div>

      {answered && (
        <div className="text-center mb-4">
          <span className={`text-sm font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? '正确! ✅' : `正确答案: ${word.en}`}
          </span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
        {keyboardLetters.map((l, i) => (
          <button
            key={`${l}-${i}`}
            onClick={() => handleLetterClick(l)}
            disabled={answered}
            className="w-10 h-10 rounded-lg bg-white shadow text-lg font-bold text-gray-700 active:scale-90 transition-transform disabled:opacity-40"
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

// --- Result Screen ---

function ResultScreen({
  score,
  total,
  correctCount,
  stars,
  gradeColor,
  title = '闯关完成！',
  onRetry,
  onBack,
}: {
  score: number
  total: number
  correctCount: number
  stars: number
  gradeColor: string
  title?: string
  onRetry?: () => void
  onBack: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-6xl mb-4"
      >
        {stars >= 3 ? '🏆' : stars >= 2 ? '🎉' : stars >= 1 ? '👍' : '💪'}
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <div className="text-4xl font-bold mb-2" style={{ color: gradeColor }}>
        {score} 分
      </div>
      <div className="mb-4">
        <StarRating stars={stars} size="text-2xl" />
      </div>
      <div className="text-gray-500 mb-6">
        答对 <span className="text-green-500 font-bold">{correctCount}</span> 题，
        答错 <span className="text-red-500 font-bold">{total - correctCount}</span> 题
      </div>
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-xl text-white font-bold shadow-md active:scale-95 transition-transform"
            style={{ backgroundColor: gradeColor }}
          >
            🔄 再来一次
          </button>
        )}
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold active:scale-95 transition-transform"
        >
          返回
        </button>
      </div>
    </motion.div>
  )
}

// --- Main Quiz Page ---

interface QuizPageProps {
  practiceMode?: 'wrong-book' | 'daily-review' | 'verification' | 'daily-quiz'
}

interface PracticeConfig {
  name: string
  nameZh: string
  color: string
  emoji: string
  emptyTitle: string
  resultTitle: string
  backPath: string
  source: QuizProgressSource
  dailyTaskId?: DailyTaskId
  studyTaskType: StudyTaskType
}

const practiceConfigs: Record<NonNullable<QuizPageProps['practiceMode']>, PracticeConfig> = {
  'wrong-book': {
    name: 'Wrong Book Review',
    nameZh: '错题重练',
    color: '#6366f1',
    emoji: '📕',
    emptyTitle: '错题本已经清空',
    resultTitle: '错题重练完成！',
    backPath: '/wrong-book',
    source: 'review',
    studyTaskType: 'review',
  },
  'daily-review': {
    name: 'Daily Review',
    nameZh: '到期与薄弱复习',
    color: '#0f9f6e',
    emoji: '🔁',
    emptyTitle: '今天的复习已经完成',
    resultTitle: '今日复习完成！',
    backPath: '/bridge/review',
    source: 'review',
    dailyTaskId: 'review',
    studyTaskType: 'review',
  },
  verification: {
    name: 'Unit Verification',
    nameZh: '弱单元小验证',
    color: '#d97706',
    emoji: '🔎',
    emptyTitle: '今天没有待验证单词',
    resultTitle: '小验证完成！',
    backPath: '/bridge/verification',
    source: 'unit_verification',
    dailyTaskId: 'verification',
    studyTaskType: 'verification',
  },
  'daily-quiz': {
    name: 'Daily Quiz',
    nameZh: '英语小练习',
    color: '#7c3aed',
    emoji: '🎯',
    emptyTitle: '今天没有需要练习的单词',
    resultTitle: '今日英语练习完成！',
    backPath: '/bridge/today',
    source: 'quiz',
    dailyTaskId: 'quiz',
    studyTaskType: 'quiz',
  },
}

function getPracticeWordIds(
  practiceMode: NonNullable<QuizPageProps['practiceMode']>,
): { wordIds: string[]; taskDate?: string } {
  const progress = loadProgress()
  if (practiceMode === 'wrong-book') return { wordIds: progress.wrongWords }

  const plan = getOrCreateDailyStudyPlan(progress, loadSettings().bridgePlan)
  const wordIds = practiceMode === 'daily-quiz' ? getDailyQuizWordIds(plan) : getActiveDailyQueueWordIds(
    progress, plan, practiceMode === 'daily-review' ? 'review' : 'verification',
  )
  let updated = progress.dailyPlans[plan.date] === plan ? progress : saveDailyStudyPlan(progress, plan)
  const taskId = practiceConfigs[practiceMode].dailyTaskId
  if (wordIds.length > 0 && taskId) updated = startDailyTask(updated, plan.date, taskId)
  if (updated !== progress) saveProgress(updated)
  return { wordIds, taskDate: plan.date }
}

export default function QuizPage({ practiceMode }: QuizPageProps) {
  const { gradeId, unitId } = useParams()
  const navigate = useNavigate()
  const practiceConfig = practiceMode ? practiceConfigs[practiceMode] : null
  const [grade, setGrade] = useState<Grade | null>(null)
  const [reviewPool, setReviewPool] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [retryKey, setRetryKey] = useState(0)
  const [currentQ, setCurrentQ] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<{
    score: number
    stars: number
    correctCount: number
  } | null>(null)
  const quizStartedAt = useRef(0)
  const taskDateRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    let active = true
    quizStartedAt.current = Date.now()

    if (practiceMode && practiceConfig) {
      const { wordIds, taskDate } = getPracticeWordIds(practiceMode)
      taskDateRef.current = taskDate
      const relevantGradeIds = [...new Set(wordIds.map(wordId => Number(wordId.split('-')[0])))]
        .filter(grade => Number.isInteger(grade) && grade >= 1 && grade <= 6)

      Promise.all([
        loadWordsByIds(wordIds),
        Promise.all(relevantGradeIds.map(id => loadGrade(id))),
      ]).then(([practiceWords, loadedGrades]) => {
        if (!active) return
        setCurrentQ(0)
        setCorrectCount(0)
        setFinished(false)
        setResult(null)

        const reviewUnit: Unit = {
          id: 0,
          name: practiceConfig.name,
          nameZh: practiceConfig.nameZh,
          words: practiceWords,
        }

        setGrade({
          id: 0,
          name: practiceConfig.nameZh,
          color: practiceConfig.color,
          emoji: practiceConfig.emoji,
          units: [reviewUnit],
        })
        setReviewPool(loadedGrades.flatMap(item => item?.units.flatMap(unit => unit.words) ?? []))
        setLoading(false)
      })

      return () => {
        active = false
      }
    }

    loadGrade(Number(gradeId)).then(data => {
      if (!active) return
      setCurrentQ(0)
      setCorrectCount(0)
      setFinished(false)
      setResult(null)
      setGrade(data ?? null)
      setReviewPool([])
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [gradeId, practiceConfig, practiceMode, unitId])

  const unit = grade?.units.find(u => u.id === (practiceMode ? 0 : Number(unitId)))

  const allGradeWords = useMemo(
    () => practiceMode ? reviewPool : grade?.units.flatMap(u => u.words) ?? [],
    [grade, practiceMode, reviewPool]
  )

  const questions = useMemo(
    () => {
      void retryKey
      if (!unit) return []
      return practiceMode === 'daily-review'
        || practiceMode === 'verification'
        || practiceMode === 'daily-quiz'
        ? generateWordCheckQuestions(unit.words, allGradeWords)
        : generateQuestions(unit, allGradeWords)
    },
    [unit, allGradeWords, practiceMode, retryKey]
  )
  const handleAnswer = useCallback((correct: boolean, wrongWordIds?: string[], usedReadingFallback = false) => {
    const nextCorrectCount = correct ? correctCount + 1 : correctCount
    const q = questions[currentQ]
    const sessionId = `quiz-${quizStartedAt.current}-r${retryKey}`
    let progress = applyQuizAnswer({
      progress: loadProgress(),
      question: q,
      isCorrect: correct,
      wrongWordIds,
      source: practiceConfig?.source ?? 'quiz',
      usedReadingFallback,
      evidenceId: `${sessionId}-q${currentQ}`,
    })
    setCorrectCount(nextCorrectCount)

    if (currentQ >= questions.length - 1) {
      const nextScore = Math.round((nextCorrectCount / questions.length) * 100)
      const stars = nextScore >= 100 ? 3 : nextScore >= 80 ? 2 : nextScore >= 60 ? 1 : 0
      const completedAt = new Date()
      progress = recordStudyActivity(progress, completedAt)
      if (!practiceMode && stars > 0 && grade && unit) {
        progress = completeUnit(progress, grade.id, unit.id, stars)
      }
      if (practiceConfig?.dailyTaskId) {
        progress = completeEnglishDailyTask(
          progress,
          taskDateRef.current,
          practiceConfig.dailyTaskId,
        )
      }
      progress = {
        ...progress,
        studySessions: [
          ...progress.studySessions,
          {
            id: sessionId,
            date: getLocalDateKey(completedAt),
            taskType: practiceConfig?.studyTaskType ?? 'quiz',
            itemCount: questions.length,
            correctCount: nextCorrectCount,
            durationSeconds: Math.max(
              0,
              Math.round((completedAt.getTime() - quizStartedAt.current) / 1000),
            ),
          },
        ],
      }
      saveProgress(progress)

      setResult({ score: nextScore, stars, correctCount: nextCorrectCount })
      setFinished(true)
      return
    }
    saveProgress(progress)
    setCurrentQ(q => q + 1)
  }, [
    correctCount,
    currentQ,
    grade,
    practiceConfig,
    practiceMode,
    questions,
    unit,
    retryKey,
  ])

  const handleRetry = () => {
    if (!unit) return
    setRetryKey(key => key + 1)
    setCurrentQ(0)
    setCorrectCount(0)
    setFinished(false)
    setResult(null)
    quizStartedAt.current = Date.now()
  }

  if (loading) return <div className="text-center py-10 text-gray-400">加载中...</div>

  if (!grade || !unit) return <div className="text-center py-10">未找到该单元</div>

  if (practiceMode && unit.words.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">{practiceConfig?.emptyTitle}</h2>
        <button
          onClick={() => navigate(practiceConfig?.backPath ?? '/bridge/today')}
          className="mt-5 px-6 py-3 rounded-xl bg-primary text-white font-bold"
        >
          {practiceMode === 'wrong-book' ? '返回错题本' : '返回今日任务'}
        </button>
      </div>
    )
  }

  if (questions.length === 0) return <div className="text-center py-10 text-gray-400">正在生成题目...</div>

  if (finished && result) {
    return (
      <ResultScreen
        score={result.score}
        total={questions.length}
        correctCount={result.correctCount}
        stars={result.stars}
        gradeColor={grade.color}
        title={practiceConfig?.resultTitle ?? '闯关完成！'}
        onRetry={practiceConfig?.dailyTaskId ? undefined : handleRetry}
        onBack={() => navigate(practiceConfig?.backPath ?? `/grade/${grade.id}`)}
      />
    )
  }

  const q = questions[currentQ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">
          第 {currentQ + 1} / {questions.length} 题
        </span>
        <span className="text-sm font-bold" style={{ color: grade.color }}>
          已答对 {correctCount} 题
        </span>
      </div>
      <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden mb-6">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: grade.color }}
          animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          {(q.type === 'zh2en' || q.type === 'listen' || q.type === 'sentence' || q.type === 'dialogue') && (
            <ChoiceQuestion question={q} onAnswer={handleAnswer} gradeColor={grade.color} />
          )}
          {q.type === 'match' && (
            <MatchQuestion question={q} onAnswer={handleAnswer} gradeColor={grade.color} />
          )}
          {q.type === 'spell' && (
            <SpellQuestion question={q} onAnswer={handleAnswer} gradeColor={grade.color} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
