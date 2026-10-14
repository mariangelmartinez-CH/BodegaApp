import { Outlet } from 'react-router'
import { useAuth } from '../auth/context'
import { useTiempoReal } from '../data/useTiempoReal'
import type { Rol } from '../types'
import BottomNav from './BottomNav'

const etiquetaRol: Record<Rol, string> = {
  admin: 'Admin',
  operador: 'Operador',
  observador: 'Solo ver',
}

function Layout() {
  const { perfil, cerrarSesion } = useAuth()
  useTiempoReal()

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="flex items-center justify-between border-b-2 border-gray-200 bg-white px-4 py-3">
        <div>
          <p className="font-extrabold text-gray-800">{perfil?.nombre}</p>
          <p className="text-xs font-bold text-green-700">
            {perfil ? etiquetaRol[perfil.rol] : ''}
          </p>
        </div>
        <button
          onClick={cerrarSesion}
          className="rounded-2xl border-2 border-gray-200 px-3 py-1 text-sm font-bold text-gray-500 active:bg-gray-100"
        >
          Salir
        </button>
      </header>
      <main className="flex-1 p-4 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout
