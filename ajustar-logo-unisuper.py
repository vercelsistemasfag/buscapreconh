from pathlib import Path
import re
app=Path('public/app.js');css=Path('public/unisuper.css');sw=Path('public/sw.js')
for p in (app,css,sw):
 if not p.is_file():raise SystemExit('Arquivo não encontrado: '+str(p)+'. Execute na raiz do projeto com a Unisuper instalada.')
s=app.read_text(encoding='utf-8');c=css.read_text(encoding='utf-8');w=sw.read_text(encoding='utf-8')
old='/assets/unisuper-logo.png';new='/assets/unisuper-logo-branco.png'
if old not in s and new not in s:raise SystemExit('Referência do logo não encontrada. Nenhum código foi alterado.')
s=s.replace(old,new)
marker='/* unisuper-logo-branco-v2 */'
if marker not in c:
 c+='''\n/* unisuper-logo-branco-v2 */
#rede-unisuper .flyer-heading { align-items: flex-start; gap: 8px; }
#rede-unisuper .flyer-heading > img {
  display: block;
  flex: 0 0 82px;
  width: 82px;
  height: 64px;
  object-fit: contain;
  object-position: center top;
  margin: 0;
  background: #fff;
}
@media (max-width: 390px) {
  #rede-unisuper .flyer-heading > img { flex-basis: 67px; width: 67px; height: 58px; }
}
'''
def bump(m):
 name=m.group(3)
 if not name.endswith('-logo-branco-v2'):name+='-logo-branco-v2'
 return m.group(1)+m.group(2)+name+m.group(2)
w,n=re.subn(r'''(const\s+CACHE\s*=\s*)(['"])(.*?)\2''',bump,w,count=1)
if n!=1:raise SystemExit('Cache não reconhecido. Nenhum código foi alterado.')
if old in w:w=w.replace(old,new)
elif new not in w:
 w,n=re.subn(r'(const SHELL\s*=\s*\[)',r"\1'/assets/unisuper-logo-branco.png', ",w,count=1)
 if n!=1:raise SystemExit('Lista de cache não reconhecida. Nenhum código foi alterado.')
app.write_text(s,encoding='utf-8');css.write_text(c,encoding='utf-8');sw.write_text(w,encoding='utf-8')
print('Logo branco alinhado ao nome; espaço da coluna de informações preservado.')
