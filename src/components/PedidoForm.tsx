import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useCategorias, useInventario } from '../data/consultas'
import { useDistribuidoras } from '../data/pedidos'
import { aTexto, formatoCantidad, leerDinero, leerNumero } from '../lib/formato'
import { supabase } from '../lib/supabase'
import type { Pedido } from '../types'

type Props = {
  pedido: Pedido | null
  onCerrar: () => void
}

type Linea = { producto_id: string; paquetes: number }

const campo =
  'w-full rounded-2xl border border-borde bg-superficie px-4 py-3 text-lg outline-none focus:border-verde'

function PedidoForm({ pedido, onCerrar }: Props) {
  const cliente = useQueryClient()
  const distribuidoras = useDistribuidoras()
  const inventario = useInventario()
  const categorias = useCategorias()

  const [proveedorId, setProveedorId] = useState(pedido?.proveedor_id ?? '')
  const [nuevaDistribuidora, setNuevaDistribuidora] = useState('')
  const [monto, setMonto] = useState(aTexto(pedido?.monto_bs ?? null))
  const [fechaLimite, setFechaLimite] = useState(pedido?.fecha_limite ?? '')
  const [detalle, setDetalle] = useState(pedido?.detalle ?? '')
  const [lineas, setLineas] = useState<Linea[]>(
    pedido?.order_items.map((i) => ({ producto_id: i.producto_id, paquetes: i.paquetes })) ?? [],
  )
  const [productoSel, setProductoSel] = useState('')
  const [paquetesSel, setPaquetesSel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const productos = inventario.data ?? []
  const porId = new Map(productos.map((p) => [p.id, p]))

  function agregarLinea() {
    const paquetes = leerNumero(paquetesSel)
    if (!productoSel || paquetes === null || paquetes <= 0) {
      setError('Elige un producto y cuántos paquetes pidió')
      return
    }
    setError(null)
    setLineas((actuales) => {
      const existente = actuales.find((l) => l.producto_id === productoSel)
      if (existente) {
        return actuales.map((l) =>
          l.producto_id === productoSel ? { ...l, paquetes: l.paquetes + paquetes } : l,
        )
      }
      return [...actuales, { producto_id: productoSel, paquetes }]
    })
    setProductoSel('')
    setPaquetesSel('')
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const montoBs = leerDinero(monto)
    if (montoBs === null || montoBs < 0) {
      setError('Escribe el monto del pedido en bolívares')
      return
    }
    if (proveedorId === '') {
      setError('Elige la distribuidora')
      return
    }
    if (proveedorId === 'nueva' && nuevaDistribuidora.trim() === '') {
      setError('Escribe el nombre de la distribuidora')
      return
    }

    setGuardando(true)

    let idProveedor = proveedorId
    if (proveedorId === 'nueva') {
      const { data, error: fallo } = await supabase
        .from('suppliers')
        .insert({ nombre: nuevaDistribuidora.trim() })
        .select('id')
        .single()
      if (fallo || !data) {
        setError(fallo?.message ?? 'No se pudo crear la distribuidora')
        setGuardando(false)
        return
      }
      idProveedor = data.id
    }

    const datos = {
      proveedor_id: idProveedor,
      monto_bs: montoBs,
      fecha_limite: fechaLimite === '' ? null : fechaLimite,
      detalle: detalle.trim() === '' ? null : detalle.trim(),
    }

    let idPedido = pedido?.id

    if (pedido) {
      const { error: fallo } = await supabase.from('supplier_orders').update(datos).eq('id', pedido.id)
      if (fallo) {
        setError(fallo.message)
        setGuardando(false)
        return
      }
      const { error: borrado } = await supabase.from('order_items').delete().eq('pedido_id', pedido.id)
      if (borrado) {
        setError(borrado.message)
        setGuardando(false)
        return
      }
    } else {
      const { data, error: fallo } = await supabase
        .from('supplier_orders')
        .insert(datos)
        .select('id')
        .single()
      if (fallo || !data) {
        setError(fallo?.message ?? 'No se pudo crear el pedido')
        setGuardando(false)
        return
      }
      idPedido = data.id
    }

    if (idPedido && lineas.length > 0) {
      const { error: fallo } = await supabase
        .from('order_items')
        .insert(lineas.map((l) => ({ pedido_id: idPedido, ...l })))
      if (fallo) {
        setError(fallo.message)
        setGuardando(false)
        return
      }
    }

    await Promise.all([
      cliente.invalidateQueries({ queryKey: ['pedidos'] }),
      cliente.invalidateQueries({ queryKey: ['distribuidoras'] }),
    ])
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
            {pedido ? 'Editar pedido' : 'Nuevo pedido'}
          </h2>
          <button type="button" onClick={onCerrar} className="text-2xl text-suave">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 font-bold text-suave">
            Distribuidora
            <select
              className={campo}
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
            >
              <option value="">Elige una</option>
              {(distribuidoras.data ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
              <option value="nueva">+ Nueva distribuidora</option>
            </select>
          </label>

          {proveedorId === 'nueva' && (
            <input
              className={campo}
              placeholder="Nombre de la distribuidora"
              value={nuevaDistribuidora}
              onChange={(e) => setNuevaDistribuidora(e.target.value)}
            />
          )}

          <div className="grid grid-cols-2 items-end gap-3">
            <label className="flex flex-col gap-1 font-bold text-suave">
              Monto en Bs
              <input
                className={campo}
                inputMode="decimal"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 font-bold text-suave">
              Fecha límite
              <input
                type="date"
                className={campo}
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 font-bold text-suave">
            Nota (opcional)
            <textarea
              rows={2}
              className={campo}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
            />
          </label>

          <div className="rounded-2xl border border-borde bg-superficie p-3">
            <p className="font-bold text-suave">Productos del pedido (opcional)</p>
            <p className="mb-2 text-sm text-suave">
              Si los pones, el inventario sube solo cuando se marque que el pedido llegó.
            </p>

            <ul className="mb-3 flex flex-col gap-2">
              {lineas.map((l) => {
                const p = porId.get(l.producto_id)
                return (
                  <li
                    key={l.producto_id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-superficie-2 px-3 py-2"
                  >
                    <div>
                      <p className="font-bold text-texto">{p?.nombre ?? 'Producto'}</p>
                      <p className="text-xs text-suave">
                        {formatoCantidad(l.paquetes)} paquetes
                        {p && ` = ${formatoCantidad(l.paquetes * p.unidades_por_paquete)} unidades`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLineas(lineas.filter((x) => x.producto_id !== l.producto_id))}
                      className="text-xl text-suave"
                    >
                      ✕
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="flex flex-col gap-2">
              <select
                className={campo}
                value={productoSel}
                onChange={(e) => setProductoSel(e.target.value)}
              >
                <option value="">Elige un producto</option>
                {(categorias.data ?? []).map((c) => (
                  <optgroup key={c.id} label={`${c.emoji} ${c.nombre}`}>
                    {productos
                      .filter((p) => p.categoria_id === c.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  className={campo}
                  inputMode="decimal"
                  placeholder="Paquetes"
                  value={paquetesSel}
                  onChange={(e) => setPaquetesSel(e.target.value)}
                />
                <button
                  type="button"
                  onClick={agregarLinea}
                  className="rounded-2xl border border-verde px-4 font-bold text-verde active:bg-superficie-2"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

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
            {guardando ? 'Guardando...' : 'Guardar pedido'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PedidoForm
