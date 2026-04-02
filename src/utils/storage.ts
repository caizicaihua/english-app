const STORAGE_KEY = 'english_app_data'

export interface ProgressData {
  completedUnits: Record<string, number> // "grade-unit" -> stars (1-3)
  learnedWords: string[] // word ids
  wrongWords: string[] // word ids
  dailyWords: Record<string, number> // "2024-01-01" -> count
  streak: number
  lastStudyDate: string
  achievements: string[]
}

function getDefaultData(): ProgressData {
  return {
    completedUnits: {},
    learnedWords: [],
    wrongWords: [],
    dailyWords: {},
    streak: 0,
    lastStudyDate: '',
    achievements: [],
  }
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultData()
    return { ...getDefaultData(), ...JSON.parse(raw) }
  } catch {
    return getDefaultData()
  }
}

export function saveProgress(data: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function updateStreak(data: ProgressData): ProgressData {
  const today = new Date().toISOString().slice(0, 10)
  if (data.lastStudyDate === today) return data

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const newStreak = data.lastStudyDate === yesterday ? data.streak + 1 : 1

  return { ...data, streak: newStreak, lastStudyDate: today }
}

export function addDailyWord(data: ProgressData): ProgressData {
  const today = new Date().toISOString().slice(0, 10)
  const updated = updateStreak(data)
  updated.dailyWords = {
    ...updated.dailyWords,
    [today]: (updated.dailyWords[today] || 0) + 1,
  }
  return updated
}

export function markWordLearned(data: ProgressData, wordId: string): ProgressData {
  if (data.learnedWords.includes(wordId)) return data
  return addDailyWord({ ...data, learnedWords: [...data.learnedWords, wordId] })
}

export function addWrongWord(data: ProgressData, wordId: string): ProgressData {
  if (data.wrongWords.includes(wordId)) return data
  return { ...data, wrongWords: [...data.wrongWords, wordId] }
}

export function removeWrongWord(data: ProgressData, wordId: string): ProgressData {
  return { ...data, wrongWords: data.wrongWords.filter(w => w !== wordId) }
}

export function completeUnit(data: ProgressData, gradeId: number, unitId: number, stars: number): ProgressData {
  const key = `${gradeId}-${unitId}`
  const current = data.completedUnits[key] || 0
  if (stars <= current) return data
  return { ...data, completedUnits: { ...data.completedUnits, [key]: stars } }
}

export function addAchievement(data: ProgressData, id: string): ProgressData {
  if (data.achievements.includes(id)) return data
  return { ...data, achievements: [...data.achievements, id] }
}
