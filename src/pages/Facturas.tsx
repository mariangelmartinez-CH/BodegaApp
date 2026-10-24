import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../auth/context'
import PageTitle from '../components/PageTitle'
import PedidoForm from '../components/PedidoForm'
import { GrupoPedidos } from '../components/TarjetaPedido'
import { usePedidos } from '../data/pedidos'
import { supabase } from '../lib/supabase'
import type { Pedido } from '../types'

function Facturas() {
  const { perfil } = useAuth()
  const rol = perfil?.rol
  const puedeGestionar = rol === 'admin' || rol === 'gestor_pedidos'
  const puedeRecibir = rol === 'admin' || rol === 'operador'
  const cliente = useQueryClient()
  const pedidos = usePedidos()
  const [editando, setEditando] = useState<Pedido | 'nuevo' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function cambiarPagado(p: Pedido) {
    setError(null)
    const { error: fallo } = await supabase
      .from('supplier_orders')
      .update({ pagado: !p.pagado, pagado_en: p.pagado ? null : new Date().toISOString() })
      .eq('id', p.id)
    if (fallo) setError(fallo.message)
    await cliente.invalidateQueries({ queryKey: ['pedidos'] })
  }

  async function recibir(p: Pedido) {
    const aviso =
      p.order_items.length > 0
        ? '¿Llegó este pedido? Se va a sumar al inventario.'
        : '¿Llegó este pedido? No tiene productos anotados, así que el inventario no cambia.'
    if (!window.confirm(aviso)) return
    setError(null)
    const { error: fallo } = await supabase.rpc('recibir_pedido', { p_pedido: p.id })
    if (fallo) setError(fallo.message)
    await Promise.all([
      cliente.invalidateQueries({ queryKey: ['pedidos'] }),
      cliente.invalidateQueries({ queryKey: ['inventario'] }),
    ])
  }

  if (pedidos.isLoading) {
    return <p className="py-10 text-center font-bold text-suave">Cargando...</p>
  }

  if (pedidos.error) {
    return (
      <p className="py-10 text-center font-bold text-red-400">
        No se pudieron cargar los pedidos. ¿Ya corriste los archivos 0010 y 0011 en Supabase?
      </p>
    )
  }

  const lista = pedidos.data ?? []
  const acciones = {
    puedeGestionar,
    puedeRecibir,
    onPagado: cambiarPagado,
    onRecibir: recibir,
    onEditar: setEditando,
  }

  return (
    <>
      <PageTitle icon="🧾" title="Pedidos" subtitle="Lo que se pide y se paga a las distribuidoras" />

      {puedeGestionar && (
        <button
          onClick={() => setEditando('nuevo')}
          className="mb-6 w-full rounded-2xl bg-verde px-6 py-4 text-xl font-bold text-fondo active:scale-[0.98]"
        >
          + Nuevo pedido
        </button>
      )}

      {error && (
        <p className="mb-4 rounded-2xl bg-red-500/15 px-4 py-3 text-center font-bold text-red-300">
          {error}
        </p>
      )}

      {lista.length === 0 && (
        <p className="rounded-2xl bg-superficie p-4 text-center font-bold text-suave">
          Todavía no hay pedidos.
        </p>
      )}

      <GrupoPedidos titulo="Por pagar" items={lista.filter((p) => !p.pagado)} {...acciones} />
      <GrupoPedidos
        titulo="Pagados, por llegar"
        items={lista.filter((p) => p.pagado && !p.recibido)}
        {...acciones}
      />
      <GrupoPedidos
        titulo="Recibidos y pagados"
        items={lista.filter((p) => p.pagado && p.recibido).slice(0, 10)}
        {...acciones}
      />

      {editando && (
        <PedidoForm
          key={editando === 'nuevo' ? 'nuevo' : editando.id}
          pedido={editando === 'nuevo' ? null : editando}
          onCerrar={() => setEditando(null)}
        />
      )}
    </>
  )
}

export default Facturas
