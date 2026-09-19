import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { loadGrade, loadWordsByIds, type Grade } from '../data/words'
import { loadProgress, loadSettings, saveProgress, saveSettings, markWordLearned } from '../utils/storage'
import { cancelSpeech, getExampleSpeechRate, speak, speakDialogue, speechSpeedOptions, type SpeechSpeedPreset } from '../utils/speech'
import MasteryBadge from '../components/MasteryBadge'
import {
  getOrCreateDailyStudyPlan,
  saveDailyStudyPlan,
  startDailyTask,
} from '../utils/studyPlan'
import { completeEnglishDailyTask } from '../utils/englishTaskOwnership'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function containsWord(text: string, answer: string): boolean {
  return new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'i').test(text)
}

interface LearnPageProps {
  practiceMode?: 'daily-new'
}

export default function LearnPage({ practiceMode }: LearnPageProps) {
  const { gradeId, unitId } = useParams()
  const navigate = useNavigate()
  const isDailyNew = practiceMode === 'daily-new'
  const [grade, setGrade] = useState<Grade | null>(null)
  const [loading, setLoading] = useState(true)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [direction, setDirection] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [speechSpeed, setSpeechSpeed] = useState<SpeechSpeedPreset>(() => loadSettings().speechSpeed)
  const taskDateRef = useRef<string | undefined>(undefined)

  const markLearned = useCallback((wordId: string, completesDeck = false) => {
    let updated = markWordLearned(loadProgress(), wordId)

    if (isDailyNew && completesDeck) {
      updated = completeEnglishDailyTask(updated, taskDateRef.current, 'new_words')
    }

    saveProgress(updated)
  }, [isDailyNew])

  const updateSpeechSpeed = (speed: SpeechSpeedPreset) => {
    setSpeechSpeed(speed)
    saveSettings({ ...loadSettings(), speechSpeed: speed })
  }

  useEffect(() => {
    let active = true

    if (isDailyNew) {
      const progress = loadProgress()
      const plan = getOrCreateDailyStudyPlan(progress, loadSettings().bridgePlan)
      taskDateRef.current = plan.date
      let storedProgress = progress.dailyPlans[plan.date] === plan
        ? progress
        : saveDailyStudyPlan(progress, plan)
      if (plan.newWordIds.length > 0) {
        storedProgress = startDailyTask(storedProgress, plan.date, 'new_words')
      }

      if (storedProgress !== progress) saveProgress(storedProgress)

      loadWordsByIds(plan.newWordIds).then(words => {
        if (!active) return
        setCurrentIndex(0)
        setCompleted(false)
        setFlipped(false)
        setGrade({
          id: 0,
          name: 'Today New Words',
          color: '#7c3aed',
          emoji: '🌱',
          units: [{
            id: 0,
            name: 'Today New Words',
            nameZh: '今天的新词',
            words,
          }],
        })
        setLoading(false)
      })

      return () => {
        active = false
        cancelSpeech()
      }
    }

    loadGrade(Number(gradeId)).then(data => {
      if (!active) return
      setCurrentIndex(0)
      setCompleted(false)
      setFlipped(false)
      setGrade(data ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      cancelSpeech()
    }
  }, [gradeId, isDailyNew, unitId])

  const unit = grade?.units.find(u => u.id === (isDailyNew ? 0 : Number(unitId)))

  if (loading) return <div className="text-center py-10 text-gray-400">加载中...</div>

  if (!grade || !unit) return <div className="text-center py-10">未找到该单元</div>

  if (unit.words.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">🌤️</div>
        <h2 className="text-xl font-bold text-gray-800">今天没有新词任务</h2>
        <button
          onClick={() => navigate('/bridge/today')}
          className="mt-5 px-6 py-3 rounded-xl bg-primary text-white font-bold"
        >
          返回今日任务
        </button>
      </div>
    )
  }

  const words = unit.words
  const word = words[currentIndex]
  const wordState = loadProgress().wordMastery[word.id]
  const dialogue = unit.dialogues?.find(item =>
    item.lines.some(line => containsWord(line.en, word.en))
  )

  const goNext = () => {
    cancelSpeech()
    const completesDeck = currentIndex >= words.length - 1
    markLearned(word.id, completesDeck)
    if (completesDeck) {
      setCompleted(true)
      return
    }
    setDirection(1)
    setFlipped(false)
    setCurrentIndex(i => i + 1)
  }

  const goPrev = () => {
    if (currentIndex <= 0) return
    cancelSpeech()
    setDirection(-1)
    setFlipped(false)
    setCurrentIndex(i => i - 1)
  }

  if (completed) {
    return (
      <div className="text-center py-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">学习完成！</h2>
        <p className="text-gray-500 mb-6">
          你已学完「{unit.nameZh}」的 {words.length} 个单词
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(
              isDailyNew
                ? '/bridge/daily-quiz'
                : `/grade/${grade.id}/quiz/${unit.id}`,
            )}
            className="px-6 py-3 rounded-xl text-white font-bold shadow-md active:scale-95 transition-transform"
            style={{ backgroundColor: grade.color }}
          >
            🎯 {isDailyNew ? '做今日小练习' : '去闯关'}
          </button>
          <button
            onClick={() => navigate(isDailyNew ? '/bridge/today' : `/grade/${grade.id}`)}
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold active:scale-95 transition-transform"
          >
            {isDailyNew ? '返回今日任务' : '返回'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold" style={{ color: grade.color }}>
          {unit.nameZh}
        </h2>
        <p className="text-sm text-gray-400">
          {currentIndex + 1} / {words.length}
        </p>
        <div className="mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden max-w-xs mx-auto">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: grade.color }}
            animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-3 max-w-md mx-auto mb-4">
        <div className="text-xs font-bold text-gray-500 mb-2">句子朗读速度</div>
        <div className="grid grid-cols-3 gap-2">
          {speechSpeedOptions.map(option => (
            <button
              key={option.value}
              onClick={() => updateSpeechSpeed(option.value)}
              className={`rounded-xl px-2 py-2 text-xs font-semibold transition-all ${
                speechSpeed === option.value
                  ? 'text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500'
              }`}
              style={speechSpeed === option.value ? { backgroundColor: grade.color } : {}}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-6" style={{ perspective: 800 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -200 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-xs"
          >
            <div
              className="relative cursor-pointer"
              style={{ transformStyle: 'preserve-3d', minHeight: 280 }}
              onClick={() => setFlipped(f => !f)}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-full"
              >
                {/* Front */}
                <div
                  className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    minHeight: 280,
                  }}
                >
                  <div className="text-7xl mb-4">{word.emoji}</div>
                  <div className="text-3xl font-bold text-gray-800">{word.en}</div>
                  <div className="mt-3">
                    <MasteryBadge state={wordState} />
                  </div>
                  <p className="text-xs text-gray-300 mt-4">点击卡片查看释义</p>
                </div>

                {/* Back */}
                <div
                  className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    minHeight: 280,
                  }}
                >
                  <div className="text-7xl mb-4">{word.emoji}</div>
                  <div className="text-2xl font-bold" style={{ color: grade.color }}>
                    {word.zh}
                  </div>
                  <div className="text-lg text-gray-500 mt-2">{word.en}</div>
                  <div className="mt-3">
                    <MasteryBadge state={wordState} />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pronunciation */}
      <div className="flex justify-center mb-6">
        <button
          onClick={(e) => { e.stopPropagation(); speak(word.en) }}
          className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-2xl active:scale-90 transition-transform"
        >
          🔊
        </button>
      </div>

      {word.example && (
        <div className="bg-white rounded-2xl shadow-sm p-4 max-w-md mx-auto mb-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-sm font-bold text-gray-700">📝 例句</div>
            <button
              onClick={() => speak(word.example!.en, getExampleSpeechRate(speechSpeed))}
              className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-base active:scale-90 transition-transform"
            >
              🔊
            </button>
          </div>
          <div className="text-base font-semibold text-gray-800">{word.example.en}</div>
          <div className="text-sm text-gray-500 mt-1">{word.example.zh}</div>
        </div>
      )}

      {dialogue && (
        <div className="bg-white rounded-2xl shadow-sm p-4 max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-bold text-gray-700">💬 情景对话</div>
              <div className="text-xs text-gray-400 mt-0.5">{dialogue.title}</div>
            </div>
            <button
              onClick={() => speakDialogue(dialogue.lines, speechSpeed)}
              className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-base active:scale-90 transition-transform"
            >
              🔊
            </button>
          </div>
          <div className="space-y-2">
            {dialogue.lines.map((line, index) => (
              <div key={`${dialogue.title}-${index}`} className="rounded-xl bg-gray-50 px-3 py-2.5">
                <div className="text-xs font-semibold text-gray-400 mb-1">{line.speaker}</div>
                <div className="text-sm font-semibold text-gray-800">{line.en}</div>
                <div className="text-xs text-gray-500 mt-1">{line.zh}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center max-w-xs mx-auto">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-xl disabled:opacity-30 active:scale-90 transition-transform"
        >
          ◀
        </button>
        <button
          onClick={goNext}
          className="px-8 py-3 rounded-xl text-white font-bold shadow-md active:scale-95 transition-transform"
          style={{ backgroundColor: grade.color }}
        >
          {currentIndex >= words.length - 1 ? '完成 ✅' : '下一个 ▶'}
        </button>
        <div className="w-12" />
      </div>
    </div>
  )
}
