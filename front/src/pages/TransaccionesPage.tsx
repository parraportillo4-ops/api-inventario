import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import * as transaccionesApi from '../api/transacciones'
import type { Transaccion } from '../api/types'
import tableStyles from '../styles/pages/tables.module.css'

function formatUserName(nombre: string, apellido: string) {
  return `${nombre} ${apellido}`.trim()
}

function getUserRoleInTransaction(
  tx: Transaccion,
  userId: number,
): 'venta' | 'compra' | 'observador' {
  if (tx.vendedor.idUsuario === userId) return 'venta'
  if (tx.comprador.idUsuario === userId) return 'compra'
  return 'observador'
}

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
        [...all].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
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
    <section>
      <h2 className={tableStyles.heading} style={{ marginTop: 0 }}>
        Transacciones
      </h2>
      <p className={tableStyles.muted}>
        Registro público de ventas entre productores y compradores.
      </p>
      {loading && <p className={tableStyles.muted}>Cargando…</p>}
      {error && <p className={tableStyles.error}>{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <div className={tableStyles.panel}>
          <p className={tableStyles.empty}>No hay transacciones registradas.</p>
        </div>
      )}
      {!loading && rows.length > 0 && (
        <div className={tableStyles.grid}>
          {rows.map((tx) => {
            const rol = getUserRoleInTransaction(tx, user.idUsuario)
            const cardClass =
              rol === 'venta'
                ? tableStyles.cardSale
                : rol === 'compra'
                  ? tableStyles.cardBuy
                  : tableStyles.cardNeutral
            const badgeClass =
              rol === 'venta'
                ? tableStyles.badgeSale
                : rol === 'compra'
                  ? tableStyles.badgeBuy
                  : tableStyles.badgeNeutral
            const badgeLabel =
              rol === 'venta'
                ? 'Tu venta'
                : rol === 'compra'
                  ? 'Tu compra'
                  : 'Venta registrada'

            return (
              <article key={tx.idTransaccion} className={`${tableStyles.card} ${cardClass}`}>
                <span className={badgeClass}>{badgeLabel}</span>
                <h3 className={tableStyles.cardTitle}>{tx.producto.nombreProducto}</h3>
                <p className={tableStyles.cardMeta}>
                  <strong>Productor:</strong>{' '}
                  {rol === 'venta'
                    ? 'Yo'
                    : formatUserName(tx.vendedor.nombre, tx.vendedor.apellido)}
                </p>
                <p className={tableStyles.cardMeta}>
                  <strong>Comprador:</strong>{' '}
                  {rol === 'compra'
                    ? 'Yo'
                    : formatUserName(tx.comprador.nombre, tx.comprador.apellido)}
                </p>
                <p className={tableStyles.cardMeta}>
                  <strong>Cantidad:</strong> {tx.cantidad}{' '}
                  {tx.producto.unidadMedida}
                </p>
                <p className={tableStyles.cardMeta}>
                  <strong>Precio:</strong> ${tx.precio}
                </p>
                <p className={tableStyles.cardMeta}>
                  <strong>Fecha:</strong> {new Date(tx.fecha).toLocaleString()}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
