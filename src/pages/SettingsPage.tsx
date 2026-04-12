import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadMathProgress, loadProgress, loadSettings, saveSettings } from '../utils/storage'
import { speechSpeedOptions, type SpeechSpeedPreset } from '../utils/speech'

export default function SettingsPage() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [speechSpeed, setSpeechSpeed] = useState<SpeechSpeedPreset>(() => loadSettings().speechSpeed)
  const progress = loadProgress()
  const mathProgress = loadMathProgress()

  const handleSpeedChange = (speed: SpeechSpeedPreset) => {
    setSpeechSpeed(speed)
    saveSettings({ ...loadSettings(), speechSpeed: speed })
  }

  const handleReset = () => {
    localStorage.removeItem('english_app_data')
    localStorage.removeItem('english_app_math_data')
    setShowConfirm(false)
    setResetDone(true)
    setTimeout(() => setResetDone(false), 2000)
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-800">设置</h2>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-700 mb-1">当前数据</div>
          <div className="text-xs text-gray-400 space-y-0.5">
            <p>已学单词：{progress.learnedWords.length} 个</p>
            <p>已完成单元：{Object.keys(progress.completedUnits).length} 个</p>
            <p>错题本：{progress.wrongWords.length} 个</p>
            <p>数学错题：{mathProgress.wrongQuestions.length} 个</p>
            <p>数学最高分：{mathProgress.bestScore} 分</p>
            <p>已解锁成就：{progress.achievements.length} 个</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-700 mb-1">默认句子语速</div>
          <p className="text-xs text-gray-400 mb-3">
            用于学习页中的例句和情景对话朗读，适合一年级孩子反复跟读。
          </p>
          <div className="grid grid-cols-3 gap-2">
            {speechSpeedOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSpeedChange(option.value)}
                className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-all ${
                  speechSpeed === option.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-700 mb-1">重置学习数据</div>
          <p className="text-xs text-gray-400 mb-3">
            清除所有学习进度、错题本和成就记录，恢复到初始状态。此操作不可撤销。
          </p>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-500 text-sm font-bold active:scale-95 transition-transform"
          >
            🗑️ 重置所有数据
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-6 text-center shadow-2xl max-w-xs mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">确认重置？</h3>
              <p className="text-sm text-gray-500 mb-5">
                所有学习进度、错题本和成就记录将被清除，且无法恢复。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold active:scale-95 transition-transform"
                >
                  取消
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold active:scale-95 transition-transform"
                >
                  确认重置
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset success toast */}
      <AnimatePresence>
        {resetDone && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-[100]"
          >
            ✅ 已重置所有数据
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
