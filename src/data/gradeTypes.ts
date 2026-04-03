export interface Word {
  id: string
  en: string
  zh: string
  emoji: string
  example?: {
    en: string
    zh: string
  }
}

export interface DialogueLine {
  speaker: string
  en: string
  zh: string
}

export interface Dialogue {
  title: string
  lines: DialogueLine[]
}

export interface Unit {
  id: number
  name: string
  nameZh: string
  words: Word[]
  dialogues?: Dialogue[]
}

export interface Grade {
  id: number
  name: string
  color: string
  emoji: string
  units: Unit[]
}

export interface UnitSummary {
  id: number
  name: string
  nameZh: string
  wordIds: string[]
}

export interface GradeSummary {
  id: number
  name: string
  color: string
  emoji: string
  units: UnitSummary[]
}
