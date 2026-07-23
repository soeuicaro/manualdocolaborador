/* ============================================================
   4JURIS Pessoas · Store global (Zustand + persistência)
   ------------------------------------------------------------
   Camada de dados do protótipo. Para conectar ao backend,
   reimplemente as actions com chamadas à API mantendo os tipos.
   ============================================================ */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DB, Colaborador, Reembolso, Ausencia, NotaFiscal, Comunicado, Evento, Notificacao,
  Setor, Cargo, Tarefa,
} from './types'
import { seed, CURRENT_USER_ID } from './mock'
import { uid } from './utils'

const hoje = () => new Date().toISOString().slice(0, 10)

interface AppState extends DB {
  currentUserId: string
  sidebarCollapsed: boolean
  previewColaborador: boolean
  // seletores
  currentUser: () => Colaborador
  realUser: () => Colaborador
  setorNome: (id: string) => string
  cargoNome: (id: string) => string
  // ui
  toggleSidebar: () => void
  setPreview: (v: boolean) => void
  // colaboradores
  addColaborador: (c: Omit<Colaborador, 'id'>) => Colaborador
  updateColaborador: (id: string, patch: Partial<Colaborador>) => void
  removeColaborador: (id: string) => void
  addPontos: (id: string, pts: number) => void
  // setores
  addSetor: (s: Omit<Setor, 'id'>) => Setor
  updateSetor: (id: string, patch: Partial<Setor>) => void
  removeSetor: (id: string) => void
  // cargos
  addCargo: (c: Omit<Cargo, 'id'>) => void
  removeCargo: (id: string) => void
  // reembolsos
  addReembolso: (r: Omit<Reembolso, 'id' | 'criadoEm' | 'status'>) => void
  setReembolsoStatus: (id: string, status: Reembolso['status'], byId?: string) => void
  // ausências
  addAusencia: (a: Omit<Ausencia, 'id' | 'criadoEm' | 'status'>) => void
  setAusenciaStatus: (id: string, status: Ausencia['status']) => void
  // notas
  enviarNota: (id: string) => void
  aprovarNota: (id: string, aprovadorId: string) => void
  pagarNota: (id: string) => void
  setNotaStatus: (id: string, status: NotaFiscal['status'], byId?: string) => void
  addNota: (n: Omit<NotaFiscal, 'id'>) => void
  gerarNotasCompetencia: (competencia: string) => number
  // comunicados
  addComunicado: (m: Omit<Comunicado, 'id' | 'data' | 'lidoPor'>) => void
  marcarLido: (id: string) => void
  // eventos
  addEvento: (e: Omit<Evento, 'id' | 'inscritos'>) => void
  toggleInscricao: (id: string) => void
  // tarefas (gamificação · kanban)
  addTarefa: (t: Omit<Tarefa, 'id' | 'criadaEm' | 'status' | 'responsavelId'>) => void
  moverTarefa: (id: string, status: Tarefa['status'], responsavelId?: string | null) => void
  assumirTarefa: (id: string, colaboradorId: string) => void
  concluirTarefa: (id: string, prova: string) => void
  aprovarTarefa: (id: string, aprovadorId: string) => void
  recusarTarefa: (id: string) => void
  removeTarefa: (id: string) => void
  // notificações
  marcarNotifLida: (id: string) => void
  marcarTodasLidas: () => void
  // dados
  reset: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...seed(),
      currentUserId: CURRENT_USER_ID,
      sidebarCollapsed: false,
      previewColaborador: false,

      realUser: () => {
        const s = get()
        return s.colaboradores.find((c) => c.id === s.currentUserId) ?? s.colaboradores[0]
      },
      currentUser: () => {
        const s = get()
        const u = s.colaboradores.find((c) => c.id === s.currentUserId) ?? s.colaboradores[0]
        // No modo "ver como colaborador", o papel efetivo vira 'colaborador'.
        return s.previewColaborador ? { ...u, papel: 'colaborador' } : u
      },
      setorNome: (id) => get().setores.find((x) => x.id === id)?.nome ?? 'Sem setor',
      cargoNome: (id) => get().cargos.find((x) => x.id === id)?.nome ?? 'Sem cargo',

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setPreview: (v) => set({ previewColaborador: v }),

