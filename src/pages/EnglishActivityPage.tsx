import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEnglishActivity, type EnglishActivity } from '../data/englishActivities'
import { recordEnglishEvidence } from '../utils/englishEvidence'
import {
  applyEnglishActivityAnswer, clearEnglishActivityDraft, createEnglishActivityDraft,
  loadEnglishActivityDraft, saveEnglishActivityDraft,
  type EnglishActivityAnswer, type EnglishActivityDraft,
} from '../utils/englishActivityDraft'
import { isSpeechAvailable, speak } from '../utils/speech'
import { getLocalDateKey, loadProgress, recordStudyActivity, saveProgress } from '../utils/storage'
import { startDailyTask } from '../utils/studyPlan'
import { completeEnglishDailyTask } from '../utils/englishTaskOwnership'

function ActivityQuestion({ question, options, answer, onSelect, onDone }: {
  question: EnglishActivity['questions'][number]
  options: string[]
  answer: EnglishActivityAnswer | undefined
  onSelect: (selectedAnswer: string, skill: EnglishActivityAnswer['skill']) => void
  onDone: () => void
}) {
  const [readingFallback, setReadingFallback] = useState(() => question.type === 'listen' && (answer ? answer.skill === 'reading' : !isSpeechAvailable()))
  const [audioReady, setAudioReady] = useState(!!answer)
  const selected = answer?.selectedAnswer ?? null
  const playback = useRef<(() => void) | undefined>(undefined)
  useEffect(() => () => playback.current?.(), [])

  const play = () => {
    playback.current = speak(question.prompt, 0.72, {
      onEnd: () => setAudioReady(true),
      onUnavailable: () => setReadingFallback(true),
    })
  }
  const ready = question.type === 'reply' || readingFallback || audioReady
  const skill = question.type === 'listen' && !readingFallback ? 'listening' : 'reading'

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm text-center">
        <p className="mb-3 text-sm font-bold text-orange-700">{question.type === 'reply' ? '给问句找回答' : readingFallback ? '阅读短句' : '听懂一句话'}</p>
        {question.type === 'reply' || readingFallback ? (
          <p className="text-xl font-bold text-gray-800">{question.prompt}</p>
        ) : (
          <button onClick={play} disabled={selected !== null} className="rounded-xl bg-orange-50 px-5 py-3 text-orange-800 font-bold">🔊 {audioReady ? '再听一次' : '播放句子'}</button>
        )}
        {readingFallback && <p role="status" className="mt-3 text-xs text-gray-500">已改为阅读题，只记录阅读练习；没有声音不会记作答错。</p>}
        {question.type === 'listen' && !readingFallback && selected === null && (
          <button onClick={() => { playback.current?.(); setReadingFallback(true) }} className="block mx-auto mt-3 text-sm text-gray-500 underline">没有声音？改做阅读题</button>
        )}
      </div>
      {options.map(option => (
        <button
          key={option}
          disabled={!ready || selected !== null}
          onClick={() => onSelect(option, skill)}
          className={`w-full rounded-xl border-2 p-4 text-left font-semibold disabled:cursor-default ${selected !== null && option === question.correctAnswer ? 'border-green-400 bg-green-50 text-green-800' : selected === option ? 'border-orange-300 bg-orange-50 text-orange-800' : 'border-gray-100 bg-white text-gray-800'} ${!ready ? 'opacity-50' : ''}`}
        >
          {option}
        </button>
      ))}
      {!ready && <p className="text-center text-sm text-gray-500">先听完句子，再选答案。</p>}
      {selected !== null && (
        <div className="rounded-2xl bg-white p-4" role="status">
          <p className="font-bold text-gray-800">{selected === question.correctAnswer ? '答对了！' : `再读一读：${question.correctAnswer}`}</p>
          <p className="mt-2 text-sm text-gray-600">{question.prompt} — {question.translation}</p>
          <button onClick={onDone} className="mt-4 w-full rounded-xl bg-orange-500 py-3 font-bold text-white">继续</button>
        </div>
      )}
    </div>
  )
}

