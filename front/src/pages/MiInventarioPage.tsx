import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getApiErrorMessage } from '../api/errors'
import * as inventariosApi from '../api/inventarios'
import * as productosApi from '../api/productos'
import type { Inventario, Producto } from '../api/types'
import formStyles from '../styles/pages/forms.module.css'
import tableStyles from '../styles/pages/tables.module.css'

function todayISODate() {
  return new Date().toISOString().slice(0, 10)
}

export function MiInventarioPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Inventario[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [idProducto, setIdProducto] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [fechaRegistro, setFechaRegistro] = useState(todayISODate)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadInventario = useCallback(async () => {
    if (!user) return
    setError(null)
    setLoading(true)
    try {
      const all = await inventariosApi.listInventarios()
      setRows(all.filter((inv) => inv.usuario.idUsuario === user.idUsuario))
    } catch {
      setError('No se pudo cargar el inventario.')
    } finally {
      setLoading(false)
    }
  }, [user])

  const loadProductos = useCallback(async () => {
    try {
      const list = await productosApi.listProductos()
      setProductos(list)
    } catch {
      setProductos([])
    }
  }, [])

  useEffect(() => {
    void loadInventario()
  }, [loadInventario])

  useEffect(() => {
    if (user) void loadProductos()
  }, [user, loadProductos])

  async function onAddToInventory(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setFormError(null)
    const idP = Number(idProducto)
    const cant = Number(cantidad)
    if (!Number.isFinite(idP) || idP <= 0) {
      setFormError('Elige un producto del catálogo.')
      return
    }
    if (!Number.isFinite(cant) || cant <= 0) {
      setFormError('Indica una cantidad válida.')
      return
    }
    setSaving(true)
    try {
      await inventariosApi.createInventario({
        usuario: { idUsuario: user.idUsuario },
        producto: { idProducto: idP },
        cantidadDisponible: cant,
        fechaRegistro,
      })
      setCantidad('')
      setFechaRegistro(todayISODate())
      await loadInventario()
    } catch (err) {
      setFormError(
        getApiErrorMessage(err, 'No se pudo agregar al inventario.'),
      )
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <section>
      <form className={formStyles.form} onSubmit={onAddToInventory}>
        <h3 className={formStyles.legend}>Agregar a mi inventario</h3>
        <p className={tableStyles.muted} style={{ marginTop: 0 }}>
          Primero debe existir el producto en el catálogo (pestaña Catálogo).
        </p>
        {formError && <p className={formStyles.formError}>{formError}</p>}
        <div className={formStyles.grid}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="inv-producto">
              Producto
            </label>
            <select
              id="inv-producto"
              className={formStyles.select}
              required
              value={idProducto}
              onChange={(e) => setIdProducto(e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              {productos.map((p) => (
                <option key={p.idProducto} value={String(p.idProducto)}>
                  {p.nombreProducto} ({p.unidadMedida})
                </option>
              ))}
            </select>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="inv-cantidad">
              Cantidad
            </label>
            <input
              id="inv-cantidad"
              className={formStyles.input}
              type="number"
              required
              min={0.01}
              step="any"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="inv-fecha">
              Fecha de registro
            </label>
            <input
              id="inv-fecha"
              className={formStyles.input}
              type="date"
              required
              value={fechaRegistro}
              onChange={(e) => setFechaRegistro(e.target.value)}
            />
          </div>
        </div>
        <div className={formStyles.actions}>
          <button className={formStyles.btnPrimary} type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Agregar al inventario'}
          </button>
        </div>
      </form>

      <div className={tableStyles.panel}>
        <h2 className={tableStyles.heading}>Mi inventario</h2>
        {loading && <p className={tableStyles.muted}>Cargando…</p>}
        {error && <p className={tableStyles.error}>{error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className={tableStyles.empty}>No tienes ítems en inventario todavía.</p>
        )}
        {!loading && rows.length > 0 && (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Fecha registro</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr key={inv.idInventario}>
                  <td>{inv.idInventario}</td>
                  <td>{inv.producto.nombreProducto}</td>
                  <td>
                    {inv.cantidadDisponible} {inv.producto.unidadMedida}
                  </td>
                  <td>{inv.fechaRegistro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
