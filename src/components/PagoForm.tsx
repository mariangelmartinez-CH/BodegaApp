import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { aTexto, formatoPesos, leerDinero } from '../lib/formato'
import { supabase } from '../lib/supabase'
import type { Fiado } from '../types'

type Props = {
  fiado: Fiado
  onCerrar: () => void
}

function PagoForm({ fiado, onCerrar }: Props) {
  const cliente = useQueryClient()
  const [monto, setMonto] = useState(aTexto(fiado.saldo))
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const valor = leerDinero(monto)
    if (valor === null || valor <= 0) {
      setError('Escribe cuánto pagó')
      return
    }
    if (valor > fiado.saldo) {
      setError(`Debe ${formatoPesos(fiado.saldo)}, no puede pagar más`)
      return
    }

    setGuardando(true)
    const { error: fallo } = await supabase
      .from('debt_payments')
      .insert({ deuda_id: fiado.id, monto: valor })
    if (fallo) {
      setError(fallo.message)
      setGuardando(false)
      return
    }

    await cliente.invalidateQueries({ queryKey: ['fiados'] })
    setGuardando(false)
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40">
      <form onSubmit={guardar} className="w-full max-w-md rounded-t-3xl bg-superficie-2 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-texto">Registrar pago</h2>
          <button type="button" onClick={onCerrar} className="text-2xl text-suave">
            ✕
          </button>
        </div>
        <p className="mb-4 font-bold text-suave">
          {fiado.cliente} debe {formatoPesos(fiado.saldo)}
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-center font-bold text-suave">
            Cuánto pagó
            <input
              autoFocus
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full rounded-2xl border border-borde bg-superficie px-4 py-4 text-center text-3xl font-extrabold outline-none focus:border-verde"
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-center font-bold text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full rounded-2xl bg-verde px-6 py-4 text-xl font-bold text-fondo active:scale-[0.98] disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar pago'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PagoForm
