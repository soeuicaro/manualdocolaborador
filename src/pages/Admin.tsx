import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, StatCard, Badge, Button, Field, Avatar, Icon, EmptyState, Tabs, Toggle } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { toast } from '@/components/toast'
import { STATUS_COLAB } from '@/lib/utils'
import type { Colaborador, Papel } from '@/lib/types'

const PAPEIS: { key: Papel; nome: string; desc: string; icon: string }[] = [
  { key: 'admin', nome: 'Administrador', desc: 'Acesso total ao sistema e às configurações.', icon: 'ShieldCheck' },
  { key: 'diretoria', nome: 'Diretoria', desc: 'Visão executiva e indicadores estratégicos.', icon: 'Crown' },
  { key: 'rh', nome: 'RH & Pessoas', desc: 'Gerencia pessoas, documentos e onboarding.', icon: 'HeartHandshake' },
  { key: 'gestor', nome: 'Gestor de setor', desc: 'Gerencia colaboradores e aprovações do setor.', icon: 'UserCog' },
  { key: 'colaborador', nome: 'Colaborador', desc: 'Acessa o próprio perfil e as centrais.', icon: 'User' },
]
const PAPEL_TONE: Record<string, string> = { admin: 'brand', diretoria: 'gold', rh: 'success', gestor: 'neutral', colaborador: 'neutral' }
const papelNome = (p: Papel) => PAPEIS.find((x) => x.key === p)?.nome ?? p

const emptyForm = (): Partial<Colaborador> => ({ nome: '', email: '', telefone: '', papel: 'colaborador', status: 'pendente', tipoContrato: 'mensalista', cidade: '', uf: 'MG' })

