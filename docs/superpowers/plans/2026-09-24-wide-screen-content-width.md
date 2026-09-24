# Largura de conteúdo em telas grandes — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar às 28 pages de produção uma escala de largura compartilhada, para que renderizem bem de 1440px a 2560px sem margem morta nem linhas que atravessam o monitor.

**Architecture:** Quatro tokens de largura (`narrow`/`standard`/`wide`/`full`) definidos como CSS custom properties em `app/globals.css` e expostos ao Tailwind via `theme.extend.maxWidth`. Os dois shells compartilhados — `DgpPageFrame` (16 pages) e `StandardPageLayout` (7 pages) — passam a receber um prop `width` que escolhe o token; o prop `maxWidthClassName`, que aceita qualquer string e foi por onde a inconsistência entrou, é removido. As 5 pages que não usam shell nenhum recebem o token direto no seu container.

**Tech Stack:** Next.js (App Router), React 18, TypeScript, Tailwind CSS 3, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-09-24-wide-screen-content-width-design.md`

## Global Constraints

- Os valores dos tokens são exatamente: `--content-narrow: 48rem`, `--content-standard: 80rem`, `--content-wide: 100rem`. `full` não tem token — é a ausência de limite.
- Nomes das classes Tailwind geradas: `max-w-content-narrow`, `max-w-content-standard`, `max-w-content-wide`. Não inventar outros nomes.
- Nada abaixo do breakpoint `md` pode mudar de renderização. Todo token é maior que qualquer viewport de telemóvel ou tablet, então nenhum deles pode passar a valer nessas larguras.
- Este trabalho é largura e espaçamento apenas. Nenhum grid muda de número de colunas, nenhum componente é reposicionado, nenhum conteúdo é adicionado ou removido.
- Rodar type-check com `npm run typecheck` (valida contra um baseline congelado em `scripts/typecheck-baseline.json` e falha só em erro novo). **Não** rodar `npx tsc --noEmit` direto: leva mais de 20 minutos neste repositório.
- Rodar testes com `npm test` (vitest run). Testes de componente precisam de `// @vitest-environment jsdom` na primeira linha e de `import '@testing-library/jest-dom/vitest'`.
- Commits em inglês, seguindo o padrão do repositório (`feat:`, `style:`, `refactor:`).

---

### Task 1: Os tokens e o prop `width` no DgpPageFrame

Define a escala e ensina o `DgpPageFrame` a consumi-la. O prop antigo `maxWidthClassName` continua funcionando ao fim desta task — ele só é removido na Task 2, depois que todos os call sites migrarem, para que o repositório nunca fique com build quebrado entre duas tasks.

**Files:**
- Modify: `app/globals.css` (bloco `:root`, logo após `--radius`)
- Modify: `tailwind.config.js` (dentro de `theme.extend`)
- Modify: `app/(private)/components/DgpPageFrame.tsx`
- Test: `app/(private)/components/DgpPageFrame.test.tsx` (criar)

**Interfaces:**
- Consumes: nada (primeira task).
- Produces: o tipo `DgpPageFrameWidth = "narrow" | "standard" | "wide" | "full"`, exportado de `app/(private)/components/DgpPageFrame.tsx`; o prop `width?: DgpPageFrameWidth` no `DgpPageFrame`, com default `"standard"`; e as classes `max-w-content-narrow` / `max-w-content-standard` / `max-w-content-wide`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `app/(private)/components/DgpPageFrame.test.tsx`:

```tsx
// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DgpPageFrame } from './DgpPageFrame';

afterEach(() => cleanup());

const container = () => document.querySelector('.dgp-page-frame-container');

describe('DgpPageFrame width', () => {
  it('defaults to the standard content width', () => {
    render(<DgpPageFrame><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-content-standard');
  });

  it('applies the narrow token', () => {
    render(<DgpPageFrame width="narrow"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-content-narrow');
  });

  it('applies the wide token', () => {
    render(<DgpPageFrame width="wide"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-content-wide');
  });

  it('uncaps the container for full-width pages', () => {
    render(<DgpPageFrame width="full"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-none');
    expect(container()).not.toHaveClass('max-w-content-wide');
  });

  it('keeps the children rendered inside the container', () => {
    render(<DgpPageFrame width="wide"><p>content</p></DgpPageFrame>);
    expect(container()).toContainHTML('<p>content</p>');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run "app/(private)/components/DgpPageFrame.test.tsx"`
