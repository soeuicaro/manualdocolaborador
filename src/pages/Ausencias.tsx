import { useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, CardHead, StatCard, Badge, Button, Field, Icon, EmptyState, Avatar } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { toast } from '@/components/toast'
import { fmtDate, STATUS_SOLIC, cn } from '@/lib/utils'

export default function Ausencias({ tipo }: { tipo: 'recesso' | 'folga' }) {
  const s = useStore()
  const user = s.currentUser()
  const add = useStore((x) => x.addAusencia)
  const [open, setOpen] = useState(false)

  const isRecesso = tipo === 'recesso'
  const titulo = isRecesso ? 'Central de Recesso' : 'Central de Folgas'
  const subtitle = isRecesso ? 'Solicite e acompanhe seus períodos de recesso.' : 'Solicite folgas e veja o calendário da equipe.'

  const minhas = s.ausencias.filter((a) => a.colaboradorId === user.id && a.tipo === tipo)
  const equipe = s.ausencias.filter((a) => a.tipo === tipo && a.status === 'aprovado')
  const diasDisponiveis = isRecesso ? 30 : 5
  const usados = minhas.filter((a) => a.status === 'aprovado').reduce((n, a) => n + a.dias, 0)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    if (!d.inicio || !d.fim) { toast('Informe início e fim.', 'danger'); return }
    const dias = Math.max(1, Math.round((+new Date(d.fim) - +new Date(d.inicio)) / 86400000) + 1)
    add({ colaboradorId: user.id, tipo, inicio: d.inicio, fim: d.fim, dias, motivo: d.motivo })
    setOpen(false)
    toast(`Solicitação de ${isRecesso ? 'recesso' : 'folga'} enviada!`)
  }

  return (
    <>
      <PageHeader title={titulo} subtitle={subtitle}
        actions={<Button icon="Plus" onClick={() => setOpen(true)}>Solicitar {isRecesso ? 'recesso' : 'folga'}</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={isRecesso ? 'Palmtree' : 'CalendarDays'} tone="brand" value={diasDisponiveis - usados} label="Dias disponíveis" />
        <StatCard icon="CalendarCheck" tone="success" value={usados} label="Dias utilizados" />
        <StatCard icon="Clock" tone="warning" value={minhas.filter((a) => a.status === 'pendente').length} label="Aguardando aprovação" />
        <StatCard icon="Users" tone="ink" value={equipe.length} label="Na equipe (aprovados)" />
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Minhas solicitações */}
        <Card>
          <CardHead title={`Minhas solicitações`} />
          {minhas.length === 0 ? (
            <EmptyState icon="CalendarX2" title="Nenhuma solicitação" desc={`Você ainda não solicitou ${isRecesso ? 'recesso' : 'folga'}.`} action={<Button icon="Plus" onClick={() => setOpen(true)}>Solicitar</Button>} />
          ) : (
            <div className="divide-y divide-line">
              {minhas.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-4">
                  <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center shrink-0"><Icon name={isRecesso ? 'Palmtree' : 'CalendarDays'} className="h-[18px] w-[18px]" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink">{fmtDate(a.inicio)} → {fmtDate(a.fim)}</div>
                    <div className="text-[12px] text-muted">{a.dias} dia(s){a.motivo ? ` · ${a.motivo}` : ''}</div>
                  </div>
                  <Badge tone={STATUS_SOLIC[a.status].tone} dot>{STATUS_SOLIC[a.status].label}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Calendário da equipe */}
        <Card>
          <CardHead title="Calendário da equipe" sub="Quem está fora" />
          <div className="p-4 space-y-2">
            {equipe.length === 0 && <p className="text-[13px] text-muted p-2">Ninguém {isRecesso ? 'em recesso' : 'de folga'} no momento.</p>}
            {equipe.map((a) => {
              const c = s.colaboradores.find((x) => x.id === a.colaboradorId)
              if (!c) return null
              return (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-line">
                  <Avatar nome={c.nome} cor={c.avatarCor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink truncate">{c.nome}</div>
                    <div className="text-[12px] text-muted">{fmtDate(a.inicio)} → {fmtDate(a.fim)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Regras */}
      <Card className="p-5 mt-6 bg-brand-50 border-brand-100 flex gap-3">
        <Icon name="Info" className="h-5 w-5 text-brand shrink-0" />
        <p className="text-[13px] text-brand-700 leading-relaxed">
          {isRecesso
            ? 'Recesso: até 30 dias por período de 12 meses, solicitado com no mínimo 15 dias de antecedência e sujeito à aprovação do gestor.'
            : 'Folgas: até 5 dias por ano, solicitadas com antecedência e sujeitas à disponibilidade da equipe e aprovação do gestor.'}
        </p>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`Solicitar ${isRecesso ? 'recesso' : 'folga'}`} subtitle="Sujeito à aprovação do gestor."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button icon="Send" type="submit" form="ausForm">Enviar solicitação</Button></>}>
        <form id="ausForm" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Início" required><input name="inicio" type="date" className="input" defaultValue="2026-08-01" /></Field>
            <Field label="Fim" required><input name="fim" type="date" className="input" defaultValue={isRecesso ? '2026-08-15' : '2026-08-01'} /></Field>
          </div>
          <Field label="Motivo (opcional)"><input name="motivo" className="input" placeholder="Ex.: descanso, compromisso pessoal..." /></Field>
        </form>
      </Modal>
    </>
  )
}
