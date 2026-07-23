import { useStore } from '@/lib/store'
import { PageHeader, Card, CardHead, Avatar, Badge, Progress, Icon, Button } from '@/components/ui'
import { toast } from '@/components/toast'
import { nivelInfo, cn } from '@/lib/utils'

const RARIDADE: Record<string, string> = { comum: 'neutral', raro: 'brand', 'épico': 'gold', 'lendário': 'success' }

export default function Gamificacao() {
  const s = useStore()
  const user = s.currentUser()
  const ranking = [...s.colaboradores].sort((a, b) => b.pontos - a.pontos)
  const meuRank = ranking.findIndex((c) => c.id === user.id) + 1
  const nivel = nivelInfo(user.pontos)
  const meusBadges = new Set(user.badges)

  const recompensas = [
    { icon: 'Coffee', nome: 'Vale café premium', custo: 500 },
    { icon: 'Ticket', nome: 'Day off extra', custo: 3000 },
    { icon: 'Gift', nome: 'Kit 4JURIS', custo: 1500 },
    { icon: 'Plane', nome: 'Voucher viagem', custo: 8000 },
  ]

  return (
    <>
      <PageHeader title="Gamificação" subtitle="Pontos, níveis, conquistas e reconhecimento do time." />

      {/* Destaque do usuário */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 mb-6">
        <Card className="p-6 bg-ink text-white relative overflow-hidden tech-grid">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ background: 'radial-gradient(circle,rgba(0,50,210,.5),transparent 70%)' }} />
          <div className="relative">
            <div className="flex items-center gap-3">
              <Avatar nome={user.nome} cor={user.avatarCor} size="lg" />
              <div>
                <div className="text-[15px] font-bold">{user.nome}</div>
                <div className="text-[12.5px] text-[#8592a0]">{meuRank}º no ranking geral</div>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-5">
              <span className="text-[38px] font-extrabold leading-none">{user.pontos.toLocaleString('pt-BR')}</span>
              <span className="text-[13px] text-[#8592a0]">pontos · Nível {nivel.nivel}</span>
            </div>
            <Progress value={nivel.progresso} className="mt-3 bg-white/10" color="#4d6bec" />
            <div className="text-[12px] text-[#8592a0] mt-2">{nivel.proximo - nivel.pontosNoNivel} pts para o próximo nível · 🔥 {user.streak} dias de streak</div>
          </div>
        </Card>

        {/* Desafios */}
        <Card>
          <CardHead title="Desafios" sub="Complete para ganhar pontos" />
          <div className="p-5 space-y-4">
            {s.desafios.map((d) => (
              <div key={d.id} className={cn('rounded-xl border p-4', d.concluido ? 'border-success/30 bg-success-soft/40' : 'border-line')}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-bold text-ink">{d.titulo}</span>
                      {d.concluido && <Badge tone="success" dot>Concluído</Badge>}
                    </div>
                    <p className="text-[12.5px] text-muted mt-0.5">{d.descricao}</p>
                  </div>
                  <span className="text-[13px] font-extrabold text-brand shrink-0">+{d.pontos}</span>
                </div>
                {!d.concluido && (
                  <div className="mt-3">
                    <Progress value={(d.progresso / d.meta) * 100} />
                    <div className="text-[11px] text-muted mt-1">{d.progresso}/{d.meta}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Ranking */}
        <Card>
          <CardHead title="Ranking do time 🏆" sub="Top colaboradores do mês" />
          <div className="p-3">
            {ranking.map((c, i) => {
              const medal = ['🥇', '🥈', '🥉'][i]
              return (
                <div key={c.id} className={cn('flex items-center gap-3 p-3 rounded-xl', c.id === user.id && 'bg-brand-50')}>
                  <span className="w-7 text-center text-[15px] font-extrabold text-muted">{medal ?? i + 1}</span>
                  <Avatar nome={c.nome} cor={c.avatarCor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink truncate">{c.nome}{c.id === user.id && <span className="text-brand"> · você</span>}</div>
                    <div className="text-[11.5px] text-muted">{s.setorNome(c.setorId)} · Nível {nivelInfo(c.pontos).nivel}</div>
                  </div>
                  <span className="text-[14px] font-bold text-ink">{c.pontos.toLocaleString('pt-BR')}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-6">
          {/* Badges */}
          <Card>
            <CardHead title="Conquistas" sub={`${user.badges.length}/${s.badges.length} desbloqueadas`} />
            <div className="p-5 grid grid-cols-3 gap-3">
              {s.badges.map((b) => {
                const has = meusBadges.has(b.id)
                return (
                  <div key={b.id} title={b.descricao} className={cn('flex flex-col items-center text-center gap-2 p-3 rounded-xl border transition', has ? 'border-line bg-surface' : 'border-dashed border-line opacity-40 grayscale')}>
                    <span className="h-11 w-11 rounded-full flex items-center justify-center text-white" style={{ background: has ? b.cor : '#c0c4c7' }}>
                      <Icon name={b.icon} className="h-[22px] w-[22px]" />
                    </span>
                    <span className="text-[11px] font-bold text-ink leading-tight">{b.nome}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Recompensas */}
          <Card>
            <CardHead title="Loja de recompensas" sub="Troque seus pontos" />
            <div className="p-4 space-y-2">
              {recompensas.map((r) => {
                const pode = user.pontos >= r.custo
                return (
                  <div key={r.nome} className="flex items-center gap-3 p-2.5 rounded-xl border border-line">
                    <span className="h-10 w-10 rounded-lg bg-brand-50 text-brand flex items-center justify-center shrink-0"><Icon name={r.icon} className="h-[18px] w-[18px]" /></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink">{r.nome}</div>
                      <div className="text-[11.5px] text-muted">{r.custo.toLocaleString('pt-BR')} pontos</div>
                    </div>
                    <Button size="sm" variant={pode ? 'soft' : 'ghost'} disabled={!pode} onClick={() => toast('Resgate será conectado ao backend.')}>Resgatar</Button>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
