import { apiClient } from './client'

export type LoginBody = { correo: string; password: string }

export type RegisterBody = {
  nombre: string
  apellido: string
  tipoUsuario: string
  telefono: string
  correo: string
  ubicacion: string
  password: string
}

export type AuthResponse = { token: string }

export async function login(body: LoginBody) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', body) /// se envia el body a la API
  return data
}

export async function register(body: RegisterBody) {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', body)
  return data
}