import { useState } from 'react'
import { useAuth } from '../auth/context'
import FiadoForm from '../components/FiadoForm'
import PageTitle from '../components/PageTitle'
import PagoForm from '../components/PagoForm'
import { useFiados } from '../data/fiados'
import { formatoPesos } from '../lib/formato'
import type { Fiado } from '../types'

function textoFecha(fecha: string) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  })
}

function GrupoCliente({
  nombre,
  lineas,
  puedeRegistrar,
  onPagar,
}: {
  nombre: string
  lineas: Fiado[]
  puedeRegistrar: boolean
  onPagar: (f: Fiado) => void
}) {
  const total = lineas.reduce((suma, f) => suma + f.saldo, 0)

  return (
    <li className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-extrabold text-gray-800">{nombre}</p>
        <p className="text-xl font-extrabold text-red-600">{formatoPesos(total)}</p>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {lineas.map((f) => (
          <li key={f.id} className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <div>
              <p className="font-bold text-gray-700">
                {formatoPesos(f.saldo)}
                {f.pagado > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    de {formatoPesos(f.monto)}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {textoFecha(f.fecha)}
                {f.nota && `, ${f.nota}`}
              </p>
            </div>
            {puedeRegistrar && (
              <button
                onClick={() => onPagar(f)}
                className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-[0_3px_0_0_#15803d] active:translate-y-0.5 active:shadow-none"
              >
                Pagó
              </button>
            )}
          </li>
        ))}
      </ul>
    </li>
  )
}

function Fiados() {
  const { perfil } = useAuth()
  const puedeRegistrar = perfil?.rol === 'admin' || perfil?.rol === 'operador'
  const fiados = useFiados()
  const [nuevo, setNuevo] = useState(false)
  const [pagando, setPagando] = useState<Fiado | null>(null)

  if (fiados.isLoading) {
    return <p className="py-10 text-center font-bold text-gray-500">Cargando...</p>
  }

  if (fiados.error) {
    return (
      <p className="py-10 text-center font-bold text-red-600">
        No se pudieron cargar los fiados. ¿Ya corriste el archivo 0010 en Supabase?
      </p>
    )
  }

  const pendientes = (fiados.data ?? []).filter((f) => f.saldo > 0)
  const porCliente = new Map<string, Fiado[]>()
  for (const f of pendientes) {
    porCliente.set(f.cliente, [...(porCliente.get(f.cliente) ?? []), f])
  }
  const grupos = [...porCliente.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'))
  const total = pendientes.reduce((suma, f) => suma + f.saldo, 0)

  return (
    <>
      <PageTitle icon="📒" title="Fiados" subtitle="Quién debe y cuánto" />

      <div className="mb-4 rounded-3xl border-2 border-b-4 border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm font-bold text-red-700">Te deben en total</p>
        <p className="text-3xl font-extrabold text-red-700">{formatoPesos(total)}</p>
      </div>

      {puedeRegistrar && (
        <button
          onClick={() => setNuevo(true)}
          className="mb-6 w-full rounded-2xl bg-green-500 px-6 py-4 text-xl font-bold text-white shadow-[0_4px_0_0_#15803d] active:translate-y-1 active:shadow-none"
        >
          + Nuevo fiado
        </button>
      )}

      {grupos.length === 0 && (
        <p className="rounded-2xl bg-white p-4 text-center font-bold text-gray-500">
          Nadie debe nada.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {grupos.map(([nombre, lineas]) => (
          <GrupoCliente
            key={nombre}
            nombre={nombre}
            lineas={lineas}
            puedeRegistrar={puedeRegistrar}
            onPagar={setPagando}
          />
        ))}
      </ul>

      {nuevo && <FiadoForm onCerrar={() => setNuevo(false)} />}
      {pagando && <PagoForm key={pagando.id} fiado={pagando} onCerrar={() => setPagando(null)} />}
    </>
  )
}

export default Fiados
