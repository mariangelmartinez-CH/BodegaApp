import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTiempoReal() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const canal = supabase
      .channel('cambios-bodega')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: ['inventario'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_movements' }, () => {
        queryClient.invalidateQueries({ queryKey: ['inventario'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        queryClient.invalidateQueries({ queryKey: ['categorias'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [queryClient])
}
