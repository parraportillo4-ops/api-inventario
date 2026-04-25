import type { Usuario } from './types'
import { apiClient } from './client'

export async function listUsuarios() {
  const { data } = await apiClient.get<Usuario[]>('/usuarios')
  return data
}
