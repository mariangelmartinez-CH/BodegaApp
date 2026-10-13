import { Outlet } from 'react-router'
import BottomNav from './BottomNav'

function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <main className="flex-1 p-4 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout
