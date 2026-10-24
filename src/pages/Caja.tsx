import PageTitle from '../components/PageTitle'
import { useCierres, useFiados } from '../data/fiados'
import { formatoPesos } from '../lib/formato'

function textoFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

function Caja() {
  const cierres = useCierres()
  const fiados = useFiados()

  if (cierres.isLoading || fiados.isLoading) {
    return <p className="py-10 text-center font-bold text-suave">Cargando...</p>
  }

  if (cierres.error || fiados.error) {
    return (
      <p className="py-10 text-center font-bold text-red-400">
        No se pudo cargar la caja. ¿Ya corriste el archivo 0010 en Supabase?
      </p>
    )
  }

  const lista = cierres.data ?? []
  const ultimo = lista[0]
  const anterior = lista[1]
  const diferencia =
    ultimo?.efectivo_contado != null && anterior?.efectivo_contado != null
      ? ultimo.efectivo_contado - anterior.efectivo_contado
      : null
  const teDeben = (fiados.data ?? []).reduce((suma, f) => suma + f.saldo, 0)

  return (
    <>
      <PageTitle icon="💰" title="Caja" subtitle="El efectivo, contado una vez a la semana" />

      <div className="mb-4 rounded-2xl border border-verde/30 bg-verde/15 p-5 text-center">
        <p className="text-sm font-bold text-verde">Efectivo en pesos</p>
        {ultimo?.efectivo_contado != null ? (
          <>
            <p className="text-4xl font-extrabold text-verde">
              {formatoPesos(ultimo.efectivo_contado)}
            </p>
            <p className="mt-1 text-sm font-bold text-verde">
              Contado el {textoFecha(ultimo.cerrado_en)}
            </p>
            {diferencia !== null && (
              <p className="mt-2 text-sm font-bold text-verde">
                {diferencia >= 0 ? '+' : '-'}
                {formatoPesos(Math.abs(diferencia))} que la semana anterior
              </p>
            )}
          </>
        ) : (
          <p className="mt-1 font-bold text-verde">Todavía no se ha contado la caja</p>
        )}
      </div>

      <div className="mb-6 rounded-2xl border border-borde bg-superficie p-4 text-center">
        <p className="text-sm font-bold text-suave">Te deben en fiados</p>
        <p className="text-3xl font-extrabold text-texto">{formatoPesos(teDeben)}</p>
      </div>

      {lista.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-extrabold text-texto">Semanas anteriores</h2>
          <ul className="flex flex-col gap-2">
            {lista.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-2xl bg-superficie px-4 py-3"
              >
                <span className="font-bold text-suave">
                  {textoFecha(c.cerrado_en)}
                  {c.es_inicial && <span className="ml-2 text-xs text-suave">inicial</span>}
                </span>
                <span className="font-extrabold text-texto">
                  {c.efectivo_contado != null ? formatoPesos(c.efectivo_contado) : '-'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

export default Caja
