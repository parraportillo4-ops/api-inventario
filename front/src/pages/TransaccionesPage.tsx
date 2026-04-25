import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import * as transaccionesApi from '../api/transacciones'
import type { Transaccion } from '../api/types'
import tableStyles from '../styles/pages/tables.module.css'

export function TransaccionesPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Transaccion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setError(null)
    setLoading(true)
    try {
      const all = await transaccionesApi.listTransacciones()
      setRows(
        all.filter(
          (tx) =>
            tx.vendedor.idUsuario === user.idUsuario ||
            tx.comprador.idUsuario === user.idUsuario,
        ),
      )
    } catch {
      setError('No se pudieron cargar las transacciones.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  if (!user) return null

  return (
    <section className={tableStyles.panel}>
      <h2 className={tableStyles.heading}>Mis transacciones</h2>
      {loading && <p className={tableStyles.muted}>Cargando…</p>}
      {error && <p className={tableStyles.error}>{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className={tableStyles.empty}>No hay transacciones registradas.</p>
      )}
      {!loading && rows.length > 0 && (
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Vendedor</th>
              <th>Comprador</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => {
              const esVenta = tx.vendedor.idUsuario === user.idUsuario
              return (
                <tr
                  key={tx.idTransaccion}
                  className={esVenta ? tableStyles.rowSale : tableStyles.rowBuy}
                >
                  <td>{tx.idTransaccion}</td>
                  <td>{tx.producto.nombreProducto}</td>
                  <td>
                    {esVenta ? 'Yo' : `${tx.vendedor.nombre} ${tx.vendedor.apellido}`}
                  </td>
                  <td>
                    {!esVenta ? 'Yo' : `${tx.comprador.nombre} ${tx.comprador.apellido}`}
                  </td>
                  <td>{tx.cantidad}</td>
                  <td>${tx.precio}</td>
                  <td>{new Date(tx.fecha).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}
