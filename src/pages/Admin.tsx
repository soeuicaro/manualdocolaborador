import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, StatCard, Badge, Button, Field, Avatar, Icon, EmptyState, Tabs, Toggle } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { toast } from '@/components/toast'
import { STATUS_COLAB, REGIME_LABEL, cn } from '@/lib/utils'
import type { Colaborador, Papel, Regime, PixTipo, Setor } from '@/lib/types'

const PAPEIS: { key: Papel; nome: string; desc: string; icon: string }[] = [
  { key: 'admin', nome: 'Administrador', desc: 'Acesso total ao sistema e às configurações.', icon: 'ShieldCheck' },
  { key: 'diretoria', nome: 'Diretoria', desc: 'Visão executiva e indicadores estratégicos.', icon: 'Crown' },
  { key: 'rh', nome: 'RH & Pessoas', desc: 'Gerencia pessoas, documentos e onboarding.', icon: 'HeartHandshake' },
  { key: 'gestor', nome: 'Gestor de setor', desc: 'Gerencia colaboradores e aprovações do setor.', icon: 'UserCog' },
  { key: 'colaborador', nome: 'Colaborador', desc: 'Acessa o próprio perfil e as centrais.', icon: 'User' },
]
const PAPEL_TONE: Record<string, string> = { admin: 'brand', diretoria: 'gold', rh: 'success', gestor: 'neutral', colaborador: 'neutral' }
const papelNome = (p: Papel) => PAPEIS.find((x) => x.key === p)?.nome ?? p

const REGIMES: Regime[] = ['PJ', 'CLT', 'autonomo']
const PIX_TIPOS: PixTipo[] = ['CNPJ', 'CPF', 'E-mail', 'Telefone', 'Aleatória']
const ICONES_SETOR = ['Sparkles', 'Cpu', 'Target', 'Scale', 'Wallet', 'HeartHandshake', 'Megaphone', 'Rocket', 'Briefcase', 'Building2']
const CORES_SETOR = ['#0032D2', '#0891b2', '#0f9d6b', '#7c3aed', '#c98a12', '#db2777', '#ea580c', '#122029']

const emptyForm = (): Partial<Colaborador> => ({
  nome: '', email: '', telefone: '', papel: 'colaborador', status: 'pendente', tipoContrato: 'mensalista',
  cidade: '', uf: 'MG', regime: 'PJ', senha: '', pixTipo: 'CNPJ',
})
const emptySetor = (): Partial<Setor> => ({ nome: '', descricao: '', cor: CORES_SETOR[0], icon: 'Building2', gestorId: null, liderancaIds: [], reembolsoApenasLideranca: false })

const genSenha = () => 'J' + Math.random().toString(36).slice(2, 8) + '@' + Math.floor(Math.random() * 90 + 10)

