import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mathPaperConfig } from '../data/math'
import { loadMathProgress } from '../utils/storage'

export default function MathHomePage() {
  const navigate = useNavigate()
  const progress = loadMathProgress()

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🧮</div>
        <h2 className="text-2xl font-bold text-gray-800">一年级口算比赛</h2>
        <p className="text-sm text-gray-500 mt-1">
          {mathPaperConfig.totalQuestions} 题 | {mathPaperConfig.durationSeconds / 60} 分钟 | 三大题型
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 shadow-md mb-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-gray-800">口算试卷训练</div>
            <div className="text-sm text-gray-500 mt-1">
              算一算 70 题 · 填一填 20 题 · 比大小 10 题
            </div>
          </div>
          <div className="text-4xl">⏱️</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-center">
            <div className="text-xs text-gray-500">历史最高</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{progress.bestScore}</div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <div className="text-xs text-gray-500">最近成绩</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {progress.lastAttempt?.score ?? '--'}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <div className="text-xs text-gray-500">错题数量</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {progress.wrongQuestions.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => navigate('/math/practice')}
            className="rounded-xl bg-primary text-white font-bold py-3.5 active:scale-95 transition-transform"
          >
            开始训练
          </button>
          <button
            onClick={() => navigate('/math/wrong-book')}
            className="rounded-xl border border-amber-300 bg-amber-50 text-amber-700 font-bold py-3.5 active:scale-95 transition-transform"
          >
            数学错题本
          </button>
        </div>
      </motion.div>

      <div className="space-y-3">
        {mathPaperConfig.sections.map(section => (
          <div key={section.type} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-gray-800">{section.label}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {section.type === 'calc' && '20 以内加减、整十加减、三项连算'}
                  {section.type === 'fill' && '补空求未知数，答案都在 100 以内'}
                  {section.type === 'compare' && '在 >、<、= 中选择正确符号'}
                </div>
              </div>
              <div className="text-sm font-bold text-primary">{section.count} 题</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
