import { lazy, Suspense } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'

const HomePage = lazy(() => import('./pages/HomePage'))
const GradePage = lazy(() => import('./pages/GradePage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const WrongBookPage = lazy(() => import('./pages/WrongBookPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const MathHomePage = lazy(() => import('./pages/MathHomePage'))
const MathPracticePage = lazy(() => import('./pages/MathPracticePage'))
const MathResultPage = lazy(() => import('./pages/MathResultPage'))
const MathWrongBookPage = lazy(() => import('./pages/MathWrongBookPage'))
const BridgeHomePage = lazy(() => import('./pages/BridgeHomePage'))
const BridgeSetupPage = lazy(() => import('./pages/BridgeSetupPage'))
const TodayPlanPage = lazy(() => import('./pages/TodayPlanPage'))
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage'))
const DiagnosticResultPage = lazy(() => import('./pages/DiagnosticResultPage'))
const ReviewQueuePage = lazy(() => import('./pages/ReviewQueuePage'))
const ParentReportPage = lazy(() => import('./pages/ParentReportPage'))

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'grade/:gradeId', element: <GradePage /> },
      { path: 'grade/:gradeId/unit/:unitId', element: <LearnPage /> },
      { path: 'grade/:gradeId/quiz/:unitId', element: <QuizPage /> },
      { path: 'wrong-book', element: <WrongBookPage /> },
      { path: 'wrong-book/quiz', element: <QuizPage practiceMode="wrong-book" /> },
      { path: 'stats', element: <StatsPage /> },
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'math', element: <MathHomePage /> },
      { path: 'math/practice', element: <MathPracticePage /> },
      { path: 'math/result', element: <MathResultPage /> },
      { path: 'math/wrong-book', element: <MathWrongBookPage /> },
      { path: 'bridge', element: <BridgeHomePage /> },
      { path: 'bridge/setup', element: <BridgeSetupPage /> },
      { path: 'bridge/today', element: <TodayPlanPage /> },
      { path: 'bridge/new-words', element: <LearnPage practiceMode="daily-new" /> },
      { path: 'bridge/daily-quiz', element: <QuizPage practiceMode="daily-quiz" /> },
      { path: 'bridge/diagnostic', element: <DiagnosticPage /> },
      { path: 'bridge/diagnostic/result', element: <DiagnosticResultPage /> },
      { path: 'bridge/review', element: <ReviewQueuePage mode="review" /> },
      { path: 'bridge/review/quiz', element: <QuizPage practiceMode="daily-review" /> },
      { path: 'bridge/verification', element: <ReviewQueuePage mode="verification" /> },
      { path: 'bridge/verification/quiz', element: <QuizPage practiceMode="verification" /> },
      { path: 'bridge/report', element: <ParentReportPage /> },
    ],
  },
])

export default function App() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-gray-400">加载中...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
