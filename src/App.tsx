import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/context'
import Layout from './components/Layout'
import Caja from './pages/Caja'
import Conteo from './pages/Conteo'
import Facturas from './pages/Facturas'
import Fiados from './pages/Fiados'
import Inventario from './pages/Inventario'
import Login from './pages/Login'

const queryClient = new QueryClient()

function Rutas() {
  const { session, perfil, cargando } = useAuth()
  const cliente = useQueryClient()

  useEffect(() => {
    if (!session) cliente.clear()
  }, [session, cliente])

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center text-xl font-bold text-suave">
        Cargando...
      </main>
    )
  }

  if (!session || !perfil) {
    return <Login />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inventario />} />
        <Route path="conteo" element={<Conteo />} />
        <Route path="caja" element={<Caja />} />
        <Route path="fiados" element={<Fiados />} />
        <Route path="facturas" element={<Facturas />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Rutas />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
