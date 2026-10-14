export type Rol = 'admin' | 'operador' | 'observador'

export type Perfil = {
  id: string
  nombre: string
  rol: Rol
  activo: boolean
}

export type Categoria = {
  id: string
  nombre: string
  emoji: string
  color: string
  orden: number
}

export type ProductoInventario = {
  id: string
  categoria_id: string
  nombre: string
  foto_url: string | null
  unidad_venta: string
  fraccionable: boolean
  unidades_por_paquete: number
  costo_paquete: number | null
  precio_venta: number | null
  precio_paquete: number | null
  stock_minimo: number
  activo: boolean
  stock: number
}
