import { useStore } from '@/lib/store'
import { PageHeader, Card, CardHead, StatCard, Badge, Button, Icon } from '@/components/ui'
import { toast } from '@/components/toast'
import { brl, fmtDate, STATUS_SOLIC } from '@/lib/utils'

const PASSOS = [
  'Acesse o portal do Emissor Nacional e faça login.',
  'Clique em "Nova NFS-e".',
  'Informe o tomador: 4JURIS MARKETING LTDA · CNPJ 46.937.316/0001-05.',
  'Preencha a descrição do serviço e o valor conforme contrato.',
  'Selecione a atividade econômica compatível (ex.: 73.19-0-03 — Marketing direto).',
  'Revise, emita e baixe o PDF.',
  'Anexe e envie a nota aqui pelo sistema.',
]

export default function Notas() {
  const user = useStore((s) => s.currentUser())
  const notas = useStore((s) => s.notas.filter((n) => n.colaboradorId === user.id))
  const enviar = useStore((s) => s.enviarNota)
  const atual = notas.find((n) => n.competencia === '2026-07')
  const historico = notas.filter((n) => n.competencia !== '2026-07')

  return (
    <>
      <PageHeader title="Central de Notas Fiscais" subtitle="Emita, envie e acompanhe suas NF-e para a 4JURIS."
        actions={<a href="https://www.nfse.gov.br/EmissorNacional" target="_blank" rel="noopener"><Button variant="ghost" icon="ExternalLink">Emissor Nacional</Button></a>} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon="CalendarClock" tone="warning" value="28/07" label="Prazo de envio · julho" />
        <StatCard icon="FileCheck2" tone="success" value={notas.filter((n) => n.status !== 'aguardando').length} label="Notas enviadas" />
        <StatCard icon="Wallet" tone="brand" value={brl(user.remuneracao)} label="Valor mensal" />
      </div>

      {/* NF do mês */}
      {atual && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="h-12 w-12 rounded-xl bg-brand-50 text-brand flex items-center justify-center"><Icon name="FileText" className="h-6 w-6" /></span>
              <div>
                <div className="text-[15px] font-bold text-ink">Nota fiscal · Julho / 2026</div>
                <div className="text-[13px] text-muted">{brl(atual.valor)} · prazo {fmtDate(atual.prazo)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={STATUS_SOLIC[atual.status].tone} dot>{STATUS_SOLIC[atual.status].label}</Badge>
              {atual.status === 'aguardando'
                ? <Button icon="Upload" onClick={() => { enviar(atual.id); toast('Nota fiscal enviada! 🎉') }}>Enviar NF</Button>
                : <Button variant="ghost" icon="Eye" onClick={() => toast('Visualização será conectada ao backend.')}>Ver nota</Button>}
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Tutorial */}
        <Card>
          <CardHead title="Como emitir sua NF-e" sub="Passo a passo" />
          <div className="p-6">
            <ol className="space-y-4">
              {PASSOS.map((p, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className="h-7 w-7 rounded-lg bg-brand text-white text-[12.5px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-[13.5px] text-ink-2 leading-relaxed pt-0.5">{p}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 bg-brand-50 border border-brand-100 rounded-xl p-4 flex gap-3">
              <Icon name="Info" className="h-5 w-5 text-brand shrink-0" />
              <p className="text-[13px] text-brand-700 leading-relaxed">Em caso de dúvida sobre a atividade econômica, consulte o Financeiro em <b>financeiro@4juris.com.br</b> antes de emitir.</p>
            </div>
          </div>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHead title="Histórico de notas" />
          <div className="divide-y divide-line">
            {historico.map((n) => (
              <div key={n.id} className="flex items-center gap-3 p-4">
                <span className="h-9 w-9 rounded-lg bg-winter text-ink flex items-center justify-center shrink-0"><Icon name="FileText" className="h-[17px] w-[17px]" /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-ink">{new Date(n.competencia + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
                  <div className="text-[12px] text-muted">{brl(n.valor)} · enviada {fmtDate(n.enviadaEm)}</div>
                </div>
                <Badge tone={STATUS_SOLIC[n.status].tone} dot>{STATUS_SOLIC[n.status].label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
