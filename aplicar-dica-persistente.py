from pathlib import Path
import re
html_path=Path('public/index.html');sw_path=Path('public/sw.js')
for p in [html_path,sw_path,Path('public/dica-pagina.js'),Path('public/dica-pagina.css')]:
 if not p.is_file():raise SystemExit('Execute na raiz do projeto após extrair o ZIP. Arquivo ausente: '+str(p))
html=html_path.read_text(encoding='utf-8');sw=sw_path.read_text(encoding='utf-8')
if '</head>' not in html or '</body>' not in html:raise SystemExit('HTML não reconhecido. Nenhum código alterado.')
if '/dica-pagina.css' not in html:html=html.replace('</head>','<link rel="stylesheet" href="/dica-pagina.css">\n</head>')
if '/dica-pagina.js' not in html:html=html.replace('</body>','<script type="module" src="/dica-pagina.js"></script>\n</body>')
def bump(m):
 name=m.group(3)
 if not name.endswith('-dica-pagina-v2'):name+='-dica-pagina-v2'
 return m.group(1)+m.group(2)+name+m.group(2)
sw,n=re.subn(r"""(const\s+CACHE\s*=\s*)(['"])(.*?)\2""",bump,sw,count=1)
if n!=1 or 'const SHELL = [' not in sw:raise SystemExit('Cache não reconhecido. Nenhum código alterado.')
for asset in ['/dica-pagina.js','/dica-pagina.css']:
 if asset not in sw:sw=sw.replace('const SHELL = [',"const SHELL = ['"+asset+"', ",1)
html_path.write_text(html,encoding='utf-8');sw_path.write_text(sw,encoding='utf-8')
print('Dica atualizada: mais transparente e visível até clicar no encarte.')
