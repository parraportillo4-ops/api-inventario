import type { Inventario } from './types'
import { apiClient } from './client'

export type InventarioCreateBody = {
  usuario: { idUsuario: number }
  producto: { idProducto: number }
  cantidadDisponible: number
  fechaRegistro: string
}

export async function listInventarios() {
  const { data } = await apiClient.get<Inventario[]>('/inventarios')
  return data
}

export async function createInventario(body: InventarioCreateBody) {
  const { data } = await apiClient.post<Inventario>('/inventarios', body)
  return data
}
