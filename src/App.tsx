import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Caja from './pages/Caja'
import Facturas from './pages/Facturas'
import Fiados from './pages/Fiados'
import Inventario from './pages/Inventario'
import Vender from './pages/Vender'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Vender />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="caja" element={<Caja />} />
          <Route path="fiados" element={<Fiados />} />
          <Route path="facturas" element={<Facturas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
