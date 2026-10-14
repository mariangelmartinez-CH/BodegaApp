import { useState } from 'react'
import { useAuth } from '../auth/context'
import PageTitle from '../components/PageTitle'
import ProductoForm from '../components/ProductoForm'
import { useCategorias, useInventario } from '../data/consultas'
import { claseCategoria } from '../lib/colores'
import { formatoCantidad, formatoPesos } from '../lib/formato'
import type { ProductoInventario } from '../types'

function Inventario() {
  const { perfil } = useAuth()
  const puedeEditar = perfil?.rol === 'admin' || perfil?.rol === 'operador'
  const categorias = useCategorias()
  const inventario = useInventario()
  const [categoriaId, setCategoriaId] = useState<string | null>(null)
  const [editando, setEditando] = useState<ProductoInventario | 'nuevo' | null>(null)

  if (categorias.isLoading || inventario.isLoading) {
    return <p className="py-10 text-center font-bold text-gray-500">Cargando...</p>
  }

  if (categorias.error || inventario.error) {
    return (
      <p className="py-10 text-center font-bold text-red-600">
        No se pudo cargar el inventario. Revisa la conexión.
      </p>
    )
  }

  const productos = inventario.data ?? []
  const lista = categorias.data ?? []
  const categoriaActual = lista.find((c) => c.id === categoriaId) ?? null

  if (!categoriaActual) {
    return (
      <>
        <PageTitle icon="📦" title="Inventario" subtitle="Qué hay y qué no hay" />
        <div className="grid grid-cols-2 gap-3">
          {lista.map((c) => {
            const deCategoria = productos.filter((p) => p.categoria_id === c.id)
            const bajos = deCategoria.filter((p) => p.stock <= p.stock_minimo).length
            return (
              <button
                key={c.id}
                onClick={() => setCategoriaId(c.id)}
                className={`flex flex-col items-center gap-1 rounded-3xl border-2 border-b-4 p-4 active:translate-y-0.5 ${claseCategoria(c.color)}`}
              >
                <span className="text-5xl">{c.emoji}</span>
                <span className="text-center font-extrabold leading-tight">{c.nombre}</span>
                <span className="text-xs font-bold opacity-70">
                  {deCategoria.length} productos
                </span>
                {bajos > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {bajos} sin stock
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </>
    )
  }

  const deCategoria = productos.filter((p) => p.categoria_id === categoriaActual.id)

  return (
    <>
      <button
        onClick={() => setCategoriaId(null)}
        className="mb-2 text-lg font-bold text-green-700"
      >
        ← Categorías
      </button>

      <div className={`mb-4 flex items-center gap-3 rounded-3xl border-2 p-4 ${claseCategoria(categoriaActual.color)}`}>
        <span className="text-4xl">{categoriaActual.emoji}</span>
        <h1 className="text-2xl font-extrabold">{categoriaActual.nombre}</h1>
      </div>

      <ul className="flex flex-col gap-3">
        {deCategoria.map((p) => {
          const bajo = p.stock <= p.stock_minimo
          return (
            <li key={p.id}>
              <button
                disabled={!puedeEditar}
                onClick={() => setEditando(p)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 text-left active:translate-y-0.5"
              >
                <div>
                  <p className="text-lg font-extrabold text-gray-800">{p.nombre}</p>
                  <p className="text-sm font-bold text-gray-500">{formatoPesos(p.precio_venta)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-extrabold ${bajo ? 'text-red-600' : 'text-green-700'}`}>
                    {formatoCantidad(p.stock)}
                  </p>
                  <p className="text-xs font-bold text-gray-500">
                    {p.fraccionable ? 'kg' : 'unidades'}
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {puedeEditar && (
        <button
          onClick={() => setEditando('nuevo')}
          className="mt-4 w-full rounded-2xl bg-green-500 px-6 py-4 text-xl font-bold text-white shadow-[0_4px_0_0_#15803d] active:translate-y-1 active:shadow-none"
        >
          + Agregar producto
        </button>
      )}

      {editando && (
        <ProductoForm
          key={editando === 'nuevo' ? 'nuevo' : editando.id}
          producto={editando === 'nuevo' ? null : editando}
          categoriaId={categoriaActual.id}
          onCerrar={() => setEditando(null)}
        />
      )}
    </>
  )
}

export default Inventario
