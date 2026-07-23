import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, CardHead, StatCard, Badge, Button, Avatar, Icon, Tabs, EmptyState, Field } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { toast } from '@/components/toast'
import { brl, fmtDate, STATUS_COLAB, nivelInfo } from '@/lib/utils'

const VE_TUDO = ['rh', 'admin', 'diretoria']

export default function Gestor() {
  const s = useStore()
  const user = s.currentUser()
  const setReemb = useStore((x) => x.setReembolsoStatus)
  const setAus = useStore((x) => x.setAusenciaStatus)
  const aprovarTarefa = useStore((x) => x.aprovarTarefa)
  const recusarTarefa = useStore((x) => x.recusarTarefa)
  const addPontos = useStore((x) => x.addPontos)

  const veTudo = VE_TUDO.includes(user.papel)

  // Setores sob gestão do usuário
  const meusSetores = useMemo(
    () => s.setores.filter((se) => veTudo || se.gestorId === user.id || se.liderancaIds.includes(user.id)),
    [s.setores, user.id, veTudo],
  )
  const setorIds = new Set(meusSetores.map((se) => se.id))
  const equipe = s.colaboradores.filter((c) => (veTudo || setorIds.has(c.setorId)) && c.id !== user.id)
  const equipeIds = new Set(equipe.map((c) => c.id))

  const reembPend = s.reembolsos.filter((r) => r.status === 'pendente' && equipeIds.has(r.colaboradorId))
  const ausPend = s.ausencias.filter((a) => a.status === 'pendente' && equipeIds.has(a.colaboradorId))
  const tarefasAprov = s.tarefas.filter((t) => t.status === 'aprovacao' && (veTudo || (t.responsavelId && equipeIds.has(t.responsavelId))))

  const [tab, setTab] = useState('pendencias')
  const [reconhecer, setReconhecer] = useState<string | null>(null)

  const nomeDe = (id?: string | null) => s.colaboradores.find((c) => c.id === id)?.nome ?? '—'
  const totalPend = reembPend.length + ausPend.length + tarefasAprov.length

  const darReconhecimento = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const pts = parseInt(d.pontos) || 0
    if (!reconhecer || pts <= 0) { toast('Informe uma pontuação válida.', 'danger'); return }
    addPontos(reconhecer, pts)
    toast(`+${pts} pts para ${nomeDe(reconhecer)}! 🌟`)
    setReconhecer(null)
  }

  return (
    <>
      <PageHeader title="Central do Gestor" subtitle="Acompanhe sua equipe, aprove solicitações e reconheça talentos." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="Users" tone="brand" value={equipe.length} label="Pessoas na equipe" />
        <StatCard icon="ReceiptText" tone="warning" value={reembPend.length} label="Reembolsos a aprovar" />
        <StatCard icon="CalendarDays" tone="warning" value={ausPend.length} label="Folgas / recessos a aprovar" />
        <StatCard icon="Target" tone="success" value={tarefasAprov.length} label="Tarefas a validar" />
      </div>

      <Tabs tabs={[{ key: 'pendencias', label: `Pendências${totalPend ? ` (${totalPend})` : ''}` }, { key: 'equipe', label: 'Minha equipe' }]} active={tab} onChange={setTab} />

      {tab === 'pendencias' && (
        <div className="space-y-6">
          {totalPend === 0 && (
            <Card><EmptyState icon="CheckCircle2" title="Tudo em dia! 🎉" desc="Não há solicitações pendentes da sua equipe no momento." /></Card>
          )}

          {/* Reembolsos */}
          {reembPend.length > 0 && (
            <Card>
              <CardHead title="Reembolsos a aprovar" sub={`${reembPend.length} solicitação(ões)`} />
              <div className="divide-y divide-line">
                {reembPend.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 p-4">
                    <Avatar nome={nomeDe(r.colaboradorId)} cor={s.colaboradores.find((c) => c.id === r.colaboradorId)?.avatarCor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold text-ink">{r.descricao}</div>
                      <div className="text-[12px] text-muted">{nomeDe(r.colaboradorId)} · {r.categoria} · {fmtDate(r.data)}</div>
                    </div>
                    <span className="text-[14px] font-bold text-ink">{brl(r.valor)}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setReemb(r.id, 'recusado'); toast('Reembolso recusado.', 'info') }}>Recusar</Button>
                      <Button size="sm" icon="Check" onClick={() => { setReemb(r.id, 'aprovado'); toast('Reembolso aprovado.') }}>Aprovar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Ausências */}
          {ausPend.length > 0 && (
            <Card>
              <CardHead title="Folgas & recessos a aprovar" sub={`${ausPend.length} solicitação(ões)`} />
              <div className="divide-y divide-line">
                {ausPend.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 p-4">
                    <Avatar nome={nomeDe(a.colaboradorId)} cor={s.colaboradores.find((c) => c.id === a.colaboradorId)?.avatarCor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold text-ink capitalize">{a.tipo} · {a.dias} dia(s)</div>
                      <div className="text-[12px] text-muted">{nomeDe(a.colaboradorId)} · {fmtDate(a.inicio)} → {fmtDate(a.fim)}{a.motivo ? ` · ${a.motivo}` : ''}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setAus(a.id, 'recusado'); toast('Solicitação recusada.', 'info') }}>Recusar</Button>
                      <Button size="sm" icon="Check" onClick={() => { setAus(a.id, 'aprovado'); toast('Solicitação aprovada.') }}>Aprovar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tarefas */}
          {tarefasAprov.length > 0 && (
            <Card>
              <CardHead title="Tarefas a validar" sub="Confira a prova e conceda os pontos" />
              <div className="divide-y divide-line">
                {tarefasAprov.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 p-4">
                    <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center shrink-0"><Icon name="Target" className="h-5 w-5" /></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold text-ink">{t.titulo}</div>
                      <div className="text-[12px] text-muted flex items-center gap-2 flex-wrap">
                        <span>{nomeDe(t.responsavelId)}</span>
                        {t.prova && <span className="inline-flex items-center gap-1 text-brand"><Icon name="Paperclip" className="h-3.5 w-3.5" />{t.prova}</span>}
                      </div>
                    </div>
                    <span className="text-[13px] font-extrabold text-brand shrink-0">+{t.pontos}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { recusarTarefa(t.id); toast('Devolvida para ajustes.', 'info') }}>Recusar</Button>
                      <Button size="sm" icon="Check" onClick={() => { aprovarTarefa(t.id, user.id); toast(`Aprovada! +${t.pontos} pts para ${nomeDe(t.responsavelId)}.`) }}>Aprovar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'equipe' && (
        <Card>
          {equipe.length === 0 ? (
            <EmptyState icon="Users" title="Nenhum colaborador na sua equipe" desc="Você ainda não gerencia colaboradores. Fale com o RH para ajustar setores e lideranças." />
          ) : (
            <div className="divide-y divide-line">
              {equipe.map((c) => {
                const nv = nivelInfo(c.pontos)
                const st = STATUS_COLAB[c.status]
                return (
                  <div key={c.id} className="flex items-center gap-4 p-4">
                    <Avatar nome={c.nome} cor={c.avatarCor} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-ink">{c.nome}</div>
                      <div className="text-[12px] text-muted">{s.cargoNome(c.cargoId)} · {s.setorNome(c.setorId)}</div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="text-[13px] font-bold text-ink">{c.pontos.toLocaleString('pt-BR')} pts</div>
                      <div className="text-[11.5px] text-muted">Nível {nv.nivel}</div>
                    </div>
                    <Badge tone={st.tone} dot>{st.label}</Badge>
                    <Button size="sm" variant="soft" icon="Star" onClick={() => setReconhecer(c.id)}>Reconhecer</Button>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Modal reconhecimento */}
      <Modal open={!!reconhecer} onClose={() => setReconhecer(null)} title="Reconhecer colaborador"
        subtitle={reconhecer ? `Conceda pontos de reconhecimento para ${nomeDe(reconhecer)}.` : ''}
        footer={<><Button variant="ghost" onClick={() => setReconhecer(null)}>Cancelar</Button><Button icon="Star" type="submit" form="reconForm">Conceder pontos</Button></>}>
        <form id="reconForm" onSubmit={darReconhecimento}>
          <Field label="Pontos" required hint="Reconheça uma boa entrega, atitude ou colaboração.">
            <input name="pontos" type="number" min={1} className="input" defaultValue={50} />
          </Field>
        </form>
      </Modal>
    </>
  )
}
