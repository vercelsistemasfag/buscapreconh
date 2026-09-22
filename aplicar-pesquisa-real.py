from pathlib import Path
import re
root=Path('public')
paths={name:root/name for name in ['app.js','index.html','sw.js']}
for p in paths.values():
 if not p.is_file():raise SystemExit('Execute na raiz do projeto: arquivo ausente '+str(p))
s,h,w=(paths[n].read_text(encoding='utf-8') for n in paths)
if 'function setupFlyerZoom' not in s or 'function stateFor' not in s:
 raise SystemExit('Versão do encarte não reconhecida. Nenhum código alterado.')
if 'const offers = [' in s:
 start=s.index('const offers = [');end=s.index('const grid =',start)
 s=s[:start]+"import {unisuperProducts} from './unisuper-produtos.js'\nconst offers = unisuperProducts\n\n"+s[end:]
elif "const offers = unisuperProducts" not in s:
 raise SystemExit('Lista de ofertas não reconhecida. Nenhum código alterado.')
start=s.find('// busca-real-v1:')
if start<0:start=s.find('function render(){')
end=s.find("search.addEventListener('input',render)",start)
if start<0 or end<0:raise SystemExit('Pesquisa não reconhecida. Nenhum código alterado.')
s=s[:start]+Path('patch/busca-render.js').read_text(encoding='utf-8')+'\n'+s[end:]
h=h.replace('RESULTADOS DEMONSTRATIVOS','OFERTAS DOS ENCARTES')
h=h.replace('Protótipo inicial — os valores demonstrativos serão substituídos pelos encartes oficiais.','Preços e condições conforme os encartes. Consulte a validade de cada oferta.')
if '/busca-real.css' not in h:h=h.replace('</head>','<link rel="stylesheet" href="/busca-real.css">\n</head>')
def bump(m):
 name=m.group(3)
 if not name.endswith('-busca-real-v1'):name+='-busca-real-v1'
 return m.group(1)+m.group(2)+name+m.group(2)
w,n=re.subn(r"""(const\s+CACHE\s*=\s*)(['"])(.*?)\2""",bump,w,count=1)
if n!=1:raise SystemExit('Cache não reconhecido. Nenhum código alterado.')
if 'const SHELL = [' not in w:raise SystemExit('Lista de cache não reconhecida. Nenhum código alterado.')
for asset in ['/unisuper-produtos.js','/busca-real.css']:
 if asset not in w:w=w.replace('const SHELL = [',"const SHELL = ['"+asset+"', ",1)
for name,data in [('app.js',s),('index.html',h),('sw.js',w)]:paths[name].write_text(data,encoding='utf-8')
print('Pesquisa atualizada com 93 ofertas do encarte; controles mais transparentes.')
