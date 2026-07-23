import { useState } from 'react'
import { useStore } from '@/lib/store'
import { PageHeader, Card, Badge, Icon, Button, Tabs, Field, EmptyState } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { toast } from '@/components/toast'
import { fmtDate, cn } from '@/lib/utils'
import type { Comunicado, AlvoComunicado } from '@/lib/types'

const CATS = ['Todos', 'Geral', 'Financeiro', 'Políticas', 'Eventos', 'Novidades']
const CATEGORIAS: Comunicado['categoria'][] = ['Geral', 'Financeiro', 'Políticas', 'Eventos', 'Novidades']
const GESTAO = ['gestor', 'rh', 'admin', 'diretoria']

/** Um comunicado é visível para o usuário conforme seu público-alvo. */
export function comunicadoVisivel(m: Comunicado, user: { id: string; setorId: string }): boolean {
  if (m.alvo === 'todos') return true
  if (m.alvo === 'setores') return m.setoresAlvo.includes(user.setorId)
  if (m.alvo === 'usuarios') return m.usuariosAlvo.includes(user.id)
  return true
}

const ALVO_LABEL: Record<AlvoComunicado, string> = { todos: 'Todos', setores: 'Por setor', usuarios: 'Por usuário' }

export default function Comunicados() {
  const s = useStore()
  const user = s.currentUser()
  const marcarLido = useStore((x) => x.marcarLido)
  const addComunicado = useStore((x) => x.addComunicado)
  const isGestao = GESTAO.includes(user.papel)

  const [cat, setCat] = useState('Todos')
  const [aberto, setAberto] = useState<Comunicado | null>(null)
  const [criar, setCriar] = useState(false)

  // Formulário de criação
  const [alvo, setAlvo] = useState<AlvoComunicado>('todos')
  const [setoresAlvo, setSetoresAlvo] = useState<string[]>([])
  const [usuariosAlvo, setUsuariosAlvo] = useState<string[]>([])

  const lista = [...s.comunicados]
    .filter((m) => isGestao || comunicadoVisivel(m, user))
    .sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || +new Date(b.data) - +new Date(a.data))
    .filter((m) => cat === 'Todos' || m.categoria === cat)

  const open = (m: Comunicado) => { setAberto(m); marcarLido(m.id) }
  const lido = (m: Comunicado) => m.lidoPor.includes(s.currentUserId)

  const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id])

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    if (!d.titulo || !d.resumo || !d.corpo) { toast('Preencha título, resumo e conteúdo.', 'danger'); return }
    if (alvo === 'setores' && setoresAlvo.length === 0) { toast('Selecione ao menos um setor.', 'danger'); return }
    if (alvo === 'usuarios' && usuariosAlvo.length === 0) { toast('Selecione ao menos um usuário.', 'danger'); return }
    addComunicado({
      titulo: d.titulo, resumo: d.resumo, corpo: d.corpo,
      categoria: d.categoria as Comunicado['categoria'], autor: user.nome,
      fixado: d.fixado === 'on',
      alvo, setoresAlvo: alvo === 'setores' ? setoresAlvo : [], usuariosAlvo: alvo === 'usuarios' ? usuariosAlvo : [],
    })
    setCriar(false); setAlvo('todos'); setSetoresAlvo([]); setUsuariosAlvo([])
    toast('Comunicado publicado! 📣')
  }

  const publicoResumo = (m: Comunicado) =>
    m.alvo === 'todos' ? 'Todos' :
    m.alvo === 'setores' ? `${m.setoresAlvo.length} setor(es)` :
    `${m.usuariosAlvo.length} usuário(s)`

  return (
    <>
      <PageHeader title="Central de Comunicados" subtitle="Avisos, novidades e comunicados oficiais da 4JURIS."
        actions={isGestao && <Button icon="Plus" onClick={() => setCriar(true)}>Criar comunicado</Button>} />
      <Tabs tabs={CATS.map((c) => ({ key: c, label: c }))} active={cat} onChange={setCat} />

      {lista.length === 0 ? (
        <Card><EmptyState icon="Megaphone" title="Nenhum comunicado por aqui" desc="Não há comunicados nesta categoria destinados a você." /></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {lista.map((m) => (
            <Card key={m.id} className={cn('p-5 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition', !lido(m) && 'ring-1 ring-brand-100')} >
              <div onClick={() => open(m)}>
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  {m.fixado && <Badge tone="brand" dot>Fixado</Badge>}
                  <Badge tone="neutral">{m.categoria}</Badge>
                  {m.alvo !== 'todos' && <Badge tone="gold"><Icon name={m.alvo === 'setores' ? 'Building2' : 'User'} className="h-3 w-3" />{publicoResumo(m)}</Badge>}
                  {!lido(m) && <span className="ml-auto h-2 w-2 rounded-full bg-brand" />}
                </div>
                <h3 className="text-[15.5px] font-bold text-ink leading-snug">{m.titulo}</h3>
                <p className="text-[13px] text-muted mt-1.5 line-clamp-2">{m.resumo}</p>
                <div className="flex items-center gap-2 mt-4 text-[12px] text-muted">
                  <Icon name="User" className="h-3.5 w-3.5" />{m.autor}<span>·</span>{fmtDate(m.data)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal ler comunicado */}
      <Modal open={!!aberto} onClose={() => setAberto(null)} wide
        title={aberto?.titulo}
        subtitle={aberto ? `${aberto.autor} · ${fmtDate(aberto.data)}` : ''}
        footer={<Button onClick={() => setAberto(null)}>Fechar</Button>}>
        {aberto && (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge tone="neutral">{aberto.categoria}</Badge>
              {aberto.alvo !== 'todos' && <Badge tone="gold">{ALVO_LABEL[aberto.alvo]}</Badge>}
            </div>
            <p className="text-[14.5px] text-ink-2 leading-relaxed whitespace-pre-line">{aberto.corpo}</p>
            <div className="mt-6 flex items-center gap-2 text-[12.5px] text-success bg-success-soft rounded-xl px-3.5 py-2.5">
              <Icon name="CheckCircle2" className="h-4 w-4" /> Leitura confirmada.
            </div>
          </div>
        )}
      </Modal>

      {/* Modal criar comunicado */}
      <Modal open={criar} onClose={() => setCriar(false)} wide title="Criar comunicado" subtitle="Escreva o comunicado e escolha quem deve recebê-lo."
        footer={<><Button variant="ghost" onClick={() => setCriar(false)}>Cancelar</Button><Button icon="Send" type="submit" form="comForm">Publicar</Button></>}>
        <form id="comForm" onSubmit={submit}>
          <Field label="Título" required><input name="titulo" className="input" placeholder="Ex.: Nova política de reembolsos" /></Field>
          <Field label="Resumo" required hint="Aparece no card do comunicado."><input name="resumo" className="input" placeholder="Uma linha curta sobre o aviso." /></Field>
          <Field label="Conteúdo" required><textarea name="corpo" className="input !h-auto py-2.5" rows={4} placeholder="Escreva o comunicado completo..." /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria">
              <select name="categoria" className="input" defaultValue="Geral">
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Fixar no topo">
              <label className="flex items-center gap-2 h-11 text-[13px] text-ink-2 cursor-pointer select-none">
                <input type="checkbox" name="fixado" className="h-4 w-4 rounded border-line-strong accent-brand" /> Destacar como fixado
              </label>
            </Field>
          </div>

          <Field label="Público-alvo" required>
            <div className="grid grid-cols-3 gap-2">
              {(['todos', 'setores', 'usuarios'] as AlvoComunicado[]).map((a) => (
                <button type="button" key={a} onClick={() => setAlvo(a)}
                  className={cn('rounded-xl border px-3 py-2.5 text-[12.5px] font-semibold transition flex items-center justify-center gap-1.5',
                    alvo === a ? 'border-brand bg-brand-50 text-brand' : 'border-line text-ink-2 hover:border-line-strong')}>
                  <Icon name={a === 'todos' ? 'Users' : a === 'setores' ? 'Building2' : 'User'} className="h-4 w-4" />
                  {ALVO_LABEL[a]}
                </button>
              ))}
            </div>
          </Field>

          {alvo === 'setores' && (
            <div className="mb-4 grid sm:grid-cols-2 gap-2">
              {s.setores.map((se) => (
                <label key={se.id} className={cn('flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition',
                  setoresAlvo.includes(se.id) ? 'border-brand bg-brand-50' : 'border-line hover:border-line-strong')}>
                  <input type="checkbox" checked={setoresAlvo.includes(se.id)} onChange={() => setSetoresAlvo((a) => toggle(a, se.id))} className="h-4 w-4 rounded accent-brand" />
                  <span className="text-[13px] text-ink font-medium">{se.nome}</span>
                </label>
              ))}
            </div>
          )}

          {alvo === 'usuarios' && (
            <div className="mb-4 max-h-52 overflow-y-auto rounded-xl border border-line p-2 space-y-1">
              {s.colaboradores.map((c) => (
                <label key={c.id} className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition',
                  usuariosAlvo.includes(c.id) ? 'bg-brand-50' : 'hover:bg-surface-2')}>
                  <input type="checkbox" checked={usuariosAlvo.includes(c.id)} onChange={() => setUsuariosAlvo((a) => toggle(a, c.id))} className="h-4 w-4 rounded accent-brand" />
                  <span className="text-[13px] text-ink font-medium">{c.nome}</span>
                  <span className="text-[11.5px] text-muted ml-auto">{s.setorNome(c.setorId)}</span>
                </label>
              ))}
            </div>
          )}
        </form>
      </Modal>
    </>
  )
}
