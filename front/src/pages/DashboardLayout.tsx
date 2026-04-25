import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import styles from '../styles/pages/dashboard.module.css'

const nav = [
  { to: '/inventario', label: 'Mi inventario' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/mercado', label: 'Mercado' },
  { to: '/transacciones', label: 'Transacciones' },
] as const

export function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Inventario</span>
        <div className={styles.userRow}>
          <span className={styles.greeting}>
            Hola, <strong>{user ? `${user.nombre} ${user.apellido}` : '…'}</strong>
          </span>
          <button type="button" className={styles.logout} onClick={() => logout()}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className={styles.nav}>
        {nav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? styles.navLinkActive : styles.navLink
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
