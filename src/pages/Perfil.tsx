import { useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, CardHead, Avatar, Badge, Tabs, Button, Field, Icon } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { toast } from '@/components/toast'
import { brl, fmtDate, tempoCasa, STATUS_COLAB } from '@/lib/utils'
import type { Colaborador } from '@/lib/types'

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="py-3 border-b border-line last:border-0">
      <div className="text-[11px] font-bold uppercase tracking-wide text-muted mb-1">{label}</div>
      <div className="text-[14px] text-ink font-medium">{value || '—'}</div>
    </div>
  )
}

export default function Perfil() {
  const user = useStore((s) => s.currentUser())
  const setorNome = useStore((s) => s.setorNome)
  const cargoNome = useStore((s) => s.cargoNome)
  const documentos = useStore((s) => s.documentos.filter((d) => d.colaboradorId === user.id))
  const update = useStore((s) => s.updateColaborador)
  const [tab, setTab] = useState('pessoais')
  const [edit, setEdit] = useState(false)
  const st = STATUS_COLAB[user.status]

  const tabs = [
    { key: 'pessoais', label: 'Pessoais' },
    { key: 'profissionais', label: 'Profissionais' },
    { key: 'bancarios', label: 'Bancários' },
    { key: 'nota', label: 'Emissão de NF' },
    { key: 'contratuais', label: 'Contratuais' },
    { key: 'emergencia', label: 'Emergência' },
    { key: 'documentos', label: 'Documentos' },
  ]

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    update(user.id, d as Partial<Colaborador>)
    setEdit(false)
    toast('Perfil atualizado.')
  }

  return (
    <>
      <PageHeader title="Meu Perfil" subtitle="Seus dados pessoais, profissionais e de PJ."
        actions={<Button icon="Pencil" variant="ghost" onClick={() => setEdit(true)}>Editar dados</Button>} />

      {/* Hero */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-5 flex-wrap">
          <Avatar nome={user.nome} cor={user.avatarCor} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[22px] font-bold text-ink">{user.nome}</h2>
              <Badge tone={st.tone} dot>{st.label}</Badge>
            </div>
            <p className="text-[14px] text-muted mt-1">{cargoNome(user.cargoId)} · {setorNome(user.setorId)}</p>
            <div className="flex gap-5 mt-3 flex-wrap text-[13px] text-ink-2">
              <span className="flex items-center gap-1.5"><Icon name="Mail" className="h-4 w-4 text-muted-2" />{user.email}</span>
              <span className="flex items-center gap-1.5"><Icon name="Phone" className="h-4 w-4 text-muted-2" />{user.telefone}</span>
              <span className="flex items-center gap-1.5"><Icon name="Clock" className="h-4 w-4 text-muted-2" />Na 4JURIS há {tempoCasa(user.dataEntrada)}</span>
            </div>
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <Card className="p-6">
        {tab === 'pessoais' && (
          <div className="grid sm:grid-cols-2 gap-x-10">
            <Row label="Nome completo" value={user.nome} />
            <Row label="E-mail" value={user.email} />
            <Row label="Telefone" value={user.telefone} />
            <Row label="Data de nascimento" value={fmtDate(user.nascimento)} />
            <Row label="Cidade / UF" value={`${user.cidade}/${user.uf}`} />
            <Row label="Papel de acesso" value={user.papel} />
          </div>
        )}
        {tab === 'profissionais' && (
          <div className="grid sm:grid-cols-2 gap-x-10">
            <Row label="Setor" value={setorNome(user.setorId)} />
            <Row label="Cargo / Função" value={cargoNome(user.cargoId)} />
            <Row label="Data de entrada" value={fmtDate(user.dataEntrada)} />
            <Row label="Tempo de casa" value={tempoCasa(user.dataEntrada)} />
            <Row label="Status" value={st.label} />
            <Row label="Tipo de contrato" value={user.tipoContrato === 'mensalista' ? 'Mensalista' : 'Por projeto'} />
          </div>
        )}
        {tab === 'bancarios' && (
          <div className="grid sm:grid-cols-2 gap-x-10">
            <Row label="Banco" value={user.banco} />
            <Row label="Agência" value={user.agencia} />
            <Row label="Conta" value={user.conta} />
            <Row label="Chave PIX" value={user.pixChave} />
          </div>
        )}
        {tab === 'nota' && (
          <div className="grid sm:grid-cols-2 gap-x-10">
            <Row label="Razão social" value={user.razaoSocial} />
            <Row label="CNPJ" value={user.cnpj} />
            <Row label="Remuneração mensal" value={brl(user.remuneracao)} />
            <Row label="Tomador (empresa)" value="4JURIS MARKETING LTDA · 46.937.316/0001-05" />
            <div className="sm:col-span-2 mt-4 bg-brand-50 border border-brand-100 rounded-xl p-4 flex gap-3">
              <Icon name="Info" className="h-5 w-5 text-brand shrink-0" />
              <p className="text-[13px] text-brand-700 leading-relaxed">Emita sua NF-e para a 4JURIS na <a href="/notas" className="font-semibold underline">Central de Notas Fiscais</a>, com a atividade econômica compatível ao serviço prestado.</p>
            </div>
          </div>
        )}
        {tab === 'contratuais' && (
          <div className="grid sm:grid-cols-2 gap-x-10">
            <Row label="Modelo de contratação" value="Prestação de serviços (PJ)" />
            <Row label="Início do contrato" value={fmtDate(user.dataEntrada)} />
            <Row label="Remuneração" value={`${brl(user.remuneracao)} / mês`} />
            <Row label="Jornada" value="Flexível · resultados" />
          </div>
        )}
        {tab === 'emergencia' && (
          <div className="grid sm:grid-cols-2 gap-x-10">
            <Row label="Nome" value={user.emergenciaNome} />
            <Row label="Telefone" value={user.emergenciaTelefone} />
            <Row label="Parentesco" value={user.emergenciaParentesco} />
          </div>
        )}
        {tab === 'documentos' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button icon="Upload" variant="soft" size="sm" onClick={() => toast('Upload será conectado ao backend.')}>Enviar documento</Button>
            </div>
            <div className="space-y-2">
              {documentos.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-surface-2 transition">
                  <span className="h-10 w-10 rounded-lg bg-brand-50 text-brand flex items-center justify-center shrink-0"><Icon name="FileText" className="h-[18px] w-[18px]" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink truncate">{d.nome}</div>
                    <div className="text-[12px] text-muted">{d.tipo} · {d.tamanho} · {fmtDate(d.data)}</div>
                  </div>
                  <Button icon="Download" variant="subtle" size="icon-sm" onClick={() => toast('Download será conectado ao backend.')} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Modal editar */}
      <Modal open={edit} onClose={() => setEdit(false)} title="Editar meus dados" subtitle="Atualize suas informações pessoais e de PJ." wide
        footer={<><Button variant="ghost" onClick={() => setEdit(false)}>Cancelar</Button><Button icon="Check" type="submit" form="perfilForm">Salvar</Button></>}>
        <form id="perfilForm" onSubmit={save}>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Telefone"><input name="telefone" className="input" defaultValue={user.telefone} /></Field>
            <Field label="Cidade"><input name="cidade" className="input" defaultValue={user.cidade} /></Field>
            <Field label="Banco"><input name="banco" className="input" defaultValue={user.banco} /></Field>
            <Field label="Chave PIX"><input name="pixChave" className="input" defaultValue={user.pixChave} /></Field>
            <Field label="Razão social"><input name="razaoSocial" className="input" defaultValue={user.razaoSocial} /></Field>
            <Field label="CNPJ"><input name="cnpj" className="input" defaultValue={user.cnpj} /></Field>
            <Field label="Contato de emergência"><input name="emergenciaNome" className="input" defaultValue={user.emergenciaNome} /></Field>
            <Field label="Telefone de emergência"><input name="emergenciaTelefone" className="input" defaultValue={user.emergenciaTelefone} /></Field>
          </div>
        </form>
      </Modal>
    </>
  )
}
