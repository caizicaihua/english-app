import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gradeCatalog, getTotalWords } from '../data/words'
import {
  getActiveStreak,
  getMathModeProgress,
  loadMathProgress,
  loadProgress,
  loadSettings,
} from '../utils/storage'
import { buildDailyStudyPlan, getDailyTaskIds } from '../utils/studyPlan'

export default function HomePage() {
  const navigate = useNavigate()
  const progress = loadProgress()
  const mathProgress = loadMathProgress()
  const mathPaperProgress = getMathModeProgress(mathProgress, 'paper')
  const bridgeSettings = loadSettings().bridgePlan
  const bridgeDailyPlan = buildDailyStudyPlan(progress, bridgeSettings)
  const bridgeTaskCount = getDailyTaskIds(bridgeDailyPlan).length
  const activeStreak = getActiveStreak(progress)

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">选择学习内容</h2>
        <p className="text-gray-500 text-sm mt-1">
          已学 {progress.learnedWords.length} 个单词 | 连续 {activeStreak} 天
        </p>
      </div>

      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => navigate(bridgeSettings.enabled ? '/bridge' : '/bridge/setup')}
        className="mb-4 w-full cursor-pointer rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-5 text-left shadow-md transition-shadow hover:shadow-lg active:scale-95"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 text-4xl">🌻</div>
            <div className="text-lg font-bold text-amber-800">一升二暑假衔接</div>
            <div className="mt-1 text-xs text-amber-700">
              {bridgeSettings.enabled
                ? bridgeTaskCount > 0
                  ? `今日 ${bridgeTaskCount} 项 · 约 ${bridgeSettings.dailyMinutes} 分钟`
                  : '今天是休息日，不用补做'
                : '每天 15 分钟，巩固一年级并轻量预习'}
            </div>
          </div>
          <div className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-amber-700">
            {bridgeSettings.enabled ? '进入计划' : '开始设置'}
          </div>
        </div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => navigate('/math')}
        className="bg-white rounded-2xl p-5 shadow-md cursor-pointer hover:shadow-lg transition-shadow active:scale-95 mb-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-4xl mb-2">🧮</div>
            <div className="font-bold text-lg text-primary">一年级口算比赛</div>
            <div className="text-xs text-gray-400 mt-1">100 题 · 15 分钟 · 口算训练</div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>历史最高 {mathPaperProgress.bestScore}</div>
            <div className="mt-1">错题 {mathProgress.wrongQuestions.length} 题</div>
          </div>
        </div>
      </motion.div>

      <div className="text-sm font-bold text-gray-700 mb-3">英语年级</div>
      <div className="grid grid-cols-2 gap-4">
        {gradeCatalog.map((grade, index) => {
          const totalWords = getTotalWords(grade)
          const learnedInGrade = grade.units
            .flatMap(unit => unit.wordIds)
            .filter(id => progress.learnedWords.includes(id)).length
          const percent = totalWords > 0 ? Math.round((learnedInGrade / totalWords) * 100) : 0

          return (
            <motion.div
              key={grade.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => navigate(`/grade/${grade.id}`)}
              className="bg-white rounded-2xl p-5 shadow-md cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
            >
              <div className="text-4xl mb-2">{grade.emoji}</div>
              <div className="font-bold text-lg" style={{ color: grade.color }}>
                {grade.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {grade.units.length} 个单元 · {totalWords} 词
              </div>
              <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${percent}%`, backgroundColor: grade.color }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{percent}%</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
