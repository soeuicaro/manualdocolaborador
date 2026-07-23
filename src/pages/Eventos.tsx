import { useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, Badge, Button, Icon, Avatar, Field } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { toast } from '@/components/toast'
import { fmtDateTime } from '@/lib/utils'
import type { Evento } from '@/lib/types'

const TIPO_TONE: Record<string, string> = {
  'Treinamento': 'brand', 'Happy Hour': 'gold', 'Aniversário': 'success', 'Reunião': 'neutral', 'Data comemorativa': 'warning',
}
const TIPOS: Evento['tipo'][] = ['Treinamento', 'Happy Hour', 'Aniversário', 'Reunião', 'Data comemorativa']
const GESTAO = ['gestor', 'rh', 'admin', 'diretoria']

export default function Eventos() {
  const s = useStore()
  const user = s.currentUser()
  const eventos = [...s.eventos].sort((a, b) => +new Date(a.data) - +new Date(b.data))
  const toggle = useStore((x) => x.toggleInscricao)
  const addEvento = useStore((x) => x.addEvento)
  const uid = s.currentUserId
  const isGestao = GESTAO.includes(user.papel)
  const [criar, setCriar] = useState(false)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    if (!d.titulo || !d.data || !d.hora) { toast('Preencha título, data e horário.', 'danger'); return }
    addEvento({
      titulo: d.titulo, descricao: d.descricao ?? '', tipo: d.tipo as Evento['tipo'],
      data: `${d.data}T${d.hora}:00`, local: d.local || 'A definir',
    })
    setCriar(false)
    toast('Evento criado e publicado na agenda! 🎉')
  }

  return (
    <>
      <PageHeader title="Eventos & Calendário" subtitle="Treinamentos, happy hours, aniversários e datas da empresa."
        actions={isGestao && <Button icon="Plus" onClick={() => setCriar(true)}>Criar evento</Button>} />

      <div className="grid lg:grid-cols-2 gap-4">
        {eventos.map((e) => {
          const inscrito = e.inscritos.includes(uid)
          const d = new Date(e.data)
          return (
            <Card key={e.id} className="p-5 flex gap-4">
              <div className="h-16 w-16 rounded-2xl bg-ink text-white flex flex-col items-center justify-center shrink-0 leading-none">
                <span className="text-[22px] font-extrabold">{d.getDate()}</span>
                <span className="text-[10px] font-bold uppercase mt-0.5">{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1"><Badge tone={TIPO_TONE[e.tipo]}>{e.tipo}</Badge></div>
                <h3 className="text-[15.5px] font-bold text-ink">{e.titulo}</h3>
                <p className="text-[13px] text-muted mt-1 line-clamp-2">{e.descricao}</p>
                <div className="flex items-center gap-3 mt-2.5 text-[12px] text-muted flex-wrap">
                  <span className="flex items-center gap-1"><Icon name="Clock" className="h-3.5 w-3.5" />{fmtDateTime(e.data)}</span>
                  <span className="flex items-center gap-1"><Icon name="MapPin" className="h-3.5 w-3.5" />{e.local}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex -space-x-2">
                    {e.inscritos.slice(0, 4).map((id) => { const c = s.colaboradores.find((x) => x.id === id); return c ? <Avatar key={id} nome={c.nome} cor={c.avatarCor} size="sm" className="ring-2 ring-surface" /> : null })}
                    {e.inscritos.length === 0 && <span className="text-[12px] text-muted">Seja o primeiro a confirmar</span>}
                    {e.inscritos.length > 4 && <span className="h-8 w-8 rounded-full bg-winter text-ink-2 text-[11px] font-bold flex items-center justify-center ring-2 ring-surface">+{e.inscritos.length - 4}</span>}
                  </div>
                  <Button size="sm" variant={inscrito ? 'soft' : 'primary'} icon={inscrito ? 'Check' : 'Plus'}
                    onClick={() => { toggle(e.id); toast(inscrito ? 'Inscrição cancelada.' : 'Presença confirmada! 🎉') }}>
                    {inscrito ? 'Inscrito' : 'Participar'}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Modal criar evento */}
      <Modal open={criar} onClose={() => setCriar(false)} title="Criar evento" subtitle="Publique um novo evento na agenda da empresa."
        footer={<><Button variant="ghost" onClick={() => setCriar(false)}>Cancelar</Button><Button icon="Check" type="submit" form="evtForm">Publicar evento</Button></>}>
        <form id="evtForm" onSubmit={submit}>
          <Field label="Título do evento" required><input name="titulo" className="input" placeholder="Ex.: Town Hall Trimestral" /></Field>
          <Field label="Descrição"><textarea name="descricao" className="input !h-auto py-2.5" rows={3} placeholder="Sobre o que é o evento..." /></Field>
          <Field label="Tipo">
            <select name="tipo" className="input" defaultValue="Reunião">
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Data" required><input name="data" type="date" className="input" defaultValue="2026-07-25" /></Field>
            <Field label="Horário" required><input name="hora" type="time" className="input" defaultValue="18:00" /></Field>
          </div>
          <Field label="Local"><input name="local" className="input" placeholder="Ex.: Auditório + Online" /></Field>
        </form>
      </Modal>
    </>
  )
}
