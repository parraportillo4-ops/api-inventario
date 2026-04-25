/** Decodifica el payload del JWT (solo para leer `sub` = correo). */
export function getSubjectFromToken(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const obj = JSON.parse(json) as { sub?: string }
    return obj.sub ?? null
  } catch {
    return null
  }
}
