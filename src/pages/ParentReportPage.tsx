import { useNavigate } from 'react-router-dom'
import { formatCountdown } from '../utils/mathPaper'
import { loadMathProgress, loadProgress, loadSettings } from '../utils/storage'
import { buildWeeklyReport } from '../utils/weeklyReport'

export default function ParentReportPage() {
  const navigate = useNavigate()
  const report = buildWeeklyReport(loadProgress(), loadMathProgress(), new Date(), loadSettings().bridgePlan)

  if (!report.hasActivity && report.scheduledStudyDays === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-6xl">📭</div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">本周还没有学习记录</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
          周报会在孩子完成今日任务、英语练习或数学快速练后自动生成，不需要手工填写。
        </p>
        <button
          type="button"
          onClick={() => navigate('/bridge/today')}
          className="mt-6 rounded-xl bg-primary px-7 py-3 font-bold text-white"
        >
          去看看今日任务
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="text-5xl">📋</div>
        <h2 className="mt-2 text-2xl font-bold text-gray-800">家长周报</h2>
        <p className="mt-1 text-sm text-gray-500">
          {report.startDate} 至 {report.endDate}
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {[
          { label: '学习天数', value: `${report.studyDays} 天`, icon: '📅' },
          {
            label: '计划日完成率',
            value: report.scheduleCompletionRate === null ? '--' : `${report.scheduleCompletionRate}%`,
            icon: '✅',
          },
          { label: '新接触', value: `${report.newWordCount} 词`, icon: '🌱' },
          { label: '本周达标', value: `${report.masteredWordCount} 词`, icon: '🏅' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="text-2xl">{item.icon}</div>
            <div className="mt-1 text-2xl font-bold text-gray-800">{item.value}</div>
            <div className="mt-1 text-xs text-gray-400">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-xl bg-indigo-50 p-4 text-xs leading-6 text-indigo-800">
        截至今天，完成 {report.completedStudyDays}/{report.scheduledStudyDays} 个计划日；已生成任务完成 {report.completedTaskCount}/{report.plannedTaskCount} 项。
        {report.scheduleKnownFrom && <p>计划从 {report.scheduleKnownFrom} 起记录；未打开应用的计划日也会计入，未来日期不提前计算。</p>}
        <p>额外学习会记录练习表现，不增加计划完成率。</p>
      </div>
      <section className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-800">英语进展</h3>
            <p className="mt-1 text-xs text-gray-400">
              本周完成到期/验证复习 {report.reviewedWordCount} 词次
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-lg font-bold text-emerald-700">
            {report.currentGradeMasteryRate}%
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{report.currentGradeName}基本/熟练掌握</span>
            <span>{report.currentGradeMasteredCount}/{report.currentGradeTotal}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${report.currentGradeMasteryRate}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {report.englishSkills.map(item => <div key={item.skill} className="rounded-xl bg-indigo-50 p-3">
            <div className="text-xs font-bold text-indigo-800">{item.label}</div>
            <div className="mt-1 text-sm text-indigo-700">{item.total === 0 ? '暂无记录' : item.skill === 'speaking' ? `确认 ${item.correct} 次` : `答对 ${item.correct}/${item.total} 题`}</div>
          </div>)}
        </div>
        <p className="mt-3 text-xs leading-5 text-gray-500">技能记录只来自实际练习。听力改为文字题会计入认读；历史词汇成绩不会推定为表达能力。</p>
      </section>

      <section className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="font-bold text-gray-800">数学表现</h3>
        {report.mathAttemptCount === 0 ? (
          <div className="mt-3 rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
            本周还没有数学练习记录
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-indigo-50 p-3">
              <div className="text-xl font-bold text-indigo-700">{report.mathAttemptCount}</div>
              <div className="mt-1 text-xs text-gray-500">完成次数</div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="text-xl font-bold text-emerald-700">{report.mathAccuracy}%</div>
              <div className="mt-1 text-xs text-gray-500">正确率</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <div className="text-xl font-bold text-amber-700">
                {formatCountdown(report.mathAverageSeconds ?? 0)}
              </div>
              <div className="mt-1 text-xs text-gray-500">平均用时</div>
            </div>
          </div>
        )}
      </section>

      {report.mathSkills.length > 0 && <section className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="font-bold text-gray-800">数学知识点记录</h3>
        <div className="mt-3 space-y-3">{report.mathSkills.map(item => <div key={item.skillId} className="rounded-xl bg-amber-50 p-3">
          <div className="flex justify-between gap-3 text-sm"><span className="font-semibold text-gray-700">{item.title}</span><span>{item.correct}/{item.total}</span></div>
          <p className="mt-1 text-xs text-gray-500">{item.total < 5 ? '记录较少，继续观察' : `本周正确率 ${item.accuracy}% · 包含复习`}</p>
        </div>)}</div>
      </section>}
      <section className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="font-bold text-gray-800">当前英语关注点</h3>
        {report.concerns.length === 0 ? (
          <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
            当前没有突出的薄弱单元，按到期任务继续复习即可。
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {report.concerns.map((concern, index) => (
              <div key={concern.unitKey} className="rounded-xl bg-amber-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-amber-900">
                    {index + 1}. {concern.unitName}
                  </div>
                  <div className="text-xs font-bold text-amber-700">
                    掌握 {concern.masteryPercent}%
                  </div>
                </div>
                <div className="mt-1 text-xs leading-5 text-amber-700">{concern.reason}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
        <h3 className="font-bold text-indigo-900">下周建议</h3>
        <ol className="mt-3 space-y-2">
          {report.suggestions.map((suggestion, index) => (
            <li key={suggestion} className="flex gap-3 text-sm leading-6 text-indigo-800">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold">
                {index + 1}
              </span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
