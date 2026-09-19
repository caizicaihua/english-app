import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Grade } from '../data/words'
import { getGradeSummary, loadGrade } from '../data/words'
import {
  getCurrentDiagnosticQuestion,
  getDiagnosticChoiceWords,
  getDiagnosticProgress,
  isCurrentDiagnosticSectionComplete,
  isDiagnosticComplete,
} from '../utils/diagnostic'
import {
  continueDiagnostic,
  finishDiagnostic,
  startOrResumeDiagnostic,
  submitDiagnosticAnswer,
} from '../utils/diagnosticSession'
import {
  completeDailyTask,
  getOrCreateDailyStudyPlan,
  saveDailyStudyPlan,
} from '../utils/studyPlan'
import {
  loadProgress,
  loadSettings,
  saveProgress,
  type ProgressData,
} from '../utils/storage'
import { speak, isSpeechAvailable } from '../utils/speech'

interface DiagnosticPageState {
  grade: Grade
  progress: ProgressData
}

interface AnswerFeedback {
  selectedWordId?: string
  isCorrect: boolean
}

function markTodayDiagnosticComplete(progress: ProgressData): ProgressData {
  const settings = loadSettings()
  const plan = getOrCreateDailyStudyPlan(progress, settings.bridgePlan)
  const withPlan = saveDailyStudyPlan(progress, plan)
  return completeDailyTask(withPlan, plan.date, 'diagnostic')
}

