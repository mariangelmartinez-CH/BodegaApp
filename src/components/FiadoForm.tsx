import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useClientes } from '../data/fiados'
import { aTexto, formatoPesos, leerDinero } from '../lib/formato'
import { supabase } from '../lib/supabase'
import type { Fiado } from '../types'

type Props = {
  fiado?: Fiado | null
  onCerrar: () => void
}

const campo =
  'w-full rounded-2xl border border-borde bg-superficie px-4 py-3 text-lg outline-none focus:border-verde'

function FiadoForm({ fiado = null, onCerrar }: Props) {
  const cliente = useQueryClient()
  const clientes = useClientes()
  const [clienteId, setClienteId] = useState('')
  const [nuevoCliente, setNuevoCliente] = useState('')
  const [monto, setMonto] = useState(fiado ? aTexto(fiado.monto) : '')
  const [nota, setNota] = useState(fiado?.nota ?? '')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const valor = leerDinero(monto)
    if (!fiado && clienteId === '') {
      setError('Elige a quién se le fió')
      return
    }
    if (!fiado && clienteId === 'nuevo' && nuevoCliente.trim() === '') {
      setError('Escribe el nombre de la persona')
      return
    }
    if (valor === null || valor <= 0) {
      setError('Escribe el monto del fiado')
      return
    }
    if (fiado && valor < fiado.pagado) {
      setError(`Ya se pagaron ${formatoPesos(fiado.pagado)}, el monto no puede ser menor`)
      return
    }

    setGuardando(true)
    const notaFinal = nota.trim() === '' ? null : nota.trim()

    if (fiado) {
      const { error: fallo } = await supabase
        .from('debts')
        .update({ monto: valor, nota: notaFinal })
        .eq('id', fiado.id)
      if (fallo) {
        setError(fallo.message)
        setGuardando(false)
        return
      }
    } else {
      let idCliente = clienteId
      if (clienteId === 'nuevo') {
        const { data, error: fallo } = await supabase
          .from('customers')
          .insert({ nombre: nuevoCliente.trim() })
          .select('id')
          .single()
        if (fallo || !data) {
          setError(fallo?.message ?? 'No se pudo crear la persona')
          setGuardando(false)
          return
        }
        idCliente = data.id
      }

      const { error: fallo } = await supabase.from('debts').insert({
        cliente_id: idCliente,
        monto: valor,
        nota: notaFinal,
      })
      if (fallo) {
        setError(fallo.message)
        setGuardando(false)
        return
      }
    }

    await Promise.all([
      cliente.invalidateQueries({ queryKey: ['fiados'] }),
      cliente.invalidateQueries({ queryKey: ['clientes'] }),
    ])
    setGuardando(false)
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60">
      <form
        onSubmit={guardar}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-superficie-2 p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-texto">
            {fiado ? 'Editar fiado' : 'Nuevo fiado'}
          </h2>
          <button type="button" onClick={onCerrar} className="text-2xl text-suave">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {fiado ? (
            <div className="rounded-xl border border-borde bg-superficie px-4 py-3">
              <p className="text-xs text-suave">Persona</p>
              <p className="font-medium text-texto">{fiado.cliente}</p>
            </div>
          ) : (
            <>
              <label className="flex flex-col gap-1 text-sm font-medium text-suave">
                Persona
                <select
                  className={campo}
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  <option value="">Elige una</option>
                  {(clientes.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                  <option value="nuevo">+ Persona nueva</option>
                </select>
              </label>

              {clienteId === 'nuevo' && (
                <input
                  className={campo}
                  placeholder="Nombre de la persona"
                  value={nuevoCliente}
                  onChange={(e) => setNuevoCliente(e.target.value)}
                />
              )}
            </>
          )}

          <label className="flex flex-col gap-1 text-sm font-medium text-suave">
            Monto
            <input
              className={campo}
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </label>

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
            {guardando ? 'Guardando...' : fiado ? 'Guardar cambios' : 'Guardar fiado'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FiadoForm
