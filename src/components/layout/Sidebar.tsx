import { NavLink } from 'react-router-dom'
import { NAV } from '@/lib/nav'
import { useStore } from '@/lib/store'
import { Icon, Logo } from '@/components/ui'
import { cn, podeVerReembolsosView } from '@/lib/utils'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export function Sidebar() {
  const collapsed = useStore((s) => s.sidebarCollapsed)
  const toggle = useStore((s) => s.toggleSidebar)
  const user = useStore((s) => s.currentUser())
  const setores = useStore((s) => s.setores)
  const preview = useStore((s) => s.previewColaborador)
  const papel = user.papel
  const verReemb = podeVerReembolsosView(user, setores, preview)

  return (
    <aside
      className={cn(
        'shrink-0 bg-ink text-[#aeb9c1] flex flex-col sticky top-0 h-screen z-50 transition-[width] duration-300',
        collapsed ? 'w-[76px]' : 'w-[264px]',
      )}
    >
      {/* Marca */}
      <div className={cn('flex items-center gap-3 px-5 h-[68px] shrink-0', collapsed && 'justify-center px-0')}>
        <Logo size={38} />
        {!collapsed && (
          <div className="leading-none">
            <div className="text-[16px] font-extrabold text-white tracking-tight">4JURIS</div>
            <div className="text-[10.5px] text-[#7d8a94] mt-1 font-medium tracking-wide">Pessoas & Gestão</div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-1">
        {NAV.map((group) => {
          const items = group.items
            .filter((i) => !i.papeis || i.papeis.includes(papel))
            .filter((i) => i.to !== '/reembolsos' || verReemb)
          if (!items.length) return null
          return (
            <div key={group.title} className="mt-4 first:mt-1">
              {!collapsed && (
                <div className="text-[10.5px] font-bold tracking-[.08em] uppercase text-[#61707b] px-3 pb-2">
                  {group.title}
                </div>
              )}
              {collapsed && <div className="h-px bg-white/5 mx-2 my-2 first:hidden" />}
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 mb-0.5 text-[13.5px] font-medium transition',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-brand text-white shadow-brand'
                        : 'text-[#aeb9c1] hover:bg-white/[.06] hover:text-white',
                    )
                  }
                >
                  <Icon name={item.icon} className="h-[19px] w-[19px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-ink-soft px-2.5 py-1.5 text-xs text-white opacity-0 shadow-md transition group-hover:opacity-100 z-50 border border-white/10">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* Botão minimizar */}
      <div className="p-3 border-t border-white/[.08]">
        <button
          onClick={toggle}
          className={cn(
            'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#aeb9c1] hover:bg-white/[.06] hover:text-white transition',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Expandir menu' : 'Minimizar menu'}
        >
          {collapsed ? <PanelLeftOpen className="h-[19px] w-[19px]" /> : <PanelLeftClose className="h-[19px] w-[19px]" />}
          {!collapsed && <span>Minimizar</span>}
        </button>
      </div>
    </aside>
  )
}
