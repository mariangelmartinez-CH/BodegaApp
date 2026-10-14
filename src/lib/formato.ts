const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const cantidad = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 })

export function formatoPesos(valor: number | null) {
  return valor === null ? 'Sin precio' : pesos.format(valor)
}

export function formatoCantidad(valor: number) {
  return cantidad.format(valor)
}

export function leerNumero(texto: string): number | null {
  const limpio = texto.trim().replace(',', '.')
  if (limpio === '') return null
  const valor = Number(limpio)
  return Number.isFinite(valor) ? valor : null
}

export function leerDinero(texto: string): number | null {
  const limpio = texto.trim().replace(/\./g, '').replace(',', '.')
  if (limpio === '') return null
  const valor = Number(limpio)
  return Number.isFinite(valor) ? valor : null
}

export function aTexto(valor: number | null) {
  return valor === null ? '' : String(valor).replace('.', ',')
}
