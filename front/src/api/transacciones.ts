import type { Transaccion } from './types'
import { apiClient } from './client'

export async function listTransacciones() {
  const { data } = await apiClient.get<Transaccion[]>('/transacciones')
  return data
}