Expected: FAIL — o container tem `max-w-5xl`, não `max-w-content-standard`.

- [ ] **Step 3: Adicionar as CSS custom properties**

Em `app/globals.css`, dentro do bloco `:root`, logo depois da linha `--radius: .375rem;`:

```css
  /* Escala de largura de conteúdo. Ver docs/superpowers/specs/2026-09-24-wide-screen-content-width-design.md */
  --content-narrow: 48rem;
  --content-standard: 80rem;
  --content-wide: 100rem;
```

- [ ] **Step 4: Expor os tokens ao Tailwind**

Em `tailwind.config.js`, dentro de `theme.extend` (irmão de `colors` e `fontFamily`):

```js
      maxWidth: {
        'content-narrow': 'var(--content-narrow)',
        'content-standard': 'var(--content-standard)',
        'content-wide': 'var(--content-wide)',
      },
```

- [ ] **Step 5: Implementar o prop no DgpPageFrame**

Em `app/(private)/components/DgpPageFrame.tsx`, adicionar acima do componente:

```tsx
export type DgpPageFrameWidth = 'narrow' | 'standard' | 'wide' | 'full';

const widthClass: Record<DgpPageFrameWidth, string> = {
  narrow: 'w-full max-w-content-narrow',
  standard: 'w-full max-w-content-standard',
  wide: 'w-full max-w-content-wide',
  full: 'w-full max-w-none',
};
```

No type `DgpPageFrameProps`, adicionar:

```tsx
  /**
   * Degrau da escala de largura de conteúdo. `full` é para pages que gerem a
   * própria escala (canvas), não para "quero mais espaço".
   */
  width?: DgpPageFrameWidth;
```

Na assinatura, trocar o default `maxWidthClassName = "max-w-5xl"` por `maxWidthClassName` sem default, adicionar `width = 'standard'`, e resolver a classe:

```tsx
export function DgpPageFrame({
  children,
  backgroundVariant = 'default',
  width = 'standard',
  maxWidthClassName,
  containerClassName = "mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-4 md:py-6 space-y-4 md:space-y-6",
  className = "",
}: DgpPageFrameProps) {
```

E no JSX, trocar `${maxWidthClassName}` por `${maxWidthClassName ?? widthClass[width]}`.

- [ ] **Step 6: Rodar o teste e confirmar que passa**

Run: `npx vitest run "app/(private)/components/DgpPageFrame.test.tsx"`
Expected: PASS, 5 testes.

- [ ] **Step 7: Confirmar que nada mais quebrou**

Run: `npm test && npm run typecheck`
Expected: ambos verdes. Os 14 call sites que ainda passam `maxWidthClassName` continuam a funcionar — a classe explícita vence o token, que é o que permite migrar um de cada vez na Task 2.

- [ ] **Step 8: Commit**

```bash
git add app/globals.css tailwind.config.js "app/(private)/components/DgpPageFrame.tsx" "app/(private)/components/DgpPageFrame.test.tsx"
git commit -m "feat: add shared content-width scale and DgpPageFrame width prop"
```

---

### Task 2: Migrar os 17 call sites do DgpPageFrame e fechar a porta antiga

Classifica cada page num degrau da escala e remove o `maxWidthClassName`. As duas coisas andam juntas porque remover o prop só é possível depois que ninguém o usa, e mantê-lo depois da migração recriaria, no primeiro call site novo, exatamente a divergência que este trabalho fecha.

**Files:**
- Modify: `app/(private)/vendor/page.tsx`, `app/(private)/vehicles/page.tsx`, `app/(private)/contract-management/page.tsx` (hoje sem override, herdavam `max-w-5xl`)
- Modify: `app/(private)/requests-inbox/page.tsx:513`, `app/(private)/vendor-performance/page.tsx:198`, `app/(private)/week-planner-operations/page.tsx:2233`, `app/(private)/daily-financial-insights/page.tsx:399`, `app/(private)/week-planner/WeekPlannerPageContent.tsx:7564`, `app/(private)/financial-invoices/page.tsx:299`, `app/(private)/adhoc-works-invoice-management/page.tsx:358`, `app/(private)/service-partner-invoices/page.tsx:102`, `app/(private)/assets/page.tsx:166`, `app/(private)/deductions-disbursements-recharges/page.tsx:824`, `app/(private)/week-planner-operations/DailyOperationsManagementPage.tsx:1937`, `app/(private)/requests/page.tsx:296`, `app/(private)/daily-operations-reports/page.tsx:438`, `app/(private)/home/page.legacy.tsx:100`
- Modify: `app/(private)/components/DgpPageFrame.tsx` (remover o prop)

Esta task não altera nenhum arquivo de teste: que o prop sumiu é um fato do sistema de tipos, verificado no Step 4 por `npm run typecheck`.

**Interfaces:**
- Consumes: `width` e `DgpPageFrameWidth` da Task 1.
- Produces: `DgpPageFrame` sem `maxWidthClassName`. Qualquer código posterior escolhe largura só pelo union de quatro valores.

- [ ] **Step 1: Trocar `maxWidthClassName` por `width` em cada call site**

Um por um, na tabela abaixo. Em todos, **apagar** o atributo `maxWidthClassName="..."` e **pôr** o `width` indicado. Não mexer em `containerClassName`, `backgroundVariant` nem em nenhum outro atributo.

| Arquivo | `maxWidthClassName` atual | Passa a ser |
|---|---|---|
| `vendor/page.tsx` | (nenhum, herdava `max-w-5xl`) | `width="wide"` |
| `vehicles/page.tsx` | (nenhum, herdava `max-w-5xl`) | `width="wide"` |
| `contract-management/page.tsx` | (nenhum, herdava `max-w-5xl`) | `width="wide"` |
| `requests-inbox/page.tsx:513` | `"w-full max-w-full"` | `width="wide"` |
| `vendor-performance/page.tsx:198` | `"max-w-6xl"` | `width="wide"` |
| `week-planner-operations/page.tsx:2233` | `"w-full max-w-full"` | `width="wide"` |
| `daily-financial-insights/page.tsx:399` | `"w-full max-w-full"` | `width="wide"` |
| `week-planner/WeekPlannerPageContent.tsx:7564` | `"max-w-[1600px]"` | `width="wide"` |
| `financial-invoices/page.tsx:299` | `"w-full max-w-full"` | `width="wide"` |
| `adhoc-works-invoice-management/page.tsx:358` | `"w-full max-w-full"` | `width="wide"` |
| `service-partner-invoices/page.tsx:102` | `"w-full max-w-5xl"` | `width="wide"` |
| `assets/page.tsx:166` | `"max-w-6xl"` | `width="wide"` |
| `deductions-disbursements-recharges/page.tsx:824` | `"w-full max-w-full"` | `width="wide"` |
| `week-planner-operations/DailyOperationsManagementPage.tsx:1937` | `"w-full max-w-full"` | `width="wide"` |
| `daily-operations-reports/page.tsx:438` | `"w-full max-w-full"` | `width="wide"` |
| `requests/page.tsx:296` | `"w-full max-w-full"` | `width="narrow"` |
| `home/page.legacy.tsx:100` | `"max-w-[1920px]"` | `width="wide"` |

Três observações que decidem se a edição está certa:

- `week-planner-operations/DailyOperationsManagementPage.tsx:1937` também passa `containerClassName="w-full px-0"`. Esse `px-0` é deliberado — a tela gere o próprio padding — e **fica como está**. Muda só a largura.
- `requests/page.tsx` vai para `narrow`, não `wide`: é uma das sete telas do portal do motorista, pensada para telemóvel, e é a única delas que usa `DgpPageFrame` em vez de `StandardPageLayout`.
- `home/page.legacy.tsx` não é uma rota do Next (só `page.tsx` é) — é código morto. Migra mesmo assim, numa linha, porque senão a remoção do prop no Step 3 quebra o type-check. Não vale a pena decidir sobre apagar o arquivo dentro deste trabalho.

- [ ] **Step 2: Confirmar que nenhum call site ficou para trás**

Run: `grep -rn "maxWidthClassName" "app/(private)" --include="*.tsx"`
Expected: só a definição em `app/(private)/components/DgpPageFrame.tsx`. Qualquer outra linha é um call site esquecido — migra antes de seguir.

