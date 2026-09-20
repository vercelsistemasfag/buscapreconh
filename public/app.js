const offers = [
  { name:'Molho de Tomate Tradicional', brand:'Oderich', size:'300 g', price:1.29, unitPrice:4.30, unitLabel:'kg', market:'Super Mariani', neighborhood:'Canudos', category:'Mercearia', image:'/assets/molho.jpg', valid:'Válida hoje', demo:false },
  { name:'Macarrão Instantâneo', brand:'Isabela', size:'75 g', price:1.49, unitPrice:19.87, unitLabel:'kg', market:'Mercado parceiro', neighborhood:'Centro', category:'Mercearia', image:'/assets/molho.jpg', valid:'Até 20/09', demo:true },
  { name:'Feijão-preto', brand:'Capellini', size:'1 kg', price:5.99, unitPrice:5.99, unitLabel:'kg', market:'Super Mariani', neighborhood:'Canudos', category:'Mercearia', image:'/assets/feijao.jpg', valid:'Válida hoje', demo:false },
  { name:'Feijão-preto Tipo 1', brand:'Marca demonstrativa', size:'1 kg', price:6.49, unitPrice:6.49, unitLabel:'kg', market:'Mercado parceiro', neighborhood:'Santo Afonso', category:'Mercearia', image:'/assets/feijao.jpg', valid:'Até 20/09', demo:true },
  { name:'Atum Ralado ao Natural', brand:'Fantasia Di Mare', size:'170 g', price:5.79, unitPrice:34.06, unitLabel:'kg', market:'Super Mariani', neighborhood:'Canudos', category:'Mercearia', image:'/assets/atum.jpg', valid:'Válida hoje', demo:false },
  { name:'Achocolatado em Pó', brand:'Nescau', size:'500 g', price:13.69, unitPrice:27.38, unitLabel:'kg', market:'Super Mariani', neighborhood:'Canudos', category:'Bebidas', image:'/assets/achocolatado.jpg', valid:'Válida hoje', demo:false },
  { name:'Achocolatado em Pó', brand:'Marca demonstrativa', size:'400 g', price:11.90, unitPrice:29.75, unitLabel:'kg', market:'Mercado parceiro', neighborhood:'Centro', category:'Bebidas', image:'/assets/achocolatado.jpg', valid:'Até 20/09', demo:true },
  { name:'Creme Dental Tripla Limpeza', brand:'Sorriso', size:'120 g', price:4.49, unitPrice:37.42, unitLabel:'kg', market:'Super Mariani', neighborhood:'Canudos', category:'Higiene', image:'/assets/achocolatado.jpg', valid:'Válida hoje', demo:false }
]

const grid = document.querySelector('#offer-grid')
const search = document.querySelector('#search-input')
const neighborhood = document.querySelector('#neighborhood-filter')
const sort = document.querySelector('#sort-filter')
const resultCount = document.querySelector('#result-count')
const emptyState = document.querySelector('#empty-state')
const clearSearch = document.querySelector('#clear-search')
let activeCategory = 'all'

const money = value => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()

