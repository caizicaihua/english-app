import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { achievements } from '../data/achievements'
import { loadProgress, saveProgress, addAchievement } from '../utils/storage'

export default function AchievementsPage() {
  const [progress, setProgress] = useState(loadProgress)
  const [newUnlock, setNewUnlock] = useState<string | null>(null)

  // Check and unlock achievements
  useEffect(() => {
    const completedUnits = Object.keys(progress.completedUnits).length
    const perfectUnits = Object.values(progress.completedUnits).filter(s => s >= 3).length
    const stats = {
      learnedCount: progress.learnedWords.length,
      streak: progress.streak,
      completedUnits,
      perfectUnits,
    }

    let updated = progress
    for (const a of achievements) {
      if (!updated.achievements.includes(a.id) && a.condition(stats)) {
        updated = addAchievement(updated, a.id)
        setNewUnlock(a.id)
      }
    }
    if (updated !== progress) {
      saveProgress(updated)
      setProgress(updated)
    }
  }, [progress])

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🏆</div>
        <h2 className="text-2xl font-bold text-gray-800">成就徽章</h2>
        <p className="text-gray-400 text-sm mt-1">
          已解锁 {progress.achievements.length} / {achievements.length}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {achievements.map((a, i) => {
          const unlocked = progress.achievements.includes(a.id)
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-xl p-3 text-center shadow-sm transition-all ${
                unlocked ? '' : 'opacity-40 grayscale'
              }`}
            >
              <div className="text-3xl mb-1">{a.emoji}</div>
              <div className="text-xs font-bold text-gray-700">{a.name}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{a.description}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Achievement unlock popup */}
      <AnimatePresence>
        {newUnlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
            onClick={() => setNewUnlock(null)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-xs mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl mb-3">
                {achievements.find(a => a.id === newUnlock)?.emoji}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">成就解锁！</h3>
              <p className="text-lg font-semibold text-primary">
                {achievements.find(a => a.id === newUnlock)?.name}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {achievements.find(a => a.id === newUnlock)?.description}
              </p>
              <button
                onClick={() => setNewUnlock(null)}
                className="mt-5 px-6 py-2 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform"
              >
                太棒了！
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
