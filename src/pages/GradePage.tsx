import { useParams, useNavigate } from 'react-router-dom'
import { getGrade } from '../data/words'
import { loadProgress } from '../utils/storage'
import StarRating from '../components/StarRating'

export default function GradePage() {
  const { gradeId } = useParams()
  const navigate = useNavigate()
  const grade = getGrade(Number(gradeId))
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

      <div className="space-y-3">
        {grade.units.map((unit, index) => {
          const unitKey = `${grade.id}-${unit.id}`
          const stars = progress.completedUnits[unitKey] || 0
          const learnedCount = unit.words.filter(w =>
            progress.learnedWords.includes(w.id)
          ).length
          const isLocked = index > 0 && !progress.completedUnits[`${grade.id}-${grade.units[index - 1].id}`]

          return (
            <div
              key={unit.id}
              className={`bg-white rounded-xl p-4 shadow-sm ${
                isLocked ? 'opacity-50' : 'cursor-pointer hover:shadow-md active:scale-[0.98]'
              } transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: isLocked ? '#d1d5db' : grade.color }}
                  >
                    {isLocked ? '🔒' : unit.id}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{unit.nameZh}</div>
                    <div className="text-xs text-gray-400">
                      {unit.name} · {learnedCount}/{unit.words.length} 词
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {stars > 0 && <StarRating stars={stars} />}
                </div>
              </div>
              {!isLocked && (
                <div className="flex gap-2 mt-2 ml-13">
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
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
