import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/context'
import Layout from './components/Layout'
import Caja from './pages/Caja'
import Facturas from './pages/Facturas'
import Fiados from './pages/Fiados'
import Inventario from './pages/Inventario'
import Login from './pages/Login'
import Vender from './pages/Vender'

function Rutas() {
  const { session, perfil, cargando } = useAuth()

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center text-xl font-bold text-gray-500">
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
        <Route index element={<Vender />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="caja" element={<Caja />} />
        <Route path="fiados" element={<Fiados />} />
        <Route path="facturas" element={<Facturas />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Rutas />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
