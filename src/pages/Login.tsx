import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/context'

const campo =
  'w-full rounded-xl border border-borde bg-superficie px-4 py-3.5 text-base outline-none focus:border-verde'

function Login() {
  const { iniciarSesion, aviso } = useAuth()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [mostrar, setMostrar] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const mensaje = await iniciarSesion(correo.trim(), clave)
    if (mensaje) setError(mensaje)
    setEnviando(false)
  }

  const mensaje = error ?? aviso

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6 py-10">
      <header className="flex flex-col items-center text-center">
        <img src="/icono.svg" alt="" className="h-16 w-16 rounded-2xl" />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-texto">Bodega</h1>
        <p className="mt-1 text-sm text-suave">Inventario, caja y fiados</p>
      </header>

      <form onSubmit={enviar} className="flex flex-col gap-3">
        <input
          type="email"
          autoComplete="username"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          className={campo}
        />
        <div className="relative">
          <input
            type={mostrar ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
            className={`${campo} pr-24`}
          />
          <button
            type="button"
            onClick={() => setMostrar(!mostrar)}
            className="absolute inset-y-0 right-4 text-sm font-medium text-azul"
          >
            {mostrar ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {mensaje && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-300">
            {mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-2 w-full rounded-xl bg-verde px-6 py-3.5 text-base font-semibold text-fondo active:scale-[0.98] disabled:opacity-60"
        >
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}

export default Login
