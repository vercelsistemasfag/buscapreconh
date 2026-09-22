from pathlib import Path
import re
app=Path('public/app.js');sw=Path('public/sw.js')
if not app.is_file() or not sw.is_file():raise SystemExit('Execute na pasta principal do projeto, onde está a pasta public.')
s=app.read_text(encoding='utf-8');worker=sw.read_text(encoding='utf-8')
old="""const stores = [{
  id:'super-mariani', name:'Super Mariani', neighborhood:'Canudos',
  logo:'/assets/super-mariani.png', flyer:'/assets/encarte-super-mariani.jpg'
}]"""
if "id:'rede-unisuper'" not in s:raise SystemExit('Aplique primeiro o pacote da Unisuper. Nenhum código foi alterado.')
if old in s:s=s.replace(old,'const stores = []',1)
elif 'const stores = []' not in s:raise SystemExit('Cadastro de lojas diferente do esperado. Envie o app.js para ajustar sem perder alterações.')
needle="id:'rede-unisuper',name:'Rede Unisuper',"
replacement=needle+"logo:'/assets/unisuper-logo.png',"
if replacement not in s:
 if s.count(needle)!=1:raise SystemExit('Cadastro Unisuper não reconhecido. Nenhum código foi alterado.')
 s=s.replace(needle,replacement,1)
def bump(m):
 name=m.group(3)
 if not name.endswith('-unisuper-logo'):name+='-unisuper-logo'
 return m.group(1)+m.group(2)+name+m.group(2)
worker,n=re.subn(r'''(const\s+CACHE\s*=\s*)(['"])(.*?)\2''',bump,worker,count=1)
if n!=1:raise SystemExit('Cache não reconhecido. Nenhum código foi alterado.')
if "'/assets/unisuper-logo.png'" not in worker:
 worker,n=re.subn(r'(const SHELL\s*=\s*\[)',r"\1'/assets/unisuper-logo.png', ",worker,count=1)
 if n!=1:raise SystemExit('Lista de cache não reconhecida. Nenhum código foi alterado.')
app.write_text(s,encoding='utf-8');sw.write_text(worker,encoding='utf-8')
print('Card Super Mariani removido. Logotipo incluído no card da Unisuper.')
