import { clsx, type ClassValue } from 'clsx'

/** Merge condicional de classes (tailwind-friendly). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}

export const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const brl = (v: number) => BRL.format(v || 0)

export function fmtDate(iso?: string, opts?: Intl.DateTimeFormatOptions) {
  if (!iso) return '—'
  const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso)
  return d.toLocaleDateString('pt-BR', opts ?? { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateTime(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function relTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`
  if (diff < 172800) return 'ontem'
  return fmtDate(iso)
}

export function initials(nome = '') {
  const p = nome.trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}

export function firstName(nome = '') {
  return nome.trim().split(/\s+/)[0]
}

export function tempoCasa(iso?: string) {
  if (!iso) return '—'
  const m = Math.max(0, Math.round((Date.now() - new Date(iso + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
  const y = Math.floor(m / 12), r = m % 12
  if (y === 0) return `${m} ${m === 1 ? 'mês' : 'meses'}`
  return `${y} ${y === 1 ? 'ano' : 'anos'}${r ? ` e ${r} ${r === 1 ? 'mês' : 'meses'}` : ''}`
}

/** Nível de gamificação: cada nível exige +500 pontos acumulados. */
export function nivelInfo(pontos: number) {
  const base = 500
  const nivel = Math.floor(pontos / base) + 1
  const pontosNoNivel = pontos % base
  const proximo = base
  return { nivel, pontosNoNivel, proximo, progresso: Math.round((pontosNoNivel / proximo) * 100) }
}

export const STATUS_COLAB: Record<string, { label: string; tone: string }> = {
  ativo: { label: 'Ativo', tone: 'success' },
  ferias: { label: 'Em férias', tone: 'warning' },
  recesso: { label: 'Em recesso', tone: 'warning' },
  pendente: { label: 'Pendente', tone: 'brand' },
  inativo: { label: 'Inativo', tone: 'neutral' },
}

export const STATUS_SOLIC: Record<string, { label: string; tone: string }> = {
  pendente: { label: 'Pendente', tone: 'warning' },
  aprovado: { label: 'Aprovado', tone: 'success' },
  recusado: { label: 'Recusado', tone: 'danger' },
  pago: { label: 'Pago', tone: 'brand' },
  aguardando: { label: 'Aguardando envio', tone: 'neutral' },
  enviada: { label: 'Enviada', tone: 'brand' },
  aprovada: { label: 'Aprovada', tone: 'success' },
  pagamento: { label: 'Aguardando pagamento', tone: 'warning' },
  paga: { label: 'Paga', tone: 'brand' },
  atrasada: { label: 'Atrasada', tone: 'danger' },
}

/** Etapas da NF em ordem, para Kanban e progresso. */
export const NF_ETAPAS: { key: string; titulo: string; icon: string; tone: string }[] = [
  { key: 'aguardando', titulo: 'Falta enviar', icon: 'FileClock', tone: 'neutral' },
  { key: 'enviada', titulo: 'Enviadas', icon: 'Send', tone: 'brand' },
  { key: 'aprovada', titulo: 'Aprovadas', icon: 'FileCheck2', tone: 'success' },
  { key: 'pagamento', titulo: 'Aguardando pagamento', icon: 'Landmark', tone: 'warning' },
  { key: 'paga', titulo: 'Pagas', icon: 'BadgeCheck', tone: 'brand' },
]

/** Etapas de reembolso em ordem, para Kanban e gestão. */
export const REEMBOLSO_ETAPAS: { key: string; titulo: string; icon: string; tone: string }[] = [
  { key: 'pendente', titulo: 'Pendentes', icon: 'Clock', tone: 'warning' },
  { key: 'aprovado', titulo: 'Aprovados', icon: 'CheckCircle2', tone: 'success' },
  { key: 'pagamento', titulo: 'Aguardando pagamento', icon: 'Landmark', tone: 'warning' },
  { key: 'pago', titulo: 'Pagos', icon: 'BadgeCheck', tone: 'brand' },
  { key: 'recusado', titulo: 'Recusados', icon: 'XCircle', tone: 'danger' },
]

/** Status de tarefas de gamificação (Kanban). */
export const STATUS_TAREFA: Record<string, { label: string; tone: string }> = {
  disponivel: { label: 'Disponível', tone: 'neutral' },
  andamento: { label: 'Em andamento', tone: 'brand' },
  aprovacao: { label: 'Aguardando aprovação', tone: 'warning' },
  concluida: { label: 'Concluída', tone: 'success' },
}

export const REGIME_LABEL: Record<string, string> = {
  PJ: 'Pessoa Jurídica (PJ)',
  CLT: 'CLT',
  autonomo: 'Autônomo',
}

interface SetorLike { id: string; liderancaIds: string[]; reembolsoApenasLideranca: boolean }
interface ColabLike { id: string; setorId: string; papel: string }

/** É liderança do próprio setor (ou papel de gestão global)? */
export function isLideranca(user: ColabLike, setores: SetorLike[]): boolean {
  if (['gestor', 'rh', 'admin', 'diretoria'].includes(user.papel)) return true
  const setor = setores.find((s) => s.id === user.setorId)
  return !!setor?.liderancaIds.includes(user.id)
}

/** Pode ver/solicitar reembolsos? Respeita a restrição do setor. */
export function podeVerReembolsos(user: ColabLike, setores: SetorLike[]): boolean {
  if (['rh', 'admin', 'diretoria'].includes(user.papel)) return true
  const setor = setores.find((s) => s.id === user.setorId)
  if (!setor?.reembolsoApenasLideranca) return true
  return isLideranca(user, setores)
}

/** No modo "ver como colaborador" (preview), a pessoa é tratada como colaborador comum,
    perdendo os privilégios de liderança do setor. */
export function ehLideranca(user: ColabLike, setores: SetorLike[], preview: boolean): boolean {
  return !preview && isLideranca(user, setores)
}
export function podeVerReembolsosView(user: ColabLike, setores: SetorLike[], preview: boolean): boolean {
  if (!preview) return podeVerReembolsos(user, setores)
  const setor = setores.find((s) => s.id === user.setorId)
  return !setor?.reembolsoApenasLideranca
}
