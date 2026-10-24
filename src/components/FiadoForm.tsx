import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useClientes } from '../data/fiados'
import { leerDinero } from '../lib/formato'
import { supabase } from '../lib/supabase'

type Props = {
  onCerrar: () => void
}

const campo =
  'w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-lg outline-none focus:border-green-500'

function FiadoForm({ onCerrar }: Props) {
  const cliente = useQueryClient()
  const clientes = useClientes()
  const [clienteId, setClienteId] = useState('')
  const [nuevoCliente, setNuevoCliente] = useState('')
  const [monto, setMonto] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const valor = leerDinero(monto)
    if (clienteId === '') {
      setError('Elige a quién se le fió')
      return
    }
    if (clienteId === 'nuevo' && nuevoCliente.trim() === '') {
      setError('Escribe el nombre de la persona')
      return
    }
    if (valor === null || valor <= 0) {
      setError('Escribe el monto del fiado')
      return
    }

    setGuardando(true)

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
      nota: nota.trim() === '' ? null : nota.trim(),
    })
    if (fallo) {
      setError(fallo.message)
      setGuardando(false)
      return
    }

    await Promise.all([
      cliente.invalidateQueries({ queryKey: ['fiados'] }),
      cliente.invalidateQueries({ queryKey: ['clientes'] }),
    ])
    setGuardando(false)
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40">
      <form
        onSubmit={guardar}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-gray-50 p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-800">Nuevo fiado</h2>
          <button type="button" onClick={onCerrar} className="text-2xl text-gray-400">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 font-bold text-gray-600">
            Persona
            <select className={campo} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
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

          <label className="flex flex-col gap-1 font-bold text-gray-600">
            Monto
            <input
              className={campo}
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 font-bold text-gray-600">
            Nota (opcional)
            <input className={campo} value={nota} onChange={(e) => setNota(e.target.value)} />
          </label>

          {error && (
            <p className="rounded-2xl bg-red-100 px-4 py-3 text-center font-bold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full rounded-2xl bg-green-500 px-6 py-4 text-xl font-bold text-white shadow-[0_4px_0_0_#15803d] active:translate-y-1 active:shadow-none disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar fiado'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FiadoForm
