from pathlib import Path
import json,re
root=Path('public')
manifest=root/'manifest.webmanifest'
sw=root/'sw.js'
if not manifest.is_file() or not sw.is_file():
    raise SystemExit('Execute na pasta principal do projeto, onde está a pasta public.')
data=json.loads(manifest.read_text(encoding='utf-8'))
icons=[{'src':f'/icons/icon-{n}.png?v=19','sizes':f'{n}x{n}','type':'image/png','purpose':'any'} for n in (192,512)]
icons.append({'src':'/icons/icon-512.png?v=19','sizes':'512x512','type':'image/png','purpose':'maskable'})
for n in (192,512):
    if not (root/f'icons/icon-{n}.png').is_file():raise SystemExit('Ícones não encontrados. Extraia o ZIP completo.')
s=sw.read_text(encoding='utf-8')
s,count=re.subn(r"const CACHE\s*=\s*(['\"])[^'\"]+\1", "const CACHE = 'busca-preco-nh-v19-pwa-icon'",s,count=1)
if count!=1:raise SystemExit('Não foi possível localizar o cache no sw.js. Nenhuma configuração foi alterada.')
if '?v=19' not in s:
    s,count=re.subn(r'(const SHELL\s*=\s*\[)',r"\1'/icons/icon-192.png?v=19', '/icons/icon-512.png?v=19', ",s,count=1)
    if count!=1:raise SystemExit('Não foi possível localizar SHELL no sw.js. Nenhuma configuração foi alterada.')
data['icons']=icons
manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sw.write_text(s,encoding='utf-8')
print('Ícones centralizados aplicados ao PWA. Configurações restantes e layout preservados.')
