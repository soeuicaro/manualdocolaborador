import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { flatNav } from '@/lib/nav'
import { Avatar, Icon } from '@/components/ui'
import { nivelInfo, relTime, cn } from '@/lib/utils'
import { Bell, Search, LogOut, Trophy } from 'lucide-react'

const notifIcon: Record<string, string> = {
  aprovacao: 'CheckCircle2', recusa: 'XCircle', prazo: 'Clock', comunicado: 'Megaphone',
  evento: 'CalendarHeart', gamificacao: 'Trophy', pendencia: 'AlertTriangle',
}

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useStore((s) => s.currentUser())
  const notifs = useStore((s) => s.notificacoes)
  const marcarTodasLidas = useStore((s) => s.marcarTodasLidas)
  const marcarNotifLida = useStore((s) => s.marcarNotifLida)
  const [openBell, setOpenBell] = useState(false)

  const naoLidas = notifs.filter((n) => !n.lida).length
  const nivel = nivelInfo(user.pontos)

  const current = flatNav().find((i) => i.to === location.pathname)
  const title = current?.label ?? (location.pathname === '/notificacoes' ? 'Notificações' : '4JURIS Pessoas')

  return (
    <header className="h-[68px] shrink-0 bg-surface-3/80 backdrop-blur border-b border-line sticky top-0 z-40 flex items-center gap-4 px-5 sm:px-7">
      <div className="min-w-0">
        <div className="text-[11.5px] text-muted font-medium">4JURIS Pessoas · {current?.desc ? current.desc.split('.')[0] : 'Portal do colaborador'}</div>
        <h1 className="text-[17px] font-bold text-ink leading-tight truncate">{title}</h1>
      </div>

      {/* Busca */}
      <div className="hidden md:block flex-1 max-w-md ml-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[17px] w-[17px] text-muted pointer-events-none" />
          <input
            className="input pl-10"
            placeholder="Buscar módulos, pessoas, dúvidas..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const q = (e.target as HTMLInputElement).value.toLowerCase()
                const hit = flatNav().find((i) => i.label.toLowerCase().includes(q))
                if (hit) navigate(hit.to)
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Pontos */}
        <Link to="/experiencia" className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 font-bold text-[13px] hover:bg-brand-100 transition">
          <Trophy className="h-[17px] w-[17px]" />
          {user.pontos.toLocaleString('pt-BR')}
          <span className="text-[10.5px] font-semibold bg-brand text-white rounded-full px-1.5 py-0.5">Nv {nivel.nivel}</span>
        </Link>

        {/* Sino */}
        <div className="relative">
          <button
            onClick={() => setOpenBell((v) => !v)}
            className="relative h-10 w-10 rounded-xl border border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink flex items-center justify-center transition"
          >
            <Bell className="h-[19px] w-[19px]" />
            {naoLidas > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />}
          </button>

          {openBell && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenBell(false)} />
              <div className="absolute right-0 mt-2 w-[340px] bg-surface rounded-2xl shadow-lg border border-line z-50 animate-scale-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                  <b className="text-[14px] text-ink">Notificações</b>
                  <button onClick={marcarTodasLidas} className="text-[12px] font-semibold text-brand hover:underline">Marcar todas lidas</button>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifs.slice(0, 6).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { marcarNotifLida(n.id); setOpenBell(false); if (n.href) navigate(n.href) }}
                      className={cn('w-full text-left flex gap-3 px-4 py-3 border-b border-line/70 hover:bg-surface-2 transition', !n.lida && 'bg-brand-50/50')}
                    >
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-winter flex items-center justify-center text-ink-2">
                        <Icon name={notifIcon[n.tipo] ?? 'Bell'} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-ink truncate">{n.titulo}</div>
                        <div className="text-[12px] text-muted line-clamp-2">{n.texto}</div>
                        <div className="text-[11px] text-muted-2 mt-0.5">{relTime(n.data)}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <Link to="/notificacoes" onClick={() => setOpenBell(false)} className="block text-center py-3 text-[13px] font-semibold text-brand hover:bg-surface-2 transition">
                  Ver todas
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Usuário */}
        <Link to="/perfil" className="flex items-center gap-2.5 pl-1 pr-1 sm:pr-3 h-10 rounded-xl hover:bg-winter transition">
          <Avatar nome={user.nome} cor={user.avatarCor} size="sm" />
          <div className="hidden sm:block leading-tight">
            <div className="text-[12.5px] font-bold text-ink">{user.nome.split(' ')[0]}</div>
            <div className="text-[10.5px] text-muted capitalize">{user.papel}</div>
          </div>
        </Link>

        <button onClick={() => navigate('/login')} title="Sair" className="h-10 w-10 rounded-xl border border-line bg-surface text-muted hover:bg-danger-soft hover:text-danger flex items-center justify-center transition">
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  )
}
