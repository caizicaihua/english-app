import { useSyncExternalStore } from 'react'
import { getLocalDateKey } from '../utils/storage'

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 30_000)
  document.addEventListener('visibilitychange', onChange)
  window.addEventListener('focus', onChange)
  return () => {
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onChange)
    window.removeEventListener('focus', onChange)
  }
}

export function useLocalDateKey() {
  return useSyncExternalStore(subscribe, () => getLocalDateKey())
}