export default function Admin() {
  const s = useStore()
  const setores = s.setores
  const cargos = s.cargos
  const add = useStore((x) => x.addColaborador)
  const upd = useStore((x) => x.updateColaborador)
  const rem = useStore((x) => x.removeColaborador)
  const addSetor = useStore((x) => x.addSetor)
  const updSetor = useStore((x) => x.updateSetor)
  const removeSetor = useStore((x) => x.removeSetor)
  const addCargo = useStore((x) => x.addCargo)
  const removeCargo = useStore((x) => x.removeCargo)

  const [tab, setTab] = useState('usuarios')
  const [q, setQ] = useState('')
  const [papelFiltro, setPapelFiltro] = useState<string>('todos')
  const [form, setForm] = useState<Partial<Colaborador> | null>(null)
  const [del, setDel] = useState<Colaborador | null>(null)
  const [showPw, setShowPw] = useState(false)
  // setores
  const [setorForm, setSetorForm] = useState<Partial<Setor> | null>(null)
  const [delSetor, setDelSetor] = useState<Setor | null>(null)
  const [novoCargo, setNovoCargo] = useState<Record<string, string>>({})

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return s.colaboradores
      .filter((c) => papelFiltro === 'todos' || c.papel === papelFiltro)
      .filter((c) => !t || `${c.nome} ${c.email}`.toLowerCase().includes(t))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [s.colaboradores, q, papelFiltro])

  const editing = form?.id != null
  const openNew = () => { setForm(emptyForm()); setShowPw(false) }
  const openEdit = (c: Colaborador) => { setForm({ ...c }); setShowPw(false) }
  const cargosDoSetor = (setorId?: string) => cargos.filter((g) => g.setorId === setorId)
  const isPJ = (form?.regime ?? 'PJ') === 'PJ'

  const save = () => {
    if (!form?.nome || !form?.email || !form?.setorId) { toast('Preencha nome, e-mail e setor.', 'danger'); return }
    if (!editing && !form.senha) { toast('Defina uma senha de acesso.', 'danger'); return }
    if (editing) {
      upd(form.id!, form)
      toast('Usuário atualizado.')
    } else {
      const palette = ['#0032D2', '#0f9d6b', '#c98a12', '#7c3aed', '#0891b2', '#db2777']
      add({
        nome: form.nome!, email: form.email!, telefone: form.telefone ?? '', papel: (form.papel as Papel) ?? 'colaborador',
        setorId: form.setorId!, cargoId: form.cargoId ?? '', status: form.status ?? 'pendente',
        dataEntrada: form.dataEntrada ?? '2026-07-23', nascimento: form.nascimento ?? '',
        cidade: form.cidade ?? '', uf: form.uf ?? 'MG',
        senha: form.senha!, regime: (form.regime as Regime) ?? 'PJ', cpf: form.cpf ?? '',
        razaoSocial: form.razaoSocial ?? '', cnpj: form.cnpj ?? '',
        remuneracao: Number(form.remuneracao) || 0, tipoContrato: (form.tipoContrato as Colaborador['tipoContrato']) ?? 'mensalista',
        banco: form.banco, agencia: form.agencia, conta: form.conta,
        pixTipo: (form.pixTipo as PixTipo) ?? 'CNPJ', pixChave: form.pixChave ?? form.cnpj ?? '',
        avatarCor: palette[Math.floor(Math.random() * palette.length)], pontos: 0, nivel: 1, badges: [], streak: 0,
      })
      toast('Usuário criado com sucesso.')
    }
    setForm(null)
  }

  const confirmDelete = () => {
    if (!del) return
    rem(del.id); toast(`"${del.nome}" removido.`, 'danger'); setDel(null)
  }

  const set = (patch: Partial<Colaborador>) => setForm((f) => ({ ...f, ...patch }))

  /* ---------- Setores ---------- */
  const editingSetor = setorForm?.id != null
  const setS = (patch: Partial<Setor>) => setSetorForm((f) => ({ ...f, ...patch }))
  const toggleLideranca = (id: string) =>
    setSetorForm((f) => ({ ...f, liderancaIds: (f?.liderancaIds ?? []).includes(id) ? f!.liderancaIds!.filter((x) => x !== id) : [...(f?.liderancaIds ?? []), id] }))

  const saveSetor = () => {
    if (!setorForm?.nome) { toast('Informe o nome do setor.', 'danger'); return }
    const payload = {
      nome: setorForm.nome!, descricao: setorForm.descricao ?? '', cor: setorForm.cor ?? CORES_SETOR[0],
      icon: setorForm.icon ?? 'Building2', gestorId: setorForm.gestorId ?? null,
      liderancaIds: setorForm.liderancaIds ?? [], reembolsoApenasLideranca: !!setorForm.reembolsoApenasLideranca,
    }
    if (editingSetor) { updSetor(setorForm.id!, payload); toast('Setor atualizado.') }
    else { addSetor(payload); toast('Setor criado com sucesso.') }
    setSetorForm(null)
  }

  const addCargoAoSetor = (setorId: string) => {
    const nome = (novoCargo[setorId] ?? '').trim()
    if (!nome) return
    addCargo({ nome, setorId, nivel: 'Pleno' })
    setNovoCargo((m) => ({ ...m, [setorId]: '' }))
    toast('Cargo adicionado.')
  }

  return (
    <>
      <PageHeader title="Painel Administrativo" subtitle="Gerencie usuários, setores, acessos e configurações do sistema." />

      <Tabs tabs={[{ key: 'usuarios', label: 'Usuários' }, { key: 'setores', label: 'Setores & permissões' }, { key: 'papeis', label: 'Papéis' }, { key: 'dados', label: 'Dados' }]} active={tab} onChange={setTab} />

      {tab === 'usuarios' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon="Users" tone="brand" value={s.colaboradores.length} label="Usuários no total" />
            <StatCard icon="CheckCircle2" tone="success" value={s.colaboradores.filter((c) => c.status === 'ativo').length} label="Ativos" />
            <StatCard icon="Clock" tone="warning" value={s.colaboradores.filter((c) => c.status === 'pendente').length} label="Pendentes" />
            <StatCard icon="ShieldCheck" tone="ink" value={s.colaboradores.filter((c) => c.papel === 'admin' || c.papel === 'gestor' || c.papel === 'rh').length} label="Com acesso de gestão" />
          </div>

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
                <table className="w-full text-[13.5px] min-w-[720px]">
                  <thead>
                    <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-muted bg-surface-2 border-b border-line">
                      <th className="px-5 py-3">Usuário</th><th className="px-5 py-3">Papel</th><th className="px-5 py-3">Regime</th><th className="px-5 py-3">Setor / Cargo</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th>
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
                          <td className="px-5 py-3"><Badge tone="neutral">{c.regime}</Badge></td>
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

      {tab === 'setores' && (
        <>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <p className="text-[13.5px] text-muted">Crie setores, defina lideranças e libere seções específicas para elas.</p>
            <Button icon="Plus" onClick={() => setSetorForm(emptySetor())}>Novo setor</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {setores.map((se) => {
              const membros = s.colaboradores.filter((c) => c.setorId === se.id)
              const lideres = s.colaboradores.filter((c) => se.liderancaIds.includes(c.id))
              return (
                <Card key={se.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: se.cor }}><Icon name={se.icon} className="h-5 w-5" /></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-bold text-ink">{se.nome}</h3>
                        <Badge tone="neutral">{membros.length} pessoa(s)</Badge>
                      </div>
                      <p className="text-[12.5px] text-muted mt-0.5 line-clamp-2">{se.descricao || 'Sem descrição.'}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="subtle" size="icon-sm" icon="Pencil" onClick={() => setSetorForm({ ...se })} />
                      <Button variant="subtle" size="icon-sm" icon="Trash2" onClick={() => setDelSetor(se)} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {se.reembolsoApenasLideranca && <Badge tone="gold" dot>Reembolso só p/ liderança</Badge>}
                    {lideres.length > 0
                      ? <span className="inline-flex items-center gap-1.5 text-[12px] text-muted"><Icon name="Star" className="h-3.5 w-3.5 text-gold" />Lideranças: {lideres.map((l) => l.nome.split(' ')[0]).join(', ')}</span>
                      : <span className="text-[12px] text-muted-2">Sem liderança definida</span>}
                  </div>

                  {/* Cargos */}
                  <div className="mt-4 pt-4 border-t border-line">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Cargos</div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {cargosDoSetor(se.id).map((g) => (
                        <span key={g.id} className="inline-flex items-center gap-1 chip !py-1 !text-[11.5px]">
                          {g.nome}
                          <button onClick={() => removeCargo(g.id)} className="text-muted-2 hover:text-danger"><Icon name="X" className="h-3 w-3" /></button>
                        </span>
                      ))}
                      {cargosDoSetor(se.id).length === 0 && <span className="text-[12px] text-muted-2">Nenhum cargo.</span>}
                    </div>
                    <div className="flex gap-2">
                      <input className="input h-9 text-[12.5px]" placeholder="Novo cargo..." value={novoCargo[se.id] ?? ''}
                        onChange={(e) => setNovoCargo((m) => ({ ...m, [se.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addCargoAoSetor(se.id)} />
                      <Button size="sm" variant="ghost" icon="Plus" onClick={() => addCargoAoSetor(se.id)}>Add</Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
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
        subtitle={editing ? 'Atualize os dados e o acesso deste usuário.' : 'Cadastre um novo usuário, defina o acesso e a senha.'}
        footer={<><Button variant="ghost" onClick={() => setForm(null)}>Cancelar</Button><Button icon="Check" onClick={save}>{editing ? 'Salvar' : 'Criar usuário'}</Button></>}>
        {form && (
          <div className="space-y-5">
            <Section title="Dados pessoais" icon="User">
              <div className="grid sm:grid-cols-2 gap-x-4">
                <div className="sm:col-span-2"><Field label="Nome completo" required><input className="input" value={form.nome ?? ''} onChange={(e) => set({ nome: e.target.value })} placeholder="Ex.: Marina Alves" /></Field></div>
                <Field label="E-mail corporativo" required><input className="input" type="email" value={form.email ?? ''} onChange={(e) => set({ email: e.target.value })} placeholder="nome@4juris.com.br" /></Field>
                <Field label="Telefone"><input className="input" value={form.telefone ?? ''} onChange={(e) => set({ telefone: e.target.value })} placeholder="(31) 90000-0000" /></Field>
                <Field label="Data de nascimento"><input className="input" type="date" value={form.nascimento ?? ''} onChange={(e) => set({ nascimento: e.target.value })} /></Field>
                <Field label="CPF"><input className="input" value={form.cpf ?? ''} onChange={(e) => set({ cpf: e.target.value })} placeholder="000.000.000-00" /></Field>
                <Field label="Cidade"><input className="input" value={form.cidade ?? ''} onChange={(e) => set({ cidade: e.target.value })} /></Field>
                <Field label="UF"><input className="input" maxLength={2} value={form.uf ?? ''} onChange={(e) => set({ uf: e.target.value.toUpperCase() })} /></Field>
              </div>
            </Section>

            <Section title="Acesso e permissões" icon="ShieldCheck">
              <div className="grid sm:grid-cols-2 gap-x-4">
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
                <div className="sm:col-span-2">
                  <Field label={editing ? 'Redefinir senha' : 'Senha de acesso'} required={!editing} hint="O usuário poderá alterá-la depois no primeiro acesso.">
                    <div className="relative">
                      <input className="input pr-24" type={showPw ? 'text' : 'password'} value={form.senha ?? ''} onChange={(e) => set({ senha: e.target.value })} placeholder="••••••••" />
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                        <button type="button" title="Gerar senha" onClick={() => { set({ senha: genSenha() }); setShowPw(true) }} className="h-8 w-8 rounded-lg text-muted hover:bg-winter hover:text-ink flex items-center justify-center"><Icon name="RefreshCw" className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setShowPw((v) => !v)} className="h-8 w-8 rounded-lg text-muted hover:bg-winter hover:text-ink flex items-center justify-center"><Icon name={showPw ? 'EyeOff' : 'Eye'} className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="Lotação" icon="Building2">
              <div className="grid sm:grid-cols-2 gap-x-4">
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
                <Field label="Data de entrada"><input className="input" type="date" value={form.dataEntrada ?? ''} onChange={(e) => set({ dataEntrada: e.target.value })} /></Field>
                <Field label="Remuneração mensal (R$)"><input className="input" inputMode="decimal" value={form.remuneracao ?? ''} onChange={(e) => set({ remuneracao: Number(e.target.value.replace(',', '.')) || 0 })} placeholder="0,00" /></Field>
              </div>
            </Section>

            <Section title="Contratação e pagamento" icon="Wallet">
              <div className="grid sm:grid-cols-3 gap-2 mb-2">
                {REGIMES.map((r) => (
                  <button type="button" key={r} onClick={() => set({ regime: r })}
                    className={cn('rounded-xl border px-3 py-2.5 text-[12.5px] font-semibold transition',
                      (form.regime ?? 'PJ') === r ? 'border-brand bg-brand-50 text-brand' : 'border-line text-ink-2 hover:border-line-strong')}>
                    {REGIME_LABEL[r]}
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-x-4">
                {isPJ && <Field label="Razão social (PJ)"><input className="input" value={form.razaoSocial ?? ''} onChange={(e) => set({ razaoSocial: e.target.value })} /></Field>}
                {isPJ && <Field label="CNPJ"><input className="input" value={form.cnpj ?? ''} onChange={(e) => set({ cnpj: e.target.value, ...(form.pixTipo === 'CNPJ' ? { pixChave: e.target.value } : {}) })} placeholder="00.000.000/0001-00" /></Field>}
                <Field label="Banco"><input className="input" value={form.banco ?? ''} onChange={(e) => set({ banco: e.target.value })} placeholder="Ex.: Nubank" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Agência"><input className="input" value={form.agencia ?? ''} onChange={(e) => set({ agencia: e.target.value })} /></Field>
                  <Field label="Conta"><input className="input" value={form.conta ?? ''} onChange={(e) => set({ conta: e.target.value })} /></Field>
                </div>
                <Field label="Tipo de chave PIX">
                  <select className="input" value={form.pixTipo ?? 'CNPJ'} onChange={(e) => set({ pixTipo: e.target.value as PixTipo, ...(e.target.value === 'CNPJ' ? { pixChave: form.cnpj } : {}) })}>
                    {PIX_TIPOS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Chave PIX" hint={form.pixTipo === 'CNPJ' ? 'Associada ao CNPJ.' : undefined}><input className="input" value={form.pixChave ?? ''} onChange={(e) => set({ pixChave: e.target.value })} placeholder="Chave PIX" /></Field>
              </div>
            </Section>
          </div>
        )}
      </Modal>

      {/* Modal excluir usuário */}
      <Modal open={!!del} onClose={() => setDel(null)} title="Remover usuário"
        footer={<><Button variant="ghost" onClick={() => setDel(null)}>Cancelar</Button><Button variant="danger" icon="Trash2" onClick={confirmDelete}>Sim, remover</Button></>}>
        <p className="text-[14px] text-ink-2 leading-relaxed">Tem certeza que deseja remover <b className="text-ink">{del?.nome}</b>? Esta ação não pode ser desfeita.</p>
      </Modal>

      {/* Modal criar/editar setor */}
      <Modal open={!!setorForm} onClose={() => setSetorForm(null)} wide
        title={editingSetor ? 'Editar setor' : 'Novo setor'}
        subtitle="Defina identidade, gestor, lideranças e permissões do setor."
        footer={<><Button variant="ghost" onClick={() => setSetorForm(null)}>Cancelar</Button><Button icon="Check" onClick={saveSetor}>{editingSetor ? 'Salvar' : 'Criar setor'}</Button></>}>
        {setorForm && (
          <div>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <div className="sm:col-span-2"><Field label="Nome do setor" required><input className="input" value={setorForm.nome ?? ''} onChange={(e) => setS({ nome: e.target.value })} placeholder="Ex.: Marketing" /></Field></div>
              <div className="sm:col-span-2"><Field label="Descrição"><input className="input" value={setorForm.descricao ?? ''} onChange={(e) => setS({ descricao: e.target.value })} placeholder="O que este setor faz." /></Field></div>
              <Field label="Gestor do setor">
                <select className="input" value={setorForm.gestorId ?? ''} onChange={(e) => setS({ gestorId: e.target.value || null })}>
                  <option value="">Sem gestor</option>
                  {s.colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </Field>
              <Field label="Cor">
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {CORES_SETOR.map((c) => (
                    <button type="button" key={c} onClick={() => setS({ cor: c })} className={cn('h-8 w-8 rounded-lg transition', setorForm.cor === c ? 'ring-2 ring-offset-2 ring-brand' : '')} style={{ background: c }} />
                  ))}
                </div>
              </Field>
            </div>

            <Field label="Ícone">
              <div className="flex gap-1.5 flex-wrap">
                {ICONES_SETOR.map((ic) => (
                  <button type="button" key={ic} onClick={() => setS({ icon: ic })}
                    className={cn('h-10 w-10 rounded-xl border flex items-center justify-center transition', setorForm.icon === ic ? 'border-brand bg-brand-50 text-brand' : 'border-line text-ink-2 hover:border-line-strong')}>
                    <Icon name={ic} className="h-[18px] w-[18px]" />
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Lideranças do setor" hint="Lideranças têm acesso a seções restritas (ex.: reembolsos).">
              <div className="max-h-44 overflow-y-auto rounded-xl border border-line p-2 space-y-1">
                {s.colaboradores.map((c) => (
                  <label key={c.id} className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition',
                    (setorForm.liderancaIds ?? []).includes(c.id) ? 'bg-brand-50' : 'hover:bg-surface-2')}>
                    <input type="checkbox" checked={(setorForm.liderancaIds ?? []).includes(c.id)} onChange={() => toggleLideranca(c.id)} className="h-4 w-4 rounded accent-brand" />
                    <Avatar nome={c.nome} cor={c.avatarCor} size="sm" className="!h-6 !w-6 !text-[9px]" />
                    <span className="text-[13px] text-ink font-medium">{c.nome}</span>
                    <span className="text-[11.5px] text-muted ml-auto">{s.setorNome(c.setorId)}</span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="rounded-xl border border-line p-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-[13.5px] font-semibold text-ink">Restringir reembolsos às lideranças</div>
                <p className="text-[12.5px] text-muted mt-0.5">Se ativo, apenas as lideranças deste setor podem ver e solicitar reembolsos.</p>
              </div>
              <Toggle checked={!!setorForm.reembolsoApenasLideranca} onChange={(v) => setS({ reembolsoApenasLideranca: v })} />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal excluir setor */}
      <Modal open={!!delSetor} onClose={() => setDelSetor(null)} title="Remover setor"
        footer={<><Button variant="ghost" onClick={() => setDelSetor(null)}>Cancelar</Button><Button variant="danger" icon="Trash2" onClick={() => { if (delSetor) { removeSetor(delSetor.id); toast(`Setor "${delSetor.nome}" removido.`, 'danger'); setDelSetor(null) } }}>Sim, remover</Button></>}>
        <p className="text-[14px] text-ink-2 leading-relaxed">Remover <b className="text-ink">{delSetor?.nome}</b> também remove seus cargos. Colaboradores vinculados precisarão ser realocados. Continuar?</p>
      </Modal>
    </>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon name={icon} className="h-4 w-4 text-brand" />
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-muted">{title}</h4>
      </div>
      {children}
    </div>
  )
}
