import { motion } from 'framer-motion'

interface DailyTaskCardProps {
  icon: string
  title: string
  description: string
  countLabel: string
  completed: boolean
  canMarkComplete?: boolean
  onOpen: () => void | Promise<void>
  onComplete: () => void
}

export default function DailyTaskCard({
  icon,
  title,
  description,
  countLabel,
  completed,
  canMarkComplete = true,
  onOpen,
  onComplete,
}: DailyTaskCardProps) {
  return (
    <motion.div
      layout
      className={`rounded-2xl border p-4 shadow-sm ${
        completed
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-white bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
          {completed ? '✅' : icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-gray-800">{title}</h3>
            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
              {countLabel}
            </span>
          </div>
          <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            void onOpen()
          }}
          className="rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-white active:scale-95"
        >
          打开内容
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={completed || !canMarkComplete}
          className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-bold text-gray-600 active:scale-95 disabled:text-emerald-600"
        >
          {completed
            ? '已完成'
            : canMarkComplete
              ? '完成打卡'
              : '完成小节后记录'}
        </button>
      </div>
    </motion.div>
  )
}
