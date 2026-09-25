# AGENTS.md — Meu Busca Preço

Este arquivo orienta humanos e agentes de IA que trabalharem neste projeto.

## LEITURA OBRIGATÓRIA

Antes de alterar qualquer arquivo:

1. Leia `MANUAL-PROJETO-MEU-BUSCA-PRECO.md`.
2. Inspecione os arquivos atuais relacionados à tarefa.
3. Considere `public/` como a principal fonte de verdade.
4. Não use ZIPs, patches ou scripts antigos como referência principal.
5. Preserve as funcionalidades existentes.

## REGRAS DO PROJETO

- Projeto mobile first.
- O card do Super Juca é a principal referência visual.
- Novo card entra no início do array `stores`.
- Favoritos continuam aparecendo primeiro.
- Encarte de teste usa `demo:true`.
- Bairro do card e dos produtos deve ter exatamente a mesma grafia.
- `region` usa valores entre 0 e 1, nunca pixels.
- Se o recorte do encarte ficar ruim, usar `productImage`.
- Imagens individuais de produto: preferencialmente PNG 800x800.
- Testar localmente antes de publicar.

## ARQUIVOS PRINCIPAIS

- `public/app.js` — cards, filiais, busca, favoritos, validade e zoom.
- `public/index.html` — estrutura da página.
- `public/style.css` — estilos globais.
- `public/super-juca.css` — referência visual dos cards.
- `public/osana.css` — ajustes do Super Osana.
- `public/unisuper-produtos.js` — produtos Unisuper.
- `public/novos-produtos.js` — produtos Ofersul e Super Juca.
- `public/osana-produtos.js` — produtos Super Osana.
- `public/busca-real.css` — resultados da pesquisa.
- `public/sw.js` — PWA e cache.
- `build.mjs` — gera a pasta `dist`.

## FLUXO SEGURO

Antes de alterar:
`git status`
`git pull origin main`

Depois de alterar:
`node --check public/app.js`
`npm run build`

Somente após testar:
`git add <arquivos alterados>`
`git commit -m "Descrição objetiva"`
`git push origin main`

## ESTADO ATUAL

### Super Osana
- ID: `super-osana`
- Nome exibido: `Super Osana`
- Encarte de teste: `demo:true`
- Logo: `/logo-osana.png`
- Encarte: `/superosana.png`
- CSS: `/osana.css`
- Produtos: `/osana-produtos.js`
- Imagens individuais: `/produtos-osana/`

Filiais:
- Guarani
- Ideal
- Roselândia
- Vila Rosa

### Super Juca
- ID: `super-juca`
- Encarte de teste: `demo:true`
- Logo: `/assets/super-juca-logo.png`
- Encarte atual: `/jucanovo.png`
- CSS: `/super-juca.css`

## RODAPÉ

`© 2026 Meu Busca Preço — Desenvolvido por Lambari`

Link:
`https://agencialambari.vercel.app`

## INSTRUÇÕES PARA CHATGPT / IA

Ao assumir este projeto:

1. Leia este arquivo inteiro.
2. Leia `MANUAL-PROJETO-MEU-BUSCA-PRECO.md`.
3. Consulte sempre o código atual antes de sugerir alterações.
4. Faça mudanças pequenas e localizadas.
5. Não remova funcionalidades existentes.
6. Diagnostique erros antes de aplicar novas correções.
7. Trabalhe um passo por vez quando o usuário estiver no celular.
8. Forneça comandos fáceis de copiar.
9. Não publique mudanças visuais antes do teste local.
10. Mantenha este manual atualizado quando decisões importantes mudarem.

## ATENÇÃO

Verifique `public/osana-produtos.js`: o bairro dos produtos deve estar como `Vila Rosa`, igual ao card. Se ainda aparecer `Via Rosa`, corrigir antes de trabalhar com o filtro dessa filial.
