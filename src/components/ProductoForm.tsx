import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { aTexto, leerNumero } from '../lib/formato'
import { supabase } from '../lib/supabase'
import type { ProductoInventario } from '../types'

type Props = {
  producto: ProductoInventario | null
  categoriaId: string
  onCerrar: () => void
}

const campo =
  'w-full rounded-2xl border border-borde bg-superficie px-4 py-3 text-lg outline-none focus:border-verde'

function ProductoForm({ producto, categoriaId, onCerrar }: Props) {
  const queryClient = useQueryClient()
  const fraccionable = producto?.fraccionable ?? false
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [stockMinimo, setStockMinimo] = useState(aTexto(producto?.stock_minimo ?? 0))
  const [stockContado, setStockContado] = useState(aTexto(producto?.stock ?? 0))
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (nombre.trim() === '') {
      setError('Escribe el nombre del producto')
      return
    }

    setGuardando(true)

    const minimo = leerNumero(stockMinimo) ?? 0
    let productoId = producto?.id

    if (producto) {
      const { error: fallo } = await supabase
        .from('products')
        .update({ nombre: nombre.trim(), stock_minimo: minimo })
        .eq('id', producto.id)
      if (fallo) {
        setError(fallo.message)
        setGuardando(false)
        return
      }
    } else {
      const { data, error: fallo } = await supabase
        .from('products')
        .insert({
          nombre: nombre.trim(),
          categoria_id: categoriaId,
          unidad_venta: 'unidad',
          fraccionable: false,
          stock_minimo: minimo,
        })
        .select('id')
        .single()
      if (fallo || !data) {
        setError(fallo?.message ?? 'No se pudo crear el producto')
        setGuardando(false)
        return
      }
      productoId = data.id
    }

    const contado = leerNumero(stockContado)
    const actual = producto?.stock ?? 0

    if (productoId && contado !== null && contado !== actual) {
      const diferencia = Math.round((contado - actual) * 1000) / 1000
      const { error: fallo } = await supabase.from('stock_movements').insert({
        producto_id: productoId,
        cantidad: diferencia,
        tipo: actual === 0 ? 'inicial' : 'ajuste',
      })
      if (fallo) {
        setError(fallo.message)
        setGuardando(false)
        return
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['inventario'] })
    setGuardando(false)
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40">
      <form
        onSubmit={guardar}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-superficie-2 p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-texto">
            {producto ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button type="button" onClick={onCerrar} className="text-2xl text-suave">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 font-bold text-suave">
            Nombre
            <input className={campo} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>

          <div className="grid grid-cols-2 items-end gap-3">
            <label className="flex flex-col gap-1 font-bold text-suave">
              Cantidad hoy
              <input
                className={campo}
                inputMode="decimal"
                value={stockContado}
                onChange={(e) => setStockContado(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 font-bold text-suave">
              Avisar si baja de
              <input
                className={campo}
                inputMode="decimal"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
              />
            </label>
          </div>

          <p className="-mt-2 text-sm text-suave">
            La cantidad se cuenta en {fraccionable ? 'kilos' : 'unidades'}.
          </p>

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
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductoForm
