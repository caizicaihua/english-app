import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gradeCatalog, getTotalWords } from '../data/words'
import { getActiveStreak, getLocalDateKey, loadProgress, loadMathProgress } from '../utils/storage'
import { getEnglishPracticeCount } from '../utils/englishStats'

export default function StatsPage() {
  const navigate = useNavigate()
  const progress = loadProgress()
  const mathProgress = loadMathProgress()
  const today = getLocalDateKey()
  const todayWords = new Set([...(progress.dailyWordIds[today] ?? []), ...Object.entries(progress.wordMastery).filter(([, state]) => state.firstSeenAt && getLocalDateKey(new Date(state.firstSeenAt)) === today).map(([id]) => id)])
  const todayCount = Math.max(progress.dailyWords[today] || 0, todayWords.size)
  const englishCount = getEnglishPracticeCount(progress, today)
  const mathCount = mathProgress.attemptHistory.filter(attempt => getLocalDateKey(new Date(attempt.completedAt)) === today).reduce((sum, attempt) => sum + attempt.questions.filter(result => result.userAnswer.trim()).length, 0)
  const activeStreak = getActiveStreak(progress)
  const masteryStates = Object.values(progress.wordMastery)
  const encounteredCount = masteryStates.filter(state => state.level > 0).length
  const masteredCount = masteryStates.filter(state => state.level >= 3).length
  const reinforcingCount = masteryStates.filter(state => state.level > 0 && state.level < 3).length

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">📊</div>
        <h2 className="text-2xl font-bold text-gray-800">学习统计</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: '今日新接触词', value: todayCount, emoji: '📝', color: 'text-primary' },
          { label: '今日英语练习', value: englishCount, emoji: '🎧', color: 'text-indigo-600' },
          { label: '今日数学作答', value: mathCount, emoji: '🧮', color: 'text-amber-600' },
          { label: '累计接触', value: encounteredCount, emoji: '📚', color: 'text-success' },
          { label: '连续天数', value: activeStreak, emoji: '🔥', color: 'text-warning' },
          { label: '基本掌握', value: masteredCount, emoji: '✅', color: 'text-emerald-600' },
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

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-gray-700">当前掌握状态</span>
          <span className="text-gray-400">仍需巩固 {reinforcingCount} 个</span>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="bg-emerald-400"
            style={{
              width: encounteredCount > 0
                ? `${Math.round((masteredCount / encounteredCount) * 100)}%`
                : '0%',
            }}
          />
          <div
            className="bg-orange-300"
            style={{
              width: encounteredCount > 0
                ? `${Math.round((reinforcingCount / encounteredCount) * 100)}%`
                : '0%',
            }}
          />
        </div>
        <div className="mt-2 flex gap-4 text-xs text-gray-500">
          <span>🟢 基本/熟练掌握 {masteredCount}</span>
          <span>🟠 初学/需巩固 {reinforcingCount}</span>
        </div>
      </div>

      <button onClick={() => navigate('/bridge/report')} className="mb-5 w-full rounded-xl bg-primary py-3 font-bold text-white">查看双科周报</button>
      <h3 className="font-bold text-gray-700 mb-3">各年级进度</h3>
      <div className="space-y-3">
        {gradeCatalog.map(grade => {
          const totalWords = getTotalWords(grade)
          const learned = grade.units
            .flatMap(unit => unit.wordIds)
            .filter(id => (progress.wordMastery[id]?.level ?? 0) > 0).length
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