- [ ] **Step 3: Remover o prop do componente**

Em `app/(private)/components/DgpPageFrame.tsx`: apagar a entrada `maxWidthClassName?: string;` (e o comentário JSDoc dela) do type `DgpPageFrameProps`, apagar `maxWidthClassName` da desestruturação, e no JSX trocar `${maxWidthClassName ?? widthClass[width]}` por `${widthClass[width]}`.

- [ ] **Step 4: Rodar tudo**

Run: `npm test && npm run typecheck`
Expected: ambos verdes.

O type-check **é** o teste desta task, e é por isso que não há um teste de runtime para a remoção do prop. Que `maxWidthClassName` deixou de existir é um fato do sistema de tipos, não do DOM: um call site esquecido vira erro de tipo novo, e `npm run typecheck` falha em erro novo por construção. Um teste de runtime que tentasse afirmar a mesma coisa estaria inspecionando a aridade da função, que não prova nada.

- [ ] **Step 5: Commit**

A árvore de trabalho tem muita coisa não commitada e não relacionada a este plano. Adicionar os
arquivos **um a um**, nunca um diretório:

```bash
git add "app/(private)/vendor/page.tsx" "app/(private)/vehicles/page.tsx" \
  "app/(private)/contract-management/page.tsx" "app/(private)/requests-inbox/page.tsx" \
  "app/(private)/vendor-performance/page.tsx" "app/(private)/week-planner-operations/page.tsx" \
  "app/(private)/daily-financial-insights/page.tsx" "app/(private)/week-planner/WeekPlannerPageContent.tsx" \
  "app/(private)/financial-invoices/page.tsx" "app/(private)/adhoc-works-invoice-management/page.tsx" \
  "app/(private)/service-partner-invoices/page.tsx" "app/(private)/assets/page.tsx" \
  "app/(private)/deductions-disbursements-recharges/page.tsx" \
  "app/(private)/week-planner-operations/DailyOperationsManagementPage.tsx" \
  "app/(private)/requests/page.tsx" "app/(private)/daily-operations-reports/page.tsx" \
  "app/(private)/home/page.legacy.tsx" "app/(private)/components/DgpPageFrame.tsx"
git status   # conferir que só os 18 acima estão staged
git commit -m "refactor: classify every DgpPageFrame page on the shared width scale"
```

---

### Task 3: `StandardPageLayout` e as 7 pages do portal do motorista

O `StandardPageLayout` usa `max-w-full` — as sete telas que ele serve foram desenhadas para telemóvel e hoje esticam até a largura inteira do monitor. Ganha o mesmo prop, com default `narrow`.

**Files:**
- Modify: `app/(private)/components/StandardPageLayout.tsx`
- Modify: `app/(private)/requests-admin/page.tsx`
- Test: `app/(private)/components/StandardPageLayout.test.tsx` (criar)

**Interfaces:**
- Consumes: as classes `max-w-content-*` da Task 1.
- Produces: prop `width?: DgpPageFrameWidth` no `StandardPageLayout`, default `"narrow"`. Reusa o tipo da Task 1 — importado de `./DgpPageFrame` — em vez de declarar um union paralelo que possa divergir.

- [ ] **Step 1: Escrever o teste que falha**

Criar `app/(private)/components/StandardPageLayout.test.tsx`:

```tsx
// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('@/components/navbar-wrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/gradient-dots-background', () => ({
  GradientDotsBackground: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/ui/welcome-header', () => ({ WelcomeHeader: () => null }));

import { StandardPageLayout } from './StandardPageLayout';

afterEach(() => cleanup());

const main = () => document.querySelector('main');

describe('StandardPageLayout width', () => {
  it('defaults to narrow — these are phone-first driver screens', () => {
    render(<StandardPageLayout><p>content</p></StandardPageLayout>);
    expect(main()).toHaveClass('max-w-content-narrow');
  });

  it('accepts a wider token for the admin screens that share the shell', () => {
    render(<StandardPageLayout width="wide"><p>content</p></StandardPageLayout>);
    expect(main()).toHaveClass('max-w-content-wide');
    expect(main()).not.toHaveClass('max-w-content-narrow');
  });

  it('still centers the column', () => {
    render(<StandardPageLayout><p>content</p></StandardPageLayout>);
    expect(main()).toHaveClass('mx-auto');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run "app/(private)/components/StandardPageLayout.test.tsx"`
