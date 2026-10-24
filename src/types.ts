export type Rol = 'admin' | 'operador' | 'observador' | 'gestor_pedidos'

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

export type Cierre = {
  id: string
  estado: 'borrador' | 'cerrado'
  es_inicial: boolean
  creado_en: string
}

export type Conteo = {
  producto_id: string
  stock_sistema: number
  stock_contado: number
}

export type CierreCerrado = {
  id: string
  es_inicial: boolean
  efectivo_contado: number | null
  cerrado_en: string
}

export type Cliente = {
  id: string
  nombre: string
}

export type Fiado = {
  id: string
  cliente_id: string
  cliente: string
  monto: number
  fecha: string
  nota: string | null
  pagado: number
  saldo: number
}

export type Distribuidora = {
  id: string
  nombre: string
}

export type ItemPedido = {
  id: string
  producto_id: string
  paquetes: number
}

export type Pedido = {
  id: string
  proveedor_id: string
  fecha_pedido: string
  fecha_limite: string | null
  monto_bs: number
  detalle: string | null
  pagado: boolean
  pagado_en: string | null
  recibido: boolean
  recibido_en: string | null
  suppliers: { nombre: string } | null
  order_items: ItemPedido[]
}

export type EfectivoManual = {
  id: string
  monto: number
  nota: string | null
  creado_en: string
}
