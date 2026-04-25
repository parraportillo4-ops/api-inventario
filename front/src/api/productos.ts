import type { Producto } from './types'
import { apiClient } from './client'

export type ProductoCreateBody = {
  nombreProducto: string
  descripcion: string
  unidadMedida: string
}

export async function listProductos() {
  const { data } = await apiClient.get<Producto[]>('/productos')
  return data
}

export async function createProducto(body: ProductoCreateBody) {
  const { data } = await apiClient.post<Producto>('/productos', body)
  return data
}