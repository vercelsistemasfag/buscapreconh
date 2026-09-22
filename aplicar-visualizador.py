from pathlib import Path
import re,json
app=Path('public/app.js');index=Path('public/index.html');sw=Path('public/sw.js')
for p in (app,index,sw):
 if not p.is_file():raise SystemExit('Execute na raiz do projeto. Arquivo ausente: '+str(p))
s=app.read_text(encoding='utf-8');h=index.read_text(encoding='utf-8');w=sw.read_text(encoding='utf-8')
if "viewer.className='flyer-viewer'" not in s:
 for p in json.loads(Path('patch/encarte-viewer.json').read_text(encoding='utf-8')):
  if s.count(p['old'])!=1:raise SystemExit('O controle atual difere da versão esperada. Nenhum código foi alterado. Envie seu app.js para ajustar.')
  s=s.replace(p['old'],p['new'],1)
if '/encarte-viewer.css' not in h:h=h.replace('</head>','    <link rel="stylesheet" href="/encarte-viewer.css" />\n  </head>',1)
def bump(m):
 name=m.group(3)
 if not name.endswith('-encarte-viewer-v3'):name+='-encarte-viewer-v3'
 return m.group(1)+m.group(2)+name+m.group(2)
w,n=re.subn(r'''(const\s+CACHE\s*=\s*)(['"])(.*?)\2''',bump,w,count=1)
if n!=1:raise SystemExit('Cache não reconhecido. Nenhum código foi alterado.')
if "'/encarte-viewer.css'" not in w:
 w,n=re.subn(r'(const SHELL\s*=\s*\[)',r"\1'/encarte-viewer.css', ",w,count=1)
 if n!=1:raise SystemExit('Lista de cache não reconhecida. Nenhum código foi alterado.')
app.write_text(s,encoding='utf-8');index.write_text(h,encoding='utf-8');sw.write_text(w,encoding='utf-8')
print('Visualizador aplicado: setas laterais e zoom sobre o encarte.')
