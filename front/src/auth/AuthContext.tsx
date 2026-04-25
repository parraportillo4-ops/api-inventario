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
import * as usuariosApi from '../api/usuarios'
import { setStoredToken, getStoredToken } from '../api/client'
import type { Usuario } from '../api/types'
import { getSubjectFromToken } from './jwt'

type AuthContextValue = {
  user: Usuario | null
  loading: boolean
  login: (body: authApi.LoginBody) => Promise<void>
  register: (body: authApi.RegisterBody) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function resolveUserFromToken(token: string): Promise<Usuario | null> {
  const email = getSubjectFromToken(token)
  if (!email) return null
  const usuarios = await usuariosApi.listUsuarios()
  return usuarios.find((u) => u.correo === email) ?? null
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
        const u = await resolveUserFromToken(token)
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
    const u = await resolveUserFromToken(token)
    if (!u) throw new Error('No se pudo cargar el usuario')
    setUser(u)
  }, [])

  const register = useCallback(async (body: authApi.RegisterBody) => {
    const { token } = await authApi.register(body)
    setStoredToken(token)
    const u = await resolveUserFromToken(token)
    if (!u) throw new Error('No se pudo cargar el usuario')
    setUser(u)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
