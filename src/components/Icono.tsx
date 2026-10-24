import type { ReactNode } from 'react'

export type NombreIcono = 'inventario' | 'conteo' | 'caja' | 'fiados' | 'pedidos' | 'flecha'

const rutas: Record<NombreIcono, ReactNode> = {
  inventario: (
    <>
      <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3Z" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" />
    </>
  ),
  conteo: (
    <>
      <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
      <path d="M8 6H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  caja: (
    <>
      <path d="M3 8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6.5 12h.01M17.5 12h.01" />
    </>
  ),
  fiados: (
    <>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
      <path d="M5 17a3 3 0 0 1 3-3h11" />
    </>
  ),
  pedidos: (
    <>
      <path d="M3 7h11v10H3V7Z" />
      <path d="M14 10h4.5L21 13v4h-7v-7Z" />
      <circle cx="7.5" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </>
  ),
  flecha: <path d="m9 6 6 6-6 6" />,
}

type Props = {
  nombre: NombreIcono
  className?: string
}

function Icono({ nombre, className = 'h-6 w-6' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {rutas[nombre]}
    </svg>
  )
}

export default Icono
