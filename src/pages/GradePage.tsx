import { useParams, useNavigate } from 'react-router-dom'
import { getGradeSummary } from '../data/words'
import { getEnglishActivityForUnit } from '../data/englishActivities'
import { loadProgress } from '../utils/storage'
import StarRating from '../components/StarRating'

export default function GradePage() {
  const { gradeId } = useParams()
  const navigate = useNavigate()
  const grade = getGradeSummary(Number(gradeId))
  const progress = loadProgress()

  if (!grade) return <div className="text-center py-10">年级未找到</div>

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-1">{grade.emoji}</div>
        <h2 className="text-2xl font-bold" style={{ color: grade.color }}>
          {grade.name}
        </h2>
      </div>

      <p className="mb-4 text-sm text-gray-500 text-center">所有单元都可以直接学习，跟着学校进度选一课吧。</p>
      <div className="space-y-3">
        {grade.units.map(unit => {
          const unitKey = `${grade.id}-${unit.id}`
          const stars = progress.completedUnits[unitKey] || 0
          const learnedCount = unit.wordIds.filter(id =>
            progress.learnedWords.includes(id)
          ).length
          const activity = grade.id === 2 ? getEnglishActivityForUnit(unit.id) : undefined

          return (
            <div
              key={unit.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: grade.color }}
                  >
                    {unit.id}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{unit.nameZh}</div>
                    <div className="text-xs text-gray-400">
                      {unit.name} · {learnedCount}/{unit.wordIds.length} 词
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {stars > 0 && <StarRating stars={stars} />}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => navigate(`/grade/${grade.id}/unit/${unit.id}`)}
                  className="text-xs px-3 py-1.5 rounded-lg text-white font-semibold active:scale-95 transition-transform"
                  style={{ backgroundColor: grade.color }}
                >
                  📖 学单词
                </button>
                <button
                  onClick={() => navigate(`/grade/${grade.id}/quiz/${unit.id}`)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold active:scale-95 transition-transform"
                  style={{ color: grade.color, border: `1.5px solid ${grade.color}` }}
                >
                  🎯 闯关
                </button>
                {activity && (
                  <button
                    onClick={() => navigate(`/english/activity/${activity.id}`)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-orange-50 text-orange-700"
                  >
                    💬 情景练习
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
