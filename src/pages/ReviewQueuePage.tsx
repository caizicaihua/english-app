import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MasteryBadge from '../components/MasteryBadge'
import { loadWordsByIds, type Word } from '../data/words'
import {
  getActiveDailyQueueWordIds,
  getOrCreateDailyStudyPlan,
  saveDailyStudyPlan,
} from '../utils/studyPlan'
import {
  loadProgress,
  loadSettings,
  saveProgress,
  type ProgressData,
} from '../utils/storage'

interface ReviewQueuePageProps {
  mode: 'review' | 'verification'
}

interface QueueContext {
  progress: ProgressData
  wordIds: string[]
}

function loadQueueContext(mode: ReviewQueuePageProps['mode']): QueueContext {
  const progress = loadProgress()
  const plan = getOrCreateDailyStudyPlan(progress, loadSettings().bridgePlan)
  const storedProgress = progress.dailyPlans[plan.date] === plan
    ? progress
    : saveDailyStudyPlan(progress, plan)

  if (storedProgress !== progress) saveProgress(storedProgress)

  return {
    progress: storedProgress,
    wordIds: getActiveDailyQueueWordIds(storedProgress, plan, mode),
  }
}

export default function ReviewQueuePage({ mode }: ReviewQueuePageProps) {
  const navigate = useNavigate()
  const [context] = useState(() => loadQueueContext(mode))
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const isVerification = mode === 'verification'

  useEffect(() => {
    let active = true

    loadWordsByIds(context.wordIds).then(loadedWords => {
      if (!active) return
      setWords(loadedWords)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [context.wordIds])

  return (
    <div>
      <div className="mb-5 text-center">
        <div className="text-5xl">{isVerification ? '🔎' : '🔁'}</div>
        <h2 className="mt-2 text-2xl font-bold text-gray-800">
          {isVerification ? '弱单元小验证' : '到期与薄弱复习'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {isVerification
            ? '只检查诊断里没有抽到的词，答过以后才更新掌握度。'
            : '一次只安排今天到期或仍需巩固的词，不会把积压全部塞进来。'}
        </p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-400">加载中...</div>
      ) : words.length === 0 ? (
        <div className="rounded-2xl bg-white px-5 py-10 text-center shadow-sm">
          <div className="text-5xl">🎉</div>
          <div className="mt-3 text-lg font-bold text-gray-700">
            {isVerification ? '今天没有待验证单词' : '今天的复习已经完成'}
          </div>
          <button
            type="button"
            onClick={() => navigate('/bridge/today')}
            className="mt-5 rounded-xl bg-primary px-6 py-3 font-bold text-white"
          >
            返回今日任务
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {words.map(word => (
              <div
                key={word.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-3xl">{word.emoji}</span>
                  <div className="min-w-0">
                    <div className="truncate font-bold text-gray-800">{word.en}</div>
                    <div className="text-sm text-gray-400">{word.zh}</div>
                  </div>
                </div>
                <MasteryBadge state={context.progress.wordMastery[word.id]} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(
              isVerification
                ? '/bridge/verification/quiz'
                : '/bridge/review/quiz',
            )}
            className="mt-5 w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-sm active:scale-[0.98]"
          >
            {isVerification ? '开始小验证' : '开始复习'} · {words.length} 题
          </button>
        </>
      )}
    </div>
  )
}
