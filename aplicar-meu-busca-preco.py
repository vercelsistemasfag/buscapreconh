from pathlib import Path
import json,re
root=Path('public')
paths={n:root/n for n in ['index.html','app.js','manifest.webmanifest','sw.js']}
for p in paths.values():
 if not p.is_file():raise SystemExit('Execute na raiz do projeto. Arquivo ausente: '+str(p))
assets=[
 '/assets/meu-busca-preco-logo.svg','/assets/meu-busca-preco-icone.svg',
 '/assets/meu-busca-preco-favicon.svg',
 '/icons/meu-busca-preco-192.png','/icons/meu-busca-preco-512.png',
 '/icons/meu-busca-preco-maskable-512.png','/icons/meu-busca-preco-apple-180.png',
 '/icons/meu-busca-preco-favicon-16.png','/icons/meu-busca-preco-favicon-32.png','/icons/meu-busca-preco-favicon-48.png','/favicon.ico']
for name in assets:
 if not (root/name.lstrip('/')).is_file():raise SystemExit('Extraia o ZIP completo. Falta: '+name)
html=paths['index.html'].read_text(encoding='utf-8')
app=paths['app.js'].read_text(encoding='utf-8')
sw=paths['sw.js'].read_text(encoding='utf-8')
manifest=json.loads(paths['manifest.webmanifest'].read_text(encoding='utf-8'))
if '</head>' not in html:raise SystemExit('Cabeçalho HTML não reconhecido. Nenhuma configuração alterada.')
def rename(s):
 return re.sub(r'(?<!Meu )Busca Preço(?: NH)?','Meu Busca Preço',s)
html=rename(html);app=rename(app)
html=re.sub(r'/assets/busca-preco-logo\.svg(?:\?[^"\s<>]*)?','/assets/meu-busca-preco-logo.svg',html)
if '/assets/meu-busca-preco-logo.svg' not in html:raise SystemExit('Logo principal não reconhecido. Nenhuma configuração alterada.')
if '<title>' in html:html=re.sub(r'<title>.*?</title>','<title>Meu Busca Preço</title>',html,count=1,flags=re.S)
else:html=html.replace('</head>','<title>Meu Busca Preço</title>\n</head>')
# Replace only icon links, leaving other stylesheet and application links intact.
html=re.sub(r'<link\b(?=[^>]*\brel=["\'](?:icon|shortcut icon|apple-touch-icon)["\'])[^>]*>\s*','',html,flags=re.I)
html=re.sub(r'<meta\b(?=[^>]*\bname=["\'](?:application-name|apple-mobile-web-app-title)["\'])[^>]*>\s*','',html,flags=re.I)
links='''<link rel="icon" href="/favicon.ico?v=meu-v1" sizes="16x16 32x32 48x48">
<link rel="icon" href="/icons/meu-busca-preco-favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/assets/meu-busca-preco-favicon.svg" type="image/svg+xml" sizes="any">
<link rel="apple-touch-icon" href="/icons/meu-busca-preco-apple-180.png" sizes="180x180">
<meta name="application-name" content="Meu Busca Preço">
<meta name="apple-mobile-web-app-title" content="Meu Busca Preço">
'''
html=html.replace('</head>',links+'</head>')
manifest['name']='Meu Busca Preço';manifest['short_name']='Meu Busca Preço'
manifest['background_color']='#023926';manifest['theme_color']='#023926'
manifest['icons']=[{'src':f'/icons/meu-busca-preco-{n}.png','sizes':f'{n}x{n}','type':'image/png','purpose':'any'} for n in (192,512)]
manifest['icons'].append({'src':'/icons/meu-busca-preco-maskable-512.png','sizes':'512x512','type':'image/png','purpose':'maskable'})
# Preserve id/start_url/scope so the installed app keeps its identity.
def bump(m):
 name=m.group(3)
 if not name.endswith('-meu-brand-v1'):name+='-meu-brand-v1'
 return m.group(1)+m.group(2)+name+m.group(2)
sw,n=re.subn(r"""(const\s+CACHE\s*=\s*)(['"])(.*?)\2""",bump,sw,count=1)
if n!=1:raise SystemExit('Cache não reconhecido. Nenhuma configuração alterada.')
m=re.search(r'const\s+SHELL\s*=\s*\[',sw)
if not m:raise SystemExit('Lista de cache não reconhecida. Nenhuma configuração alterada.')
missing=[a for a in assets+['/favicon.ico?v=meu-v1'] if "'"+a+"'" not in sw and '"'+a+'"' not in sw]
sw=sw[:m.end()]+''.join(json.dumps(a)+', ' for a in missing)+sw[m.end():]
for name,data in [('index.html',html),('app.js',app),('sw.js',sw),('manifest.webmanifest',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')]:
 paths[name].write_text(data,encoding='utf-8')
print('Meu Busca Preço aplicado: nome, logo SVG, ícones PWA e favicon. Publique com git.')
