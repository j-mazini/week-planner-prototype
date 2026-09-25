# Telas ultra-wide — design

**Data:** 25/09/2026
**Escopo:** as pages de produção do LogixSphere que hoje declaram `width="wide"`, mais a home,
que declara a largura no próprio CSS. Continua o trabalho de
`2026-09-24-wide-screen-content-width-design.md`, que estabeleceu a escala de quatro degraus.
**Objetivo:** que as pages densas aproveitem monitores de 2560 a 5120px sem que o conteúdo
deixe de ser legível como conjunto, e que o conteúdo passe a centrar-se no ecrã e não na área
que sobra da rail de navegação.

---

## 1. O problema

A escala de largura resolveu a divergência entre pages, mas parou nos 1600px. Acima disso não
há nada: num 3440×1440 o conteúdo é uma coluna de 1600px com cerca de 900px mortos de cada
lado, e num 5120×1440 são 1730px mortos de cada lado.

Três medições que decidem a forma da solução:

**A escala colapsou num degrau.** Dos 27 call sites, 25 declaram `wide`. O degrau `standard`
não tem nenhum utilizador e o `narrow` tem um. O degrau mais largo é sempre o que parece mais
seguro escolher.

**Nenhuma escada de grid passa de `xl`.** Existe exatamente um `2xl:grid-cols-5` em cerca de
190 declarações de grid. Acima de 1536px nenhum grid ganha coluna, então subir o teto sozinho
produz cards maiores, não mais informação: um `lg:grid-cols-4` num container de 3228px dá
quatro cards de 790px.

**Existe uma segunda camada de largura.** `NavbarWrapper.css:190-205` empurra seis pages para
1840px com `!important`, por seletor `data-page`, e faz reflow de 2 para 3 colunas aos 1680px
em quatro delas. É a mesma divergência que a escala resolveu, recriada em CSS. Qualquer page
que migre para um degrau novo sem que esta camada seja considerada é anulada em silêncio.

E um quarto defeito, independente da largura: o conteúdo centra-se dentro da área sobrante, não
do monitor. `.app-main` tem `margin-left: 58px` para dar lugar à rail fixa, então o centro do
conteúdo cai em `50vw + 29px` — e em `50vw + 87px` com a rail expandida.

## 2. A decisão

Um degrau novo, `ultra`, e **um só limiar: 2200px.** Abaixo dele nada muda; acima, o degrau
solta.

Os 2200px separam limpo os dois grupos. Um 1920 apresenta uma área de conteúdo de cerca de
1862px e fica de fora; o mais estreito dos monitores-alvo, o 2560, entra.

O token não é um valor fixo — é o valor de `wide` que se liberta no limiar:

```css
--content-ultra: 100rem;                         /* = wide */
@media (min-width: 2200px) {
  :root { --content-ultra: 220rem; }             /* 3520px */
}
```

Isto é o que torna a promessa verificável em vez de aproximada: abaixo de 2200px `ultra` e
`wide` são o mesmo valor computado, logo trocar uma page de um para o outro não pode regredir
um 1920 — não há diferença nenhuma para regredir.

Os 220rem são um ponto de paragem escolhido, não medido. Estão dimensionados para que o 3440 e
o 4K encham e só o 32:9 centre: uma linha de tabela de 5000px é legível pixel a pixel e
ilegível como conjunto, porque obriga o olhar a atravessar o monitor inteiro para ligar a
primeira coluna à última.

### Os dois breakpoints

Em `theme.extend.screens` do `tailwind.config.js`, que hoje não existe:

```js
'3xl': '2200px',
'4xl': '3000px',
```

Não confundir com `theme.container.screens`, que o projeto já declara com `"2xl": "1400px"`:
aquilo configura as larguras da classe `.container` e não define variante nenhuma. Como o
projeto nunca declara `theme.screens`, as variantes são as do Tailwind por omissão — e por isso
o `2xl:` deste código dispara aos 1536px, e não aos 1400 que o `container` sugere.

