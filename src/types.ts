export type Rol = 'admin' | 'operador' | 'observador'

export type Perfil = {
  id: string
  nombre: string
  rol: Rol
  activo: boolean
}
