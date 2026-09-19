import { useNavigate } from 'react-router-dom'
import { gradeCatalog } from '../data/words'
import { getMathSkill } from '../data/mathSkills'
import { loadProgress, loadSettings } from '../utils/storage'

export default function BridgeHomePage() {
  const navigate = useNavigate()
  const settings = loadSettings().bridgePlan
  const progress = loadProgress()
  const grade = gradeCatalog.find(item => item.id === (settings.gradeId ?? 2))!
  const unit = grade.units.find(item => item.id === (settings.englishUnitId ?? 1)) ?? grade.units[0]

  return (
    <div className="space-y-4">
      <div className="mb-6"><p className="text-sm font-semibold text-primary">一起陪孩子长大</p><h2 className="mt-1 text-2xl font-bold text-gray-800">家长空间</h2></div>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="font-bold text-gray-800">{grade.name} · {settings.semester === 'lower' ? '下' : '上'}学期计划</h3>
        <p className="mt-2 text-sm leading-7 text-gray-600">英语：{unit.nameZh}<br />数学：{getMathSkill(settings.mathSkillId ?? 'addition-carry')?.title ?? '加减巩固'}<br />每周 {settings.studyDaysPerWeek} 天 · 每天两科合计约 {settings.dailyMinutes} 分钟</p>
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">当前使用通用主题与能力练习。请按学校实际进度选择单元；未绑定教材章节。</p>
        <button onClick={() => navigate('/bridge/setup')} className="mt-4 w-full rounded-xl bg-primary py-3 font-bold text-white">{settings.enabled ? '调整课程与节奏' : '开启学习计划'}</button>
      </section>
      <button onClick={() => navigate('/bridge/report')} className="w-full rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5 text-left"><span className="text-2xl">📋</span><span className="mt-2 block font-bold text-indigo-900">本周双科学习报告</span><span className="mt-1 block text-sm text-indigo-700">看学习证据、薄弱项和下一步建议</span></button>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/bridge/today')} className="rounded-2xl bg-white p-4 text-left shadow-sm">🚀 <span className="mt-2 block font-bold text-gray-700">今日任务</span></button>
        <button onClick={() => navigate('/settings')} className="rounded-2xl bg-white p-4 text-left shadow-sm">💾 <span className="mt-2 block font-bold text-gray-700">设置与备份</span></button>
      </div>
      <section className="rounded-2xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700">可选：一年级英语基础自测</h3>
        <p className="mt-2 text-xs leading-5 text-gray-500">每次 4–9 题，可分几次完成。不影响直接开始二年级学习。</p>
        <button onClick={() => navigate(progress.diagnosticResults.length && !progress.diagnosticDraft ? '/bridge/diagnostic/result' : '/bridge/diagnostic')} className="mt-3 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary">{progress.diagnosticDraft ? '继续基础自测' : progress.diagnosticResults.length ? '查看自测结果' : '开始基础自测'}</button>
      </section>
    </div>
  )
}
