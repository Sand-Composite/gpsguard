import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'

const STORAGE_KEY = 'gpsguard_user'

function getStoredUser() {
  const savedUser = localStorage.getItem(STORAGE_KEY)

  if (!savedUser) return null

  try {
    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function App() {
  const [user, setUser] = useState(() => getStoredUser())

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  if (!user) return <LoginPage onLogin={handleLogin} />

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App











