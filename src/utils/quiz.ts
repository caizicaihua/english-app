import type { DialogueLine, Unit, Word } from '../data/words'

export type QuestionType = 'zh2en' | 'listen' | 'match' | 'spell' | 'sentence' | 'dialogue'

interface DialoguePrompt {
  title: string
  lines: DialogueLine[]
}

export interface Question {
  type: QuestionType
  word: Word
  options?: string[]
  correctAnswer: string
  matchWords?: Word[]
  displayLetters?: string[]
  hiddenIndices?: number[]
  sentencePrompt?: {
    en: string
    zh: string
  }
  dialoguePrompt?: DialoguePrompt
}

export function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  return shuffled
}

function pickDistractors(correct: Word, pool: Word[], count: number): Word[] {
  const uniqueWords = new Map<string, Word>()

  for (const word of pool) {
    const normalized = word.en.toLowerCase()
    if (word.id !== correct.id && normalized !== correct.en.toLowerCase()) {
      uniqueWords.set(normalized, word)
    }
  }

  return shuffle([...uniqueWords.values()]).slice(0, count)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function containsWord(text: string, answer: string): boolean {
  return new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'i').test(text)
}

function blankWord(text: string, answer: string): string {
  return text.replace(new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'i'), '____')
}

function buildDialoguePrompts(unit: Unit): Array<{ word: Word; prompt: DialoguePrompt }> {
  if (!unit.dialogues?.length) return []

  const wordsByLength = [...unit.words].sort((first, second) => second.en.length - first.en.length)
  const prompts: Array<{ word: Word; prompt: DialoguePrompt }> = []

  for (const dialogue of unit.dialogues) {
    for (let index = 0; index < dialogue.lines.length; index += 1) {
      const line = dialogue.lines[index]
      const matchedWord = wordsByLength.find(word => containsWord(line.en, word.en))
      if (!matchedWord) continue

      prompts.push({
        word: matchedWord,
        prompt: {
          title: dialogue.title,
          lines: dialogue.lines.map((item, itemIndex) => (
            itemIndex === index
              ? { ...item, en: blankWord(item.en, matchedWord.en) }
              : item
          )),
        },
      })
    }
  }

  return prompts
}

export function generateQuestions(unit: Unit, allGradeWords: Word[]): Question[] {
  const words = unit.words
  if (words.length === 0) return []

  const pool = allGradeWords.length >= 4 ? allGradeWords : words
  const questions: Question[] = []
  const shuffledWords = shuffle(words)
  const sentenceWords = shuffle(words.filter(word => (
    word.example && containsWord(word.example.en, word.en)
  )))
  const dialoguePrompts = shuffle(buildDialoguePrompts(unit))
  const types: QuestionType[] = ['zh2en', 'listen', 'spell']

  if (words.length >= 2) types.push('match')
  if (sentenceWords.length > 0) types.push('sentence')
  if (dialoguePrompts.length > 0) types.push('dialogue')

  let sentenceIndex = 0
  let dialogueIndex = 0

  for (let index = 0; index < 10; index += 1) {
    const word = shuffledWords[index % shuffledWords.length]
    const type = types[index % types.length]

    if (type === 'match') {
      const matchWords = shuffle(words).slice(0, Math.min(4, words.length))
      questions.push({
        type: 'match',
        word: matchWords[0],
        correctAnswer: '',
        matchWords,
      })
    } else if (type === 'sentence' && sentenceWords.length > 0) {
      const sentenceWord = sentenceWords[sentenceIndex % sentenceWords.length]
      sentenceIndex += 1
      const distractors = pickDistractors(sentenceWord, pool, 3)
      questions.push({
        type: 'sentence',
        word: sentenceWord,
        options: shuffle([sentenceWord, ...distractors]).map(item => item.en),
        correctAnswer: sentenceWord.en,
        sentencePrompt: {
          en: blankWord(sentenceWord.example!.en, sentenceWord.en),
          zh: sentenceWord.example!.zh,
        },
      })
    } else if (type === 'dialogue' && dialoguePrompts.length > 0) {
      const currentDialogue = dialoguePrompts[dialogueIndex % dialoguePrompts.length]
      dialogueIndex += 1
      const distractors = pickDistractors(currentDialogue.word, pool, 3)
      questions.push({
        type: 'dialogue',
        word: currentDialogue.word,
        options: shuffle([currentDialogue.word, ...distractors]).map(item => item.en),
        correctAnswer: currentDialogue.word.en,
        dialoguePrompt: currentDialogue.prompt,
      })
    } else if (type === 'spell') {
      const letters = word.en.split('')
      const letterIndices = letters
        .map((letter, letterIndex) => ({ letter, index: letterIndex }))
        .filter(item => /^[a-z]$/i.test(item.letter))
        .map(item => item.index)
      const numHidden = Math.min(Math.max(1, Math.ceil(letterIndices.length * 0.4)), 3)
      const indices = shuffle(letterIndices).slice(0, numHidden).sort((a, b) => a - b)
      const display = letters.map((letter, letterIndex) => indices.includes(letterIndex) ? '_' : letter)
      questions.push({
        type: 'spell',
        word,
        correctAnswer: word.en,
        displayLetters: display,
        hiddenIndices: indices,
      })
    } else {
      const distractors = pickDistractors(word, pool, 3)
      questions.push({
        type,
        word,
        options: shuffle([word, ...distractors]).map(item => item.en),
        correctAnswer: word.en,
      })
    }
  }

  return shuffle(questions)
}
