import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
  onCerrar: () => void
}

const campo =
  'w-full rounded-2xl border border-borde bg-superficie px-4 py-3 text-lg outline-none focus:border-verde'

function ClaveForm({ onCerrar }: Props) {
  const [clave, setClave] = useState('')
  const [repetida, setRepetida] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (clave.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (clave !== repetida) {
      setError('Las dos contraseñas no coinciden')
      return
    }

    setGuardando(true)
    const { error: fallo } = await supabase.auth.updateUser({ password: clave })
    setGuardando(false)
    if (fallo) {
      setError(fallo.message)
      return
    }
    setListo(true)
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40">
      <form onSubmit={guardar} className="w-full max-w-md rounded-t-3xl bg-superficie-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-texto">Cambiar contraseña</h2>
          <button type="button" onClick={onCerrar} className="text-2xl text-suave">
            ✕
          </button>
        </div>

        {listo ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="text-6xl">✅</div>
            <p className="font-bold text-texto">Tu contraseña ya cambió.</p>
            <button
              type="button"
              onClick={onCerrar}
              className="w-full rounded-2xl bg-verde px-6 py-4 text-xl font-bold text-fondo active:scale-[0.98]"
            >
              Listo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Nueva contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className={campo}
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={repetida}
              onChange={(e) => setRepetida(e.target.value)}
              className={campo}
            />

            {error && (
              <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-center font-bold text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-2xl bg-verde px-6 py-4 text-xl font-bold text-fondo active:scale-[0.98] disabled:opacity-60"
            >
              {guardando ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default ClaveForm
