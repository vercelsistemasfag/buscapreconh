// A short, non-interactive cue, shown once per tab visit.
const hintKey = 'busca-preco-dica-pagina-v1'
const list = document.querySelector('#flyer-list')
let seen = false
try { seen = sessionStorage.getItem(hintKey) === '1' } catch {}
let tip = null, timer = null, observer = null, mutations = null
function dismissHint() {
  clearTimeout(timer)
  tip?.remove()
  tip = null
}
function rememberHint() {
  seen = true
  try { sessionStorage.setItem(hintKey, '1') } catch {}
  observer?.disconnect()
  mutations?.disconnect()
}
function showHint(button) {
  if (seen || button.disabled || !button.isConnected) return
  const viewer = button.closest('.flyer-viewer')
  if (!viewer) return
  rememberHint()
  tip = document.createElement('div')
  tip.className = 'flyer-page-hint'
  tip.setAttribute('role', 'status')
  tip.textContent = 'Próxima página ››'
  viewer.append(tip)
  // The last 350 ms of this interval are the fade-out.
  timer = setTimeout(dismissHint, 4000)
}
if (list && !seen && 'IntersectionObserver' in window) {
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= .8) showHint(entry.target)
    }
  }, {root: document.querySelector('#content-scroll'), threshold: .8})
  const watchArrows = () => {
    observer.disconnect()
    if (!seen) list.querySelectorAll('[data-page-step="1"]:not(:disabled)').forEach(button => observer.observe(button))
  }
  mutations = new MutationObserver(watchArrows)
  mutations.observe(list, {childList: true, subtree: true, attributes: true, attributeFilter: ['disabled']})
  watchArrows()
}
list?.addEventListener('click', event => {
  const button = event.target.closest('[data-page-step]')
  if (!button || button.disabled) return
  rememberHint()
  dismissHint()
}, true)
window.addEventListener('pagehide', dismissHint)
