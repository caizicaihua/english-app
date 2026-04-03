import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { loadGrade, type DialogueLine, type Grade, type Unit, type Word } from '../data/words'
import { loadProgress, saveProgress, completeUnit, addWrongWord, markWordLearned } from '../utils/storage'
import { speak } from '../utils/speech'
import StarRating from '../components/StarRating'

type QuestionType = 'zh2en' | 'listen' | 'match' | 'spell' | 'sentence' | 'dialogue'

interface DialoguePrompt {
  title: string
  lines: DialogueLine[]
}

interface Question {
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickDistractors(correct: Word, pool: Word[], count: number): Word[] {
  const others = pool.filter(w => w.id !== correct.id)
  return shuffle(others).slice(0, count)
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

function generateQuestions(unit: Unit, allGradeWords: Word[]): Question[] {
  const words = unit.words
  const pool = allGradeWords.length >= 4 ? allGradeWords : words
  const questions: Question[] = []
  const shuffledWords = shuffle(words)
  const sentenceWords = shuffle(words.filter(word => word.example))
  const dialoguePrompts = shuffle(buildDialoguePrompts(unit))
  const types: QuestionType[] = ['zh2en', 'listen', 'match', 'spell']

  if (sentenceWords.length > 0) types.push('sentence')
  if (dialoguePrompts.length > 0) types.push('dialogue')

  let sentenceIndex = 0
  let dialogueIndex = 0

  for (let i = 0; i < 10 && i < shuffledWords.length * 2; i++) {
    const word = shuffledWords[i % shuffledWords.length]
    const type = types[i % types.length]

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
      const numHidden = Math.min(Math.max(1, Math.ceil(letters.length * 0.4)), 3)
      const indices = shuffle(letters.map((_, idx) => idx)).slice(0, numHidden).sort((a, b) => a - b)
      const display = letters.map((l, idx) => indices.includes(idx) ? '_' : l)
      questions.push({
        type: 'spell',
        word,
        correctAnswer: word.en,
        displayLetters: display,
        hiddenIndices: indices,
      })
    } else {
      const distractors = pickDistractors(word, pool, 3)
      const options = shuffle([word, ...distractors]).map(w => w.en)
      questions.push({
        type,
        word,
        options,
        correctAnswer: word.en,
      })
    }
  }

  return shuffle(questions).slice(0, 10)
}

// --- Sub Components ---

function ChoiceQuestion({ question, onAnswer, gradeColor }: {
  question: Question; onAnswer: (correct: boolean) => void; gradeColor: string
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    if (question.type === 'listen') speak(question.word.en)
  }, [question])

  const handleSelect = (opt: string) => {
    if (answered) return
    setSelected(opt)
    setAnswered(true)
    const isCorrect = opt === question.correctAnswer
    setTimeout(() => onAnswer(isCorrect), 800)
  }

