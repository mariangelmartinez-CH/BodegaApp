import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { formatoCantidad, leerDinero } from '../lib/formato'
import { supabase } from '../lib/supabase'
import type { Categoria, Cierre, Conteo, ProductoInventario } from '../types'
import TarjetaConteo from './TarjetaConteo'

type Props = {
  cierre: Cierre
  productos: ProductoInventario[]
  categorias: Categoria[]
  conteos: Conteo[]
  esPrimero: boolean
}

function ConteoSesion({ cierre, productos, categorias, conteos, esPrimero }: Props) {
  const cliente = useQueryClient()
  const contados = new Map(conteos.map((c) => [c.producto_id, c]))

  const [indice, setIndice] = useState(() => {
    const primero = productos.findIndex((p) => !contados.has(p.id))
    return primero === -1 ? 0 : primero
  })
  const [resumen, setResumen] = useState(() => productos.every((p) => contados.has(p.id)))
  const [guardando, setGuardando] = useState(false)
  const [efectivo, setEfectivo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cerrado, setCerrado] = useState(false)

  const producto = productos[indice]
  const categoria = categorias.find((c) => c.id === producto?.categoria_id)

  function avanzar() {
    if (indice + 1 >= productos.length) {
      setResumen(true)
    } else {
      setIndice(indice + 1)
    }
  }

  async function guardar(valor: number) {
    setError(null)
    setGuardando(true)
    const { error: fallo } = await supabase.from('closing_counts').upsert(
      {
        cierre_id: cierre.id,
        producto_id: producto.id,
        stock_sistema: producto.stock,
        stock_contado: valor,
      },
      { onConflict: 'cierre_id,producto_id' },
    )
    if (fallo) {
      setError(fallo.message)
      setGuardando(false)
      return
    }
    await cliente.invalidateQueries({ queryKey: ['conteos', cierre.id] })
    setGuardando(false)
    avanzar()
  }

  function irACategoria(id: string) {
    const destino = productos.findIndex((p) => p.categoria_id === id)
    if (destino !== -1) {
      setResumen(false)
      setIndice(destino)
    }
  }

  async function cerrarSemana() {
    const dinero = leerDinero(efectivo)
    if (dinero === null || dinero < 0) {
      setError('Escribe el efectivo en pesos que contaste')
      return
    }
    setError(null)
    setGuardando(true)
    const { error: fallo } = await supabase.rpc('cerrar_semana', {
      p_cierre: cierre.id,
      p_efectivo: dinero,
    })
    if (fallo) {
      setError(fallo.message)
      setGuardando(false)
      return
    }
    await Promise.all([
      cliente.invalidateQueries({ queryKey: ['cierre-abierto'] }),
      cliente.invalidateQueries({ queryKey: ['cierres-cerrados'] }),
      cliente.invalidateQueries({ queryKey: ['cierres'] }),
      cliente.invalidateQueries({ queryKey: ['inventario'] }),
    ])
    setGuardando(false)
    setCerrado(true)
  }

  if (cerrado) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="text-7xl">✅</div>
        <h2 className="text-2xl font-extrabold text-gray-800">Semana cerrada</h2>
        <p className="text-gray-500">El inventario quedó actualizado con tu conteo.</p>
      </div>
    )
  }

  if (resumen) {
    const sinContar = productos.filter((p) => !contados.has(p.id))
    const vendidas = productos.flatMap((p) => {
      const c = contados.get(p.id)
      if (!c) return []
      const unidades = Math.max(p.stock - c.stock_contado, 0)
      return unidades > 0 ? [{ producto: p, unidades }] : []
    })
    const totalUnidades = vendidas.reduce((suma, v) => suma + v.unidades, 0)
    const masVendidos = [...vendidas].sort((a, b) => b.unidades - a.unidades).slice(0, 5)

    return (
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <div className="text-6xl">🧮</div>
          <h2 className="mt-2 text-2xl font-extrabold text-gray-800">Resumen del conteo</h2>
        </div>

        <div className="rounded-2xl bg-white p-4">
          <p className="font-bold text-gray-600">
            Contaste {contados.size} de {productos.length} productos
          </p>
          {sinContar.length > 0 && (
            <p className="mt-1 text-sm font-bold text-orange-600">
              Faltan {sinContar.length} por contar. Los que no cuentes no cambian.
            </p>
          )}
        </div>

        {esPrimero ? (
          <p className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-bold text-green-800">
            Es el primer conteo: se carga como inventario inicial y no cuenta como ventas.
          </p>
        ) : (
          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm font-bold text-gray-500">Se vendieron esta semana</p>
            <p className="text-3xl font-extrabold text-green-700">
              {formatoCantidad(totalUnidades)} unidades
            </p>
            <p className="text-sm text-gray-500">{vendidas.length} productos con ventas</p>
            {masVendidos.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3">
                {masVendidos.map((v) => (
                  <li key={v.producto.id} className="flex justify-between text-sm font-bold text-gray-600">
                    <span>{v.producto.nombre}</span>
                    <span>{formatoCantidad(v.unidades)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <label className="flex flex-col gap-1 text-center font-bold text-gray-600">
          Efectivo en pesos que hay hoy en caja
          <input
            inputMode="decimal"
            value={efectivo}
            onChange={(e) => setEfectivo(e.target.value)}
            className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-4 text-center text-3xl font-extrabold outline-none focus:border-green-500"
          />
        </label>

        {error && (
          <p className="rounded-2xl bg-red-100 px-4 py-3 text-center font-bold text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={cerrarSemana}
          disabled={guardando}
          className="w-full rounded-2xl bg-green-500 px-6 py-4 text-xl font-bold text-white shadow-[0_4px_0_0_#15803d] active:translate-y-1 active:shadow-none disabled:opacity-60"
        >
          {guardando ? 'Cerrando...' : 'Cerrar la semana'}
        </button>

        <button
          onClick={() => setResumen(false)}
          className="text-center text-lg font-bold text-gray-500"
        >
          Seguir contando
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1 flex justify-between text-sm font-bold text-gray-500">
          <span>
            {indice + 1} de {productos.length}
          </span>
          <span>{contados.size} contados</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${(contados.size / productos.length) * 100}%` }}
          />
        </div>
      </div>

      <select
        value={producto.categoria_id}
        onChange={(e) => irACategoria(e.target.value)}
        className="rounded-2xl border-2 border-gray-200 bg-white px-3 py-2 font-bold text-gray-600"
      >
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.emoji} {c.nombre}
          </option>
        ))}
      </select>

      {error && (
        <p className="rounded-2xl bg-red-100 px-4 py-3 text-center font-bold text-red-700">
          {error}
        </p>
      )}

      <TarjetaConteo
        key={producto.id}
        producto={producto}
        categoria={categoria}
        contadoActual={contados.get(producto.id)?.stock_contado ?? null}
        guardando={guardando}
        onGuardar={guardar}
        onAnterior={() => setIndice(Math.max(indice - 1, 0))}
        onSaltar={avanzar}
      />

      <button
        onClick={() => setResumen(true)}
        className="text-center text-lg font-bold text-green-700"
      >
        Terminar y ver el resumen
      </button>
    </div>
  )
}

export default ConteoSesion