Expected: FAIL — o `<main>` tem `max-w-full`.

- [ ] **Step 3: Implementar**

Em `app/(private)/components/StandardPageLayout.tsx`:

```tsx
import { DgpPageFrameWidth } from "./DgpPageFrame";

const widthClass: Record<DgpPageFrameWidth, string> = {
  narrow: 'max-w-content-narrow',
  standard: 'max-w-content-standard',
  wide: 'max-w-content-wide',
  full: 'max-w-none',
};
```

Adicionar `width?: DgpPageFrameWidth;` ao `StandardPageLayoutProps`, `width = "narrow"` à desestruturação, e no `className` do `motion.main` trocar `max-w-full` por `${widthClass[width]}`:

```tsx
          className={`mx-auto w-full ${widthClass[width]} min-w-0 px-[clamp(0.75rem,4vw,1rem)] sm:px-6 lg:px-10 pt-4 sm:pt-8 lg:pt-9 pb-12 lg:pb-14 relative z-[1]`}
```

- [ ] **Step 4: Dar a largura certa ao requests-admin**

Das sete pages que usam este shell, seis são do portal do motorista e ficam com o default `narrow`. `requests-admin` é a exceção: é uma tela administrativa de tabela, classificada como `wide` na spec. Em `app/(private)/requests-admin/page.tsx`, no `<StandardPageLayout`, acrescentar `width="wide"`.

As seis que ficam no default, e que portanto **não** devem ser editadas: `current-month`, `current-performance`, `daily-performance-insight`, `deductions`, `mobile-invoice`, `subcontractor`.

- [ ] **Step 5: Rodar os testes**

Run: `npx vitest run "app/(private)/components/StandardPageLayout.test.tsx" && npm test && npm run typecheck`
Expected: tudo verde.

- [ ] **Step 6: Commit**

```bash
git add "app/(private)/components/StandardPageLayout.tsx" "app/(private)/components/StandardPageLayout.test.tsx" "app/(private)/requests-admin/page.tsx"
git commit -m "feat: cap the driver-portal shell at a readable column width"
```

---

### Task 4: Gutters que crescem com o viewport

A escada de padding do `DgpPageFrame` — `px-4 md:px-6 lg:px-8 xl:px-12` — para de crescer em 1280px, que é justamente onde este trabalho começa. Acima disso o gutter fica congelado em 3rem enquanto o viewport dobra.

**Files:**
- Modify: `app/(private)/components/DgpPageFrame.tsx` (o default de `containerClassName`)
- Test: `app/(private)/components/DgpPageFrame.test.tsx` (acrescentar)

**Interfaces:**
- Consumes: o componente da Task 2.
- Produces: nada novo. Só muda o valor default de `containerClassName`.

- [ ] **Step 1: Escrever o teste que falha**

Acrescentar em `app/(private)/components/DgpPageFrame.test.tsx`, dentro do `describe`:

```tsx
  it('scales the gutter continuously above md instead of freezing it at xl', () => {
    render(<DgpPageFrame><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('md:px-[clamp(1.5rem,3vw,3rem)]');
    expect(container()).not.toHaveClass('xl:px-12');
  });

  it('leaves the sub-md gutter exactly as it was', () => {
    // Global constraint: nada abaixo de `md` muda de renderização.
    render(<DgpPageFrame><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('px-4');
  });

  it('lets a page opt out of the default container entirely', () => {
    render(<DgpPageFrame containerClassName="w-full px-0"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('px-0');
    expect(container()).not.toHaveClass('px-[clamp(1rem,3vw,3rem)]');
  });
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run "app/(private)/components/DgpPageFrame.test.tsx"`
Expected: FAIL no primeiro dos dois — o container ainda tem `px-4 md:px-6 lg:px-8 xl:px-12`.

- [ ] **Step 3: Implementar**

Em `app/(private)/components/DgpPageFrame.tsx`, trocar o default:

```tsx
  containerClassName = "mx-auto px-4 md:px-[clamp(1.5rem,3vw,3rem)] py-4 md:py-[clamp(1.25rem,2vw,1.75rem)] space-y-4 md:space-y-6",
```

O `clamp` fica **atrás do prefixo `md:`**, e isso não é detalhe de estilo: um `clamp(1rem,3vw,3rem)` sem prefixo mudaria o gutter na faixa de 640–767px (3vw ali dá 19–23px, contra os 16px fixos de hoje), violando a Global Constraint de que nada abaixo de `md` muda. Com o prefixo, abaixo de 768px o `px-4` de hoje continua valendo byte a byte.

Acima de `md` o piso de 1.5rem reproduz exatamente o `md:px-6` atual em 768px, cresce contínuo daí em diante, e para em 3rem — o mesmo teto que o `xl:px-12` já dava, agora alcançado sem degrau e sem congelar em 1280px.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run "app/(private)/components/DgpPageFrame.test.tsx"`
Expected: PASS, todos os testes do arquivo.

- [ ] **Step 5: Rodar tudo**

Run: `npm test && npm run typecheck`
Expected: verde.

- [ ] **Step 6: Commit**

```bash
git add "app/(private)/components/DgpPageFrame.tsx" "app/(private)/components/DgpPageFrame.test.tsx"
git commit -m "style: scale page gutters continuously up to wide viewports"
```

---

### Task 5: Remover o sistema de largura concorrente do daily-game-plan

`app/(private)/daily-game-plan/styles.css` carrega um segundo sistema de largura, com `!important`, que impõe 90rem/100rem a partir de 1536px e 95rem/110rem a partir de 1920px — exatamente a faixa deste trabalho — via `[data-slot="sidebar-inset"] .liquid-glass-page-bg > div[class*="max-w-"]`. O seletor de atributo `[class*="max-w-"]` casaria com `max-w-content-wide`.

Ele é código morto hoje, por dois motivos independentes, e os dois foram verificados:

- `data-slot="sidebar-inset"` só é emitido por `components/ui/sidebar.tsx:366`, e **nenhum arquivo em `app/` usa `SidebarInset`** — o shell privado é o `NavbarWrapper`, que emite `.app-shell` / `.app-sidebar` / `.app-main`.
- Todos os três lugares que renderizam `.liquid-glass-page-bg` o fazem como camada de fundo `fixed inset-0 ... -z-10` **sem filhos**, então nem `> div[...]` nem `*` têm o que casar.

Não casa com nada agora, mas passa a casar no dia em que alguém adotar o `Sidebar` do shadcn — e aí derruba os tokens em silêncio, só nas telas largas. Some agora.

**Files:**
- Modify: `app/(private)/daily-game-plan/styles.css` (bloco em ~149–206)

**Interfaces:**
- Consumes: nada.
- Produces: nada. É remoção pura, mais o cap do próprio daily-game-plan.

- [ ] **Step 1: Provar que o bloco está morto antes de apagar**

Run:
```bash
grep -rn 'SidebarInset' --include="*.tsx" app | grep -v '\.worktrees'
grep -rn 'liquid-glass-page-bg' --include="*.tsx" app components | grep -v '\.worktrees'
```
Expected: o primeiro comando não retorna nada. O segundo retorna só ocorrências onde a classe está num elemento `fixed inset-0 ... -z-10` sem filhos (`DailyGamePlanContent.tsx:138`, `PrivateContentWithPending.tsx:29` e `:38`) ou numa string de configuração (`DgpPageFrame.tsx:30-31`, `:50`).

Se qualquer um dos dois devolver algo diferente disso, **pare**: o bloco deixou de ser morto e apagá-lo passa a ser uma mudança visual, não uma limpeza. Nesse caso, reporte em vez de seguir.

- [ ] **Step 2: Apagar o bloco**

Em `app/(private)/daily-game-plan/styles.css`, apagar o comentário `AJUSTES PARA RESPONDER AO ESTADO DA SIDEBAR` e todo o `@media (min-width: 768px) { ... }` que vem logo depois — da linha do comentário até o `}` que fecha essa media query (inclui os dois `@media` aninhados de 1536px e 1920px). São cerca de 58 linhas.

O resto do arquivo fica intacto.

- [ ] **Step 3: Dar ao daily-game-plan o seu próprio cap**

Ainda em `app/(private)/daily-game-plan/styles.css`, na regra `.app-imported-page .daily-game-plan-page` (começa na linha 9), a declaração `width: 100%;` passa a ser acompanhada de:

```css
  max-width: var(--content-wide);
  margin-inline: auto;
