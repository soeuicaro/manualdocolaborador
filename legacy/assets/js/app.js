/* ============================================================
   4JURIS · Aplicação (router + views + CRUD)
   ============================================================ */
'use strict';

/* -------------------- Helpers -------------------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = (s='') => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const fmtBRL  = v => 'R$ ' + (Number(String(v).replace(/\./g,'').replace(',','.')) || 0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});
const fmtNum  = n => Number(n).toLocaleString('pt-BR');
function fmtDate(iso){ if(!iso) return '—'; const d=new Date(iso.length<=10?iso+'T00:00:00':iso); return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtDateShort(iso){ if(!iso) return '—'; const d=new Date(iso.length<=10?iso+'T00:00:00':iso); return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}); }
function relTime(iso){
  const diff = (Date.now() - new Date(iso).getTime())/1000;
  if(diff<60) return 'agora'; if(diff<3600) return `há ${Math.floor(diff/60)} min`;
  if(diff<86400) return `há ${Math.floor(diff/3600)} h`; if(diff<172800) return 'ontem';
  return fmtDate(iso);
}
function initials(nome=''){ const p=nome.trim().split(/\s+/); return ((p[0]?.[0]||'')+(p.length>1?p[p.length-1][0]:'')).toUpperCase(); }
function firstName(nome=''){ return nome.trim().split(/\s+/)[0]; }
function tempoCasa(iso){
  if(!iso) return '—';
  const m = Math.max(0, Math.round((Date.now()-new Date(iso+'T00:00:00').getTime())/(1000*60*60*24*30.44)));
  const y=Math.floor(m/12), r=m%12;
  if(y===0) return `${m} ${m===1?'mês':'meses'}`;
  return `${y} ${y===1?'ano':'anos'}${r?` e ${r} ${r===1?'mês':'meses'}`:''}`;
}

const STATUS = {
  ativo:    { label:'Ativo',    badge:'badge-success' },
  ferias:   { label:'Em férias',badge:'badge-warning' },
  pendente: { label:'Pendente', badge:'badge-brand'   },
  inativo:  { label:'Inativo',  badge:'badge-neutral' },
};

/* -------------------- Toast -------------------- */
function toast(msg, type='success'){
  const host = $('#toastHost');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${icon(type==='danger'?'alert':'checkCircle')}<span>${esc(msg)}</span>`;
  host.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateX(30px)'; el.style.transition='.25s'; setTimeout(()=>el.remove(),260); }, 2800);
}

/* -------------------- Modal -------------------- */
const Modal = {
  open(html, wide){
    const m = $('#modal'); m.className = 'modal' + (wide?' wide':'');
    m.innerHTML = html;
    $('#modalOverlay').classList.add('open');
    document.body.style.overflow='hidden';
    const f = m.querySelector('input,select,textarea'); if(f) setTimeout(()=>f.focus(),60);
  },
  close(){ $('#modalOverlay').classList.remove('open'); document.body.style.overflow=''; $('#modal').innerHTML=''; },
};
$('#modalOverlay').addEventListener('mousedown', e => { if(e.target.id==='modalOverlay') Modal.close(); });
document.addEventListener('keydown', e => { if(e.key==='Escape') Modal.close(); });

/* -------------------- Rotas -------------------- */
const ROUTES = {
  dashboard:     { title:'Dashboard',           icon:'dashboard', crumb:'Visão geral',        render:renderDashboard },
  colaboradores: { title:'Colaboradores',       icon:'users',     crumb:'Gestão de pessoas',  render:renderColaboradores },
  setores:       { title:'Setores',             icon:'layers',    crumb:'Gestão de pessoas',  render:renderSetores },
  cargos:        { title:'Cargos & Funções',    icon:'briefcase', crumb:'Gestão de pessoas',  render:renderCargos },
  documentos:    { title:'Documentos',          icon:'file',      crumb:'Gestão de pessoas',  render:renderDocumentos },
  central:       { title:'Central de Dúvidas',  icon:'book',      crumb:'Suporte',            render:renderCentral },
  admin:         { title:'Administração',       icon:'shield',    crumb:'Administração',      render:renderAdmin },
};

let currentRoute = 'dashboard';
let uiState = { colabView:'grid', colabSetor:'all', colabStatus:'all', colabQuery:'' };

/* -------------------- Navegação -------------------- */
function buildNav(){
  $$('#sidebarNav .nav-item').forEach(btn => {
    const r = ROUTES[btn.dataset.route]; if(!r) return;
    let badge = '';
    if(btn.dataset.route==='colaboradores') badge = `<span class="nav-badge">${Store.colaboradores.list().length}</span>`;
    if(btn.dataset.route==='setores')       badge = `<span class="nav-badge">${Store.setores.list().length}</span>`;
    btn.innerHTML = `${icon(r.icon)}<span>${r.title}</span>${badge}`;
    btn.onclick = () => go(btn.dataset.route);
  });
}

function go(route){
  if(!ROUTES[route]) route='dashboard';
  currentRoute = route;
  location.hash = route;
  $$('#sidebarNav .nav-item').forEach(b => b.classList.toggle('active', b.dataset.route===route));
  const r = ROUTES[route];
  $('#pageTitle').textContent = r.title;
  $('#crumb').textContent = `4JURIS Pessoas · ${r.crumb}`;
  $('#content').scrollTop = 0;
  window.scrollTo(0,0);
  r.render($('#content'));
  $('#app').classList.remove('nav-open');
}

/* ============================================================
   VIEW · Dashboard
   ============================================================ */
function renderDashboard(root){
  const cols = Store.colaboradores.list();
  const ativos = cols.filter(c=>c.status==='ativo').length;
  const pendentes = cols.filter(c=>c.status==='pendente').length;
  const setores = Store.setores.list();
  const custoMensal = cols.filter(c=>c.status!=='inativo').reduce((s,c)=> s + (Number(String(c.remuneracao).replace(/\./g,'').replace(',','.'))||0), 0);

  // aniversariantes do mês
  const mesAtual = new Date().getMonth();
  const niver = cols.filter(c=>c.nascimento && new Date(c.nascimento+'T00:00:00').getMonth()===mesAtual)
                    .sort((a,b)=> new Date(a.nascimento).getDate()-new Date(b.nascimento).getDate());

  const atividades = Store.atividades.list().slice(0,6);

  // distribuição por setor
  const dist = setores.map(s => ({ s, n: cols.filter(c=>c.setorId===s.id).length }))
                      .sort((a,b)=>b.n-a.n);
  const maxDist = Math.max(1, ...dist.map(d=>d.n));

  root.innerHTML = `
    <div class="page-head">
      <div class="ph-titles">
        <h2>Olá, Administrador 👋</h2>
        <p>Aqui está o panorama do time 4JURIS hoje, ${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}.</p>
      </div>
      <div class="ph-actions">
        <button class="btn btn-ghost" onclick="go('setores')">${icon('layers')} Setores</button>
        <button class="btn btn-primary" onclick="openColaboradorForm()">${icon('plus')} Novo colaborador</button>
      </div>
    </div>

    <div class="stat-grid">
      ${statCard('users','brand', fmtNum(cols.length), 'Colaboradores no total', `<span class="stat-trend up">${icon('arrowUp')} ${ativos} ativos</span>`)}
      ${statCard('layers','ink', fmtNum(setores.length), 'Setores ativos')}
      ${statCard('clock','warning', fmtNum(pendentes), 'Onboardings pendentes')}
      ${statCard('wallet','success', fmtBRL(String(custoMensal.toFixed(2)).replace('.',',')), 'Custo mensal PJ estimado')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head"><h3>Atividade recente</h3><span class="sub">Últimos eventos</span></div>
        <div class="card-pad">
          <div class="timeline">
            ${atividades.map(a=>`
              <div class="tl-item">
                <span class="tl-dot ${a.kind||'brand'}"></span>
                <p>${a.texto}</p>
                <time>${relTime(a.data)}</time>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:18px;">
        <div class="card">
          <div class="card-head"><h3>Por setor</h3><span class="sub">${cols.length} pessoas</span></div>
          <div class="card-pad" style="display:flex; flex-direction:column; gap:14px;">
            ${dist.map(d=>`
              <div>
                <div class="u-between" style="margin-bottom:6px;">
                  <span style="font-size:12.5px; font-weight:600; color:var(--ink); display:flex; align-items:center; gap:8px;">
                    <span style="width:9px;height:9px;border-radius:3px;background:${d.s.cor};display:inline-block"></span>${esc(d.s.nome)}
                  </span>
                  <span class="u-muted" style="font-size:12.5px; font-weight:600;">${d.n}</span>
                </div>
                <div class="progress"><i style="width:${(d.n/maxDist*100)||2}%; background:${d.s.cor}"></i></div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>Aniversariantes do mês ${icon('cake')}</h3></div>
          <div class="card-pad">
            ${niver.length ? niver.map(c=>`
              <div class="lrow">
                <div class="avatar sm" style="background:${c.cor}">${initials(c.nome)}</div>
                <div class="lrow-main"><b>${esc(c.nome)}</b><span>${esc(cargoNome(c.cargoId))}</span></div>
                <div class="lrow-meta">${new Date(c.nascimento+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</div>
              </div>`).join('')
              : `<p class="u-muted" style="font-size:13px; padding:8px 0;">Nenhum aniversariante neste mês.</p>`}
          </div>
        </div>
      </div>
    </div>`;
}

function statCard(ic, tone, value, label, trend=''){
  return `<div class="stat">
    ${trend}
    <div class="stat-ic ${tone}">${icon(ic)}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
  </div>`;
}

/* ============================================================
   VIEW · Colaboradores
   ============================================================ */
function renderColaboradores(root){
  const setores = Store.setores.list();
  root.innerHTML = `
    <div class="page-head">
      <div class="ph-titles"><h2>Colaboradores</h2><p>Gestão do time de parceiros PJ da 4JURIS.</p></div>
      <div class="ph-actions">
        <button class="btn btn-ghost" onclick="exportCSV()">${icon('download')} Exportar</button>
        <button class="btn btn-primary" onclick="openColaboradorForm()">${icon('plus')} Novo colaborador</button>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-field toolbar-search">
        ${icon('search')}
        <input class="input" id="colabSearch" placeholder="Buscar por nome, e-mail ou empresa..." value="${esc(uiState.colabQuery)}">
      </div>
      <select class="select" id="colabStatusSel" style="width:auto; min-width:150px;">
        <option value="all">Todos os status</option>
        ${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${uiState.colabStatus===k?'selected':''}>${v.label}</option>`).join('')}
      </select>
      <div class="spacer"></div>
      <div class="segmented">
        <button id="viewGrid" class="${uiState.colabView==='grid'?'active':''}">${icon('grid')}</button>
        <button id="viewList" class="${uiState.colabView==='list'?'active':''}">${icon('list')}</button>
      </div>
    </div>

    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;" id="setorChips">
      <button class="chip ${uiState.colabSetor==='all'?'active':''}" data-setor="all">Todos os setores <span class="chip-count">${Store.colaboradores.list().length}</span></button>
      ${setores.map(s=>`<button class="chip ${uiState.colabSetor===s.id?'active':''}" data-setor="${s.id}"><span style="width:8px;height:8px;border-radius:3px;background:${s.cor}"></span>${esc(s.nome)} <span class="chip-count">${Store.colaboradores.list().filter(c=>c.setorId===s.id).length}</span></button>`).join('')}
    </div>

    <div id="colabResults"></div>`;

  $('#colabSearch').addEventListener('input', e => { uiState.colabQuery=e.target.value; paintColabs(); });
  $('#colabStatusSel').addEventListener('change', e => { uiState.colabStatus=e.target.value; paintColabs(); });
  $('#viewGrid').onclick = () => { uiState.colabView='grid'; go('colaboradores'); };
  $('#viewList').onclick = () => { uiState.colabView='list'; go('colaboradores'); };
  $$('#setorChips .chip').forEach(ch => ch.onclick = () => { uiState.colabSetor=ch.dataset.setor; go('colaboradores'); });
  paintColabs();
}

function filteredColabs(){
  const q = uiState.colabQuery.trim().toLowerCase();
  return Store.colaboradores.list().filter(c => {
    if(uiState.colabSetor!=='all' && c.setorId!==uiState.colabSetor) return false;
    if(uiState.colabStatus!=='all' && c.status!==uiState.colabStatus) return false;
    if(q && !(`${c.nome} ${c.email} ${c.razaoSocial} ${c.cidade}`.toLowerCase().includes(q))) return false;
    return true;
  }).sort((a,b)=>a.nome.localeCompare(b.nome));
}

function paintColabs(){
  const box = $('#colabResults'); const list = filteredColabs();
  if(!list.length){
    box.innerHTML = emptyState('users','Nenhum colaborador encontrado','Ajuste os filtros ou cadastre um novo colaborador.', 'openColaboradorForm()','Novo colaborador');
    return;
  }
  if(uiState.colabView==='grid'){
    box.innerHTML = `<div class="grid-auto">${list.map(colabCard).join('')}</div>`;
    $$('#colabResults .person-card').forEach(el => el.onclick = () => openColaboradorDetail(el.dataset.id));
  } else {
    box.innerHTML = colabTable(list);
    $$('#colabResults tbody tr').forEach(tr => tr.querySelector('.td-name').onclick = () => openColaboradorDetail(tr.dataset.id));
  }
}

function colabCard(c){
  const st = STATUS[c.status];
  return `<div class="person-card" data-id="${c.id}">
    <div class="pc-top">
      <div class="avatar lg" style="background:${c.cor}">${initials(c.nome)}</div>
      <div style="min-width:0;">
        <div class="pc-name">${esc(c.nome)}</div>
        <div class="pc-role">${esc(cargoNome(c.cargoId))}</div>
      </div>
    </div>
    <div class="pc-meta">
      <div class="mrow">${icon('layers')} ${esc(setorNome(c.setorId))}</div>
      <div class="mrow">${icon('mail')} <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.email)}</span></div>
      <div class="mrow">${icon('mapPin')} ${esc(c.cidade)}/${esc(c.uf)}</div>
    </div>
    <div class="pc-foot">
      <span class="badge ${st.badge}"><span class="dot"></span>${st.label}</span>
      <span class="u-muted" style="font-size:11.5px">${tempoCasa(c.dataEntrada)}</span>
    </div>
  </div>`;
}

function colabTable(list){
  return `<div class="card"><div class="table-wrap"><table class="data">
    <thead><tr><th>Colaborador</th><th>Setor</th><th>Cargo</th><th>Status</th><th>Contrato PJ</th><th>Entrada</th><th></th></tr></thead>
    <tbody>${list.map(c=>{ const st=STATUS[c.status]; return `<tr data-id="${c.id}">
      <td><div class="u-center u-gap-12"><div class="avatar sm" style="background:${c.cor}">${initials(c.nome)}</div><div><div class="td-name" style="cursor:pointer">${esc(c.nome)}</div><div class="u-muted" style="font-size:11.5px">${esc(c.email)}</div></div></div></td>
      <td>${esc(setorNome(c.setorId))}</td>
      <td>${esc(cargoNome(c.cargoId))}</td>
      <td><span class="badge ${st.badge}"><span class="dot"></span>${st.label}</span></td>
      <td class="u-mono">${fmtBRL(c.remuneracao)}<div class="u-muted" style="font-size:11px">${c.tipoContrato==='mensalista'?'Mensalista':'Por projeto'}</div></td>
      <td>${fmtDateShort(c.dataEntrada)}</td>
      <td><div class="row-actions">
        <button class="btn btn-ghost btn-icon btn-sm" title="Editar" onclick="event.stopPropagation();openColaboradorForm('${c.id}')">${icon('edit')}</button>
        <button class="btn btn-ghost btn-icon btn-sm" title="Excluir" onclick="event.stopPropagation();confirmDelete('colaboradores','${c.id}','${esc(c.nome)}')">${icon('trash')}</button>
      </div></td></tr>`; }).join('')}</tbody>
  </table></div></div>`;
}

/* ---- Detalhe do colaborador ---- */
function openColaboradorDetail(id){
  const c = Store.colaboradores.get(id); if(!c) return;
  const st = STATUS[c.status];
  Modal.open(`
    <div class="modal-head">
      <div class="detail-hero" style="border:none; padding:0; margin:0;">
        <div class="avatar xl" style="background:${c.cor}">${initials(c.nome)}</div>
        <div>
          <h2>${esc(c.nome)}</h2>
          <div class="u-center u-gap-8" style="margin-top:8px;">
            <span class="badge ${st.badge}"><span class="dot"></span>${st.label}</span>
            <span class="u-muted" style="font-size:13px">${esc(cargoNome(c.cargoId))} · ${esc(setorNome(c.setorId))}</span>
          </div>
        </div>
      </div>
      <button class="modal-close" onclick="Modal.close()">${icon('close')}</button>
    </div>
    <div class="modal-body">
      <div class="detail-grid">
        ${detailItem('E-mail', c.email)}
        ${detailItem('Telefone', c.telefone)}
        ${detailItem('Cidade / UF', `${c.cidade}/${c.uf}`)}
        ${detailItem('Na 4JURIS há', tempoCasa(c.dataEntrada))}
        ${detailItem('Razão social', c.razaoSocial)}
        ${detailItem('CNPJ', c.cnpj)}
        ${detailItem('Remuneração', fmtBRL(c.remuneracao))}
        ${detailItem('Tipo de contrato', c.tipoContrato==='mensalista'?'Mensalista':'Por projeto')}
        ${detailItem('Data de entrada', fmtDate(c.dataEntrada))}
        ${detailItem('Nascimento', fmtDate(c.nascimento))}
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-danger" onclick="confirmDelete('colaboradores','${c.id}','${esc(c.nome)}')">${icon('trash')} Excluir</button>
      <button class="btn btn-primary" onclick="openColaboradorForm('${c.id}')">${icon('edit')} Editar</button>
    </div>`, true);
}
function detailItem(label,val){ return `<div class="detail-item"><label>${esc(label)}</label><div class="val">${esc(val||'—')}</div></div>`; }

/* ---- Formulário colaborador (criar/editar) ---- */
function openColaboradorForm(id){
  const editing = !!id;
  const c = editing ? Store.colaboradores.get(id) : { status:'pendente', tipoContrato:'mensalista', uf:'MG', cidade:'Belo Horizonte' };
  const setores = Store.setores.list();
  Modal.open(`
    <div class="modal-head">
      <div><h2>${editing?'Editar colaborador':'Novo colaborador'}</h2><div class="sub">${editing?'Atualize os dados do parceiro PJ.':'Cadastre um novo parceiro PJ no time.'}</div></div>
      <button class="modal-close" onclick="Modal.close()">${icon('close')}</button>
    </div>
    <form id="colabForm" class="modal-body">
      <div class="field"><label>Nome completo <span class="field-req">*</span></label><input class="input" name="nome" value="${esc(c.nome||'')}" required placeholder="Ex.: Marina Alves"></div>
      <div class="input-group cols-2">
        <div class="field"><label>E-mail corporativo <span class="field-req">*</span></label><input class="input" type="email" name="email" value="${esc(c.email||'')}" required placeholder="nome@4juris.com.br"></div>
        <div class="field"><label>Telefone</label><input class="input" name="telefone" value="${esc(c.telefone||'')}" placeholder="(31) 90000-0000"></div>
      </div>
      <div class="input-group cols-2">
        <div class="field"><label>Setor <span class="field-req">*</span></label>
          <select class="select" name="setorId" id="fSetor" required>
            <option value="">Selecione...</option>
            ${setores.map(s=>`<option value="${s.id}" ${c.setorId===s.id?'selected':''}>${esc(s.nome)}</option>`).join('')}
          </select></div>
        <div class="field"><label>Cargo / Função <span class="field-req">*</span></label>
          <select class="select" name="cargoId" id="fCargo" required></select></div>
      </div>
      <div class="input-group cols-2">
        <div class="field"><label>Cidade</label><input class="input" name="cidade" value="${esc(c.cidade||'')}"></div>
        <div class="field"><label>UF</label><input class="input" name="uf" maxlength="2" value="${esc(c.uf||'')}" style="text-transform:uppercase"></div>
      </div>
      <div style="border-top:1px solid var(--border); margin:6px 0 18px;"></div>
      <div class="input-group cols-2">
        <div class="field"><label>Razão social (PJ)</label><input class="input" name="razaoSocial" value="${esc(c.razaoSocial||'')}" placeholder="Empresa LTDA / ME"></div>
        <div class="field"><label>CNPJ</label><input class="input" name="cnpj" value="${esc(c.cnpj||'')}" placeholder="00.000.000/0001-00"></div>
      </div>
      <div class="input-group cols-3">
        <div class="field"><label>Remuneração mensal</label><input class="input" name="remuneracao" value="${esc(c.remuneracao||'')}" placeholder="0,00"></div>
        <div class="field"><label>Tipo de contrato</label>
          <select class="select" name="tipoContrato">
            <option value="mensalista" ${c.tipoContrato==='mensalista'?'selected':''}>Mensalista</option>
            <option value="por-projeto" ${c.tipoContrato==='por-projeto'?'selected':''}>Por projeto</option>
          </select></div>
        <div class="field"><label>Status</label>
          <select class="select" name="status">
            ${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${c.status===k?'selected':''}>${v.label}</option>`).join('')}
          </select></div>
      </div>
      <div class="input-group cols-2">
        <div class="field"><label>Data de entrada</label><input class="input" type="date" name="dataEntrada" value="${esc(c.dataEntrada||'')}"></div>
        <div class="field"><label>Data de nascimento</label><input class="input" type="date" name="nascimento" value="${esc(c.nascimento||'')}"></div>
      </div>
    </form>
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveColaborador('${editing?id:''}')">${icon('check')} ${editing?'Salvar alterações':'Cadastrar colaborador'}</button>
    </div>`, true);

  const fillCargos = () => {
    const sid = $('#fSetor').value;
    const cargos = Store.cargos.list().filter(g=>g.setorId===sid);
    $('#fCargo').innerHTML = cargos.length
      ? `<option value="">Selecione...</option>` + cargos.map(g=>`<option value="${g.id}" ${c.cargoId===g.id?'selected':''}>${esc(g.nome)}</option>`).join('')
      : `<option value="">Nenhum cargo neste setor</option>`;
  };
  $('#fSetor').addEventListener('change', fillCargos);
  fillCargos();
}

function saveColaborador(id){
  const f = $('#colabForm'); const d = Object.fromEntries(new FormData(f).entries());
  if(!d.nome || !d.email || !d.setorId){ toast('Preencha nome, e-mail e setor.','danger'); return; }
  d.uf = (d.uf||'').toUpperCase();
  if(id){
    Store.colaboradores.update(id, d);
    Store.logAtividade(`<b>${esc(d.nome)}</b> teve os dados atualizados.`,'brand');
    toast('Colaborador atualizado.');
  } else {
    const rec = Store.colaboradores.create(d);
    Store.logAtividade(`<b>${esc(rec.nome)}</b> foi adicionado(a) ao setor ${esc(setorNome(rec.setorId))}.`,'success');
    toast('Colaborador cadastrado com sucesso.');
  }
  Modal.close(); buildNav(); go('colaboradores');
}

/* ============================================================
   VIEW · Setores
   ============================================================ */
function renderSetores(root){
  const setores = Store.setores.list();
  root.innerHTML = `
    <div class="page-head">
      <div class="ph-titles"><h2>Setores</h2><p>Organize o time em áreas e defina responsáveis.</p></div>
      <div class="ph-actions"><button class="btn btn-primary" onclick="openSetorForm()">${icon('plus')} Novo setor</button></div>
    </div>
    <div class="grid-auto">
      ${setores.map(s=>{
        const membros = Store.colaboradores.list().filter(c=>c.setorId===s.id);
        const nCargos = Store.cargos.list().filter(g=>g.setorId===s.id).length;
        const gestor = s.gestorId ? Store.colaboradores.get(s.gestorId) : null;
        return `<div class="entity-card">
          <div class="ec-top">
            <div class="ec-ic" style="background:${s.cor}">${icon(s.icon||'layers')}</div>
            <div style="flex:1; min-width:0;">
              <div class="u-between"><h3>${esc(s.nome)}</h3>
                <button class="btn btn-ghost btn-icon btn-sm" onclick="setorMenu('${s.id}')">${icon('dots')}</button>
              </div>
              <div class="ec-desc" style="margin-top:4px;">${esc(s.desc||'')}</div>
            </div>
          </div>
          <div class="u-center u-gap-16" style="font-size:12.5px; color:var(--text-soft);">
            <span class="u-center u-gap-6">${icon('users')} ${membros.length} pessoas</span>
            <span class="u-center u-gap-6">${icon('briefcase')} ${nCargos} cargos</span>
          </div>
          <div class="ec-foot">
            <div class="u-center u-gap-8">
              ${membros.length ? `<div class="avatar-stack">${membros.slice(0,4).map(m=>`<div class="avatar sm" style="background:${m.cor}" title="${esc(m.nome)}">${initials(m.nome)}</div>`).join('')}${membros.length>4?`<div class="avatar-more">+${membros.length-4}</div>`:''}</div>` : `<span class="u-muted" style="font-size:12px">Sem membros</span>`}
            </div>
            ${gestor ? `<span class="u-muted" style="font-size:11.5px">Gestor: <b style="color:var(--text-soft)">${esc(firstName(gestor.nome))}</b></span>` : `<span class="badge badge-neutral">Sem gestor</span>`}
          </div>
          <button class="btn btn-soft btn-sm btn-block" onclick="openSetorMembros('${s.id}')">${icon('users')} Gerenciar membros</button>
        </div>`;
      }).join('')}
      <button class="entity-card" style="border-style:dashed; align-items:center; justify-content:center; cursor:pointer; color:var(--brand); background:var(--brand-softer); min-height:200px;" onclick="openSetorForm()">
        <div style="text-align:center;">${icon('plus','')}<div style="margin-top:8px; font-weight:600; font-size:13.5px;">Criar novo setor</div></div>
      </button>
    </div>`;
}

function setorMenu(id){ openSetorForm(id); }

function openSetorForm(id){
  const editing=!!id;
  const s = editing ? Store.setores.get(id) : { cor:'#0032D2', icon:'layers' };
  const cores = ['#0032D2','#122029','#0f9d6b','#c98a12','#7c3aed','#0891b2','#db2777','#ea580c'];
  const icons = ['layers','sparkles','bolt','target','shield','wallet','heart','briefcase','building','chart'];
  const gestores = Store.colaboradores.list().filter(c=>editing?c.setorId===id:true);
  Modal.open(`
    <div class="modal-head"><div><h2>${editing?'Editar setor':'Novo setor'}</h2><div class="sub">Defina nome, identidade visual e responsável.</div></div>
      <button class="modal-close" onclick="Modal.close()">${icon('close')}</button></div>
    <form id="setorForm" class="modal-body">
      <div class="field"><label>Nome do setor <span class="field-req">*</span></label><input class="input" name="nome" value="${esc(s.nome||'')}" required placeholder="Ex.: Marketing"></div>
      <div class="field"><label>Descrição</label><textarea class="textarea" name="desc" placeholder="O que este setor faz...">${esc(s.desc||'')}</textarea></div>
      <div class="field"><label>Cor</label><div id="corPick" style="display:flex; gap:9px; flex-wrap:wrap;">
        ${cores.map(cor=>`<button type="button" class="cor-opt" data-cor="${cor}" style="width:34px;height:34px;border-radius:9px;background:${cor};border:3px solid ${s.cor===cor?'var(--ink)':'transparent'};cursor:pointer"></button>`).join('')}
      </div><input type="hidden" name="cor" id="corVal" value="${s.cor}"></div>
      <div class="field"><label>Ícone</label><div id="iconPick" style="display:flex; gap:9px; flex-wrap:wrap;">
        ${icons.map(ic=>`<button type="button" class="ic-opt" data-ic="${ic}" style="width:40px;height:40px;border-radius:10px;background:${s.icon===ic?'var(--brand-soft)':'var(--winter)'};color:${s.icon===ic?'var(--brand)':'var(--muted)'};border:1px solid ${s.icon===ic?'var(--brand)':'var(--border)'};display:flex;align-items:center;justify-content:center;cursor:pointer">${icon(ic)}</button>`).join('')}
      </div><input type="hidden" name="icon" id="iconVal" value="${s.icon||'layers'}"></div>
      ${editing ? `<div class="field"><label>Gestor responsável</label>
        <select class="select" name="gestorId">
          <option value="">Sem gestor definido</option>
          ${gestores.map(g=>`<option value="${g.id}" ${s.gestorId===g.id?'selected':''}>${esc(g.nome)}</option>`).join('')}
        </select></div>` : ''}
    </form>
    <div class="modal-foot">
      ${editing?`<button class="btn btn-danger u-right" style="margin-right:auto" onclick="confirmDelete('setores','${id}','${esc(s.nome)}')">${icon('trash')} Excluir setor</button>`:''}
      <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveSetor('${editing?id:''}')">${icon('check')} ${editing?'Salvar':'Criar setor'}</button>
    </div>`);
  $$('#corPick .cor-opt').forEach(b=>b.onclick=()=>{ $('#corVal').value=b.dataset.cor; $$('#corPick .cor-opt').forEach(x=>x.style.border='3px solid transparent'); b.style.border='3px solid var(--ink)'; });
  $$('#iconPick .ic-opt').forEach(b=>b.onclick=()=>{ $('#iconVal').value=b.dataset.ic; $$('#iconPick .ic-opt').forEach(x=>{x.style.background='var(--winter)';x.style.color='var(--muted)';x.style.borderColor='var(--border)';}); b.style.background='var(--brand-soft)';b.style.color='var(--brand)';b.style.borderColor='var(--brand)'; });
}

function saveSetor(id){
  const d = Object.fromEntries(new FormData($('#setorForm')).entries());
  if(!d.nome){ toast('Informe o nome do setor.','danger'); return; }
  if(id){ Store.setores.update(id,d); toast('Setor atualizado.'); }
  else { const r=Store.setores.create(d); Store.logAtividade(`Setor <b>${esc(r.nome)}</b> foi criado.`,'brand'); toast('Setor criado com sucesso.'); }
  Modal.close(); buildNav(); go('setores');
}

/* ---- Gerenciar membros do setor ---- */
function openSetorMembros(id){
  const s = Store.setores.get(id);
  const dentro = Store.colaboradores.list().filter(c=>c.setorId===id);
  const fora = Store.colaboradores.list().filter(c=>c.setorId!==id);
  Modal.open(`
    <div class="modal-head"><div class="u-center u-gap-12"><div class="ec-ic" style="width:38px;height:38px;border-radius:10px;background:${s.cor};color:#fff;display:flex;align-items:center;justify-content:center">${icon(s.icon||'layers')}</div><div><h2>Membros · ${esc(s.nome)}</h2><div class="sub">${dentro.length} pessoas neste setor</div></div></div>
      <button class="modal-close" onclick="Modal.close()">${icon('close')}</button></div>
    <div class="modal-body">
      <div style="font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin:4px 0 8px;">No setor</div>
      ${dentro.length? dentro.map(c=>`<div class="lrow"><div class="avatar sm" style="background:${c.cor}">${initials(c.nome)}</div><div class="lrow-main"><b>${esc(c.nome)}</b><span>${esc(cargoNome(c.cargoId))}</span></div><button class="btn btn-ghost btn-sm" onclick="moverSetor('${c.id}','','${id}')">Remover</button></div>`).join('') : `<p class="u-muted" style="font-size:13px;padding:6px 0 12px">Nenhum membro ainda.</p>`}
      <div style="font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin:18px 0 8px;">Adicionar de outros setores</div>
      <div style="max-height:220px;overflow:auto;">
      ${fora.map(c=>`<div class="lrow"><div class="avatar sm" style="background:${c.cor}">${initials(c.nome)}</div><div class="lrow-main"><b>${esc(c.nome)}</b><span>${esc(setorNome(c.setorId))}</span></div><button class="btn btn-soft btn-sm" onclick="moverSetor('${c.id}','${id}','${id}')">${icon('plus')} Adicionar</button></div>`).join('')}
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-primary" onclick="Modal.close();go('setores')">Concluir</button></div>`, true);
}
function moverSetor(colabId, novoSetor, reopen){
  Store.colaboradores.update(colabId, { setorId: novoSetor, cargoId: '' });
  toast(novoSetor?'Membro adicionado ao setor.':'Membro removido do setor.');
  buildNav(); openSetorMembros(reopen);
}

/* ============================================================
   VIEW · Cargos & Funções
   ============================================================ */
function renderCargos(root){
  const setores = Store.setores.list();
  root.innerHTML = `
    <div class="page-head">
      <div class="ph-titles"><h2>Cargos & Funções</h2><p>Defina as funções disponíveis em cada setor.</p></div>
      <div class="ph-actions"><button class="btn btn-primary" onclick="openCargoForm()">${icon('plus')} Novo cargo</button></div>
    </div>
    ${setores.map(s=>{
      const cargos = Store.cargos.list().filter(g=>g.setorId===s.id);
      return `<div class="card" style="margin-bottom:16px;">
        <div class="card-head">
          <div class="u-center u-gap-12"><span style="width:11px;height:11px;border-radius:4px;background:${s.cor}"></span><h3>${esc(s.nome)}</h3><span class="badge badge-neutral">${cargos.length} ${cargos.length===1?'cargo':'cargos'}</span></div>
          <button class="btn btn-ghost btn-sm" onclick="openCargoForm(null,'${s.id}')">${icon('plus')} Adicionar</button>
        </div>
        <div class="table-wrap">
        ${cargos.length? `<table class="data"><thead><tr><th>Cargo / Função</th><th>Nível</th><th>Pessoas</th><th></th></tr></thead>
          <tbody>${cargos.map(g=>{ const n=Store.colaboradores.list().filter(c=>c.cargoId===g.id).length; return `<tr>
            <td class="td-name">${esc(g.nome)}</td>
            <td><span class="badge badge-neutral">${esc(g.nivel||'—')}</span></td>
            <td class="u-mono">${n}</td>
            <td><div class="row-actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openCargoForm('${g.id}')">${icon('edit')}</button>
              <button class="btn btn-ghost btn-icon btn-sm" onclick="confirmDelete('cargos','${g.id}','${esc(g.nome)}')">${icon('trash')}</button>
            </div></td></tr>`; }).join('')}</tbody></table>`
          : `<p class="u-muted" style="font-size:13px;padding:16px 22px;">Nenhum cargo neste setor ainda.</p>`}
        </div>
      </div>`;
    }).join('')}`;
}

function openCargoForm(id, presetSetor){
  const editing=!!id;
  const g = editing? Store.cargos.get(id) : { setorId: presetSetor||'', nivel:'Pleno' };
  const setores = Store.setores.list();
  const niveis = ['Júnior','Pleno','Sênior','Especialista','Liderança'];
  Modal.open(`
    <div class="modal-head"><div><h2>${editing?'Editar cargo':'Novo cargo'}</h2><div class="sub">Defina a função e o setor ao qual pertence.</div></div>
      <button class="modal-close" onclick="Modal.close()">${icon('close')}</button></div>
    <form id="cargoForm" class="modal-body">
      <div class="field"><label>Nome do cargo / função <span class="field-req">*</span></label><input class="input" name="nome" value="${esc(g.nome||'')}" required placeholder="Ex.: Analista de Conteúdo"></div>
      <div class="input-group cols-2">
        <div class="field"><label>Setor <span class="field-req">*</span></label>
          <select class="select" name="setorId" required><option value="">Selecione...</option>
            ${setores.map(s=>`<option value="${s.id}" ${g.setorId===s.id?'selected':''}>${esc(s.nome)}</option>`).join('')}
          </select></div>
        <div class="field"><label>Nível</label>
          <select class="select" name="nivel">${niveis.map(n=>`<option ${g.nivel===n?'selected':''}>${n}</option>`).join('')}</select></div>
      </div>
    </form>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveCargo('${editing?id:''}')">${icon('check')} ${editing?'Salvar':'Criar cargo'}</button></div>`);
}
function saveCargo(id){
  const d = Object.fromEntries(new FormData($('#cargoForm')).entries());
  if(!d.nome || !d.setorId){ toast('Informe nome e setor.','danger'); return; }
  if(id){ Store.cargos.update(id,d); toast('Cargo atualizado.'); }
  else { const r=Store.cargos.create(d); Store.logAtividade(`Novo cargo <b>${esc(r.nome)}</b> criado em ${esc(setorNome(r.setorId))}.`,'brand'); toast('Cargo criado.'); }
  Modal.close(); go('cargos');
}

/* ============================================================
   VIEW · Documentos
   ============================================================ */
function renderDocumentos(root){
  const cols = Store.colaboradores.list().filter(c=>c.status!=='inativo');
  const mes = new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  // status de NF mock determinístico
  const nfStatus = c => (['c2','c5','c9'].includes(c.id)?'enviada':(['c7'].includes(c.id)?'pendente':'aguardando'));
  root.innerHTML = `
    <div class="page-head">
      <div class="ph-titles"><h2>Documentos</h2><p>Contratos e notas fiscais dos parceiros PJ.</p></div>
      <div class="ph-actions"><button class="btn btn-primary" onclick="toast('Envio de documento será conectado ao backend.')">${icon('upload')} Enviar documento</button></div>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">
      ${statCard('checkCircle','success', cols.filter(c=>nfStatus(c)==='enviada').length, 'NF enviadas · '+mes)}
      ${statCard('clock','warning', cols.filter(c=>nfStatus(c)==='pendente').length, 'NF pendentes')}
      ${statCard('file','brand', cols.length, 'Contratos ativos')}
    </div>

    <div class="card">
      <div class="card-head"><h3>Notas fiscais · ${mes}</h3>
        <a class="btn btn-ghost btn-sm" href="#" onclick="go('central');return false">${icon('info')} Como emitir NF</a>
      </div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Colaborador</th><th>Empresa (PJ)</th><th>Valor</th><th>Status NF</th><th></th></tr></thead>
        <tbody>${cols.map(c=>{
          const st=nfStatus(c);
          const badge = st==='enviada'?'<span class="badge badge-success"><span class="dot"></span>Enviada</span>':st==='pendente'?'<span class="badge badge-danger"><span class="dot"></span>Pendente</span>':'<span class="badge badge-neutral"><span class="dot"></span>Aguardando</span>';
          return `<tr>
            <td><div class="u-center u-gap-12"><div class="avatar sm" style="background:${c.cor}">${initials(c.nome)}</div><span class="td-name">${esc(c.nome)}</span></div></td>
            <td><div>${esc(c.razaoSocial||'—')}</div><div class="u-muted" style="font-size:11px">${esc(c.cnpj||'')}</div></td>
            <td class="u-mono">${fmtBRL(c.remuneracao)}</td>
            <td>${badge}</td>
            <td><div class="row-actions"><button class="btn btn-ghost btn-sm" onclick="toast('Visualização será conectada ao backend.')">${icon('eye')} Ver</button></div></td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`;
}

/* ============================================================
   VIEW · Central de dúvidas (embed)
   ============================================================ */
function renderCentral(root){
  root.innerHTML = `
    <div class="page-head">
      <div class="ph-titles"><h2>Central de Dúvidas</h2><p>Manual do colaborador — tutoriais de benefícios e processos.</p></div>
      <div class="ph-actions"><a class="btn btn-ghost" href="central-duvidas.html" target="_blank">${icon('link')} Abrir em nova aba</a></div>
    </div>
    <div class="card" style="overflow:hidden; padding:0;">
      <iframe src="central-duvidas.html" title="Central de Dúvidas 4JURIS" style="width:100%; height:calc(100vh - 220px); min-height:520px; border:none; display:block;"></iframe>
    </div>`;
}

/* ============================================================
   VIEW · Administração
   ============================================================ */
let adminTab = 'permissoes';
function renderAdmin(root){
  root.innerHTML = `
    <div class="page-head"><div class="ph-titles"><h2>Administração</h2><p>Controle de acessos, usuários e preferências do sistema.</p></div></div>
    <div class="tabs" id="adminTabs">
      <button class="tab ${adminTab==='permissoes'?'active':''}" data-tab="permissoes">Papéis & permissões</button>
      <button class="tab ${adminTab==='usuarios'?'active':''}" data-tab="usuarios">Usuários</button>
      <button class="tab ${adminTab==='empresa'?'active':''}" data-tab="empresa">Empresa</button>
      <button class="tab ${adminTab==='dados'?'active':''}" data-tab="dados">Dados</button>
    </div>
    <div id="adminBody"></div>`;
  $$('#adminTabs .tab').forEach(t=>t.onclick=()=>{ adminTab=t.dataset.tab; renderAdmin(root); });
  paintAdmin();
}

const PERMS = [
  { key:'colaboradores', nome:'Colaboradores', desc:'Ver, criar e editar colaboradores.' },
  { key:'setores', nome:'Setores', desc:'Criar e gerenciar setores.' },
  { key:'cargos', nome:'Cargos & funções', desc:'Definir funções e níveis.' },
  { key:'documentos', nome:'Documentos & NF', desc:'Acessar contratos e notas fiscais.' },
  { key:'admin', nome:'Administração', desc:'Gerenciar usuários e permissões.' },
];
const PERM_MATRIX = {
  admin:       { colaboradores:true, setores:true, cargos:true, documentos:true, admin:true },
  gestor:      { colaboradores:true, setores:true, cargos:true, documentos:false, admin:false },
  rh:          { colaboradores:true, setores:false, cargos:true, documentos:true, admin:false },
  colaborador: { colaboradores:false, setores:false, cargos:false, documentos:false, admin:false },
};

function paintAdmin(){
  const body = $('#adminBody');
  if(adminTab==='permissoes'){
    body.innerHTML = `
      <div class="grid-auto">
        ${Object.entries(Store.papeis).map(([k,p])=>`
          <div class="card card-pad">
            <div class="u-center u-gap-12" style="margin-bottom:14px;">
              <div class="stat-ic" style="width:40px;height:40px;margin:0;background:${k==='admin'?'var(--brand-soft)':'var(--winter)'};color:${k==='admin'?'var(--brand)':'var(--ink)'}">${icon(k==='admin'?'shield':k==='gestor'?'key':k==='rh'?'heart':'user')}</div>
              <div><b style="font-size:14.5px;color:var(--ink)">${p.nome}</b><div class="u-muted" style="font-size:12px">${p.desc}</div></div>
            </div>
            ${PERMS.map(pm=>`<div class="perm-row">
              <div class="perm-info"><b>${pm.nome}</b><span>${pm.desc}</span></div>
              <label class="switch"><input type="checkbox" ${PERM_MATRIX[k][pm.key]?'checked':''} ${k==='admin'?'disabled':''} onchange="togglePerm('${k}','${pm.key}',this.checked)"><span class="track"></span></label>
            </div>`).join('')}
          </div>`).join('')}
      </div>`;
  }
  else if(adminTab==='usuarios'){
    const us = Store.usuarios.list();
    body.innerHTML = `
      <div class="toolbar"><div class="spacer"></div><button class="btn btn-primary" onclick="openUsuarioForm()">${icon('plus')} Convidar usuário</button></div>
      <div class="card"><div class="table-wrap"><table class="data">
        <thead><tr><th>Usuário</th><th>E-mail</th><th>Papel</th><th>Status</th><th></th></tr></thead>
        <tbody>${us.map(u=>{
          const col = u.colaboradorId?Store.colaboradores.get(u.colaboradorId):null;
          const nome = col?col.nome:(u.nome||u.email);
          const cor = col?col.cor:'#122029';
          return `<tr>
            <td><div class="u-center u-gap-12"><div class="avatar sm" style="background:${cor}">${initials(nome)}</div><span class="td-name">${esc(nome)}</span></div></td>
            <td>${esc(u.email)}</td>
            <td><span class="badge ${u.papel==='admin'?'badge-brand':'badge-neutral'}">${esc(Store.papeis[u.papel]?.nome||u.papel)}</span></td>
            <td>${u.ativo?'<span class="badge badge-success"><span class="dot"></span>Ativo</span>':'<span class="badge badge-neutral"><span class="dot"></span>Inativo</span>'}</td>
            <td><div class="row-actions"><button class="btn btn-ghost btn-icon btn-sm" onclick="openUsuarioForm('${u.id}')">${icon('edit')}</button><button class="btn btn-ghost btn-icon btn-sm" onclick="confirmDelete('usuarios','${u.id}','${esc(nome)}')">${icon('trash')}</button></div></td>
          </tr>`;
        }).join('')}</tbody>
      </table></div></div>`;
  }
  else if(adminTab==='empresa'){
    body.innerHTML = `
      <div class="card card-pad" style="max-width:640px;">
        <h3 style="margin-bottom:4px;">Dados da empresa</h3>
        <p class="u-muted" style="font-size:13px; margin-bottom:22px;">Informações usadas em documentos e na emissão de NF.</p>
        <form id="empForm">
          <div class="field"><label>Razão social</label><input class="input" name="razao" value="4JURIS MARKETING LTDA"></div>
          <div class="input-group cols-2">
            <div class="field"><label>CNPJ</label><input class="input" name="cnpj" value="46.937.316/0001-05"></div>
            <div class="field"><label>E-mail financeiro</label><input class="input" name="fin" value="financeiro@4juris.com.br"></div>
          </div>
          <div class="field"><label>E-mail do RH</label><input class="input" name="rh" value="rh@4juris.com.br"></div>
          <button type="button" class="btn btn-primary" onclick="toast('Preferências salvas.')">${icon('check')} Salvar preferências</button>
        </form>
      </div>`;
  }
  else if(adminTab==='dados'){
    body.innerHTML = `
      <div class="card card-pad" style="max-width:560px;">
        <h3 style="margin-bottom:4px;">Dados de demonstração</h3>
        <p class="u-muted" style="font-size:13px; margin-bottom:20px;">Este ambiente usa dados fictícios guardados no seu navegador (localStorage). Ao conectar o backend, esta camada será substituída pela API.</p>
        <div class="callout" style="background:var(--warning-soft);border:1px solid #ecd9a8;border-radius:var(--r-md);padding:14px 16px;display:flex;gap:11px;margin-bottom:20px;">
          ${icon('alert')}<p style="margin:0;font-size:13px;color:#7a5b12;line-height:1.55">Restaurar os dados apaga todas as alterações feitas (colaboradores, setores e cargos criados) e volta ao conjunto inicial.</p>
        </div>
        <button class="btn btn-danger" onclick="if(confirm('Restaurar todos os dados de demonstração?')){Store.reset();buildNav();toast('Dados restaurados.');go('dashboard');}">${icon('trash')} Restaurar dados iniciais</button>
      </div>`;
  }
}
function togglePerm(papel,key,val){ PERM_MATRIX[papel][key]=val; toast('Permissão atualizada.'); }

function openUsuarioForm(id){
  const editing=!!id;
  const u = editing?Store.usuarios.get(id):{ papel:'colaborador', ativo:true };
  Modal.open(`
    <div class="modal-head"><div><h2>${editing?'Editar usuário':'Convidar usuário'}</h2><div class="sub">Defina o acesso desta pessoa ao sistema.</div></div>
      <button class="modal-close" onclick="Modal.close()">${icon('close')}</button></div>
    <form id="usuarioForm" class="modal-body">
      <div class="field"><label>E-mail <span class="field-req">*</span></label><input class="input" type="email" name="email" value="${esc(u.email||'')}" required placeholder="pessoa@4juris.com.br"></div>
      <div class="field"><label>Papel de acesso</label>
        <select class="select" name="papel">${Object.entries(Store.papeis).map(([k,p])=>`<option value="${k}" ${u.papel===k?'selected':''}>${p.nome}</option>`).join('')}</select></div>
      <label class="switch" style="margin-top:6px;"><input type="checkbox" name="ativo" ${u.ativo?'checked':''}><span class="track"></span><span class="switch-label">Usuário ativo</span></label>
    </form>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveUsuario('${editing?id:''}')">${icon('check')} ${editing?'Salvar':'Enviar convite'}</button></div>`);
}
function saveUsuario(id){
  const f=$('#usuarioForm'); const d=Object.fromEntries(new FormData(f).entries());
  d.ativo = !!f.ativo.checked;
  if(!d.email){ toast('Informe o e-mail.','danger'); return; }
  if(id){ Store.usuarios.update(id,d); toast('Usuário atualizado.'); }
  else { Store.usuarios.create(d); toast('Convite enviado (mock).'); }
  Modal.close(); paintAdmin();
}

/* ============================================================
   Helpers de exclusão / util
   ============================================================ */
function confirmDelete(coll, id, nome){
  Modal.open(`
    <div class="modal-head"><div class="u-center u-gap-12"><div class="stat-ic warning" style="width:42px;height:42px;margin:0;background:var(--danger-soft);color:var(--danger)">${icon('alert')}</div><div><h2>Excluir</h2><div class="sub">Esta ação não pode ser desfeita.</div></div></div>
      <button class="modal-close" onclick="Modal.close()">${icon('close')}</button></div>
    <div class="modal-body"><p style="font-size:14px;color:var(--text-soft);line-height:1.6">Tem certeza que deseja excluir <b style="color:var(--ink)">${esc(nome)}</b>? ${coll==='setores'?'Os colaboradores deste setor ficarão sem setor definido.':''}</p></div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-danger" onclick="doDelete('${coll}','${id}','${esc(nome)}')">${icon('trash')} Sim, excluir</button></div>`);
}
function doDelete(coll,id,nome){
  Store[coll].remove(id);
  Store.logAtividade(`<b>${esc(nome)}</b> foi removido(a).`,'warning');
  Modal.close(); buildNav(); toast(`"${nome}" excluído(a).`,'danger');
  go(currentRoute);
}

function exportCSV(){
  const rows = [['Nome','Email','Setor','Cargo','Status','CNPJ','Remuneracao','Cidade','UF']];
  filteredColabs().forEach(c=>rows.push([c.nome,c.email,setorNome(c.setorId),cargoNome(c.cargoId),STATUS[c.status].label,c.cnpj,c.remuneracao,c.cidade,c.uf]));
  const csv = rows.map(r=>r.map(f=>`"${String(f||'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a'); a.href=url; a.download='colaboradores-4juris.csv'; a.click(); URL.revokeObjectURL(url);
  toast('CSV exportado.');
}

function emptyState(ic,title,desc,action,actionLabel){
  return `<div class="card"><div class="empty"><div class="empty-ic">${icon(ic)}</div><h3>${title}</h3><p>${desc}</p>${action?`<button class="btn btn-primary" onclick="${action}">${icon('plus')} ${actionLabel}</button>`:''}</div></div>`;
}

const setorNome = id => Store.setores.get(id)?.nome || 'Sem setor';
const cargoNome = id => Store.cargos.get(id)?.nome || 'Sem cargo';

/* ============================================================
   Topbar / global
   ============================================================ */
function initChrome(){
  $('#menuBtn').innerHTML = icon('menu');
  $('#btnCentral').innerHTML = icon('book');
  $('#btnBell').innerHTML = icon('bell');
  $('#logoutBtn').innerHTML = icon('logout');
  $('#btnQuickAdd').innerHTML = `${icon('plus')} Novo`;

  $('#menuBtn').onclick = () => $('#app').classList.toggle('nav-open');
  $('#scrim').onclick = () => $('#app').classList.remove('nav-open');
  $('#btnCentral').onclick = () => go('central');
  $('#btnQuickAdd').onclick = () => openColaboradorForm();
  $('#btnBell').onclick = () => openNotifs();
  $('#logoutBtn').onclick = (e)=>{ e.stopPropagation(); try{sessionStorage.removeItem('4juris_auth');}catch(_){}; location.href='login.html'; };
  $('#sideUser').onclick = () => go('admin');

  const gs = $('#globalSearch');
  gs.addEventListener('keydown', e => { if(e.key==='Enter'){ uiState.colabQuery=gs.value; go('colaboradores'); } });
}

function openNotifs(){
  const ats = Store.atividades.list().slice(0,8);
  Modal.open(`
    <div class="modal-head"><div><h2>Notificações</h2><div class="sub">Atividades recentes do sistema</div></div>
      <button class="modal-close" onclick="Modal.close()">${icon('close')}</button></div>
    <div class="modal-body"><div class="timeline">
      ${ats.map(a=>`<div class="tl-item"><span class="tl-dot ${a.kind||'brand'}"></span><p>${a.texto}</p><time>${relTime(a.data)}</time></div>`).join('')}
    </div></div>
    <div class="modal-foot"><button class="btn btn-primary" onclick="Modal.close()">Fechar</button></div>`);
}

/* -------------------- Boot -------------------- */
window.addEventListener('hashchange', () => { const r=location.hash.replace('#',''); if(r && r!==currentRoute) go(r); });
initChrome();
buildNav();
go(location.hash.replace('#','') || 'dashboard');
