/* ============================================================
   4JURIS Pessoas · Modelo de domínio (TypeScript)
   ============================================================ */

export type Papel = 'colaborador' | 'gestor' | 'rh' | 'admin' | 'diretoria'

export type StatusColaborador = 'ativo' | 'ferias' | 'recesso' | 'pendente' | 'inativo'

export interface Colaborador {
  id: string
  nome: string
  email: string
  telefone: string
  avatarCor: string
  papel: Papel
  setorId: string
  cargoId: string
  status: StatusColaborador
  dataEntrada: string // ISO date
  nascimento: string // ISO date
  cidade: string
  uf: string
  // PJ
  razaoSocial: string
  cnpj: string
  remuneracao: number // mensal
  tipoContrato: 'mensalista' | 'por-projeto'
  // Bancário
  banco?: string
  agencia?: string
  conta?: string
  pixChave?: string
  // Emergência
  emergenciaNome?: string
  emergenciaTelefone?: string
  emergenciaParentesco?: string
  // Gamificação
  pontos: number
  nivel: number
  badges: string[] // ids de conquistas
  streak: number // dias seguidos de atividade
}

export interface Setor {
  id: string
  nome: string
  descricao: string
  cor: string
  icon: string
  gestorId: string | null
}

export interface Cargo {
  id: string
  nome: string
  setorId: string
  nivel: 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista' | 'Liderança'
}

export type StatusSolicitacao = 'pendente' | 'aprovado' | 'recusado' | 'pago'

export interface Reembolso {
  id: string
  colaboradorId: string
  categoria: string
  descricao: string
  valor: number
  data: string
  status: StatusSolicitacao
  comprovante?: string // nome do arquivo (mock)
  criadoEm: string
  aprovadorId?: string
}

export type StatusNota = 'aguardando' | 'enviada' | 'aprovada' | 'atrasada'

export interface NotaFiscal {
  id: string
  colaboradorId: string
  competencia: string // "2026-07"
  valor: number
  status: StatusNota
  enviadaEm?: string
  prazo: string // ISO date
  arquivo?: string
}

export type StatusAusencia = 'pendente' | 'aprovado' | 'recusado'

export interface Ausencia {
  id: string
  colaboradorId: string
  tipo: 'recesso' | 'folga'
  inicio: string
  fim: string
  dias: number
  motivo?: string
  status: StatusAusencia
  criadoEm: string
}

export interface Comunicado {
  id: string
  titulo: string
  resumo: string
  corpo: string
  categoria: 'Geral' | 'Financeiro' | 'Políticas' | 'Eventos' | 'Novidades'
  autor: string
  data: string
  fixado?: boolean
  lidoPor: string[] // ids
}

export interface Evento {
  id: string
  titulo: string
  descricao: string
  tipo: 'Treinamento' | 'Happy Hour' | 'Aniversário' | 'Reunião' | 'Data comemorativa'
  data: string // ISO datetime
  local: string
  inscritos: string[]
}

export interface Beneficio {
  id: string
  nome: string
  categoria: 'Bem-estar' | 'Saúde' | 'Educação' | 'Desconto' | 'Financeiro'
  descricao: string
  icon: string
  elegibilidade: string
  comoUsar: string
}

export interface Treinamento {
  id: string
  titulo: string
  descricao: string
  categoria: string
  duracaoMin: number
  obrigatorio: boolean
  progresso: number // 0-100
  modulos: number
}

export interface Badge {
  id: string
  nome: string
  descricao: string
  icon: string
  cor: string
  raridade: 'comum' | 'raro' | 'épico' | 'lendário'
}

export interface Desafio {
  id: string
  titulo: string
  descricao: string
  pontos: number
  progresso: number
  meta: number
  concluido: boolean
}

export interface Notificacao {
  id: string
  tipo: 'aprovacao' | 'recusa' | 'prazo' | 'comunicado' | 'evento' | 'gamificacao' | 'pendencia'
  titulo: string
  texto: string
  data: string
  lida: boolean
  href?: string
}

export interface Documento {
  id: string
  colaboradorId: string
  nome: string
  tipo: 'Contrato' | 'RG/CPF' | 'Comprovante' | 'Certificado' | 'Outro'
  data: string
  tamanho: string
}

export interface DB {
  colaboradores: Colaborador[]
  setores: Setor[]
  cargos: Cargo[]
  reembolsos: Reembolso[]
  notas: NotaFiscal[]
  ausencias: Ausencia[]
  comunicados: Comunicado[]
  eventos: Evento[]
  beneficios: Beneficio[]
  treinamentos: Treinamento[]
  badges: Badge[]
  desafios: Desafio[]
  notificacoes: Notificacao[]
  documentos: Documento[]
}
