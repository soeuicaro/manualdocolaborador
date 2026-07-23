import { useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, Badge, Icon, Button, Tabs } from '@/components/ui'
import { Modal } from '@/components/Modal'
import type { Beneficio } from '@/lib/types'

const CATS = ['Todos', 'Bem-estar', 'Saúde', 'Educação', 'Desconto', 'Financeiro']

export default function Beneficios() {
  const beneficios = useStore((s) => s.beneficios)
  const [cat, setCat] = useState('Todos')
  const [sel, setSel] = useState<Beneficio | null>(null)
  const lista = beneficios.filter((b) => cat === 'Todos' || b.categoria === cat)

  return (
    <>
      <PageHeader title="Benefícios e Vantagens" subtitle="Tudo o que a 4JURIS oferece para o seu bem-estar." />
      <Tabs tabs={CATS.map((c) => ({ key: c, label: c }))} active={cat} onChange={setCat} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lista.map((b) => (
          <Card key={b.id} className="p-5 hover:shadow-sm hover:-translate-y-0.5 transition cursor-pointer flex flex-col" >
            <div onClick={() => setSel(b)} className="flex flex-col h-full">
              <div className="flex items-start justify-between">
                <span className="h-12 w-12 rounded-xl bg-brand-50 text-brand flex items-center justify-center"><Icon name={b.icon} className="h-6 w-6" /></span>
                <Badge tone="neutral">{b.categoria}</Badge>
              </div>
              <h3 className="text-[16px] font-bold text-ink mt-4">{b.nome}</h3>
              <p className="text-[13px] text-muted mt-1.5 leading-relaxed flex-1">{b.descricao}</p>
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-brand mt-4">Como utilizar <Icon name="ArrowRight" className="h-4 w-4" /></div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.nome} subtitle={sel?.categoria}
        footer={<Button onClick={() => setSel(null)}>Fechar</Button>}>
        {sel && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="h-14 w-14 rounded-2xl bg-brand text-white flex items-center justify-center shadow-brand"><Icon name={sel.icon} className="h-7 w-7" /></span>
              <p className="text-[14px] text-ink-2">{sel.descricao}</p>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Como utilizar</div>
              <p className="text-[13.5px] text-ink-2 leading-relaxed">{sel.comoUsar}</p>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Elegibilidade</div>
              <p className="text-[13.5px] text-ink-2 leading-relaxed">{sel.elegibilidade}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
