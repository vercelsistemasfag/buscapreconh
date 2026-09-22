from pathlib import Path
import json,re
paths=[Path('public')/n for n in ['app.js','index.html','sw.js','busca-real.css']]
for p in paths:
 if not p.is_file():raise SystemExit('Arquivo ausente: '+str(p)+'. Execute na raiz do projeto com a pesquisa real instalada.')
app,html,sw,css=[p.read_text(encoding='utf-8') for p in paths]
marker='// pesquisa-limpa-v1'
if marker in app:
 print('Pesquisa limpa já aplicada.');raise SystemExit(0)
for old,new in json.loads(Path('patch/pesquisa-limpa.json').read_text(encoding='utf-8')):
 if not old or app.count(old)!=1:raise SystemExit('A pesquisa difere da versão esperada. Nenhum arquivo foi alterado; envie public/app.js para ajustar.')
 app=app.replace(old,new,1)
html,n=re.subn(r'<div class="filter-row" id="sort-row" hidden>.*?</div>','',html,count=1,flags=re.S)
if n!=1:raise SystemExit('Seletor de ordenação não reconhecido. Nenhum arquivo alterado.')
html,n=re.subn(r'<nav class="category-scroll".*?</nav>','<h2 id="search-order-title" class="search-order-title" hidden>Menores preços primeiro</h2>',html,count=1,flags=re.S)
if n!=1:raise SystemExit('Categorias não reconhecidas. Nenhum arquivo alterado.')
html=html.replace('Tente outro produto, categoria ou bairro.','Tente outro produto ou bairro.')
css+='''\n/* pesquisa-limpa-v1 */
.search-order-title{flex:0 0 auto;position:relative;margin:0;width:100%;padding:12px max(16px,calc((100vw - 1088px)/2));background:#fff;color:#193b2d;border-bottom:1px solid #dce6d8;font-size:15px;font-weight:700;line-height:1.3}
.search-order-title[hidden]{display:none}
'''
sw,n=re.subn(r"""(const\s+CACHE\s*=\s*)(['"])(.*?)\2""",lambda m:m.group(1)+m.group(2)+m.group(3)+'-pesquisa-limpa-v1'+m.group(2),sw,count=1)
if n!=1:raise SystemExit('Cache não reconhecido. Nenhum arquivo alterado.')
app+='\n'+marker+'\n'
for p,data in zip(paths,[app,html,sw,css]):p.write_text(data,encoding='utf-8')
print('Pesquisa simplificada: menores preços primeiro, sem categorias, seletor ou botão do encarte.')