```

Não mexer no `padding: 0` — o cancelamento de gutter ali é deliberado, e está comentado como tal no arquivo.

- [ ] **Step 4: Confirmar que a suite continua verde**

Run: `npm test && npm run typecheck`
Expected: verde. Nenhum teste cobre este CSS; o que esta etapa verifica é que a edição não quebrou nada mais.

- [ ] **Step 5: Commit**

```bash
git add "app/(private)/daily-game-plan/styles.css"
git commit -m "refactor: drop dead sidebar-inset width overrides from daily game plan"
```

---

### Task 6: As pages sem shell

Cinco pages não usam `DgpPageFrame` nem `StandardPageLayout` — cada uma tem o seu próprio container, e o mecanismo é diferente em cada. O daily-game-plan já foi resolvido na Task 5; ficam quatro.

**Files:**
- Modify: `app/(private)/home/home-new.css:1`
- Modify: `app/(private)/daily-financials/page.tsx:430`
- Modify: `app/(private)/invoice-processing-workflow/page.tsx:527`
- Modify: `app/(private)/schedule/schedule.css:30` e `:35`

**Interfaces:**
- Consumes: as CSS custom properties da Task 1 (`var(--content-standard)`, `var(--content-wide)`) e as classes Tailwind equivalentes.
- Produces: nada que outra task consuma.

- [ ] **Step 1: home**

`app/(private)/home/home-new.css:1`, seletor `.home-new`, hoje `max-width: 1480px; margin: 0 auto; padding: 26px 28px 56px;`.

Trocar só o valor: `max-width: var(--content-wide);`.

O arquivo é importado unicamente por `app/(private)/home/page.tsx:10`, então a mudança não vaza. Note que isto **alarga** a home de 1480px para 1600px; a spec classificava a home como `standard`, mas `standard` (1280px) a estreitaria em 200px, o que seria perda de espaço num dashboard de widgets, não ganho. A spec foi corrigida para `wide`.

- [ ] **Step 2: daily-financials**

`app/(private)/daily-financials/page.tsx:430`, hoje `<div className="pt-16">`, que é o container mais externo, direto dentro do `<NavbarWrapper>`.

Passa a:

```tsx
      <div className="pt-16 w-full max-w-content-wide mx-auto">
```

- [ ] **Step 3: invoice-processing-workflow**

`app/(private)/invoice-processing-workflow/page.tsx:527`, hoje `<div className="pt-16 invoice-workflow-container">`.

Aqui o cap **não** vai neste div: a regra `.invoice-workflow-container` em `InvoiceProcessingWorkflow.css:45` pinta um gradiente de fundo com `min-height: 100vh`, e capar o elemento faria o fundo parar em 1600px em vez de cobrir o viewport.

Em vez disso, envolver os filhos num wrapper novo. Localizar o `</div>` que fecha o div da linha 527 (é o último antes do fim do JSX retornado) e inserir um nível:

```tsx
      <div className="pt-16 invoice-workflow-container">
        <div className="w-full max-w-content-wide mx-auto">
          {/* ...todo o conteúdo que já existia aqui, indentado um nível... */}
        </div>
      </div>
```

O fundo continua full-bleed; o conteúdo centraliza.

- [ ] **Step 4: schedule**

`app/(private)/schedule/schedule.css:30`, hoje:

```css
:where(.app-imported-page[data-page="schedule"]) .wrapper {
  display: flex;
  min-height: 100vh;
}
```

Duas mudanças na mesma regra — tirar o `:where()` e acrescentar o cap:

```css
.app-imported-page[data-page="schedule"] .wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
  max-width: var(--content-wide);
  margin-inline: auto;
}
```

O `:where()` precisa sair, e essa é a parte que faz a diferença: ele zera a especificidade da regra, e existe um `.wrapper` **global e sem escopo** em `app/(private)/week-planner-operations/week-planner.css:68` que define `max-width: 1280px; margin: 0 auto; padding: 1.5rem`. Com `:where()`, esse global vence, e o cap novo não teria efeito nenhum depois que o utilizador visitasse aquela página. Sem `:where()`, a regra fica com especificidade 0,3,0 e ganha.

Aplicar a mesma remoção de `:where()` na regra de `#main-content` em `schedule.css:35`, pelo mesmo motivo, sem outras mudanças nela.

