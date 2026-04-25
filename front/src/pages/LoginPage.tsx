import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import styles from '../styles/pages/login.module.css'

export function LoginPage() {
  const { login, register, user, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [loginCorreo, setLoginCorreo] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [reg, setReg] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    ubicacion: '',
    correo: '',
    password: '',
  })

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  async function onLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login({ correo: loginCorreo, password: loginPassword })
      navigate('/', { replace: true })
    } catch {
      setError('Credenciales inválidas')
    } finally {
      setPending(false)
    }
  }

  async function onRegister(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await register({
        ...reg,
        tipoUsuario: 'USER',
      })
      navigate('/', { replace: true })
    } catch {
      setError('No se pudo registrar. Revisa los datos o si el correo ya existe.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Inventario</h1>
        <div className={styles.tabs}>
          <button
            type="button"
            className={tab === 'login' ? styles.tabActive : styles.tab}
            onClick={() => {
              setTab('login')
              setError(null)
            }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={tab === 'register' ? styles.tabActive : styles.tab}
            onClick={() => {
              setTab('register')
              setError(null)
            }}
          >
            Registrarse
          </button>
        </div>

        {tab === 'login' ? (
          <form className={styles.form} onSubmit={onLogin}>
            <label className={styles.label}>
              Correo
              <input
                className={styles.input}
                type="email"
                required
                autoComplete="email"
                value={loginCorreo}
                onChange={(e) => setLoginCorreo(e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Contraseña
              <input
                className={styles.input}
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.submit} type="submit" disabled={pending}>
              {pending ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={onRegister}>
            <label className={styles.label}>
              Nombre
              <input
                className={styles.input}
                required
                value={reg.nombre}
                onChange={(e) => setReg({ ...reg, nombre: e.target.value })}
              />
            </label>
            <label className={styles.label}>
              Apellido
              <input
                className={styles.input}
                required
                value={reg.apellido}
                onChange={(e) => setReg({ ...reg, apellido: e.target.value })}
              />
            </label>
            <label className={styles.label}>
              Teléfono
              <input
                className={styles.input}
                required
                value={reg.telefono}
                onChange={(e) => setReg({ ...reg, telefono: e.target.value })}
              />
            </label>
            <label className={styles.label}>
              Ubicación
              <input
                className={styles.input}
                required
                value={reg.ubicacion}
                onChange={(e) => setReg({ ...reg, ubicacion: e.target.value })}
              />
            </label>
            <label className={styles.label}>
              Correo
              <input
                className={styles.input}
                type="email"
                required
                value={reg.correo}
                onChange={(e) => setReg({ ...reg, correo: e.target.value })}
              />
            </label>
            <label className={styles.label}>
              Contraseña
              <input
                className={styles.input}
                type="password"
                required
                minLength={6}
                value={reg.password}
                onChange={(e) => setReg({ ...reg, password: e.target.value })}
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.submit} type="submit" disabled={pending}>
              {pending ? 'Registrando…' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <p className={styles.hint}>
          API:{' '}
          <code className={styles.code}>
            {import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}
          </code>
        </p>
      </div>
    </div>
  )
}
