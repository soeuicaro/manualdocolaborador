import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { PageHeader, Card, CardHead, Avatar, Badge, Progress, Icon, StatCard } from '@/components/ui'
import { nivelInfo, tempoCasa, fmtDate, brl, cn } from '@/lib/utils'

export default function Experiencia() {
  const s = useStore()
  const user = s.currentUser()
  const nivel = nivelInfo(user.pontos)
  const meusBadges = s.badges.filter((b) => user.badges.includes(b.id))
  const meusReemb = s.reembolsos.filter((r) => r.colaboradorId === user.id)
  const minhasAusencias = s.ausencias.filter((a) => a.colaboradorId === user.id)

  const jornada = [
    { icon: 'Rocket', txt: 'Entrada na 4JURIS', date: user.dataEntrada, tone: 'brand' },
    { icon: 'GraduationCap', txt: 'Onboarding concluído', date: user.dataEntrada, tone: 'success' },
    { icon: 'Star', txt: 'Primeira conquista desbloqueada', date: '2022-04-01', tone: 'gold' },
    { icon: 'Flame', txt: `Streak de ${user.streak} dias ativo`, date: '2026-07-20', tone: 'warning' },
  ]

  return (
    <>
      <PageHeader title="Minha Experiência" subtitle="Sua jornada, evolução e conquistas na 4JURIS." />

      {/* Cartão de identidade gamificada */}
      <Card className="p-6 sm:p-8 mb-6 bg-gradient-to-br from-ink to-[#1c2f3a] text-white relative overflow-hidden tech-grid">
        <div className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full" style={{ background: 'radial-gradient(circle,rgba(0,50,210,.45),transparent 70%)' }} />
        <div className="relative flex items-center gap-6 flex-wrap">
          <Avatar nome={user.nome} cor={user.avatarCor} size="xl" className="ring-4 ring-white/10" />
          <div className="flex-1 min-w-[220px]">
            <h2 className="text-[22px] font-bold">{user.nome}</h2>
            <p className="text-[#aab6c0] text-[13.5px]">Membro há {tempoCasa(user.dataEntrada)} · desde {fmtDate(user.dataEntrada)}</p>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-[32px] font-extrabold leading-none">{user.pontos.toLocaleString('pt-BR')}</span>
              <span className="text-[12px] text-[#8592a0]">pontos</span>
              <span className="ml-2 text-[11px] font-bold bg-brand rounded-full px-2.5 py-1">Nível {nivel.nivel}</span>
            </div>
            <Progress value={nivel.progresso} className="mt-3 max-w-md bg-white/10" color="#4d6bec" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="Award" tone="brand" value={`${meusBadges.length}/${s.badges.length}`} label="Conquistas" />
        <StatCard icon="Flame" tone="warning" value={user.streak} label="Dias de streak" />
        <StatCard icon="ReceiptText" tone="success" value={meusReemb.length} label="Reembolsos" />
        <StatCard icon="Trophy" tone="ink" value={`Nv ${nivel.nivel}`} label="Nível atual" />
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Jornada */}
        <Card>
          <CardHead title="Minha jornada" />
          <div className="p-6 pl-7">
            <div className="relative pl-6">
              {jornada.map((j, i) => (
                <div key={i} className="relative pb-6 last:pb-0">
                  {i < jornada.length - 1 && <span className="absolute left-[7px] top-4 bottom-0 w-px bg-line" />}
                  <span className="absolute -left-[3px] top-1 h-[18px] w-[18px] rounded-full bg-surface border-2 border-brand flex items-center justify-center" />
                  <div className="pl-6">
                    <div className="flex items-center gap-2">
                      <Icon name={j.icon} className="h-4 w-4 text-brand" />
                      <span className="text-[13.5px] font-semibold text-ink">{j.txt}</span>
                    </div>
                    <span className="text-[12px] text-muted">{fmtDate(j.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Conquistas */}
          <Card>
            <CardHead title="Minhas conquistas" action={<Link to="/gamificacao" className="text-[13px] font-semibold text-brand hover:underline">Ver todas</Link>} />
            <div className="p-5 flex flex-wrap gap-3">
              {meusBadges.map((b) => (
                <div key={b.id} title={b.descricao} className="flex flex-col items-center gap-1.5 w-[72px] text-center">
                  <span className="h-12 w-12 rounded-full flex items-center justify-center text-white" style={{ background: b.cor }}>
                    <Icon name={b.icon} className="h-6 w-6" />
                  </span>
                  <span className="text-[10.5px] font-bold text-ink leading-tight">{b.nome}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Minhas solicitações */}
          <Card>
            <CardHead title="Minhas solicitações recentes" />
            <div className="divide-y divide-line">
              {[...meusReemb.slice(0, 2).map((r) => ({ icon: 'ReceiptText', txt: r.descricao, meta: brl(r.valor), status: r.status, to: '/reembolsos' })),
                ...minhasAusencias.slice(0, 2).map((a) => ({ icon: a.tipo === 'folga' ? 'CalendarDays' : 'Palmtree', txt: a.tipo === 'folga' ? 'Folga' : 'Recesso', meta: `${a.dias} dia(s)`, status: a.status, to: a.tipo === 'folga' ? '/folgas' : '/recesso' }))
              ].map((it, i) => (
                <Link key={i} to={it.to} className="flex items-center gap-3 p-3.5 hover:bg-surface-2 transition">
                  <span className="h-9 w-9 rounded-lg bg-winter text-ink flex items-center justify-center shrink-0"><Icon name={it.icon} className="h-[17px] w-[17px]" /></span>
                  <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-ink truncate">{it.txt}</div><div className="text-[12px] text-muted">{it.meta}</div></div>
                  <Badge tone={it.status === 'aprovado' ? 'success' : it.status === 'recusado' ? 'danger' : 'warning'} dot>{it.status}</Badge>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
