import {unisuperProducts} from './unisuper-produtos.js'
import {novosProdutos} from './novos-produtos.js'
import {osanaProducts} from './osana-produtos.js'
const offers = [...osanaProducts, ...unisuperProducts, ...novosProdutos]

const grid = document.querySelector('#offer-grid')
const searchBanner = document.querySelector(".flyer-intro")
const search = document.querySelector('#search-input')
const neighborhood = document.querySelector('#neighborhood-filter')
const resultCount = document.querySelector('#result-count')
const emptyState = document.querySelector('#empty-state')
const clearSearch = document.querySelector('#clear-search')

const money = value => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()

const stores = []
stores.push({
  id:'super-osana',
  name:'Supermercados Osana',
  demo:true,
  logo:'/logo-osana.png',
  validFrom:'2026-06-06',
  validUntil:'2026-06-06',
  validityLabel:'Encarte de teste · Oferta originalmente válida em 06/06/2026',
  pages:['/superosana.png'],
  branches:[
    {label:'Guarani', neighborhood:'Guarani', address:'Rua Joaquim Pedro Soares, 1013, Novo Hamburgo'},
    {label:'Ideal', neighborhood:'Ideal', address:'Av. Cel. Frederico Linck, 815, Novo Hamburgo'},
    {label:'Roselândia', neighborhood:'Roselândia', address:'Rua Francisco Alves, 325, Novo Hamburgo'},
    {label:'Via Rosa', neighborhood:'Via Rosa', address:'Rua Vinte e Quatro de Maio, 440, Novo Hamburgo'}
  ]
})

