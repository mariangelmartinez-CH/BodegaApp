import { NavLink } from 'react-router'

const items = [
  { to: '/', label: 'Inventario', icon: '📦' },
  { to: '/conteo', label: 'Conteo', icon: '🧮' },
  { to: '/caja', label: 'Caja', icon: '💰' },
  { to: '/fiados', label: 'Fiados', icon: '📒' },
  { to: '/facturas', label: 'Pedidos', icon: '🧾' },
]

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md justify-around border-t-2 border-gray-200 bg-white px-1 pb-2 pt-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center rounded-2xl py-1 text-xs font-bold ${
              isActive ? 'bg-green-100 text-green-700' : 'text-gray-500'
            }`
          }
        >
          <span className="text-2xl">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
