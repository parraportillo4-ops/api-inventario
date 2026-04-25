import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { CatalogoPage } from './pages/CatalogoPage'
import { DashboardLayout } from './pages/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { MercadoPage } from './pages/MercadoPage'
import { MiInventarioPage } from './pages/MiInventarioPage'
import { TransaccionesPage } from './pages/TransaccionesPage'
import './styles/app/loading.css'

function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="app-loading">
        <p>Cargando sesión…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/inventario" replace />} />
          <Route path="inventario" element={<MiInventarioPage />} />
          <Route path="catalogo" element={<CatalogoPage />} />
          <Route path="mercado" element={<MercadoPage />} />
          <Route path="transacciones" element={<TransaccionesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