O `3xl` partilha os 2200 com o token de propósito: um número, não dois. O `4xl` a 3000 apanha
3440, 3840 e 5120 e deixa o 2560 de fora — os 2560 ganham um passo de reflow, os 3440-e-acima
ganham dois.

Não há terceira rung. Acima de 3000 o container satura nos 3520px, então um 5120 e um 3840
apresentam ao grid exatamente a mesma largura: uma rung extra não teria nada de diferente para
dizer.

### Por que não as alternativas

**Container queries com grids intrínsecos** (`.app-main` como container, larguras em `cqi`,
grids em `repeat(auto-fit, minmax(…, 1fr))`) é tecnicamente a solução certa, e elimina o erro
da rail descrito abaixo. Foi recusada pelo custo: converter cerca de 190 declarações de grid
muda comportamento em *todas* as larguras, o que põe a app inteira na superfície de regressão
de um trabalho que só devia ser observável em monitores largos.

**Tornar o próprio `wide` ultra-aware**, sem token novo, evitaria o risco de o `ultra` colapsar
como o `wide` colapsou. Foi recusada porque dava a 25 call sites um comportamento novo que
nenhum deles pediu, incluindo as sete pages do portal do motorista, que não devem crescer.

**Fluido sem teto** não tem espaço morto nenhum, mas num 32:9 são grids de oito colunas e
linhas de 5000px.

### O custo aceite

Os breakpoints do Tailwind medem o viewport; o container é o viewport menos a rail. Com a
sidebar expandida (175px em vez de 58px) o `3xl` dispara na mesma largura de janela mas com
menos container por baixo.

E a centragem da secção 7 **dobra esse desconto**, porque desconta a rail dos dois lados: a
diferença entre rail recolhida e expandida passa de 117px para 234px. A meio da rung `3xl`
(viewport 2600) são 2484px de caixa com a rail recolhida contra 2250px com ela aberta — perto
de 10%, não os 4% que o desconto simples daria.

Na prática isso significa que um grid dimensionado para o limite superior de uma rung fica
cerca de meia coluna mais apertado com a sidebar aberta. As contagens da secção 6 estão
derivadas com a rail recolhida, que é o estado por omissão. É precisamente o erro que as
container queries eliminariam e esta abordagem não elimina — e é maior do que seria sem a
centragem, o que é uma troca deste documento e não um acidente.

## 3. Onde o token mora

Nos dois sítios onde os outros três já moram, a partir da mesma fonte. Em `app/globals.css`,
como acima; e em `tailwind.config.js`:

```js
maxWidth: {
  'content-ultra': 'var(--content-ultra)',
}
```

Os dois, e não só um, porque a home declara a largura em CSS puro
(`home-new.css:1`, hoje `max-width:var(--content-wide)`) enquanto as outras usam a classe
utilitária.

## 4. A API

O union partilhado por `DgpPageFrame` e `StandardPageLayout` ganha um membro:

```ts
type DgpPageFrameWidth = 'narrow' | 'standard' | 'wide' | 'ultra' | 'full'
```

com `ultra: 'w-full max-w-content-ultra'` nos dois mapas de classe. Os defaults não mudam:
`standard` no `DgpPageFrame`, `narrow` no `StandardPageLayout`.

`ultra` não é "quero mais espaço" — é "esta page transforma largura em mais informação". A
distinção importa porque é a que impede este degrau de colapsar como o `wide` colapsou.

## 5. Classificação das pages

**Migram `wide` → `ultra` (17).** Os 16 call sites do `DgpPageFrame`:
adhoc-works-invoice-management, assets, contract-management, daily-financial-insights,
daily-operations-reports, deductions-disbursements-recharges, financial-invoices, requests,
requests-inbox, service-partner-invoices, vehicles, vendor, vendor-performance, week-planner,
week-planner-operations e DailyOperationsManagementPage. Mais a **home**, que não passa por
prop nenhuma: `home-new.css:1` muda de `var(--content-wide)` para `var(--content-ultra)`.