function ActivitySession({ activity }: { activity: EnglishActivity }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => {
    const restored = loadEnglishActivityDraft(activity)
    if (restored) return restored
    const now = new Date()
    const dateKey = getLocalDateKey(now)
    const taskDate = loadProgress().dailyPlans[dateKey]?.englishActivityId === activity.id ? dateKey : null
    return createEnglishActivityDraft(activity, now, taskDate)
  })
  const draftRef = useRef(draft)
  const elapsedRef = useRef(draft.elapsedSeconds)
  const activeSinceRef = useRef<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [oralResult, setOralResult] = useState<boolean | null>(null)
  const completed = useRef(false)
  const question = activity.questions[draft.currentIndex]
  const correctCount = draft.answers.filter(answer => (
    activity.questions.find(item => item.id === answer.questionId)?.correctAnswer === answer.selectedAnswer
  )).length

  const currentElapsed = () => elapsedRef.current + (
    activeSinceRef.current === null ? 0 : Math.max(0, (Date.now() - activeSinceRef.current) / 1000)
  )

  useEffect(() => {
    activeSinceRef.current = document.hidden ? null : Date.now()
    saveEnglishActivityDraft(draftRef.current)
    const progress = loadProgress()
    const taskDate = draftRef.current.taskDate
    if (taskDate && progress.dailyPlans[taskDate]?.englishActivityId === activity.id) {
      saveProgress(startDailyTask(progress, taskDate, 'english_activity'))
    }
    const persistTime = () => {
      if (completed.current) return
      const elapsed = elapsedRef.current + (activeSinceRef.current === null ? 0 : Math.max(0, (Date.now() - activeSinceRef.current) / 1000))
      elapsedRef.current = elapsed
      activeSinceRef.current = null
      draftRef.current = { ...draftRef.current, elapsedSeconds: elapsed }
      saveEnglishActivityDraft(draftRef.current)
    }
    const onVisibilityChange = () => {
      if (document.hidden) persistTime()
      else activeSinceRef.current = Date.now()
    }
    window.addEventListener('pagehide', persistTime)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('pagehide', persistTime)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      persistTime()
    }
  }, [activity.id])

  const persistDraft = (next: EnglishActivityDraft) => {
    const updated = { ...next, elapsedSeconds: currentElapsed() }
    draftRef.current = updated
    saveEnglishActivityDraft(updated)
    setDraft(updated)
  }

  const answer = (selectedAnswer: string, skill: EnglishActivityAnswer['skill']) => {
    const result = applyEnglishActivityAnswer(loadProgress(), draftRef.current, activity, selectedAnswer, skill)
    if (result.draft === draftRef.current) return
    saveProgress(result.progress)
    persistDraft(result.draft)
  }

  const goNext = () => {
    if (activity.questions[draftRef.current.currentIndex]?.id !== question.id) return
    if (!draftRef.current.answers.some(answer => answer.questionId === question.id)) return
    persistDraft({ ...draftRef.current, currentIndex: draftRef.current.currentIndex + 1 })
  }

  const finish = (speakingResult: boolean | null) => {
    if (completed.current) return
    completed.current = true
    const now = new Date()
    const date = getLocalDateKey(now)
    let progress = recordStudyActivity(loadProgress(), now)
    if (speakingResult !== null) {
      progress = recordEnglishEvidence(progress, {
        id: `${draft.sessionId}-speaking`,
        activityId: activity.id,
        skill: 'speaking',
        correct: speakingResult,
        recordedAt: now.toISOString(),
      })
    }
    progress = completeEnglishDailyTask(progress, draft.taskDate, 'english_activity', activity.id)
    saveProgress({
      ...progress,
      studySessions: [...progress.studySessions.filter(session => session.id !== draft.sessionId), {
        id: draft.sessionId,
        date,
        taskType: 'quiz',
        itemCount: activity.questions.length,
        correctCount,
        durationSeconds: Math.round(currentElapsed()),
      }],
    })
    clearEnglishActivityDraft(activity.id)
    setOralResult(speakingResult)
    setFinished(true)
  }

  if (finished) return (
    <div className="text-center py-10">
      <div className="text-5xl">🌟</div>
      <h2 className="mt-4 text-2xl font-bold">情景练习完成</h2>
      <p className="mt-3 text-gray-600">完成 {activity.questions.length} 道题，答对 {correctCount} 道。</p>
      <p className="mt-2 text-sm text-gray-500">{oralResult === null ? '口头练习已跳过，不影响今日任务完成。' : oralResult ? '已记录家长确认的口头表达。' : '已记录口头表达还需练习，可以下次再试。'}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => navigate('/bridge/today')} className="rounded-xl bg-orange-500 px-5 py-3 text-white font-bold">返回今日任务</button>
        <button onClick={() => navigate('/grade/2')} className="rounded-xl bg-white px-5 py-3 text-gray-700 font-bold">选择其他单元</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-5 text-center">
        <div className="text-4xl">{activity.emoji}</div>
        <h2 className="mt-2 text-xl font-bold text-gray-800">{activity.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{question ? `${draft.currentIndex + 1} / ${activity.questions.length} · 不限时` : '亲子开口说 · 可选'}</p>
        <p className="mt-1 text-xs text-gray-400">当前标签页内自动保留作答进度</p>
      </div>
      {question ? <ActivityQuestion key={question.id} question={question} options={draft.questionOptions[question.id]} answer={draft.answers.find(answer => answer.questionId === question.id)} onSelect={answer} onDone={goNext} /> : (
        <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-lg">💬 {activity.speaking.prompt}</h3>
          <p className="text-orange-700 font-semibold">参考：{activity.speaking.example}</p>
          <p className="text-sm text-gray-600">家长提示：{activity.speaking.parentHint}</p>
          <p className="text-xs text-gray-500">请由身边家长确认；这里不录音，也不自动评判发音。</p>
          <button onClick={() => finish(true)} className="w-full rounded-xl bg-orange-500 py-3 text-white font-bold">家长确认：能独立表达</button>
          <button onClick={() => finish(false)} className="w-full rounded-xl bg-orange-50 py-3 text-orange-800 font-bold">家长确认：还需一起练</button>
          <button onClick={() => finish(null)} className="w-full rounded-xl bg-gray-100 py-3 text-gray-600">今天先跳过，完成练习</button>
        </div>
      )}
    </div>
  )
}

export default function EnglishActivityPage() {
  const { activityId } = useParams()
  const activity = getEnglishActivity(activityId)
  if (!activity) return <div className="text-center py-10">暂时没有这个情景练习，请返回选择其他单元。</div>
  return <ActivitySession key={activity.id} activity={activity} />
}
