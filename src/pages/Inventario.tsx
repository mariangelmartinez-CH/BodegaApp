import { useState } from 'react'
import { useAuth } from '../auth/context'
import Icono from '../components/Icono'
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
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-borde bg-superficie px-4 py-3.5 text-left transition-colors active:bg-superficie-2"
      >
        <p className="font-medium text-texto">
          {emoji && <span className="mr-2">{emoji}</span>}
          {p.nombre}
        </p>
        <div className="shrink-0 text-right">
          <p className={`text-xl font-semibold ${bajo ? 'text-red-400' : 'text-verde'}`}>
            {formatoCantidad(p.stock)}
          </p>
          <p className="text-xs text-suave">{p.fraccionable ? 'kg' : 'unidades'}</p>
        </div>
      </button>
    </li>
  )
}

function Resumen({ etiqueta, valor, alerta }: { etiqueta: string; valor: number; alerta?: boolean }) {
  return (
    <div className="flex-1 rounded-xl border border-borde bg-superficie px-4 py-3">
      <p className="text-xs text-suave">{etiqueta}</p>
      <p className={`text-2xl font-semibold ${alerta ? 'text-red-400' : 'text-texto'}`}>{valor}</p>
    </div>
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
    return <p className="py-10 text-center text-suave">Cargando...</p>
  }

  if (categorias.error || inventario.error) {
    return (
      <p className="py-10 text-center font-medium text-red-400">
        No se pudo cargar el inventario. Revisa la conexión.
      </p>
    )
  }

  const productos = inventario.data ?? []
  const lista = categorias.data ?? []
  const categoriaActual = lista.find((c) => c.id === categoriaId) ?? null
  const faltan = productos.filter((p) => p.stock <= p.stock_minimo)

  const volver = (
    <button
      onClick={() => {
        setSoloFalta(false)
        setCategoriaId(null)
      }}
      className="mb-4 flex items-center gap-1 text-sm font-medium text-azul"
    >
      <Icono nombre="flecha" className="h-4 w-4 rotate-180" />
      Categorías
    </button>
  )

  if (soloFalta) {
    return (
      <>
        {volver}
        <h1 className="text-xl font-semibold tracking-tight text-texto">Lo que falta</h1>
        <p className="mb-4 mt-1 text-sm text-suave">
          Productos sin stock o por debajo del mínimo ({faltan.length}).
        </p>
        <ul className="flex flex-col gap-2">
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
        <PageTitle title="Inventario" subtitle="Qué hay y qué no hay en la bodega" />

        <div className="mb-3 flex gap-3">
          <Resumen etiqueta="Productos" valor={productos.length} />
          <Resumen etiqueta="Sin stock" valor={faltan.length} alerta={faltan.length > 0} />
        </div>

        <button
          onClick={() => setSoloFalta(true)}
          className="mb-6 flex w-full items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left font-medium text-red-300 active:bg-red-500/20"
        >
          <span>Ver lo que falta</span>
          <Icono nombre="flecha" className="h-5 w-5" />
        </button>

        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-suave">
          Categorías
        </h2>
        <ul className="flex flex-col gap-2">
          {lista.map((c) => {
            const deCategoria = productos.filter((p) => p.categoria_id === c.id)
            const bajos = deCategoria.filter((p) => p.stock <= p.stock_minimo).length
            return (
              <li key={c.id}>
                <button
                  onClick={() => setCategoriaId(c.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-borde bg-superficie p-3 text-left transition-colors active:bg-superficie-2"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-2xl ${claseCategoria(c.color)}`}
                  >
                    {c.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-texto">{c.nombre}</span>
                    <span className="block text-sm text-suave">
                      {deCategoria.length} productos
                    </span>
                  </span>
                  {bajos > 0 && (
                    <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-300">
                      {bajos} sin stock
                    </span>
                  )}
                  <Icono nombre="flecha" className="h-5 w-5 shrink-0 text-suave" />
                </button>
              </li>
            )
          })}
        </ul>
      </>
    )
  }

  const deCategoria = productos.filter((p) => p.categoria_id === categoriaActual.id)

  return (
    <>
      {volver}

      <div className="mb-5 flex items-center gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-lg border text-2xl ${claseCategoria(categoriaActual.color)}`}
        >
          {categoriaActual.emoji}
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-texto">
            {categoriaActual.nombre}
          </h1>
          <p className="text-sm text-suave">{deCategoria.length} productos</p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {deCategoria.map((p) => (
          <FilaProducto key={p.id} p={p} puedeEditar={puedeEditar} onEditar={setEditando} />
        ))}
      </ul>

      {puedeEditar && (
        <button
          onClick={() => setEditando('nuevo')}
          className="mt-4 w-full rounded-xl bg-verde px-6 py-3.5 text-base font-semibold text-fondo active:scale-[0.98]"
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
