import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/context'

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <header className="text-center">
        <div className="text-7xl">🏪</div>
        <h1 className="mt-2 text-4xl font-extrabold text-green-600">Bodega</h1>
        <p className="mt-1 text-gray-500">Entra con tu usuario</p>
      </header>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <input
          type="email"
          autoComplete="username"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-lg outline-none focus:border-green-500"
        />
        <div className="relative">
          <input
            type={mostrar ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
            className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3 pl-4 pr-24 text-lg outline-none focus:border-green-500"
          />
          <button
            type="button"
            onClick={() => setMostrar(!mostrar)}
            className="absolute inset-y-0 right-4 text-sm font-bold text-gray-500"
          >
            {mostrar ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {mensaje && (
          <p className="rounded-2xl bg-red-100 px-4 py-3 text-center font-bold text-red-700">
            {mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-2xl bg-green-500 px-6 py-4 text-xl font-bold text-white shadow-[0_4px_0_0_#15803d] active:translate-y-1 active:shadow-none disabled:opacity-60"
        >
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}

export default Login
