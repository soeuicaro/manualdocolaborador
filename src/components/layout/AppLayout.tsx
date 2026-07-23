import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 p-5 sm:p-7">
          <div className="mx-auto max-w-[1240px] animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
