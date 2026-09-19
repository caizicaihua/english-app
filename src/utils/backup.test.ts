import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    values,
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value) }),
    removeItem: vi.fn((key: string) => { values.delete(key) }),
  }
}

let local = memoryStorage()
let session = memoryStorage()

beforeEach(() => {
  vi.resetModules()
  local = memoryStorage()
  session = memoryStorage()
  vi.stubGlobal('localStorage', local)
  vi.stubGlobal('sessionStorage', session)
})

afterEach(() => vi.unstubAllGlobals())

describe('safe browser persistence', () => {
  it('migrates once and never rewrites current records on read', async () => {
    const storage = await import('./storage')
    local.values.set('english_app_data', JSON.stringify({ learnedWords: ['1-1-1'] }))
    storage.loadProgress()
    expect(local.setItem).toHaveBeenCalledTimes(1)
    storage.loadProgress()
    storage.loadProgress()
    expect(local.setItem).toHaveBeenCalledTimes(1)
  })

  it('leaves corrupt JSON untouched and does not crash on storage access errors', async () => {
    const storage = await import('./storage')
    local.values.set('english_app_data', '{broken')
    expect(storage.loadProgress().learnedWords).toEqual([])
    expect(local.values.get('english_app_data')).toBe('{broken')
    expect(local.setItem).not.toHaveBeenCalled()
    local.getItem.mockImplementation(() => { throw new Error('denied') })
    expect(() => storage.loadSettings()).not.toThrow()
  })

  it('keeps failed saves in memory, exposes a warning, and retries safely', async () => {
    const storage = await import('./storage')
    const persistence = await import('./persistence')
    const progress = storage.markWordLearned(storage.loadProgress(), '2-1-1')
    local.setItem.mockImplementation(() => { throw new Error('quota') })
    expect(() => storage.saveProgress(progress)).not.toThrow()
    expect(storage.loadProgress().learnedWords).toContain('2-1-1')
    expect(persistence.getPersistenceStatus().available).toBe(false)
    local.setItem.mockImplementation((key, value) => { local.values.set(key, value) })
    expect(persistence.retryPendingWrites()).toBe(true)
    expect(persistence.getPersistenceStatus().available).toBe(true)
    expect(JSON.parse(local.values.get('english_app_data')!).learnedWords).toContain('2-1-1')
  })

  it('retains the last readable record when browser access becomes unavailable', async () => {
    const storage = await import('./storage')
    storage.saveProgress(storage.markWordLearned(storage.loadProgress(), '2-1-1'))
    local.getItem.mockImplementation(() => { throw new Error('denied') })
    expect(storage.loadProgress().learnedWords).toEqual(['2-1-1'])
  })
})

