from pathlib import Path
import json,re
app=Path('public/app.js');css=Path('public/encarte-viewer.css');sw=Path('public/sw.js')
for p in (app,css,sw):
 if not p.is_file():raise SystemExit('Arquivo ausente: '+str(p)+'. Execute na raiz do projeto.')
s=app.read_text(encoding='utf-8');c=css.read_text(encoding='utf-8');w=sw.read_text(encoding='utf-8');patch=json.loads(Path('patch/rolagem.json').read_text(encoding='utf-8'))
if patch['old'] in s:s=s.replace(patch['old'],patch['new'],1)
elif patch['new'] not in s:raise SystemExit('O visualizador difere da versão esperada. Nenhum código foi alterado; envie seu app.js para ajustar.')
if '/* rolagem-natural-v4 */' not in c:
 c+='''\n/* rolagem-natural-v4 */
.flyer-viewer .flyer-viewport {
  height: auto !important;
  max-height: none;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior: auto;
  touch-action: pan-x pan-y pinch-zoom;
}
.flyer-viewer .full-flyer { touch-action: pan-x pan-y pinch-zoom; }
.flyer-viewer .viewer-zoom {
  transform: scale(.8);
  transform-origin: bottom right;
}
'''
def bump(m):
 name=m.group(3)
 if not name.endswith('-rolagem-natural-v4'):name+='-rolagem-natural-v4'
 return m.group(1)+m.group(2)+name+m.group(2)
w,n=re.subn(r'''(const\s+CACHE\s*=\s*)(['"])(.*?)\2''',bump,w,count=1)
if n!=1:raise SystemExit('Cache não reconhecido. Nenhum código foi alterado.')
app.write_text(s,encoding='utf-8');css.write_text(c,encoding='utf-8');sw.write_text(w,encoding='utf-8')
print('Rolagem natural restaurada; zoom 20% menor no mesmo canto.')
