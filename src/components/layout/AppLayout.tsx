import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useStore } from '@/lib/store'
import { flatNav } from '@/lib/nav'
import { Eye } from 'lucide-react'

export function AppLayout() {
  const { pathname } = useLocation()
  const papel = useStore((s) => s.currentUser().papel)
  const preview = useStore((s) => s.previewColaborador)
  const setPreview = useStore((s) => s.setPreview)

  // Guarda de rota: se o papel efetivo não pode acessar o módulo, volta ao início.
  const item = flatNav().find((i) => i.to === pathname)
  const bloqueado = item?.papeis && !item.papeis.includes(papel)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        {preview && (
          <div className="bg-ink text-white px-5 sm:px-7 py-2.5 flex items-center gap-3 text-[13px] animate-slide-up">
            <Eye className="h-[17px] w-[17px] text-brand-300 shrink-0" />
            <span className="font-medium">Você está vendo o portal como <b>colaborador</b>. Você só vê e edita o que um colaborador pode.</span>
            <button onClick={() => setPreview(false)} className="ml-auto shrink-0 rounded-lg bg-white/10 hover:bg-white/20 transition px-3 py-1.5 font-semibold">
              Sair da visão colaborador
            </button>
          </div>
        )}
        <main className="flex-1 p-5 sm:p-7">
          <div className="mx-auto max-w-[1240px] animate-fade-in" key={pathname + (preview ? '-p' : '')}>
            {bloqueado ? <Navigate to="/" replace /> : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}
