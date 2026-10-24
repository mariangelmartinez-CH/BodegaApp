import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Distribuidora, Pedido } from '../types'

export function usePedidos() {
  return useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_orders')
        .select(
          'id, proveedor_id, fecha_pedido, fecha_limite, monto_bs, detalle, pagado, pagado_en, recibido, recibido_en, suppliers(nombre), order_items(id, producto_id, paquetes)',
        )
        .order('fecha_limite', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as unknown as Pedido[]
    },
  })
}

export function useDistribuidoras() {
  return useQuery({
    queryKey: ['distribuidoras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      return data as Distribuidora[]
    },
  })
}
