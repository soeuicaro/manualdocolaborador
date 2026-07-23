import { useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, Badge, Icon, Button, Tabs } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { fmtDate, cn } from '@/lib/utils'
import type { Comunicado } from '@/lib/types'

const CATS = ['Todos', 'Geral', 'Financeiro', 'Políticas', 'Eventos', 'Novidades']

export default function Comunicados() {
  const s = useStore()
  const marcarLido = useStore((x) => x.marcarLido)
  const [cat, setCat] = useState('Todos')
  const [aberto, setAberto] = useState<Comunicado | null>(null)

  const lista = [...s.comunicados]
    .sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || +new Date(b.data) - +new Date(a.data))
    .filter((m) => cat === 'Todos' || m.categoria === cat)

  const open = (m: Comunicado) => { setAberto(m); marcarLido(m.id) }
  const lido = (m: Comunicado) => m.lidoPor.includes(s.currentUserId)

  return (
    <>
      <PageHeader title="Central de Comunicados" subtitle="Avisos, novidades e comunicados oficiais da 4JURIS." />
      <Tabs tabs={CATS.map((c) => ({ key: c, label: c }))} active={cat} onChange={setCat} />

      <div className="grid md:grid-cols-2 gap-4">
        {lista.map((m) => (
          <Card key={m.id} className={cn('p-5 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition', !lido(m) && 'ring-1 ring-brand-100')} >
            <div onClick={() => open(m)}>
              <div className="flex items-center gap-2 mb-2.5">
                {m.fixado && <Badge tone="brand" dot>Fixado</Badge>}
                <Badge tone="neutral">{m.categoria}</Badge>
                {!lido(m) && <span className="ml-auto h-2 w-2 rounded-full bg-brand" />}
              </div>
              <h3 className="text-[15.5px] font-bold text-ink leading-snug">{m.titulo}</h3>
              <p className="text-[13px] text-muted mt-1.5 line-clamp-2">{m.resumo}</p>
              <div className="flex items-center gap-2 mt-4 text-[12px] text-muted">
                <Icon name="User" className="h-3.5 w-3.5" />{m.autor}<span>·</span>{fmtDate(m.data)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!aberto} onClose={() => setAberto(null)} wide
        title={aberto?.titulo}
        subtitle={aberto ? `${aberto.autor} · ${fmtDate(aberto.data)}` : ''}
        footer={<Button onClick={() => setAberto(null)}>Fechar</Button>}>
        {aberto && (
          <div>
            <Badge tone="neutral" className="mb-4">{aberto.categoria}</Badge>
            <p className="text-[14.5px] text-ink-2 leading-relaxed whitespace-pre-line">{aberto.corpo}</p>
            <div className="mt-6 flex items-center gap-2 text-[12.5px] text-success bg-success-soft rounded-xl px-3.5 py-2.5">
              <Icon name="CheckCircle2" className="h-4 w-4" /> Leitura confirmada.
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
