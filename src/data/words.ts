import { gradeCatalog } from './gradeCatalog'
import type { Grade, GradeSummary, UnitSummary, Word } from './gradeTypes'

export type { Dialogue, DialogueLine, Grade, GradeSummary, Unit, UnitSummary, Word } from './gradeTypes'

export { gradeCatalog }

const gradeLoaders: Record<number, () => Promise<Grade>> = {
  1: () => import('./grades/grade1').then(module => module.grade1),
  2: () => import('./grades/grade2').then(module => module.grade2),
  3: () => import('./grades/grade3').then(module => module.grade3),
  4: () => import('./grades/grade4').then(module => module.grade4),
  5: () => import('./grades/grade5').then(module => module.grade5),
  6: () => import('./grades/grade6').then(module => module.grade6),
}

const gradeCache = new Map<number, Promise<Grade>>()

function getGradeIdFromWordId(id: string): number | undefined {
  const gradeId = Number(id.split('-')[0])
  return Number.isFinite(gradeId) ? gradeId : undefined
}

export function getGradeSummary(id: number): GradeSummary | undefined {
  return gradeCatalog.find(grade => grade.id === id)
}

export function getUnitSummary(gradeId: number, unitId: number): UnitSummary | undefined {
  return getGradeSummary(gradeId)?.units.find(unit => unit.id === unitId)
}

export async function loadGrade(id: number): Promise<Grade | undefined> {
  const loader = gradeLoaders[id]
  if (!loader) return undefined

  const cached = gradeCache.get(id)
  if (cached) return cached

  const promise = loader()
  gradeCache.set(id, promise)
  return promise
}

export async function loadUnit(gradeId: number, unitId: number) {
  const grade = await loadGrade(gradeId)
  return grade?.units.find(unit => unit.id === unitId)
}

export async function loadWordById(id: string): Promise<Word | undefined> {
  const gradeId = getGradeIdFromWordId(id)
  if (!gradeId) return undefined

  const grade = await loadGrade(gradeId)
  if (!grade) return undefined

  for (const unit of grade.units) {
    const word = unit.words.find(item => item.id === id)
    if (word) return word
  }

  return undefined
}

export async function loadWordsByIds(ids: string[]): Promise<Word[]> {
  const uniqueGradeIds = [...new Set(ids.map(getGradeIdFromWordId).filter((id): id is number => !!id))]
  const grades = await Promise.all(uniqueGradeIds.map(id => loadGrade(id)))
  const wordMap = new Map<string, Word>()

  for (const grade of grades) {
    if (!grade) continue
    for (const unit of grade.units) {
      for (const word of unit.words) {
        wordMap.set(word.id, word)
      }
    }
  }

  return ids.map(id => wordMap.get(id)).filter((word): word is Word => !!word)
}

export function getTotalWords(summary: GradeSummary): number {
  return summary.units.reduce((total, unit) => total + unit.wordIds.length, 0)
}
