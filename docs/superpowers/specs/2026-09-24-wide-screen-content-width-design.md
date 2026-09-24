# Largura de conteúdo em telas grandes — design

**Data:** 24/09/2026
**Escopo:** as 28 pages de produção do LogixSphere — as 37 rotas privadas do catálogo, menos os
cinco protótipos, as duas duplicatas, os dois placeholders e o redirect, mais `/route-balance`,
que é posterior ao catálogo.
**Objetivo:** que qualquer page renderize bem de 1440px a 2560px, sem margem morta nem
linhas que atravessam o monitor inteiro.

---

## 1. O problema

Não existe uma escala de largura compartilhada. Cada page inventou a sua, direto no call site
do `DgpPageFrame`:

| Largura declarada | Pages |
|---|---|
| `max-w-full` (sem limite) | requests-inbox, daily-financial-insights, financial-invoices, adhoc-works-invoice-management, deductions-disbursements-recharges, requests, daily-operations-reports, week-planner-operations |
| `max-w-5xl` (1024px, o default do componente) | vehicles, vendor, contract-management, service-partner-invoices |
| `max-w-6xl` (1152px) | vendor-performance, assets |
| `max-w-[1600px]` | week-planner |
| `max-w-[1920px]` | home |

O efeito num monitor de 2560px é que, ao navegar entre duas pages vizinhas, o conteúdo salta
de uma coluna de 1024px — com cerca de 1500px de margem vazia dos lados — para edge-to-edge.
Não é que uma das duas esteja errada: é que não há acordo nenhum entre elas.

Em paralelo, as sete pages do portal do motorista usam `StandardPageLayout`, que aplica
`max-w-full`. São telas desenhadas primeiro para telemóvel; no desktop elas esticam até a
largura inteira do monitor, e os cards de KPI e as linhas de texto vão junto.

Os dois defeitos são opostos — um capa demais, o outro não capa nada — e a causa é a mesma:
a decisão de largura está espalhada pelos call sites em vez de morar no design system.

## 2. A decisão

Uma escala de quatro degraus, nomeada, com cada page classificada num deles.

| Token | Valor | Para que serve |
|---|---|---|
| `narrow` | 48rem (768px) | Formulários e leitura em coluna única |
| `standard` | 80rem (1280px) | Dashboards e grids de card |
| `wide` | 100rem (1600px) | Tabelas densas e planners |
| `full` | sem limite | Canvas que gere a própria escala |

Os valores são degraus de uma escala, não medidas exatas de nenhuma tela específica. O que
importa é que sejam poucos e que toda page caiba num deles — o dia em que uma page precisar de
um quinto valor, a pergunta certa é em qual dos quatro ela deveria caber.

### Por que não as alternativas

**Fluido em tudo** aproveita cada pixel, mas uma linha de texto com 2400px de largura é
ilegível, e um grid de quatro cards esticado nessa largura vira quatro faixas.

**Um único limite para todas** é uniforme, mas trata uma tabela de operações com dezoito
colunas como se fosse um formulário de fatura. As duas têm necessidades diferentes de largura,
e é exatamente isso que a escala expressa.

## 3. Onde os tokens moram

Como CSS custom properties no `:root` de `app/globals.css`, do mesmo jeito que as cores e o
raio já vivem hoje:

```css
--content-narrow:   48rem;
--content-standard: 80rem;
--content-wide:    100rem;
```

E expostas ao Tailwind em `tailwind.config.js`, via `theme.extend.maxWidth`, referenciando as
próprias vars:

```js
maxWidth: {
  'content-narrow':   'var(--content-narrow)',
  'content-standard': 'var(--content-standard)',
  'content-wide':     'var(--content-wide)',
}
```

Os dois, e não só um, porque três telas são CSS puro — `route-balance/styles.css`,
`week-planner/styles.css` e `NavbarWrapper.css` — e precisam do `var(--content-wide)`
diretamente, enquanto as outras 23 usam a classe utilitária. Definir nos dois lugares a partir
da mesma var mantém uma fonte da verdade só; definir o valor duas vezes criaria a mesma
divergência que este documento existe para resolver.

## 4. A API

`DgpPageFrame` e `StandardPageLayout` passam a receber:

```ts
width?: "narrow" | "standard" | "wide" | "full"
```

Default `"standard"` no `DgpPageFrame` e `"narrow"` no `StandardPageLayout` — este último
porque as sete pages que o usam são todas do portal do motorista, pensadas para telemóvel.

O prop `maxWidthClassName` do `DgpPageFrame` **é removido**, e os 14 call sites que o passam
migram para `width`. Manter os dois lado a lado preservaria exatamente o mecanismo que produziu
a inconsistência: um prop que aceita qualquer string convida cada page a inventar um valor
novo. Um union de quatro opções não.

