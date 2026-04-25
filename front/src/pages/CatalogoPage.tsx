import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { getApiErrorMessage } from '../api/errors'
import * as productosApi from '../api/productos'
import type { Producto } from '../api/types'
import formStyles from '../styles/pages/forms.module.css'
import tableStyles from '../styles/pages/tables.module.css'

export function CatalogoPage() {
  const [rows, setRows] = useState<Producto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [unidadMedida, setUnidadMedida] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await productosApi.listProductos()
      setRows(data)
    } catch {
      setError('No se pudo cargar el catálogo.')
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
    setSaving(true)
    try {
      await productosApi.createProducto({
        nombreProducto: nombreProducto.trim(),
        descripcion: descripcion.trim(),
        unidadMedida: unidadMedida.trim(),
      })
      setNombreProducto('')
      setDescripcion('')
      setUnidadMedida('')
      await reload()
    } catch (err) {
      setFormError(
        getApiErrorMessage(err, 'No se pudo crear el producto. Revisa los datos.'),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <form className={formStyles.form} onSubmit={onCreateProduct}>
        <h3 className={formStyles.legend}>Nuevo producto en el catálogo</h3>
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
        </div>
        <div className={formStyles.actions}>
          <button className={formStyles.btnPrimary} type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Crear producto'}
          </button>
        </div>
      </form>

      <div className={tableStyles.panel}>
        <h2 className={tableStyles.heading}>Catálogo global</h2>
        {loading && <p className={tableStyles.muted}>Cargando…</p>}
        {error && <p className={tableStyles.error}>{error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className={tableStyles.empty}>No hay productos en el catálogo.</p>
        )}
        {!loading && rows.length > 0 && (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.idProducto}>
                  <td>{p.idProducto}</td>
                  <td>{p.nombreProducto}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.unidadMedida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