stores.push({id:'rede-unisuper',name:'Rede Unisuper',logo:'/assets/unisuper-logo-branco.png',validUntil:'2026-09-20',pages:[1,2,3,4].map(n=>`/encartes/unisuper/pagina-0${n}.jpg`),branches:[{neighborhood:'Pátria Nova',address:'Rua Primeiro de Março, 2131, Pátria Nova - Novo Hamburgo'},{neighborhood:'Rondônia',address:'Rua Guilherme Growermann, 515, Rondônia - Novo Hamburgo'}]})
for(const name of ['Pátria Nova','Rondônia']){if(![...neighborhood.options].some(o=>o.value===name)){const option=document.createElement('option');option.value=name;option.textContent=name;neighborhood.append(option)}}
// ofersul-card-v1
stores.push({
  id:'ofersul', name:'Ofersul NH',
  logo:'/assets/ofersul-logo.jpg',
  validFrom:'2026-09-21', validUntil:'2026-09-21',
  validityLabel:'Encarte de teste · Ofertas originalmente válidas em 21/09/2026',
  pages:['/encartes/ofersul/pagina-01.jpg','/encartes/ofersul/pagina-02.jpg'],
  branches:[{neighborhood:'Ouro Branco',address:'Rua Bento Gonçalves, 335, Ouro Branco - Novo Hamburgo'}]
})
const flyerDateToday=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date())
const flyerIsCurrent=(store,today=flyerDateToday())=>store.demo===true||store.id==='ofersul'||!store.validFrom||(!store.validUntil?today>=store.validFrom:today>=store.validFrom&&today<=store.validUntil)
// super-juca-card-v1
stores.push({
  id:'super-juca',name:'Super Juca',demo:true,
  logo:'/assets/super-juca-logo.png',
  validFrom:'2026-09-18',validUntil:'2026-09-21',
  validityLabel:'Encarte de teste · Ofertas originalmente válidas de 18 a 21/09/2026',
  pages:['/encartes/super-juca/pagina-01.jpg'],
  branches:[
    {label:'Industrial',neighborhood:'Industrial',address:'Rua Pinheiro Machado, 415, Industrial - Novo Hamburgo'},
    {label:'Loja 1 · Santo Afonso',neighborhood:'Santo Afonso',address:'Rua Visconde de Araguaia, 331, Santo Afonso - Novo Hamburgo'},
    {label:'Loja 2 · Santo Afonso',neighborhood:'Santo Afonso',address:'Rua Carlos Afonso Braunger, 279, Santo Afonso - Novo Hamburgo'}
  ]
})
for(const store of stores) for(const branch of store.branches||[]) {
  if(![...neighborhood.options].some(option=>option.value===branch.neighborhood)) {
    const option=document.createElement('option');option.value=branch.neighborhood;option.textContent=branch.neighborhood;neighborhood.append(option)
  }
}
let favorites = []
let activeFlyerZoom = null
const zoomLevels = [100, 125, 150, 175, 200, 250, 300]
function setupFlyerZoom(card) {
  const image=card.querySelector('.full-flyer')
  const viewer=document.createElement('div');viewer.className='flyer-viewer'
  const viewport=document.createElement('div');viewport.className='flyer-viewport';viewport.tabIndex=0
  viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Encarte ampliável')
  image.before(viewer);viewer.append(viewport);viewport.append(image)
  const pager=card.querySelector('.flyer-pages')
  if(pager){
    viewer.append(pager)
    pager.querySelector('[data-page-step="-1"]').innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4-8 8 8 8"/></svg>'
    pager.querySelector('[data-page-step="1"]').innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8"/></svg>'
  }
  const control=document.createElement('div');control.className='flyer-zoom viewer-zoom'
  control.setAttribute('role','group');control.setAttribute('aria-label','Zoom do encarte')
  control.innerHTML=`<button type="button" data-zoom-minus aria-label="Diminuir zoom">−</button><button type="button" data-zoom-reset aria-label="Voltar para 100%">100%</button><button type="button" data-zoom-plus aria-label="Aumentar zoom">+</button>`
  viewer.append(control)
  const minus=control.querySelector('[data-zoom-minus]'),plus=control.querySelector('[data-zoom-plus]'),reset=control.querySelector('[data-zoom-reset]')
  let level=100
  const state={card,viewport,control,setZoom};card.flyerZoomState=state
  function setZoom(value){
    if(!zoomLevels.includes(value))return
    if(value>100&&activeFlyerZoom&&activeFlyerZoom!==state)activeFlyerZoom.setZoom(100,false)
    const ratio=value/level;level=value;image.style.width=`${level}%`
    viewport.scrollLeft=level===100?0:viewport.scrollLeft*ratio
    minus.disabled=level===100;plus.disabled=level===300
    control.setAttribute('aria-label',`Zoom do encarte: ${level}%`)
    reset.title=`Zoom atual: ${level}%. Voltar para 100%`
    if(level>100)activeFlyerZoom=state
    else if(activeFlyerZoom===state)activeFlyerZoom=null
  }
  minus.addEventListener('click',()=>setZoom(zoomLevels[Math.max(0,zoomLevels.indexOf(level)-1)]))
  plus.addEventListener('click',()=>setZoom(zoomLevels[Math.min(zoomLevels.length-1,zoomLevels.indexOf(level)+1)]))
  reset.addEventListener('click',()=>setZoom(100))
  card.resetFlyerZoom=()=>setZoom(100)
  setZoom(100)
}
function updateFloatingZoom() {
  // Compatibility with existing render(): controls are now attached to each viewer.
}
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&activeFlyerZoom)activeFlyerZoom.setZoom(100)
})
try { favorites = JSON.parse(localStorage.getItem('buscaPrecoFavorites') || '[]'); if (!Array.isArray(favorites)) favorites=[] } catch {}
const flyerState = new Map()
function stateFor(store) {
  if (!flyerState.has(store.id)) flyerState.set(store.id, {page:0, branch:0})
  return flyerState.get(store.id)
}
function directionsFor(store) {
  const branch=store.branches?.[stateFor(store).branch]
  return branch ? 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(branch.address+', RS, Brasil') : ''
}
function validityFor(store) {
  if(store.validityLabel)return store.validityLabel
  if (!store.validUntil) return 'Validade a confirmar · Encarte demonstrativo'
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date())
  return (today>store.validUntil?'Encerrado · ':'')+'Válido de 18 a 20/09/2026 · Enquanto durarem os estoques'
}
function renderFlyers(){
  activeFlyerZoom = null
  const list=document.querySelector('#flyer-list')
  const visible=stores.filter(s=>flyerIsCurrent(s)&&(neighborhood.value==='all'||s.neighborhood===neighborhood.value||s.branches?.some(b=>b.neighborhood===neighborhood.value)))
    .sort((a,b)=>Number(favorites.includes(b.id))-Number(favorites.includes(a.id)))
  list.innerHTML=visible.map(s=>{
    const state=stateFor(s),pages=s.pages||[s.flyer]
    const matching=s.branches?.findIndex(b=>b.neighborhood===neighborhood.value)
    if(matching>=0&&s.branches[state.branch]?.neighborhood!==neighborhood.value)state.branch=matching
    const branch=s.branches?.[state.branch]
    return `<article class="flyer-card" id="${s.id}">
      <header class="flyer-heading">
        ${s.logo?`<img src="${s.logo}" alt="Logotipo ${s.name}" />`:''}
        <div class="flyer-heading-details"><h2>${s.name}</h2><p>${s.branches?'Novo Hamburgo':s.neighborhood+' · Novo Hamburgo'}</p>
        ${branch?`<div class="branch-selector" role="group" aria-label="Escolha a filial">${s.branches.map((b,i)=>`<button type="button" data-branch="${i}" aria-pressed="${state.branch===i}">${b.label||b.neighborhood}</button>`).join('')}</div><p class="branch-address" aria-live="polite">${branch.address}</p>`:''}
        <span class="flyer-validity">${validityFor(s)}</span></div>
      </header>
      <img class="full-flyer" src="${pages[state.page]}" alt="Encarte ${s.name}, página ${state.page+1} de ${pages.length}" />
      ${pages.length>1?`<nav class="flyer-pages" aria-label="Páginas do encarte"><button type="button" data-page-step="-1" aria-label="Página anterior" ${state.page===0?'disabled':''}>‹</button><span aria-live="polite">${state.page+1} de ${pages.length}</span><button type="button" data-page-step="1" aria-label="Próxima página" ${state.page===pages.length-1?'disabled':''}>›</button></nav>`:''}
      <div class="flyer-actions">
        <button data-share="${s.id}">Compartilhar</button>
        ${branch?`<a class="flyer-directions" href="${directionsFor(s)}" target="_blank" rel="noopener noreferrer">Como chegar</a>`:`<button data-directions="${s.id}">Como chegar</button>`}
        <button data-favorite="${s.id}" aria-pressed="${favorites.includes(s.id)}">${favorites.includes(s.id)?'★ Favoritada':'☆ Favoritar loja'}</button>
      </div></article>`
  }).join('')||'<div class="empty-state"><strong>Nenhum encarte neste bairro</strong><p>Escolha todos os bairros para ver os encartes disponíveis.</p></div>'
  list.querySelectorAll('.flyer-card').forEach(setupFlyerZoom)
}
document.querySelector('#flyer-list').addEventListener('click', async event=>{
  const button=event.target.closest('button')
  if(!button)return
  const card=button.closest('.flyer-card'),store=stores.find(s=>s.id===card?.id)
  if(!store)return
  const state=stateFor(store)
  if(button.dataset.branch!==undefined){
    state.branch=Number(button.dataset.branch)
    card.querySelectorAll('[data-branch]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.branch)===state.branch)))
    card.querySelector('.branch-address').textContent=store.branches[state.branch].address
    card.querySelector('.flyer-directions').href=directionsFor(store)
  }else if(button.dataset.pageStep){
    const pages=store.pages||[store.flyer]
    state.page=Math.max(0,Math.min(pages.length-1,state.page+Number(button.dataset.pageStep)))
    card.resetFlyerZoom?.()
    const image=card.querySelector('.full-flyer')
    image.src=pages[state.page];image.alt=`Encarte ${store.name}, página ${state.page+1} de ${pages.length}`
    card.querySelector('.flyer-pages span').textContent=`${state.page+1} de ${pages.length}`
    card.querySelector('[data-page-step="-1"]').disabled=state.page===0
    card.querySelector('[data-page-step="1"]').disabled=state.page===pages.length-1
    // Page changes stay inside the viewer without scrolling the site.
  }else if(button.dataset.favorite){
    const id=store.id
    const adding=!favorites.includes(id)
    favorites=adding?[...favorites,id]:favorites.filter(x=>x!==id)
    let saved=true
    try{localStorage.setItem('buscaPrecoFavorites',JSON.stringify(favorites))}catch{saved=false}
    renderFlyers()
    const favoriteButton=document.querySelector('[data-favorite="'+id+'"]')
    favoriteButton?.focus({preventScroll:true})
    if(adding)showFavoriteModal(favoriteButton,saved)
    else showToast('Loja removida dos favoritos.')
  }else if(button.dataset.directions){
    showToast('O endereço desta loja será confirmado antes de disponibilizar a rota.')
  }else if(button.dataset.share){
    const branch=store.branches?.[state.branch]
    const data={title:store.name+' — Meu Busca Preço',text:'Veja o encarte de '+store.name+(branch?' · '+branch.address:''),url:location.origin+'/#'+store.id}
    try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);showToast('Link do encarte copiado.')}}catch(e){if(e.name!=='AbortError')showToast('Não foi possível compartilhar. Tente novamente.')}
  }
})
// busca-real-v1: indexed from the four original Unisuper flyer pages.
const escapeOffer = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const searchWords = value => normalize(value).replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean)
for(const option of [...neighborhood.options]) {
  if(option.value!=='all' && !offers.some(item=>item.neighborhoods.includes(option.value)) && !stores.some(store=>store.neighborhood===option.value||store.branches?.some(branch=>branch.neighborhood===option.value))) option.remove()
}
resultCount.setAttribute('aria-live','polite')
function offerValidity(item) {
  const today = new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date())
  const end = item.validUntil.split('-').reverse().join('/')
  return today>item.validUntil ? 'Oferta encerrada em '+end : today<item.validFrom ? 'Válida de '+item.validFrom.split('-').reverse().join('/')+' a '+end : 'Válida até '+end
}

