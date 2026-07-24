import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { mathPaperConfig, mathQuickConfig } from '../data/math'
import { getMathModeProgress, loadMathProgress } from '../utils/storage'

export default function MathHomePage() {
  const navigate = useNavigate()
  const progress = loadMathProgress()
  const quickProgress = getMathModeProgress(progress, 'quick')
  const paperProgress = getMathModeProgress(progress, 'paper')

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mb-2 text-5xl">🧮</div>
        <h2 className="text-2xl font-bold text-gray-800">一年级数学练习</h2>
        <p className="mt-1 text-sm text-gray-500">
          平时做 20 题，周末再挑战 100 题
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-5 text-white shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
              今日推荐
            </div>
            <div className="mt-3 text-xl font-bold">{mathQuickConfig.title}</div>
            <div className="mt-1 text-sm text-indigo-100">
              14 道计算 · 4 道填空 · 2 道比大小
            </div>
          </div>
          <div className="text-4xl">⚡</div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/15 p-3">
            <div className="text-xs text-indigo-100">题量</div>
            <div className="mt-1 text-xl font-bold">{mathQuickConfig.totalQuestions}</div>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <div className="text-xs text-indigo-100">限时</div>
            <div className="mt-1 text-xl font-bold">{mathQuickConfig.durationSeconds / 60} 分</div>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <div className="text-xs text-indigo-100">最高</div>
            <div className="mt-1 text-xl font-bold">
              {quickProgress.completedCount > 0
                ? `${quickProgress.bestScore}/${mathQuickConfig.totalQuestions}`
                : '--'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/math/practice?mode=quick')}
          className="mt-5 w-full rounded-xl bg-white py-3.5 font-bold text-indigo-600 shadow-sm active:scale-[0.98]"
        >
          开始 20 题快速练
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-5 rounded-2xl bg-white p-5 shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-gray-800">100 题整卷训练</div>
            <div className="mt-1 text-sm text-gray-500">
              每周做一次，检查持续专注和综合正确率
            </div>
          </div>
          <div className="text-4xl">⏱️</div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-indigo-50 p-3">
            <div className="text-xs text-gray-500">历史最高</div>
            <div className="mt-1 text-xl font-bold text-indigo-600">
              {paperProgress.bestScore}/{mathPaperConfig.totalQuestions}
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="text-xs text-gray-500">最近成绩</div>
            <div className="mt-1 text-xl font-bold text-emerald-600">
              {paperProgress.lastAttempt
                ? `${paperProgress.lastAttempt.score}/${mathPaperConfig.totalQuestions}`
                : '--'}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <div className="text-xs text-gray-500">错题数量</div>
            <div className="mt-1 text-xl font-bold text-amber-600">
              {progress.wrongQuestions.length}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate('/math/practice?mode=paper')}
            className="rounded-xl bg-primary py-3.5 font-bold text-white active:scale-95"
          >
            开始 100 题
          </button>
          <button
            type="button"
            onClick={() => navigate('/math/wrong-book')}
            className="rounded-xl border border-amber-300 bg-amber-50 py-3.5 font-bold text-amber-700 active:scale-95"
          >
            数学错题本
          </button>
        </div>
      </motion.div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="font-bold text-gray-800">两种模式成绩分开记录</div>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          20 题快速练只更新快速练成绩，不会改写 100 题整卷的历史最高分。
        </p>
      </div>
    </div>
  )
}
