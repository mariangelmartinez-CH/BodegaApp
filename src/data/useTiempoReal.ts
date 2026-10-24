import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

const cambios: { tabla: string; claves: string[] }[] = [
  { tabla: 'products', claves: ['inventario'] },
  { tabla: 'stock_movements', claves: ['inventario'] },
  { tabla: 'categories', claves: ['categorias'] },
  { tabla: 'weekly_closings', claves: ['cierres', 'cierre-abierto', 'cierres-cerrados'] },
  { tabla: 'customers', claves: ['clientes', 'fiados'] },
  { tabla: 'debts', claves: ['fiados'] },
  { tabla: 'debt_payments', claves: ['fiados'] },
  { tabla: 'suppliers', claves: ['distribuidoras', 'pedidos'] },
  { tabla: 'supplier_orders', claves: ['pedidos'] },
  { tabla: 'order_items', claves: ['pedidos'] },
]

export function useTiempoReal() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let canal = supabase.channel('cambios-bodega')

    for (const { tabla, claves } of cambios) {
      canal = canal.on('postgres_changes', { event: '*', schema: 'public', table: tabla }, () => {
        for (const clave of claves) {
          queryClient.invalidateQueries({ queryKey: [clave] })
        }
      })
    }

    canal.subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [queryClient])
}
