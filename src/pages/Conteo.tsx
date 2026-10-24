import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../auth/context'
import ConteoSesion from '../components/ConteoSesion'
import PageTitle from '../components/PageTitle'
import { useCierreAbierto, useCierresCerrados, useConteos } from '../data/conteo'
import { useCategorias, useInventario } from '../data/consultas'
import { supabase } from '../lib/supabase'

function Conteo() {
  const { perfil } = useAuth()
  const puedeContar = perfil?.rol === 'admin' || perfil?.rol === 'operador'
  const cliente = useQueryClient()
  const cierre = useCierreAbierto()
  const cerrados = useCierresCerrados()
  const categorias = useCategorias()
  const inventario = useInventario()
  const conteos = useConteos(cierre.data?.id ?? null)
  const [error, setError] = useState<string | null>(null)
  const [iniciando, setIniciando] = useState(false)

  async function empezar() {
    setError(null)
    setIniciando(true)
    const { error: fallo } = await supabase.from('weekly_closings').insert({})
    if (fallo) setError(fallo.message)
    await cliente.invalidateQueries({ queryKey: ['cierre-abierto'] })
    setIniciando(false)
  }

  if (!puedeContar) {
    return (
      <>
        <PageTitle icon="🧮" title="Conteo semanal" subtitle="Lo hace quien lleva la bodega" />
        <p className="rounded-2xl bg-white p-4 text-center font-bold text-gray-500">
          Tu usuario es de solo ver. Cuando se cierre una semana, el inventario se actualiza aquí.
        </p>
      </>
    )
  }

  const cargando =
    cierre.isLoading ||
    cerrados.isLoading ||
    categorias.isLoading ||
    inventario.isLoading ||
    (cierre.data ? conteos.isLoading : false)

  if (cargando) {
    return <p className="py-10 text-center font-bold text-gray-500">Cargando...</p>
  }

  if (cierre.error || cerrados.error || categorias.error || inventario.error) {
    return (
      <p className="py-10 text-center font-bold text-red-600">
        No se pudo cargar el conteo. ¿Ya corriste el archivo 0009 en Supabase?
      </p>
    )
  }

  const listaCategorias = categorias.data ?? []
  const orden = new Map(listaCategorias.map((c) => [c.id, c.orden]))
  const productos = [...(inventario.data ?? [])].sort(
    (a, b) =>
      (orden.get(a.categoria_id) ?? 0) - (orden.get(b.categoria_id) ?? 0) ||
      a.nombre.localeCompare(b.nombre, 'es'),
  )

  if (!cierre.data) {
    return (
      <>
        <PageTitle
          icon="🧮"
          title="Conteo semanal"
          subtitle="Cuenta lo que hay y cierra la semana"
        />
        {error && (
          <p className="mb-3 rounded-2xl bg-red-100 px-4 py-3 text-center font-bold text-red-700">
            {error}
          </p>
        )}
        <button
          onClick={empezar}
          disabled={iniciando}
          className="w-full rounded-2xl bg-green-500 px-6 py-4 text-xl font-bold text-white shadow-[0_4px_0_0_#15803d] active:translate-y-1 active:shadow-none disabled:opacity-60"
        >
          {iniciando ? 'Abriendo...' : 'Empezar el conteo'}
        </button>
      </>
    )
  }

  return (
    <ConteoSesion
      cierre={cierre.data}
      productos={productos}
      categorias={listaCategorias}
      conteos={conteos.data ?? []}
      esPrimero={(cerrados.data ?? 0) === 0}
    />
  )
}

export default Conteo
