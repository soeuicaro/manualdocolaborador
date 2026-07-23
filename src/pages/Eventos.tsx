import { useStore } from '@/lib/store'
import { PageHeader, Card, CardHead, Badge, Button, Icon, Avatar } from '@/components/ui'
import { toast } from '@/components/toast'
import { fmtDateTime, cn } from '@/lib/utils'

const TIPO_TONE: Record<string, string> = {
  'Treinamento': 'brand', 'Happy Hour': 'gold', 'Aniversário': 'success', 'Reunião': 'neutral', 'Data comemorativa': 'warning',
}

export default function Eventos() {
  const s = useStore()
  const eventos = [...s.eventos].sort((a, b) => +new Date(a.data) - +new Date(b.data))
  const toggle = useStore((x) => x.toggleInscricao)
  const uid = s.currentUserId

  return (
    <>
      <PageHeader title="Eventos & Calendário" subtitle="Treinamentos, happy hours, aniversários e datas da empresa." />

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
                <div className="flex items-center gap-3 mt-2.5 text-[12px] text-muted">
                  <span className="flex items-center gap-1"><Icon name="Clock" className="h-3.5 w-3.5" />{fmtDateTime(e.data)}</span>
                  <span className="flex items-center gap-1"><Icon name="MapPin" className="h-3.5 w-3.5" />{e.local}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex -space-x-2">
                    {e.inscritos.slice(0, 4).map((id) => { const c = s.colaboradores.find((x) => x.id === id); return c ? <Avatar key={id} nome={c.nome} cor={c.avatarCor} size="sm" className="ring-2 ring-surface" /> : null })}
                    {e.inscritos.length === 0 && <span className="text-[12px] text-muted">Seja o primeiro a confirmar</span>}
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
    </>
  )
}
