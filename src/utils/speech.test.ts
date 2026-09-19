import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cancelSpeech, isSpeechAvailable, speak } from './speech'

class MockUtterance {
  text: string
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) { this.text = text }
}

describe('speech availability and failure handling', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cancelSpeech()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  function setup() {
    const synthesis = { cancel: vi.fn(), getVoices: () => [], speak: vi.fn() }
    vi.stubGlobal('window', { speechSynthesis: synthesis })
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance)
    return synthesis
  }

  it('reports unavailable speech without throwing when the API is missing', () => {
    vi.stubGlobal('window', {})
    const unavailable = vi.fn()
    expect(isSpeechAvailable()).toBe(false)
    speak('Hello', 0.8, { onUnavailable: unavailable })
    expect(unavailable).toHaveBeenCalledOnce()
  })

  it('reports successful playback only after completion', () => {
    const synthesis = setup()
    const onEnd = vi.fn()
    speak('Hello', 0.8, { onEnd })
    const utterance = synthesis.speak.mock.calls[0][0] as MockUtterance
    utterance.onstart?.()
    expect(onEnd).not.toHaveBeenCalled()
    utterance.onend?.()
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('reports a playback error and stalled playback exactly once', () => {
    const synthesis = setup()
    const unavailable = vi.fn()
    speak('Hello', 0.8, { onUnavailable: unavailable })
    const utterance = synthesis.speak.mock.calls[0][0] as MockUtterance
    utterance.onerror?.()
    vi.advanceTimersByTime(20000)
    expect(unavailable).toHaveBeenCalledOnce()
    speak('Hello again', 0.8, { onUnavailable: unavailable })
    vi.advanceTimersByTime(6000)
    expect(unavailable).toHaveBeenCalledTimes(2)
  })

  it('cancels old callbacks when navigating or replaying', () => {
    const synthesis = setup()
    const unavailable = vi.fn()
    const onEnd = vi.fn()
    const cleanup = speak('Hello', 0.8, { onUnavailable: unavailable, onEnd })
    const utterance = synthesis.speak.mock.calls[0][0] as MockUtterance
    cleanup()
    utterance.onend?.()
    vi.advanceTimersByTime(20000)
    expect(unavailable).not.toHaveBeenCalled()
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('handles an exception from the synthesis engine and audio that never finishes', () => {
    const synthesis = setup()
    const unavailable = vi.fn()
    synthesis.speak.mockImplementationOnce(() => { throw new Error('audio unavailable') })
    expect(() => speak('Hello', 0.8, { onUnavailable: unavailable })).not.toThrow()
    expect(unavailable).toHaveBeenCalledOnce()
    speak('Hello', 0.8, { onUnavailable: unavailable })
    const utterance = synthesis.speak.mock.calls[1][0] as MockUtterance
    utterance.onstart?.()
    vi.advanceTimersByTime(15000)
    expect(unavailable).toHaveBeenCalledTimes(2)
  })
})
