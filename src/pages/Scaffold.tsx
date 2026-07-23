import { PageHeader, Card, Icon, Badge } from '@/components/ui'
import { flatNav } from '@/lib/nav'
import { useLocation } from 'react-router-dom'
import { Check } from 'lucide-react'

/* Recursos planejados por módulo (do escopo do projeto).
   Cada scaffold mostra o roadmap do módulo de forma organizada. */
export const FEATURES: Record<string, string[]> = {
  '/manual': [
    'Cultura da empresa', 'Missão, visão e valores', 'Código de conduta',
    'Dress code / vestimentas', 'Política de comunicação', 'Uso do WhatsApp e e-mail',
    'Horários e reuniões', 'Regras internas', 'Boas práticas',
  ],
  '/faq': [
    'Como emitir nota fiscal?', 'Como pedir reembolso?', 'Como pedir recesso?',
    'Como pedir folga?', 'Quando recebo?', 'Quem devo procurar?',
    'Dúvidas sobre políticas', 'Busca por palavras-chave',
  ],
  '/assistente': [
    'Responder dúvidas sobre políticas', 'Explicar processos', 'Orientar sobre emissão de NF',
    'Orientar sobre reembolso', 'Buscar informações no manual', 'Encaminhar questões complexas ao RH',
  ],
  '/treinamentos': [
    'Cursos e trilhas de aprendizagem', 'Treinamentos obrigatórios', 'Progresso do colaborador',
    'Certificados', 'Materiais de estudo',
  ],
  '/feedback': [
    'Pesquisa de clima', 'NPS interno', 'Pesquisa de satisfação',
    'Feedback de eventos', 'Canal anônimo de sugestões', 'Pesquisa de onboarding',
  ],
  '/onboarding': [
    'Checklist de entrada', 'Documentação', 'Apresentação da empresa',
    'Manual inicial e treinamentos', 'Conhecer a equipe', 'Acessos necessários',
    'Check-ins de 30, 60 e 90 dias',
  ],
  '/offboarding': [
    'Checklist de saída', 'Devolução de equipamentos', 'Encerramento de acessos',
    'Documentação', 'Pesquisa de desligamento', 'Entrevista de saída',
  ],
  '/gestor': [
    'Visualizar equipe', 'Aprovar reembolsos, folgas e recessos', 'Acompanhar pendências',
    'Acompanhar desempenho', 'Reconhecer colaboradores',
  ],
  '/rh': [
    'Número de colaboradores', 'Entradas e saídas', 'Reembolsos, folgas e recessos',
    'Engajamento e pesquisas de clima', 'Gamificação', 'Indicadores de RH',
  ],
  '/admin': [
    'Gerenciar colaboradores e permissões', 'Criar políticas', 'Publicar comunicados',
    'Configurar regras', 'Gerenciar benefícios', 'Categorias de reembolso',
    'Gerenciar gamificação', 'Gerenciar documentos',
  ],
  '/seguranca': [
    'Acessos por papel (colaborador, gestor, RH, diretoria)', 'Controle de permissões',
    'Histórico de ações', 'Proteção de dados (LGPD)',
  ],
}

export function ModuleScaffold() {
  const { pathname } = useLocation()
  const item = flatNav().find((i) => i.to === pathname)
  const feats = FEATURES[pathname] ?? []

  return (
    <>
      <PageHeader title={item?.label ?? 'Módulo'} subtitle={item?.desc} actions={<Badge tone="gold" dot>Em construção</Badge>} />

      <Card className="p-8 mb-6 relative overflow-hidden bg-gradient-to-br from-brand-50 to-surface">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand/5" />
        <div className="relative flex items-start gap-4 max-w-2xl">
          <div className="h-14 w-14 rounded-2xl bg-brand text-white flex items-center justify-center shrink-0 shadow-brand">
            <Icon name={item?.icon ?? 'Circle'} className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-ink">{item?.label}</h3>
            <p className="text-[14px] text-ink-2 mt-1.5 leading-relaxed">
              Este módulo faz parte da plataforma e já está previsto na arquitetura. Abaixo, os recursos planejados —
              prontos para serem construídos e conectados ao backend.
            </p>
          </div>
        </div>
      </Card>

      {feats.length > 0 && (
        <Card className="p-6">
          <h4 className="text-[13px] font-bold uppercase tracking-wide text-muted mb-4">Recursos planejados</h4>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
            {feats.map((f) => (
              <div key={f} className="flex items-center gap-3 py-2.5 border-b border-line last:border-0 sm:[&:nth-last-child(2)]:border-0">
                <span className="h-6 w-6 rounded-full bg-brand-100 text-brand flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-[13.5px] text-ink-2">{f}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
