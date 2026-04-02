import { motion } from 'framer-motion'
import { grades } from '../data/words'
import { loadProgress } from '../utils/storage'

export default function StatsPage() {
  const progress = loadProgress()
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = progress.dailyWords[today] || 0

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">📊</div>
        <h2 className="text-2xl font-bold text-gray-800">学习统计</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: '今日学习', value: todayCount, emoji: '📝', color: 'text-primary' },
          { label: '累计单词', value: progress.learnedWords.length, emoji: '📚', color: 'text-success' },
          { label: '连续天数', value: progress.streak, emoji: '🔥', color: 'text-warning' },
          { label: '错题待复习', value: progress.wrongWords.length, emoji: '📕', color: 'text-danger' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl p-4 text-center shadow-sm"
          >
            <div className="text-2xl mb-1">{stat.emoji}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <h3 className="font-bold text-gray-700 mb-3">各年级进度</h3>
      <div className="space-y-3">
        {grades.map(grade => {
          const totalWords = grade.units.reduce((s, u) => s + u.words.length, 0)
          const learned = grade.units
            .flatMap(u => u.words)
            .filter(w => progress.learnedWords.includes(w.id)).length
          const percent = totalWords > 0 ? Math.round((learned / totalWords) * 100) : 0
          const totalStars = grade.units.reduce(
            (s, u) => s + (progress.completedUnits[`${grade.id}-${u.id}`] || 0), 0
          )
          const maxStars = grade.units.length * 3

          return (
            <motion.div
              key={grade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{grade.emoji}</span>
                  <span className="font-bold text-sm" style={{ color: grade.color }}>
                    {grade.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  ⭐ {totalStars}/{maxStars} | {learned}/{totalWords} 词
                </span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: grade.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
