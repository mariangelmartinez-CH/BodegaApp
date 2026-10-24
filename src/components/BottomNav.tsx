import { NavLink, useLocation } from 'react-router'
import { useAuth } from '../auth/context'
import Icono, { type NombreIcono } from './Icono'

const items: { to: string; label: string; icono: NombreIcono }[] = [
  { to: '/', label: 'Inventario', icono: 'inventario' },
  { to: '/conteo', label: 'Conteo', icono: 'conteo' },
  { to: '/caja', label: 'Caja', icono: 'caja' },
  { to: '/fiados', label: 'Fiados', icono: 'fiados' },
  { to: '/facturas', label: 'Pedidos', icono: 'pedidos' },
]

function BottomNav() {
  const { perfil } = useAuth()
  const { pathname } = useLocation()
  const puedeContar = perfil?.rol === 'admin' || perfil?.rol === 'operador'
  const visibles = items.filter((item) => item.to !== '/conteo' || puedeContar)
  const enInventario =
    pathname === '/' || pathname.startsWith('/categoria/') || pathname === '/faltan'

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md border-t border-borde bg-superficie/95 pb-2 pt-1 backdrop-blur">
      {visibles.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) => {
            const activo = item.to === '/' ? enInventario : isActive
            return `flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors ${
              activo ? 'text-verde' : 'text-suave'
            }`
          }}
        >
          <Icono nombre={item.icono} className="h-6 w-6" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
