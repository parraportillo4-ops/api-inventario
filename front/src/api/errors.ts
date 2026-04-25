import axios from 'axios'

/** Intenta extraer mensaje legible de respuestas Spring / Axios. */
export function getApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data
    if (typeof d === 'string' && d.trim()) return d
    if (d && typeof d === 'object' && 'message' in d) {
      const m = (d as { message?: unknown }).message
      if (typeof m === 'string') return m
    }
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
