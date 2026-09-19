import { describe, expect, it } from 'vitest'
import { readMathPracticeClock } from './mathPracticeClock'

 describe('math practice clock', () => {
  it('uses the fixed deadline through repeated updates and background gaps', () => {
    const clock = { durationSeconds: 300, deadlineAt: 301000, elapsedSeconds: 0, activeSince: 1000 }
    for (const now of [1250, 1500, 1800]) expect(readMathPracticeClock(clock, now).timeLeft).toBe(300)
    expect(readMathPracticeClock(clock, 2000)).toEqual({ timeLeft: 299, elapsedSeconds: 1 })
    expect(readMathPracticeClock(clock, 101000)).toEqual({ timeLeft: 200, elapsedSeconds: 100 })
    expect(readMathPracticeClock(clock, 501000)).toEqual({ timeLeft: 0, elapsedSeconds: 300 })
  })

  it('counts only active time for an untimed paused practice', () => {
    const active = { durationSeconds: 0, elapsedSeconds: 20, activeSince: 1000 }
    expect(readMathPracticeClock(active, 6000).elapsedSeconds).toBe(25)
    const paused = { ...active, elapsedSeconds: 25, activeSince: null }
    expect(readMathPracticeClock(paused, 906000).elapsedSeconds).toBe(25)
    const resumed = { ...paused, activeSince: 906000 }
    expect(readMathPracticeClock(resumed, 911000).elapsedSeconds).toBe(30)
  })
})
