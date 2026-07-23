import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { Card, CardHead, Badge, Avatar, Progress, Icon, Button } from '@/components/ui'
import { brl, fmtDate, fmtDateTime, nivelInfo, firstName, relTime, cn } from '@/lib/utils'

export default function Dashboard() {
  const s = useStore()
  const user = s.currentUser()
  const nivel = nivelInfo(user.pontos)

  // Pendências reais do usuário
  const minhaNota = s.notas.find((n) => n.colaboradorId === user.id && n.competencia === '2026-07')
  const reembPendentes = s.reembolsos.filter((r) => r.colaboradorId === user.id && r.status === 'pendente')
  const desafiosAbertos = s.desafios.filter((d) => !d.concluido)

  const pendencias = [
    minhaNota && minhaNota.status === 'aguardando' && { icon: 'FileText', txt: `Enviar nota fiscal de julho (${brl(minhaNota.valor)})`, to: '/notas', tone: 'warning' as const },
    reembPendentes.length > 0 && { icon: 'ReceiptText', txt: `${reembPendentes.length} reembolso(s) aguardando aprovação`, to: '/reembolsos', tone: 'brand' as const },
    { icon: 'GraduationCap', txt: 'Concluir treinamento obrigatório de LGPD', to: '/treinamentos', tone: 'warning' as const },
  ].filter(Boolean) as { icon: string; txt: string; to: string; tone: 'warning' | 'brand' }[]

  const comunicados = [...s.comunicados].sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0)).slice(0, 3)
  const proximos = [...s.eventos].filter((e) => new Date(e.data) >= new Date('2026-07-23')).sort((a, b) => +new Date(a.data) - +new Date(b.data)).slice(0, 3)

  const mes = new Date('2026-07-23').getMonth()
  const niver = s.colaboradores.filter((c) => new Date(c.nascimento + 'T00:00:00').getMonth() === mes)
    .sort((a, b) => new Date(a.nascimento).getDate() - new Date(b.nascimento).getDate())

  const atalhos = [
    { icon: 'ReceiptText', label: 'Pedir reembolso', to: '/reembolsos' },
    { icon: 'FileText', label: 'Enviar NF', to: '/notas' },
    { icon: 'CalendarDays', label: 'Pedir folga', to: '/folgas' },
    { icon: 'Palmtree', label: 'Solicitar recesso', to: '/recesso' },
    { icon: 'Gift', label: 'Benefícios', to: '/beneficios' },
    { icon: 'Bot', label: 'Assistente IA', to: '/assistente' },
  ]

  return (
    <>
      {/* Hero de boas-vindas */}
      <div className="rounded-3xl bg-ink text-white p-6 sm:p-7 mb-6 relative overflow-hidden tech-grid">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,50,210,.5), transparent 70%)' }} />
        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="text-[13px] text-[#8592a0] font-medium">{new Date('2026-07-23').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
            <h2 className="text-[26px] font-extrabold tracking-tight mt-1">Olá, {firstName(user.nome)} 👋</h2>
            <p className="text-[#aab6c0] text-[14px] mt-1.5 max-w-md">Bem-vindo(a) ao seu portal. Você tem {pendencias.length} pendência(s) e {desafiosAbertos.length} desafio(s) em aberto.</p>
          </div>
          <Link to="/experiencia" className="bg-white/[.07] hover:bg-white/[.12] transition border border-white/10 rounded-2xl p-4 min-w-[210px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-[#aab6c0] font-medium">Seu nível</span>
              <span className="text-[11px] font-bold bg-brand rounded-full px-2 py-0.5">Nível {nivel.nivel}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-extrabold">{user.pontos.toLocaleString('pt-BR')}</span>
              <span className="text-[12px] text-[#8592a0]">pontos</span>
            </div>
            <Progress value={nivel.progresso} className="mt-2.5 bg-white/10" color="#4d6bec" />
            <div className="text-[11px] text-[#8592a0] mt-1.5">{nivel.proximo - nivel.pontosNoNivel} pts para o nível {nivel.nivel + 1}</div>
          </Link>
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {atalhos.map((a) => (
          <Link key={a.to} to={a.to} className="card p-4 flex flex-col items-center gap-2.5 text-center hover:shadow-sm hover:-translate-y-0.5 transition group">
            <span className="h-11 w-11 rounded-xl bg-brand-50 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition">
              <Icon name={a.icon} className="h-5 w-5" />
            </span>
            <span className="text-[11.5px] font-semibold text-ink-2 leading-tight">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Coluna principal */}
        <div className="space-y-6">
          {/* Pendências */}
          <Card>
            <CardHead title="Suas pendências" sub="O que precisa da sua atenção" action={<Badge tone={pendencias.length ? 'warning' : 'success'} dot>{pendencias.length || 'Tudo em dia'}</Badge>} />
            <div className="p-3">
              {pendencias.length === 0 && <p className="text-[13.5px] text-muted px-3 py-4">Nenhuma pendência. Bom trabalho! 🎉</p>}
              {pendencias.map((p, i) => (
                <Link key={i} to={p.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition">
                  <span className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', p.tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-brand-50 text-brand')}>
                    <Icon name={p.icon} className="h-[19px] w-[19px]" />
                  </span>
                  <span className="text-[13.5px] font-medium text-ink flex-1">{p.txt}</span>
                  <Icon name="ChevronRight" className="h-4 w-4 text-muted-2" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Comunicados recentes */}
          <Card>
            <CardHead title="Comunicados recentes" action={<Link to="/comunicados" className="text-[13px] font-semibold text-brand hover:underline">Ver todos</Link>} />
            <div className="divide-y divide-line">
              {comunicados.map((m) => (
                <Link key={m.id} to="/comunicados" className="flex gap-3.5 p-4 hover:bg-surface-2 transition">
                  <span className="h-10 w-10 rounded-xl bg-winter text-ink flex items-center justify-center shrink-0">
                    <Icon name="Megaphone" className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {m.fixado && <Badge tone="brand">Fixado</Badge>}
                      <Badge tone="neutral">{m.categoria}</Badge>
                    </div>
                    <div className="text-[14px] font-semibold text-ink mt-1.5">{m.titulo}</div>
                    <div className="text-[12.5px] text-muted line-clamp-1 mt-0.5">{m.resumo}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Próximos eventos */}
          <Card>
            <CardHead title="Próximos eventos" action={<Link to="/eventos" className="text-[13px] font-semibold text-brand hover:underline">Agenda</Link>} />
            <div className="p-4 space-y-1">
              {proximos.map((e) => (
                <Link key={e.id} to="/eventos" className="flex gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition">
                  <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand flex flex-col items-center justify-center shrink-0 leading-none">
                    <span className="text-[15px] font-extrabold">{new Date(e.data).getDate()}</span>
                    <span className="text-[9px] font-bold uppercase">{new Date(e.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink truncate">{e.titulo}</div>
                    <div className="text-[12px] text-muted">{fmtDateTime(e.data)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Aniversariantes */}
          <Card>
            <CardHead title="Aniversariantes do mês 🎂" />
            <div className="p-4 space-y-2">
              {niver.length === 0 && <p className="text-[13px] text-muted">Nenhum neste mês.</p>}
              {niver.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <Avatar nome={c.nome} cor={c.avatarCor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink truncate">{c.nome}</div>
                    <div className="text-[11.5px] text-muted">{s.setorNome(c.setorId)}</div>
                  </div>
                  <Badge tone="neutral">{fmtDate(c.nascimento, { day: '2-digit', month: 'short' })}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Desafios */}
          <Card>
            <CardHead title="Desafios ativos" action={<Link to="/gamificacao" className="text-[13px] font-semibold text-brand hover:underline">Ver</Link>} />
            <div className="p-4 space-y-3.5">
              {desafiosAbertos.slice(0, 3).map((d) => (
                <div key={d.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12.5px] font-semibold text-ink">{d.titulo}</span>
                    <span className="text-[11.5px] font-bold text-brand">+{d.pontos}</span>
                  </div>
                  <Progress value={(d.progresso / d.meta) * 100} />
                  <div className="text-[11px] text-muted mt-1">{d.progresso}/{d.meta}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
