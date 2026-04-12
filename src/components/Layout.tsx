import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/stats', label: '统计', icon: '📊' },
  { path: '/achievements', label: '成就', icon: '🏆' },
  { path: '/wrong-book', label: '错题本', icon: '📕' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1
            className="text-xl font-bold text-primary cursor-pointer"
            onClick={() => navigate('/')}
          >
            🎒 小学学习
          </h1>
          <button
            onClick={() => navigate('/settings')}
            className="text-xl active:scale-90 transition-transform"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          style={{ willChange: 'opacity' }}
        >
          <Outlet />
        </motion.div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
