import { useNavigate } from 'react-router-dom'
import { gradeCatalog, getTotalWords } from '../data/words'
import { getMathSkill } from '../data/mathSkills'
import { getActiveStreak, loadProgress, loadSettings } from '../utils/storage'
import { getDailyTaskIds, getOrCreateDailyStudyPlan, getPlanStatusMessage } from '../utils/studyPlan'

export default function HomePage() {
  const navigate = useNavigate()
  const progress = loadProgress()
  const settings = loadSettings().bridgePlan
  const plan = getOrCreateDailyStudyPlan(progress, settings)
  const tasks = getDailyTaskIds(plan)
  const completed = tasks.filter(id => plan.completedTaskIds.includes(id)).length
  const grade = gradeCatalog.find(item => item.id === (settings.gradeId ?? 2))!
  const unit = grade.units.find(item => item.id === (settings.englishUnitId ?? 1)) ?? grade.units[0]
  const emptyState = getPlanStatusMessage(plan.status)



  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-primary">{grade.name} · {settings.semester === 'lower' ? '下学期' : '上学期'}</p>
        <h2 className="mt-1 text-3xl font-bold text-gray-800">今天学一点 🌱</h2>
        <p className="mt-2 text-sm text-gray-500">英语和数学，一起慢慢进步</p>
      </div>
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-500 p-6 text-white shadow-lg">
        <p className="text-sm text-indigo-100">{settings.enabled ? `每日约 ${settings.dailyMinutes} 分钟 · 两科合计` : '从学校正在学的内容开始'}</p>
        <h3 className="mt-3 text-2xl font-bold">{!settings.enabled ? '设置我的学习计划' : tasks.length ? completed === tasks.length ? '今天完成啦！' : `今天有 ${tasks.length} 项小任务` : emptyState.title}</h3>
        <p className="mt-2 text-sm leading-6 text-indigo-100">{tasks.length ? `已完成 ${completed}/${tasks.length} 项，先复习，再学新内容。` : emptyState.description}</p>
        <button onClick={() => navigate(!settings.enabled ? '/bridge/setup' : '/bridge/today')} className="mt-5 w-full rounded-2xl bg-white py-3.5 font-bold text-indigo-700 active:scale-[0.98]">
          {!settings.enabled ? '开始设置' : tasks.length && completed < tasks.length ? '开始今天的学习' : '看看今日安排'}
        </button>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate(`/grade/${grade.id}`)} className="rounded-2xl bg-white p-4 text-left shadow-sm">
          <div className="text-3xl">📖</div><h3 className="mt-2 font-bold text-gray-800">英语探索</h3><p className="mt-1 text-xs leading-5 text-gray-500">当前主题：{unit.nameZh}</p>
        </button>
        <button onClick={() => navigate('/math')} className="rounded-2xl bg-white p-4 text-left shadow-sm">
          <div className="text-3xl">🧮</div><h3 className="mt-2 font-bold text-gray-800">数学练习</h3><p className="mt-1 text-xs leading-5 text-gray-500">{getMathSkill(settings.mathSkillId ?? 'addition-carry')?.title ?? '按知识点练习'}</p>
        </button>
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
        <span>已接触 {progress.learnedWords.length} 个词</span><span>学习连续 {getActiveStreak(progress)} 天</span>
      </div>
      <button onClick={() => navigate('/bridge')} className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm">
        <span><span className="font-bold text-gray-800">家长空间</span><span className="mt-1 block text-xs text-gray-500">课程安排、双科周报与学习设置</span></span><span aria-hidden="true">›</span>
      </button>
      <details className="rounded-2xl bg-white p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-bold text-gray-600">探索其他英语年级</summary>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {gradeCatalog.map(item => <button key={item.id} onClick={() => navigate(`/grade/${item.id}`)} className="rounded-xl bg-gray-50 p-3 text-left"><div className="font-bold" style={{ color: item.color }}>{item.emoji} {item.name}</div><div className="mt-1 text-xs text-gray-500">{item.units.length} 单元 · {getTotalWords(item)} 词</div></button>)}
        </div>
      </details>
    </div>
  )
}
