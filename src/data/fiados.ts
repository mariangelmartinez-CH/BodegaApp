import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CierreCerrado, Cliente, EfectivoManual, Fiado } from '../types'

export function useFiados() {
  return useQuery({
    queryKey: ['fiados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiados_saldo')
        .select('id, cliente_id, cliente, monto, fecha, nota, pagado, saldo')
        .order('fecha', { ascending: true })
      if (error) throw error
      return data as Fiado[]
    },
  })
}

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      return data as Cliente[]
    },
  })
}

export function useCierres() {
  return useQuery({
    queryKey: ['cierres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_closings')
        .select('id, es_inicial, efectivo_contado, cerrado_en')
        .eq('estado', 'cerrado')
        .order('cerrado_en', { ascending: false })
        .limit(12)
      if (error) throw error
      return data as CierreCerrado[]
    },
  })
}

export function useEfectivoManual() {
  return useQuery({
    queryKey: ['efectivo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_counts')
        .select('id, monto, nota, creado_en')
        .order('creado_en', { ascending: false })
        .limit(30)
      if (error) throw error
      return data as EfectivoManual[]
    },
  })
}
