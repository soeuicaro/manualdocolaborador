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
} from './types'
import { seed, CURRENT_USER_ID } from './mock'
import { uid } from './utils'

interface AppState extends DB {
  currentUserId: string
  sidebarCollapsed: boolean
  // seletores
  currentUser: () => Colaborador
  setorNome: (id: string) => string
  cargoNome: (id: string) => string
  // ui
  toggleSidebar: () => void
  // colaboradores
  addColaborador: (c: Omit<Colaborador, 'id'>) => Colaborador
  updateColaborador: (id: string, patch: Partial<Colaborador>) => void
  removeColaborador: (id: string) => void
  addPontos: (id: string, pts: number) => void
  // reembolsos
  addReembolso: (r: Omit<Reembolso, 'id' | 'criadoEm' | 'status'>) => void
  setReembolsoStatus: (id: string, status: Reembolso['status']) => void
  // ausências
  addAusencia: (a: Omit<Ausencia, 'id' | 'criadoEm' | 'status'>) => void
  setAusenciaStatus: (id: string, status: Ausencia['status']) => void
  // notas
  enviarNota: (id: string) => void
  // comunicados
  marcarLido: (id: string) => void
  // eventos
  toggleInscricao: (id: string) => void
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

      currentUser: () => {
        const s = get()
        return s.colaboradores.find((c) => c.id === s.currentUserId) ?? s.colaboradores[0]
      },
      setorNome: (id) => get().setores.find((x) => x.id === id)?.nome ?? 'Sem setor',
      cargoNome: (id) => get().cargos.find((x) => x.id === id)?.nome ?? 'Sem cargo',

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

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

      addReembolso: (r) =>
        set((s) => ({
          reembolsos: [{ ...r, id: uid('r'), criadoEm: new Date().toISOString().slice(0, 10), status: 'pendente' }, ...s.reembolsos],
        })),
      setReembolsoStatus: (id, status) =>
        set((s) => ({ reembolsos: s.reembolsos.map((r) => (r.id === id ? { ...r, status } : r)) })),

      addAusencia: (a) =>
        set((s) => ({
          ausencias: [{ ...a, id: uid('a'), criadoEm: new Date().toISOString().slice(0, 10), status: 'pendente' }, ...s.ausencias],
        })),
      setAusenciaStatus: (id, status) =>
        set((s) => ({ ausencias: s.ausencias.map((a) => (a.id === id ? { ...a, status } : a)) })),

      enviarNota: (id) =>
        set((s) => ({
          notas: s.notas.map((n) => (n.id === id ? { ...n, status: 'enviada' as NotaFiscal['status'], enviadaEm: new Date().toISOString().slice(0, 10) } : n)),
        })),

      marcarLido: (id) =>
        set((s) => ({
          comunicados: s.comunicados.map((m: Comunicado) =>
            m.id === id && !m.lidoPor.includes(s.currentUserId) ? { ...m, lidoPor: [...m.lidoPor, s.currentUserId] } : m),
        })),

      toggleInscricao: (id) =>
        set((s) => ({
          eventos: s.eventos.map((e: Evento) => {
            if (e.id !== id) return e
            const inscrito = e.inscritos.includes(s.currentUserId)
            return { ...e, inscritos: inscrito ? e.inscritos.filter((x) => x !== s.currentUserId) : [...e.inscritos, s.currentUserId] }
          }),
        })),

      marcarNotifLida: (id) =>
        set((s) => ({ notificacoes: s.notificacoes.map((n: Notificacao) => (n.id === id ? { ...n, lida: true } : n)) })),
      marcarTodasLidas: () =>
        set((s) => ({ notificacoes: s.notificacoes.map((n) => ({ ...n, lida: true })) })),

      reset: () => set({ ...seed(), currentUserId: CURRENT_USER_ID, sidebarCollapsed: get().sidebarCollapsed }),
    }),
    {
      name: '4juris_pessoas_v1',
      partialize: (s) => {
        const { currentUser, setorNome, cargoNome, toggleSidebar, addColaborador, updateColaborador, removeColaborador, addPontos, addReembolso, setReembolsoStatus, addAusencia, setAusenciaStatus, enviarNota, marcarLido, toggleInscricao, marcarNotifLida, marcarTodasLidas, reset, ...data } = s
        return data as AppState
      },
    },
  ),
)
