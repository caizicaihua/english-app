import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getWordById } from '../data/words'
import { loadProgress, saveProgress, removeWrongWord } from '../utils/storage'
import { speak } from '../utils/speech'

export default function WrongBookPage() {
  const [progress, setProgress] = useState(loadProgress)

  const wrongWords = progress.wrongWords
    .map(id => getWordById(id))
    .filter((w): w is NonNullable<typeof w> => !!w)

  const handleRemove = (wordId: string) => {
    const updated = removeWrongWord(progress, wordId)
    saveProgress(updated)
    setProgress(updated)
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">📕</div>
        <h2 className="text-2xl font-bold text-gray-800">错题本</h2>
        <p className="text-gray-400 text-sm mt-1">
          {wrongWords.length} 个待复习单词
        </p>
      </div>

      {wrongWords.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-gray-500">太棒了，没有错题！</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {wrongWords.map(word => (
              <motion.div
                key={word.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -200, height: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{word.emoji}</span>
                  <div>
                    <div className="font-bold text-gray-800">{word.en}</div>
                    <div className="text-sm text-gray-400">{word.zh}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speak(word.en)}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-lg active:scale-90 transition-transform"
                  >
                    🔊
                  </button>
                  <button
                    onClick={() => handleRemove(word.id)}
                    className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-lg active:scale-90 transition-transform"
                    title="已掌握，移除"
                  >
                    ✅
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
