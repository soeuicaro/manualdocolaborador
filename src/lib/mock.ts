/* ============================================================
   4JURIS Pessoas · Dados de demonstração (seed)
   Substituir por chamadas ao backend mantendo os tipos.
   ============================================================ */
import type { DB } from './types'

export const CURRENT_USER_ID = 'c1'

const PALETTE = ['#0032D2', '#122029', '#0f9d6b', '#c98a12', '#7c3aed', '#0891b2', '#db2777', '#ea580c']
const cor = (i: number) => PALETTE[i % PALETTE.length]

export function seed(): DB {
  const setores: DB['setores'] = [
    { id: 's1', nome: 'Marketing', descricao: 'Prospecção, conteúdo e performance digital.', cor: '#0032D2', icon: 'Sparkles', gestorId: 'c1' },
    { id: 's2', nome: 'Tecnologia', descricao: 'Produto, engenharia e infraestrutura.', cor: '#0891b2', icon: 'Cpu', gestorId: 'c4' },
    { id: 's3', nome: 'Comercial', descricao: 'Vendas, parcerias e expansão de carteira.', cor: '#0f9d6b', icon: 'Target', gestorId: 'c6' },
    { id: 's4', nome: 'Jurídico', descricao: 'Contratos, compliance e suporte jurídico.', cor: '#7c3aed', icon: 'Scale', gestorId: 'c8' },
    { id: 's5', nome: 'Financeiro', descricao: 'Contas, notas fiscais e pagamentos PJ.', cor: '#c98a12', icon: 'Wallet', gestorId: null },
    { id: 's6', nome: 'RH & Pessoas', descricao: 'Recrutamento, cultura e experiência do time.', cor: '#db2777', icon: 'HeartHandshake', gestorId: 'c9' },
  ]

  const cargos: DB['cargos'] = [
    { id: 'g1', nome: 'Head de Marketing', setorId: 's1', nivel: 'Liderança' },
    { id: 'g2', nome: 'Analista de Conteúdo', setorId: 's1', nivel: 'Pleno' },
    { id: 'g3', nome: 'Gestor de Tráfego', setorId: 's1', nivel: 'Sênior' },
    { id: 'g4', nome: 'Tech Lead', setorId: 's2', nivel: 'Liderança' },
    { id: 'g5', nome: 'Desenvolvedor(a)', setorId: 's2', nivel: 'Pleno' },
    { id: 'g6', nome: 'Designer de Produto', setorId: 's2', nivel: 'Pleno' },
    { id: 'g7', nome: 'Executivo(a) de Vendas', setorId: 's3', nivel: 'Sênior' },
    { id: 'g8', nome: 'SDR', setorId: 's3', nivel: 'Júnior' },
    { id: 'g9', nome: 'Advogado(a)', setorId: 's4', nivel: 'Sênior' },
    { id: 'g10', nome: 'Analista Financeiro', setorId: 's5', nivel: 'Pleno' },
    { id: 'g11', nome: 'Analista de RH', setorId: 's6', nivel: 'Pleno' },
  ]

  const mkColab = (
    id: string, nome: string, email: string, tel: string, papel: DB['colaboradores'][number]['papel'],
    setorId: string, cargoId: string, status: DB['colaboradores'][number]['status'],
    entrada: string, nasc: string, cidade: string, uf: string, razao: string, cnpj: string,
    valor: number, pontos: number, nivel: number, streak: number, badges: string[],
  ): DB['colaboradores'][number] => ({
    id, nome, email, telefone: tel, papel, setorId, cargoId, status,
    dataEntrada: entrada, nascimento: nasc, cidade, uf, razaoSocial: razao, cnpj,
    remuneracao: valor, tipoContrato: 'mensalista', avatarCor: cor(parseInt(id.slice(1)) || 1),
    banco: 'Nubank', agencia: '0001', conta: '12345-6', pixChave: email,
    emergenciaNome: 'Contato de emergência', emergenciaTelefone: '(31) 90000-0000', emergenciaParentesco: 'Familiar',
    pontos, nivel, streak, badges,
  })

  const colaboradores: DB['colaboradores'] = [
    mkColab('c1', 'Marina Alves', 'marina.alves@4juris.com.br', '(31) 99812-4410', 'admin', 's1', 'g1', 'ativo', '2022-03-14', '1990-06-18', 'Belo Horizonte', 'MG', 'Marina Alves Marketing ME', '41.226.518/0001-77', 12980, 2860, 7, 14, ['b1', 'b2', 'b3', 'b5', 'b6']),
    mkColab('c2', 'Rafael Costa', 'rafael.costa@4juris.com.br', '(31) 99145-2093', 'colaborador', 's1', 'g3', 'ativo', '2023-01-09', '1994-11-02', 'Belo Horizonte', 'MG', 'RC Performance Digital LTDA', '48.771.204/0001-30', 9400, 1980, 5, 6, ['b1', 'b2', 'b4']),
    mkColab('c3', 'Beatriz Nunes', 'beatriz.nunes@4juris.com.br', '(11) 98833-1201', 'colaborador', 's1', 'g2', 'ferias', '2023-08-21', '1998-02-27', 'São Paulo', 'SP', 'Bia Nunes Comunicação ME', '50.118.923/0001-64', 6200, 1240, 4, 0, ['b1', 'b3']),
    mkColab('c4', 'Diego Martins', 'diego.martins@4juris.com.br', '(31) 99677-8890', 'gestor', 's2', 'g4', 'ativo', '2021-11-02', '1988-09-12', 'Belo Horizonte', 'MG', 'DM Software LTDA', '39.552.740/0001-19', 16500, 3450, 8, 21, ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7']),
    mkColab('c5', 'Camila Rocha', 'camila.rocha@4juris.com.br', '(41) 99320-7745', 'colaborador', 's2', 'g5', 'ativo', '2023-05-15', '1996-04-30', 'Curitiba', 'PR', 'Camila Rocha Dev ME', '52.904.117/0001-08', 8900, 1620, 4, 9, ['b1', 'b4']),
    mkColab('c6', 'Lucas Ferreira', 'lucas.ferreira@4juris.com.br', '(31) 99012-5567', 'gestor', 's3', 'g7', 'ativo', '2022-07-18', '1992-12-05', 'Belo Horizonte', 'MG', 'LF Negócios LTDA', '44.610.882/0001-45', 7800, 2110, 5, 3, ['b1', 'b2', 'b6']),
    mkColab('c7', 'Ana Beatriz Lima', 'ana.lima@4juris.com.br', '(21) 98120-9931', 'colaborador', 's3', 'g8', 'pendente', '2024-06-03', '2000-08-19', 'Rio de Janeiro', 'RJ', 'Ana Lima Consultoria ME', '55.203.418/0001-92', 4500, 320, 1, 2, ['b1']),
    mkColab('c8', 'Pedro Henrique Souza', 'pedro.souza@4juris.com.br', '(31) 99788-0102', 'gestor', 's4', 'g9', 'ativo', '2022-02-28', '1991-03-22', 'Belo Horizonte', 'MG', 'PH Souza Advocacia', '40.998.117/0001-53', 11200, 2540, 6, 11, ['b1', 'b2', 'b3', 'b5']),
    mkColab('c9', 'Juliana Prado', 'juliana.prado@4juris.com.br', '(31) 99456-7781', 'rh', 's6', 'g11', 'ativo', '2023-03-10', '1995-07-08', 'Belo Horizonte', 'MG', 'JP Consultoria RH ME', '47.330.229/0001-70', 7100, 1890, 5, 7, ['b1', 'b2', 'b6']),
    mkColab('c10', 'Thiago Barros', 'thiago.barros@4juris.com.br', '(51) 98871-3320', 'colaborador', 's2', 'g6', 'recesso', '2022-09-01', '1993-01-14', 'Porto Alegre', 'RS', 'TB Design Studio ME', '43.887.552/0001-16', 8300, 1450, 4, 0, ['b1', 'b3']),
  ]

  const hoje = '2026-07-23'
  const reembolsos: DB['reembolsos'] = [
    { id: 'r1', colaboradorId: 'c1', categoria: 'Software & Ferramentas', descricao: 'Assinatura Figma anual', valor: 540, data: '2026-07-10', status: 'aprovado', comprovante: 'figma-nf.pdf', criadoEm: '2026-07-10', aprovadorId: 'c9' },
    { id: 'r2', colaboradorId: 'c1', categoria: 'Viagem & Deslocamento', descricao: 'Uber reunião cliente', valor: 68.9, data: '2026-07-18', status: 'pendente', comprovante: 'uber.pdf', criadoEm: '2026-07-18' },
    { id: 'r3', colaboradorId: 'c1', categoria: 'Alimentação', descricao: 'Almoço de equipe', valor: 210.5, data: '2026-06-28', status: 'pago', comprovante: 'restaurante.jpg', criadoEm: '2026-06-28', aprovadorId: 'c9' },
    { id: 'r4', colaboradorId: 'c1', categoria: 'Material de escritório', descricao: 'Monitor 27"', valor: 1290, data: '2026-06-15', status: 'recusado', comprovante: 'monitor.pdf', criadoEm: '2026-06-15', aprovadorId: 'c9' },
    { id: 'r5', colaboradorId: 'c2', categoria: 'Cursos & Educação', descricao: 'Curso de tráfego pago', valor: 890, data: '2026-07-05', status: 'aprovado', criadoEm: '2026-07-05', aprovadorId: 'c9' },
  ]

  const notas: DB['notas'] = colaboradores.slice(0, 8).map((c, i) => ({
    id: `n${i + 1}`, colaboradorId: c.id, competencia: '2026-07', valor: c.remuneracao,
    status: i % 3 === 0 ? 'enviada' : i % 3 === 1 ? 'aguardando' : 'aprovada',
    prazo: '2026-07-28', enviadaEm: i % 3 === 0 ? '2026-07-06' : undefined,
  }))
  notas.push({ id: 'n9', colaboradorId: 'c1', competencia: '2026-06', valor: 12980, status: 'aprovada', prazo: '2026-06-28', enviadaEm: '2026-06-05' })
  notas.push({ id: 'n10', colaboradorId: 'c1', competencia: '2026-05', valor: 12980, status: 'aprovada', prazo: '2026-05-28', enviadaEm: '2026-05-04' })

  const ausencias: DB['ausencias'] = [
    { id: 'a1', colaboradorId: 'c3', tipo: 'recesso', inicio: '2026-07-15', fim: '2026-07-29', dias: 15, motivo: 'Recesso anual', status: 'aprovado', criadoEm: '2026-06-20' },
    { id: 'a2', colaboradorId: 'c1', tipo: 'folga', inicio: '2026-08-04', fim: '2026-08-04', dias: 1, motivo: 'Compromisso pessoal', status: 'pendente', criadoEm: '2026-07-20' },
    { id: 'a3', colaboradorId: 'c10', tipo: 'recesso', inicio: '2026-07-10', fim: '2026-07-24', dias: 15, status: 'aprovado', criadoEm: '2026-06-15' },
    { id: 'a4', colaboradorId: 'c1', tipo: 'folga', inicio: '2026-06-12', fim: '2026-06-12', dias: 1, motivo: 'Dia da família', status: 'aprovado', criadoEm: '2026-06-05' },
  ]

  const comunicados: DB['comunicados'] = [
    { id: 'm1', titulo: 'Nova política de reembolsos entra em vigor em agosto', resumo: 'Categorias e limites atualizados para 2026. Confira o que muda.', corpo: 'A partir de 01/08 passam a valer os novos limites por categoria de reembolso. Softwares e ferramentas até R$ 800/mês, cursos até R$ 1.500/semestre. O envio continua pelo sistema, na Central de Reembolsos.', categoria: 'Financeiro', autor: 'Financeiro 4JURIS', data: '2026-07-21', fixado: true, lidoPor: [] },
    { id: 'm2', titulo: 'Happy hour de julho — sexta, 25/07', resumo: 'Comemoração dos resultados do trimestre. Presença confirmada?', corpo: 'Vamos celebrar o fechamento do trimestre! Sexta-feira, 25/07, a partir das 18h, no rooftop do escritório. Inscreva-se na aba Eventos.', categoria: 'Eventos', autor: 'RH & Pessoas', data: '2026-07-19', lidoPor: ['c1'] },
    { id: 'm3', titulo: 'Prazo de envio das notas fiscais: até 28/07', resumo: 'Emita e envie sua NF-e pela Central de Notas Fiscais.', corpo: 'Lembrete: o prazo para envio das notas fiscais de julho é dia 28. Utilize a Central de Notas Fiscais para emitir e anexar. Dúvidas com o Assistente de RH.', categoria: 'Financeiro', autor: 'Financeiro 4JURIS', data: '2026-07-18', lidoPor: [] },
    { id: 'm4', titulo: 'Nova trilha de aprendizagem: Marketing Jurídico', resumo: '6 módulos disponíveis agora em Treinamentos.', corpo: 'Está no ar a nova trilha de Marketing Jurídico, com 6 módulos e certificado. Acesse em Treinamentos e Desenvolvimento.', categoria: 'Novidades', autor: 'Academy 4JURIS', data: '2026-07-14', lidoPor: ['c1'] },
  ]

  const eventos: DB['eventos'] = [
    { id: 'e1', titulo: 'Happy Hour de Julho', descricao: 'Comemoração dos resultados do trimestre no rooftop.', tipo: 'Happy Hour', data: '2026-07-25T18:00:00', local: 'Rooftop — Escritório BH', inscritos: ['c4', 'c6'] },
    { id: 'e2', titulo: 'Treinamento: LGPD na prática', descricao: 'Boas práticas de proteção de dados para o time.', tipo: 'Treinamento', data: '2026-07-28T14:00:00', local: 'Online — Google Meet', inscritos: ['c1', 'c8'] },
    { id: 'e3', titulo: 'Aniversário — Juliana Prado', descricao: 'Bolo às 16h na copa!', tipo: 'Aniversário', data: '2026-07-08T16:00:00', local: 'Copa', inscritos: [] },
    { id: 'e4', titulo: 'Town Hall Trimestral', descricao: 'Resultados e direções para o próximo trimestre.', tipo: 'Reunião', data: '2026-08-01T10:00:00', local: 'Auditório + Online', inscritos: ['c1', 'c2', 'c4'] },
  ]

  const beneficios: DB['beneficios'] = [
    { id: 'v1', nome: 'Wellhub', categoria: 'Bem-estar', descricao: 'Rede de academias, estúdios e apps de atividade física.', icon: 'Dumbbell', elegibilidade: 'Todos os colaboradores ativos.', comoUsar: 'Ative pelo convite enviado ao e-mail cadastrado no RH.' },
    { id: 'v2', nome: 'Avus', categoria: 'Saúde', descricao: 'Clube de benefícios com descontos em saúde e telemedicina.', icon: 'Stethoscope', elegibilidade: 'Todos os colaboradores ativos.', comoUsar: 'Baixe o app, faça login com o CPF e ative o cadastro.' },
    { id: 'v3', nome: 'Starbem', categoria: 'Saúde', descricao: 'Consultas online, psicologia e apoio emocional com IA.', icon: 'HeartPulse', elegibilidade: 'Todos os colaboradores ativos.', comoUsar: 'Cadastre-se com CPF ou e-mail informado ao RH.' },
    { id: 'v4', nome: 'Academy 4JURIS', categoria: 'Educação', descricao: 'Trilhas de aprendizagem e certificações internas.', icon: 'GraduationCap', elegibilidade: 'Todos os colaboradores.', comoUsar: 'Acesse a aba Treinamentos e Desenvolvimento.' },
    { id: 'v5', nome: 'Parcerias & Descontos', categoria: 'Desconto', descricao: 'Descontos em farmácias, restaurantes e educação.', icon: 'Tags', elegibilidade: 'Todos os colaboradores ativos.', comoUsar: 'Apresente o CPF nas redes parceiras.' },
    { id: 'v6', nome: 'Day Off de Aniversário', categoria: 'Bem-estar', descricao: 'Um dia de folga no mês do seu aniversário.', icon: 'Cake', elegibilidade: 'Colaboradores com +3 meses de casa.', comoUsar: 'Solicite na Central de Folgas.' },
  ]

  const treinamentos: DB['treinamentos'] = [
    { id: 't1', titulo: 'Onboarding 4JURIS', descricao: 'Tudo o que você precisa para começar bem.', categoria: 'Cultura', duracaoMin: 45, obrigatorio: true, progresso: 100, modulos: 4 },
    { id: 't2', titulo: 'LGPD na prática', descricao: 'Proteção de dados no dia a dia.', categoria: 'Compliance', duracaoMin: 60, obrigatorio: true, progresso: 40, modulos: 5 },
    { id: 't3', titulo: 'Marketing Jurídico', descricao: 'Trilha completa de prospecção e conteúdo.', categoria: 'Marketing', duracaoMin: 180, obrigatorio: false, progresso: 25, modulos: 6 },
    { id: 't4', titulo: 'Comunicação e tom de voz', descricao: 'Como a 4JURIS se comunica.', categoria: 'Cultura', duracaoMin: 30, obrigatorio: false, progresso: 0, modulos: 3 },
  ]

  const badges: DB['badges'] = [
    { id: 'b1', nome: 'Boas-vindas', descricao: 'Concluiu o onboarding.', icon: 'Rocket', cor: '#0032D2', raridade: 'comum' },
    { id: 'b2', nome: 'Em dia', descricao: 'Enviou 3 notas fiscais no prazo.', icon: 'CalendarCheck', cor: '#0f9d6b', raridade: 'comum' },
    { id: 'b3', nome: 'Mão na massa', descricao: 'Concluiu 5 treinamentos.', icon: 'GraduationCap', cor: '#c98a12', raridade: 'raro' },
    { id: 'b4', nome: 'Conector', descricao: 'Participou de 3 eventos internos.', icon: 'Users', cor: '#0891b2', raridade: 'raro' },
    { id: 'b5', nome: 'Referência', descricao: 'Reconhecido por um colega.', icon: 'Star', cor: '#db2777', raridade: 'épico' },
    { id: 'b6', nome: 'Streak de fogo', descricao: '14 dias seguidos ativo.', icon: 'Flame', cor: '#ea580c', raridade: 'épico' },
    { id: 'b7', nome: 'Lenda 4JURIS', descricao: 'Alcançou o nível 8.', icon: 'Crown', cor: '#7c3aed', raridade: 'lendário' },
  ]

  const desafios: DB['desafios'] = [
    { id: 'd1', titulo: 'Complete seu perfil', descricao: 'Preencha dados bancários e de emergência.', pontos: 150, progresso: 4, meta: 5, concluido: false },
    { id: 'd2', titulo: 'Envie a NF de julho', descricao: 'Emita e envie sua nota fiscal no prazo.', pontos: 200, progresso: 0, meta: 1, concluido: false },
    { id: 'd3', titulo: 'Trilha LGPD', descricao: 'Conclua o treinamento obrigatório de LGPD.', pontos: 300, progresso: 2, meta: 5, concluido: false },
    { id: 'd4', titulo: 'Participe do Town Hall', descricao: 'Inscreva-se e participe do próximo Town Hall.', pontos: 100, progresso: 1, meta: 1, concluido: true },
  ]

  const notificacoes: DB['notificacoes'] = [
    { id: 'no1', tipo: 'prazo', titulo: 'Prazo de NF se aproxima', texto: 'Envie sua nota fiscal de julho até 28/07.', data: '2026-07-22T09:00:00', lida: false, href: '/notas' },
    { id: 'no2', tipo: 'aprovacao', titulo: 'Reembolso aprovado', texto: 'Seu reembolso "Assinatura Figma" foi aprovado.', data: '2026-07-21T15:30:00', lida: false, href: '/reembolsos' },
    { id: 'no3', tipo: 'gamificacao', titulo: 'Nova conquista!', texto: 'Você desbloqueou a medalha "Streak de fogo" 🔥', data: '2026-07-20T11:00:00', lida: false, href: '/experiencia' },
    { id: 'no4', tipo: 'comunicado', titulo: 'Novo comunicado', texto: 'Nova política de reembolsos entra em vigor em agosto.', data: '2026-07-21T08:00:00', lida: true, href: '/comunicados' },
    { id: 'no5', tipo: 'evento', titulo: 'Happy hour sexta!', texto: 'Confirme presença no happy hour de julho.', data: '2026-07-19T10:00:00', lida: true, href: '/eventos' },
  ]

  const documentos: DB['documentos'] = [
    { id: 'doc1', colaboradorId: 'c1', nome: 'Contrato de prestação de serviços', tipo: 'Contrato', data: '2022-03-14', tamanho: '340 KB' },
    { id: 'doc2', colaboradorId: 'c1', nome: 'Cartão CNPJ', tipo: 'Comprovante', data: '2022-03-10', tamanho: '120 KB' },
    { id: 'doc3', colaboradorId: 'c1', nome: 'Certificado — Onboarding 4JURIS', tipo: 'Certificado', data: '2022-04-01', tamanho: '88 KB' },
  ]

  return { colaboradores, setores, cargos, reembolsos, notas, ausencias, comunicados, eventos, beneficios, treinamentos, badges, desafios, notificacoes, documentos }
}