Não editar `week-planner.css`: o `.wrapper` global sem escopo é um vazamento real e merece limpeza, mas mexer nele daqui arrisca a maior tela do sistema em troca de nada — a especificidade resolve o problema do schedule localmente. Fica registado como follow-up.

- [ ] **Step 5: Rodar tudo**

Run: `npm test && npm run typecheck`
Expected: verde.

- [ ] **Step 6: Commit**

```bash
git add "app/(private)/home/home-new.css" "app/(private)/daily-financials/page.tsx" "app/(private)/invoice-processing-workflow/page.tsx" "app/(private)/schedule/schedule.css"
git commit -m "feat: put the shell-less pages on the shared width scale"
```

---

### Task 7: Verificação visual

O trabalho inteiro só é observável acima de 1280px, então é lá que ele tem de ser olhado. Nenhum teste automatizado substitui isto: os testes provam que a classe certa foi aplicada, não que a página ficou boa.

**Files:** nenhum. Esta task não edita código.

**Interfaces:**
- Consumes: tudo das Tasks 1 a 6.
- Produces: o veredito de que o trabalho está pronto, ou a lista do que falta.

- [ ] **Step 1: Subir o dev server**

Run: `npm run dev`
Expected: sobe em `http://localhost:3000`. Deixar rodando em background.

- [ ] **Step 2: Conferir uma representante de cada token, em três viewports**

Com as ferramentas de browser, abrir cada uma destas em **1440**, **1920** e **2560** de largura:

| Rota | Token esperado | O que tem de ser verdade |
|---|---|---|
| `/vendor` | `wide` (1600px) | A tabela centraliza, para em 1600px, e as margens dos dois lados são iguais |
| `/home` | `wide` (1600px) | Os widgets ocupam até 1600px, sem esticar além |
| `/current-performance` | `narrow` (768px) | Coluna estreita e centrada, não esticada até a borda |
| `/daily-game-plan` | `wide` (1600px) | Confirma que a Task 5 não deixou resíduo do sistema antigo |

Em todas as quatro, confirmar também que o gutter cresce com o viewport e para em 3rem, e que as margens esquerda e direita são simétricas — assimetria aqui significa que o `mx-auto` foi perdido, que é o modo mais provável de isto dar errado, já que o conteúdo divide a linha com uma sidebar fixa de 58px.

- [ ] **Step 3: Confirmar que nada abaixo de `md` mudou**

Abrir `/current-performance` e `/vendor` a **390** de largura.
Expected: idênticas ao que eram antes. Nenhum token é menor que 768px, então nenhum deles pode passar a valer aqui — se algo mudou, um cap foi aplicado no lugar errado.

- [ ] **Step 4: Rodar a suite uma última vez**

Run: `npm test && npm run typecheck && npm run lint`
Expected: os três verdes.

- [ ] **Step 5: Commit final, se houver ajuste**

Se o Step 2 ou 3 revelou algo a corrigir, corrigir e commitar. Se não houve ajuste, não criar commit vazio.

---

## Follow-ups registados, fora do escopo deste plano

- `app/(private)/week-planner-operations/week-planner.css:68` define um `.wrapper` global e sem escopo (`max-width: 1280px; margin: 0 auto; padding: 1.5rem`) que vaza para qualquer página visitada depois dela. A Task 6 contorna isso por especificidade no schedule; a limpeza de verdade é escopar a regra à própria página.
- `app/(private)/home/page.legacy.tsx` não é uma rota do Next e é código morto. A Task 2 o migra numa linha só para manter o type-check verde; a decisão de apagar o arquivo é de outro trabalho.
- As nove telas fora de escopo — cinco protótipos, duas duplicatas, dois placeholders — continuam sem token. Elas pedem uma decisão de produto (completar ou remover) antes de pedir layout.
