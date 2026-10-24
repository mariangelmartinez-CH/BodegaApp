import { useState } from 'react'
import { Outlet } from 'react-router'
import { useAuth } from '../auth/context'
import { useTiempoReal } from '../data/useTiempoReal'
import type { Rol } from '../types'
import BottomNav from './BottomNav'
import ClaveForm from './ClaveForm'

const etiquetaRol: Record<Rol, string> = {
  admin: 'Administradora',
  operador: 'Operador',
  observador: 'Solo ver',
  gestor_pedidos: 'Pedidos',
}

function Layout() {
  const { perfil, cerrarSesion } = useAuth()
  const [cambiandoClave, setCambiandoClave] = useState(false)
  useTiempoReal()

  const inicial = perfil?.nombre.trim().charAt(0).toUpperCase() ?? ''

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-borde bg-fondo/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-azul/15 text-base font-semibold text-azul">
            {inicial}
          </span>
          <div className="leading-tight">
            <p className="font-semibold text-texto">{perfil?.nombre}</p>
            <p className="text-xs text-suave">{perfil ? etiquetaRol[perfil.rol] : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCambiandoClave(true)}
            className="rounded-lg border border-borde px-3 py-1.5 text-sm font-medium text-suave active:bg-superficie-2"
          >
            Clave
          </button>
          <button
            onClick={cerrarSesion}
            className="rounded-lg border border-borde px-3 py-1.5 text-sm font-medium text-suave active:bg-superficie-2"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="flex-1 px-4 pb-28 pt-5">
        <Outlet />
      </main>
      <BottomNav />
      {cambiandoClave && <ClaveForm onCerrar={() => setCambiandoClave(false)} />}
    </div>
  )
}

export default Layout
