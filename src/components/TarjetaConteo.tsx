import { useState, type FormEvent } from 'react'
import { aTexto, formatoCantidad, leerNumero } from '../lib/formato'
import { claseCategoria } from '../lib/colores'
import type { Categoria, ProductoInventario } from '../types'

type Props = {
  producto: ProductoInventario
  categoria: Categoria | undefined
  contadoActual: number | null
  guardando: boolean
  onGuardar: (valor: number) => void
  onAnterior: () => void
  onSaltar: () => void
}

function TarjetaConteo({
  producto,
  categoria,
  contadoActual,
  guardando,
  onGuardar,
  onAnterior,
  onSaltar,
}: Props) {
  const [valor, setValor] = useState(contadoActual === null ? '' : aTexto(contadoActual))
  const [error, setError] = useState<string | null>(null)

  function enviar(e: FormEvent) {
    e.preventDefault()
    const numero = leerNumero(valor)
    if (numero === null || numero < 0) {
      setError('Escribe la cantidad que contaste')
      return
    }
    if (!producto.fraccionable && !Number.isInteger(numero)) {
      setError('Este producto se cuenta en unidades enteras')
      return
    }
    setError(null)
    onGuardar(numero)
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div
        className={`flex flex-col items-center gap-2 rounded-2xl border p-6 text-center ${claseCategoria(categoria?.color ?? 'green')}`}
      >
        <span className="text-6xl">{categoria?.emoji ?? '📦'}</span>
        <h2 className="text-2xl font-extrabold leading-tight">{producto.nombre}</h2>
      </div>

      <div className="rounded-2xl bg-superficie p-4 text-center">
        <p className="text-sm font-bold text-suave">En el sistema hay</p>
        <p className="text-4xl font-extrabold text-texto">
          {formatoCantidad(producto.stock)}
          <span className="ml-2 text-base font-bold text-suave">
            {producto.fraccionable ? 'kg' : 'unidades'}
          </span>
        </p>
      </div>

      <label className="flex flex-col gap-1 text-center font-bold text-suave">
        Cuántas contaste
        <input
          autoFocus
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full rounded-2xl border border-borde bg-superficie px-4 py-4 text-center text-4xl font-extrabold outline-none focus:border-verde"
        />
      </label>

      {error && (
        <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-center font-bold text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={guardando}
        onClick={() => onGuardar(producto.stock)}
        className="w-full rounded-2xl border border-verde bg-superficie px-6 py-3 text-lg font-bold text-verde active:bg-superficie-2 disabled:opacity-60"
      >
        Está igual
      </button>

      <button
        type="submit"
        disabled={guardando}
        className="w-full rounded-2xl bg-verde px-6 py-4 text-xl font-bold text-fondo active:scale-[0.98] disabled:opacity-60"
      >
        {guardando ? 'Guardando...' : 'Guardar y seguir'}
      </button>

      <div className="flex justify-between text-lg font-bold text-suave">
        <button type="button" onClick={onAnterior}>
          Anterior
        </button>
        <button type="button" onClick={onSaltar}>
          Saltar
        </button>
      </div>
    </form>
  )
}

export default TarjetaConteo
