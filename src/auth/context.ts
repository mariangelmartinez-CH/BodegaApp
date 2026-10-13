import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'
import type { Perfil } from '../types'

export type AuthState = {
  session: Session | null
  perfil: Perfil | null
  cargando: boolean
  aviso: string | null
  iniciarSesion: (correo: string, clave: string) => Promise<string | null>
  cerrarSesion: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