const SEARCH_EQUIVALENTS = {
  "frango": ["frango","coxa","sobrecoxa","coxinha da asa","peito de frango","galinha"],
  "cafe": ["cafe"],
  "sabonete": ["sabonete"],
  "shampoo": ["shampoo"],
  "detergente": ["detergente","deterg"],
  "amaciante": ["amaciante"],
  "desinfetante": ["desinfetante"],
  "limpador": ["limpador","limpa casa","multiuso"],
  "multiuso": ["multiuso","limpador","limpa casa"],
  "papel higienico": ["papel higienico"],
  "papel toalha": ["papel toalha"],
  "creme dental": ["creme dental","pasta de dente"],
  "pasta de dente": ["pasta de dente","creme dental"],
  "carne": ["file mignon","picanha","coxao","patinho","tatu","chuleta","agulha","paleta bovina","musculo"],
  "porco": ["suino","suina","porco","carre","pernil","costela suina"],
  "carne suina": ["suino","suina","porco","carre","pernil","costela suina"]
};

function matchesSearch(text, words, fullSearch){
  if(words.every(word => text.includes(word))) return true;

  for(const [term, equivalents] of Object.entries(SEARCH_EQUIVALENTS)){
    if(fullSearch === term || fullSearch.includes(term)){
      if(equivalents.some(eq => text.includes(eq))) return true;
    }
  }

  return false;
}

