# Busca Preço NH — protótipo

Esta versão inclui a página inicial com encarte completo, pesquisa e filtro por bairro. Os resultados em grade aparecem após a pesquisa; favoritos são salvos neste navegador.

O conteúdo ainda é demonstrativo: há um encarte original disponível; validade, bairro e endereço precisam de confirmação. O botão Como chegar informa que o endereço está pendente. A extração por IA, expiração automática e notificações remotas ainda não foram implementadas.

## Publicar no projeto existente pela Vercel

1. Extraia este ZIP. Envie o conteúdo da pasta busca-preco-nh para um repositório GitHub. package.json, build.mjs, vercel.json e a pasta public devem ficar na raiz do repositório.
2. Abra o projeto existente busca-preco-nh na Vercel. Em Settings > Git, conecte esse repositório. Se já houver um repositório conectado, atualize os arquivos nele.
3. Nas configurações de build, use Framework Preset: Other; Build Command: node build.mjs; Output Directory: dist. Root Directory deve apontar para a pasta que contém package.json.
4. Publique a versão pela integração Git e confira o status Ready. Se a conexão não iniciar uma publicação, faça um novo commit no repositório conectado.
5. Abra https://busca-preco-nh.vercel.app e confira a página inicial e uma pesquisa.

A pasta dist também está incluída, com os arquivos estáticos prontos. O ZIP não foi publicado automaticamente.

Documentação oficial:
https://vercel.com/docs/project-configuration/git-settings
https://vercel.com/docs/builds/configure-a-build

## Validar localmente

Com Node.js instalado, execute: node build.mjs
Sirva a pasta dist por um servidor HTTP local. Abrir index.html diretamente como arquivo não reproduz corretamente os caminhos absolutos e o service worker.
