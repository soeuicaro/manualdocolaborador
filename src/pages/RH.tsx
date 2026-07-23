import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, CardHead, StatCard, Badge, Button, Avatar, Icon, Tabs, EmptyState, Progress } from '@/components/ui'
import { toast } from '@/components/toast'
import { brl, fmtDate, STATUS_SOLIC, tempoCasa, nivelInfo, cn } from '@/lib/utils'

const mesLabel = (comp: string) => new Date(comp + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

export default function RH() {
  const s = useStore()
  const aprovarNota = useStore((x) => x.aprovarNota)
  const pagarNota = useStore((x) => x.pagarNota)
  const user = s.currentUser()

  const [tab, setTab] = useState('visao')

  // ---- Filtros da central de NF ----
  const competencias = useMemo(() => Array.from(new Set(s.notas.map((n) => n.competencia))).sort().reverse(), [s.notas])
  const [comp, setComp] = useState('todas')
  const [colab, setColab] = useState('todos')
  const [statusF, setStatusF] = useState('todos')

  const nomeDe = (id: string) => s.colaboradores.find((c) => c.id === id)?.nome ?? '—'

  const notasFiltradas = s.notas
    .filter((n) => comp === 'todas' || n.competencia === comp)
    .filter((n) => colab === 'todos' || n.colaboradorId === colab)
    .filter((n) => statusF === 'todos' || n.status === statusF)
    .sort((a, b) => nomeDe(a.colaboradorId).localeCompare(nomeDe(b.colaboradorId)))

  const totalAPagar = s.notas.filter((n) => n.status === 'aprovada').reduce((a, n) => a + n.valor, 0)
  const totalPago = s.notas.filter((n) => n.status === 'paga').reduce((a, n) => a + n.valor, 0)

  // ---- Indicadores gerais ----
  const total = s.colaboradores.length
  const ativos = s.colaboradores.filter((c) => c.status === 'ativo').length
  const emAfastamento = s.colaboradores.filter((c) => c.status === 'ferias' || c.status === 'recesso').length
  const recentes = [...s.colaboradores].sort((a, b) => +new Date(b.dataEntrada) - +new Date(a.dataEntrada)).slice(0, 4)
  const reembPend = s.reembolsos.filter((r) => r.status === 'pendente').length
  const ausPend = s.ausencias.filter((a) => a.status === 'pendente').length
  const notasPend = s.notas.filter((n) => n.status === 'enviada').length

  const porSetor = s.setores.map((se) => ({ setor: se, qtd: s.colaboradores.filter((c) => c.setorId === se.id).length })).sort((a, b) => b.qtd - a.qtd)
  const rankTop = [...s.colaboradores].sort((a, b) => b.pontos - a.pontos).slice(0, 5)
  const pontosTotais = s.colaboradores.reduce((a, c) => a + c.pontos, 0)

  return (
    <>
      <PageHeader title="Dashboard do RH" subtitle="Indicadores de pessoas, notas fiscais e engajamento da 4JURIS." />

      <Tabs tabs={[{ key: 'visao', label: 'Visão geral' }, { key: 'notas', label: 'Notas fiscais' }, { key: 'engajamento', label: 'Engajamento' }]} active={tab} onChange={setTab} />

      {tab === 'visao' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon="Users" tone="brand" value={total} label="Colaboradores" />
            <StatCard icon="CheckCircle2" tone="success" value={ativos} label="Ativos" />
            <StatCard icon="Palmtree" tone="warning" value={emAfastamento} label="Em férias / recesso" />
            <StatCard icon="Bell" tone="danger" value={reembPend + ausPend + notasPend} label="Aprovações pendentes" />
          </div>

          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
            <Card>
              <CardHead title="Distribuição por setor" sub={`${s.setores.length} setores`} />
              <div className="p-5 space-y-4">
                {porSetor.map(({ setor, qtd }) => (
                  <div key={setor.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                        <span className="h-6 w-6 rounded-lg flex items-center justify-center text-white" style={{ background: setor.cor }}><Icon name={setor.icon} className="h-3.5 w-3.5" /></span>
                        {setor.nome}
                      </span>
                      <span className="text-[12.5px] font-bold text-muted">{qtd}</span>
                    </div>
                    <Progress value={(qtd / total) * 100} color={setor.cor} />
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHead title="Entradas recentes" sub="Últimos colaboradores" />
              <div className="p-3">
                {recentes.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-2.5">
                    <Avatar nome={c.nome} cor={c.avatarCor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink truncate">{c.nome}</div>
                      <div className="text-[11.5px] text-muted">{s.setorNome(c.setorId)} · {tempoCasa(c.dataEntrada)}</div>
                    </div>
                    <Badge tone="neutral">{fmtDate(c.dataEntrada, { month: 'short', year: 'numeric' })}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === 'notas' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon="Send" tone="brand" value={s.notas.filter((n) => n.status === 'enviada').length} label="Aguardando aprovação" />
            <StatCard icon="CheckCircle2" tone="success" value={s.notas.filter((n) => n.status === 'aprovada').length} label="Aprovadas p/ pagamento" />
            <StatCard icon="Wallet" tone="warning" value={brl(totalAPagar)} label="Total a pagar" />
            <StatCard icon="BadgeCheck" tone="ink" value={brl(totalPago)} label="Total pago" />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select className="input w-auto min-w-[150px]" value={comp} onChange={(e) => setComp(e.target.value)}>
              <option value="todas">Todos os meses</option>
              {competencias.map((c) => <option key={c} value={c} className="capitalize">{mesLabel(c)}</option>)}
            </select>
            <select className="input w-auto min-w-[170px]" value={colab} onChange={(e) => setColab(e.target.value)}>
              <option value="todos">Todos os colaboradores</option>
              {s.colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select className="input w-auto min-w-[150px]" value={statusF} onChange={(e) => setStatusF(e.target.value)}>
              <option value="todos">Todos os status</option>
              {['aguardando', 'enviada', 'aprovada', 'pagamento', 'paga'].map((st) => <option key={st} value={st}>{STATUS_SOLIC[st].label}</option>)}
            </select>
            <span className="ml-auto text-[12.5px] text-muted">{notasFiltradas.length} nota(s)</span>
          </div>

          <Card>
            {notasFiltradas.length === 0 ? (
              <EmptyState icon="FileText" title="Nenhuma nota encontrada" desc="Ajuste os filtros de mês, colaborador ou status." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px] min-w-[720px]">
                  <thead>
                    <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-muted bg-surface-2 border-b border-line">
                      <th className="px-5 py-3">Colaborador</th><th className="px-5 py-3">Competência</th><th className="px-5 py-3">Valor</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasFiltradas.map((n) => {
                      const c = s.colaboradores.find((x) => x.id === n.colaboradorId)
                      return (
                        <tr key={n.id} className="border-b border-line last:border-0 hover:bg-brand-50/40 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar nome={c?.nome ?? '?'} cor={c?.avatarCor} size="sm" />
                              <div><div className="font-semibold text-ink">{c?.nome}</div><div className="text-[11.5px] text-muted">{c?.cnpj || 'sem CNPJ'}</div></div>
                            </div>
                          </td>
                          <td className="px-5 py-3 capitalize text-ink-2">{mesLabel(n.competencia)}</td>
                          <td className="px-5 py-3 font-bold text-ink">{brl(n.valor)}</td>
                          <td className="px-5 py-3"><Badge tone={STATUS_SOLIC[n.status].tone} dot>{STATUS_SOLIC[n.status].label}</Badge></td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end">
                              {n.status === 'enviada' && <Button size="sm" icon="Check" onClick={() => { aprovarNota(n.id, user.id); toast('Nota aprovada. Encaminhada ao Financeiro.') }}>Aprovar</Button>}
                              {(n.status === 'aprovada' || n.status === 'pagamento') && <Button size="sm" variant="soft" icon="Wallet" onClick={() => { pagarNota(n.id); toast('Pagamento registrado! Status: paga.') }}>Registrar pagamento</Button>}
                              {n.status === 'paga' && <span className="text-[12px] text-success font-semibold flex items-center gap-1"><Icon name="BadgeCheck" className="h-4 w-4" />Paga {fmtDate(n.pagaEm)}</span>}
                              {n.status === 'aguardando' && <span className="text-[12px] text-muted">Aguardando envio</span>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === 'engajamento' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon="Trophy" tone="brand" value={pontosTotais.toLocaleString('pt-BR')} label="Pontos distribuídos" />
            <StatCard icon="Target" tone="success" value={s.tarefas.filter((t) => t.status === 'concluida').length} label="Tarefas concluídas" />
            <StatCard icon="Clock" tone="warning" value={s.tarefas.filter((t) => t.status === 'aprovacao').length} label="Tarefas p/ aprovar" />
            <StatCard icon="Flame" tone="danger" value={Math.max(...s.colaboradores.map((c) => c.streak))} label="Maior streak (dias)" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHead title="Top engajamento 🏆" sub="Colaboradores com mais pontos" />
              <div className="p-3">
                {rankTop.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 p-2.5">
                    <span className="w-6 text-center text-[14px] font-extrabold text-muted">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
                    <Avatar nome={c.nome} cor={c.avatarCor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink truncate">{c.nome}</div>
                      <div className="text-[11.5px] text-muted">Nível {nivelInfo(c.pontos).nivel} · {s.setorNome(c.setorId)}</div>
                    </div>
                    <span className="text-[13.5px] font-bold text-ink">{c.pontos.toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHead title="Tarefas por status" sub="Quadro de gamificação" />
              <div className="p-5 space-y-3">
                {(['disponivel', 'andamento', 'aprovacao', 'concluida'] as const).map((st) => {
                  const qtd = s.tarefas.filter((t) => t.status === st).length
                  const totalT = s.tarefas.length || 1
                  return (
                    <div key={st}>
                      <div className="flex items-center justify-between mb-1.5 text-[13px]">
                        <span className="font-semibold text-ink">{st === 'disponivel' ? 'Disponíveis' : st === 'andamento' ? 'Em andamento' : st === 'aprovacao' ? 'Aguardando aprovação' : 'Concluídas'}</span>
                        <span className="font-bold text-muted">{qtd}</span>
                      </div>
                      <Progress value={(qtd / totalT) * 100} />
                    </div>
                  )
                })}
                <div className="pt-2">
                  <Button variant="ghost" icon="Trophy" onClick={() => toast('Abra a aba Gamificação para gerenciar as tarefas.')} className="w-full">Ir para o quadro de tarefas</Button>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