function render(){
  if(activeFlyerZoom) activeFlyerZoom.setZoom(100,false)
  const term = search.value.trim()
  if (searchBanner) searchBanner.style.display = term ? "none" : "";
  document.querySelector('#search-order-title').hidden = !term
  document.querySelector('.offers-section').hidden = !term
  document.querySelector('#flyer-list').hidden = !!term
  updateFloatingZoom()
  if(!term){renderFlyers();clearSearch.hidden=true;return}
  const words=searchWords(term)
  const filtered=offers.filter(item=>{
    const text=searchWords(`${item.name} ${item.brand} ${item.size} ${item.market} ${item.category}`).join(' ')
    return matchesSearch(text,words,normalize(term)) &&
      (neighborhood.value==='all'||item.neighborhoods.includes(neighborhood.value))
  })
  filtered.sort((a,b)=>a.price-b.price)
  grid.innerHTML=filtered.map(item=>{
    const [x,y,width,height]=item.region
    const pageWidth=item.sourceWidth||({1:1117,2:1138,3:1136,4:1070}[item.page])
    const pageHeight=item.sourceHeight||1536
    const aspect=(width*pageWidth)/(height*pageHeight)
    const sourceStyle=`aspect-ratio:${aspect};background-image:url('${item.image}');background-size:${100/width}% ${100/height}%;background-position:${x/(1-width)*100}% ${y/(1-height)*100}%`
    const branch=neighborhood.value==='all'?item.neighborhoods.join(' · '):neighborhood.value
    return `<article class="offer-card real-offer" data-offer-id="${item.id}">
      <div class="offer-source-wrap"><div class="offer-source" role="img" aria-label="${escapeOffer('Oferta de '+item.name+' '+item.brand+' na página '+item.page+' do encarte')}" style="${sourceStyle}"></div></div>
      <div class="offer-content">
        <h3>${escapeOffer(item.name)}</h3>
        <p class="offer-size">${escapeOffer([item.brand,item.size].filter(Boolean).join(' · '))}</p>
        <div class="real-price"><strong>${money(item.price)}</strong><span>Preço anunciado${item.size==='kg'?' por kg':''}</span></div>
        ${item.clubPrice!==null?`<p class="offer-condition">${escapeOffer(item.market==='Rede Unisuper'?'Meu UniSuper':'Preço especial')}: <strong>${money(item.clubPrice)}</strong> · preço do clube</p>`:''}
        ${item.bulk?`<p class="offer-condition">Levando ${item.bulk.quantity} unidades: <strong>${money(item.bulk.price)} cada</strong></p>`:''}
        <p class="real-market">${escapeOffer(item.market)} · ${escapeOffer(branch)}</p>
        <p class="real-validity">${offerValidity(item)} · Enquanto durarem os estoques</p>
      </div>
    </article>`
  }).join('')
  resultCount.textContent=`${filtered.length} ${filtered.length===1?'oferta':'ofertas'}`
  emptyState.hidden=filtered.length>0
  clearSearch.hidden=false
}
search.addEventListener('input',render)
neighborhood.addEventListener('change',render)
clearSearch.addEventListener('click',()=>{search.value='';search.focus();render()})
let installPrompt
const installButton = document.querySelector('#install-button')
const toast = document.querySelector('#toast')
function showToast(message){toast.textContent=message;toast.classList.add('visible');setTimeout(()=>toast.classList.remove('visible'),2800)}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event})
installButton.addEventListener('click',async()=>{
  if(!installPrompt){showToast('No Android, abra o menu do navegador e escolha “Instalar aplicativo”.');return}
  await installPrompt.prompt();installPrompt=null
})
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))
render()