export default function DiagnosticPage() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<DiagnosticPageState | null>(null)
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null)
  const [spellAnswer, setSpellAnswer] = useState('')
  const [audioState, setAudioState] = useState<{ questionId: string; ready: boolean; failed: boolean } | null>(null)
  const feedbackTimer = useRef<number | null>(null)

  useEffect(() => {
    let active = true
    const gradeSummary = getGradeSummary(1)
    if (!gradeSummary) return

    loadGrade(1).then(grade => {
      if (!active || !grade) return
      const progress = loadProgress()
      const started = startOrResumeDiagnostic({
        progress,
        grade: gradeSummary,
      })
      if (started.progress !== progress) saveProgress(started.progress)
      setPageState({ grade, progress: started.progress })
    })

    return () => {
      active = false
      if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current)
    }
  }, [])

  const draft = pageState?.progress.diagnosticDraft ?? null
  const question = draft ? getCurrentDiagnosticQuestion(draft) : null
  const wordMap = useMemo(() => {
    const words = pageState?.grade.units.flatMap(unit => unit.words) ?? []
    return new Map(words.map(word => [word.id, word]))
  }, [pageState?.grade])
  const allWords = useMemo(
    () => pageState?.grade.units.flatMap(unit => unit.words) ?? [],
    [pageState?.grade],
  )
  const word = question ? wordMap.get(question.wordId) : undefined
  const choices = question ? getDiagnosticChoiceWords(question, allWords) : []

  useEffect(() => {
    if (question?.questionType === 'listen' && word) {
      return speak(word.en, 0.8, {
        onEnd: () => setAudioState({ questionId: question.id, ready: true, failed: false }),
        onUnavailable: () => setAudioState({ questionId: question.id, ready: false, failed: true }),
      })
    }
  }, [question?.id, question?.questionType, word])

  if (!pageState || !draft) {
    return <div className="py-12 text-center text-gray-400">正在准备小体检...</div>
  }

  const progressInfo = getDiagnosticProgress(draft)
  const sectionComplete = isCurrentDiagnosticSectionComplete(draft)
  const diagnosticComplete = isDiagnosticComplete(draft)
  const canAnswer = question?.questionType !== 'listen' || (audioState?.questionId === question.id && audioState.ready)
  const switchToReading = () => {
    if (!question) return
    const nextProgress = { ...pageState.progress, diagnosticDraft: { ...draft, sections: draft.sections.map(section => ({ ...section, questions: section.questions.map(item => item.id === question.id ? { ...item, questionType: 'zh2en' as const } : item) })) } }
    saveProgress(nextProgress)
    setPageState({ ...pageState, progress: nextProgress })
  }

  const commitAnswer = (
    isCorrect: boolean,
    selectedWordId?: string,
  ) => {
    if (feedback || !question || !canAnswer) return
    const gradeSummary = getGradeSummary(1)
    if (!gradeSummary) return

    const nextProgress = submitDiagnosticAnswer({
      progress: pageState.progress,
      grade: gradeSummary,
      isCorrect,
    })
    saveProgress(nextProgress)
    setFeedback({ selectedWordId, isCorrect })
    feedbackTimer.current = window.setTimeout(() => {
      setSpellAnswer('')
      setPageState(current => current
        ? { ...current, progress: nextProgress }
        : current)
      setFeedback(null)
      feedbackTimer.current = null
    }, 650)
  }

  const handleSpellSubmit = () => {
    if (!word || !spellAnswer.trim()) return
    commitAnswer(
      spellAnswer.trim().toLowerCase() === word.en.toLowerCase(),
    )
  }

  const handleContinue = () => {
    const gradeSummary = getGradeSummary(1)
    if (!gradeSummary) return
    const markedProgress = markTodayDiagnosticComplete(pageState.progress)

    if (diagnosticComplete) {
      const finished = finishDiagnostic({
        progress: markedProgress,
        grade: gradeSummary,
      })
      if (!finished) return
      saveProgress(finished.progress)
      navigate('/bridge/diagnostic/result', { replace: true })
      return
    }

    const nextProgress = continueDiagnostic({ progress: markedProgress })
    saveProgress(nextProgress)
    setSpellAnswer('')
    setPageState(current => current
      ? { ...current, progress: nextProgress }
      : current)
  }

  const handlePause = () => {
    const markedProgress = sectionComplete
      ? markTodayDiagnosticComplete(pageState.progress)
      : pageState.progress
    saveProgress(markedProgress)
    navigate('/bridge')
  }

  if (sectionComplete) {
    return (
      <div className="py-8 text-center">
        <div className="text-6xl">{diagnosticComplete ? '🎉' : '🌟'}</div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {diagnosticComplete ? '小体检全部完成' : `第 ${progressInfo.currentSection} 小节完成`}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
          {diagnosticComplete
            ? '已经了解一年级知识情况，接下来会生成适合的复习安排。'
            : '今天做到这里就可以了，也可以状态好时再做下一小节。'}
        </p>
        <button
          type="button"
          onClick={handleContinue}
          className="mt-6 w-full rounded-2xl bg-primary py-3.5 font-bold text-white shadow-md active:scale-[0.98]"
        >
          {diagnosticComplete ? '查看诊断结果' : '继续下一小节'}
        </button>
        {!diagnosticComplete && (
          <button
            type="button"
            onClick={handlePause}
            className="mt-3 w-full rounded-2xl bg-white py-3.5 font-bold text-gray-600 shadow-sm active:scale-[0.98]"
          >
            今天先到这里
          </button>
        )}
      </div>
    )
  }

  if (!question || !word) {
    return (
      <div className="py-12 text-center">
        <div className="text-5xl">⚠️</div>
        <div className="mt-3 font-bold text-gray-700">题目内容暂时无法加载</div>
        <button
          type="button"
          onClick={handlePause}
          className="mt-5 rounded-xl bg-white px-5 py-3 font-bold text-gray-600"
        >
          返回计划
        </button>
      </div>
    )
  }

  const unitId = Number(question.unitKey.split('-')[1])
  const unitName = pageState.grade.units.find(unit => unit.id === unitId)?.nameZh ?? question.unitKey

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-primary">
            第 {progressInfo.currentSection}/{progressInfo.sectionCount} 小节
          </div>
          <div className="mt-1 text-xs text-gray-400">
            本节 {progressInfo.currentSectionAnswered + 1}/{progressInfo.currentSectionTotal} · {unitName}
          </div>
        </div>
        <button
          type="button"
          onClick={handlePause}
          disabled={!!feedback}
          className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-gray-500 shadow-sm"
        >
          稍后继续
        </button>
      </div>

      <div className="mb-6 h-2.5 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all"
          style={{
            width: `${Math.round(
              (progressInfo.currentSectionAnswered / progressInfo.currentSectionTotal) * 100,
            )}%`,
          }}
        />
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-md">
        {question.questionType === 'listen' ? (
          <div className="text-center">
            <div className="text-5xl">🎧</div>
            <h2 className="mt-3 text-xl font-bold text-gray-800">听一听，选出单词</h2>
            <button
              type="button"
              onClick={() => speak(word.en, 0.8, { onEnd: () => setAudioState({ questionId: question.id, ready: true, failed: false }), onUnavailable: () => setAudioState({ questionId: question.id, ready: false, failed: true }) })}
              className="mt-4 h-14 w-14 rounded-full bg-indigo-50 text-2xl active:scale-90"
              aria-label="重播发音"
            >
              🔊
            </button>
            <p className="mt-3 text-xs text-gray-500">{!isSpeechAvailable() || (audioState?.questionId === question.id && audioState.failed) ? '暂时无法播放，不会因此计错。' : canAnswer ? '听完啦，可以作答。' : '请先听完发音；如果没有声音，可以改为认读题。'}</p>
            <button onClick={switchToReading} className="mt-2 rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-700">没有声音，改为认读题</button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl">{word.emoji}</div>
            <h2 className="mt-3 text-xl font-bold text-gray-800">{word.zh}</h2>
            <p className="mt-1 text-sm text-gray-400">
              {question.questionType === 'spell' ? '请拼写英文单词' : '选出对应的英文单词'}
            </p>
          </div>
        )}

        {question.questionType === 'spell' ? (
          <div className="mt-6">
            <input
              type="text"
              value={spellAnswer}
              onChange={event => setSpellAnswer(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') handleSpellSubmit()
              }}
              disabled={!!feedback}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              aria-label="英文拼写"
              className={`w-full rounded-2xl border-2 px-4 py-3 text-center text-xl font-bold outline-none ${
                feedback
                  ? feedback.isCorrect
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-primary'
              }`}
              placeholder="输入英文单词"
            />
            {feedback && !feedback.isCorrect && (
              <div className="mt-3 text-center text-sm font-semibold text-red-500">
                正确答案：{word.en}
              </div>
            )}
            <button
              type="button"
              onClick={handleSpellSubmit}
              disabled={!spellAnswer.trim() || !!feedback}
              className="mt-4 w-full rounded-2xl bg-primary py-3 font-bold text-white disabled:opacity-40"
            >
              确认答案
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {choices.map(choice => {
              const isSelected = feedback?.selectedWordId === choice.id
              const isAnswer = feedback && choice.id === word.id
              const style = isAnswer
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : isSelected && !feedback.isCorrect
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : 'border-gray-200 bg-white text-gray-700'

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => commitAnswer(choice.id === word.id, choice.id)}
                  disabled={!!feedback || !canAnswer}
                  className={`w-full rounded-2xl border-2 px-4 py-3 text-lg font-bold active:scale-[0.98] ${style}`}
                >
                  {choice.en}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-xs text-gray-400">
        已完成 {progressInfo.answeredCount} 题 · 答错没关系，会自动安排复习
      </div>
    </div>
  )
}