`containerClassName` continua, porque resolve outra coisa (padding e spacing internos por
page), e não é por onde a divergência de largura entrou.

## 5. Gutters

A escada de padding atual do `DgpPageFrame` — `px-4 md:px-6 lg:px-8 xl:px-12` — para de crescer
no breakpoint `xl` (1280px). Acima disso, que é justamente a faixa deste trabalho, o padding
fica congelado em 3rem.

Troca por `px-[clamp(1rem,3vw,3rem)]`: mesma folga nos extremos, contínua no meio, e sem
precisar de um breakpoint novo acima do `2xl` — o Tailwind default não tem nenhum, e adicionar
um só para o gutter seria pagar caro por uma interpolação que o `clamp()` faz sozinho.

## 6. Classificação das pages

**wide (1600px)** — tabelas densas e planners:
week-planner, daily-operations-management, daily-operations-reports, vendor, vehicles,
contract-management, assets, financial-invoices, service-partner-invoices,
deductions-disbursements-recharges, adhoc-works-invoice-management, daily-financial-insights,
daily-financials, invoice-processing-workflow, schedule, requests-inbox, requests-admin,
vendor-performance, home, daily-game-plan.

**standard (1280px)** — nenhuma page de produção hoje. O degrau fica definido porque é o meio
natural da escala e o default do `DgpPageFrame`: uma page nova que não seja nem formulário nem
tabela densa cai aqui sem precisar decidir nada.

A home saiu deste degrau depois de uma medição: o `.home-new` já declara `max-width: 1480px`,
então classificá-la como `standard` a **estreitaria** em 200px. Num dashboard de widgets isso é
perda de espaço, não ganho — ela vai para `wide`, que a alarga para 1600px. O daily-game-plan
também vai para `wide` pelo mesmo motivo: é uma tela de acompanhamento em tempo real com
operações por depósito, mais próxima de uma tabela densa que de um formulário.

**narrow (768px)** — portal do motorista:
daily-performance-insight, current-performance, current-month, subcontractor, deductions,
mobile-invoice, requests.

**full** — route-balance, que já resolve a própria escala somando colunas de card e depois
ampliando os blocos até 1.5x (commit f547783). Nada neste trabalho toca nessa lógica.

Duas armadilhas de endereço, ambas já documentadas no catálogo, que decidem em que arquivo
cada edição cai:

- `/daily-operations-management` é a URL canônica, mas o `page.tsx` da pasta é uma linha só de
  reexport: o `DgpPageFrame` que precisa mudar está em
  `week-planner-operations/DailyOperationsManagementPage.tsx`, hoje com
  `maxWidthClassName="w-full max-w-full"` e `containerClassName="w-full px-0"`. O `px-0` é
  deliberado (a tela gere o próprio padding) e deve sobreviver à migração — muda a largura,
  não o container.
- `/week-planner` renderiza por `WeekPlannerPageContent.tsx`, não pelo `page.tsx`.

Fora de escopo: os cinco protótipos com dados fixos (`/daily`, `/logistics`, `/op-dashboard`,
`/performance`, `/invoice-history`), as duas duplicatas (`/op-management`,
`/operations-management`) e os dois placeholders (`/financial-management`,
`/financial-performance`). São telas que pedem uma decisão de produto — completar ou remover —
antes de pedir ajuste de layout.

## 7. O que não muda

Um `max-width` só passa a valer acima do próprio valor. Nenhum dos quatro tokens é menor que a
largura de um telemóvel ou de um tablet, então abaixo de `md` o resultado renderizado é
idêntico ao de hoje.

Isso é o que contém o risco: o trabalho inteiro só é observável em viewports largos, que é
exatamente onde ele deve ser verificado, e uma regressão não pode aparecer em telas pequenas
sem que algo muito diferente do descrito aqui tenha sido feito.

Também não muda: nenhuma decisão de conteúdo. Nenhum grid passa de quatro para seis colunas,
nenhum filtro muda de lugar, nenhum card é reposicionado. Este trabalho é largura e
espaçamento; densidade é um trabalho seguinte, e depende deste para ter onde acontecer.

## 8. Verificação

Type-check limpo, e as pages conferidas no browser em três viewports — 1440, 1920 e 2560 —
com pelo menos uma representante de cada token:

- `wide`: `/vendor` (tabela densa)
- `standard`: `/home` (grid de cards)
- `narrow`: `/current-performance` (portal do motorista)

O que se confirma em cada uma: o conteúdo centraliza dentro do limite do seu token, o gutter
cresce com o viewport sem passar de 3rem, e nada abaixo de `md` mudou.
