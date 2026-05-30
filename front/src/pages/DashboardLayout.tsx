import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import styles from '../styles/pages/dashboard.module.css'

const nav = [
  { to: '/catalogo', label: 'Mis productos' },
  { to: '/inventario', label: 'Mis publicaciones' },
  { to: '/mercado', label: 'Mercado' },
  { to: '/transacciones', label: 'Transacciones' },
] as const

export function DashboardLayout() {
  const { user, isAdmin, logout } = useAuth()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Inventario</span>
        <div className={styles.userRow}>
          <span className={styles.greeting}>
            Hola, <strong>{user ? `${user.nombre} ${user.apellido}` : '…'}</strong>
            {isAdmin && <span className={styles.adminBadge}>Administrador</span>}
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
        {isAdmin && (
          <NavLink
            to="/admin/transacciones"
            className={({ isActive }) =>
              isActive ? styles.navLinkActive : styles.navLink
            }
          >
            Admin transacciones
          </NavLink>
        )}
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
