import { useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, CardHead, Avatar, Badge, Progress, Icon, Button, Field, EmptyState, Tabs } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { toast } from '@/components/toast'
import { nivelInfo, cn, ehLideranca, fmtDate } from '@/lib/utils'
import type { Tarefa, StatusTarefa } from '@/lib/types'

const RARIDADE: Record<string, string> = { comum: 'neutral', raro: 'brand', 'épico': 'gold', 'lendário': 'success' }

const COLUNAS: { key: StatusTarefa; titulo: string; icon: string; hint: string }[] = [
  { key: 'disponivel', titulo: 'Disponíveis', icon: 'Inbox', hint: 'Arraste uma tarefa para "Em andamento" para assumi-la' },
  { key: 'andamento', titulo: 'Em andamento', icon: 'Loader', hint: 'Suas tarefas em execução' },
  { key: 'aprovacao', titulo: 'Aguardando aprovação', icon: 'Clock', hint: 'Concluídas, aguardando o gestor' },
  { key: 'concluida', titulo: 'Concluídas', icon: 'CheckCircle2', hint: 'Aprovadas e pontuadas' },
]

export default function Gamificacao() {
  const s = useStore()
  const user = s.currentUser()
  const preview = useStore((x) => x.previewColaborador)
  const gestor = ehLideranca(user, s.setores, preview)

  const ranking = [...s.colaboradores].sort((a, b) => b.pontos - a.pontos)
  const meuRank = ranking.findIndex((c) => c.id === user.id) + 1
  const nivel = nivelInfo(user.pontos)
  const meusBadges = new Set(user.badges)

  const [tab, setTab] = useState('missoes')
  const [novaOpen, setNovaOpen] = useState(false)
  const [provaDe, setProvaDe] = useState<Tarefa | null>(null)
  const [prova, setProva] = useState('')
  const [drag, setDrag] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<StatusTarefa | null>(null)

  const recompensas = [
    { icon: 'Coffee', nome: 'Vale café premium', custo: 500 },
    { icon: 'Ticket', nome: 'Day off extra', custo: 3000 },
    { icon: 'Gift', nome: 'Kit 4JURIS', custo: 1500 },
    { icon: 'Plane', nome: 'Voucher viagem', custo: 8000 },
  ]

  const nomeDe = (id?: string | null) => s.colaboradores.find((c) => c.id === id)?.nome ?? '—'

  /* ---------- Drag & drop ---------- */
  const onDrop = (col: StatusTarefa) => {
    setOverCol(null)
    if (!drag) return
    const t = s.tarefas.find((x) => x.id === drag)
    setDrag(null)
    if (!t) return
    if (col === t.status) return
    if (col === 'andamento') {
      // assumir a tarefa (ou continuar sendo o responsável)
      if (t.status === 'disponivel' || (t.status === 'andamento' && t.responsavelId !== user.id)) {
        s.assumirTarefa(t.id, user.id)
        toast('Tarefa assumida! Boa sorte 💪')
      } else {
        s.moverTarefa(t.id, 'andamento')
      }
    } else if (col === 'disponivel') {
      if (t.status === 'andamento' && t.responsavelId === user.id) {
        s.moverTarefa(t.id, 'disponivel', null)
        toast('Tarefa devolvida ao quadro.')
      }
    }
    // colunas "aprovacao" e "concluida" só via botões (precisam de prova / aprovação)
  }

  const criarTarefa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    if (!d.titulo || !d.pontos) { toast('Informe título e pontos.', 'danger'); return }
    s.addTarefa({ titulo: d.titulo, descricao: d.descricao ?? '', pontos: parseInt(d.pontos) || 0, criadaPor: user.id, prazo: d.prazo || undefined })
    setNovaOpen(false)
    toast('Tarefa criada e disponível no quadro. 🎯')
  }

  const enviarProva = () => {
    if (!provaDe) return
    if (!prova) { toast('Anexe uma prova (foto ou vídeo).', 'danger'); return }
    s.concluirTarefa(provaDe.id, prova)
    setProvaDe(null); setProva('')
    toast('Enviada para aprovação do gestor! ✅')
  }

  const podeArrastar = (t: Tarefa) =>
    t.status === 'disponivel' || (t.status === 'andamento' && t.responsavelId === user.id)

  return (
    <>
      <PageHeader title="Gamificação" subtitle="Missões, pontos, níveis e reconhecimento do time."
        actions={gestor && <Button icon="Plus" onClick={() => setNovaOpen(true)}>Criar tarefa</Button>} />

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

      <Tabs tabs={[{ key: 'missoes', label: 'Missões (Kanban)' }, { key: 'reconhecimento', label: 'Ranking & Conquistas' }]} active={tab} onChange={setTab} />

      {tab === 'missoes' && (
        <>
          <div className="flex items-center gap-2 mb-4 text-[13px] text-muted">
            <Icon name="MousePointerClick" className="h-4 w-4 text-brand" />
            Arraste uma tarefa de <b className="text-ink-2">Disponíveis</b> para <b className="text-ink-2">Em andamento</b> para assumi-la. Ao terminar, clique em <b className="text-ink-2">Concluir</b> e anexe uma prova.
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUNAS.map((col) => {
              const cards = s.tarefas.filter((t) => t.status === col.key)
              return (
                <div
                  key={col.key}
                  onDragOver={(e) => { e.preventDefault(); setOverCol(col.key) }}
                  onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
                  onDrop={() => onDrop(col.key)}
                  className={cn('rounded-2xl border bg-surface-2 transition min-h-[220px]',
                    overCol === col.key ? 'border-brand ring-4 ring-brand-100' : 'border-line')}
                >
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
                    <Icon name={col.icon} className="h-[17px] w-[17px] text-muted" />
                    <span className="text-[13px] font-bold text-ink">{col.titulo}</span>
                    <span className="ml-auto text-[11.5px] font-bold text-muted bg-winter rounded-full px-2 py-0.5">{cards.length}</span>
                  </div>
                  <div className="p-3 space-y-3">
                    {cards.length === 0 && <p className="text-[12px] text-muted-2 text-center py-6 px-2">{col.hint}</p>}
                    {cards.map((t) => {
                      const mine = t.responsavelId === user.id
                      const arrastavel = podeArrastar(t)
                      return (
                        <div
                          key={t.id}
                          draggable={arrastavel}
                          onDragStart={() => setDrag(t.id)}
                          onDragEnd={() => { setDrag(null); setOverCol(null) }}
                          className={cn('rounded-xl border border-line bg-surface p-3.5 shadow-xs transition',
                            arrastavel ? 'cursor-grab active:cursor-grabbing hover:shadow-sm hover:-translate-y-0.5' : 'cursor-default',
                            drag === t.id && 'opacity-40')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[13.5px] font-bold text-ink leading-snug">{t.titulo}</span>
                            <span className="text-[12px] font-extrabold text-brand shrink-0 bg-brand-50 rounded-lg px-2 py-0.5">+{t.pontos}</span>
                          </div>
                          {t.descricao && <p className="text-[12px] text-muted mt-1.5 line-clamp-3">{t.descricao}</p>}
                          {t.prazo && <div className="flex items-center gap-1 text-[11.5px] text-muted mt-2"><Icon name="CalendarClock" className="h-3.5 w-3.5" />Prazo {fmtDate(t.prazo)}</div>}

                          {t.responsavelId && (
                            <div className="flex items-center gap-2 mt-2.5">
                              <Avatar nome={nomeDe(t.responsavelId)} cor={s.colaboradores.find((c) => c.id === t.responsavelId)?.avatarCor} size="sm" className="!h-6 !w-6 !text-[9px]" />
                              <span className="text-[11.5px] text-muted">{mine ? 'Você' : nomeDe(t.responsavelId)}</span>
                            </div>
                          )}
                          {t.prova && (
                            <div className="flex items-center gap-1.5 mt-2 text-[11.5px] text-brand">
                              <Icon name="Paperclip" className="h-3.5 w-3.5" />{t.prova}
                            </div>
                          )}

                          {/* Ações */}
                          {col.key === 'disponivel' && (
                            <Button size="sm" variant="soft" icon="Hand" className="w-full mt-3" onClick={() => { s.assumirTarefa(t.id, user.id); toast('Tarefa assumida! 💪') }}>Assumir</Button>
                          )}
                          {col.key === 'andamento' && mine && (
                            <Button size="sm" icon="CheckCircle2" className="w-full mt-3" onClick={() => { setProvaDe(t); setProva('') }}>Concluir e anexar prova</Button>
                          )}
                          {col.key === 'aprovacao' && gestor && (
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="ghost" className="flex-1" onClick={() => { s.recusarTarefa(t.id); toast('Devolvida para ajustes.', 'info') }}>Recusar</Button>
                              <Button size="sm" icon="Check" className="flex-1" onClick={() => { s.aprovarTarefa(t.id, user.id); toast(`Aprovada! +${t.pontos} pts para ${nomeDe(t.responsavelId)}. 🎉`) }}>Aprovar</Button>
                            </div>
                          )}
                          {col.key === 'aprovacao' && !gestor && mine && (
                            <div className="text-[11.5px] text-warning bg-warning-soft rounded-lg px-2.5 py-1.5 mt-3 flex items-center gap-1.5">
                              <Icon name="Clock" className="h-3.5 w-3.5" /> Aguardando aprovação do gestor
                            </div>
                          )}
                          {col.key === 'concluida' && (
                            <div className="text-[11.5px] text-success bg-success-soft rounded-lg px-2.5 py-1.5 mt-3 flex items-center gap-1.5">
                              <Icon name="Trophy" className="h-3.5 w-3.5" /> +{t.pontos} pts concedidos
                            </div>
                          )}
                          {gestor && col.key === 'disponivel' && (
                            <button onClick={() => { s.removeTarefa(t.id); toast('Tarefa removida.', 'danger') }} className="text-[11px] text-muted hover:text-danger mt-2 inline-flex items-center gap-1">
                              <Icon name="Trash2" className="h-3 w-3" /> Remover
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'reconhecimento' && (
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
                    <div key={b.id} title={`${b.descricao} · ${b.raridade}`} className={cn('flex flex-col items-center text-center gap-2 p-3 rounded-xl border transition', has ? 'border-line bg-surface' : 'border-dashed border-line opacity-40 grayscale')}>
                      <span className="h-11 w-11 rounded-full flex items-center justify-center text-white" style={{ background: has ? b.cor : '#c0c4c7' }}>
                        <Icon name={b.icon} className="h-[22px] w-[22px]" />
                      </span>
                      <span className="text-[11px] font-bold text-ink leading-tight">{b.nome}</span>
                      {has && <Badge tone={RARIDADE[b.raridade]} className="!text-[9px] !px-1.5 !py-0.5">{b.raridade}</Badge>}
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
      )}

      {/* Modal criar tarefa (gestor) */}
      <Modal open={novaOpen} onClose={() => setNovaOpen(false)} title="Criar tarefa" subtitle="Defina a missão e os pontos que o colaborador ganhará ao concluí-la."
        footer={<><Button variant="ghost" onClick={() => setNovaOpen(false)}>Cancelar</Button><Button icon="Check" type="submit" form="tarefaForm">Criar tarefa</Button></>}>
        <form id="tarefaForm" onSubmit={criarTarefa}>
          <Field label="Título da tarefa" required><input name="titulo" className="input" placeholder="Ex.: Publicar 3 posts no LinkedIn" /></Field>
          <Field label="Descrição"><textarea name="descricao" className="input !h-auto py-2.5" rows={3} placeholder="Detalhe o que precisa ser feito e os critérios de aceite." /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Pontos" required hint="Pontos concedidos ao aprovar"><input name="pontos" type="number" min={0} className="input" placeholder="150" /></Field>
            <Field label="Prazo (opcional)"><input name="prazo" type="date" className="input" /></Field>
          </div>
        </form>
      </Modal>

      {/* Modal concluir + anexar prova */}
      <Modal open={!!provaDe} onClose={() => { setProvaDe(null); setProva('') }} title="Concluir tarefa"
        subtitle={provaDe ? `${provaDe.titulo} · +${provaDe.pontos} pts` : ''}
        footer={<><Button variant="ghost" onClick={() => { setProvaDe(null); setProva('') }}>Cancelar</Button><Button icon="Send" onClick={enviarProva}>Enviar para aprovação</Button></>}>
        <Field label="Prova de conclusão (foto ou vídeo)" required hint="Anexe uma imagem ou vídeo que comprove a entrega. O gestor irá revisar e conceder os pontos.">
          <label className={cn('flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-7 cursor-pointer transition', prova ? 'border-brand bg-brand-50' : 'border-line-strong hover:border-brand hover:bg-brand-50/50')}>
            <Icon name={prova ? 'FileCheck2' : 'UploadCloud'} className="h-8 w-8 text-brand" />
            <span className="text-[13px] font-medium text-ink-2">{prova || 'Clique para anexar (JPG, PNG, MP4, MOV)'}</span>
            <input type="file" accept="image/*,video/*" className="sr-only" onChange={(e) => setProva(e.target.files?.[0]?.name ?? '')} />
          </label>
        </Field>
      </Modal>
    </>
  )
}
