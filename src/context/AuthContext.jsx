import { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from './ToastContext'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const { addToast } = useToast()

  useEffect(() => {
    const savedSession = sessionStorage.getItem('kk_auth_session')
    if (savedSession) {
      setUser(JSON.parse(savedSession))
    }
  }, [])

  function login(email, password) {
    const users = JSON.parse(localStorage.getItem('kk_users') || '[]')
    const found = users.find(u => u.email === email && u.password === password)
    if (found) {
      if (found.deletedAt) {
        return { success: false, error: 'Akun telah dihapus.' }
      }
      const userData = { ...found }
      delete userData.password // don't keep password in session
      setUser(userData)
      sessionStorage.setItem('kk_auth_session', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: 'Email atau password salah' }
  }

  function register(data) {
    const users = JSON.parse(localStorage.getItem('kk_users') || '[]')
    if (users.find(u => u.email === data.email)) {
      return { success: false, error: 'Email tersebut sudah ada, gunakan email lain' }
    }
    
    const newUser = {
      id: 'USR-' + Date.now(),
      ...data,
      joinedAt: new Date().toISOString(),
      address: data.address || {}
    }
    
    users.push(newUser)
    localStorage.setItem('kk_users', JSON.stringify(users))
    
    return { success: true }
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem('kk_auth_session')
  }

  function updateProfile(updates) {
    if (!user) return
    const users = JSON.parse(localStorage.getItem('kk_users') || '[]')
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, ...updates }
      }
      return u
    })
    localStorage.setItem('kk_users', JSON.stringify(updatedUsers))
    
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    sessionStorage.setItem('kk_auth_session', JSON.stringify(updatedUser))
    addToast('Profil berhasil diperbarui')
  }

  function deleteAccount(id) {
    const users = JSON.parse(localStorage.getItem('kk_users') || '[]')
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        return { ...u, deletedAt: new Date().toISOString() }
      }
      return u
    })
    localStorage.setItem('kk_users', JSON.stringify(updatedUsers))
    if (user && user.id === id) {
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
