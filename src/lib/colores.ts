export const coloresCategoria: Record<string, string> = {
  orange: 'border-orange-300 bg-orange-100 text-orange-800',
  yellow: 'border-yellow-300 bg-yellow-100 text-yellow-800',
  amber: 'border-amber-300 bg-amber-100 text-amber-800',
  pink: 'border-pink-300 bg-pink-100 text-pink-800',
  sky: 'border-sky-300 bg-sky-100 text-sky-800',
  red: 'border-red-300 bg-red-100 text-red-800',
  blue: 'border-blue-300 bg-blue-100 text-blue-800',
  lime: 'border-lime-300 bg-lime-100 text-lime-800',
  cyan: 'border-cyan-300 bg-cyan-100 text-cyan-800',
  green: 'border-green-300 bg-green-100 text-green-800',
  purple: 'border-purple-300 bg-purple-100 text-purple-800',
  teal: 'border-teal-300 bg-teal-100 text-teal-800',
  indigo: 'border-indigo-300 bg-indigo-100 text-indigo-800',
  slate: 'border-slate-300 bg-slate-100 text-slate-800',
}

export function claseCategoria(color: string) {
  return coloresCategoria[color] ?? coloresCategoria.green
}
