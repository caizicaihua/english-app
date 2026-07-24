import { useNavigate } from 'react-router-dom'
import { getGradeSummary } from '../data/words'
import { getDiagnosticOverallScore } from '../utils/diagnostic'
import { loadProgress } from '../utils/storage'

const statusMeta = {
  mastered: {
    label: '已掌握',
    className: 'bg-emerald-50 text-emerald-700',
  },
  review: {
    label: '需要复习',
    className: 'bg-amber-50 text-amber-700',
  },
  focus: {
    label: '重点巩固',
    className: 'bg-red-50 text-red-600',
  },
}

export default function DiagnosticResultPage() {
  const navigate = useNavigate()
  const progress = loadProgress()
  const result = progress.diagnosticResults.at(-1)
  const grade = getGradeSummary(1)

  if (!result || !grade) {
    return (
      <div className="py-12 text-center">
        <div className="text-5xl">🩺</div>
        <h2 className="mt-4 text-xl font-bold text-gray-800">还没有完整诊断结果</h2>
        <button
          type="button"
          onClick={() => navigate('/bridge/diagnostic')}
          className="mt-5 rounded-xl bg-primary px-6 py-3 font-bold text-white"
        >
          开始小体检
        </button>
      </div>
    )
  }

  const overallScore = getDiagnosticOverallScore(result)
  const unitEntries = Object.entries(result.unitResults)
  const masteredCount = unitEntries.filter(([, unit]) => unit.status === 'mastered').length
  const reviewCount = unitEntries.filter(([, unit]) => unit.status === 'review').length
  const focusCount = unitEntries.filter(([, unit]) => unit.status === 'focus').length

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="mt-3 text-2xl font-bold text-gray-800">一年级诊断完成</h2>
        <p className="mt-2 text-sm text-gray-500">这是起点，不是考试分数</p>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 p-5 text-white shadow-lg">
        <div className="text-sm text-indigo-100">整体掌握率</div>
        <div className="mt-1 text-5xl font-bold">{overallScore}%</div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/15 p-2">
            <div className="text-xl font-bold">{masteredCount}</div>
            <div className="text-xs text-indigo-100">已掌握</div>
          </div>
          <div className="rounded-xl bg-white/15 p-2">
            <div className="text-xl font-bold">{reviewCount}</div>
            <div className="text-xs text-indigo-100">需复习</div>
          </div>
          <div className="rounded-xl bg-white/15 p-2">
            <div className="text-xl font-bold">{focusCount}</div>
            <div className="text-xs text-indigo-100">重点巩固</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-bold text-gray-800">诊断时答错的词</div>
            <div className="mt-1 text-xs text-gray-400">历史结果会保留，学会后不会反复安排</div>
          </div>
          <div className="text-2xl font-bold text-red-500">{result.weakWordIds.length}</div>
        </div>
      </div>

      <h3 className="mb-3 mt-5 font-bold text-gray-700">各单元情况</h3>
      <div className="space-y-2">
        {unitEntries.map(([unitKey, unitResult]) => {
          const unitId = Number(unitKey.split('-')[1])
          const unit = grade.units.find(item => item.id === unitId)
          const meta = statusMeta[unitResult.status]

          return (
            <div
              key={unitKey}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="min-w-0">
                <div className="font-bold text-gray-800">{unit?.nameZh ?? unitKey}</div>
                <div className="mt-1 text-xs text-gray-400">
                  抽测 {unitResult.sampledWordIds.length} 个词
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-700">{unitResult.score}%</div>
                <div className={`mt-1 rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}>
                  {meta.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/bridge/today')}
          className="rounded-2xl bg-primary py-3.5 font-bold text-white active:scale-[0.98]"
        >
          查看今日安排
        </button>
        <button
          type="button"
          onClick={() => navigate('/bridge')}
          className="rounded-2xl bg-white py-3.5 font-bold text-gray-600 shadow-sm active:scale-[0.98]"
        >
          返回暑假计划
        </button>
      </div>
    </div>
  )
}
