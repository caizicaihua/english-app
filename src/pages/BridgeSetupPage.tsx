import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BridgePlanSettings } from '../data/bridgePlan'
import {
  getLocalDateKey,
  loadSettings,
  saveSettings,
} from '../utils/storage'

const studyDayOptions: Array<{ value: 3 | 4 | 5; label: string }> = [
  { value: 3, label: '每周 3 天' },
  { value: 4, label: '每周 4 天' },
  { value: 5, label: '每周 5 天' },
]

const dailyMinuteOptions: Array<{ value: 10 | 15 | 20; label: string }> = [
  { value: 10, label: '10 分钟' },
  { value: 15, label: '15 分钟' },
  { value: 20, label: '20 分钟' },
]

const focusOptions: Array<{
  value: BridgePlanSettings['focus']
  label: string
  description: string
}> = [
  { value: 'balanced', label: '均衡', description: '英语和数学都练一点' },
  { value: 'english', label: '英语优先', description: '增加英语新词名额' },
  { value: 'math', label: '数学优先', description: '减少新词，数学每周 3 次' },
]

export default function BridgeSetupPage() {
  const navigate = useNavigate()
  const settings = loadSettings()
  const [plan, setPlan] = useState<BridgePlanSettings>(() => ({
    ...settings.bridgePlan,
    startDate: settings.bridgePlan.startDate || getLocalDateKey(),
  }))

  const handleSave = () => {
    saveSettings({
      ...settings,
      bridgePlan: {
        ...plan,
        enabled: true,
      },
    })
    navigate('/bridge')
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mb-2 text-5xl">🌻</div>
        <h2 className="text-2xl font-bold text-gray-800">设置暑假学习计划</h2>
        <p className="mt-2 text-sm text-gray-500">每天少一点，坚持六周更轻松</p>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <label htmlFor="bridge-start-date" className="text-sm font-bold text-gray-700">
            计划开始日期
          </label>
          <input
            id="bridge-start-date"
            type="date"
            value={plan.startDate}
            onChange={event => setPlan(current => ({
              ...current,
              startDate: event.target.value,
            }))}
            className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700"
          />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-gray-700">每周学习天数</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {studyDayOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPlan(current => ({
                  ...current,
                  studyDaysPerWeek: option.value,
                }))}
                className={`rounded-xl px-2 py-3 text-sm font-bold ${
                  plan.studyDaysPerWeek === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-gray-700">每天学习时长</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {dailyMinuteOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPlan(current => ({
                  ...current,
                  dailyMinutes: option.value,
                }))}
                className={`rounded-xl px-2 py-3 text-sm font-bold ${
                  plan.dailyMinutes === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-gray-700">学习侧重</div>
          <div className="mt-3 space-y-2">
            {focusOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPlan(current => ({ ...current, focus: option.value }))}
                className={`w-full rounded-xl border px-4 py-3 text-left ${
                  plan.focus === option.value
                    ? 'border-primary bg-indigo-50'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="text-sm font-bold text-gray-700">{option.label}</div>
                <div className="mt-0.5 text-xs text-gray-400">{option.description}</div>
              </button>
            ))}
          </div>
        </section>

        <label className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <div className="text-sm font-bold text-gray-700">开启二年级预习</div>
            <div className="mt-1 text-xs text-gray-400">一年级复习不拥挤时，每天最多 5 个新词</div>
          </div>
          <input
            type="checkbox"
            checked={plan.previewGrade2}
            onChange={event => setPlan(current => ({
              ...current,
              previewGrade2: event.target.checked,
            }))}
            className="h-5 w-5 accent-indigo-600"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!plan.startDate}
        className="mt-6 w-full rounded-2xl bg-primary py-3.5 font-bold text-white shadow-md active:scale-[0.98] disabled:opacity-40"
      >
        保存并生成六周计划
      </button>
    </div>
  )
}
