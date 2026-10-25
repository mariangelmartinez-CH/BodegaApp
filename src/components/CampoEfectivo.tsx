import { formatoPesos, sumarEfectivo } from '../lib/formato'

type Props = {
  billetes: string
  monedas: string
  onBilletes: (valor: string) => void
  onMonedas: (valor: string) => void
}

const campo =
  'w-full rounded-xl border border-borde bg-superficie px-4 py-3.5 text-center text-2xl font-semibold text-texto outline-none focus:border-verde'

function CampoEfectivo({ billetes, monedas, onBilletes, onMonedas }: Props) {
  const suma = sumarEfectivo(billetes, monedas)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-center text-sm font-medium text-suave">
          Billetes
          <input
            inputMode="decimal"
            value={billetes}
            onChange={(e) => onBilletes(e.target.value)}
            className={campo}
          />
        </label>
        <label className="flex flex-col gap-1 text-center text-sm font-medium text-suave">
          Monedas
          <input
            inputMode="decimal"
            value={monedas}
            onChange={(e) => onMonedas(e.target.value)}
            className={campo}
          />
        </label>
      </div>
      <div className="rounded-xl border border-verde/30 bg-verde/10 px-4 py-3 text-center">
        <p className="text-xs text-suave">Total en efectivo</p>
        <p className="text-2xl font-semibold text-verde">{formatoPesos(suma ? suma.total : 0)}</p>
      </div>
    </div>
  )
}

export default CampoEfectivo