// pesquisa-limpa-v1

// Atualiza a validade na virada do dia, inclusive ao retornar ao aplicativo.
let lastFlyerDate=flyerDateToday()
function refreshFlyerDate(){
  const today=flyerDateToday()
  if(today!==lastFlyerDate){lastFlyerDate=today;render()}
}
setInterval(refreshFlyerDate,1000)
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshFlyerDate()})
window.addEventListener('pageshow',refreshFlyerDate)

// favoritos-modal-v1
let favoriteModalTimer
function showFavoriteModal(trigger,saved=true){
  let dialog=document.querySelector('#favorite-modal')
  if(!dialog){
    dialog=document.createElement('dialog')
    dialog.id='favorite-modal'
    dialog.setAttribute('aria-labelledby','favorite-modal-title')
    dialog.setAttribute('aria-describedby','favorite-modal-message favorite-modal-notice')
    dialog.innerHTML=`<button type="button" class="favorite-modal-close" aria-label="Fechar aviso">×</button><span class="favorite-modal-star" aria-hidden="true">★</span><h2 id="favorite-modal-title">Loja favoritada!</h2><p id="favorite-modal-message">As lojas favoritas aparecem primeiro na lista e você recebe uma notificação sempre que um novo encarte for adicionado.</p><p id="favorite-modal-notice">Avisos de novos encartes ainda não estão ativos nesta versão de teste.</p><p class="favorite-modal-storage" hidden>Não foi possível salvar neste aparelho. A seleção vale enquanto esta página estiver aberta.</p>`
    document.body.append(dialog)
    dialog.querySelector('button').addEventListener('click',()=>dialog.close())
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}})
    dialog.addEventListener('close',()=>{clearTimeout(favoriteModalTimer);if(dialog.returnFocus?.isConnected)dialog.returnFocus.focus({preventScroll:true})})
  }
  clearTimeout(favoriteModalTimer)
  dialog.returnFocus=trigger
  dialog.querySelector('.favorite-modal-storage').hidden=saved
  if(!dialog.open)dialog.showModal()
  favoriteModalTimer=setTimeout(()=>dialog.close(),7000)
}
