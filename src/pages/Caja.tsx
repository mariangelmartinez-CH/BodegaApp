import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../auth/context'
import EfectivoForm from '../components/EfectivoForm'
import PageTitle from '../components/PageTitle'
import { useCierres, useEfectivoManual, useFiados } from '../data/fiados'
import { formatoPesos } from '../lib/formato'
import { supabase } from '../lib/supabase'

type Registro = {
  id: string
  manualId: string | null
  fecha: string
  monto: number
  origen: string
  nota: string | null
}

function textoFecha(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function Caja() {
  const { perfil } = useAuth()
  const puedeRegistrar = perfil?.rol === 'admin' || perfil?.rol === 'operador'
  const esAdmin = perfil?.rol === 'admin'
  const cliente = useQueryClient()
  const cierres = useCierres()
  const manuales = useEfectivoManual()
  const fiados = useFiados()
  const [registrando, setRegistrando] = useState(false)

  async function borrar(id: string) {
    if (!window.confirm('¿Borrar este registro de efectivo?')) return
    await supabase.from('cash_counts').delete().eq('id', id)
    await cliente.invalidateQueries({ queryKey: ['efectivo'] })
  }

  if (cierres.isLoading || manuales.isLoading || fiados.isLoading) {
    return <p className="py-10 text-center text-suave">Cargando...</p>
  }

  if (cierres.error || manuales.error || fiados.error) {
    return (
      <p className="py-10 text-center font-medium text-red-400">
        No se pudo cargar la caja. ¿Ya corriste los archivos 0010 y 0013 en Supabase?
      </p>
    )
  }

  const registros: Registro[] = [
    ...(cierres.data ?? [])
      .filter((c) => c.efectivo_contado != null)
      .map((c) => ({
        id: `c-${c.id}`,
        manualId: null,
        fecha: c.cerrado_en,
        monto: c.efectivo_contado as number,
        origen: c.es_inicial ? 'Conteo inicial' : 'Conteo semanal',
        nota: null,
      })),
    ...(manuales.data ?? []).map((m) => ({
      id: `m-${m.id}`,
      manualId: m.id,
      fecha: m.creado_en,
      monto: m.monto,
      origen: 'Solo efectivo',
      nota: m.nota,
    })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha))

  const ultimo = registros[0]
  const anterior = registros[1]
  const diferencia = ultimo && anterior ? ultimo.monto - anterior.monto : null
  const teDeben = (fiados.data ?? []).reduce((suma, f) => suma + f.saldo, 0)

  return (
    <>
      <PageTitle icon="💰" title="Caja" subtitle="Efectivo en pesos y fiados pendientes" />

      <div className="mb-3 rounded-2xl border border-verde/30 bg-verde/10 p-5 text-center">
        <p className="text-sm font-medium text-verde">Efectivo en pesos</p>
        {ultimo ? (
          <>
            <p className="mt-1 text-4xl font-semibold text-texto">{formatoPesos(ultimo.monto)}</p>
            <p className="mt-1 text-sm text-suave">{textoFecha(ultimo.fecha)}</p>
            {ultimo.nota && <p className="mt-2 text-sm text-texto">{ultimo.nota}</p>}
            {diferencia !== null && (
              <p
                className={`mt-2 text-sm font-medium ${diferencia >= 0 ? 'text-verde' : 'text-red-400'}`}
              >
                {diferencia >= 0 ? '+' : '-'}
                {formatoPesos(Math.abs(diferencia))} frente al registro anterior
              </p>
            )}
          </>
        ) : (
          <p className="mt-2 text-suave">Todavía no se ha contado la caja</p>
        )}
      </div>

      {puedeRegistrar && (
        <button
          onClick={() => setRegistrando(true)}
          className="mb-3 w-full rounded-xl bg-verde px-6 py-3.5 text-base font-semibold text-fondo active:scale-[0.98]"
        >
          Registrar efectivo
        </button>
      )}

      <div className="mb-6 rounded-2xl border border-borde bg-superficie p-4 text-center">
        <p className="text-sm text-suave">Te deben en fiados</p>
        <p className="text-3xl font-semibold text-texto">{formatoPesos(teDeben)}</p>
      </div>

      {registros.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-suave">
            Historial
          </h2>
          <ul className="flex flex-col gap-2">
            {registros.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-superficie px-4 py-3"
              >
                <div>
                  <p className="font-medium text-texto">{formatoPesos(r.monto)}</p>
                  <p className="text-xs text-suave">
                    {textoFecha(r.fecha)}, {r.origen}
                  </p>
                  {r.nota && <p className="mt-1 text-sm text-texto">{r.nota}</p>}
                </div>
                {esAdmin && r.manualId && (
                  <button
                    onClick={() => borrar(r.manualId as string)}
                    className="text-sm font-medium text-red-400"
                  >
                    Borrar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {registrando && <EfectivoForm onCerrar={() => setRegistrando(false)} />}
    </>
  )
}

export default Caja
