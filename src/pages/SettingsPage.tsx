import { useState, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getMathModeProgress,
  loadMathProgress,
  loadProgress,
  loadSettings,
  saveSettings,
} from '../utils/storage'
import { createStudyBackup, downloadStudyBackup, importStudyBackup, parseStudyBackup, resetStudyData, type StudyBackup } from '../utils/backup'
import { speechSpeedOptions, type SpeechSpeedPreset } from '../utils/speech'

export default function SettingsPage() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')
  const [keepSettings, setKeepSettings] = useState(true)
  const [pendingBackup, setPendingBackup] = useState<StudyBackup | null>(null)
  const [previousBackup, setPreviousBackup] = useState<StudyBackup | null>(null)
  const [speechSpeed, setSpeechSpeed] = useState<SpeechSpeedPreset>(() => loadSettings().speechSpeed)
  const progress = loadProgress()
  const mathProgress = loadMathProgress()
  const mathPaperProgress = getMathModeProgress(mathProgress, 'paper')
  const mathQuickProgress = getMathModeProgress(mathProgress, 'quick')

  const handleSpeedChange = (speed: SpeechSpeedPreset) => {
    setSpeechSpeed(speed)
    saveSettings({ ...loadSettings(), speechSpeed: speed })
  }

  const handleReset = () => {
    const previous = createStudyBackup()
    const result = resetStudyData(keepSettings)
    setPreviousBackup(previous)
    setShowConfirm(false)
    setMessage(result.success
      ? `已重置学习数据${keepSettings ? '，已保留语速和学习计划设置' : '和所有设置'}。${result.draftCleared ? '' : '练习草稿未能清除，请关闭其他练习页面后重试。'}`
      : '重置未完成，原有数据已保留，请下载备份后重试。')
    setSpeechSpeed(loadSettings().speechSpeed)
  }

  const handleBackupFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      if (file.size > 10_000_000) throw new Error('备份文件过大，请选择本应用导出的 JSON 备份。')
      setPendingBackup(parseStudyBackup(await file.text()))
      setMessage('')
    } catch (error) {
      setPendingBackup(null)
      setMessage(error instanceof Error ? error.message : '无法读取备份文件，原有数据未更改。')
    }
  }

  const handleImport = () => {
    if (!pendingBackup) return
    try {
      // Keep and offer the old data before attempting any replacement.
      const previous = createStudyBackup()
      setPreviousBackup(previous)
      downloadStudyBackup(previous, '恢复前的学习备份')
      const result = importStudyBackup(pendingBackup)
      setMessage(result.success
        ? `备份已恢复，恢复前的数据也已下载为备份。${result.draftCleared ? '' : '旧练习草稿未能清除，请关闭练习页面后重新进入。'}`
        : '恢复未完成，原有数据已保留，请下载备份后重试。')
      if (result.success) setPendingBackup(null)
      setSpeechSpeed(loadSettings().speechSpeed)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '恢复失败，原有数据未更改。')
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-800">设置</h2>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-700 mb-1">当前数据</div>
          <div className="text-xs text-gray-400 space-y-0.5">
            <p>已学单词：{progress.learnedWords.length} 个</p>
            <p>已完成单元：{Object.keys(progress.completedUnits).length} 个</p>
            <p>错题本：{progress.wrongWords.length} 个</p>
            <p>数学错题：{mathProgress.wrongQuestions.length} 个</p>
            <p>数学快速练最高：{mathQuickProgress.bestScore}/20</p>
            <p>数学整卷最高：{mathPaperProgress.bestScore}/100</p>
            <p>已解锁成就：{progress.achievements.length} 个</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-700 mb-1">默认句子语速</div>
          <p className="text-xs text-gray-400 mb-3">
            用于学习页中的例句和情景对话朗读，适合孩子按自己的节奏反复跟读。
          </p>
          <div className="grid grid-cols-3 gap-2">
            {speechSpeedOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSpeedChange(option.value)}
                className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-all ${
                  speechSpeed === option.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-700 mb-1">学习备份与恢复</div>
          <p className="text-xs text-gray-500 mb-3">学习记录保存在当前浏览器。备份包含英语、数学和设置，换设备或清理浏览器前请先下载。</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => downloadStudyBackup(createStudyBackup())} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold">下载 JSON 备份</button>
            <label className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold cursor-pointer">
              选择备份文件
              <input aria-label="选择学习备份文件" type="file" accept=".json,application/json" onChange={handleBackupFile} className="sr-only" />
            </label>
          </div>
          {pendingBackup && (
            <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <p>备份时间：{new Date(pendingBackup.exportedAt).toLocaleString('zh-CN')}</p>
              <p>英语已学 {pendingBackup.data.progress.learnedWords.length} 词，数学练习 {pendingBackup.data.math.attemptHistory.length} 次。</p>
              <p className="mt-2">恢复会覆盖当前英语、数学和设置，并清除练习草稿。确认后将先下载当前数据的备份。</p>
              <div className="mt-3 flex gap-3">
                <button onClick={handleImport} className="rounded-lg bg-amber-700 px-3 py-2 text-white font-bold">下载旧备份并恢复</button>
                <button onClick={() => setPendingBackup(null)} className="px-3 py-2">取消</button>
              </div>
            </div>
          )}
          {previousBackup && <button onClick={() => downloadStudyBackup(previousBackup, '操作前的学习备份')} className="mt-3 text-sm text-primary underline">再次下载操作前的备份</button>}
          {message && <p role="status" className="mt-3 text-sm text-gray-700">{message}</p>}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-700 mb-1">重置学习数据</div>
          <p className="text-xs text-gray-400 mb-3">
            清除英语和数学进度、错题、成就、每日任务和两科练习草稿。建议先下载备份。
          </p>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-500 text-sm font-bold active:scale-95 transition-transform"
          >
            🗑️ 重置学习数据
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-title"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-6 text-center shadow-2xl max-w-xs mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl mb-3">⚠️</div>
              <h3 id="reset-title" className="text-lg font-bold text-gray-800 mb-1">确认重置？</h3>
              <p className="text-sm text-gray-500 mb-5">
                英语、数学学习记录和两科草稿将被清除。重置后可下载操作前的备份；请在离开页面前保存。
              </p>
              <label className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={keepSettings} onChange={event => setKeepSettings(event.target.checked)} />
                保留语速和学习计划设置
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold active:scale-95 transition-transform"
                >
                  取消
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold active:scale-95 transition-transform"
                >
                  确认重置
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
