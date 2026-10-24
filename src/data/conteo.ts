import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Cierre, Conteo } from '../types'

export function useCierreAbierto() {
  return useQuery({
    queryKey: ['cierre-abierto'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_closings')
        .select('id, estado, es_inicial, creado_en')
        .eq('estado', 'borrador')
        .maybeSingle()
      if (error) throw error
      return data as Cierre | null
    },
  })
}

export function useCierresCerrados() {
  return useQuery({
    queryKey: ['cierres-cerrados'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('weekly_closings')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'cerrado')
      if (error) throw error
      return count ?? 0
    },
  })
}

export function useConteos(cierreId: string | null) {
  return useQuery({
    queryKey: ['conteos', cierreId],
    enabled: cierreId !== null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('closing_counts')
        .select('producto_id, stock_sistema, stock_contado')
        .eq('cierre_id', cierreId)
      if (error) throw error
      return data as Conteo[]
    },
  })
}
