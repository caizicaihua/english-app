import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loadProgress, loadSettings } from '../utils/storage'
import {
  getBridgePlanDateRange,
  getDailyTaskIds,
  getOrCreateDailyStudyPlan,
} from '../utils/studyPlan'

export default function BridgeHomePage() {
  const navigate = useNavigate()
  const settings = loadSettings()
  const progress = loadProgress()
  const planSettings = settings.bridgePlan

  if (!planSettings.enabled) {
    return (
      <div className="py-8 text-center">
        <div className="text-6xl">🌻</div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">一升二暑假衔接</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
          每天 10–20 分钟，先巩固一年级，再轻量预习二年级。
        </p>
        <button
          type="button"
          onClick={() => navigate('/bridge/setup')}
          className="mt-6 rounded-2xl bg-primary px-8 py-3.5 font-bold text-white shadow-md active:scale-95"
        >
          开始设置计划
        </button>
      </div>
    )
  }

  const dailyPlan = getOrCreateDailyStudyPlan(progress, planSettings)
  const taskIds = getDailyTaskIds(dailyPlan)
  const completedCount = dailyPlan.completedTaskIds.length
  const dateRange = getBridgePlanDateRange(planSettings)

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mb-2 text-5xl">🌻</div>
        <h2 className="text-2xl font-bold text-gray-800">一升二暑假计划</h2>
        <p className="mt-1 text-sm text-gray-500">
          {dateRange.startDate} 至 {dateRange.endDate}
        </p>
      </div>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/bridge/today')}
        className="w-full rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-5 text-left text-white shadow-lg active:scale-[0.98]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-indigo-100">今日学习</div>
            <div className="mt-1 text-2xl font-bold">
              {taskIds.length > 0
                ? `${completedCount}/${taskIds.length} 项完成`
                : '今天是休息日'}
            </div>
            <div className="mt-2 text-sm text-indigo-100">
              {taskIds.length > 0
                ? `预计 ${planSettings.dailyMinutes} 分钟 · 轻松完成不补课`
                : '不用补做，保持轻松节奏'}
            </div>
          </div>
          <div className="text-4xl">🚀</div>
        </div>
      </motion.button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/bridge/setup')}
          className="rounded-2xl bg-white p-4 text-left shadow-sm active:scale-95"
        >
          <div className="text-2xl">⚙️</div>
          <div className="mt-2 font-bold text-gray-700">调整计划</div>
          <div className="mt-1 text-xs text-gray-400">
            每周 {planSettings.studyDaysPerWeek} 天
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate('/math')}
          className="rounded-2xl bg-white p-4 text-left shadow-sm active:scale-95"
        >
          <div className="text-2xl">🧮</div>
          <div className="mt-2 font-bold text-gray-700">数学练习</div>
          <div className="mt-1 text-xs text-gray-400">当前可做 100 题训练</div>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="font-bold text-amber-800">学习节奏</div>
        <div className="mt-2 text-sm leading-6 text-amber-700">
          先完成到期复习，再学少量新词。复习达到 8 个时，今天自动暂停新增内容。
        </div>
      </div>
    </div>
  )
}
