from pathlib import Path
import json,re
root=Path('public');app=root/'app.js';index=root/'index.html';sw=root/'sw.js'
for p in [app,index,sw]:
 if not p.is_file():raise SystemExit('Arquivo ausente: '+str(p)+'. Execute na raiz do projeto.')
s=app.read_text(encoding='utf-8');html=index.read_text(encoding='utf-8');worker=sw.read_text(encoding='utf-8')
patches=json.loads(Path('patch/unisuper.json').read_text(encoding='utf-8'))
if "id:'rede-unisuper'" not in s:
 for p in patches:
  if s.count(p['old'])!=1:raise SystemExit('O app.js difere da versão esperada. Nenhum código foi alterado. Envie seu app.js para ajustar com segurança.')
  s=s.replace(p['old'],p['new'],1)
if '/unisuper.css' not in html:html=html.replace('</head>','    <link rel="stylesheet" href="/unisuper.css" />\n  </head>',1)
def bump(m):
 name=m.group(3)
 if not name.endswith('-unisuper-v1'):name+='-unisuper-v1'
 return m.group(1)+m.group(2)+name+m.group(2)
worker,n=re.subn(r'''(const\s+CACHE\s*=\s*)(['"])(.*?)\2''',bump,worker,count=1)
if n!=1:raise SystemExit('Cache não reconhecido. Nenhum código foi alterado.')
if "'/unisuper.css'" not in worker:
 worker,n=re.subn(r'(const SHELL\s*=\s*\[)',r"\1'/unisuper.css', ",worker,count=1)
 if n!=1:raise SystemExit('Lista de cache não reconhecida. Nenhum código foi alterado.')
app.write_text(s,encoding='utf-8');index.write_text(html,encoding='utf-8');sw.write_text(worker,encoding='utf-8')
print('Unisuper aplicada: quatro páginas, duas filiais, endereços e rotas vinculados.')