const stores = []
stores.push({id:'rede-unisuper',name:'Rede Unisuper',logo:'/assets/unisuper-logo.png',validUntil:'2026-09-20',pages:[1,2,3,4].map(n=>`/encartes/unisuper/pagina-0${n}.jpg`),branches:[{neighborhood:'Pátria Nova',address:'Rua Primeiro de Março, 2131, Pátria Nova - Novo Hamburgo'},{neighborhood:'Rondônia',address:'Rua Guilherme Growermann, 515, Rondônia - Novo Hamburgo'}]})
for(const name of ['Pátria Nova','Rondônia']){if(![...neighborhood.options].some(o=>o.value===name)){const option=document.createElement('option');option.value=name;option.textContent=name;neighborhood.append(option)}}
let favorites = []
let activeFlyerZoom = null
const zoomLevels = [100, 125, 150, 175, 200, 250, 300]
function setupFlyerZoom(card) {
  const image = card.querySelector('.full-flyer')
  const viewport = document.createElement('div')
  viewport.className = 'flyer-viewport'
  viewport.tabIndex = 0
  viewport.setAttribute('role', 'region')
  viewport.setAttribute('aria-label', 'Encarte ampliável; use as setas para navegar')
  image.before(viewport)
  viewport.append(image)
  const dock = document.createElement('div')
  dock.className = 'flyer-zoom-dock'
  dock.innerHTML = `<div class="flyer-zoom" role="group" aria-label="Zoom do encarte">
    <button type="button" data-zoom-minus aria-label="Diminuir zoom">−</button>
    <select aria-label="Zoom do encarte; selecione 100% para restaurar">${zoomLevels.map(value => `<option value="${value}">${value}%</option>`).join('')}</select>
    <button type="button" data-zoom-plus aria-label="Aumentar zoom">+</button>
  </div>`
  card.querySelector('.flyer-actions').before(dock)
  const control = dock.firstElementChild
  const select = control.querySelector('select')
  const minus = control.querySelector('[data-zoom-minus]')
  const plus = control.querySelector('[data-zoom-plus]')
  let level = 100
  const state = { card, control, setZoom }
  function setZoom(value, navigate = true) {
    if (!zoomLevels.includes(value)) return
    const starting = level === 100 && value > 100
    if (value > 100 && activeFlyerZoom && activeFlyerZoom !== state) activeFlyerZoom.setZoom(100, false)
    const ratio = value / level
    level = value
    image.style.width = `${level}%`
    viewport.scrollLeft = level === 100 ? 0 : viewport.scrollLeft * ratio
    select.value = String(level)
    minus.disabled = level === 100
    plus.disabled = level === 300
    control.classList.toggle('is-floating', level > 100)
    activeFlyerZoom = level > 100 ? state : null
    if (navigate && starting) viewport.scrollIntoView({ block: 'start', behavior: 'instant' })
    if (navigate && level === 100) {
      select.focus({ preventScroll: true })
      control.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    }
    updateFloatingZoom()
  }
  select.addEventListener('change', () => setZoom(Number(select.value)))
  minus.addEventListener('click', () => setZoom(zoomLevels[Math.max(0, zoomLevels.indexOf(level) - 1)]))
  plus.addEventListener('click', () => setZoom(zoomLevels[Math.min(zoomLevels.length - 1, zoomLevels.indexOf(level) + 1)]))
  card.resetFlyerZoom = () => setZoom(100, false)
  setZoom(100, false)
}
function updateFloatingZoom() {
  if (!activeFlyerZoom) return
  const { card, control } = activeFlyerZoom
  const rect = card.getBoundingClientRect()
  const list = document.querySelector('#flyer-list')
  const bounds = document.querySelector('#content-scroll').getBoundingClientRect()
  control.classList.toggle('is-floating', !list.hidden && rect.bottom > bounds.top && rect.top < bounds.bottom)
  control.style.right = `${Math.max(12, window.innerWidth - bounds.right + 12)}px`
  control.style.bottom = `${Math.max(12, window.innerHeight - bounds.bottom + 12)}px`
}
let zoomScrollPending = false
document.querySelector('#content-scroll').addEventListener('scroll', () => {
  if (zoomScrollPending || !activeFlyerZoom) return
  zoomScrollPending = true
  requestAnimationFrame(() => { zoomScrollPending = false; updateFloatingZoom() })
}, { passive: true })
window.addEventListener('resize', updateFloatingZoom)
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && activeFlyerZoom) activeFlyerZoom.setZoom(100)
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
  if (!store.validUntil) return 'Validade a confirmar · Encarte demonstrativo'
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date())
  return (today>store.validUntil?'Encerrado · ':'')+'Válido de 18 a 20/09/2026 · Enquanto durarem os estoques'
}
function renderFlyers(){
  activeFlyerZoom = null
  const list=document.querySelector('#flyer-list')
  const visible=stores.filter(s=>neighborhood.value==='all'||s.neighborhood===neighborhood.value||s.branches?.some(b=>b.neighborhood===neighborhood.value))
    .sort((a,b)=>Number(favorites.includes(b.id))-Number(favorites.includes(a.id)))
  list.innerHTML=visible.map(s=>{
    const state=stateFor(s),pages=s.pages||[s.flyer]
    const matching=s.branches?.findIndex(b=>b.neighborhood===neighborhood.value)
    if(matching>=0)state.branch=matching
    const branch=s.branches?.[state.branch]
    return `<article class="flyer-card" id="${s.id}">
      <header class="flyer-heading">
        ${s.logo?`<img src="${s.logo}" alt="Logotipo ${s.name}" />`:''}
        <div class="flyer-heading-details"><h2>${s.name}</h2><p>${s.branches?'Novo Hamburgo':s.neighborhood+' · Novo Hamburgo'}</p>
        ${branch?`<div class="branch-selector" role="group" aria-label="Escolha a filial">${s.branches.map((b,i)=>`<button type="button" data-branch="${i}" aria-pressed="${state.branch===i}">Bairro ${b.neighborhood}</button>`).join('')}</div><p class="branch-address" aria-live="polite">${branch.address}</p>`:''}
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
    card.querySelector('.flyer-viewport').scrollIntoView({block:'start',behavior:'instant'})
  }else if(button.dataset.favorite){
    const id=store.id
    favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id]
    try{localStorage.setItem('buscaPrecoFavorites',JSON.stringify(favorites))}catch{}
    renderFlyers();document.querySelector('[data-favorite="'+id+'"]')?.focus({preventScroll:true})
  }else if(button.dataset.directions){
    showToast('O endereço desta loja será confirmado antes de disponibilizar a rota.')
  }else if(button.dataset.share){
    const branch=store.branches?.[state.branch]
    const data={title:store.name+' — Busca Preço NH',text:'Veja o encarte de '+store.name+(branch?' · '+branch.address:''),url:location.origin+'/#'+store.id}
    try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);showToast('Link do encarte copiado.')}}catch(e){if(e.name!=='AbortError')showToast('Não foi possível compartilhar. Tente novamente.')}
  }
})
function render(){
  if (activeFlyerZoom) activeFlyerZoom.setZoom(100, false)
  const term = normalize(search.value.trim())
  document.querySelector('.category-scroll').hidden = !term
  document.querySelector('.offers-section').hidden = !term
  document.querySelector('#sort-row').hidden = !term
  document.querySelector('#flyer-list').hidden = !!term
  if (!term) { renderFlyers(); clearSearch.hidden = true; return }
  let filtered = offers.filter(item => {
    const text = normalize(`${item.name} ${item.brand} ${item.market}`)
    return (!term || text.includes(term)) &&
      (neighborhood.value === 'all' || item.neighborhood === neighborhood.value) &&
      (activeCategory === 'all' || item.category === activeCategory)
  })

  filtered.sort((a,b) => sort.value === 'unit' ? a.unitPrice-b.unitPrice : sort.value === 'recent' ? Number(a.demo)-Number(b.demo) : a.price-b.price)
  grid.innerHTML = filtered.map(item => `
    <article class="offer-card">
      <div class="offer-image">
        <img src="${item.image}" alt="${item.name} ${item.brand}" />
        <span class="valid-tag">Validade a confirmar</span>
        <span class="demo-tag">DEMONSTRAÇÃO</span>
      </div>
      <div class="offer-content">
        <h3>${item.name}</h3>
        <span class="offer-size">${item.brand} · ${item.size}</span>
        <div class="price-row"><strong class="price">${money(item.price)}</strong><span class="unit-price">${money(item.unitPrice)}/${item.unitLabel}</span></div>
        <span class="market-name"><i class="market-dot"></i>${item.market} · ${item.neighborhood}</span>
      </div>
    </article>`).join('')
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'oferta' : 'ofertas'}`
  emptyState.hidden = filtered.length > 0
  clearSearch.hidden = !search.value
}

search.addEventListener('input',render)
neighborhood.addEventListener('change',render)
sort.addEventListener('change',render)
clearSearch.addEventListener('click',()=>{search.value='';search.focus();render()})
document.querySelectorAll('.category').forEach(button => button.addEventListener('click',()=>{
  document.querySelector('.category.active')?.classList.remove('active')
  button.classList.add('active')
  activeCategory = button.dataset.category
  render()
}))

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
