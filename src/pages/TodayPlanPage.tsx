import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DailyTaskCard from '../components/DailyTaskCard'
import { getEnglishActivity } from '../data/englishActivities'
import { getMathSkill } from '../data/mathSkills'
import type { DailyStudyPlan, DailyTaskId } from '../data/bridgePlan'
import {
  completeDailyTask,
  getDailyTaskIds,
  getPlanStatusMessage,
  getOrCreateDailyStudyPlan,
  saveDailyStudyPlan,
  startDailyTask,
} from '../utils/studyPlan'
import {
  loadProgress,
  loadSettings,
  saveProgress,
  type ProgressData,
} from '../utils/storage'

interface TodayContext {
  progress: ProgressData
  plan: DailyStudyPlan
}

function loadTodayContext(): TodayContext {
  const progress = loadProgress()
  const settings = loadSettings()
  const plan = getOrCreateDailyStudyPlan(progress, settings.bridgePlan)
  const stored = progress.dailyPlans[plan.date]

  if (stored !== plan) {
    const updated = saveDailyStudyPlan(progress, plan)
    saveProgress(updated)
    return { progress: updated, plan }
  }

  return { progress, plan }
}

export default function TodayPlanPage() {
  const navigate = useNavigate()
  const [context, setContext] = useState<TodayContext>(loadTodayContext)
  const { progress, plan } = context
  const taskIds = getDailyTaskIds(plan)
  const completed = new Set(plan.completedTaskIds.filter(id => taskIds.includes(id)))
  const emptyState = getPlanStatusMessage(plan.status)
  const activity = plan.englishActivityId ? getEnglishActivity(plan.englishActivityId) : undefined

  const handleComplete = (taskId: DailyTaskId) => {
    const nextProgress = completeDailyTask(progress, plan.date, taskId)
    saveProgress(nextProgress)
    setContext({
      progress: nextProgress,
      plan: nextProgress.dailyPlans[plan.date],
    })
  }

  const taskCards: Array<{
    id: DailyTaskId
    icon: string
    title: string
    description: string
    countLabel: string
    onOpen: () => void | Promise<void>
    canMarkComplete?: boolean
  }> = [
    ...(plan.includeDiagnostic ? [{
      id: 'diagnostic' as const,
      icon: '🩺',
      title: '一年级英语小体检',
      description: completed.has('diagnostic')
        ? '今天的小体检任务已经完成，不需要再做其他整套日常任务。'
        : progress.diagnosticDraft
        ? `继续第 ${progress.diagnosticDraft.currentSection + 1}/5 小节，完成后今天就不用再做整套日常任务。`
        : '每次只做 4–9 题，可以分几天完成，不用一次做完。',
      countLabel: completed.has('diagnostic')
        ? '今日已完成'
        : progress.diagnosticDraft
        ? `第 ${progress.diagnosticDraft.currentSection + 1}/5 节`
        : '可分 5 次',
      onOpen: () => navigate('/bridge/diagnostic'),
      canMarkComplete: false,
    }] : []),
    ...(plan.reviewWordIds.length > 0 ? [{
      id: 'review' as const,
      icon: '🔁',
      title: '到期与薄弱复习',
      description: '先复习已经接触过的词，答对达标后会自动降低频率。',
      countLabel: `${plan.reviewWordIds.length} 个词`,
      onOpen: () => navigate('/bridge/review'),
      canMarkComplete: false,
    }] : []),
    ...(plan.verificationWordIds.length > 0 ? [{
      id: 'verification' as const,
      icon: '🔎',
      title: '弱单元小验证',
      description: '这些词还没有被诊断过，做完以后才判断是否需要继续复习。',
      countLabel: `${plan.verificationWordIds.length} 个词`,
      onOpen: () => navigate('/bridge/verification'),
      canMarkComplete: false,
    }] : []),
    ...(plan.newWordIds.length > 0 ? [{
      id: 'new_words' as const,
      icon: '🌱',
      title: '今天的新词',
      description: '少量认识、跟读和理解即可，不要求一次全部默写。',
      countLabel: `${plan.newWordIds.length} 个词`,
      onOpen: () => navigate('/bridge/new-words'),
      canMarkComplete: false,
    }] : []),
    ...(plan.quizQuestionCount > 0 ? [{
      id: 'quiz' as const,
      icon: '🎯',
      title: '英语小练习',
      description: '用选择、听力和拼写检查今天是否真的理解。',
      countLabel: `${plan.quizQuestionCount} 题`,
      onOpen: () => navigate('/bridge/daily-quiz'),
      canMarkComplete: false,
    }] : []),
    ...(activity ? [{
      id: 'english_activity' as const,
      icon: '💬',
      title: activity.title,
      description: '听懂短句，选一选，再试着说一句。口头练习可跳过。',
      countLabel: '约 3 分钟',
      onOpen: () => navigate(`/english/activity/${activity.id}`),
      canMarkComplete: false,
    }] : []),
    ...(plan.includeMath ? [{
      id: 'math' as const,
      icon: '🧮',
      title: plan.mathSkillId ? getMathSkill(plan.mathSkillId)?.title ?? '数学专项' : '数学口算',
      description: plan.mathSkillId ? '不计时，理解后再作答。完成后自动记录。' : '完成 20 道短练习，保持计算手感。',
      countLabel: plan.mathSkillId ? `${plan.mathQuestionCount ?? 8} 题 · 不限时` : '20 题 · 5 分钟',
      onOpen: () => navigate(plan.mathSkillId ? `/math/practice?mode=focused&skill=${plan.mathSkillId}&count=${plan.mathQuestionCount ?? 8}` : '/math/practice?mode=quick'),
      canMarkComplete: false,
    }] : []),
  ]

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-primary">{plan.date}</div>
          <h2 className="mt-1 text-2xl font-bold text-gray-800">今日学习任务</h2>
          <p className="mt-1 text-sm text-gray-500">
            {taskIds.length > 0 ? `已完成 ${completed.size}/${taskIds.length} 项` : '今天没有需要完成的任务'}
          </p>
        </div>
        <div className="text-5xl">🚀</div>
      </div>

      <div className="mb-5 h-3 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all"
          style={{
            width: taskIds.length === 0
              ? '0%'
              : `${Math.round((completed.size / taskIds.length) * 100)}%`,
          }}
        />
      </div>

      <div className="space-y-3">
        {taskCards.map(task => (
          <DailyTaskCard
            key={task.id}
            icon={task.icon}
            title={task.title}
            description={task.description}
            countLabel={task.countLabel}
            completed={completed.has(task.id)}
            canMarkComplete={task.canMarkComplete}
            onOpen={() => {
              const current = loadProgress()
              const started = startDailyTask(current, plan.date, task.id)
              if (started !== current) saveProgress(started)
              return task.onOpen()
            }}
            onComplete={() => handleComplete(task.id)}
          />
        ))}
      </div>

      {taskIds.length === 0 && (
        <div className="rounded-2xl bg-white px-5 py-10 text-center shadow-sm">
          <div className="text-5xl">🌤️</div>
          <div className="mt-3 text-lg font-bold text-gray-700">{emptyState.title}</div>
          <div className="mt-2 text-sm text-gray-500">{emptyState.description}</div>
          <button onClick={() => navigate(plan.status === 'rest' ? '/' : '/bridge/setup')} className="mt-4 rounded-xl bg-primary px-5 py-3 font-bold text-white">{plan.status === 'rest' ? '自由探索' : '调整计划'}</button>
        </div>
      )}

      {completed.size === taskIds.length && taskIds.length > 0 && (
        <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-center text-emerald-700">
          <div className="text-4xl">🎉</div>
          <div className="mt-2 font-bold">今天完成啦，明天见！</div>
          <div className="mt-1 text-sm">不用补做，也不用继续加量。</div>
        </div>
      )}
    </div>
  )
}