São tabelas densas, planners e dashboards de grid. Todas ganham colunas ou deixam de precisar
de scroll horizontal.

`home/page.legacy.tsx` fica de fora: o Next só monta `page.tsx`, aquele ficheiro não renderiza.

**Ficam onde estão — o portal do motorista (7).** current-month, deductions, mobile-invoice,
subcontractor, requests-admin, current-performance e daily-performance-insight. São telas
desenhadas primeiro para telemóvel, já travadas em 1840px pela camada `data-page`, e quatro
delas já reflowam de 2 para 3 colunas aos 1680px. Esticá-las para 3520px não mostra mais nada:
mostra o mesmo conteúdo de telemóvel muito mais espalhado.

Esta é a decisão reversível deste documento. Num 3440 essas sete ficam com cerca de 770px
mortos de cada lado. O custo é aceite porque a alternativa é redesenhá-las para desktop, que é
outro trabalho; o sítio para mudar de ideias é a mesma camada de 1840, e é uma linha.

**Correção obrigatória.** `NavbarWrapper.css:199-205` impõe `max-width: 1840px !important` ao
`main` da `requests`. Sem mexer nele, a page migra para `ultra` e o CSS anula-a sem erro
nenhum. O `1840px` passa a `var(--content-ultra)`.

`narrow` (um call site) e `full` (route-balance) não mudam.

## 6. O reflow

A regra que governa cada rung: **cada família de card tem uma largura-alvo, que é a que ela já
tem a 1600px.** A rung existe para manter essa largura quando o container cresce, não para a
multiplicar. Uma contagem de colunas nunca é escolhida por parecer certa — é a contagem que
deixa o card mais perto do seu alvo.

| Grid | Alvo | Hoje | `3xl` | `4xl` |
|---|---|---|---|---|
| Hub de pages (`home-new__page-grid`) | ~380px | 4 | 6 *(391px)* | 8 *(401px)* |
| KPIs (`home-new__kpis`) | — | 4 | 4 | 4 |
| Rail da home (`minmax(0,1fr) 330px`) | — | 330px | 400px | 460px |

As larguras em itálico são a largura do card resultante num 2560 e num 3440, com a rail
recolhida.

**As grelhas de card de `/vehicles` e `/vendor` saíram desta tabela depois de medidas.**
`VehicleCardGrid.tsx:45` e `VendorCardGrid.tsx:63` parecem o caso óbvio — cards compactos com
uma escada que acaba em `xl:grid-cols-5` — mas ambas vivem dentro de um bloco `block md:hidden`.
Medido no browser a 2998px: em `/vehicles` o único match está com `width: 0` e um pai em
`display: none`; em `/vendor` o selector não devolve match nenhum, porque a variante mobile nem
chega a ser montada. Em desktop as duas pages são tabelas — duas por page. Acrescentar
`3xl:grid-cols-7` a um componente que está escondido acima de `md` seria código morto.

O ganho ultra-wide dessas pages continua a existir e não custa nada: são as tabelas, que deixam
de precisar de scroll horizontal assim que o container passa dos 1600px.

**Três grids que parecem candidatos e não são.** `InvoiceSummaryStats.tsx:24` é uma faixa
semanticamente fixa em cinco entradas, pelo mesmo motivo dos KPIs. `PerformanceBentoGrid.tsx:19`
e `GeneralDashboardBento.tsx:50` são bentos cujos filhos usam `BentoCard span={2}`: a aritmética
dos spans está presa a três colunas, e mudar a contagem parte o layout em vez de o melhorar.
`VendorDetailsModal.tsx:190` é um modal, não um container de page, e não herda a largura de
`ultra`.

