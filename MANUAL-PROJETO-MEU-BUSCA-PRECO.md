# Manual do Projeto — Meu Busca Preço

Última atualização: 24/09/2026

Este documento registra a arquitetura, os padrões visuais, as regras de negócio e o fluxo de manutenção do projeto.

Leia também `AGENTS.md` antes de qualquer alteração.

## 1. OBJETIVO

Meu Busca Preço é um site/PWA para reunir encartes de supermercados de Novo Hamburgo/RS.

Principais funções:

- visualizar encartes completos;
- pesquisar produtos;
- comparar preços;
- filtrar por bairro;
- selecionar filiais;
- abrir rota no mapa;
- compartilhar encartes;
- favoritar lojas;
- instalar como PWA.

A prioridade é oferecer uma experiência simples, rápida e clara no celular.

## 2. TECNOLOGIA

O projeto é estático e não utiliza framework de front-end.

Estrutura principal:

- HTML
- CSS
- JavaScript
- Service Worker
- Manifest PWA
- Node.js apenas para o build

O comando de build é:

`npm run build`

O `build.mjs` copia todo o conteúdo de `public/` para `dist/`.

A pasta `public/` é a principal fonte de verdade do projeto atual.

## 3. CARDS DOS SUPERMERCADOS

Os cards são cadastrados em `public/app.js`.

Eles ficam dentro do array `stores`.

Cada card possui informações como:

- ID da loja;
- nome exibido;
- logotipo;
- validade;
- páginas do encarte;
- filiais;
- bairros;
- endereços.

### Estrutura básica de um card

Cada card possui um ID único, nome, logo, validade, encarte e filiais.

## 4. ORDEM DOS ENCARTES

A ordem base dos cards segue a ordem do array stores.

Todo novo encarte deve ser inserido logo após const stores = [].

Assim, o card novo aparece antes dos anteriores.

Lojas favoritas continuam tendo prioridade e podem aparecer acima das demais.

## 5. VALIDADE DOS ENCARTES

Encartes reais usam validFrom e validUntil no formato YYYY-MM-DD.

Encartes de teste devem usar demo:true.

A flag demo:true impede que o card desapareça automaticamente após a data de validade.

Nunca remover demo:true de um encarte de teste sem confirmação.

## 6. PADRÃO VISUAL DOS CARDS

O card do Super Juca é a principal referência visual.

O padrão é: logo à esquerda, nome da loja ao lado, Novo Hamburgo abaixo do nome, filiais à direita, endereço e validade abaixo.

Nenhum texto deve ultrapassar os limites do card.

## 7. PRODUTOS

Os produtos usados na pesquisa ficam em arquivos JavaScript separados por mercado.

Arquivos atuais: unisuper-produtos.js, novos-produtos.js e osana-produtos.js.

Cada produto deve usar dados reais do encarte e manter o storeId correspondente ao card da loja.

### Campos principais de um produto

Cada produto pode ter: id, name, brand, size, price, category, clubPrice, bulk, page, region, market, storeId, neighborhoods, validFrom, validUntil, image e productImage.

O campo price representa o preço anunciado normal. clubPrice representa preço especial de clube quando existir.

## 8. RECORTE DE PRODUTOS

O campo region usa quatro valores proporcionais entre 0 e 1: x, y, largura e altura.

Nunca usar pixels em region.

Exemplo válido: [0.25, 0.265, 0.25, 0.17].

Se o recorte incluir produtos ou preços vizinhos, usar uma imagem individual em productImage.

## 9. IMAGENS INDIVIDUAIS

Quando o recorte do encarte não ficar limpo, usar productImage.

Padrão recomendado: PNG 800x800, fundo branco ou transparente, produto centralizado e ocupando cerca de 75% a 85% da área.

Evitar incluir outros produtos, preços ou textos desnecessários na imagem.

## 10. PESQUISA DE PRODUTOS

A pesquisa ignora acentos e aceita múltiplas palavras.

Os resultados são ordenados pelo campo price, do menor para o maior.

clubPrice é exibido como condição especial, mas não define a ordenação principal.

Durante a pesquisa, o banner e a lista de encartes ficam ocultos.

## 11. BAIRROS E FILIAIS

A grafia do bairro deve ser exatamente igual no card e nos produtos.

Exemplo: se o card usa Vila Rosa, os produtos também devem usar Vila Rosa.

Diferenças como Via Rosa e Vila Rosa podem impedir o filtro de funcionar corretamente.

Cada filial deve possuir endereço completo para o botão Como chegar.

## 12. SUPER OSANA

ID: super-osana.
Nome exibido: Super Osana.
É um encarte de teste e usa demo:true.

Logo: /logo-osana.png.
Encarte: /superosana.png.
CSS: /osana.css.
Produtos: /osana-produtos.js.
Imagens individuais: /produtos-osana/.

### Filiais Super Osana

Guarani — Rua Joaquim Pedro Soares, 1013.

