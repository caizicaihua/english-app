import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BridgePlanSettings } from '../data/bridgePlan'
import { gradeCatalog } from '../data/words'
import { mathSkills } from '../data/mathSkills'
import { getLocalDateKey, loadProgress, loadSettings, saveProgress, saveSettings } from '../utils/storage'
import { recordPlanSettings } from '../utils/planHistory'

const fieldClass = 'mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-gray-800'

export default function BridgeSetupPage() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState<BridgePlanSettings>(() => {
    const saved = loadSettings().bridgePlan
    return { ...saved, mode: 'semester', startDate: saved.startDate || getLocalDateKey() }
  })
  const grade = gradeCatalog.find(item => item.id === (plan.gradeId ?? 2))!
  const textbook = plan.textbook ?? { english: '', math: '', edition: '' }
  const setField = <K extends keyof BridgePlanSettings>(key: K, value: BridgePlanSettings[K]) => {
    setPlan(current => ({ ...current, [key]: value }))
  }
  const save = () => {
    const next = { ...plan, mode: 'semester' as const, enabled: true }
    saveProgress(recordPlanSettings(loadProgress(), next))
    saveSettings({ ...loadSettings(), bridgePlan: next })
    navigate('/bridge/today')
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">家长设置</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-800">跟着学校的节奏学</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">两科共用每天的学习时间。调整进度会保留成绩，已开始的今日任务保持不变，新安排从明天生效。</p>
      </div>
      <form onSubmit={event => { event.preventDefault(); save() }} className="space-y-4">
        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="font-bold text-gray-800">当前课程</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-600">年级
              <select className={fieldClass} value={plan.gradeId ?? 2} onChange={event => setPlan(current => ({ ...current, gradeId: Number(event.target.value), englishUnitId: 1 }))}>
                {gradeCatalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-600">学期
              <select className={fieldClass} value={plan.semester ?? 'upper'} onChange={event => setField('semester', event.target.value as 'upper' | 'lower')}>
                <option value="upper">上学期</option><option value="lower">下学期</option>
              </select>
            </label>
          </div>
          <label className="block text-sm text-gray-600">英语当前主题
            <select className={fieldClass} value={plan.englishUnitId ?? 1} onChange={event => setField('englishUnitId', Number(event.target.value))}>
              {grade.units.map(unit => <option key={unit.id} value={unit.id}>{unit.nameZh} · {unit.name}</option>)}
            </select>
          </label>
          <label className="block text-sm text-gray-600">数学当前知识点
            <select className={fieldClass} value={plan.mathSkillId ?? 'addition-carry'} onChange={event => setField('mathSkillId', event.target.value)}>
              {mathSkills.map(skill => <option key={skill.id} value={skill.id}>{skill.title}</option>)}
            </select>
          </label>
          <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">当前为通用主题与能力练习。学期标签用于安排学习，不代表已与教材章节同步；数学先选学校正在学习的知识点。</p>
        </section>
        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="font-bold text-gray-800">学习节奏</h3>
          <label className="block text-sm text-gray-600">开始日期
            <input required type="date" className={fieldClass} value={plan.startDate} onChange={event => setField('startDate', event.target.value)} />
          </label>
          <label className="block text-sm text-gray-600">学习日
            <select className={fieldClass} value={plan.studyDaysPerWeek} onChange={event => setField('studyDaysPerWeek', Number(event.target.value) as 3 | 4 | 5)}>
              <option value={3}>每周 3 天 · 周一、三、五</option>
              <option value={4}>每周 4 天 · 周一、二、四、五</option>
              <option value={5}>每周 5 天 · 周一至周五</option>
            </select>
          </label>
          <label className="block text-sm text-gray-600">每天两科合计
            <select className={fieldClass} value={plan.dailyMinutes} onChange={event => setField('dailyMinutes', Number(event.target.value) as 10 | 15 | 20)}>
              {[10, 15, 20].map(minutes => <option key={minutes} value={minutes}>约 {minutes} 分钟</option>)}
            </select>
          </label>
          <label className="block text-sm text-gray-600">学习侧重
            <select className={fieldClass} value={plan.focus} onChange={event => setField('focus', event.target.value as BridgePlanSettings['focus'])}>
              <option value="balanced">两科均衡</option><option value="english">英语多一点</option><option value="math">数学多一点</option>
            </select>
          </label>
          <p className="text-xs leading-5 text-gray-500">先复习，再学少量新内容。不补欠下的任务，日常数学不限时。</p>
        </section>
        <details className="rounded-2xl bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-sm font-bold text-gray-700">教材备注（可选）</summary>
          <p className="mt-2 text-xs text-gray-500">记录出版社与版次，方便之后对齐学校内容。</p>
          {([{ key: 'english', label: '英语教材 / 出版社' }, { key: 'math', label: '数学教材 / 出版社' }, { key: 'edition', label: '版次 / 年份' }] as const).map(item => (
            <label key={item.key} className="mt-3 block text-sm text-gray-600">{item.label}
              <input maxLength={100} className={fieldClass} value={textbook[item.key]} onChange={event => setField('textbook', { ...textbook, [item.key]: event.target.value })} />
            </label>
          ))}
        </details>
        <button type="submit" className="w-full rounded-2xl bg-primary py-4 font-bold text-white shadow-md">保存学习计划</button>
      </form>
    </div>
  )
}