**Os KPIs da home não ganham colunas, e isto é a correção mais importante desta secção.**
`home/page.tsx:12` declara `kpis` como um `as const` de exatamente quatro entradas. Um
`grid-template-columns` de seis sobre quatro itens não cria um quinto KPI: deixa duas células
vazias e **encolhe** os quatro cards — o oposto do objetivo. Grids de contagem fixa ficam com a
contagem que têm.

O que resta resolver neles é que quatro cards num container de 3228px dão 800px cada, e um KPI
de 800px é um número pequeno num campo grande. A saída não é mais uma coluna: é a faixa de KPIs
passar a partilhar a linha com o painel que hoje vem por baixo dela. Isso é o mesmo trabalho
dos painéis lado a lado no fim desta secção, e a faixa de KPIs da home entra nessa lista.

**As tabelas não precisam de trabalho nenhum, e são o maior ganho.** As tabelas densas estão em
`overflow-x: auto` com `white-space: nowrap`: hoje pedem scroll horizontal a 1600px, e a 3228px
deixam de pedir. Dezoito colunas passam a caber. Isso sai inteiro da secção 2 e não custa uma
linha de grid.

**Uma guarda entra junto:** blocos de texto corrido — descrições, empty states, texto de ajuda
— levam `max-width: 68ch`. Sem isso, subir o teto transforma um parágrafo de ajuda numa linha
de 3400px, que é o modo clássico de uma tela ultra-wide ficar pior do que estava.

**Os pares de painéis que hoje empilham e deviam ficar lado a lado ficam fora deste trabalho.**
A faixa de KPIs da home é o caso claro: quatro cards num container de 3324px dão 800px cada, e a
saída não é mais uma coluna — é a faixa passar a partilhar a linha com o painel que hoje vem por
baixo dela. Mas isso é reposicionar conteúdo, não redimensioná-lo, e cada par precisa de uma
decisão própria sobre o que fica ao lado de quê. O padrão existe no repo
(`NavbarWrapper.css:239`); o trabalho é um seguinte, e depende deste para ter largura onde
acontecer.

## 7. Centragem no ecrã

```css
.app-imported-page { padding-right: var(--sidebar-offset, 0px); }
```

A caixa passa a ter a rail à esquerda e a mesma folga à direita, logo o seu centro é
`58 + (100vw − 116) / 2 = 50vw`: o centro do ecrã, exatamente. E como é a *caixa* que fica
simétrica, todos os `mx-auto` e `margin: 0 auto` que já existem lá dentro acertam no centro do
monitor sem que nenhum deles mude.

**Uma caixa simétrica não chega — o conteúdo tem de estar centrado dentro dela.** Oito dos 16
call sites passam um `containerClassName` próprio, e nenhum inclui `mx-auto`: ficam encostados
à esquerda sempre que o teto morde. Com o teto em 1600px isso valia cerca de 100px e lia-se
como gutter; com o teto em 3520px num 5120 vale 714px. Os oito ganham `mx-auto`. Foi a subida
do teto que tornou visível um desalinhamento que já lá estava.

**Assenta em `.app-imported-page`, não em `.app-main`,** porque a `.app-topbar` é irmã dentro
do `.app-main` e tem fundo e `border-bottom` próprios: padding no pai faria a barra e a sua
borda pararem 58px antes da direita. O `.app-imported-page` é o wrapper do conteúdo e hoje não
tem padding nenhum, só tokens de cor.

**E é padding simétrico, não deslocamento negativo.** O truque que a `requests` já usa
(`NavbarWrapper.css:201`, `position: relative; left: calc(var(--sidebar-offset) / -2)`) move
uma caixa que continua dimensionada para a área inteira, o que em larguras apertadas a enfia
por baixo da rail. O padding resolve o mesmo sem valores negativos e sem risco de overflow — e
deixa esse bloco apagável.

Duas consequências que vêm de borda:

- **A rail deixa de empurrar o conteúdo de lado.** Hoje abrir a sidebar desloca tudo 117px para
  a direita. Com a caixa simétrica o conteúdo fica parado e só estreita.
