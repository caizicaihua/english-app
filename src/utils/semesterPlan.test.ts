import { describe, expect, it } from 'vitest'
import { defaultBridgePlanSettings } from '../data/bridgePlan'
import { buildDailyStudyPlan, completeDailyTask, getDailyTaskIds, getOrCreateDailyStudyPlan, getStudyDayStatus, saveDailyStudyPlan, startDailyTask } from './studyPlan'
import { normalizeMathProgressData, normalizeProgressData, markWordLearned } from './storage'
import { recordPlanSettings } from './planHistory'
import { buildWeeklyReport } from './weeklyReport'

const settings = { ...defaultBridgePlanSettings, enabled: true, startDate: '2026-07-01' }
const friday = new Date(2026, 8, 18, 12)

describe('semester learning', () => {
  it('continues after six weeks without requiring the old diagnostic', () => {
    const plan = buildDailyStudyPlan(normalizeProgressData(undefined), settings, friday)
    expect(plan.status).toBe('study')
    expect(plan.includeDiagnostic).toBe(false)
    expect(plan.includeMath).toBe(true)
    expect(plan.newWordIds.every(id => id.startsWith('2-1-'))).toBe(true)
    expect(plan.englishActivityId).toBe('grade2-family')
  })

  it('selects the school unit including units beyond the former preview', () => {
    const plan = buildDailyStudyPlan(normalizeProgressData(undefined), { ...settings, englishUnitId: 10 }, friday)
    expect(plan.newWordIds.length).toBeGreaterThan(0)
    expect(plan.newWordIds.every(id => id.startsWith('2-10-'))).toBe(true)
    expect(plan.englishActivityId).toBeUndefined()
    expect(plan.quizQuestionCount).toBeGreaterThan(0)
  })

  it('distinguishes disabled, future, rest and ended legacy plans', () => {
    expect(getStudyDayStatus(friday, { ...settings, enabled: false })).toBe('disabled')
    expect(getStudyDayStatus(friday, { ...settings, startDate: '2026-09-21' })).toBe('not-started')
    expect(getStudyDayStatus(new Date(2026, 8, 19), settings)).toBe('rest')
    expect(getStudyDayStatus(friday, { ...settings, mode: 'bridge' })).toBe('ended')
  })

  it('rejects unplanned completions and remains idempotent', () => {
    const base = normalizeProgressData(undefined)
    const plan = { ...buildDailyStudyPlan(base, settings, friday), includeMath: false }
    let progress = saveDailyStudyPlan(base, plan)
    expect(completeDailyTask(progress, plan.date, 'math')).toBe(progress)
    progress = completeDailyTask(progress, plan.date, 'new_words')
    expect(completeDailyTask(progress, plan.date, 'new_words')).toBe(progress)
  })

  it('preserves a started day when changing the current course', () => {
    const base = normalizeProgressData(undefined)
    const plan = buildDailyStudyPlan(base, settings, friday)
    const progress = completeDailyTask(saveDailyStudyPlan(base, plan), plan.date, 'new_words')
    const newSettings = { ...settings, englishUnitId: 8, mathSkillId: 'multiplication-concept' }
    expect(getOrCreateDailyStudyPlan(progress, newSettings, friday)).toEqual(progress.dailyPlans[plan.date])
    const updated = recordPlanSettings(progress, newSettings, friday)
    expect(updated.planSettingsHistory?.at(-1)?.effectiveDate).toBe('2026-09-19')
    const next = getOrCreateDailyStudyPlan(updated, newSettings, new Date(2026, 8, 21, 12))
    expect(next.englishActivityId).toBe('grade2-classroom')
    expect(next.mathSkillId).toBe('multiplication-concept')
  })

  it('freezes partially started work before an entire task is complete', () => {
    const base = normalizeProgressData(undefined)
    const plan = buildDailyStudyPlan(base, settings, friday)
    const stored = saveDailyStudyPlan(base, plan)
    const started = startDailyTask(stored, plan.date, 'new_words')
    expect(started.dailyPlans[plan.date].startedAt).toBeDefined()
    expect(startDailyTask(started, plan.date, 'new_words')).toBe(started)
    const partiallyLearned = markWordLearned(stored, plan.newWordIds[0], new Date(friday.getTime() + 1000))
    const changedSettings = { ...settings, englishUnitId: 8 }
    expect(getOrCreateDailyStudyPlan(partiallyLearned, changedSettings, friday)).toEqual(plan)
    expect(recordPlanSettings(partiallyLearned, changedSettings, friday).planSettingsHistory?.at(-1)?.effectiveDate).toBe('2026-09-19')
  })

  it('bounds combined daily work even when many old words are due', () => {
    const base = normalizeProgressData({ learnedWords: Array.from({ length: 20 }, (_, i) => `1-1-${i + 1}`) }, friday)
    for (const state of Object.values(base.wordMastery)) state.nextReviewDate = '2026-09-01'
    const plan = buildDailyStudyPlan(base, { ...settings, dailyMinutes: 10 }, friday)
    expect(plan.reviewWordIds.length + plan.verificationWordIds.length + plan.newWordIds.length).toBeLessThanOrEqual(3)
    expect(plan.mathQuestionCount).toBe(6)
    expect(plan.englishActivityId).toBeUndefined()
    expect(plan.quizQuestionCount).toBe(0)
  })
})

describe('semester report integrity', () => {
  it('includes unvisited scheduled days and excludes future days', () => {
    let progress = recordPlanSettings(normalizeProgressData(undefined), settings, new Date(2026, 8, 14, 9))
    const plan = buildDailyStudyPlan(progress, settings, new Date(2026, 8, 14, 9))
    progress = saveDailyStudyPlan(progress, { ...plan, completedTaskIds: getDailyTaskIds(plan) })
    const report = buildWeeklyReport(progress, normalizeMathProgressData(undefined), new Date(2026, 8, 16, 12), settings)
    expect(report.scheduledStudyDays).toBe(3)
    expect(report.completedStudyDays).toBe(1)
    expect(report.scheduleCompletionRate).toBe(33)
  })

  it('never reports more than 100 percent even with corrupt completion ids', () => {
    const base = normalizeProgressData(undefined)
    const plan = { ...buildDailyStudyPlan(base, settings, friday), includeMath: false }
    const progress = saveDailyStudyPlan(base, { ...plan, completedTaskIds: [...getDailyTaskIds(plan), 'math', 'math'] })
    const report = buildWeeklyReport(progress, normalizeMathProgressData(undefined), friday, settings)
    expect(report.completionRate).toBe(100)
    expect(report.completedTaskCount).toBe(getDailyTaskIds(plan).length)
  })

  it('shows partial English activity without claiming a completed task', () => {
    const progress = { ...normalizeProgressData(undefined), englishEvidence: [{ id: 'partial-1', activityId: 'grade2-food', skill: 'reading' as const, correct: true, recordedAt: friday.toISOString() }] }
    const report = buildWeeklyReport(progress, normalizeMathProgressData(undefined), friday, settings)
    expect(report.hasActivity).toBe(true)
    expect(report.studyDays).toBe(1)
    expect(report.completedTaskCount).toBe(0)
    expect(report.englishSkills.find(item => item.skill === 'reading')?.total).toBe(1)
  })

  it('does not infer skill evidence from legacy mastery', () => {
    const progress = normalizeProgressData({ learnedWords: ['2-1-1'] }, friday)
    const report = buildWeeklyReport(progress, normalizeMathProgressData(undefined), friday, settings)
    expect(report.englishSkills.every(item => item.total === 0)).toBe(true)
  })
})
