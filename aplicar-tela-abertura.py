from pathlib import Path
import json,re
manifest=Path('public/manifest.webmanifest')
sw=Path('public/sw.js')
if not manifest.is_file() or not sw.is_file():
    raise SystemExit('Execute na pasta principal do projeto, onde está a pasta public.')
data=json.loads(manifest.read_text(encoding='utf-8'))
if not data.get('icons'):
    raise SystemExit('O manifesto não contém ícones. Aplique primeiro o pacote do ícone PWA.')
s=sw.read_text(encoding='utf-8')
def update_cache(m):
    name=m.group(3)
    if not name.endswith('-green-splash'):name+='-green-splash'
    return m.group(1)+m.group(2)+name+m.group(2)
s,count=re.subn(r'''(const\s+CACHE\s*=\s*)(['"])(.*?)\2''',update_cache,s,count=1)
if count!=1:
    raise SystemExit('Não foi possível localizar CACHE no sw.js. Nenhuma configuração foi alterada.')
data['background_color']='#023926'
data['theme_color']='#023926'
manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sw.write_text(s,encoding='utf-8')
print('Tela de abertura: fundo verde #023926. Ícones existentes preservados.')