      addColaborador: (c) => {
        const rec: Colaborador = { ...c, id: uid('c') }
        set((s) => ({ colaboradores: [...s.colaboradores, rec] }))
        return rec
      },
      updateColaborador: (id, patch) =>
        set((s) => ({ colaboradores: s.colaboradores.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeColaborador: (id) =>
        set((s) => ({ colaboradores: s.colaboradores.filter((c) => c.id !== id) })),
      addPontos: (id, pts) =>
        set((s) => ({ colaboradores: s.colaboradores.map((c) => (c.id === id ? { ...c, pontos: c.pontos + pts } : c)) })),

      addSetor: (data) => {
        const rec: Setor = { ...data, id: uid('s') }
        set((s) => ({ setores: [...s.setores, rec] }))
        return rec
      },
      updateSetor: (id, patch) =>
        set((s) => ({ setores: s.setores.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeSetor: (id) =>
        set((s) => ({ setores: s.setores.filter((x) => x.id !== id), cargos: s.cargos.filter((c) => c.setorId !== id) })),

      addCargo: (c) => set((s) => ({ cargos: [...s.cargos, { ...c, id: uid('g') }] })),
      removeCargo: (id) => set((s) => ({ cargos: s.cargos.filter((c) => c.id !== id) })),

      addReembolso: (r) =>
        set((s) => ({
          reembolsos: [{ ...r, id: uid('r'), criadoEm: hoje(), status: 'pendente' }, ...s.reembolsos],
        })),
      setReembolsoStatus: (id, status, byId) =>
        set((s) => ({
          reembolsos: s.reembolsos.map((r) => {
            if (r.id !== id) return r
            const patch: Partial<Reembolso> = { status }
            if (status === 'aprovado') { patch.aprovadorId = byId ?? r.aprovadorId; patch.aprovadoEm = r.aprovadoEm ?? hoje() }
            if (status === 'pago') patch.pagoEm = r.pagoEm ?? hoje()
            return { ...r, ...patch }
          }),
        })),

      addAusencia: (a) =>
        set((s) => ({
          ausencias: [{ ...a, id: uid('a'), criadoEm: hoje(), status: 'pendente' }, ...s.ausencias],
        })),
      setAusenciaStatus: (id, status) =>
        set((s) => ({ ausencias: s.ausencias.map((a) => (a.id === id ? { ...a, status } : a)) })),

      enviarNota: (id) =>
        set((s) => ({
          notas: s.notas.map((n) => (n.id === id ? { ...n, status: 'enviada' as NotaFiscal['status'], enviadaEm: hoje() } : n)),
        })),
      aprovarNota: (id, aprovadorId) =>
        set((s) => ({
          notas: s.notas.map((n) => (n.id === id ? { ...n, status: 'aprovada' as NotaFiscal['status'], aprovadorId, aprovadaEm: hoje() } : n)),
        })),
      pagarNota: (id) =>
        set((s) => ({
          notas: s.notas.map((n) => (n.id === id ? { ...n, status: 'paga' as NotaFiscal['status'], pagaEm: hoje() } : n)),
        })),
      setNotaStatus: (id, status, byId) =>
        set((s) => ({
          notas: s.notas.map((n) => {
            if (n.id !== id) return n
            const patch: Partial<NotaFiscal> = { status }
            if (status === 'enviada' && !n.enviadaEm) patch.enviadaEm = hoje()
            if (status === 'aprovada') { patch.aprovadorId = byId ?? n.aprovadorId; patch.aprovadaEm = n.aprovadaEm ?? hoje() }
            if (status === 'paga') patch.pagaEm = n.pagaEm ?? hoje()
            if (status === 'aguardando') { patch.enviadaEm = undefined; patch.aprovadorId = undefined; patch.aprovadaEm = undefined; patch.pagaEm = undefined }
            return { ...n, ...patch }
          }),
        })),
      addNota: (n) => set((s) => ({ notas: [{ ...n, id: uid('n') }, ...s.notas] })),
      gerarNotasCompetencia: (competencia) => {
        const { colaboradores, notas } = get()
        const jaTem = new Set(notas.filter((n) => n.competencia === competencia).map((n) => n.colaboradorId))
        const [ano, mes] = competencia.split('-')
        const novas: NotaFiscal[] = colaboradores
          .filter((c) => c.status === 'ativo' && !jaTem.has(c.id))
          .map((c) => ({
            id: uid('n'), colaboradorId: c.id, competencia, valor: c.remuneracao,
            status: 'aguardando' as NotaFiscal['status'], prazo: `${ano}-${mes}-22`, pagamentoEm: `${ano}-${mes}-25`,
          }))
        if (novas.length) set((s) => ({ notas: [...novas, ...s.notas] }))
        return novas.length
      },

      addComunicado: (m) =>
        set((s) => ({
          comunicados: [{ ...m, id: uid('m'), data: hoje(), lidoPor: [] }, ...s.comunicados],
        })),
      marcarLido: (id) =>
        set((s) => ({
          comunicados: s.comunicados.map((m: Comunicado) =>
            m.id === id && !m.lidoPor.includes(s.currentUserId) ? { ...m, lidoPor: [...m.lidoPor, s.currentUserId] } : m),
        })),

      addEvento: (e) =>
        set((s) => ({ eventos: [...s.eventos, { ...e, id: uid('e'), inscritos: [] }] })),
      toggleInscricao: (id) =>
        set((s) => ({
          eventos: s.eventos.map((e: Evento) => {
            if (e.id !== id) return e
            const inscrito = e.inscritos.includes(s.currentUserId)
            return { ...e, inscritos: inscrito ? e.inscritos.filter((x) => x !== s.currentUserId) : [...e.inscritos, s.currentUserId] }
          }),
        })),

      addTarefa: (t) =>
        set((s) => ({
          tarefas: [{ ...t, id: uid('tk'), criadaEm: hoje(), status: 'disponivel', responsavelId: null }, ...s.tarefas],
        })),
      moverTarefa: (id, status, responsavelId) =>
        set((s) => ({
          tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, status, ...(responsavelId !== undefined ? { responsavelId } : {}) } : t)),
        })),
      assumirTarefa: (id, colaboradorId) =>
        set((s) => ({
          tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, status: 'andamento' as Tarefa['status'], responsavelId: colaboradorId } : t)),
        })),
      concluirTarefa: (id, prova) =>
        set((s) => ({
          tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, status: 'aprovacao' as Tarefa['status'], prova, concluidaEm: hoje() } : t)),
        })),
      aprovarTarefa: (id, aprovadorId) =>
        set((s) => {
          const t = s.tarefas.find((x) => x.id === id)
          if (!t) return {}
          return {
            tarefas: s.tarefas.map((x) => (x.id === id ? { ...x, status: 'concluida' as Tarefa['status'], aprovadaPor: aprovadorId } : x)),
            colaboradores: t.responsavelId
              ? s.colaboradores.map((c) => (c.id === t.responsavelId ? { ...c, pontos: c.pontos + t.pontos } : c))
              : s.colaboradores,
          }
        }),
      recusarTarefa: (id) =>
        set((s) => ({
          tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, status: 'andamento' as Tarefa['status'], prova: undefined, concluidaEm: undefined } : t)),
        })),
      removeTarefa: (id) => set((s) => ({ tarefas: s.tarefas.filter((t) => t.id !== id) })),

      marcarNotifLida: (id) =>
        set((s) => ({ notificacoes: s.notificacoes.map((n: Notificacao) => (n.id === id ? { ...n, lida: true } : n)) })),
      marcarTodasLidas: () =>
        set((s) => ({ notificacoes: s.notificacoes.map((n) => ({ ...n, lida: true })) })),

      reset: () => set({ ...seed(), currentUserId: CURRENT_USER_ID, sidebarCollapsed: get().sidebarCollapsed, previewColaborador: false }),
    }),
    {
      name: '4juris_pessoas_v2',
      partialize: (s) => {
        const {
          currentUser, realUser, setPreview, previewColaborador,
          setorNome, cargoNome, toggleSidebar, addColaborador, updateColaborador, removeColaborador, addPontos,
          addSetor, updateSetor, removeSetor, addCargo, removeCargo,
          addReembolso, setReembolsoStatus, addAusencia, setAusenciaStatus, enviarNota, aprovarNota, pagarNota, setNotaStatus, addNota, gerarNotasCompetencia,
          addComunicado, marcarLido, addEvento, toggleInscricao,
          addTarefa, moverTarefa, assumirTarefa, concluirTarefa, aprovarTarefa, recusarTarefa, removeTarefa,
          marcarNotifLida, marcarTodasLidas, reset, ...data
        } = s
        return data as AppState
      },
    },
  ),
)
