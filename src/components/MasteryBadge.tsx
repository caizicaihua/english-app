import type { MasteryLevel, WordLearningState } from '../data/bridgePlan'

const masteryStyles: Record<MasteryLevel, {
  label: string
  className: string
}> = {
  0: {
    label: '未接触',
    className: 'bg-gray-100 text-gray-500',
  },
  1: {
    label: '初次学习',
    className: 'bg-amber-50 text-amber-700',
  },
  2: {
    label: '需要巩固',
    className: 'bg-orange-50 text-orange-700',
  },
  3: {
    label: '基本掌握',
    className: 'bg-emerald-50 text-emerald-700',
  },
  4: {
    label: '熟练掌握',
    className: 'bg-indigo-50 text-indigo-700',
  },
}

interface MasteryBadgeProps {
  state?: WordLearningState
}

export default function MasteryBadge({ state }: MasteryBadgeProps) {
  const level = state?.level ?? 0
  const style = masteryStyles[level]

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${style.className}`}>
      {style.label}
    </span>
  )
}
