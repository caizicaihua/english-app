import { describe, expect, it } from 'vitest'
import { gradeCatalog } from './gradeCatalog'
import { grade1 } from './grades/grade1'
import { grade2 } from './grades/grade2'
import { grade3 } from './grades/grade3'
import { grade4 } from './grades/grade4'
import { grade5 } from './grades/grade5'
import { grade6 } from './grades/grade6'

const grades = [grade1, grade2, grade3, grade4, grade5, grade6]

describe('word catalog', () => {
  it('keeps every word id unique and synchronized with the lightweight catalog', () => {
    const dataIds = grades.flatMap(grade =>
      grade.units.flatMap(unit => unit.words.map(word => word.id))
    )
    const catalogIds = gradeCatalog.flatMap(grade =>
      grade.units.flatMap(unit => unit.wordIds)
    )

    expect(new Set(dataIds).size).toBe(dataIds.length)
    expect(new Set(catalogIds).size).toBe(catalogIds.length)
    expect([...dataIds].sort()).toEqual([...catalogIds].sort())
  })

  it('keeps ids aligned with their owning grade and unit', () => {
    for (const grade of grades) {
      for (const unit of grade.units) {
        for (const word of unit.words) {
          expect(word.id.startsWith(`${grade.id}-${unit.id}-`)).toBe(true)
        }
      }
    }
  })

  it('does not use a bare singular noun after "This is"', () => {
    const suspiciousExamples = grades.flatMap(grade =>
      grade.units.flatMap(unit =>
        unit.words
          .filter(word => /^This is [a-z][a-z -]*\.$/i.test(word.example?.en ?? ''))
          .filter(word => !/^This is (a|an|the|my|your|his|her|our|their|some)\b/i.test(word.example!.en))
          .map(word => ({ id: word.id, example: word.example!.en }))
      )
    )

    expect(suspiciousExamples).toEqual([])
  })
})
