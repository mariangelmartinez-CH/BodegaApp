export const coloresCategoria: Record<string, string> = {
  orange: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  pink: 'border-pink-500/30 bg-pink-500/10 text-pink-300',
  sky: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  red: 'border-red-500/30 bg-red-500/10 text-red-300',
  blue: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  lime: 'border-lime-500/30 bg-lime-500/10 text-lime-300',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  green: 'border-green-500/30 bg-green-500/10 text-green-300',
  purple: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  teal: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
  indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  slate: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
}

export function claseCategoria(color: string) {
  return coloresCategoria[color] ?? coloresCategoria.green
}
