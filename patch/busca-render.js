// busca-real-v1: indexed from the four original Unisuper flyer pages.
const escapeOffer = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const searchWords = value => normalize(value).replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean)
const searchCategories = ['all', ...new Set(offers.map(item=>item.category))]
document.querySelector('.category-scroll').innerHTML = searchCategories.map(category=>`<button class="category ${category==='all'?'active':''}" data-category="${escapeOffer(category)}">${category==='all'?'Todos':escapeOffer(category)}</button>`).join('')
for(const option of [...neighborhood.options]) {
  if(option.value!=='all' && !offers.some(item=>item.neighborhoods.includes(option.value))) option.remove()
}
sort.innerHTML='<option value="price">Menor preço anunciado</option><option value="recent">Encarte mais recente</option>'
resultCount.setAttribute('aria-live','polite')
function offerValidity(item) {
  const today = new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date())
  const end = item.validUntil.split('-').reverse().join('/')
  return today>item.validUntil ? 'Oferta encerrada em '+end : today<item.validFrom ? 'Válida de '+item.validFrom.split('-').reverse().join('/')+' a '+end : 'Válida até '+end
}
function render(){
  if(activeFlyerZoom) activeFlyerZoom.setZoom(100,false)
  const term = search.value.trim()
  document.querySelector('.category-scroll').hidden = !term
  document.querySelector('.offers-section').hidden = !term
  document.querySelector('#sort-row').hidden = !term
  document.querySelector('#flyer-list').hidden = !!term
  updateFloatingZoom()
  if(!term){renderFlyers();clearSearch.hidden=true;return}
  const words=searchWords(term)
  const filtered=offers.filter(item=>{
    const text=searchWords(`${item.name} ${item.brand} ${item.size} ${item.market} ${item.category}`).join(' ')
    return words.every(word=>text.includes(word)) &&
      (neighborhood.value==='all'||item.neighborhoods.includes(neighborhood.value)) &&
      (activeCategory==='all'||item.category===activeCategory)
  })
  filtered.sort((a,b)=>sort.value==='recent'?b.validFrom.localeCompare(a.validFrom)||a.price-b.price:a.price-b.price)
  grid.innerHTML=filtered.map(item=>{
    const [x,y,width,height]=item.region
    const pageWidth={1:1117,2:1138,3:1136,4:1070}[item.page]
    const aspect=(width*pageWidth)/(height*1536)
    const sourceStyle=`aspect-ratio:${aspect};background-image:url('${item.image}');background-size:${100/width}% ${100/height}%;background-position:${x/(1-width)*100}% ${y/(1-height)*100}%`
    const branch=neighborhood.value==='all'?item.neighborhoods.join(' · '):neighborhood.value
    return `<article class="offer-card real-offer" data-offer-id="${item.id}">
      <div class="offer-source-wrap"><div class="offer-source" role="img" aria-label="${escapeOffer('Oferta de '+item.name+' '+item.brand+' na página '+item.page+' do encarte')}" style="${sourceStyle}"></div></div>
      <div class="offer-content">
        <h3>${escapeOffer(item.name)}</h3>
        <p class="offer-size">${escapeOffer([item.brand,item.size].filter(Boolean).join(' · '))}</p>
        <div class="real-price"><strong>${money(item.price)}</strong><span>Preço anunciado${item.size==='kg'?' por kg':''}</span></div>
        ${item.clubPrice!==null?`<p class="offer-condition">Meu UniSuper: <strong>${money(item.clubPrice)}</strong> · preço do clube</p>`:''}
        ${item.bulk?`<p class="offer-condition">Levando ${item.bulk.quantity} unidades: <strong>${money(item.bulk.price)} cada</strong></p>`:''}
        <p class="real-market">${escapeOffer(item.market)} · ${escapeOffer(branch)}</p>
        <p class="real-validity">${offerValidity(item)} · Enquanto durarem os estoques</p>
        <button type="button" class="open-source" data-open-offer="${item.id}">Ver no encarte · pág. ${item.page}</button>
      </div>
    </article>`
  }).join('')
  resultCount.textContent=`${filtered.length} ${filtered.length===1?'oferta':'ofertas'}`
  emptyState.hidden=filtered.length>0
  clearSearch.hidden=false
}
grid.addEventListener('click',event=>{
  const button=event.target.closest('[data-open-offer]')
  if(!button)return
  const item=offers.find(offer=>offer.id===button.dataset.openOffer)
  const store=stores.find(store=>store.id===item?.storeId)
  if(!store)return
  const state=stateFor(store)
  state.page=item.page-1
  const branch=store.branches.findIndex(branch=>branch.neighborhood===neighborhood.value)
  if(branch>=0)state.branch=branch
  search.value=''
  activeCategory='all'
  document.querySelectorAll('.category').forEach(button=>button.classList.toggle('active',button.dataset.category==='all'))
  render()
  requestAnimationFrame(()=>{
    const viewer=document.getElementById(store.id)?.querySelector('.flyer-viewer')
    viewer?.scrollIntoView({block:'start',behavior:'smooth'})
  })
})
