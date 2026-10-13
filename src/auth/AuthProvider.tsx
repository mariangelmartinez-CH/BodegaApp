import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../types'
import { AuthContext } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [iniciando, setIniciando] = useState(true)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [perfilResuelto, setPerfilResuelto] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIniciando(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return

    let vigente = true
    const usuarioId = session.user.id

    supabase
      .from('profiles')
      .select('id, nombre, rol, activo')
      .eq('id', usuarioId)
      .single()
      .then(async ({ data, error }) => {
        if (!vigente) return

        if (error || !data || !data.activo) {
          setAviso('Tu usuario está desactivado. Habla con el administrador.')
          setPerfil(null)
          setPerfilResuelto(usuarioId)
          await supabase.auth.signOut()
        } else {
          setAviso(null)
          setPerfil(data as Perfil)
          setPerfilResuelto(usuarioId)
        }
      })

    return () => {
      vigente = false
    }
  }, [session])

  async function iniciarSesion(correo: string, clave: string) {
    setAviso(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    })
    return error ? 'Correo o contraseña incorrectos' : null
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  const cargando =
    iniciando || (session !== null && perfilResuelto !== session.user.id)
  const perfilVigente =
    session && perfil?.id === session.user.id ? perfil : null

  return (
    <AuthContext.Provider
      value={{
        session,
        perfil: perfilVigente,
        cargando,
        aviso,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
