import { useNavigate } from 'react-router-dom'
import { loadMathProgress } from '../utils/storage'
import { formatCountdown } from '../utils/mathPaper'

export default function MathResultPage() {
  const navigate = useNavigate()
  const progress = loadMathProgress()
  const attempt = progress.latestAttempt

  if (!attempt) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🧮</div>
        <h2 className="text-2xl font-bold text-gray-800">还没有训练记录</h2>
        <button
          onClick={() => navigate('/math')}
          className="mt-5 rounded-xl bg-primary px-6 py-3 text-white font-bold"
        >
          去数学主页
        </button>
      </div>
    )
  }

  const wrongQuestions = attempt.questions.filter(item => !item.isCorrect)
  const accuracy = Math.round((attempt.correctCount / attempt.totalCount) * 100)

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{attempt.score === attempt.totalCount ? '🏅' : '🎉'}</div>
        <h2 className="text-2xl font-bold text-gray-800">{attempt.title}</h2>
        <p className="text-sm text-gray-500 mt-1">
          用时 {formatCountdown(attempt.timeSpentSeconds)} · 正确率 {accuracy}%
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-indigo-50 p-3">
            <div className="text-xs text-gray-500">总得分</div>
            <div className="text-3xl font-bold text-indigo-600 mt-1">{attempt.score}</div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="text-xs text-gray-500">答对</div>
            <div className="text-3xl font-bold text-emerald-600 mt-1">{attempt.correctCount}</div>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <div className="text-xs text-gray-500">错题</div>
            <div className="text-3xl font-bold text-amber-600 mt-1">{wrongQuestions.length}</div>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          {attempt.sections.map(section => (
            <div key={section.type} className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold text-gray-800">{section.label}</div>
                <div className="text-sm font-semibold text-primary">
                  {section.correctCount}/{section.totalCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
        <div className="font-bold text-gray-800 mb-3">错题摘要</div>
        {wrongQuestions.length === 0 ? (
          <div className="rounded-xl bg-green-50 px-4 py-6 text-center text-green-700 font-semibold">
            本次全部答对，真不错。
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {wrongQuestions.map((item, index) => (
              <div key={`${item.question.reviewKey}-${index}`} className="rounded-xl bg-gray-50 px-4 py-3">
                <div className="text-sm font-bold text-gray-800">{item.question.prompt}</div>
                <div className="text-xs text-gray-500 mt-1">
                  你的答案：{item.userAnswer || '未作答'} | 正确答案：{item.question.correctAnswer}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={() => navigate('/math/practice')}
          className="rounded-xl bg-primary py-3 text-white font-bold active:scale-95 transition-transform"
        >
          再来一套
        </button>
        <button
          onClick={() => navigate('/math/wrong-book')}
          className="rounded-xl bg-amber-50 py-3 text-amber-700 font-bold active:scale-95 transition-transform"
        >
          去错题本
        </button>
        <button
          onClick={() => navigate('/math')}
          className="rounded-xl bg-gray-100 py-3 text-gray-700 font-bold active:scale-95 transition-transform"
        >
          返回数学首页
        </button>
      </div>
    </div>
  )
}