  return (
    <div>
      <div className="text-center mb-6">
        {question.type === 'zh2en' ? (
          <>
            <div className="text-5xl mb-3">{question.word.emoji}</div>
            <div className="text-xl font-bold text-gray-800">{question.word.zh}</div>
            <p className="text-sm text-gray-400 mt-1">选出对应的英文单词</p>
          </>
        ) : question.type === 'sentence' ? (
          <>
            <div className="text-5xl mb-3">📝</div>
            <div className="bg-white rounded-2xl shadow-sm p-4 max-w-sm mx-auto text-left">
              <div className="text-base font-bold text-gray-800">{question.sentencePrompt!.en}</div>
              <div className="text-sm text-gray-500 mt-2">{question.sentencePrompt!.zh}</div>
            </div>
            <p className="text-sm text-gray-400 mt-3">根据例句，选出正确的单词</p>
          </>
        ) : question.type === 'dialogue' ? (
          <>
            <div className="text-5xl mb-3">💬</div>
            <div className="bg-white rounded-2xl shadow-sm p-4 max-w-sm mx-auto text-left">
              <div className="text-sm font-bold text-gray-700 mb-3">{question.dialoguePrompt!.title}</div>
              <div className="space-y-2">
                {question.dialoguePrompt!.lines.map((line, index) => (
                  <div key={`${question.word.id}-${index}`} className="rounded-xl bg-gray-50 px-3 py-2.5">
                    <div className="text-xs font-semibold text-gray-400 mb-1">{line.speaker}</div>
                    <div className="text-sm font-semibold text-gray-800">{line.en}</div>
                    <div className="text-xs text-gray-500 mt-1">{line.zh}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">根据对话，选出缺少的单词</p>
          </>
        ) : question.type === 'listen' ? (
          <>
            <div className="text-5xl mb-3">🎧</div>
            <p className="text-sm text-gray-400 mt-1">听发音，选出正确的单词</p>
            <button
              onClick={() => speak(question.word.en)}
              className="mt-3 w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mx-auto active:scale-90 transition-transform"
            >
              🔊
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">❓</div>
          </>
        )}
      </div>
      <div className="space-y-3 max-w-xs mx-auto">
        {question.options!.map(opt => {
          let bg = 'bg-white'
          let border = 'border-gray-200'
          if (answered) {
            if (opt === question.correctAnswer) { bg = 'bg-green-50'; border = 'border-green-400' }
            else if (opt === selected) { bg = 'bg-red-50'; border = 'border-red-400' }
          } else if (opt === selected) {
            border = `border-[${gradeColor}]`
          }
          return (
            <motion.button
              key={opt}
              onClick={() => handleSelect(opt)}
              animate={answered && opt === selected && opt !== question.correctAnswer ? { x: [0, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-full py-3 px-4 rounded-xl border-2 ${border} ${bg} text-lg font-semibold text-gray-700 active:scale-[0.97] transition-all`}
            >
              {opt}
              {answered && opt === question.correctAnswer && ' ✅'}
              {answered && opt === selected && opt !== question.correctAnswer && ' ❌'}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function MatchQuestion({ question, onAnswer, gradeColor }: {
  question: Question; onAnswer: (correct: boolean) => void; gradeColor: string
}) {
  const words = question.matchWords!
  const shuffledZh = useMemo(() => shuffle(words), [words])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)

  const handleLeftClick = (id: string) => {
    if (matched.has(id)) return
    setSelectedLeft(id)
    setWrongPair(null)
  }

  const handleRightClick = (id: string) => {
    if (!selectedLeft || matched.has(id)) return
    if (selectedLeft === id) {
      const newMatched = new Set(matched)
      newMatched.add(id)
      setMatched(newMatched)
      setSelectedLeft(null)
      if (newMatched.size === words.length) {
        setTimeout(() => onAnswer(mistakes === 0), 500)
      }
    } else {
      setWrongPair(id)
      setMistakes(m => m + 1)
      setTimeout(() => { setWrongPair(null); setSelectedLeft(null) }, 600)
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">🔗</div>
        <p className="text-sm text-gray-400">点击左右两侧进行配对</p>
      </div>
      <div className="flex gap-4 max-w-sm mx-auto">
        <div className="flex-1 space-y-2">
          {words.map(w => (
            <motion.button
              key={w.id}
              onClick={() => handleLeftClick(w.id)}
              animate={wrongPair && selectedLeft === w.id ? { x: [0, -5, 5, -3, 3, 0] } : {}}
              className={`w-full py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                matched.has(w.id)
                  ? 'bg-green-50 border-green-300 text-green-600 opacity-60'
                  : selectedLeft === w.id
                    ? 'border-2 bg-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-700'
              }`}
              style={selectedLeft === w.id && !matched.has(w.id) ? { borderColor: gradeColor } : {}}
            >
              {w.en}
            </motion.button>
          ))}
        </div>
        <div className="flex-1 space-y-2">
          {shuffledZh.map(w => (
            <motion.button
              key={w.id}
              onClick={() => handleRightClick(w.id)}
              animate={wrongPair === w.id ? { x: [0, -5, 5, -3, 3, 0] } : {}}
              className={`w-full py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                matched.has(w.id)
                  ? 'bg-green-50 border-green-300 text-green-600 opacity-60'
                  : wrongPair === w.id
                    ? 'bg-red-50 border-red-400'
                    : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              {w.emoji} {w.zh}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SpellQuestion({ question, onAnswer, gradeColor }: {
  question: Question; onAnswer: (correct: boolean) => void; gradeColor: string
}) {
  const { word, hiddenIndices } = question
  const letters = word.en.split('')
  const [filled, setFilled] = useState<Record<number, string>>({})
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const missingLetters = hiddenIndices!.map(i => letters[i])
  const extraLetters = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(letter => !missingLetters.includes(letter))
  const keyboardLetters = shuffle([
    ...missingLetters,
    ...shuffle(extraLetters).slice(0, Math.max(5, 8 - missingLetters.length)),
  ])

  const currentSlot = hiddenIndices!.find(i => filled[i] === undefined)

  const handleLetterClick = (letter: string) => {
    if (answered || currentSlot === undefined) return
    const newFilled = { ...filled, [currentSlot]: letter }
    setFilled(newFilled)

    const allFilled = hiddenIndices!.every(i => newFilled[i] !== undefined)
    if (allFilled) {
      const result = letters.map((l, i) => hiddenIndices!.includes(i) ? newFilled[i] : l).join('')
      const correct = result === word.en
      setIsCorrect(correct)
      setAnswered(true)
      setTimeout(() => onAnswer(correct), 800)
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{word.emoji}</div>
        <div className="text-xl font-bold text-gray-800">{word.zh}</div>
        <p className="text-sm text-gray-400 mt-1">填入缺少的字母</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {letters.map((l, i) => {
          const isHidden = hiddenIndices!.includes(i)
          const filledLetter = filled[i]
          let borderColor = 'border-gray-300'
          if (answered && isHidden) {
            borderColor = filledLetter === l ? 'border-green-400' : 'border-red-400'
          } else if (isHidden && currentSlot === i) {
            borderColor = ''
          }
          return (
            <motion.div
              key={i}
              animate={answered && isHidden && filledLetter !== l ? { x: [0, -4, 4, -2, 2, 0] } : {}}
              className={`w-10 h-12 rounded-lg border-2 ${borderColor} flex items-center justify-center text-xl font-bold ${
                isHidden
                  ? filledLetter
                    ? answered
                      ? filledLetter === l ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      : 'bg-white text-gray-800'
                    : 'bg-gray-50'
                  : 'bg-white text-gray-800 border-transparent'
              }`}
              style={isHidden && currentSlot === i && !answered ? { borderColor: gradeColor } : {}}
            >
              {isHidden ? (filledLetter || '') : l}
            </motion.div>
          )
        })}
      </div>

      {answered && (
        <div className="text-center mb-4">
          <span className={`text-sm font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? '正确! ✅' : `正确答案: ${word.en}`}
          </span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
        {keyboardLetters.map((l, i) => (
          <button
            key={`${l}-${i}`}
            onClick={() => handleLetterClick(l)}
            disabled={answered}
            className="w-10 h-10 rounded-lg bg-white shadow text-lg font-bold text-gray-700 active:scale-90 transition-transform disabled:opacity-40"
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

// --- Result Screen ---

function ResultScreen({ score, total, stars, gradeColor, onRetry, onBack }: {
  score: number; total: number; stars: number; gradeColor: string; onRetry: () => void; onBack: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-6xl mb-4"
      >
        {stars >= 3 ? '🏆' : stars >= 2 ? '🎉' : stars >= 1 ? '👍' : '💪'}
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">闯关完成！</h2>
      <div className="text-4xl font-bold mb-2" style={{ color: gradeColor }}>
        {score} 分
      </div>
      <div className="mb-4">
        <StarRating stars={stars} size="text-2xl" />
      </div>
      <div className="text-gray-500 mb-6">
        答对 <span className="text-green-500 font-bold">{Math.round(score / 10)}</span> 题，
        答错 <span className="text-red-500 font-bold">{total - Math.round(score / 10)}</span> 题
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-xl text-white font-bold shadow-md active:scale-95 transition-transform"
          style={{ backgroundColor: gradeColor }}
        >
          🔄 再来一次
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold active:scale-95 transition-transform"
        >
          返回
        </button>
      </div>
    </motion.div>
  )
}

// --- Main Quiz Page ---

export default function QuizPage() {
  const { gradeId, unitId } = useParams()
  const navigate = useNavigate()
  const [grade, setGrade] = useState<Grade | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true

    loadGrade(Number(gradeId)).then(data => {
      if (!active) return
      setGrade(data ?? null)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [gradeId, unitId])

  const unit = grade?.units.find(u => u.id === Number(unitId))

  const allGradeWords = useMemo(
    () => grade?.units.flatMap(u => u.words) ?? [],
    [grade]
  )

  const questions = useMemo(
    () => {
      void retryKey
      return unit ? generateQuestions(unit, allGradeWords) : []
    },
    [unit, allGradeWords, retryKey]
  )
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<{ score: number; stars: number } | null>(null)

  const handleAnswer = useCallback((correct: boolean) => {
    const nextScore = correct ? score + 10 : score

    if (correct) {
      setScore(nextScore)
    } else {
      const q = questions[currentQ]
      if (q.type !== 'match') {
        const progress = loadProgress()
        saveProgress(addWrongWord(progress, q.word.id))
      }
    }

    if (currentQ >= questions.length - 1) {
      const stars = nextScore >= 100 ? 3 : nextScore >= 80 ? 2 : nextScore >= 60 ? 1 : 0
      if (stars > 0 && grade && unit) {
        const progress = loadProgress()
        const updated = completeUnit(progress, grade.id, unit.id, stars)
        let withWords = updated
        for (const w of unit.words) {
          withWords = markWordLearned(withWords, w.id)
        }
        saveProgress(withWords)
      }
      setResult({ score: nextScore, stars })
      setFinished(true)
      return
    }
    setCurrentQ(q => q + 1)
  }, [currentQ, questions, score, grade, unit])

  const handleRetry = () => {
    if (!unit) return
    setRetryKey(key => key + 1)
    setCurrentQ(0)
    setScore(0)
    setFinished(false)
    setResult(null)
  }

  if (loading) return <div className="text-center py-10 text-gray-400">加载中...</div>

  if (!grade || !unit) return <div className="text-center py-10">未找到该单元</div>

  if (questions.length === 0) return <div className="text-center py-10 text-gray-400">正在生成题目...</div>

  if (finished && result) {
    return (
      <ResultScreen
        score={result.score}
        total={questions.length}
        stars={result.stars}
        gradeColor={grade.color}
        onRetry={handleRetry}
        onBack={() => navigate(`/grade/${grade.id}`)}
      />
    )
  }

  const q = questions[currentQ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">
          第 {currentQ + 1} / {questions.length} 题
        </span>
        <span className="text-sm font-bold" style={{ color: grade.color }}>
          {score} 分
        </span>
      </div>
      <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden mb-6">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: grade.color }}
          animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          {(q.type === 'zh2en' || q.type === 'listen' || q.type === 'sentence' || q.type === 'dialogue') && (
            <ChoiceQuestion question={q} onAnswer={handleAnswer} gradeColor={grade.color} />
          )}
          {q.type === 'match' && (
            <MatchQuestion question={q} onAnswer={handleAnswer} gradeColor={grade.color} />
          )}
          {q.type === 'spell' && (
            <SpellQuestion question={q} onAnswer={handleAnswer} gradeColor={grade.color} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
