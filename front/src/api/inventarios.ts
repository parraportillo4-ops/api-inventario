import type { Inventario } from './types'
import { apiClient } from './client'

export type InventarioCreateBody = {
  usuario: { idUsuario: number }
  producto: { idProducto: number }
  cantidadDisponible: number
  fechaRegistro: string
  precio: number
}

export async function listMisInventarios() {
  const { data } = await apiClient.get<Inventario[]>('/inventarios/mios')
  return data
}

export async function listMercadoInventarios() {
  const { data } = await apiClient.get<Inventario[]>('/inventarios/mercado')
  return data
}

export async function listInventariosPorProductor(idUsuario: number) {
  const { data } = await apiClient.get<Inventario[]>(`/inventarios/productor/${idUsuario}`)
  return data
}

export async function listInventarios() {
  const { data } = await apiClient.get<Inventario[]>('/inventarios')
  return data
}

export async function createInventario(body: InventarioCreateBody) {
  const { data } = await apiClient.post<Inventario>('/inventarios', body)
  return data
}

export async function deleteInventario(id: number) {
  await apiClient.delete(`/inventarios/${id}`)
}
