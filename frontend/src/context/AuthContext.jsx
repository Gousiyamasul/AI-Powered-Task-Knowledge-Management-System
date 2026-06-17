import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage safely
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

    const login = useCallback(async (username, password) => {
    try {
      console.log("Attempting login...")   // ← Add this
      const response = await api.post('/auth/login', { username, password })
      const data = response.data

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data))
      
      setUser(data)
      return data
    } catch (error) {
      console.error("Login Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
  }, [])

  const value = {
    user,
    login,
    logout,
    isAdmin: user?.role === 'admin' || user?.role_name === 'admin',
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)