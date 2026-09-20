// The cue stays until the user clicks/taps the flyer, once per tab visit.
const hintKey = 'busca-preco-dica-pagina-v2'
const list = document.querySelector('#flyer-list')
let dismissed = false
try { dismissed = sessionStorage.getItem(hintKey) === '1' } catch {}
let tip = null, observer = null, mutations = null
function showHint(button) {
  if (dismissed || tip?.isConnected || button.disabled || !button.isConnected) return
  const viewer = button.closest('.flyer-viewer')
  if (!viewer) return
  tip = document.createElement('div')
  tip.className = 'flyer-page-hint'
  tip.setAttribute('role', 'status')
  tip.textContent = 'Próxima página ››'
  viewer.append(tip)
  observer?.disconnect()
}
if (list && !dismissed && 'IntersectionObserver' in window) {
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= .8) showHint(entry.target)
    }
  }, {root: document.querySelector('#content-scroll'), threshold: .8})
  const watchArrows = () => {
    observer.disconnect()
    if (!dismissed && !tip?.isConnected) {
      list.querySelectorAll('[data-page-step="1"]:not(:disabled)').forEach(button => observer.observe(button))
    }
  }
  mutations = new MutationObserver(watchArrows)
  mutations.observe(list, {childList: true, subtree: true, attributes: true, attributeFilter: ['disabled']})
  watchArrows()
}
list?.addEventListener('click', event => {
  if (!event.target.closest('.flyer-viewer')) return
  dismissed = true
  try { sessionStorage.setItem(hintKey, '1') } catch {}
  observer?.disconnect()
  mutations?.disconnect()
  tip?.remove()
  tip = null
}, true)