export default function Admin() {
  const s = useStore()
  const setores = s.setores
  const cargos = s.cargos
  const add = useStore((x) => x.addColaborador)
  const upd = useStore((x) => x.updateColaborador)
  const rem = useStore((x) => x.removeColaborador)

  const [tab, setTab] = useState('usuarios')
  const [q, setQ] = useState('')
  const [papelFiltro, setPapelFiltro] = useState<string>('todos')
  const [form, setForm] = useState<Partial<Colaborador> | null>(null)
  const [del, setDel] = useState<Colaborador | null>(null)

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return s.colaboradores
      .filter((c) => papelFiltro === 'todos' || c.papel === papelFiltro)
      .filter((c) => !t || `${c.nome} ${c.email}`.toLowerCase().includes(t))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [s.colaboradores, q, papelFiltro])

  const editing = form?.id != null
  const openNew = () => setForm(emptyForm())
  const openEdit = (c: Colaborador) => setForm({ ...c })

  const cargosDoSetor = (setorId?: string) => cargos.filter((g) => g.setorId === setorId)

  const save = () => {
    if (!form?.nome || !form?.email || !form?.setorId) { toast('Preencha nome, e-mail e setor.', 'danger'); return }
    if (editing) {
      upd(form.id!, form)
      toast('Usuário atualizado.')
    } else {
      const palette = ['#0032D2', '#0f9d6b', '#c98a12', '#7c3aed', '#0891b2', '#db2777']
      add({
        nome: form.nome!, email: form.email!, telefone: form.telefone ?? '', papel: (form.papel as Papel) ?? 'colaborador',
        setorId: form.setorId!, cargoId: form.cargoId ?? '', status: form.status ?? 'pendente',
        dataEntrada: form.dataEntrada ?? '2026-07-23', nascimento: form.nascimento ?? '',
        cidade: form.cidade ?? '', uf: form.uf ?? 'MG', razaoSocial: form.razaoSocial ?? '', cnpj: form.cnpj ?? '',
        remuneracao: Number(form.remuneracao) || 0, tipoContrato: (form.tipoContrato as Colaborador['tipoContrato']) ?? 'mensalista',
        avatarCor: palette[Math.floor(Math.random() * palette.length)], pontos: 0, nivel: 1, badges: [], streak: 0,
      })
      toast('Usuário criado com sucesso.')
    }
    setForm(null)
  }

  const confirmDelete = () => {
    if (!del) return
    rem(del.id)
    toast(`"${del.nome}" removido.`, 'danger')
    setDel(null)
  }

  const set = (patch: Partial<Colaborador>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <>
      <PageHeader title="Painel Administrativo" subtitle="Gerencie usuários, acessos e configurações do sistema." />

      <Tabs tabs={[{ key: 'usuarios', label: 'Usuários' }, { key: 'papeis', label: 'Papéis & permissões' }, { key: 'dados', label: 'Dados' }]} active={tab} onChange={setTab} />

      {tab === 'usuarios' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon="Users" tone="brand" value={s.colaboradores.length} label="Usuários no total" />
            <StatCard icon="CheckCircle2" tone="success" value={s.colaboradores.filter((c) => c.status === 'ativo').length} label="Ativos" />
            <StatCard icon="Clock" tone="warning" value={s.colaboradores.filter((c) => c.status === 'pendente').length} label="Pendentes" />
            <StatCard icon="ShieldCheck" tone="ink" value={s.colaboradores.filter((c) => c.papel === 'admin' || c.papel === 'gestor' || c.papel === 'rh').length} label="Com acesso de gestão" />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Icon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[17px] w-[17px] text-muted" />
              <input className="input pl-10" placeholder="Buscar por nome ou e-mail..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <select className="input w-auto min-w-[160px]" value={papelFiltro} onChange={(e) => setPapelFiltro(e.target.value)}>
              <option value="todos">Todos os papéis</option>
              {PAPEIS.map((p) => <option key={p.key} value={p.key}>{p.nome}</option>)}
            </select>
            <div className="ml-auto"><Button icon="UserPlus" onClick={openNew}>Novo usuário</Button></div>
          </div>

          <Card>
            {lista.length === 0 ? (
              <EmptyState icon="Users" title="Nenhum usuário encontrado" desc="Ajuste a busca ou cadastre um novo usuário." action={<Button icon="UserPlus" onClick={openNew}>Novo usuário</Button>} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px] min-w-[640px]">
                  <thead>
                    <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-muted bg-surface-2 border-b border-line">
                      <th className="px-5 py-3">Usuário</th><th className="px-5 py-3">Papel</th><th className="px-5 py-3">Setor / Cargo</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((c) => {
                      const st = STATUS_COLAB[c.status]
                      return (
                        <tr key={c.id} className="border-b border-line last:border-0 hover:bg-brand-50/40 transition group">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar nome={c.nome} cor={c.avatarCor} size="sm" />
                              <div><div className="font-semibold text-ink">{c.nome}</div><div className="text-[11.5px] text-muted">{c.email}</div></div>
                            </div>
                          </td>
                          <td className="px-5 py-3"><Badge tone={PAPEL_TONE[c.papel]}>{papelNome(c.papel)}</Badge></td>
                          <td className="px-5 py-3 text-ink-2"><div>{s.setorNome(c.setorId)}</div><div className="text-[11.5px] text-muted">{s.cargoNome(c.cargoId)}</div></td>
                          <td className="px-5 py-3"><Badge tone={st.tone} dot>{st.label}</Badge></td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                              <Button variant="subtle" size="icon-sm" icon="Pencil" onClick={() => openEdit(c)} />
                              <Button variant="subtle" size="icon-sm" icon="Trash2" onClick={() => setDel(c)} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === 'papeis' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAPEIS.map((p) => (
            <Card key={p.key} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-11 w-11 rounded-xl bg-brand-50 text-brand flex items-center justify-center"><Icon name={p.icon} className="h-5 w-5" /></span>
                <div><b className="text-[14.5px] text-ink block">{p.nome}</b><Badge tone={PAPEL_TONE[p.key]}>{s.colaboradores.filter((c) => c.papel === p.key).length} usuário(s)</Badge></div>
              </div>
              <p className="text-[13px] text-muted leading-relaxed">{p.desc}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === 'dados' && (
        <Card className="p-6 max-w-xl">
          <h3 className="text-[16px] font-bold text-ink mb-1">Dados de demonstração</h3>
          <p className="text-[13px] text-muted mb-5 leading-relaxed">Este ambiente usa dados fictícios guardados no navegador (localStorage). Ao conectar o backend, esta camada é substituída pela API.</p>
          <div className="bg-warning-soft border border-[#ecd9a8] rounded-xl p-4 flex gap-3 mb-5">
            <Icon name="AlertTriangle" className="h-5 w-5 text-warning shrink-0" />
            <p className="text-[13px] text-[#7a5b12] leading-relaxed">Restaurar apaga todas as alterações feitas (usuários, setores e cargos criados) e volta ao conjunto inicial.</p>
          </div>
          <Button variant="danger" icon="RotateCcw" onClick={() => { if (confirm('Restaurar todos os dados de demonstração?')) { s.reset(); toast('Dados restaurados.') } }}>Restaurar dados iniciais</Button>
        </Card>
      )}

      {/* Modal criar/editar usuário */}
      <Modal open={!!form} onClose={() => setForm(null)} wide
        title={editing ? 'Editar usuário' : 'Novo usuário'}
        subtitle={editing ? 'Atualize os dados e o acesso deste usuário.' : 'Cadastre um novo usuário e defina o acesso.'}
        footer={<><Button variant="ghost" onClick={() => setForm(null)}>Cancelar</Button><Button icon="Check" onClick={save}>{editing ? 'Salvar' : 'Criar usuário'}</Button></>}>
        {form && (
          <div className="grid sm:grid-cols-2 gap-x-4">
            <div className="sm:col-span-2"><Field label="Nome completo" required><input className="input" value={form.nome ?? ''} onChange={(e) => set({ nome: e.target.value })} placeholder="Ex.: Marina Alves" /></Field></div>
            <Field label="E-mail corporativo" required><input className="input" type="email" value={form.email ?? ''} onChange={(e) => set({ email: e.target.value })} placeholder="nome@4juris.com.br" /></Field>
            <Field label="Telefone"><input className="input" value={form.telefone ?? ''} onChange={(e) => set({ telefone: e.target.value })} placeholder="(31) 90000-0000" /></Field>
            <Field label="Papel de acesso" required>
              <select className="input" value={form.papel} onChange={(e) => set({ papel: e.target.value as Papel })}>
                {PAPEIS.map((p) => <option key={p.key} value={p.key}>{p.nome}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="input" value={form.status} onChange={(e) => set({ status: e.target.value as Colaborador['status'] })}>
                {Object.entries(STATUS_COLAB).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Setor" required>
              <select className="input" value={form.setorId ?? ''} onChange={(e) => set({ setorId: e.target.value, cargoId: '' })}>
                <option value="">Selecione...</option>
                {setores.map((se) => <option key={se.id} value={se.id}>{se.nome}</option>)}
              </select>
            </Field>
            <Field label="Cargo / Função">
              <select className="input" value={form.cargoId ?? ''} onChange={(e) => set({ cargoId: e.target.value })} disabled={!form.setorId}>
                <option value="">{form.setorId ? 'Selecione...' : 'Escolha um setor primeiro'}</option>
                {cargosDoSetor(form.setorId).map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
              </select>
            </Field>
            <Field label="Cidade"><input className="input" value={form.cidade ?? ''} onChange={(e) => set({ cidade: e.target.value })} /></Field>
            <Field label="UF"><input className="input" maxLength={2} value={form.uf ?? ''} onChange={(e) => set({ uf: e.target.value.toUpperCase() })} /></Field>
            <Field label="Razão social (PJ)"><input className="input" value={form.razaoSocial ?? ''} onChange={(e) => set({ razaoSocial: e.target.value })} /></Field>
            <Field label="CNPJ"><input className="input" value={form.cnpj ?? ''} onChange={(e) => set({ cnpj: e.target.value })} placeholder="00.000.000/0001-00" /></Field>
          </div>
        )}
      </Modal>

      {/* Modal excluir */}
      <Modal open={!!del} onClose={() => setDel(null)} title="Remover usuário"
        footer={<><Button variant="ghost" onClick={() => setDel(null)}>Cancelar</Button><Button variant="danger" icon="Trash2" onClick={confirmDelete}>Sim, remover</Button></>}>
        <p className="text-[14px] text-ink-2 leading-relaxed">Tem certeza que deseja remover <b className="text-ink">{del?.nome}</b>? Esta ação não pode ser desfeita.</p>
      </Modal>
    </>
  )
}
