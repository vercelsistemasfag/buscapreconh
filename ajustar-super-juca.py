from pathlib import Path
from datetime import datetime
import re, shutil, subprocess, tempfile
root=Path.cwd()
paths=[root/'public/app.js',root/'public/super-juca.css',root/'public/sw.js']
if not all(p.is_file() for p in paths):raise SystemExit('Execute na raiz do projeto com o card Super Juca ja instalado.')
app,css,sw=[p.read_text() for p in paths]
marker='super-juca-industrial-logo-v2'
if marker in css:
    print('Ajuste ja aplicado.');raise SystemExit(0)
pattern=r"(id:'super-juca'[\s\S]*?branches:\[)([\s\S]*?)(\n  \])"
m=re.search(pattern,app)
if not m:raise SystemExit('Card nao reconhecido. Nenhum arquivo alterado.')
branches=re.findall(r"\{label:[^\n]+?\}",m[2])
if len(branches)!=3 or sum("label:'Industrial'" in b for b in branches)!=1:raise SystemExit('Enderecos diferentes do esperado. Nenhum arquivo alterado.')
branches.sort(key=lambda b:0 if "label:'Industrial'" in b else 1)
app=app[:m.start(2)]+'\n    '+',\n    '.join(branches)+app[m.end(2):]
css+='''
/* super-juca-industrial-logo-v2 */
#super-juca .flyer-heading { grid-template-columns: 96px minmax(0, 1fr) auto; }
#super-juca .flyer-heading > img {
  width: 96px; height: 96px; max-width: 100%;
  object-fit: contain; object-position: center; flex-basis: auto;
}
#super-juca .flyer-heading h2 { overflow-wrap: anywhere; }
@media (max-width: 380px) {
  #super-juca .flyer-heading { grid-template-columns: 82px minmax(0, 1fr) auto; column-gap: 6px; padding: 9px 10px; }
  #super-juca .flyer-heading > img { width: 82px; height: 82px; }
}
'''
sw,n=re.subn(r"(const CACHE\s*=\s*['\"])([^'\"]+)",lambda m:m[1]+m[2]+'-'+marker,sw,count=1)
if n!=1:raise SystemExit('Cache nao reconhecido. Nenhum arquivo alterado.')
with tempfile.TemporaryDirectory() as tmp:
    test=Path(tmp)/'app.mjs';test.write_text(app);subprocess.run(['node','--check',str(test)],check=True)
backup=root/'.super-juca-backup'/datetime.now().strftime('%Y%m%d-%H%M%S-%f')
backup.mkdir(parents=True,exist_ok=True)
for p in paths:shutil.copy2(p,backup/p.name)
for p,text in zip(paths,[app,css,sw]):p.write_text(text)
print('Industrial agora e a primeira loja. Logotipo ampliado, proporcional e sem cortes.')
