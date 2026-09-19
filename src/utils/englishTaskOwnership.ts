import type { DailyTaskId } from '../data/bridgePlan'
import type { ProgressData } from './storage'
import { completeDailyTask } from './studyPlan'

/** Completion belongs to the task opened by the child, even after midnight. */
export function completeEnglishDailyTask(
  progress: ProgressData,
  taskDate: string | null | undefined,
  taskId: DailyTaskId,
  activityId?: string,
): ProgressData {
  if (!taskDate) return progress
  const plan = progress.dailyPlans[taskDate]
  if (!plan || (activityId && plan.englishActivityId !== activityId)) return progress
  return completeDailyTask(progress, taskDate, taskId)
}
