from pathlib import Path
from datetime import datetime
import re,shutil,subprocess,tempfile
root=Path.cwd(); paths=[root/'public/app.js',root/'public/index.html',root/'public/sw.js']
if not all(p.is_file() for p in paths):raise SystemExit('Execute na raiz do projeto junto ao package.json.')
app,html,sw=[p.read_text() for p in paths]
marker='favoritos-modal-v1'
if marker in app:print('Favoritos ja configurados.');raise SystemExit(0)
old="""    const id=store.id
    favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id]
    try{localStorage.setItem('buscaPrecoFavorites',JSON.stringify(favorites))}catch{}
    renderFlyers();document.querySelector('[data-favorite="'+id+'"]')?.focus({preventScroll:true})"""
new="""    const id=store.id
    const adding=!favorites.includes(id)
    favorites=adding?[...favorites,id]:favorites.filter(x=>x!==id)
    let saved=true
    try{localStorage.setItem('buscaPrecoFavorites',JSON.stringify(favorites))}catch{saved=false}
    renderFlyers()
    const favoriteButton=document.querySelector('[data-favorite="'+id+'"]')
    favoriteButton?.focus({preventScroll:true})
    if(adding)showFavoriteModal(favoriteButton,saved)
    else showToast('Loja removida dos favoritos.')"""
if app.count(old)!=1:raise SystemExit('O codigo de favoritos mudou. Nenhum arquivo alterado; envie public/app.js atualizado.')
app=app.replace(old,new,1)
app+='''
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
'''
css='''/* favoritos-modal-v1 */
#favorite-modal{box-sizing:border-box;width:calc(100% - 36px);max-width:380px;max-height:85dvh;overflow:auto;padding:26px 24px;border:1px solid #dfe7dc;border-radius:20px;background:#fff;color:#20392e;box-shadow:0 18px 60px #00291f33;text-align:center;font-family:inherit}
#favorite-modal::backdrop{background:#00291f66}
#favorite-modal[open]{animation:favorite-appear .18s ease-out}
#favorite-modal h2{margin:10px 0;font-size:20px;color:#023926}
#favorite-modal p{margin:10px 0 0;font-size:15px;line-height:1.5}
#favorite-modal .favorite-modal-star{font-size:32px;color:#419b13}
#favorite-modal .favorite-modal-close{position:absolute;top:4px;right:4px;width:44px;height:44px;padding:0;border:0;background:transparent;color:#023926;font-size:26px;cursor:pointer}
#favorite-modal #favorite-modal-notice,#favorite-modal .favorite-modal-storage{font-size:12px;color:#617267}
#favorite-modal button:focus-visible{outline:2px solid #023926;border-radius:10px}
@keyframes favorite-appear{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){#favorite-modal[open]{animation:none}}
'''
if html.count('</head>')!=1:raise SystemExit('HTML nao reconhecido. Nada alterado.')
html=html.replace('</head>','<link rel="stylesheet" href="/favoritos.css">\n</head>')
sw,n=re.subn(r"(const CACHE\s*=\s*['\"])([^'\"]+)",lambda m:m[1]+m[2]+'-'+marker,sw,count=1)
if n!=1:raise SystemExit('Cache nao reconhecido. Nada alterado.')
sw,n=re.subn(r'(const SHELL\s*=\s*\[)',r"\1'/favoritos.css', ",sw,count=1)
if n!=1:raise SystemExit('Cache nao reconhecido. Nada alterado.')
with tempfile.TemporaryDirectory() as tmp:
    test=Path(tmp)/'app.mjs';test.write_text(app);subprocess.run(['node','--check',str(test)],check=True)
outputs=dict(zip(paths,[app,html,sw]));outputs[root/'public/favoritos.css']=css
backup=root/'.favoritos-backup'/datetime.now().strftime('%Y%m%d-%H%M%S-%f');backup.mkdir(parents=True,exist_ok=True)
for p in outputs:
    if p.exists():shutil.copy2(p,backup/p.name)
for p,content in outputs.items():p.write_text(content)
print('Favoritos configurados: multiplas lojas no topo e modal de 7 segundos ao marcar. Push remoto ainda nao integrado.')
