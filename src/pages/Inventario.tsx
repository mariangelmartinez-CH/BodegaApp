import { useState } from 'react'
import { useAuth } from '../auth/context'
import PageTitle from '../components/PageTitle'
import ProductoForm from '../components/ProductoForm'
import { useCategorias, useInventario } from '../data/consultas'
import { claseCategoria } from '../lib/colores'
import { formatoCantidad } from '../lib/formato'
import type { ProductoInventario } from '../types'

function FilaProducto({
  p,
  emoji,
  puedeEditar,
  onEditar,
}: {
  p: ProductoInventario
  emoji?: string
  puedeEditar: boolean
  onEditar: (p: ProductoInventario) => void
}) {
  const bajo = p.stock <= p.stock_minimo

  return (
    <li>
      <button
        disabled={!puedeEditar}
        onClick={() => onEditar(p)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 text-left active:translate-y-0.5"
      >
        <p className="text-lg font-extrabold text-gray-800">
          {emoji && <span className="mr-2">{emoji}</span>}
          {p.nombre}
        </p>
        <div className="text-right">
          <p className={`text-2xl font-extrabold ${bajo ? 'text-red-600' : 'text-green-700'}`}>
            {formatoCantidad(p.stock)}
          </p>
          <p className="text-xs font-bold text-gray-500">{p.fraccionable ? 'kg' : 'unidades'}</p>
        </div>
      </button>
    </li>
  )
}

function Inventario() {
  const { perfil } = useAuth()
  const puedeEditar = perfil?.rol === 'admin' || perfil?.rol === 'operador'
  const categorias = useCategorias()
  const inventario = useInventario()
  const [categoriaId, setCategoriaId] = useState<string | null>(null)
  const [soloFalta, setSoloFalta] = useState(false)
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
  const faltan = productos.filter((p) => p.stock <= p.stock_minimo)

  if (soloFalta) {
    return (
      <>
        <button onClick={() => setSoloFalta(false)} className="mb-2 text-lg font-bold text-green-700">
          ← Categorías
        </button>
        <h1 className="mb-1 text-2xl font-extrabold text-gray-800">Lo que falta</h1>
        <p className="mb-4 text-sm text-gray-500">
          Productos sin stock o por debajo del mínimo ({faltan.length}).
        </p>
        <ul className="flex flex-col gap-3">
          {faltan.map((p) => (
            <FilaProducto
              key={p.id}
              p={p}
              emoji={lista.find((c) => c.id === p.categoria_id)?.emoji}
              puedeEditar={puedeEditar}
              onEditar={setEditando}
            />
          ))}
        </ul>
        {editando && editando !== 'nuevo' && (
          <ProductoForm
            key={editando.id}
            producto={editando}
            categoriaId={editando.categoria_id}
            onCerrar={() => setEditando(null)}
          />
        )}
      </>
    )
  }

  if (!categoriaActual) {
    return (
      <>
        <PageTitle icon="📦" title="Inventario" subtitle="Qué hay y qué no hay" />
        <button
          onClick={() => setSoloFalta(true)}
          className="mb-4 flex w-full items-center justify-between rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 font-extrabold text-red-700 active:bg-red-100"
        >
          <span>Ver lo que falta</span>
          <span className="rounded-full bg-red-500 px-3 py-1 text-sm text-white">{faltan.length}</span>
        </button>
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
                <span className="text-xs font-bold opacity-70">{deCategoria.length} productos</span>
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
      <button onClick={() => setCategoriaId(null)} className="mb-2 text-lg font-bold text-green-700">
        ← Categorías
      </button>

      <div
        className={`mb-4 flex items-center gap-3 rounded-3xl border-2 p-4 ${claseCategoria(categoriaActual.color)}`}
      >
        <span className="text-4xl">{categoriaActual.emoji}</span>
        <h1 className="text-2xl font-extrabold">{categoriaActual.nombre}</h1>
      </div>

      <ul className="flex flex-col gap-3">
        {deCategoria.map((p) => (
          <FilaProducto key={p.id} p={p} puedeEditar={puedeEditar} onEditar={setEditando} />
        ))}
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
