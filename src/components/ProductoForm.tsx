import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { aTexto, formatoCantidad, leerDinero, leerNumero } from '../lib/formato'
import { supabase } from '../lib/supabase'
import type { ProductoInventario } from '../types'

type Props = {
  producto: ProductoInventario | null
  categoriaId: string
  onCerrar: () => void
}

const campo =
  'w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-lg outline-none focus:border-green-500'

function Monto({ valor }: { valor: number }) {
  return (
    <span>
      {formatoCantidad(Math.round(valor))}
      <span className="ml-0.5 text-xs font-normal">cop</span>
    </span>
  )
}

function ProductoForm({ producto, categoriaId, onCerrar }: Props) {
  const queryClient = useQueryClient()
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const fraccionable = producto?.fraccionable ?? false
  const [unidadesPaquete, setUnidadesPaquete] = useState(
    aTexto(producto?.unidades_por_paquete ?? 1),
  )
  const [costo, setCosto] = useState(aTexto(producto?.costo_paquete ?? null))
  const [precio, setPrecio] = useState(aTexto(producto?.precio_venta ?? null))
  const [precioPaquete, setPrecioPaquete] = useState(aTexto(producto?.precio_paquete ?? null))
  const [stockMinimo, setStockMinimo] = useState(aTexto(producto?.stock_minimo ?? 0))
  const [stockContado, setStockContado] = useState(aTexto(producto?.stock ?? 0))
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const palabra = fraccionable ? 'kg' : 'unidad'
  const costoPaquete = leerDinero(costo)
  const porPaquete = leerNumero(unidadesPaquete)
  const precioUnidad = leerDinero(precio)
  const costoUnidad =
    costoPaquete !== null && porPaquete !== null && porPaquete > 0
      ? costoPaquete / porPaquete
      : null
  const gananciaUnidad =
    costoUnidad !== null && precioUnidad !== null ? precioUnidad - costoUnidad : null

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (nombre.trim() === '') {
      setError('Escribe el nombre del producto')
      return
    }
    if (porPaquete === null || porPaquete <= 0) {
      setError('Lo que trae el paquete debe ser mayor que cero')
      return
    }

    setGuardando(true)

    const datos = {
      nombre: nombre.trim(),
      unidad_venta: fraccionable ? 'kg' : 'unidad',
      fraccionable,
      unidades_por_paquete: porPaquete,
      costo_paquete: costoPaquete,
      precio_venta: precioUnidad,
      precio_paquete: leerDinero(precioPaquete),
      stock_minimo: leerNumero(stockMinimo) ?? 0,
    }

    let productoId = producto?.id

    if (producto) {
      const { error: fallo } = await supabase.from('products').update(datos).eq('id', producto.id)
      if (fallo) {
        setError(fallo.message)
        setGuardando(false)
        return
      }
    } else {
      const { data, error: fallo } = await supabase
        .from('products')
        .insert({ ...datos, categoria_id: categoriaId })
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
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-gray-50 p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-800">
            {producto ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button type="button" onClick={onCerrar} className="text-2xl text-gray-400">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 font-bold text-gray-600">
            Nombre
            <input className={campo} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>

          <div className="grid grid-cols-2 items-end gap-3">
            <label className="flex flex-col gap-1 font-bold text-gray-600">
              {fraccionable ? 'Trae la panela (kg)' : 'Trae el paquete (unidades)'}
              <input
                className={campo}
                inputMode="decimal"
                value={unidadesPaquete}
                onChange={(e) => setUnidadesPaquete(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 font-bold text-gray-600">
              {fraccionable ? 'Costo de la panela' : 'Costo del paquete'}
              <input
                className={campo}
                inputMode="decimal"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 font-bold text-gray-600">
            Precio de venta (por {palabra})
            <input
              className={campo}
              inputMode="decimal"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </label>

          {costoUnidad !== null && (
            <p className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-bold text-green-800">
              Cada {palabra} te cuesta <Monto valor={costoUnidad} />
              {gananciaUnidad !== null && (
                <>
                  {' '}
                  y ganas <Monto valor={gananciaUnidad} /> por cada {palabra} que vendes
                </>
              )}
            </p>
          )}

          <label className="flex flex-col gap-1 font-bold text-gray-600">
            {fraccionable
              ? 'Precio si vendes la panela completa (opcional)'
              : 'Precio si vendes el paquete completo (opcional)'}
            <input
              className={campo}
              inputMode="decimal"
              value={precioPaquete}
              onChange={(e) => setPrecioPaquete(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 items-end gap-3">
            <label className="flex flex-col gap-1 font-bold text-gray-600">
              Cantidad hoy
              <input
                className={campo}
                inputMode="decimal"
                value={stockContado}
                onChange={(e) => setStockContado(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 font-bold text-gray-600">
              Avisar si baja de
              <input
                className={campo}
                inputMode="decimal"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
              />
            </label>
          </div>

          <p className="-mt-2 text-sm text-gray-500">
            {fraccionable
              ? 'La cantidad se cuenta en kilos, no en panelas.'
              : 'La cantidad se cuenta en unidades, no en paquetes.'}
          </p>

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
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductoForm
