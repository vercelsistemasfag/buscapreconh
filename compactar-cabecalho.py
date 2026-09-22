from pathlib import Path
import re
app=Path('public/app.js');css=Path('public/unisuper.css');sw=Path('public/sw.js')
for p in (app,css,sw):
 if not p.is_file():raise SystemExit('Execute na raiz do projeto. Arquivo ausente: '+str(p))
s=app.read_text(encoding='utf-8');c=css.read_text(encoding='utf-8');w=sw.read_text(encoding='utf-8')
old='>Bairro ${b.neighborhood}</button>';new='>${b.neighborhood}</button>'
if old in s:s=s.replace(old,new)
elif new not in s:raise SystemExit('Botões de filiais não reconhecidos. Nenhum código foi alterado.')
if '/* cabecalho-unisuper-compacto-v3 */' not in c:
 c+='''
/* cabecalho-unisuper-compacto-v3 */
#rede-unisuper .flyer-heading {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) auto;
  column-gap: 8px;
  row-gap: 3px;
  align-items: center;
  padding: 10px 12px;
}
#rede-unisuper .flyer-heading > img {
  grid-column: 1;
  grid-row: 1 / 3;
  width: 70px;
  height: 52px;
  object-fit: contain;
  object-position: center;
  align-self: center;
}
#rede-unisuper .flyer-heading-details { display: contents; }
#rede-unisuper .flyer-heading h2 {
  grid-column: 2;
  grid-row: 1;
  align-self: end;
  margin: 0;
  font-size: 15px;
  line-height: 1.15;
  font-weight: 700;
}
#rede-unisuper .flyer-heading-details > p:not(.branch-address) {
  grid-column: 2;
  grid-row: 2;
  align-self: start;
  margin: 0;
  font-size: 12px;
  line-height: 1.2;
}
#rede-unisuper .branch-selector {
  grid-column: 3;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
}
#rede-unisuper .branch-selector button {
  min-height: 26px;
  padding: 4px 7px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.15;
  white-space: nowrap;
}
#rede-unisuper .flyer-heading .branch-address {
  grid-column: 1 / -1;
  grid-row: 3;
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 1.25;
}
#rede-unisuper .flyer-validity {
  grid-column: 1 / -1;
  grid-row: 4;
  margin: 0;
  font-size: 11px;
  line-height: 1.25;
}
@media (max-width: 350px) {
  #rede-unisuper .flyer-heading { grid-template-columns: 58px minmax(0, 1fr) auto; column-gap: 6px; padding: 9px 10px; }
  #rede-unisuper .flyer-heading > img { width: 58px; height: 46px; }
  #rede-unisuper .flyer-heading h2 { font-size: 13px; }
}
'''
def bump(m):
 name=m.group(3)
 if not name.endswith('-cabecalho-compacto-v3'):name+='-cabecalho-compacto-v3'
 return m.group(1)+m.group(2)+name+m.group(2)
w,n=re.subn(r'''(const\s+CACHE\s*=\s*)(['"])(.*?)\2''',bump,w,count=1)
if n!=1:raise SystemExit('Cache não reconhecido. Nenhum código foi alterado.')
app.write_text(s,encoding='utf-8');css.write_text(c,encoding='utf-8');sw.write_text(w,encoding='utf-8')
print('Cabeçalho compacto: botões ao lado do nome, endereço e validade logo abaixo.')
