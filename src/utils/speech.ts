interface DialogueSpeechLine {
  speaker: string
  en: string
}

interface DialogueSpeakerProfile {
  voice?: SpeechSynthesisVoice
  pitch: number
  rate: number
}

export type SpeechSpeedPreset = 'slow' | 'normal' | 'verySlow'

export const speechSpeedOptions: Array<{
  value: SpeechSpeedPreset
  label: string
}> = [
  { value: 'slow', label: '🐢 慢' },
  { value: 'normal', label: '🙂 正常' },
  { value: 'verySlow', label: '🌙 超慢' },
]

const exampleSpeechRates: Record<SpeechSpeedPreset, number> = {
  slow: 0.65,
  normal: 0.72,
  verySlow: 0.58,
}

const dialogueSpeechRates: Record<SpeechSpeedPreset, { female: number; male: number; fallback: number }> = {
  slow: { female: 0.54, male: 0.52, fallback: 0.53 },
  normal: { female: 0.6, male: 0.58, fallback: 0.59 },
  verySlow: { female: 0.48, male: 0.46, fallback: 0.47 },
}

const FEMALE_VOICE_HINTS = [
  'samantha',
  'victoria',
  'karen',
  'zira',
  'ava',
  'emma',
  'fiona',
  'moira',
  'tessa',
  'veena',
  'serena',
  'susan',
]

const MALE_VOICE_HINTS = [
  'daniel',
  'alex',
  'fred',
  'thomas',
  'aaron',
  'albert',
  'bruce',
  'junior',
  'ralph',
  'reed',
  'rocko',
  'oliver',
]

function findVoiceByHints(
  voices: SpeechSynthesisVoice[],
  hints: string[],
  exclude?: SpeechSynthesisVoice,
) {
  return voices.find(voice => (
    voice !== exclude
    && hints.some(hint => voice.name.toLowerCase().includes(hint))
  ))
}

function getEnglishVoices() {
  const voices = window.speechSynthesis.getVoices()
  const englishVoices = voices.filter(voice => voice.lang.startsWith('en'))

  const femaleVoice = findVoiceByHints(englishVoices, FEMALE_VOICE_HINTS)
    || englishVoices.find(voice => voice.lang.startsWith('en-US'))
    || englishVoices[0]

  const maleVoice = findVoiceByHints(englishVoices, MALE_VOICE_HINTS, femaleVoice)
    || englishVoices.find(voice => voice !== femaleVoice && voice.lang.startsWith('en-US'))
    || englishVoices.find(voice => voice !== femaleVoice)
    || femaleVoice

  return { femaleVoice, maleVoice }
}

export function getExampleSpeechRate(speed: SpeechSpeedPreset): number {
  return exampleSpeechRates[speed]
}

export function speak(text: string, rate = 0.8) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = rate
  utterance.pitch = 1.1
  const { femaleVoice: enVoice } = getEnglishVoices()
  if (enVoice) utterance.voice = enVoice
  window.speechSynthesis.speak(utterance)
}

export function speakDialogue(lines: DialogueSpeechLine[], speed: SpeechSpeedPreset = 'normal') {
  if (!('speechSynthesis' in window) || lines.length === 0) return

  window.speechSynthesis.cancel()

  const { femaleVoice, maleVoice } = getEnglishVoices()
  const dialogueRates = dialogueSpeechRates[speed]
  const uniqueSpeakers = Array.from(new Set(lines.map(line => line.speaker.trim()).filter(Boolean)))

  const speakerProfiles = new Map<string, DialogueSpeakerProfile>()

  uniqueSpeakers.forEach((speaker, index) => {
    const useFemaleVoice = index % 2 === 0
    const selectedVoice = useFemaleVoice ? femaleVoice : maleVoice
    const usingSameVoice = femaleVoice && maleVoice && femaleVoice === maleVoice

    speakerProfiles.set(speaker, {
      voice: selectedVoice,
      pitch: usingSameVoice
        ? (useFemaleVoice ? 1.06 : 0.98)
        : (useFemaleVoice ? 1.08 : 0.94),
      rate: useFemaleVoice ? dialogueRates.female : dialogueRates.male,
    })
  })

  const speakNextLine = (index: number) => {
    if (index >= lines.length) return

    const line = lines[index]
    const profile = speakerProfiles.get(line.speaker.trim()) ?? {
      voice: femaleVoice,
      pitch: 1.02,
      rate: dialogueRates.fallback,
    }

    const utterance = new SpeechSynthesisUtterance(line.en)
    utterance.lang = 'en-US'
    utterance.rate = profile.rate
    utterance.pitch = profile.pitch

    if (profile.voice) utterance.voice = profile.voice

    utterance.onend = () => {
      window.setTimeout(() => speakNextLine(index + 1), 350)
    }

    window.speechSynthesis.speak(utterance)
  }

  speakNextLine(0)
}
