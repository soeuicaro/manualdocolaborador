/* ============================================================
   4JURIS · Camada de dados (Store)
   ------------------------------------------------------------
   Prototipagem de front-end com persistência em localStorage.
   API pensada para ser trocada por chamadas ao backend depois:
     Store.colaboradores.list() / get(id) / create(obj)
                        / update(id, patch) / remove(id)
   Basta reimplementar cada método com fetch() mantendo a assinatura.
   ============================================================ */
const Store = (() => {
  const KEY = '4juris_rh_v1';
  const PALETTE = ['#0032D2','#122029','#0f9d6b','#c98a12','#7c3aed','#0891b2','#db2777','#ea580c'];

  /* ---------------- Seed ---------------- */
  function seed(){
    const setores = [
      { id:'s1', nome:'Marketing',   desc:'Prospecção, conteúdo e performance digital.', cor:'#0032D2', icon:'sparkles', gestorId:'c1' },
      { id:'s2', nome:'Tecnologia',  desc:'Produto, engenharia e infraestrutura.',       cor:'#0891b2', icon:'bolt',     gestorId:'c4' },
      { id:'s3', nome:'Comercial',   desc:'Vendas, parcerias e expansão de carteira.',   cor:'#0f9d6b', icon:'target',   gestorId:'c6' },
      { id:'s4', nome:'Jurídico',    desc:'Contratos, compliance e suporte jurídico.',   cor:'#7c3aed', icon:'shield',   gestorId:'c8' },
      { id:'s5', nome:'Financeiro',  desc:'Contas, notas fiscais e pagamentos PJ.',      cor:'#c98a12', icon:'wallet',   gestorId:null },
      { id:'s6', nome:'RH & Pessoas',desc:'Recrutamento, cultura e experiência do time.',cor:'#db2777', icon:'heart',    gestorId:null },
    ];

    const cargos = [
      { id:'g1', nome:'Head de Marketing',    setorId:'s1', nivel:'Liderança' },
      { id:'g2', nome:'Analista de Conteúdo', setorId:'s1', nivel:'Pleno' },
      { id:'g3', nome:'Gestor de Tráfego',    setorId:'s1', nivel:'Sênior' },
      { id:'g4', nome:'Tech Lead',            setorId:'s2', nivel:'Liderança' },
      { id:'g5', nome:'Desenvolvedor(a)',     setorId:'s2', nivel:'Pleno' },
      { id:'g6', nome:'Designer de Produto',  setorId:'s2', nivel:'Pleno' },
      { id:'g7', nome:'Executivo(a) de Vendas',setorId:'s3', nivel:'Sênior' },
      { id:'g8', nome:'SDR',                  setorId:'s3', nivel:'Júnior' },
      { id:'g9', nome:'Advogado(a)',          setorId:'s4', nivel:'Sênior' },
      { id:'g10',nome:'Analista Financeiro',  setorId:'s5', nivel:'Pleno' },
    ];

    const colaboradores = [
      c('c1','Marina Alves','marina.alves@4juris.com.br','(31) 99812-4410','s1','g1','ativo','2022-03-14','Belo Horizonte','MG','Marina Alves Marketing ME','41.226.518/0001-77','12.980,00','mensalista','1990-06-18'),
      c('c2','Rafael Costa','rafael.costa@4juris.com.br','(31) 99145-2093','s1','g3','ativo','2023-01-09','Belo Horizonte','MG','RC Performance Digital LTDA','48.771.204/0001-30','9.400,00','mensalista','1994-11-02'),
      c('c3','Beatriz Nunes','beatriz.nunes@4juris.com.br','(11) 98833-1201','s1','g2','ferias','2023-08-21','São Paulo','SP','Bia Nunes Comunicação ME','50.118.923/0001-64','6.200,00','mensalista','1998-02-27'),
      c('c4','Diego Martins','diego.martins@4juris.com.br','(31) 99677-8890','s2','g4','ativo','2021-11-02','Belo Horizonte','MG','DM Software LTDA','39.552.740/0001-19','16.500,00','mensalista','1988-09-12'),
      c('c5','Camila Rocha','camila.rocha@4juris.com.br','(41) 99320-7745','s2','g5','ativo','2023-05-15','Curitiba','PR','Camila Rocha Dev ME','52.904.117/0001-08','8.900,00','mensalista','1996-04-30'),
      c('c6','Lucas Ferreira','lucas.ferreira@4juris.com.br','(31) 99012-5567','s3','g7','ativo','2022-07-18','Belo Horizonte','MG','LF Negócios LTDA','44.610.882/0001-45','7.800,00','mensalista','1992-12-05'),
      c('c7','Ana Beatriz Lima','ana.lima@4juris.com.br','(21) 98120-9931','s3','g8','pendente','2024-06-03','Rio de Janeiro','RJ','Ana Lima Consultoria ME','55.203.418/0001-92','4.500,00','mensalista','2000-08-19'),
      c('c8','Pedro Henrique Souza','pedro.souza@4juris.com.br','(31) 99788-0102','s4','g9','ativo','2022-02-28','Belo Horizonte','MG','PH Souza Advocacia','40.998.117/0001-53','11.200,00','mensalista','1991-03-22'),
      c('c9','Juliana Prado','juliana.prado@4juris.com.br','(31) 99456-7781','s5','g10','ativo','2023-03-10','Belo Horizonte','MG','JP Contábil ME','47.330.229/0001-70','7.100,00','mensalista','1995-07-08'),
      c('c10','Thiago Barros','thiago.barros@4juris.com.br','(51) 98871-3320','s2','g6','inativo','2022-09-01','Porto Alegre','RS','TB Design Studio ME','43.887.552/0001-16','8.300,00','por-projeto','1993-01-14'),
    ];

    const usuarios = [
      { id:'u1', colaboradorId:'c1', email:'marina.alves@4juris.com.br', papel:'gestor',      ativo:true },
      { id:'u2', colaboradorId:null, email:'admin@4juris.com.br',       papel:'admin',       ativo:true, nome:'Administrador' },
      { id:'u3', colaboradorId:'c9', email:'juliana.prado@4juris.com.br',papel:'rh',          ativo:true },
      { id:'u4', colaboradorId:'c4', email:'diego.martins@4juris.com.br',papel:'gestor',      ativo:true },
      { id:'u5', colaboradorId:'c5', email:'camila.rocha@4juris.com.br', papel:'colaborador', ativo:true },
    ];

    const atividades = [
      { id:'a1', tipo:'entrada',  texto:'<b>Ana Beatriz Lima</b> foi adicionada ao setor Comercial.', data:'2024-06-03T09:12:00', kind:'brand' },
      { id:'a2', tipo:'nota',     texto:'<b>Camila Rocha</b> enviou a nota fiscal de junho.',          data:'2024-06-05T14:30:00', kind:'success' },
      { id:'a3', tipo:'ferias',   texto:'<b>Beatriz Nunes</b> entrou em período de férias.',           data:'2024-06-10T08:00:00', kind:'warning' },
      { id:'a4', tipo:'cargo',    texto:'Novo cargo <b>Gestor de Tráfego</b> criado em Marketing.',    data:'2024-06-11T11:45:00', kind:'brand' },
      { id:'a5', tipo:'setor',    texto:'Setor <b>RH & Pessoas</b> foi criado.',                       data:'2024-06-12T16:20:00', kind:'brand' },
    ];

    return { setores, cargos, colaboradores, usuarios, atividades };
  }

  function c(id,nome,email,tel,setorId,cargoId,status,entrada,cidade,uf,razao,cnpj,valor,tipo,nasc){
    return { id, nome, email, telefone:tel, setorId, cargoId, status,
      dataEntrada:entrada, cidade, uf, razaoSocial:razao, cnpj,
      remuneracao:valor, tipoContrato:tipo, nascimento:nasc,
      cor: PALETTE[Math.abs(hash(id)) % PALETTE.length] };
  }
  function hash(s){ let h=0; for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i)|0;} return h; }

  /* ---------------- Persistência ---------------- */
  let db;
  function load(){
    try{ const raw = localStorage.getItem(KEY); if(raw){ db = JSON.parse(raw); return; } }catch(e){}
    db = seed(); save();
  }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(db)); }catch(e){} }
  function uid(pfx){ return pfx + Math.random().toString(36).slice(2,8) + (Date.now()%100000); }

  /* ---------------- Coleção genérica ---------------- */
  function collection(name, prefix){
    return {
      list(){ return db[name].slice(); },
      get(id){ return db[name].find(x => x.id === id) || null; },
      create(obj){ const rec = { ...obj, id: obj.id || uid(prefix) }; db[name].push(rec); save(); return rec; },
      update(id, patch){ const i = db[name].findIndex(x => x.id===id); if(i<0) return null; db[name][i] = { ...db[name][i], ...patch }; save(); return db[name][i]; },
      remove(id){ const i = db[name].findIndex(x => x.id===id); if(i<0) return false; db[name].splice(i,1); save(); return true; },
    };
  }

  load();

  const api = {
    setores:       collection('setores', 's'),
    cargos:        collection('cargos', 'g'),
    colaboradores: collection('colaboradores', 'c'),
    usuarios:      collection('usuarios', 'u'),
    atividades:    collection('atividades', 'a'),

    /* Registra evento no feed de atividades */
    logAtividade(texto, kind='brand'){
      const rec = { id: uid('a'), tipo:'evento', texto, kind, data: new Date().toISOString() };
      db.atividades.unshift(rec); save(); return rec;
    },

    /* Usuário logado (mock) */
    currentUser(){ return { nome:'Administrador', email:'admin@4juris.com.br', papel:'admin', iniciais:'AD', cor:'#0032D2' }; },

    /* Permissões por papel (para tela de administração) */
    papeis: {
      admin:       { nome:'Administrador', desc:'Acesso total ao sistema e às configurações.' },
      gestor:      { nome:'Gestor de setor', desc:'Gerencia colaboradores e informações do próprio setor.' },
      rh:          { nome:'RH & Pessoas', desc:'Gerencia pessoas, documentos e onboarding.' },
      colaborador: { nome:'Colaborador', desc:'Acessa o próprio perfil e a central de dúvidas.' },
    },

    reset(){ db = seed(); save(); },
  };

  return api;
})();
