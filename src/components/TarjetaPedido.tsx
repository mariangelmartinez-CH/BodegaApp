import { formatoCantidad } from '../lib/formato'
import type { Pedido } from '../types'

type Acciones = {
  puedeGestionar: boolean
  puedeRecibir: boolean
  onPagado: (p: Pedido) => void
  onRecibir: (p: Pedido) => void
  onEditar: (p: Pedido) => void
}

function diasPara(fecha: string) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const limite = new Date(`${fecha}T00:00:00`)
  return Math.round((limite.getTime() - hoy.getTime()) / 86400000)
}

function textoFecha(fecha: string) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  })
}

export function TarjetaPedido({ p, ...acciones }: { p: Pedido } & Acciones) {
  const dias = p.fecha_limite ? diasPara(p.fecha_limite) : null
  const urgente = !p.pagado && dias !== null && dias <= 2

  return (
    <li className="rounded-2xl border border-borde bg-superficie p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold text-texto">
            {p.suppliers?.nombre ?? 'Distribuidora'}
          </p>
          {p.fecha_limite && (
            <p className={`text-sm font-bold ${urgente ? 'text-red-400' : 'text-suave'}`}>
              {dias !== null && dias < 0 ? 'Venció' : 'Vence'} el {textoFecha(p.fecha_limite)}
            </p>
          )}
        </div>
        <p className="text-xl font-extrabold text-texto">Bs {formatoCantidad(p.monto_bs)}</p>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            p.pagado ? 'bg-verde/15 text-verde' : 'bg-red-500/15 text-red-300'
          }`}
        >
          {p.pagado ? 'Pagado' : 'No pagado'}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            p.recibido ? 'bg-verde/15 text-verde' : 'bg-orange-500/15 text-orange-300'
          }`}
        >
          {p.recibido ? 'Recibido' : 'Por llegar'}
        </span>
        {p.order_items.length > 0 && (
          <span className="rounded-full bg-superficie-2 px-3 py-1 text-xs font-bold text-suave">
            {p.order_items.length} productos
          </span>
        )}
      </div>

      {p.detalle && (
        <p className="mt-3 rounded-lg bg-superficie-2 px-3 py-2 text-sm text-texto">{p.detalle}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {acciones.puedeGestionar && (
          <button
            onClick={() => acciones.onPagado(p)}
            className={`rounded-2xl px-4 py-2 font-bold ${
              p.pagado
                ? 'border border-borde text-suave'
                : 'bg-verde text-fondo  active:scale-[0.98]'
            }`}
          >
            {p.pagado ? 'Quitar pagado' : 'Marcar pagado'}
          </button>
        )}
        {acciones.puedeRecibir && !p.recibido && (
          <button
            onClick={() => acciones.onRecibir(p)}
            className="rounded-2xl bg-azul px-4 py-2 font-bold text-fondo active:scale-[0.98]"
          >
            Llegó a la bodega
          </button>
        )}
        {acciones.puedeGestionar && !p.recibido && (
          <button
            onClick={() => acciones.onEditar(p)}
            className="rounded-2xl border border-borde px-4 py-2 font-bold text-suave"
          >
            Editar
          </button>
        )}
      </div>
    </li>
  )
}

export function GrupoPedidos({
  titulo,
  items,
  ...acciones
}: { titulo: string; items: Pedido[] } & Acciones) {
  if (items.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-lg font-extrabold text-texto">{titulo}</h2>
      <ul className="flex flex-col gap-3">
        {items.map((p) => (
          <TarjetaPedido key={p.id} p={p} {...acciones} />
        ))}
      </ul>
    </section>
  )
}
