import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getApiErrorMessage } from '../api/errors'
import * as productosApi from '../api/productos'
import type { Producto } from '../api/types'
import formStyles from '../styles/pages/forms.module.css'
import tableStyles from '../styles/pages/tables.module.css'

export function CatalogoPage() {
  const { user, isAdmin } = useAuth()
  const [rows, setRows] = useState<Producto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [unidadMedida, setUnidadMedida] = useState('')
  const [precio, setPrecio] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await productosApi.listProductos()
      setRows(data)
    } catch {
      setError('No se pudieron cargar tus productos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function onCreateProduct(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const price = Number(precio)
    if (!Number.isFinite(price) || price < 0) {
      setFormError('Indica un precio válido.')
      return
    }
    setSaving(true)
    try {
      await productosApi.createProducto({
        nombreProducto: nombreProducto.trim(),
        descripcion: descripcion.trim(),
        unidadMedida: unidadMedida.trim(),
        precio: price,
      })
      setNombreProducto('')
      setDescripcion('')
      setUnidadMedida('')
      setPrecio('')
      await reload()
    } catch (err) {
      setFormError(
        getApiErrorMessage(err, 'No se pudo crear el producto. Revisa los datos.'),
      )
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteProduct(id: number) {
    if (!window.confirm('¿Eliminar este producto?')) return
    setDeletingId(id)
    try {
      await productosApi.deleteProducto(id)
      await reload()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar el producto.'))
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) return null

  return (
    <section>
      <form className={formStyles.form} onSubmit={onCreateProduct}>
        <h3 className={formStyles.legend}>Crear producto</h3>
        <p className={tableStyles.muted} style={{ marginTop: 0 }}>
          Aquí defines tus productos. Luego publícalos en la pestaña Mis publicaciones para
          que otros los vean en el mercado.
        </p>
        {formError && <p className={formStyles.formError}>{formError}</p>}
        <div className={formStyles.grid}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="prod-nombre">
              Nombre
            </label>
            <input
              id="prod-nombre"
              className={formStyles.input}
              required
              maxLength={50}
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
            />
          </div>
          <div className={formStyles.field} style={{ gridColumn: 'span 2' }}>
            <label className={formStyles.label} htmlFor="prod-desc">
              Descripción
            </label>
            <input
              id="prod-desc"
              className={formStyles.input}
              required
              maxLength={255}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="prod-unidad">
              Unidad de medida
            </label>
            <input
              id="prod-unidad"
              className={formStyles.input}
              required
              maxLength={20}
              placeholder="kg, L, unidad…"
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="prod-precio">
              Precio por unidad
            </label>
            <input
              id="prod-precio"
              className={formStyles.input}
              type="number"
              required
              min={0}
              step="any"
              placeholder="0"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
        </div>
        <div className={formStyles.actions}>
          <button className={formStyles.btnPrimary} type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Crear producto'}
          </button>
        </div>
      </form>

      <div className={tableStyles.panel}>
        <h2 className={tableStyles.heading}>
          {isAdmin ? 'Todos los productos' : 'Mis productos'}
        </h2>
        {loading && <p className={tableStyles.muted}>Cargando…</p>}
        {error && <p className={tableStyles.error}>{error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className={tableStyles.empty}>
            Aún no tienes productos. Créalos arriba para poder publicarlos.
          </p>
        )}
        {!loading && rows.length > 0 && (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.idProducto}>
                  <td>{p.nombreProducto}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.unidadMedida}</td>
                  <td>${p.precio ?? 0}</td>
                  <td>
                    <button
                      type="button"
                      className={formStyles.btnDanger}
                      disabled={deletingId === p.idProducto}
                      onClick={() => void onDeleteProduct(p.idProducto)}
                    >
                      {deletingId === p.idProducto ? 'Eliminando…' : 'Eliminar'}
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