describe('versioned study backups', () => {
  it('round-trips all three datasets and the new learning metadata', async () => {
    const storage = await import('./storage')
    const backup = await import('./backup')
    const now = new Date()
    const date = storage.getLocalDateKey(now)
    const settings = storage.normalizeSettingsData({
      speechSpeed: 'normal', bridgePlan: { enabled: true, gradeId: 2, englishUnitId: 11, semester: 'lower', mathSkillId: 'multiplication-concept', textbook: { english: '校内教材', math: '校内数学', edition: '2026' } },
    })
    storage.saveSettings(settings)
    storage.saveProgress(storage.normalizeProgressData({
      learnedWords: ['2-1-1'],
      englishEvidence: [{ id: 'e1', activityId: 'a1', skill: 'speaking', correct: true, recordedAt: now.toISOString() }],
      planSettingsHistory: [{ effectiveDate: date, settings: settings.bridgePlan }],
      dailyPlans: { [date]: { date, settingsSignature: 's', generatedAt: now.toISOString(), startedAt: now.toISOString(), status: 'study', mathSkillId: 'multiplication-concept', mathQuestionCount: 6, englishActivityId: 'a1', completedTaskIds: ['english_activity'] } },
    }))
    const question = { id: 'q1', reviewKey: 'm1', type: 'calc', prompt: '2 × 3', correctAnswer: '6', sectionLabel: '乘法', expression: '2 × 3', skillId: 'multiplication-concept', difficulty: 1, visual: { rows: 2, columns: 3 }, explanation: '两排三个', sourceReviewKey: 'old' }
    const attempt = { id: 'm1', mode: 'focused', title: '乘法', completedAt: now.toISOString(), durationSeconds: 0, timeSpentSeconds: 60, totalCount: 1, correctCount: 1, score: 1, sections: [], questions: [{ question, userAnswer: '6', isCorrect: true }], skillId: 'multiplication-concept' }
    storage.saveMathProgress(storage.normalizeMathProgressData({ latestAttempt: attempt, attemptHistory: [attempt], skillProgress: { 'multiplication-concept': { bestScore: 100, lastAttempt: attempt, completedCount: 1 } } }))
    const exported = backup.createStudyBackup()
    expect(backup.parseStudyBackup(JSON.stringify(exported))).toEqual(exported)
    expect(backup.resetStudyData(false).success).toBe(true)
    expect(backup.importStudyBackup(exported).success).toBe(true)
    expect(storage.loadProgress()).toEqual(exported.data.progress)
    expect(storage.loadMathProgress()).toEqual(exported.data.math)
    expect(storage.loadSettings()).toEqual(exported.data.settings)
  })

  it.each(['syntax', 'version', 'missing', 'nested', 'date', 'future-schema'] as const)('rejects %s damage without modifying existing data', async kind => {
    const storage = await import('./storage')
    const backup = await import('./backup')
    storage.saveProgress(storage.markWordLearned(storage.loadProgress(), '2-1-1'))
    const value = backup.createStudyBackup()
    const broken = JSON.parse(JSON.stringify(value))
    if (kind === 'version') broken.version = 9
    if (kind === 'missing') delete broken.data.math
    if (kind === 'nested') broken.data.progress.wordMastery['2-1-1'].level = 99
    if (kind === 'date') broken.exportedAt = 'yesterday'
    if (kind === 'future-schema') broken.data.settings.schemaVersion = 999
    const before = new Map(local.values)
    expect(() => backup.parseStudyBackup(kind === 'syntax' ? '{bad' : JSON.stringify(broken))).toThrow()
    expect(local.values).toEqual(before)
  })

  it.each(['quick-score', 'paper-score', 'total', 'correct', 'score', 'section-total', 'section-correct', 'answer-flag'] as const)('rejects inconsistent math %s', async kind => {
    const storage = await import('./storage')
    const backup = await import('./backup')
    const value = backup.createStudyBackup()
    value.data.math = storage.normalizeMathProgressData({ latestAttempt: {
      id: 'a1', mode: 'focused', title: '专项', completedAt: new Date().toISOString(), durationSeconds: 0, timeSpentSeconds: 20,
      totalCount: 1, correctCount: 1, score: 1, questions: [{
        question: { id: 'q1', type: 'calc', reviewKey: 'q1', prompt: '2 + 3', expression: '2 + 3', correctAnswer: '5', sectionLabel: '计算' },
        userAnswer: '5', isCorrect: true,
      }],
    } })
    const attempt = value.data.math.latestAttempt!
    if (kind === 'quick-score') value.data.math.modeProgress.quick = { bestScore: 999, lastAttempt: null, completedCount: 1 }
    if (kind === 'paper-score') value.data.math.modeProgress.paper = { bestScore: 101, lastAttempt: null, completedCount: 1 }
    if (kind === 'total') attempt.totalCount = 2
    if (kind === 'correct') attempt.correctCount = 2
    if (kind === 'score') attempt.score = 2
    if (kind === 'section-total') attempt.sections[0].totalCount = 2
    if (kind === 'section-correct') attempt.sections[0].correctCount = 2
    if (kind === 'answer-flag') attempt.questions[0].isCorrect = false
    expect(() => backup.parseStudyBackup(JSON.stringify(value))).toThrow('无效字段')
    expect(local.setItem).not.toHaveBeenCalled()
  })

  it('still restores valid legacy summaries without per-question details', async () => {
    const storage = await import('./storage')
    const backup = await import('./backup')
    const attempt = {
      id: 'legacy', mode: 'paper', title: '整卷', completedAt: new Date().toISOString(), durationSeconds: 900,
      timeSpentSeconds: 400, totalCount: 100, correctCount: 82, score: 82, sections: [], questions: [],
    }
    storage.saveMathProgress(storage.normalizeMathProgressData({ bestScore: 91, lastAttempt: attempt, latestAttempt: attempt }))
    const exported = backup.createStudyBackup()
    expect(backup.parseStudyBackup(JSON.stringify(exported))).toEqual(exported)
    expect(exported.data.math.latestAttempt).toMatchObject({ totalCount: 100, correctCount: 82, score: 82 })
    expect(exported.data.math.modeProgress.paper?.bestScore).toBe(91)
  })

  it('can restore its own export after locally repairing invalid math aggregates', async () => {
    const backup = await import('./backup')
    local.values.set('english_app_math_data', JSON.stringify({
      schemaVersion: 3,
      modeProgress: { quick: { bestScore: 999, completedCount: 1, lastAttempt: null } },
      latestAttempt: { id: 'damaged', mode: 'quick', title: '快速练', completedAt: new Date().toISOString(), totalCount: 20, correctCount: 999, score: 999, questions: [], sections: [] },
    }))
    const exported = backup.createStudyBackup()
    expect(exported.data.math.modeProgress.quick?.bestScore).toBe(20)
    expect(exported.data.math.latestAttempt?.correctCount).toBe(20)
    expect(backup.parseStudyBackup(JSON.stringify(exported))).toEqual(exported)
  })

  it('rolls back all earlier writes when a multi-key import fails', async () => {
    const storage = await import('./storage')
    const backup = await import('./backup')
    storage.saveProgress(storage.markWordLearned(storage.loadProgress(), '1-1-1'))
    storage.saveSettings(storage.loadSettings())
    storage.saveMathProgress(storage.loadMathProgress())
    const incoming = backup.createStudyBackup()
    incoming.data.progress = storage.markWordLearned(incoming.data.progress, '2-1-1')
    const before = new Map(local.values)
    local.setItem.mockImplementation((key, value) => {
      if (key === 'english_app_settings') throw new Error('quota')
      local.values.set(key, value)
    })
    const result = backup.importStudyBackup(incoming)
    expect(result.success).toBe(false)
    expect(local.values).toEqual(before)
    expect(storage.loadProgress().learnedWords).toEqual(['1-1-1'])
    expect(result.previous.data.progress.learnedWords).toEqual(['1-1-1'])
  })

  it('keeps the original memory copy when the browser rejects rollback too', async () => {
    const storage = await import('./storage')
    const backup = await import('./backup')
    const persistence = await import('./persistence')
    storage.saveProgress(storage.markWordLearned(storage.loadProgress(), '1-1-1'))
    const incoming = backup.createStudyBackup()
    incoming.data.progress = storage.markWordLearned(incoming.data.progress, '2-1-1')
    let writes = 0
    local.setItem.mockImplementation((key, value) => {
      writes++
      if (writes > 1) throw new Error('quota')
      local.values.set(key, value)
    })
    expect(backup.importStudyBackup(incoming).success).toBe(false)
    expect(storage.loadProgress().learnedWords).toEqual(['1-1-1'])
    expect(persistence.getPersistenceStatus().pendingKeys).toContain('english_app_data')
  })

  it('resets both subjects and drafts while explicitly preserving or removing settings', async () => {
    const storage = await import('./storage')
    const backup = await import('./backup')
    storage.saveSettings({ ...storage.loadSettings(), speechSpeed: 'normal' })
    storage.saveProgress(storage.markWordLearned(storage.loadProgress(), '2-1-1'))
    storage.saveMathProgress(storage.loadMathProgress())
    session.values.set('english_app_math_practice_draft', 'draft')
    session.values.set('english_app_english_activity_drafts', 'draft')
    expect(backup.resetStudyData(true)).toEqual({ success: true, draftCleared: true })
    expect(storage.loadProgress().learnedWords).toEqual([])
    expect(storage.loadSettings().speechSpeed).toBe('normal')
    expect(session.values.size).toBe(0)
    backup.resetStudyData(false)
    expect(local.values.has('english_app_settings')).toBe(false)
  })
})
