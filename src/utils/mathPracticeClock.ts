export interface MathPracticeClock {
  durationSeconds: number
  deadlineAt?: number
  elapsedSeconds: number
  activeSince: number | null
}

// The deadline is fixed for a challenge; rendering or typing never moves it.
export function readMathPracticeClock(clock: MathPracticeClock, now = Date.now()) {
  if (clock.durationSeconds > 0 && clock.deadlineAt !== undefined) {
    const timeLeft = Math.min(clock.durationSeconds, Math.max(0, Math.ceil((clock.deadlineAt - now) / 1000)))
    return { timeLeft, elapsedSeconds: Math.max(0, clock.durationSeconds - timeLeft) }
  }
  return {
    timeLeft: 0,
    elapsedSeconds: clock.elapsedSeconds + (clock.activeSince === null ? 0 : Math.max(0, Math.floor((now - clock.activeSince) / 1000))),
  }
}