Ideal — Av. Cel. Frederico Linck, 815.

Roselândia — Rua Francisco Alves, 325.

Vila Rosa — Rua Vinte e Quatro de Maio, 440.

## 13. SUPER JUCA

ID: super-juca.
É um encarte de teste e usa demo:true.

Logo: /assets/super-juca-logo.png.
Encarte atual do card: /jucanovo.png.
CSS: /super-juca.css.
Produtos: /novos-produtos.js.

### Filiais Super Juca

Industrial — Rua Pinheiro Machado, 415.

Loja 1 · Santo Afonso — Rua Visconde de Araguaia, 331.

Loja 2 · Santo Afonso — Rua Carlos Afonso Braunger, 279.

A ordem dos botões deve permanecer: Industrial, Loja 1 e Loja 2.

## 14. OFERSUL NH

ID: ofersul.
Nome exibido: Ofersul NH.

Logo: /assets/ofersul-logo.jpg.
CSS: /ofersul.css.
Produtos: /novos-produtos.js.

Filial atual: Ouro Branco — Rua Bento Gonçalves, 335, Novo Hamburgo.

## 15. REDE UNISUPER

ID: rede-unisuper.

Logo: /assets/unisuper-logo-branco.png.
CSS: /unisuper.css.
Produtos: /unisuper-produtos.js.

O encarte possui quatro páginas em /encartes/unisuper/.

Filiais atuais: Pátria Nova e Rondônia.

## 16. RODAPÉ E IDENTIDADE

Texto atual do rodapé: © 2026 Meu Busca Preço — Desenvolvido por Lambari.

Logo da Lambari: /lambari-transparente.png.

Link da Lambari: https://agencialambari.vercel.app.

Não substituir novamente por Vercel Sistemas sem nova decisão do responsável pelo projeto.

## 17. PWA E CACHE

O projeto usa public/manifest.webmanifest e public/sw.js.

O service worker controla o cache do PWA.

Ao alterar arquivos essenciais, verificar se precisam ser incluídos no cache e considerar atualizar o nome da constante CACHE.

Depois de mudanças no PWA, testar também a versão instalada no celular.

## 18. FLUXO DE ALTERAÇÃO

Antes de alterar: git status e git pull origin main.

Após alterar: verificar sintaxe quando aplicável e executar npm run build.

Mudanças visuais devem ser testadas no preview antes da publicação.

Depois da validação, usar git add apenas nos arquivos alterados, commit com mensagem objetiva e git push origin main.

## 19. ADICIONAR NOVA LOJA

Para uma nova loja, receber logo, encarte, validade, bairros, endereços e produtos.

Cadastrar o novo card no início do array stores.

Se for teste, usar demo:true.

Criar CSS específico somente se necessário.

Cadastrar os produtos mantendo storeId e bairros compatíveis com o card.

## 20. CHECKLIST ANTES DE PUBLICAR

Confirmar que a página inicial carrega normalmente.

Verificar cards, filiais, endereço, Como chegar, Favoritar, zoom e pesquisa.

Confirmar que as imagens dos produtos aparecem e que os resultados continuam ordenados por preço.

Verificar também se o banner some durante a pesquisa e se o rodapé permanece correto.

## 21. ERROS COMUNS

Se todos os cards e a pesquisa sumirem ao mesmo tempo, verificar primeiro erros de execução em app.js ou nos módulos de produtos importados.

Um arquivo de produtos com estrutura incorreta pode impedir toda a aplicação de renderizar.

Não assumir que node --check garante que o site funcionará no navegador.

Sempre comparar a estrutura de um novo produto com os arquivos que já funcionam.

## 22. INSTRUÇÕES PARA CHATGPT / IA

Antes de qualquer alteração, ler AGENTS.md e este manual inteiro.

Depois, inspecionar os arquivos atuais relacionados à tarefa.

Não assumir que uma solução antiga ainda corresponde ao código atual.

Fazer mudanças pequenas, preservar funcionalidades existentes e testar antes de publicar.

Quando o usuário estiver no celular, trabalhar preferencialmente um passo por vez com comandos curtos e copiáveis.

## 23. INÍCIO DE UMA NOVA CONVERSA

Mensagem recomendada para outro ChatGPT:

Acesse o projeto Meu Busca Preço. Antes de alterar qualquer arquivo, leia AGENTS.md e MANUAL-PROJETO-MEU-BUSCA-PRECO.md completos. Depois inspecione o código atual relacionado à tarefa, preserve os padrões existentes, faça alterações pequenas e teste antes de publicar.

## 24. MANUTENÇÃO DESTE MANUAL

Atualizar este documento sempre que houver nova loja, nova regra de validade, mudança na estrutura de produtos, alteração importante na busca, favoritos, PWA, publicação ou padrão visual dos cards.

O objetivo é permitir que outro desenvolvedor ou outro ChatGPT continue o projeto sem depender do histórico de conversas anteriores.
