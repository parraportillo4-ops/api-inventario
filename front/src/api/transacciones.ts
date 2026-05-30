import type { Transaccion } from './types'
import { apiClient } from './client'

export type TransaccionCreateBody = {
  idProducto: number
  idVendedor: number
  idComprador: number
  cantidad: number
  precio: number
  fecha: string
}

export async function listTransacciones() {
  const { data } = await apiClient.get<Transaccion[]>('/transacciones')
  return data
}

export async function createTransaccion(body: TransaccionCreateBody) {
  const { data } = await apiClient.post<Transaccion>('/transacciones', body)
  return data
}

export async function deleteTransaccion(id: number) {
  await apiClient.delete(`/transacciones/${id}`)
}
