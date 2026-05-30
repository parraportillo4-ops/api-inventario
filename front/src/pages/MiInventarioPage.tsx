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
  const [precio, setPrecio] = useState('')
  const [fechaRegistro, setFechaRegistro] = useState(todayISODate)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadInventario = useCallback(async () => {
    if (!user) return
    setError(null)
    setLoading(true)
    try {
      const publicaciones = await inventariosApi.listMisInventarios()
      setRows(publicaciones)
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

  function onProductChange(productId: string) {
    setIdProducto(productId)
    const selected = productos.find((p) => String(p.idProducto) === productId)
    if (selected && selected.precio != null) {
      setPrecio(String(selected.precio))
    }
  }

  async function onAddToInventory(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setFormError(null)
    const idP = Number(idProducto)
    const cant = Number(cantidad)
    const price = Number(precio)
    if (!Number.isFinite(idP) || idP <= 0) {
      setFormError('Elige un producto del catálogo.')
      return
    }
    if (!Number.isFinite(cant) || cant <= 0) {
      setFormError('Indica una cantidad válida.')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormError('Indica un precio válido.')
      return
    }
    setSaving(true)
    try {
      await inventariosApi.createInventario({
        usuario: { idUsuario: user.idUsuario },
        producto: { idProducto: idP },
        cantidadDisponible: cant,
        fechaRegistro,
        precio: price,
      })
      setCantidad('')
      setPrecio('')
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

  async function onDeletePublication(id: number) {
    if (!window.confirm('¿Eliminar esta publicación del mercado?')) return
    setDeletingId(id)
    try {
      await inventariosApi.deleteInventario(id)
      await loadInventario()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar la publicación.'))
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) return null

  return (
    <section>
      <form className={formStyles.form} onSubmit={onAddToInventory}>
        <h3 className={formStyles.legend}>Publicar producto</h3>
        <p className={tableStyles.muted} style={{ marginTop: 0 }}>
          Elige uno de tus productos y publícalo para que otros usuarios lo vean en el mercado.
        </p>
        {formError && <p className={formStyles.formError}>{formError}</p>}
        {productos.length === 0 && (
          <p className={formStyles.formError}>
            Primero crea productos en la pestaña Mis productos.
          </p>
        )}
        <div className={formStyles.grid}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="inv-producto">
              Producto
            </label>
            <select
              id="inv-producto"
              className={formStyles.select}
              required
              disabled={productos.length === 0}
              value={idProducto}
              onChange={(e) => onProductChange(e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              {productos.map((p) => (
                <option key={p.idProducto} value={String(p.idProducto)}>
                  {p.nombreProducto} ({p.unidadMedida}) — ${p.precio ?? 0}
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
            <label className={formStyles.label} htmlFor="inv-precio">
              Precio por unidad
            </label>
            <input
              id="inv-precio"
              className={formStyles.input}
              type="number"
              required
              min={0}
              step="any"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
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
            {saving ? 'Guardando…' : 'Publicar producto'}
          </button>
        </div>
      </form>

      <div className={tableStyles.panel}>
        <h2 className={tableStyles.heading}>Mis publicaciones</h2>
        {loading && <p className={tableStyles.muted}>Cargando…</p>}
        {error && <p className={tableStyles.error}>{error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className={tableStyles.empty}>
            No tienes publicaciones activas. Crea un producto en Mis productos y publícalo aquí.
          </p>
        )}
        {!loading && rows.length > 0 && (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr key={inv.idInventario}>
                  <td>{inv.producto.nombreProducto}</td>
                  <td>
                    {inv.cantidadDisponible} {inv.producto.unidadMedida}
                  </td>
                  <td>${inv.precio ?? inv.producto.precio ?? 0}</td>
                  <td>{inv.fechaRegistro}</td>
                  <td>
                    <button
                      type="button"
                      className={formStyles.btnDanger}
                      disabled={deletingId === inv.idInventario}
                      onClick={() => void onDeletePublication(inv.idInventario)}
                    >
                      {deletingId === inv.idInventario ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
