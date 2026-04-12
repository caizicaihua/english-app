import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { loadMathProgress, removeMathWrongQuestion, saveMathProgress } from '../utils/storage'

export default function MathWrongBookPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(loadMathProgress)

  const handleRemove = (reviewKey: string) => {
    const next = removeMathWrongQuestion(progress, reviewKey)
    saveMathProgress(next)
    setProgress(next)
  }

  const handleRetry = () => {
    if (progress.wrongQuestions.length === 0) return

    navigate('/math/practice', {
      state: {
        mode: 'review',
        title: '错题重练',
        reviewQuestions: progress.wrongQuestions.map(item => item.question),
      },
    })
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">📕</div>
        <h2 className="text-2xl font-bold text-gray-800">数学错题本</h2>
        <p className="text-sm text-gray-500 mt-1">
          共 {progress.wrongQuestions.length} 题待复习
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={handleRetry}
          disabled={progress.wrongQuestions.length === 0}
          className="rounded-xl bg-primary py-3 text-white font-bold disabled:opacity-40"
        >
          错题重练
        </button>
        <button
          onClick={() => navigate('/math')}
          className="rounded-xl bg-gray-100 py-3 text-gray-700 font-bold"
        >
          返回数学首页
        </button>
      </div>

      {progress.wrongQuestions.length === 0 ? (
        <div className="rounded-2xl bg-white px-5 py-10 text-center shadow-sm">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-gray-600 font-semibold">现在没有数学错题</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {progress.wrongQuestions.map((item, index) => (
              <motion.div
                key={item.reviewKey}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -120, height: 0 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-400 mb-1">
                      {item.question.sectionLabel.replace('一、', '').replace('二、', '').replace('三、', '')}
                    </div>
                    <div className="text-base font-bold text-gray-800 break-words">
                      {item.question.prompt}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      正确答案：{item.question.correctAnswer}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.reviewKey)}
                    className="rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700"
                  >
                    移除
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