- **Telemóvel não muda.** Abaixo de 640px `--sidebar-offset` já é `0px`, logo o padding é zero.

**O custo, dito por inteiro:** esta é a única parte do trabalho visível abaixo de 2200px. Num
1920 o conteúdo anda 29px para a esquerda, 87px com a rail aberta. Isso é deliberado — a
centragem foi pedida como comportamento geral, não como comportamento de ultra-wide. Se a
promessa de "nada abaixo de 2200 muda" tiver de ficar intacta, a mesma regra dentro de
`@media (min-width: 2200px)` limita-a aos monitores largos.

Em largura o custo é 58px: 3326 → 3268 num 3440. Num 1920 é zero, porque lá o teto de 1600 já
manda.

## 8. O que não muda

Um `max-width` só passa a valer acima do próprio valor, e o token `ultra` é idêntico ao `wide`
abaixo de 2200px. Nenhum dos breakpoints novos existe abaixo dessa largura. Abaixo de `md` o
resultado renderizado é idêntico ao de hoje, com a única exceção da centragem da secção 7 — que
é zero em telemóvel, onde a rail não ocupa lugar.

Isto é o que contém o risco: fora da centragem, o trabalho inteiro só é observável acima de
2200px, e uma regressão não pode aparecer em telas pequenas sem que algo muito diferente do
descrito aqui tenha sido feito.

**O portal do motorista muda em duas coisas, e as duas vêm da secção 7, não da migração.** A
centragem vive no `.app-imported-page`, que é pai de todas as pages, portanto custa 58px de
largura a todas — medido em `/current-performance`: 1806 → 1748 a 1920px. Acima de 2560 não
mexe, porque lá o teto de 1840 é que manda. E o conteúdo passa a estar centrado no ecrã, que
era o objetivo.

O que continua verdade, e é o que importa: o teto dessas sete pages **continua em 1840** e não
subiu para 3520. Elas não foram migradas.

Também não muda: os degraus `narrow`, `standard`, `wide` e `full`, os defaults dos dois
componentes, e o bloco de reflow dos 1680px.

## 9. Verificação

Larguras finais, com a centragem aplicada e a rail recolhida. A medida é a **caixa** do
container — sob `box-sizing: border-box`, que o preflight do Tailwind aplica a tudo, o
`max-width` inclui o padding do próprio elemento:

| Monitor | Caixa | Centro |
|---|---|---|
| 1920×1080 | 1600px *(igual a hoje)* | no ecrã |
| 2560×1080 e 2560×1440 | 2388px | no ecrã |
| 3440×1440 | 3268px | no ecrã |
| 3840×2160 | 3520px | no ecrã |
| 5120×1440 | 3520px | no ecrã |

A fórmula é `min(viewport − 172, 3520)`, e os 172 foram medidos e não deduzidos: 58px de rail
mais 28px de padding do `.app-imported-page`, de cada lado. A primeira versão desta tabela
esquecia os 28px e errava por 56px em todas as larguras abaixo do teto. Foi apanhada pela
medição da Task 3 — que é precisamente para isto que o harness existe.

`tsc --noEmit` limpo, e `DgpPageFrame.test.tsx` e `StandardPageLayout.test.tsx` estendidos com
o caso `ultra`.

No browser: 1920 e 2560 nativamente. 3440 e 5120 não cabem no painel físico desta máquina, e um
screenshot redimensionado mente sobre exatamente aquilo que este trabalho decide. Em vez disso
mede-se — a app dentro de um `<iframe width="5120">` numa página que faz scroll, lendo
`getComputedStyle` do container e a posição do seu centro.

Quatro asserções por viewport:

1. a largura do container bate a tabela acima, com 1px de tolerância;
2. o centro da caixa de conteúdo coincide com o centro do viewport;
3. a contagem de colunas dos grids bate a tabela da secção 6;
4. abaixo de 2200px a largura é idêntica à baseline, sendo o desvio de 29px da centragem a
   única diferença esperada.
