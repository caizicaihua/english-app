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
      { path: 'stats', element: <StatsPage /> },
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
