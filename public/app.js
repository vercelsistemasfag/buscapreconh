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

const stores = [{
  id:'super-mariani', name:'Super Mariani', neighborhood:'Canudos',
  logo:'/assets/super-mariani.png', flyer:'/assets/encarte-super-mariani.jpg'
}]
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
  card.append(dock)
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
function renderFlyers(){
  activeFlyerZoom = null
  const list = document.querySelector('#flyer-list')
  const visible = stores.filter(s=>neighborhood.value==='all'||s.neighborhood===neighborhood.value)
    .sort((a,b)=>Number(favorites.includes(b.id))-Number(favorites.includes(a.id)))
  list.innerHTML = visible.length ? visible.map(s=>`
    <article class="flyer-card" id="${s.id}">
      <header class="flyer-heading">
        <img src="${s.logo}" alt="Logotipo ${s.name}" />
        <div><h2>${s.name}</h2><p>${s.neighborhood} · Novo Hamburgo</p>
        <span class="flyer-validity">Validade a confirmar · Encarte demonstrativo</span></div>
      </header>
      <img class="full-flyer" src="${s.flyer}" alt="Encarte completo de ${s.name}" width="1242" height="1536" />
      <div class="flyer-actions">
        <button data-share="${s.id}">Compartilhar</button>
        <button data-directions="${s.id}">Como chegar</button>
        <button data-favorite="${s.id}" aria-pressed="${favorites.includes(s.id)}">${favorites.includes(s.id)?'★ Favoritada':'☆ Favoritar loja'}</button>
      </div>
    </article>`).join('') : '<div class="empty-state"><strong>Nenhum encarte neste bairro</strong><p>Escolha todos os bairros para ver os encartes disponíveis.</p></div>'
  list.querySelectorAll('.flyer-card').forEach(setupFlyerZoom)
}
document.querySelector('#flyer-list').addEventListener('click', async event=>{
  const button=event.target.closest('button')
  if(!button)return
  if(button.dataset.favorite){
    const id=button.dataset.favorite
    favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id]
    try { localStorage.setItem('buscaPrecoFavorites',JSON.stringify(favorites)) } catch {}
    renderFlyers()
    document.querySelector('[data-favorite="'+id+'"]')?.focus({preventScroll:true})
  } else if(button.dataset.directions){
    showToast('O endereço desta loja será confirmado antes de disponibilizar a rota.')
  } else if(button.dataset.share){
    const data={title:'Super Mariani — Busca Preço NH',text:'Veja o encarte demonstrativo no Busca Preço NH.',url:location.origin+'/#'+button.dataset.share}
    try {
      if(navigator.share) await navigator.share(data)
      else {await navigator.clipboard.writeText(data.url);showToast('Link do encarte copiado.')}
    }catch(e){if(e.name!=='AbortError')showToast('Não foi possível compartilhar. Tente novamente.')}
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
