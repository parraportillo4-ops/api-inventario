import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import { setStoredToken, getStoredToken } from '../api/client'
import type { Usuario } from '../api/types'

type AuthContextValue = {
  user: Usuario | null
  isAdmin: boolean
  loading: boolean
  login: (body: authApi.LoginBody) => Promise<void>
  register: (body: authApi.RegisterBody) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function resolveUserFromToken(): Promise<Usuario | null> {
  try {
    return await authApi.getMe()
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setStoredToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const token = getStoredToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const u = await resolveUserFromToken()
        if (!cancelled) {
          if (u) setUser(u)
          else logout()
        }
      } catch {
        if (!cancelled) logout()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [logout])

  const login = useCallback(async (body: authApi.LoginBody) => {
    const { token } = await authApi.login(body)
    setStoredToken(token)
    const u = await resolveUserFromToken()
    if (!u) throw new Error('No se pudo cargar el usuario')
    setUser(u)
  }, [])

  const register = useCallback(async (body: authApi.RegisterBody) => {
    const { token } = await authApi.register(body)
    setStoredToken(token)
    const u = await resolveUserFromToken()
    if (!u) throw new Error('No se pudo cargar el usuario')
    setUser(u)
  }, [])

  const isAdmin = user?.tipoUsuario?.toUpperCase() === 'ADMIN'

  const value = useMemo(
    () => ({ user, isAdmin, loading, login, register, logout }),
    [user, isAdmin, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
