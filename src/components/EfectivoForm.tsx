import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { sumarEfectivo } from '../lib/formato'
import { supabase } from '../lib/supabase'
import CampoEfectivo from './CampoEfectivo'

type Props = {
  onCerrar: () => void
}

const campo =
  'w-full rounded-xl border border-borde bg-superficie px-4 py-3 text-base outline-none focus:border-verde'

function EfectivoForm({ onCerrar }: Props) {
  const cliente = useQueryClient()
  const [billetes, setBilletes] = useState('')
  const [monedas, setMonedas] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const suma = sumarEfectivo(billetes, monedas)
    if (!suma) {
      setError('Escribe cuántos billetes y cuántas monedas hay')
      return
    }

    setGuardando(true)
    const { error: fallo } = await supabase.from('cash_counts').insert({
      monto: suma.total,
      billetes: suma.billetes,
      monedas: suma.monedas,
      nota: nota.trim() === '' ? null : nota.trim(),
    })
    if (fallo) {
      setError(fallo.message)
      setGuardando(false)
      return
    }

    await cliente.invalidateQueries({ queryKey: ['efectivo'] })
    setGuardando(false)
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60">
      <form onSubmit={guardar} className="w-full max-w-md rounded-t-2xl bg-superficie-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-texto">Registrar efectivo</h2>
          <button type="button" onClick={onCerrar} className="text-2xl text-suave">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <CampoEfectivo
            billetes={billetes}
            monedas={monedas}
            onBilletes={setBilletes}
            onMonedas={setMonedas}
          />

          <label className="flex flex-col gap-1 text-sm font-medium text-suave">
            Nota (opcional)
            <input className={campo} value={nota} onChange={(e) => setNota(e.target.value)} />
          </label>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full rounded-xl bg-verde px-6 py-3.5 text-base font-semibold text-fondo active:scale-[0.98] disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EfectivoForm
