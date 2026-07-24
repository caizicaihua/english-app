import { createHashRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import GradePage from './pages/GradePage'
import LearnPage from './pages/LearnPage'
import QuizPage from './pages/QuizPage'
import WrongBookPage from './pages/WrongBookPage'
import StatsPage from './pages/StatsPage'
import AchievementsPage from './pages/AchievementsPage'
import SettingsPage from './pages/SettingsPage'
import MathHomePage from './pages/MathHomePage'
import MathPracticePage from './pages/MathPracticePage'
import MathResultPage from './pages/MathResultPage'
import MathWrongBookPage from './pages/MathWrongBookPage'
import BridgeHomePage from './pages/BridgeHomePage'
import BridgeSetupPage from './pages/BridgeSetupPage'
import TodayPlanPage from './pages/TodayPlanPage'

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
      { path: 'wrong-book/quiz', element: <QuizPage reviewMode /> },
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
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
