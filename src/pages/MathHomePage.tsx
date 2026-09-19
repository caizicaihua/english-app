import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mathSkills, getMathSkill } from '../data/mathSkills'
import { getMathModeProgress, getMathSkillProgress, loadMathProgress, loadSettings } from '../utils/storage'

export default function MathHomePage() {
  const navigate = useNavigate()
  const progress = loadMathProgress()
  const [count, setCount] = useState(8)
  const currentSkill = getMathSkill(loadSettings().bridgePlan.mathSkillId)
  const quickProgress = getMathModeProgress(progress, 'quick')
  const paperProgress = getMathModeProgress(progress, 'paper')

  return (
    <div>
      <div className="mb-5 text-center">
        <div className="mb-2 text-5xl">🧮</div>
        <h2 className="text-2xl font-bold text-gray-800">二年级数学练习</h2>
        <p className="mt-1 text-sm text-gray-500">通用能力练习 · 跟着学校进度选知识点</p>
      </div>

      <div className="mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-5 text-white shadow-md">
        <div className="text-xs font-bold text-indigo-100">当前学习方向</div>
        <h3 className="mt-2 text-xl font-bold">{currentSkill.title}</h3>
        <p className="mt-2 text-sm text-indigo-100">{currentSkill.description} 不限时，可以暂停。</p>
        <button onClick={() => navigate(`/math/practice?mode=focused&skill=${currentSkill.id}&count=${count}`)} className="mt-4 w-full rounded-xl bg-white py-3 font-bold text-indigo-600">
          开始 {count} 题专项练习
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-bold text-gray-800">今天想练什么</h3>
        <div className="flex gap-1" aria-label="专项题量">
          {[6, 8, 10].map(value => <button key={value} onClick={() => setCount(value)} aria-pressed={count === value} className={`rounded-lg px-3 py-2 text-sm font-bold ${count === value ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}>{value} 题</button>)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {mathSkills.map(skill => {
          const stats = getMathSkillProgress(progress, skill.id)
          return (
            <button key={skill.id} onClick={() => navigate(`/math/practice?mode=focused&skill=${skill.id}&count=${count}`)} className="rounded-2xl bg-white p-4 text-left shadow-sm">
              <div className="text-xs text-indigo-500">{skill.group} · {['起步', '巩固', '进阶'][skill.difficulty - 1]}</div>
              <div className="mt-1 font-bold text-gray-800">{skill.title}</div>
              <p className="mt-2 text-xs leading-5 text-gray-500">{skill.description}</p>
              <div className="mt-3 text-xs font-semibold text-primary">{stats.completedCount > 0 ? `已练 ${stats.completedCount} 次 · 最高正确率 ${stats.bestScore}%` : '开始练习 →'}</div>
            </button>
          )
        })}
      </div>

      <button onClick={() => navigate('/math/wrong-book')} className="my-5 w-full rounded-xl bg-amber-50 py-3 font-bold text-amber-700">数学错题本 · {progress.wrongQuestions.length} 题</button>

      <details className="rounded-2xl bg-white p-4 shadow-sm">
        <summary className="cursor-pointer font-bold text-gray-800">可选计时挑战</summary>
        <p className="mt-2 text-xs leading-5 text-gray-500">保留原有口算挑战；切到后台和离开页面后仍计时。快速练、整卷和每个专项分别记录成绩。</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/math/practice?mode=quick')} className="rounded-xl bg-indigo-50 p-3 text-sm font-bold text-indigo-700">20 题 / 5 分钟<span className="mt-1 block text-xs font-normal">最高 {quickProgress.bestScore}/20</span></button>
          <button onClick={() => navigate('/math/practice?mode=paper')} className="rounded-xl bg-indigo-50 p-3 text-sm font-bold text-indigo-700">100 题 / 15 分钟<span className="mt-1 block text-xs font-normal">最高 {paperProgress.bestScore}/100</span></button>
        </div>
      </details>
    </div>
  )
}
