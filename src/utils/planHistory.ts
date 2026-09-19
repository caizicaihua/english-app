import type { BridgePlanSettings } from '../data/bridgePlan'
import { addLocalDays } from './mastery'
import { getLocalDateKey, type ProgressData } from './storage'
import { hasStartedDailyPlan } from './studyPlan'

export function recordPlanSettings(
  progress: ProgressData,
  settings: BridgePlanSettings,
  date = new Date(),
): ProgressData {
  const today = getLocalDateKey(date)
  const plan = progress.dailyPlans[today]
  const startedToday = plan && hasStartedDailyPlan(progress, plan)
  const effectiveDate = startedToday ? addLocalDays(today, 1) : today
  const history = progress.planSettingsHistory ?? []
  return {
    ...progress,
    planSettingsHistory: [
      ...history.filter(item => item.effectiveDate !== effectiveDate),
      { effectiveDate, settings: { ...settings, textbook: settings.textbook ? { ...settings.textbook } : undefined } },
    ].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate)),
  }
}

export function ensurePlanHistory(progress: ProgressData, settings: BridgePlanSettings): ProgressData {
  if (!settings.enabled || progress.planSettingsHistory?.length) return progress
  return { ...progress, planSettingsHistory: [{ effectiveDate: getLocalDateKey(), settings }] }
}
