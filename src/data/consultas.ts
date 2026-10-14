import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Categoria, ProductoInventario } from '../types'

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, nombre, emoji, color, orden')
        .eq('activo', true)
        .order('orden')
      if (error) throw error
      return data as Categoria[]
    },
  })
}

export function useInventario() {
  return useQuery({
    queryKey: ['inventario'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventario')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      return data as ProductoInventario[]
    },
  })
}
