/* ============================================================
   4JURIS Pessoas · Configuração de navegação (23 módulos)
   ============================================================ */
import type { Papel } from './types'

export interface NavItem {
  to: string
  label: string
  icon: string // nome do ícone lucide
  desc: string
  papeis?: Papel[] // se ausente, todos veem
}
export interface NavGroup {
  title: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    title: 'Início',
    items: [
      { to: '/', label: 'Dashboard', icon: 'LayoutDashboard', desc: 'Seu resumo, pendências e avisos.' },
      { to: '/experiencia', label: 'Minha Experiência', icon: 'Sparkles', desc: 'Sua jornada, nível e conquistas.' },
    ],
  },
  {
    title: 'Meu espaço',
    items: [
      { to: '/perfil', label: 'Meu Perfil', icon: 'UserCircle', desc: 'Dados pessoais, bancários e NF.' },
      { to: '/reembolsos', label: 'Reembolsos', icon: 'ReceiptText', desc: 'Solicite e acompanhe reembolsos.' },
      { to: '/notas', label: 'Notas Fiscais', icon: 'FileText', desc: 'Emissão, envio e prazos de NF.' },
      { to: '/recesso', label: 'Recesso', icon: 'Palmtree', desc: 'Solicite e consulte recessos.' },
      { to: '/folgas', label: 'Folgas', icon: 'CalendarDays', desc: 'Solicite folgas e veja a equipe.' },
      { to: '/beneficios', label: 'Benefícios', icon: 'Gift', desc: 'Vantagens, descontos e parcerias.' },
    ],
  },
  {
    title: 'Conhecimento',
    items: [
      { to: '/manual', label: 'Manual do Colaborador', icon: 'BookOpen', desc: 'Cultura, conduta e regras internas.' },
      { to: '/faq', label: 'Central de Dúvidas', icon: 'HelpCircle', desc: 'Perguntas frequentes e busca.' },
      { to: '/assistente', label: 'Assistente de RH (IA)', icon: 'Bot', desc: 'Tire dúvidas com a IA da 4JURIS.' },
      { to: '/treinamentos', label: 'Treinamentos', icon: 'GraduationCap', desc: 'Cursos, trilhas e certificados.' },
    ],
  },
  {
    title: 'Comunidade',
    items: [
      { to: '/comunicados', label: 'Comunicados', icon: 'Megaphone', desc: 'Avisos e novidades da empresa.' },
      { to: '/eventos', label: 'Eventos & Calendário', icon: 'CalendarHeart', desc: 'Eventos, treinamentos e datas.' },
      { to: '/gamificacao', label: 'Gamificação', icon: 'Trophy', desc: 'Ranking, badges e desafios.' },
      { to: '/feedback', label: 'Feedback & Pesquisas', icon: 'MessagesSquare', desc: 'Clima, NPS e sugestões.' },
    ],
  },
  {
    title: 'Jornada',
    items: [
      { to: '/onboarding', label: 'Onboarding', icon: 'Rocket', desc: 'Checklist de entrada e check-ins.' },
      { to: '/offboarding', label: 'Offboarding', icon: 'DoorOpen', desc: 'Processo de desligamento.' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { to: '/gestor', label: 'Central do Gestor', icon: 'UserCog', desc: 'Aprove e acompanhe sua equipe.', papeis: ['gestor', 'rh', 'admin', 'diretoria'] },
      { to: '/rh', label: 'Dashboard do RH', icon: 'BarChart3', desc: 'Indicadores e engajamento.', papeis: ['rh', 'admin', 'diretoria'] },
      { to: '/admin', label: 'Painel Administrativo', icon: 'Settings2', desc: 'Colaboradores, políticas e regras.', papeis: ['admin', 'diretoria'] },
      { to: '/seguranca', label: 'Segurança & Permissões', icon: 'ShieldCheck', desc: 'Acessos e proteção de dados.', papeis: ['admin', 'diretoria'] },
    ],
  },
]

/** Rota extra fora da sidebar (acessível pelo sino). */
export const ROUTE_NOTIFICACOES = '/notificacoes'

export function flatNav(): NavItem[] {
  return NAV.flatMap((g) => g.items)
}
