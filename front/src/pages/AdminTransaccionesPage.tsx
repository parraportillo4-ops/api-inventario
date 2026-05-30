import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { getApiErrorMessage } from '../api/errors'
import * as inventariosApi from '../api/inventarios'
import * as transaccionesApi from '../api/transacciones'
import * as usuariosApi from '../api/usuarios'
import type { Inventario, Transaccion, Usuario } from '../api/types'
import formStyles from '../styles/pages/forms.module.css'
import tableStyles from '../styles/pages/tables.module.css'

function formatUserName(nombre: string, apellido: string) {
  return `${nombre} ${apellido}`.trim()
}

function nowLocalDateTimeInput() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

function isProductorCandidate(user: Usuario) {
  return user.tipoUsuario?.toUpperCase() !== 'ADMIN'
}

export function AdminTransaccionesPage() {
  const [rows, setRows] = useState<Transaccion[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [publicaciones, setPublicaciones] = useState<Inventario[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [idVendedor, setIdVendedor] = useState('')
  const [idPublicacion, setIdPublicacion] = useState('')
  const [idComprador, setIdComprador] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [precio, setPrecio] = useState('')
  const [fecha, setFecha] = useState(nowLocalDateTimeInput)

  const productores = useMemo(
    () => usuarios.filter(isProductorCandidate),
    [usuarios],
  )

  const compradores = useMemo(() => {
    const vendedorId = Number(idVendedor)
    return usuarios.filter(
      (u) => isProductorCandidate(u) && (!Number.isFinite(vendedorId) || u.idUsuario !== vendedorId),
    )
  }, [usuarios, idVendedor])

  const publicacionSeleccionada = useMemo(
    () => publicaciones.find((p) => String(p.idInventario) === idPublicacion) ?? null,
    [publicaciones, idPublicacion],
  )

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [txs, users] = await Promise.all([
        transaccionesApi.listTransacciones(),
        usuariosApi.listUsuarios(),
      ])
      setRows(txs)
      setUsuarios(users)
    } catch {
      setError('No se pudieron cargar los datos de administración.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPublicaciones = useCallback(async (productorId: string) => {
    const id = Number(productorId)
    if (!Number.isFinite(id) || id <= 0) {
      setPublicaciones([])
      return
    }
    setLoadingPublicaciones(true)
    setFormError(null)
    try {
      const pubs = await inventariosApi.listInventariosPorProductor(id)
      setPublicaciones(pubs)
      if (pubs.length === 0) {
        setFormError('Este productor no tiene publicaciones con stock disponible.')
      }
    } catch (err) {
      setPublicaciones([])
      setFormError(getApiErrorMessage(err, 'No se pudieron cargar las publicaciones del productor.'))
    } finally {
      setLoadingPublicaciones(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function onProductorChange(productorId: string) {
    setIdVendedor(productorId)
    setIdPublicacion('')
    setIdComprador('')
    setCantidad('')
    setPrecio('')
    setFormError(null)
    void loadPublicaciones(productorId)
  }

  function onPublicacionChange(publicacionId: string) {
    setIdPublicacion(publicacionId)
    const pub = publicaciones.find((p) => String(p.idInventario) === publicacionId)
    if (pub) {
      setPrecio(String(pub.precio ?? pub.producto.precio ?? 0))
    } else {
      setPrecio('')
    }
    setCantidad('')
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const idV = Number(idVendedor)
    const idC = Number(idComprador)
    const cant = Number(cantidad)
    const price = Number(precio)

    if (!publicacionSeleccionada) {
      setFormError('Selecciona una publicación del productor.')
      return
    }
    if (!Number.isFinite(idV) || idV <= 0 || !Number.isFinite(idC) || idC <= 0) {
      setFormError('Selecciona productor y comprador.')
      return
    }
    if (idV === idC) {
      setFormError('El productor y el comprador deben ser distintos.')
      return
    }
    if (!Number.isFinite(cant) || cant <= 0) {
      setFormError('Indica una cantidad válida.')
      return
    }
    if (cant > publicacionSeleccionada.cantidadDisponible) {
      setFormError(
        `La cantidad no puede superar el stock publicado (${publicacionSeleccionada.cantidadDisponible} ${publicacionSeleccionada.producto.unidadMedida}).`,
      )
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormError('Indica un precio válido.')
      return
    }
    if (!fecha) {
      setFormError('Indica la fecha de la transacción.')
      return
    }

    setSaving(true)
    try {
      await transaccionesApi.createTransaccion({
        idProducto: publicacionSeleccionada.producto.idProducto,
        idVendedor: idV,
        idComprador: idC,
        cantidad: cant,
        precio: price,
        fecha: new Date(fecha).toISOString(),
      })
      setIdPublicacion('')
      setIdComprador('')
      setCantidad('')
      setPrecio('')
      setFecha(nowLocalDateTimeInput())
      await load()
      await loadPublicaciones(idVendedor)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'No se pudo registrar la transacción.'))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm('¿Eliminar esta transacción?')) return
    setDeletingId(id)
    try {
      await transaccionesApi.deleteTransaccion(id)
      await load()
      if (idVendedor) await loadPublicaciones(idVendedor)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar la transacción.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section>
      <h2 className={tableStyles.heading} style={{ marginTop: 0 }}>
        Administrar transacciones
      </h2>
      <p className={tableStyles.muted}>
        Elige primero el productor, luego una de sus publicaciones activas, y registra la venta.
      </p>

      <form className={formStyles.form} onSubmit={onCreate}>
        <h3 className={formStyles.legend}>Registrar venta</h3>
        {formError && <p className={formStyles.formError}>{formError}</p>}
        <div className={formStyles.grid}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="tx-vendedor">
              1. Productor (vendedor)
            </label>
            <select
              id="tx-vendedor"
              className={formStyles.select}
              required
              value={idVendedor}
              onChange={(e) => onProductorChange(e.target.value)}
            >
              <option value="">— Seleccionar productor —</option>
              {productores.map((u) => (
                <option key={u.idUsuario} value={String(u.idUsuario)}>
                  {formatUserName(u.nombre, u.apellido)} ({u.correo})
                </option>
              ))}
            </select>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="tx-publicacion">
              2. Publicación del productor
            </label>
            <select
              id="tx-publicacion"
              className={formStyles.select}
              required
              disabled={!idVendedor || loadingPublicaciones || publicaciones.length === 0}
              value={idPublicacion}
              onChange={(e) => onPublicacionChange(e.target.value)}
            >
              <option value="">
                {!idVendedor
                  ? '— Primero elige un productor —'
                  : loadingPublicaciones
                    ? 'Cargando publicaciones…'
                    : publicaciones.length === 0
                      ? '— Sin publicaciones con stock —'
                      : '— Seleccionar publicación —'}
              </option>
              {publicaciones.map((pub) => (
                <option key={pub.idInventario} value={String(pub.idInventario)}>
                  {pub.producto.nombreProducto} — {pub.cantidadDisponible}{' '}
                  {pub.producto.unidadMedida} a ${pub.precio ?? pub.producto.precio ?? 0}
                </option>
              ))}
            </select>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="tx-comprador">
              3. Comprador
            </label>
            <select
              id="tx-comprador"
              className={formStyles.select}
              required
              disabled={!idPublicacion}
              value={idComprador}
              onChange={(e) => setIdComprador(e.target.value)}
            >
              <option value="">— Seleccionar comprador —</option>
              {compradores.map((u) => (
                <option key={u.idUsuario} value={String(u.idUsuario)}>
                  {formatUserName(u.nombre, u.apellido)} ({u.correo})
                </option>
              ))}
            </select>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="tx-cantidad">
              4. Cantidad
            </label>
            <input
              id="tx-cantidad"
              className={formStyles.input}
              type="number"
              required
              min={1}
              step={1}
              disabled={!idPublicacion}
              max={publicacionSeleccionada?.cantidadDisponible}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
            {publicacionSeleccionada && (
              <span className={tableStyles.muted}>
                Máximo: {publicacionSeleccionada.cantidadDisponible}{' '}
                {publicacionSeleccionada.producto.unidadMedida}
              </span>
            )}
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="tx-precio">
              5. Precio unitario
            </label>
            <input
              id="tx-precio"
              className={formStyles.input}
              type="number"
              required
              min={0}
              step="any"
              disabled={!idPublicacion}
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="tx-fecha">
              6. Fecha
            </label>
            <input
              id="tx-fecha"
              className={formStyles.input}
              type="datetime-local"
              required
              disabled={!idPublicacion}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        </div>
        <div className={formStyles.actions}>
          <button
            className={formStyles.btnPrimary}
            type="submit"
            disabled={saving || !idPublicacion}
          >
            {saving ? 'Guardando…' : 'Registrar transacción'}
          </button>
        </div>
      </form>

      {loading && <p className={tableStyles.muted}>Cargando…</p>}
      {error && <p className={tableStyles.error}>{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <div className={tableStyles.panel}>
          <p className={tableStyles.empty}>No hay transacciones registradas.</p>
        </div>
      )}
      {!loading && rows.length > 0 && (
        <div className={tableStyles.grid}>
          {rows.map((tx) => (
            <article key={tx.idTransaccion} className={tableStyles.card}>
              <h3 className={tableStyles.cardTitle}>{tx.producto.nombreProducto}</h3>
              <p className={tableStyles.cardMeta}>
                <strong>Productor:</strong>{' '}
                {formatUserName(tx.vendedor.nombre, tx.vendedor.apellido)}
              </p>
              <p className={tableStyles.cardMeta}>
                <strong>Comprador:</strong>{' '}
                {formatUserName(tx.comprador.nombre, tx.comprador.apellido)}
              </p>
              <p className={tableStyles.cardMeta}>
                <strong>Cantidad:</strong> {tx.cantidad} {tx.producto.unidadMedida}
              </p>
              <p className={tableStyles.cardMeta}>
                <strong>Precio:</strong> ${tx.precio}
              </p>
              <p className={tableStyles.cardMeta}>
                <strong>Fecha:</strong> {new Date(tx.fecha).toLocaleString()}
              </p>
              <button
                type="button"
                className={formStyles.btnDanger}
                disabled={deletingId === tx.idTransaccion}
                onClick={() => void onDelete(tx.idTransaccion)}
              >
                {deletingId === tx.idTransaccion ? 'Eliminando…' : 'Eliminar'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
