import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { grades } from '../data/words'
import { loadProgress } from '../utils/storage'

export default function HomePage() {
  const navigate = useNavigate()
  const progress = loadProgress()

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">选择年级</h2>
        <p className="text-gray-500 text-sm mt-1">
          已学 {progress.learnedWords.length} 个单词 | 连续 {progress.streak} 天
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {grades.map((grade, index) => {
          const totalWords = grade.units.reduce((s, u) => s + u.words.length, 0)
          const learnedInGrade = grade.units
            .flatMap(u => u.words)
            .filter(w => progress.learnedWords.includes(w.id)).length
          const percent = totalWords > 0 ? Math.round((learnedInGrade / totalWords) * 100) : 0

          return (
            <motion.div
              key={grade.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => navigate(`/grade/${grade.id}`)}
              className="bg-white rounded-2xl p-5 shadow-md cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
            >
              <div className="text-4xl mb-2">{grade.emoji}</div>
              <div className="font-bold text-lg" style={{ color: grade.color }}>
                {grade.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {grade.units.length} 个单元 · {totalWords} 词
              </div>
              <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${percent}%`, backgroundColor: grade.color }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{percent}%</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
