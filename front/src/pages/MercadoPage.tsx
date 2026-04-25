import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import * as inventariosApi from '../api/inventarios'
import type { Inventario } from '../api/types'
import tableStyles from '../styles/pages/tables.module.css'

export function MercadoPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Inventario[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setError(null)
    setLoading(true)
    try {
      const all = await inventariosApi.listInventarios()
      setRows(
        all.filter(
          (inv) =>
            inv.usuario &&
            inv.usuario.idUsuario !== user.idUsuario &&
            inv.cantidadDisponible > 0,
        ),
      )
    } catch {
      setError('No se pudo cargar el mercado.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  if (!user) return null

  return (
    <section>
      <h2 className={tableStyles.heading} style={{ marginTop: 0 }}>
        Mercado (otros usuarios)
      </h2>
      {loading && <p className={tableStyles.muted}>Cargando…</p>}
      {error && <p className={tableStyles.error}>{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <div className={tableStyles.panel}>
          <p className={tableStyles.empty}>
            No hay productos de otros usuarios con stock disponible.
          </p>
        </div>
      )}
      {!loading && rows.length > 0 && (
        <div className={tableStyles.grid}>
          {rows.map((inv) => (
            <article key={inv.idInventario} className={tableStyles.card}>
              <h3 className={tableStyles.cardTitle}>{inv.producto.nombreProducto}</h3>
              <p className={tableStyles.cardMeta}>
                <strong>Vendedor:</strong> {inv.usuario.nombre} {inv.usuario.apellido}
              </p>
              <p className={tableStyles.cardMeta}>
                <strong>Ubicación:</strong> {inv.usuario.ubicacion}
              </p>
              <p className={tableStyles.cardMeta}>
                <strong>Disponible:</strong> {inv.cantidadDisponible}{' '}
                {inv.producto.unidadMedida}
              </p>
              <p className={tableStyles.muted} style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                {inv.producto.descripcion}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
