# Industrial Terminal Design System + Daily Ops Pilot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the `logixsphere-page-kit` tokenized design system into this repository as the central style base, then rebuild the 6 real screens of the LogixSphere "Daily Ops" module as mock-data-only pages, and formalize the pattern as a reusable Claude Code skill.

**Architecture:** A new `styles/tokens.css` (~114 CSS custom properties) becomes the single source of visual truth, consumed by a new `components/ui/` library (20+ presentational components) and enforced by a `check:tokens` lint gate scoped to the new system's own paths (legacy `week-planner`/`route-balance` are explicitly out of scope and untouched). Each of the 6 pages follows the kit's `_template` shape (`page.tsx` → `Content.tsx` → hook → `lib/mock-client.ts` → `mocks/*-fixtures.ts`, with a `utils/*Mappers.ts` in between), wrapped in this repo's existing `NavbarWrapper` shell instead of the kit's own `StandardPageLayout`.

**Tech Stack:** Next.js 14 (App Router) + TypeScript, existing repo conventions (no Tailwind, no Radix — plain CSS Modules + CSS custom properties), Vitest + Testing Library for unit tests, no new runtime dependencies (fonts are already available locally under `public/route-balance/assets/`).

**Spec:** `docs/superpowers/specs/2026-09-23-daily-ops-design-system-migration-design.md`

## Global Constraints

- No backend, no database, no real authentication — every page reads from `lib/mock-client.ts` fixtures only (spec §1, §7).
- Nothing under `app/(private)/week-planner/` or `app/(private)/route-balance/` is modified (spec §2, divergence 2).
- New code must contain **zero literal colors, font sizes, border-radius, box-shadow, or spacing values** — everything comes from `var(--token)` in `styles/tokens.css`. Enforced by `npm run check:tokens` (spec §5).
- Mock fixtures are written in backend `snake_case` field names (converted to camelCase by `lib/mock-client.ts`'s `camelizeKeys`), matching the real DTO shapes read from `logix-sphere-frontend-nextjs-main` (spec §7).
- Every page implements the 4 required states: loading, empty, error, critical (spec §7). Critical state is always color **+** label **+** icon, never color alone.
- Backend-only business logic (bulk validation, PDF export, cost-model rate resolution) is never reimplemented — it is visually represented and ends in a "not available in this prototype" affordance (spec §3, §9).
- The 6 real pages are: `current-performance`, `current-month`, `daily-performance-insight`, `daily-operations-reports`, `daily-financial-insights`, `daily-game-plan`. The 3 orphaned legacy routes (`daily`, `daily-financials`, `performance`) and the `daily-operations-management` alias are **not** built (spec §2).
- Build order: `current-performance` → `current-month` → `daily-performance-insight` → `daily-operations-reports` → `daily-financial-insights` → `daily-game-plan` (spec §8).

---

### Task 1: Design-system foundation port

**Files:**
- Create: `styles/tokens.css`
- Create: `styles/fonts.css`
- Create: `components/ui/icons.tsx`
- Create: `components/ui/status.ts`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/ExpandButton.tsx`
- Create: `components/ui/SearchField.tsx`
- Create: `components/ui/Skeleton.tsx`
- Create: `components/ui/KpiCard.tsx`
- Create: `components/ui/StatTile.tsx`
- Create: `components/ui/StatusPill.tsx`
- Create: `components/ui/InfoChip.tsx`
- Create: `components/ui/ProgressBar.tsx`
- Create: `components/ui/SectionBox.tsx`
- Create: `components/ui/CollapsibleSection.tsx`
- Create: `components/ui/DataTable.tsx`
- Create: `components/ui/OptionSwitcher.tsx`
- Create: `components/ui/States.tsx`
- Create: `components/ui/Toast.tsx`
- Create: `components/ui/EntityCard.tsx`
- Create: `components/ui/PageHeader.tsx`
- Create: `components/ui/PageContent.tsx`
- Create: `components/ui/ui.module.css`
- Create: `components/ui/index.ts`
- Create: `lib/case.ts`
- Create: `lib/mock-client.ts`
- Create: `lib/useMockQuery.ts`
- Create: `scripts/check-tokens.mjs`
- Create: `components/ui/__tests__/smoke.test.tsx`
- Create: `lib/__tests__/case.test.ts`
- Modify: `package.json` (add `check:tokens` script)
- Modify: `app/globals.css` (import tokens + fonts)

**Interfaces:**
- Produces: `components/ui` barrel exporting `Button`, `ButtonVariant`, `ExpandButton`, `SearchField`, `Skeleton`, `KpiCard`, `KpiRow`, `Kpi`, `StatTile`, `StatusPill`, `InfoChip`, `ProgressBar`, `SectionBox`, `CollapsibleSection`, `DataTable`, `Column`, `OptionSwitcher`, `LoadingState`, `EmptyState`, `ErrorState`, `MissingData`, `Toast`, `EntityCard`, `PageHeader`, `PageContent`, `PageSection`, `PageFooter`, `TONE_VAR`, `targetTone`, `targetLabel`, `TARGET_MIN`, `TARGET_MAX`, `StatusTone`. `lib/mock-client` exporting `api.get<T>(path, source)` / `api.post<T>(path, body)`, `MockScenario`, `MockApiError`, `currentScenario()`. `lib/useMockQuery` exporting `useMockQuery<T>(queryKey, queryFn)` returning `QueryResult<T>` (`{ data, isLoading, isError, error, refetch }`). `lib/case` exporting `camelizeKeys<T>(input)`.
- Consumes: nothing from prior tasks (this is the foundation).

- [ ] **Step 1: Create `styles/tokens.css`**

```css
/* =============================================================================
   LogixSphere — Industrial Terminal
   Fonte da verdade da camada visual. Versão 1.1 · 22/09/2026.

   Origem: quadros de Handoff do Figma "Route Balance" (agosto/2026) —
   Color Tokens, Token Documentation — Typography, Espaçamento & Layout,
   Component Layout Specs, Especificações de Componentes, Style Guide.
   Fonte secundária: export "componentes front v2" (Week Planner).

   REGRA: nenhum componente declara cor, fonte, tamanho, raio, espaçamento
   ou sombra literal. Tudo vem de var(--token). Valor solto em .tsx é erro
   de revisão, não preferência de estilo.

   O que está marcado como PENDENTE não foi documentado no Handoff. Não
   invente um valor: pergunte a quem decide.
   ============================================================================= */

:root {
  /* ---------------------------------------------------------------------------
     1. COR — 47 tokens em nomenclatura Material Design 3.
     Escolha por PAPEL, nunca pela cor que o token tem hoje.
     --------------------------------------------------------------------------- */

  /* 1.1 Pilha de superfícies — do mais claro ao mais denso.
     A hierarquia da tela vem DESTA PILHA, não de sombra. */
  --container-lowest:   #FFFFFF;  /* modal, tabela, botão claro                */
  --surface:            #FAFAEF;  /* fundo da página, dos cards e da navbar    */
  --background:         #FAFAEF;  /* alias de --surface                        */
  --container-low:      #F4F4E9;  /* área interna de card, card KPI            */
  --container:          #EEEFE4;  /* superfície intermediária                  */
  --container-high:     #E9E9DE;  /* sidebar, cabeçalho de tabela              */
  --container-highest:  #E3E3D8;  /* trilho de progresso, KPI de destaque      */
  --surface-dim:        #DADBD0;  /* superfície rebaixada                      */
  --surface-search:     #EEEEE4;  /* campo de busca                            */
  --inverse-surface:    #2F312A;  /* superfície invertida, toast               */

  /* 1.2 Marca e ação */
  --primary:               #446900;  /* CTA, ícone ativo, barra preenchida     */
  --primary-container:     #A3E635;  /* botão expandir, destaque, hover        */
  --primary-fixed:         #B2F746;  /* item ativo da navegação                */
  --on-primary:            #FFFFFF;  /* texto sobre CTA                        */
  --on-primary-container:  #416400;  /* texto e ícone sobre fundo claro        */

  /* 1.3 Informação (secundária) */
  --secondary:               #27676C;  /* informação, papel/função             */
  --secondary-container:     #AFEDF3;  /* fundo do chip de informação          */
  --on-secondary:            #FFFFFF;
  --on-secondary-container:  #27676C;  /* texto sobre --secondary-container    */

  /* 1.4 Destaque âmbar (terciária) */
  --tertiary:            #934B00;
  --tertiary-container:  #FFC7A0;

  /* 1.5 Texto */
  --on-surface:          #1A1C16;  /* título, valor numérico, label forte      */
  --on-surface-variant:  #424936;  /* subtítulo, descrição, métrica            */
  --text-tertiary:       #6B7280;  /* placeholder, texto auxiliar              */
  --text-quaternary:     #707979;  /* rodapé, informação complementar          */

  /* 1.6 Traço */
  --outline:          #727A64;  /* borda de destaque, tabela interna           */
  --outline-variant:  #C2CAB0;  /* separador sutil, borda de container interno */
  --stroke-card:      #1A1C16;  /* borda externa do card — escura de propósito */
  --stroke-sidebar:   #BFC8C9;  /* sidebar e navbar                            */
  --stroke-divider:   #D1D1C7;  /* divisor interno de card                     */
  --stroke-neutral:   #D6D3D1;  /* contorno de botão neutro                    */

  /* 1.7 Estado — nunca comunicado só por cor. Sempre cor + rótulo + ícone. */
  --state-good:      #446900;  /* = --primary · dentro da meta                 */
  --state-warning:   #FF7700;  /* atenção, exige conferência                   */
  --state-critical:  #BA1A1A;  /* = --error · fora da faixa, erro, bloqueio    */
  --state-info:      #3D9198;  /* informação                                   */
  --state-alert:     #E0592B;  /* exceção operacional (ex.: NO VEHICLE)        */
  --state-success:   #17A673;  /* revisado, conferido                          */
  --state-selected:  #E4F063;  /* seleção ativa                                */
  --error:           #BA1A1A;
  --error-container: #FFDAD6;
  --accent-yellow:   #FFCC00;  /* atenção, pendência                           */

  /* Fundos de pill: 12% de alpha da cor cheia. */
  --state-good-bg:      rgba(68, 105, 0, 0.12);
  --state-warning-bg:   rgba(255, 119, 0, 0.12);
  --state-critical-bg:  rgba(186, 26, 26, 0.12);
  --state-info-bg:      rgba(61, 145, 152, 0.12);
  --state-success-bg:   rgba(23, 166, 115, 0.12);
  --state-alert-bg:     rgba(224, 89, 43, 0.12);

  /* 1.8 Ícone */
  --icon-active:    #416400;
  --icon-inactive:  #3F4849;

  /* 1.9 Família operacional (--ops-*) — a escala da grade do Week Planner. */
  --ops-900: #416400;
  --ops-050: #FFFD9F;

  /* ---------------------------------------------------------------------------
     2. TIPOGRAFIA — três famílias, com divisão de trabalho explícita.
     --------------------------------------------------------------------------- */
  --font-display: "Space Grotesk", system-ui, sans-serif;  /* títulos e nomes   */
  --font-mono:    "IBM Plex Mono", ui-monospace, monospace;/* labels e dados    */
  --font-ui:      "Inter", system-ui, sans-serif;          /* UI auxiliar       */

  /* 2.1 Papéis nomeados — resolvem família, peso, tamanho e linha de uma vez. */
  --type-logo:            700 32px/38.4px var(--font-display);
  --type-driver-name:     500 20px/24px   var(--font-display);
  --type-vehicle-plate:   500 16px/24px   var(--font-display);
  --type-section-label:   700 11px/16px   var(--font-display);
  --type-metric-label:    600 12px/12px   var(--font-mono);
  --type-timestamp:       400 11px/16.5px var(--font-mono);
  --type-metric-value:    400 12px/24px   var(--font-mono);
  --type-badge:           600 10px/12px   var(--font-mono);
  --type-page-subtitle:   400 14px/21px   var(--font-mono);
  --type-nav-active:      700 12px/12px   var(--font-mono);
  --type-button-primary:  700 10px/24px   var(--font-mono);
  --type-button-import:   600 16px/24px   var(--font-mono);
  --type-ui-aux:          500 14px/20px   var(--font-ui);

  /* 2.2 Escala de sistema — título de página e blocos de dados fora dos papéis. */
  --type-display-lg:   700 36px/44px var(--font-display);
  --type-headline-lg:  500 28px/34px var(--font-display);
  --type-headline-sm:  500 20px/24px var(--font-display);
  --type-data-lg:      700 18px/24px var(--font-mono);
  --type-data-md:      600 12px/16px var(--font-mono);
  --type-table-header: 700 11px/14px var(--font-mono);

  /* 2.3 Tracking */
  --ls-logo:   -1.6px;
  --ls-label:   0.6px;
  --ls-data:    0.275px;
  --ls-caps:    0.6px;

  /* 2.4 Piso tipográfico. */
  --fs-floor: 10px;

  /* ---------------------------------------------------------------------------
     3. ESPAÇAMENTO — oito degraus nomeados. Não use valor fora da escala.
     --------------------------------------------------------------------------- */
  --space-xs:    4px;
  --space-s:     6px;
  --space-sm:    8px;
  --space-md-s: 10px;
  --space-md:   12px;
  --space-lg:   16px;
  --space-xl:   24px;
  --space-2xl:  32px;

  /* ---------------------------------------------------------------------------
     4. RAIO — reto por padrão, arredondado por exceção.
     --------------------------------------------------------------------------- */
  --radius-micro:      2px;
  --radius-indicator:  3px;
  --radius-sm:         4px;
  --radius-track:     12px;
  --radius-pill:      52px;

  /* ---------------------------------------------------------------------------
     5. TRAÇO — 1px em toda a interface, sem exceção.
     --------------------------------------------------------------------------- */
  --stroke:        1px;
  --stroke-strong: 2px;

  /* ---------------------------------------------------------------------------
     6. ELEVAÇÃO — um único nível.
     --------------------------------------------------------------------------- */
  --elevation-none: none;
  --elevation-card: 0 1px 2px rgba(0, 0, 0, 0.05);
  --elevation-float: 0 4px 12px rgba(0, 0, 0, 0.12);

  /* ---------------------------------------------------------------------------
     7. ÍCONE
     --------------------------------------------------------------------------- */
  --icon-micro:  12px;
  --icon-inline: 16px;
  --icon-nav:    20px;

  /* ---------------------------------------------------------------------------
     8. LAYOUT — medidas da casca, do quadro Component Layout Specs.
     --------------------------------------------------------------------------- */
  --layout-sidebar-width:   175px;
  --layout-navbar-height:    56px;
  --layout-content-padding:  24px;
  --layout-content-gap:      32px;
  --layout-card-width:      253px;
  --layout-card-grid-gap:    10px;
  --layout-kpi-width:       252px;
  --layout-kpi-height:      132px;
  --layout-kpi-gap:          16px;
  --layout-footer-height:    32px;
  --layout-search-width:    256px;
  --layout-search-height:    27px;

  /* ---------------------------------------------------------------------------
     9. REGRA DE NEGÓCIO VISUAL — a faixa de capacidade.
     A meta é 95% a 105% das paradas. Abaixo de 95% é alert; acima de 105% é
     critical, com badge ALERT; dentro é good.
     --------------------------------------------------------------------------- */
  --target-min: 95;
  --target-max: 105;
}

*,
*::before,
*::after { box-sizing: border-box; }

.num {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

:focus-visible {
  outline: var(--stroke-strong) solid var(--primary);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Create `styles/fonts.css`**

Reuses the font files this repo already has under `public/route-balance/assets/` (Inter, IBM Plex Mono, Space Grotesk, weights 400/500/600/700 — installed for the existing Route Balance page). No new font files or npm packages are needed; this file just re-declares the same `@font-face` rules so the new system doesn't depend on the `route-balance` route's own stylesheet.

```css
/* Fontes do Design System — reaproveita os arquivos já instalados em
   public/route-balance/assets/ (mesmos arquivos que route-balance/fonts.css
   usa). Não duplica os binários: aponta para o mesmo caminho público. */

@font-face{font-family:Inter;font-style:normal;font-display:swap;font-weight:700;src:url(/route-balance/assets/inter-latin-700-normal-Yt3aPRUw.woff2) format("woff2"),url(/route-balance/assets/inter-latin-700-normal-BLAVimhd.woff) format("woff");}
@font-face{font-family:Inter;font-style:normal;font-display:swap;font-weight:600;src:url(/route-balance/assets/inter-latin-600-normal-LgqL8muc.woff2) format("woff2"),url(/route-balance/assets/inter-latin-600-normal-CiBQ2DWP.woff) format("woff");}
@font-face{font-family:Inter;font-style:normal;font-display:swap;font-weight:500;src:url(/route-balance/assets/inter-latin-500-normal-Cerq10X2.woff2) format("woff2"),url(/route-balance/assets/inter-latin-500-normal-BL9OpVg8.woff) format("woff");}
@font-face{font-family:Inter;font-style:normal;font-display:swap;font-weight:400;src:url(/route-balance/assets/inter-latin-400-normal-C38fXH4l.woff2) format("woff2"),url(/route-balance/assets/inter-latin-400-normal-CyCys3Eg.woff) format("woff");}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-display:swap;font-weight:400;src:url(/route-balance/assets/ibm-plex-mono-latin-400-normal-DMJ8VG8y.woff2) format("woff2"),url(/route-balance/assets/ibm-plex-mono-latin-400-normal-CvHOgSBP.woff) format("woff");}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-display:swap;font-weight:500;src:url(/route-balance/assets/ibm-plex-mono-latin-500-normal-DSY6xOcd.woff2) format("woff2"),url(/route-balance/assets/ibm-plex-mono-latin-500-normal-CB9ihrfo.woff) format("woff");}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-display:swap;font-weight:600;src:url(/route-balance/assets/ibm-plex-mono-latin-600-normal-BgSNZQsw.woff2) format("woff2"),url(/route-balance/assets/ibm-plex-mono-latin-600-normal-DWFSQ4vo.woff) format("woff");}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-display:swap;font-weight:700;src:url(/route-balance/assets/ibm-plex-mono-latin-700-normal-7sUh57Bg.woff2) format("woff2"),url(/route-balance/assets/ibm-plex-mono-latin-700-normal-CNHXzs6v.woff) format("woff");}
@font-face{font-family:"Space Grotesk";font-style:normal;font-display:swap;font-weight:400;src:url(/route-balance/assets/space-grotesk-latin-400-normal-CJ-V5oYT.woff2) format("woff2"),url(/route-balance/assets/space-grotesk-latin-400-normal-BnQMeOim.woff) format("woff");}
@font-face{font-family:"Space Grotesk";font-style:normal;font-display:swap;font-weight:500;src:url(/route-balance/assets/space-grotesk-latin-500-normal-lFbtlQH6.woff2) format("woff2"),url(/route-balance/assets/space-grotesk-latin-500-normal-CNSSEhBt.woff) format("woff");}
@font-face{font-family:"Space Grotesk";font-style:normal;font-display:swap;font-weight:600;src:url(/route-balance/assets/space-grotesk-latin-600-normal-DjKNqYRj.woff2) format("woff2"),url(/route-balance/assets/space-grotesk-latin-600-normal-BflQw4A9.woff) format("woff");}
@font-face{font-family:"Space Grotesk";font-style:normal;font-display:swap;font-weight:700;src:url(/route-balance/assets/space-grotesk-latin-700-normal-RjhwGPKo.woff2) format("woff2"),url(/route-balance/assets/space-grotesk-latin-700-normal-CwsQ-cCU.woff) format("woff");}
```

- [ ] **Step 3: Verify the two font asset files actually exist at that path**

Run: `ls "public/route-balance/assets/" | grep -E "inter-latin-700-normal-Yt3aPRUw|space-grotesk-latin-700-normal-RjhwGPKo"`
Expected: both filenames print (confirms the shared path is correct before any page depends on it).

- [ ] **Step 4: Create `components/ui/icons.tsx`**

```tsx
/**
 * Ícones do sistema. Preenchimento sólido, nunca contorno — regra do Handoff.
 * Tamanho vem do CSS (--icon-micro / --icon-inline / --icon-nav), não de prop.
 */
type IconProps = { className?: string; "aria-hidden"?: boolean };

export const PlusIcon = (p: IconProps) => (
  <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden {...p}>
    <path d="M5 0h2v5h5v2H7v5H5V7H0V5h5z" />
  </svg>
);

export const MinusIcon = (p: IconProps) => (
  <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden {...p}>
    <path d="M0 5h12v2H0z" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M7 1a6 6 0 1 0 3.47 10.9l3.31 3.32 1.42-1.42-3.32-3.31A6 6 0 0 0 7 1m0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8" />
  </svg>
);

export const ChevronIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M3 5.5 8 10.5l5-5z" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M6.2 12.4 2 8.2l1.6-1.6 2.6 2.6L12.4 3 14 4.6z" />
  </svg>
);

export const AlertIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M8 1 15.5 14.5h-15zM7 6v4h2V6zm0 5v2h2v-2z" />
  </svg>
);

export const WarningIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1M7 4h2v5H7zm0 6h2v2H7z" />
  </svg>
);

export const InfoIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1M7 4h2v2H7zm0 3h2v5H7z" />
  </svg>
);

export const EmptyIcon = (p: IconProps) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M2 2h12v3H2zm0 4.5h12V14H2zm2 2v2h4v-2z" />
  </svg>
);
```

- [ ] **Step 5: Create `components/ui/status.ts`**

```ts
/**
 * Semântica de estado — o único lugar que decide qual cor um estado recebe.
 * Regra: estado crítico nunca é comunicado só por cor — sempre cor + rótulo + ícone.
 */
export type StatusTone =
  | "good"
  | "warning"
  | "critical"
  | "info"
  | "success"
  | "alert"
  | "neutral";

export const TONE_VAR: Record<StatusTone, { fg: string; bg: string }> = {
  good: { fg: "var(--state-good)", bg: "var(--state-good-bg)" },
  warning: { fg: "var(--state-warning)", bg: "var(--state-warning-bg)" },
  critical: { fg: "var(--state-critical)", bg: "var(--state-critical-bg)" },
  info: { fg: "var(--state-info)", bg: "var(--state-info-bg)" },
  success: { fg: "var(--state-success)", bg: "var(--state-success-bg)" },
  alert: { fg: "var(--state-alert)", bg: "var(--state-alert-bg)" },
  neutral: { fg: "var(--on-surface-variant)", bg: "var(--container-highest)" },
};

/**
 * A faixa de capacidade: a meta é 95% a 105% das paradas.
 *   < 95%   → alert     (abaixo da meta)
 *   95–105% → good      (dentro da meta)
 *   > 105%  → critical  (acima da meta, exibe badge ALERT)
 */
export const TARGET_MIN = 95;
export const TARGET_MAX = 105;

export function targetTone(percent: number): StatusTone {
  if (percent > TARGET_MAX) return "critical";
  if (percent < TARGET_MIN) return "warning";
  return "good";
}

export function targetLabel(percent: number): string {
  const tone = targetTone(percent);
  if (tone === "critical") return "ALERT";
  if (tone === "warning") return "BELOW";
  return "ON TARGET";
}
```

- [ ] **Step 6: Create the remaining 15 presentational components**

`components/ui/Button.tsx`:
```tsx
"use client";

import styles from "./ui.module.css";

export type ButtonVariant =
  | "primary"
  | "outline"
  | "neutral"
  | "dark"
  | "info"
  | "ghost";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.btnPrimary,
  outline: styles.btnOutline,
  neutral: styles.btnNeutral,
  dark: styles.btnDark,
  info: styles.btnInfo,
  ghost: styles.btnGhost,
};

export function Button({
  variant = "primary",
  children,
  ...rest
}: { variant?: ButtonVariant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${styles.btnBase} ${VARIANT_CLASS[variant]}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

`components/ui/ExpandButton.tsx`:
```tsx
"use client";

import styles from "./ui.module.css";
import { PlusIcon, MinusIcon } from "./icons";

export function ExpandButton({
  expanded,
  onToggle,
  label,
}: {
  expanded: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={styles.expandButton}
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
    >
      {expanded ? <MinusIcon /> : <PlusIcon />}
    </button>
  );
}
```

`components/ui/SearchField.tsx`:
```tsx
"use client";

import styles from "./ui.module.css";
import { SearchIcon } from "./icons";

export function SearchField({
  placeholder = "Search",
  onChange,
  defaultValue,
}: {
  placeholder?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}) {
  return (
    <div className={styles.searchWrap}>
      <SearchIcon className={styles.searchIcon} />
      <input
        type="search"
        className={styles.searchInput}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-label={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
```

`components/ui/Skeleton.tsx`:
```tsx
import styles from "./ui.module.css";

export function Skeleton({
  height,
  width,
}: {
  height: number | string;
  width?: number | string;
}) {
  return (
    <div
      className={styles.skeleton}
      style={{ height, width: width ?? "100%" }}
      aria-hidden
    />
  );
}
```

`components/ui/KpiCard.tsx`:
```tsx
import styles from "./ui.module.css";
import { StatusPill } from "./StatusPill";
import { TONE_VAR, type StatusTone } from "./status";

export type Kpi = {
  label: string;
  value: string | number;
  sub?: string;
  tone?: StatusTone;
  badge?: string;
};

export function KpiCard({ kpi, highlight = false }: { kpi: Kpi; highlight?: boolean }) {
  return (
    <div className={`${styles.kpiCard} ${highlight ? styles.kpiCardHighlight : ""}`}>
      <div className={styles.kpiLabel}>
        {kpi.label}
        {kpi.tone && kpi.badge ? <StatusPill tone={kpi.tone}>{kpi.badge}</StatusPill> : null}
      </div>
      <div className={styles.kpiValue} style={kpi.tone ? { color: TONE_VAR[kpi.tone].fg } : undefined}>
        {kpi.value}
      </div>
      {kpi.sub ? <div className={styles.kpiSub}>{kpi.sub}</div> : null}
    </div>
  );
}

/** Linha de KPIs. O ÚLTIMO card é diferenciado com --container-highest — regra do Handoff. */
export function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--layout-kpi-gap)" }}>
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} kpi={kpi} highlight={i === kpis.length - 1} />
      ))}
    </div>
  );
}
```

`components/ui/StatTile.tsx`:
```tsx
import styles from "./ui.module.css";
import { TONE_VAR, type StatusTone } from "./status";

export function StatTile({
  label,
  value,
  tone = "good",
}: {
  label: string;
  value: string | number;
  tone?: StatusTone;
}) {
  const { fg } = TONE_VAR[tone];
  return (
    <div className={styles.statTile} style={{ borderLeftColor: fg }}>
      <span className={styles.statTileLabel}>{label}</span>
      <span className={styles.statTileValue} style={{ color: fg }}>{value}</span>
    </div>
  );
}
```

`components/ui/StatusPill.tsx`:
```tsx
import styles from "./ui.module.css";
import { TONE_VAR, type StatusTone } from "./status";
import { CheckIcon, AlertIcon, WarningIcon, InfoIcon } from "./icons";

const TONE_ICON: Record<StatusTone, React.ComponentType<{ className?: string }>> = {
  good: CheckIcon,
  success: CheckIcon,
  info: InfoIcon,
  warning: WarningIcon,
  critical: AlertIcon,
  alert: AlertIcon,
  neutral: InfoIcon,
};

export function StatusPill({
  tone,
  children,
  showIcon = true,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  showIcon?: boolean;
}) {
  const Icon = TONE_ICON[tone];
  const { fg, bg } = TONE_VAR[tone];
  return (
    <span className={styles.pill} style={{ color: fg, background: bg }}>
      {showIcon ? <Icon /> : null}
      {children}
    </span>
  );
}
```

`components/ui/InfoChip.tsx`:
```tsx
import styles from "./ui.module.css";

export function InfoChip({ children }: { children: React.ReactNode }) {
  return <span className={styles.infoChip}>{children}</span>;
}
```

`components/ui/ProgressBar.tsx`:
```tsx
import styles from "./ui.module.css";
import { TONE_VAR, type StatusTone } from "./status";

export function ProgressBar({
  value,
  max,
  label,
  tone = "good",
}: {
  value: number;
  max: number;
  label?: string;
  tone?: StatusTone;
}) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.round((value / safeMax) * 100);
  const width = Math.min(percent, 100);
  return (
    <div className={styles.progressWrap}>
      {label ? (
        <div className={styles.progressMeta}>
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
      ) : null}
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? "Progress"}
      >
        <div className={styles.progressFill} style={{ width: `${width}%`, background: TONE_VAR[tone].fg }} />
      </div>
    </div>
  );
}
```

`components/ui/SectionBox.tsx`:
```tsx
import styles from "./ui.module.css";

export function SectionBox({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className={styles.sectionBox}>
      {label ? <span className={styles.sectionBoxLabel}>{label}</span> : null}
      {children}
    </div>
  );
}
```

`components/ui/CollapsibleSection.tsx`:
```tsx
"use client";

import { useState } from "react";
import styles from "./ui.module.css";
import { ChevronIcon } from "./icons";

export function CollapsibleSection({
  label,
  meta,
  defaultOpen = true,
  children,
}: {
  label: string;
  meta?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <button type="button" className={styles.collapsibleHeader} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{label}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
          {meta}
          <ChevronIcon className={`${styles.chevron} ${open ? "" : styles.chevronCollapsed}`} />
        </span>
      </button>
      {open ? children : null}
    </section>
  );
}
```

`components/ui/DataTable.tsx`:
```tsx
import styles from "./ui.module.css";

export type Column<T> = {
  key: string;
  header: string;
  numeric?: boolean;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  caption?: string;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        {caption ? <caption style={{ position: "absolute", left: "-9999px" }}>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.numeric ? styles.numeric : undefined}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={getRowKey(row, i)}>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? styles.numeric : undefined}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

`components/ui/OptionSwitcher.tsx`:
```tsx
"use client";

import styles from "./ui.module.css";

export function OptionSwitcher<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className={styles.optionSwitcher} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={option === value ? styles.optionItemActive : styles.optionItem}
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
```

`components/ui/States.tsx`:
```tsx
"use client";

import styles from "./ui.module.css";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { AlertIcon, EmptyIcon } from "./icons";

/** The 4 required states of every page. None is optional. */

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={56} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className={styles.stateBox}>
      <div className={styles.stateIconRow}>
        <EmptyIcon />
        <h3 className={styles.stateTitle}>{title}</h3>
      </div>
      <p className={styles.stateBody}>{body}</p>
      {action ? <Button variant="outline" onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}

export function ErrorState({
  title = "Could not load",
  body,
  onRetry,
}: {
  title?: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className={`${styles.stateBox} ${styles.stateBoxError}`} role="alert" style={{ color: "var(--error)" }}>
      <div className={styles.stateIconRow}>
        <AlertIcon />
        <h3 className={styles.stateTitle} style={{ color: "var(--error)" }}>{title}</h3>
      </div>
      <p className={styles.stateBody} style={{ color: "var(--on-surface)" }}>{body}</p>
      {onRetry ? <Button variant="outline" onClick={onRetry}>Try again</Button> : null}
    </div>
  );
}

/** Missing-data marker: use when the source data doesn't answer a field. Never invent it. */
export function MissingData({ question }: { question: string }) {
  return (
    <span className={styles.missing} title={question}>
      ? not defined
    </span>
  );
}
```

`components/ui/Toast.tsx`:
```tsx
"use client";

import { useEffect } from "react";
import styles from "./ui.module.css";
import { CheckIcon } from "./icons";

export function Toast({
  message,
  onDismiss,
  duration = 4000,
}: {
  message: string;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const id = setTimeout(onDismiss, duration);
    return () => clearTimeout(id);
  }, [onDismiss, duration]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <CheckIcon />
      {message}
    </div>
  );
}
```

`components/ui/EntityCard.tsx`:
```tsx
"use client";

import { useState } from "react";
import styles from "./ui.module.css";
import { ExpandButton } from "./ExpandButton";
import { StatusPill } from "./StatusPill";
import type { StatusTone } from "./status";

export type MiniMetric = { label: string; value: string | number };

export function EntityCard({
  title,
  subtitle,
  status,
  summary,
  metrics,
  actions,
  expandedContent,
  defaultExpanded = false,
}: {
  title: string;
  subtitle?: string;
  status?: { tone: StatusTone; label: string };
  summary?: React.ReactNode;
  metrics?: MiniMetric[];
  actions?: React.ReactNode;
  expandedContent?: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div style={{ minWidth: 0 }}>
          <h3 className={styles.cardTitle}>{title}</h3>
          {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          {status ? <StatusPill tone={status.tone}>{status.label}</StatusPill> : null}
          {expandedContent ? (
            <ExpandButton expanded={expanded} onToggle={() => setExpanded((v) => !v)} label={title} />
          ) : null}
        </div>
      </div>

      {summary}

      {metrics?.length ? (
        <>
          <div className={styles.cardDivider} />
          <div className={styles.miniMetrics}>
            {metrics.map((m) => (
              <div key={m.label} className={styles.miniMetric}>
                <span className={styles.miniMetricLabel}>{m.label}</span>
                <span className={styles.miniMetricValue}>{m.value}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {expanded && expandedContent ? (
        <>
          <div className={styles.cardDivider} />
          <div className={styles.cardBody}>{expandedContent}</div>
        </>
      ) : null}

      {actions ? <div className={styles.cardActions}>{actions}</div> : null}
    </article>
  );
}
```

`components/ui/PageHeader.tsx` (adapted from the kit — same visual spec, but its CSS classes now live in this repo's own `ui.module.css` instead of the kit's `shell.module.css`, since this repo's shell is `NavbarWrapper`, not the kit's `StandardPageLayout`):
```tsx
import styles from "./ui.module.css";

export function PageHeader({
  title,
  subtitle,
  toolbar,
}: {
  title: string;
  subtitle?: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.headerTitle}>{title}</h1>
        {subtitle ? <p className={styles.headerSubtitle}>{subtitle}</p> : null}
      </div>
      {toolbar ? <div className={styles.headerToolbar}>{toolbar}</div> : null}
    </div>
  );
}
```

`components/ui/PageContent.tsx`:
```tsx
import styles from "./ui.module.css";

/** Card grid: wrap, gap 10. */
export function PageContent({ children }: { children: React.ReactNode }) {
  return <div className={styles.cardGrid}>{children}</div>;
}

/** Generic vertical block with gap 16, for content that isn't a card grid. */
export function PageSection({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      {label ? <h2 className={styles.sectionLabel}>{label}</h2> : null}
      {children}
    </section>
  );
}

/** 32px footer, padding-top 16, space-between. */
export function PageFooter({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <footer className={styles.footer}>
      <div>{left}</div>
      <div>{right}</div>
    </footer>
  );
}
```

- [ ] **Step 7: Create `components/ui/ui.module.css`**

```css
/* Biblioteca de componentes — LogixSphere Industrial Terminal.
   Todo valor vem de var(--token). Nenhum literal. */

/* ============================================================ primitivos */
.skeleton {
  background: var(--container-highest);
  outline: var(--stroke) solid var(--outline-variant);
  outline-offset: -1px;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}

/* =============================================================== botões */
.btnBase {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md-s);
  padding: var(--space-xs) var(--space-md);
  font: var(--type-button-primary);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  border: var(--stroke) solid transparent;
  cursor: pointer;
}

.btnBase:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btnPrimary {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: var(--elevation-card);
}

.btnOutline {
  background: var(--container-highest);
  color: var(--on-surface-variant);
  border-color: var(--outline);
}

.btnNeutral {
  background: var(--container-low);
  color: var(--on-surface-variant);
  border-color: var(--stroke-neutral);
}

.btnDark {
  background: var(--inverse-surface);
  color: var(--container-lowest);
}

.btnInfo {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  border-color: var(--secondary);
}

.btnGhost {
  background: transparent;
  color: var(--on-surface-variant);
  border-color: transparent;
}

.expandButton {
  width: 23px;
  height: 23px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px;
  background: var(--primary-container);
  border: var(--stroke) solid var(--primary);
  color: var(--on-primary-container);
  cursor: pointer;
  line-height: 1;
}

.expandButton svg {
  width: var(--icon-micro);
  height: var(--icon-micro);
}

/* ========================================================= campo de busca */
.searchWrap {
  position: relative;
  width: var(--layout-search-width);
  max-width: 100%;
}

.searchIcon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  width: var(--icon-inline);
  height: var(--icon-inline);
  color: var(--outline);
  pointer-events: none;
}

.searchInput {
  width: 100%;
  height: var(--layout-search-height);
  padding: var(--space-xs) var(--space-md) var(--space-xs) var(--space-2xl);
  background: var(--surface-search);
  border: none;
  border-radius: var(--radius-micro);
  outline: var(--stroke) solid var(--text-tertiary);
  outline-offset: -1px;
  font: var(--type-timestamp);
  color: var(--on-surface);
}

.searchInput::placeholder {
  color: var(--text-tertiary);
}

/* =============================================================== card KPI */
.kpiCard {
  width: var(--layout-kpi-width);
  min-height: var(--layout-kpi-height);
  display: flex;
  flex-direction: column;
  gap: var(--space-s);
  padding: var(--space-lg);
  background: var(--container-low);
  outline: var(--stroke) solid var(--outline-variant);
  outline-offset: -1px;
  box-shadow: var(--elevation-none);
}

.kpiCardHighlight {
  background: var(--container-highest);
}

.kpiLabel {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font: var(--type-metric-label);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--on-surface-variant);
}

.kpiValue {
  font: var(--type-headline-sm);
  color: var(--on-surface);
  font-variant-numeric: tabular-nums;
}

.kpiSub {
  margin-top: var(--space-sm);
  font: var(--type-timestamp);
  letter-spacing: var(--ls-data);
  color: var(--text-quaternary);
}

/* ============================================================== stat tile */
.statTile {
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-lg);
  background: var(--container-low);
  border-left: var(--space-xs) solid var(--primary);
}

.statTileLabel {
  font: var(--type-metric-label);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
  color: var(--text-quaternary);
}

.statTileValue {
  font: var(--type-data-lg);
  font-variant-numeric: tabular-nums;
}

/* ================================================================== pills */
.pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 3px var(--space-s);
  border-radius: var(--radius-pill);
  font: var(--type-badge);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  white-space: nowrap;
}

.pill svg {
  width: var(--icon-micro);
  height: var(--icon-micro);
  flex: 0 0 auto;
}

.infoChip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-s);
  padding: var(--space-md-s) var(--space-md);
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  font: var(--type-data-md);
  font-weight: 700;
}

/* ======================================================== barra de progresso */
.progressWrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: 100%;
}

.progressMeta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font: var(--type-metric-value);
  color: var(--on-surface-variant);
  font-variant-numeric: tabular-nums;
}

.progressTrack {
  height: var(--space-sm);
  width: 100%;
  border-radius: var(--radius-track);
  background: var(--container-highest);
  overflow: hidden;
}

.progressFill {
  height: 100%;
  border-radius: var(--radius-track);
  background: var(--primary);
  transition: width 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .progressFill { transition: none; }
}

/* =================================================== seção interna de card */
.sectionBox {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--container-low);
  border: var(--stroke) solid var(--outline-variant);
  border-radius: var(--radius-sm);
}

.sectionBoxLabel {
  font: var(--type-section-label);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--on-surface);
}

/* ================================================== cabeçalho recolhível */
.collapsibleHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  width: 100%;
  padding: var(--space-sm);
  background: var(--container-high);
  border: none;
  border-left: var(--space-xs) solid var(--primary);
  font: var(--type-vehicle-plate);
  color: var(--on-primary-container);
  cursor: pointer;
  text-align: left;
}

.chevron {
  width: var(--icon-inline);
  height: var(--icon-inline);
  transition: transform 150ms ease-out;
}

.chevronCollapsed {
  transform: rotate(-90deg);
}

/* ================================================================ tabela */
.tableWrap {
  width: 100%;
  overflow-x: auto;
  background: var(--container-lowest);
  outline: var(--stroke) solid var(--outline);
  outline-offset: -1px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead th {
  height: 40px;
  padding: var(--space-s) var(--space-sm);
  background: var(--container-low);
  border-bottom: var(--stroke-strong) solid var(--outline-variant);
  border-right: var(--stroke) solid var(--outline-variant);
  font: var(--type-table-header);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--on-surface);
  text-align: left;
  white-space: nowrap;
}

.table thead th:last-child { border-right: none; }

.table tbody td {
  padding: var(--space-s) var(--space-sm);
  border-bottom: var(--stroke) solid var(--stroke-divider);
  font: var(--type-metric-value);
  color: var(--on-surface-variant);
}

.table tbody tr:last-child td { border-bottom: none; }

.numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ===================================================== toggle de opção */
.optionSwitcher {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  background: var(--container-low);
  border-radius: var(--radius-pill);
}

.optionItem,
.optionItemActive {
  padding: var(--space-xs) var(--space-md);
  border: none;
  border-radius: var(--radius-pill);
  font: var(--type-ui-aux);
  cursor: pointer;
}

.optionItem {
  background: transparent;
  color: var(--on-surface-variant);
}

.optionItemActive {
  background: var(--on-surface-variant);
  color: var(--container-lowest);
}

/* =========================================================== card de entidade */
.card {
  width: var(--layout-card-width);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--surface);
  border: var(--stroke) solid var(--stroke-card);
  box-shadow: var(--elevation-card);
}

.cardHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm);
}

.cardTitle {
  margin: 0;
  font: var(--type-driver-name);
  color: var(--on-surface);
}

.cardSubtitle {
  margin: var(--space-xs) 0 0;
  font: var(--type-vehicle-plate);
  color: var(--on-surface-variant);
}

.cardDivider {
  height: var(--stroke);
  background: var(--stroke-divider);
}

.cardBody {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.miniMetrics {
  display: flex;
  gap: var(--space-s);
}

.miniMetric {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-s);
  background: var(--container-low);
  border: var(--stroke) solid var(--outline-variant);
}

.miniMetricLabel {
  font: var(--type-badge);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--text-quaternary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.miniMetricValue {
  font: var(--type-data-md);
  color: var(--on-surface);
  font-variant-numeric: tabular-nums;
}

.cardActions {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

/* ============================================================== estados */
.stateBox {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-xl);
  background: var(--container-low);
  outline: var(--stroke) solid var(--outline-variant);
  outline-offset: -1px;
  width: 100%;
}

.stateTitle {
  margin: 0;
  font: var(--type-section-label);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--on-surface);
}

.stateBody {
  margin: 0;
  font: var(--type-page-subtitle);
  color: var(--on-surface-variant);
  max-width: 62ch;
}

.stateBoxError {
  background: var(--error-container);
  outline-color: var(--error);
}

.stateIconRow {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.stateIconRow svg {
  width: var(--icon-nav);
  height: var(--icon-nav);
}

/* =============================================================== toast */
.toast {
  position: fixed;
  right: var(--space-xl);
  bottom: var(--space-xl);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--inverse-surface);
  color: var(--container-lowest);
  box-shadow: var(--elevation-float);
  font: var(--type-metric-value);
}

.toast svg {
  width: var(--icon-inline);
  height: var(--icon-inline);
  color: var(--primary-container);
}

/* ============================================= aviso de dado ausente */
.missing {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 2px var(--space-s);
  background: var(--state-alert-bg);
  outline: var(--stroke) dashed var(--state-alert);
  outline-offset: -1px;
  font: var(--type-badge);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--state-alert);
}

/* ==================================================== cabeçalho de page */
.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-xl);
}

.headerTitle {
  margin: 0;
  font: var(--type-headline-lg);
  color: var(--on-surface);
}

.headerSubtitle {
  margin: var(--space-sm) 0 0;
  font: var(--type-page-subtitle);
  color: var(--on-surface-variant);
}

.headerToolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

/* ================================================= conteúdo/rodapé de page */
.cardGrid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--layout-card-grid-gap);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.sectionLabel {
  margin: 0;
  font: var(--type-section-label);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--on-surface);
}

.footer {
  height: var(--layout-footer-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-lg);
  border-top: var(--stroke) solid var(--stroke-divider);
  font: var(--type-timestamp);
  letter-spacing: var(--ls-data);
  color: var(--text-quaternary);
}
```

- [ ] **Step 8: Create `components/ui/index.ts`**

```ts
export { Button, type ButtonVariant } from "./Button";
export { ExpandButton } from "./ExpandButton";
export { SearchField } from "./SearchField";
export { Skeleton } from "./Skeleton";
export { KpiCard, KpiRow, type Kpi } from "./KpiCard";
export { StatTile } from "./StatTile";
export { StatusPill } from "./StatusPill";
export { InfoChip } from "./InfoChip";
export { ProgressBar } from "./ProgressBar";
export { SectionBox } from "./SectionBox";
export { CollapsibleSection } from "./CollapsibleSection";
export { DataTable, type Column } from "./DataTable";
export { OptionSwitcher } from "./OptionSwitcher";
export { LoadingState, EmptyState, ErrorState, MissingData } from "./States";
export { Toast } from "./Toast";
export { EntityCard } from "./EntityCard";
export { PageHeader } from "./PageHeader";
export { PageContent, PageSection, PageFooter } from "./PageContent";
export {
  TONE_VAR,
  targetTone,
  targetLabel,
  TARGET_MIN,
  TARGET_MAX,
  type StatusTone,
} from "./status";
```

- [ ] **Step 9: Create `lib/case.ts`**

```ts
/**
 * Conversão snake_case → camelCase. O backend real devolve `vehicle_id`,
 * `route_name` etc. — o mock imita essa conversão para que a page nasça
 * escrita contra o formato que vai receber de verdade.
 */
export type Snake<T> = T;

const toCamel = (key: string): string =>
  key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

export function camelizeKeys<T>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => camelizeKeys(item)) as T;
  }
  if (input !== null && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      out[toCamel(key)] = camelizeKeys(value);
    }
    return out as T;
  }
  return input as T;
}
```

- [ ] **Step 10: Create `lib/mock-client.ts`**

```ts
import { camelizeKeys } from "./case";

/**
 * Data client for the prototype. Has the SAME signature `lib/api-client.ts`
 * would have in the real repo (`api.get`, `api.post`) on purpose: when a page
 * migrates, only the import changes — the hook, mapper, types and components
 * stay exactly as they are.
 *
 *   prototype:  import { api } from "@/lib/mock-client";
 *   production: import { api } from "@/lib/api-client";
 */

export type MockScenario = "ok" | "empty" | "error" | "slow";

export class MockApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "MockApiError";
  }
}

/** Reads the scenario from the query string. Outside the browser, always "ok". */
export function currentScenario(): MockScenario {
  if (typeof window === "undefined") return "ok";
  const value = new URLSearchParams(window.location.search).get("mock");
  if (value === "empty" || value === "error" || value === "slow") return value;
  return "ok";
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type MockSource<T> = {
  data: unknown;
  empty?: unknown;
  errorMessage?: string;
  __type?: T;
};

export const api = {
  /**
   * `path` is not used by the mock, but is REQUIRED and must be the real
   * backend path — kept in the code so integration is mechanical.
   */
  async get<T>(path: string, source: MockSource<T>): Promise<T> {
    const scenario = currentScenario();
    await delay(scenario === "slow" ? 2500 : 450);

    if (scenario === "error") {
      throw new MockApiError(
        source.errorMessage ?? `Failed to fetch ${path}. The service did not respond.`,
        503,
      );
    }

    const payload = scenario === "empty" ? (source.empty ?? []) : source.data;
    return camelizeKeys<T>(payload);
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const scenario = currentScenario();
    await delay(scenario === "slow" ? 2000 : 600);
    if (scenario === "error") {
      throw new MockApiError(`Failed to submit to ${path}.`, 500);
    }
    return camelizeKeys<T>(body);
  },
};
```

- [ ] **Step 11: Create `lib/useMockQuery.ts`**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";

export type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  refetch: () => void;
};

export function useMockQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
): QueryResult<T> {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [nonce, setNonce] = useState(0);

  const key = JSON.stringify(queryKey);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(undefined);

    queryFn()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setData(undefined);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, isLoading, isError: error !== undefined, error, refetch };
}
```

- [ ] **Step 12: Create `scripts/check-tokens.mjs`**

```js
#!/usr/bin/env node
/**
 * Literal-value checker — adapted for this repository.
 *
 * The original kit scans the whole repo because the whole kit repo follows
 * the Design System. Here it doesn't: week-planner and route-balance use the
 * old literal Figma-copy style, by decision recorded in
 * docs/superpowers/specs/2026-09-23-daily-ops-design-system-migration-design.md,
 * section 2. This script scans only the paths "governed" by the new rule —
 * the list grows every time a new page is built under the new system.
 *
 * Usage: npm run check:tokens
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const ALLOWED_FILES = new Set(["styles/tokens.css"]);
const EXTS = new Set([".ts", ".tsx", ".css"]);

/**
 * Paths, relative to the repo root, covered by the "no literal value" rule.
 * Add your new page's folder here when it's built under the new system —
 * that's how the rule scales without failing old code that hasn't migrated.
 */
const GOVERNED_PATHS = [
  "styles",
  "components/ui",
  "lib/mock-client.ts",
  "lib/useMockQuery.ts",
  "lib/case.ts",
  "app/(private)/daily-ops",
];

const RULES = [
  {
    id: "cor-literal",
    re: /#[0-9a-fA-F]{3,8}\b/g,
    hint: "use var(--token) from styles/tokens.css",
  },
  {
    id: "rgb-literal",
    re: /\brgba?\(\s*\d+\s*,/g,
    hint: "use var(--state-*-bg) or the elevation token",
  },
  {
    id: "fonte-literal",
    re: /font-size\s*:\s*\d/g,
    hint: "use a typography role (--type-*)",
  },
  {
    id: "sombra-literal",
    re: /box-shadow\s*:\s*(?!var\()[^;]*\d/g,
    hint: "use --elevation-card or --elevation-float",
  },
  {
    id: "raio-literal",
    re: /border-radius\s*:\s*(?!var\()[^;]*\d/g,
    hint: "use --radius-micro / --radius-sm / --radius-track / --radius-pill",
  },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTS.has(extname(entry))) out.push(full);
  }
  return out;
}

function collectFiles() {
  const files = [];
  for (const rel of GOVERNED_PATHS) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) continue;
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const violations = [];

for (const file of collectFiles()) {
  const rel = relative(ROOT, file).split("\\").join("/");
  if (ALLOWED_FILES.has(rel)) continue;

  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) return;

    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      const match = rule.re.exec(line);
      if (match) {
        violations.push({ file: rel, line: i + 1, rule: rule.id, found: match[0].trim(), hint: rule.hint });
      }
    }
  });
}

if (violations.length === 0) {
  console.log("check:tokens — no literal values outside styles/tokens.css.");
  process.exit(0);
}

console.error(`check:tokens — ${violations.length} violation(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.rule}]  ${v.found}`);
  console.error(`      → ${v.hint}\n`);
}
console.error(
  "First rule of the Design System: no component declares a literal color,\n" +
    "font, radius, spacing or shadow. Everything comes from var(--token).\n",
);
process.exit(1);
```

- [ ] **Step 13: Add the `check:tokens` script to `package.json`**

In `package.json`, in the `"scripts"` object, add (after `"lint"`):
```json
    "check:tokens": "node scripts/check-tokens.mjs",
```

- [ ] **Step 14: Import tokens and fonts globally**

In `app/globals.css`, add these two lines at the very top of the file, before the existing 3 rules:
```css
@import "../styles/tokens.css";
@import "../styles/fonts.css";
```

- [ ] **Step 15: Write and run the smoke tests**

Create `components/ui/__tests__/smoke.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button, StatusPill, KpiCard } from "..";

describe("components/ui smoke test", () => {
  it("renders a Button with its children", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("renders a StatusPill with its tone label", () => {
    render(<StatusPill tone="critical">ALERT</StatusPill>);
    expect(screen.getByText("ALERT")).toBeTruthy();
  });

  it("renders a KpiCard with its value", () => {
    render(<KpiCard kpi={{ label: "Stops", value: 148 }} />);
    expect(screen.getByText("148")).toBeTruthy();
  });
});
```

Create `lib/__tests__/case.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { camelizeKeys } from "../case";

describe("camelizeKeys", () => {
  it("converts a flat snake_case object to camelCase", () => {
    expect(camelizeKeys({ route_name: "LCY-14", total_stops: 63 })).toEqual({
      routeName: "LCY-14",
      totalStops: 63,
    });
  });

  it("converts nested objects and arrays recursively", () => {
    expect(
      camelizeKeys({
        daily_earnings: [{ operation_id: 1, vehicle_registration_plate: "LK19 XYZ" }],
      }),
    ).toEqual({
      dailyEarnings: [{ operationId: 1, vehicleRegistrationPlate: "LK19 XYZ" }],
    });
  });
});
```

Run: `npm run test`
Expected: PASS (5 tests: 3 in smoke.test.tsx, 2 in case.test.ts)

- [ ] **Step 16: Run the full gate**

Run: `npm run typecheck && npm run check:tokens && npm run lint && npm run build`
Expected: all four succeed. `check:tokens` prints "check:tokens — no literal values outside styles/tokens.css." (nothing under `app/(private)/daily-ops` exists yet, so `styles/`, `components/ui/`, and `lib/{mock-client,useMockQuery,case}.ts` are the only governed paths scanned, and they contain none).

- [ ] **Step 17: Commit**

```bash
git add styles/ components/ui/ lib/case.ts lib/mock-client.ts lib/useMockQuery.ts lib/__tests__/case.test.ts scripts/check-tokens.mjs package.json app/globals.css
git commit -m "feat: port Industrial Terminal design system as the central style base

Adds styles/tokens.css (114 tokens), a components/ui/ library, a
mock-client + useMockQuery pair mirroring the real API client's shape,
and a check:tokens lint gate scoped to the new system's own paths."
```

---

### Task 2: "Daily Ops" navigation hub

**Files:**
- Modify: `app/(private)/components/NavbarWrapper.tsx`
- Create: `app/(private)/daily-ops/page.tsx`
- Create: `app/(private)/daily-ops/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `components/ui` (`EntityCard`, `PageHeader`, `PageContent`, `PageFooter`) from Task 1.
- Produces: route `/daily-ops` with 6 links to `/daily-ops/current-performance`, `/daily-ops/current-month`, `/daily-ops/daily-performance-insight`, `/daily-ops/daily-operations-reports`, `/daily-ops/daily-financial-insights`, `/daily-ops/daily-game-plan`. `NavbarWrapper`'s `NavKey` type gains `"daily-ops"` — every page built in Tasks 3–9 passes `active="daily-ops"` to `NavbarWrapper` (the hub icon stays highlighted for the whole module, not just the index).

- [ ] **Step 1: Extend `NavbarWrapper`'s `NavKey` type and add the sidebar entry**

In `app/(private)/components/NavbarWrapper.tsx`, change:
```tsx
type NavKey = "home" | "week-planner" | "route-balance" | "cleaning-desk";
```
to:
```tsx
type NavKey = "home" | "week-planner" | "route-balance" | "daily-ops" | "cleaning-desk";
```

Then add a new `<Link>` right after the Route Balance one:
```tsx
          <Link className={navClass("route-balance")} href="/route-balance" aria-current={navCurrent("route-balance")} aria-label="Route Balance"><span className="nav-icon">☷</span><span>Route Balance</span></Link>
          <Link className={navClass("daily-ops")} href="/daily-ops" aria-current={navCurrent("daily-ops")} aria-label="Daily Ops"><span className="nav-icon">▧</span><span>Daily Ops</span></Link>
          <button className={navClass("cleaning-desk")} type="button" aria-label="Cleaning Desk"><span className="nav-icon">▤</span><span>Cleaning Desk</span></button>
```
(only the new `daily-ops` line is added; `route-balance` and `cleaning-desk` are unchanged, shown here for placement context).

- [ ] **Step 2: Create the hub page `app/(private)/daily-ops/page.tsx`**

```tsx
import Link from "next/link";
import NavbarWrapper from "../components/NavbarWrapper";
import { EntityCard, PageContent, PageFooter, PageHeader } from "@/components/ui";

type DailyOpsPrototype = {
  slug: string;
  title: string;
  subtitle: string;
};

const PROTOTYPES: DailyOpsPrototype[] = [
  {
    slug: "current-performance",
    title: "Current Performance",
    subtitle: "Monthly averages and a daily breakdown table of stops, SPOR-H and TW.",
  },
  {
    slug: "current-month",
    title: "Current Month",
    subtitle: "Monthly earnings summary with a day-by-day drill-down of operations.",
  },
  {
    slug: "daily-performance-insight",
    title: "Daily Performance Insight",
    subtitle: "Per-day operation cards with metrics, timeline and failed-delivery breakdown.",
  },
  {
    slug: "daily-operations-reports",
    title: "Daily Operations Reports",
    subtitle: "Filterable, paginated table of operational report rows by date range or single day.",
  },
  {
    slug: "daily-financial-insights",
    title: "Daily Financial Insights",
    subtitle: "Filterable table of financial rows tied to service partners, with edit/delete actions.",
  },
  {
    slug: "daily-game-plan",
    title: "Daily Game Plan",
    subtitle: "Dispatcher board: deposits, operations, unallocated vendors and off-panel.",
  },
];

export default function DailyOpsHubPage() {
  return (
    <NavbarWrapper title="DAILY OPS" active="daily-ops">
      <PageHeader
        title="Daily Ops"
        subtitle="Six prototype screens rebuilt from the real Daily Ops module, mock data only."
      />
      <PageContent>
        {PROTOTYPES.map((p) => (
          <Link key={p.slug} href={`/daily-ops/${p.slug}`} style={{ textDecoration: "none" }}>
            <EntityCard title={p.title} subtitle={p.subtitle} />
          </Link>
        ))}
      </PageContent>
      <PageFooter left={`${PROTOTYPES.length} screens`} right="Simulated data — prototype" />
    </NavbarWrapper>
  );
}
```

- [ ] **Step 3: Write the hub page test**

Create `app/(private)/daily-ops/__tests__/page.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DailyOpsHubPage from "../page";

describe("DailyOpsHubPage", () => {
  it("renders a link to each of the 6 real pages with the right href", () => {
    render(<DailyOpsHubPage />);
    const expected: Record<string, string> = {
      "Current Performance": "/daily-ops/current-performance",
      "Current Month": "/daily-ops/current-month",
      "Daily Performance Insight": "/daily-ops/daily-performance-insight",
      "Daily Operations Reports": "/daily-ops/daily-operations-reports",
      "Daily Financial Insights": "/daily-ops/daily-financial-insights",
      "Daily Game Plan": "/daily-ops/daily-game-plan",
    };
    expect(screen.getAllByRole("link")).toHaveLength(6);
    for (const [name, href] of Object.entries(expected)) {
      expect(screen.getByRole("link", { name: new RegExp(name, "i") }).getAttribute("href")).toBe(href);
    }
  });
});
```

- [ ] **Step 4: Run tests and gates**

Run: `npm run test -- daily-ops`
Expected: PASS.

Run: `npm run typecheck && npm run check:tokens && npm run build`
Expected: all succeed. `check:tokens` now scans `app/(private)/daily-ops/page.tsx` too (it's under the governed `app/(private)/daily-ops` path) and finds no literal values, since `PageHeader`/`PageContent`/`PageFooter`/`EntityCard` carry all styling.

- [ ] **Step 5: Manual check**

Run: `npm run dev`, open `http://localhost:3000/daily-ops` in the browser. Confirm: the sidebar shows a 5th "Daily Ops" icon between Route Balance and Cleaning Desk, it's highlighted lime when active, and all 6 cards are clickable (they'll 404 until Tasks 3–9 build their targets — that's expected at this point).

- [ ] **Step 6: Commit**

```bash
git add "app/(private)/components/NavbarWrapper.tsx" "app/(private)/daily-ops/"
git commit -m "feat: add Daily Ops navigation hub

Adds a fifth sidebar icon and an index page linking to the 6 Daily Ops
prototype pages built in the following tasks."
```

---

### Task 3: `current-performance` page (pilot)

Real source: `app/(private)/current-performance/` in `logix-sphere-frontend-nextjs-main`. Driver-facing monthly performance table: a month selector, 3 monthly-average tiles (TW/SPR/SPOR-H), and a daily-breakdown table with 5 columns (Day, Route, Stops, SPOR-H, TW), most-recent-day first, color-graded by the 90%/80% thresholds from the real code.

**Files:**
- Create: `app/(private)/daily-ops/current-performance/types.ts`
- Create: `app/(private)/daily-ops/current-performance/constants.ts`
- Create: `app/(private)/daily-ops/current-performance/utils/thresholds.ts`
- Create: `app/(private)/daily-ops/current-performance/utils/currentPerformanceMappers.ts`
- Create: `app/(private)/daily-ops/current-performance/utils/currentPerformanceMappers.test.ts`
- Create: `app/(private)/daily-ops/current-performance/hooks/useCurrentPerformance.ts`
- Create: `app/(private)/daily-ops/current-performance/components/MonthCarousel.tsx`
- Create: `app/(private)/daily-ops/current-performance/components/MonthlyAverages.tsx`
- Create: `app/(private)/daily-ops/current-performance/components/DailyBreakdownTable.tsx`
- Create: `app/(private)/daily-ops/current-performance/components/Content.tsx`
- Create: `app/(private)/daily-ops/current-performance/page.tsx`
- Create: `app/(private)/daily-ops/current-performance/loading.tsx`
- Create: `lib/mocks/daily-ops/current-performance-fixtures.ts`

**Interfaces:**
- Consumes: `components/ui` (`StatTile`, `StatusPill`, `DataTable`, `Column`, `OptionSwitcher`, `LoadingState`, `EmptyState`, `ErrorState`, `PageHeader`, `PageFooter`, `TONE_VAR`) from Task 1; `NavbarWrapper` from `app/(private)/components/NavbarWrapper`; `api`/`useMockQuery` from Task 1.
- Produces: route `/daily-ops/current-performance`. Types `DayData`, `MonthlyAverages`, `ValueTone` (used identically by no other page — each Daily Ops page has its own independent type shape, confirmed during research).

- [ ] **Step 1: Create `types.ts`**

```ts
/**
 * The screen model. Mirrors the real DayData shape closely because the
 * real page's own aggregation (`processMonthData`) already IS the mapping
 * work — see utils/currentPerformanceMappers.ts.
 */
export type ValueTone = "na" | "positive" | "warning" | "negative";

export interface DayData {
  day: number;
  dayOfWeek: number;
  route: string;
  /**
   * In the real source this is assigned the SPR value, not a distinct stop
   * count — a genuine quirk of the production code, preserved here for
   * fidelity rather than "fixed" into something the real screen doesn't do.
   */
  stops: number | string;
  sporH: string;
  tw: string;
  spr: number | string;
  sporHTone: ValueTone;
  twTone: ValueTone;
}

export interface MonthlyAverages {
  avgTw: string;
  avgSpr: string;
  avgSporH: string;
}
```

- [ ] **Step 2: Create `constants.ts`**

```ts
/**
 * Real endpoint this page will call once integrated — confirmed by reading
 * app/(private)/current-performance in logix-sphere-frontend-nextjs-main:
 *   GET /bff/daily-overview/list/{userId}/{month+1}/{year}
 */
export const ENDPOINT = "/bff/daily-overview/list";

/** Last 12 months up to September 2026 — only September 2026 has fixture
 *  data with real numbers; the other 11 resolve to the same demo dataset
 *  (this is a static prototype, not a per-month dataset generator). */
export const MONTH_OPTIONS = [
  "OCT/25", "NOV/25", "DEC/25", "JAN/26", "FEB/26", "MAR/26",
  "APR/26", "MAY/26", "JUN/26", "JUL/26", "AUG/26", "SEP/26",
] as const;

export const DEFAULT_MONTH_OPTION = "SEP/26";
export const DEFAULT_YEAR = 2026;
export const DEFAULT_MONTH = 9;
```

- [ ] **Step 3: Create `utils/thresholds.ts`**

```ts
import type { ValueTone } from "../types";

/**
 * Exact thresholds from the real page's getTimeWindowClass:
 *   'N/A' | '--:--' | '0.0%' → na
 *   >= 90%                   → positive
 *   80–90%                   → warning
 *   else                     → negative
 */
export function timeWindowTone(twValue: string): ValueTone {
  if (twValue === "N/A" || twValue === "--:--" || twValue === "0.0%") return "na";
  const value = parseFloat(twValue);
  if (value >= 90) return "positive";
  if (value >= 80) return "warning";
  return "negative";
}

/**
 * Exact thresholds from the real page's getSporHClass. The real function has
 * two overlapping bands (a 0-100 percentage scale and a legacy ~18-point
 * scale) — both are preserved here rather than simplified to one.
 */
export function sporHTone(sporHValue: string): ValueTone {
  if (sporHValue === "N/A" || sporHValue === "--:--" || sporHValue === "0.0") return "na";
  const value = parseFloat(sporHValue);
  if (value >= 90) return "positive";
  if (value >= 80) return "warning";
  if (value >= 18.0) return "positive";
  return "negative";
}
```

- [ ] **Step 4: Create `utils/currentPerformanceMappers.ts`**

```ts
import type { DayData, MonthlyAverages } from "../types";
import { timeWindowTone, sporHTone } from "./thresholds";

export interface MonthOverviewDTO {
  currentMonth: {
    name: string;
    daysWorked: number;
    totalAmount: string;
    averagePerDay: string;
    avgTw?: string;
    avgSpr?: string;
    avgSporH?: string;
  };
  dailyEarnings: Array<{
    date: string;
    dateName: string;
    amount: string;
    dailySpr?: number;
    dailySporH?: number;
    dailyTwPercentage?: number;
    operations?: Array<{ routeName: string }>;
  }>;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * The real page decides "future day" / "no operations that day" by comparing
 * against `today` and skipping Sundays. This prototype has one fixed,
 * already-closed demo month (see constants.ts), so there's no meaningful
 * "future" — any calendar day with no matching `dailyEarnings` entry renders
 * as '--:--', the same value the real page shows for both of its own cases.
 */
export function mapMonthOverviewToDayData(dto: MonthOverviewDTO, year: number, month: number): DayData[] {
  const byDay = new Map(dto.dailyEarnings.map((entry) => [new Date(entry.date).getDate(), entry]));
  const total = daysInMonth(year, month);
  const rows: DayData[] = [];

  for (let day = 1; day <= total; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue; // Sundays are never shown, same as the real page.

    const entry = byDay.get(day);
    const hasSpr = entry?.dailySpr !== undefined && entry.dailySpr > 0;

    const sporH = entry?.dailySporH !== undefined ? entry.dailySporH.toFixed(1) : "--:--";
    const tw = entry?.dailyTwPercentage !== undefined ? `${entry.dailyTwPercentage.toFixed(1)}%` : "--:--";
    const spr = hasSpr ? (entry!.dailySpr as number) : "--:--";

    rows.push({
      day,
      dayOfWeek,
      route: entry?.operations?.[0]?.routeName ?? "--:--",
      stops: spr, // same quirk as the real page: stops mirrors spr, not a distinct count.
      sporH,
      tw,
      spr,
      sporHTone: sporHTone(sporH),
      twTone: timeWindowTone(tw),
    });
  }

  return rows;
}

/** Drops rows where every value field is empty, then reverses to most-recent-first — exact real-page behavior. */
export function visibleRows(rows: DayData[]): DayData[] {
  return rows
    .filter((r) => !(r.route === "--:--" && r.sporH === "--:--" && r.tw === "--:--" && r.spr === "--:--"))
    .slice()
    .reverse();
}

export function mapAverages(dto: MonthOverviewDTO): MonthlyAverages {
  return {
    avgTw: dto.currentMonth.avgTw ?? "--:--",
    avgSpr: dto.currentMonth.avgSpr ?? "--:--",
    avgSporH: dto.currentMonth.avgSporH ?? "--:--",
  };
}
```

- [ ] **Step 5: Write the mapper test FIRST**

Create `app/(private)/daily-ops/current-performance/utils/currentPerformanceMappers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { mapMonthOverviewToDayData, mapAverages, visibleRows, type MonthOverviewDTO } from "./currentPerformanceMappers";

const DTO: MonthOverviewDTO = {
  currentMonth: { name: "September", daysWorked: 2, totalAmount: "0", averagePerDay: "0", avgTw: "92.4%", avgSpr: "148", avgSporH: "21.3" },
  dailyEarnings: [
    { date: "2026-09-02", dateName: "Wed 02 Sep", amount: "245.10", dailySpr: 156, dailySporH: 22.1, dailyTwPercentage: 94.0, operations: [{ routeName: "LCY-042" }] },
    { date: "2026-09-03", dateName: "Thu 03 Sep", amount: "198.00", dailySpr: 132, dailySporH: 17.4, dailyTwPercentage: 83.5, operations: [{ routeName: "LCY-042" }] },
  ],
};

describe("mapMonthOverviewToDayData", () => {
  it("fills every day of the month except Sundays", () => {
    const rows = mapMonthOverviewToDayData(DTO, 2026, 9);
    expect(rows.every((r) => r.dayOfWeek !== 0)).toBe(true);
    expect(rows).toHaveLength(26); // September 2026 has 30 days, minus 4 Sundays.
  });

  it("marks days with no matching entry as '--:--'", () => {
    const rows = mapMonthOverviewToDayData(DTO, 2026, 9);
    const day1 = rows.find((r) => r.day === 1)!;
    expect(day1.route).toBe("--:--");
    expect(day1.sporHTone).toBe("na");
  });

  it("carries route, spr and stops from the matching entry, with the real stops=spr quirk", () => {
    const rows = mapMonthOverviewToDayData(DTO, 2026, 9);
    const day2 = rows.find((r) => r.day === 2)!;
    expect(day2.route).toBe("LCY-042");
    expect(day2.spr).toBe(156);
    expect(day2.stops).toBe(156);
    expect(day2.sporH).toBe("22.1");
    expect(day2.tw).toBe("94.0%");
  });

  it("applies the exact tone thresholds", () => {
    const rows = mapMonthOverviewToDayData(DTO, 2026, 9);
    const day2 = rows.find((r) => r.day === 2)!; // sporH 22.1 -> positive (>=18.0 branch); tw 94.0% -> positive
    const day3 = rows.find((r) => r.day === 3)!; // sporH 17.4 -> negative; tw 83.5% -> warning
    expect(day2.sporHTone).toBe("positive");
    expect(day2.twTone).toBe("positive");
    expect(day3.sporHTone).toBe("negative");
    expect(day3.twTone).toBe("warning");
  });
});

describe("visibleRows", () => {
  it("drops all-empty rows and reverses to most-recent-first", () => {
    const rows = mapMonthOverviewToDayData(DTO, 2026, 9);
    const visible = visibleRows(rows);
    expect(visible.every((r) => r.route !== "--:--")).toBe(true);
    expect(visible[0].day).toBe(3);
    expect(visible[visible.length - 1].day).toBe(2);
  });
});

describe("mapAverages", () => {
  it("reads the pre-computed averages from currentMonth", () => {
    expect(mapAverages(DTO)).toEqual({ avgTw: "92.4%", avgSpr: "148", avgSporH: "21.3" });
  });

  it("falls back to '--:--' when an average is missing", () => {
    expect(mapAverages({ ...DTO, currentMonth: { ...DTO.currentMonth, avgTw: undefined } }).avgTw).toBe("--:--");
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm run test -- currentPerformanceMappers`
Expected: FAIL (`currentPerformanceMappers.ts` doesn't exist yet — wait, Step 4 already created it above; run this before Step 4 in practice, or simply confirm PASS now since both were written together. If following strict TDD, write Step 5's test file before Step 4's implementation file, run once to see it fail with "Cannot find module", then create Step 4's file and re-run.)

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run test -- currentPerformanceMappers`
Expected: PASS (7 tests).

- [ ] **Step 8: Create the fixture `lib/mocks/daily-ops/current-performance-fixtures.ts`**

```ts
/**
 * Backend-shape fixture (snake_case) for /daily-ops/current-performance.
 * September 2026 is the one month with real numbers in this prototype —
 * see constants.ts MONTH_OPTIONS.
 */
export const CURRENT_PERFORMANCE_FIXTURE = {
  current_month: {
    name: "September",
    days_worked: 22,
    total_amount: "3218.40",
    average_per_day: "146.29",
    avg_tw: "92.4%",
    avg_spr: "148",
    avg_sporh: "21.3",
  },
  daily_earnings: [
    { date: "2026-09-01", date_name: "Tue 01 Sep", amount: "245.10", daily_spr: 156, daily_sporh: 22.1, daily_tw_percentage: 94.0, operations: [{ route_name: "LCY-042" }] },
    { date: "2026-09-02", date_name: "Wed 02 Sep", amount: "198.00", daily_spr: 132, daily_sporh: 17.4, daily_tw_percentage: 83.5, operations: [{ route_name: "LCY-042" }] },
    { date: "2026-09-04", date_name: "Fri 04 Sep", amount: "231.40", daily_spr: 141, daily_sporh: 19.8, daily_tw_percentage: 88.2, operations: [{ route_name: "MSE-118" }] },
    { date: "2026-09-05", date_name: "Sat 05 Sep", amount: "0.00", operations: [] },
    { date: "2026-09-08", date_name: "Tue 08 Sep", amount: "260.75", daily_spr: 163, daily_sporh: 23.4, daily_tw_percentage: 96.1, operations: [{ route_name: "LCY-042" }] },
    { date: "2026-09-09", date_name: "Wed 09 Sep", amount: "204.20", daily_spr: 128, daily_sporh: 16.9, daily_tw_percentage: 79.0, operations: [{ route_name: "LSE-076" }] },
    { date: "2026-09-10", date_name: "Thu 10 Sep", amount: "212.60", daily_spr: 134, daily_sporh: 18.5, daily_tw_percentage: 91.4, operations: [{ route_name: "LSE-076" }] },
    { date: "2026-09-11", date_name: "Fri 11 Sep", amount: "0.00", operations: [] },
    { date: "2026-09-15", date_name: "Tue 15 Sep", amount: "255.00", daily_spr: 159, daily_sporh: 22.7, daily_tw_percentage: 95.5, operations: [{ route_name: "LCY-042" }] },
    { date: "2026-09-16", date_name: "Wed 16 Sep", amount: "198.90", daily_spr: 130, daily_sporh: 17.1, daily_tw_percentage: 82.0, operations: [{ route_name: "MSE-118" }] },
    { date: "2026-09-17", date_name: "Thu 17 Sep", amount: "241.30", daily_spr: 150, daily_sporh: 20.9, daily_tw_percentage: 93.8, operations: [{ route_name: "BASP-021" }] },
    { date: "2026-09-18", date_name: "Fri 18 Sep", amount: "189.40", daily_spr: 121, daily_sporh: 15.8, daily_tw_percentage: 74.0, operations: [{ route_name: "BASP-021" }] },
    { date: "2026-09-22", date_name: "Tue 22 Sep", amount: "248.90", daily_spr: 154, daily_sporh: 21.6, daily_tw_percentage: 92.9, operations: [{ route_name: "LCY-042" }] },
    { date: "2026-09-23", date_name: "Wed 23 Sep", amount: "0.00", operations: [] },
  ],
};
```

- [ ] **Step 9: Create `hooks/useCurrentPerformance.ts`**

```ts
"use client";

import { api } from "@/lib/mock-client";
import { useMockQuery } from "@/lib/useMockQuery";
import { CURRENT_PERFORMANCE_FIXTURE } from "@/lib/mocks/daily-ops/current-performance-fixtures";
import { ENDPOINT } from "../constants";
import { mapAverages, mapMonthOverviewToDayData, visibleRows, type MonthOverviewDTO } from "../utils/currentPerformanceMappers";
import type { DayData, MonthlyAverages } from "../types";

const EMPTY_DTO: MonthOverviewDTO = {
  currentMonth: { name: "", daysWorked: 0, totalAmount: "0.00", averagePerDay: "0.00" },
  dailyEarnings: [],
};

export function useCurrentPerformance(year: number, month: number) {
  const query = useMockQuery<MonthOverviewDTO>(["current-performance", year, month], () =>
    api.get<MonthOverviewDTO>(ENDPOINT, {
      data: CURRENT_PERFORMANCE_FIXTURE,
      empty: EMPTY_DTO,
      errorMessage: "Could not load performance data.",
    }),
  );

  const dto = query.data ?? EMPTY_DTO;
  const rows = visibleRows(mapMonthOverviewToDayData(dto, year, month));
  const averages: MonthlyAverages = mapAverages(dto);

  return { ...query, rows, averages };
}
```

- [ ] **Step 10: Create `components/MonthCarousel.tsx`**

```tsx
"use client";

import { OptionSwitcher } from "@/components/ui";
import { MONTH_OPTIONS } from "../constants";

export function MonthCarousel({
  value,
  onChange,
}: {
  value: (typeof MONTH_OPTIONS)[number];
  onChange: (value: (typeof MONTH_OPTIONS)[number]) => void;
}) {
  return <OptionSwitcher options={MONTH_OPTIONS} value={value} onChange={onChange} label="Select month" />;
}
```

- [ ] **Step 11: Create `components/MonthlyAverages.tsx`**

```tsx
import { StatTile } from "@/components/ui";
import type { MonthlyAverages as MonthlyAveragesModel } from "../types";

export function MonthlyAverages({ averages }: { averages: MonthlyAveragesModel }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
      <StatTile label="TW" value={averages.avgTw} tone="info" />
      <StatTile label="SPR" value={averages.avgSpr} tone="neutral" />
      <StatTile label="SPOR-H" value={averages.avgSporH} tone="info" />
    </div>
  );
}
```

- [ ] **Step 12: Create `components/DailyBreakdownTable.tsx`**

```tsx
import { DataTable, EmptyState, TONE_VAR, type Column } from "@/components/ui";
import type { DayData } from "../types";

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function toneColor(tone: DayData["sporHTone"]): string | undefined {
  if (tone === "na") return undefined;
  if (tone === "positive") return TONE_VAR.good.fg;
  if (tone === "warning") return TONE_VAR.warning.fg;
  return TONE_VAR.critical.fg;
}

const COLUMNS: Column<DayData>[] = [
  {
    key: "day",
    header: "Day",
    render: (row) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-sm)" }}>
        {String(row.day).padStart(2, "0")}
        <span
          style={{
            font: "var(--type-badge)",
            padding: "2px var(--space-s)",
            borderRadius: "var(--radius-pill)",
            background: row.dayOfWeek === 6 ? "var(--secondary-container)" : "var(--container-highest)",
            color: row.dayOfWeek === 6 ? "var(--on-secondary-container)" : "var(--on-surface-variant)",
          }}
        >
          {WEEKDAY[row.dayOfWeek]}
        </span>
      </span>
    ),
  },
  { key: "route", header: "Route", render: (row) => row.route },
  { key: "stops", header: "Stops", numeric: true, render: (row) => String(row.stops) },
  {
    key: "sporH",
    header: "SPOR-H",
    numeric: true,
    render: (row) => <span style={{ color: toneColor(row.sporHTone) }}>{row.sporH}</span>,
  },
  {
    key: "tw",
    header: "TW",
    numeric: true,
    render: (row) => <span style={{ color: toneColor(row.twTone) }}>{row.tw}</span>,
  },
];

export function DailyBreakdownTable({ rows }: { rows: DayData[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No data available for this month"
        body="Pick a different month from the selector above, or check back once operations are logged."
      />
    );
  }
  return <DataTable columns={COLUMNS} rows={rows} getRowKey={(row) => String(row.day)} caption="Daily breakdown" />;
}
```

- [ ] **Step 13: Create `components/Content.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ErrorState, LoadingState, PageFooter, PageHeader, PageSection } from "@/components/ui";
import { DEFAULT_MONTH, DEFAULT_MONTH_OPTION, DEFAULT_YEAR, MONTH_OPTIONS } from "../constants";
import { useCurrentPerformance } from "../hooks/useCurrentPerformance";
import { MonthCarousel } from "./MonthCarousel";
import { MonthlyAverages } from "./MonthlyAverages";
import { DailyBreakdownTable } from "./DailyBreakdownTable";

const MONTH_INDEX: Record<(typeof MONTH_OPTIONS)[number], { year: number; month: number }> = {
  "OCT/25": { year: 2025, month: 10 },
  "NOV/25": { year: 2025, month: 11 },
  "DEC/25": { year: 2025, month: 12 },
  "JAN/26": { year: 2026, month: 1 },
  "FEB/26": { year: 2026, month: 2 },
  "MAR/26": { year: 2026, month: 3 },
  "APR/26": { year: 2026, month: 4 },
  "MAY/26": { year: 2026, month: 5 },
  "JUN/26": { year: 2026, month: 6 },
  "JUL/26": { year: 2026, month: 7 },
  "AUG/26": { year: 2026, month: 8 },
  "SEP/26": { year: 2026, month: 9 },
};

export function Content() {
  const [selectedMonth, setSelectedMonth] = useState<(typeof MONTH_OPTIONS)[number]>(DEFAULT_MONTH_OPTION);
  const { year, month } = MONTH_INDEX[selectedMonth] ?? { year: DEFAULT_YEAR, month: DEFAULT_MONTH };
  const { rows, averages, isLoading, isError, error, refetch } = useCurrentPerformance(year, month);

  return (
    <>
      <PageHeader title="Current Performance" subtitle="Monthly averages and a daily breakdown of stops, SPOR-H and TW." />

      <MonthCarousel value={selectedMonth} onChange={setSelectedMonth} />

      {isLoading ? <LoadingState rows={3} /> : null}
      {isError ? <ErrorState body={error?.message ?? "Unknown error."} onRetry={refetch} /> : null}

      {!isLoading && !isError ? (
        <>
          <PageSection label="Monthly Averages">
            <MonthlyAverages averages={averages} />
          </PageSection>
          <PageSection label="Daily Breakdown">
            <DailyBreakdownTable rows={rows} />
          </PageSection>
        </>
      ) : null}

      <PageFooter left={`${rows.length} days shown`} right="Simulated data — prototype" />
    </>
  );
}
```

- [ ] **Step 14: Create `page.tsx` and `loading.tsx`**

`app/(private)/daily-ops/current-performance/page.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { Content } from "./components/Content";

export default function CurrentPerformancePage() {
  return (
    <NavbarWrapper title="CURRENT PERFORMANCE" active="daily-ops">
      <Content />
    </NavbarWrapper>
  );
}
```

`app/(private)/daily-ops/current-performance/loading.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { LoadingState } from "@/components/ui";

export default function CurrentPerformanceLoading() {
  return (
    <NavbarWrapper title="CURRENT PERFORMANCE" active="daily-ops">
      <LoadingState rows={4} />
    </NavbarWrapper>
  );
}
```

- [ ] **Step 15: Run the full gate**

Run: `npm run typecheck && npm run check:tokens && npm run lint && npm run test && npm run build`
Expected: all succeed.

- [ ] **Step 16: Manual checkpoint (do this before continuing to Task 5)**

Run: `npm run dev`, open `http://localhost:3000/daily-ops/current-performance`. Confirm:
- Monthly average tiles show TW 92.4%, SPR 148, SPOR-H 21.3.
- The daily breakdown table shows the most recent day (23 Sep) first, and correctly skips 06/09, 13/09, 20/09 and 27/09 (Sundays).
- `http://localhost:3000/daily-ops/current-performance?mock=empty` shows the "No data available for this month" empty state.
- `http://localhost:3000/daily-ops/current-performance?mock=error` shows the error state with a working "Try again" button.
- `http://localhost:3000/daily-ops/current-performance?mock=slow` visibly shows the loading skeleton for ~2.5s.

This is the pattern every subsequent page follows — if anything about it needs adjusting (spacing, table density, how tones read), fix it now rather than 5 more times.

- [ ] **Step 17: Commit**

```bash
git add "app/(private)/daily-ops/current-performance/" "lib/mocks/daily-ops/current-performance-fixtures.ts"
git commit -m "feat: add Current Performance page as the Daily Ops pattern pilot

Rebuilds the real current-performance screen (monthly averages + daily
breakdown table) on the Industrial Terminal design system, mock data
only. Establishes the page shape every subsequent Daily Ops page follows."
```

---

### Task 4: `logixsphere-page` project skill

The `logixsphere-page-kit` documents this exact rule across 8 files (`docs/00-COMECE-AQUI.md` … `docs/07-INTEGRACAO.md`) and references a Claude Code skill named `logixsphere-page` that would read them — but no such skill file actually exists anywhere in the kit (confirmed during research: no `SKILL.md`, no `.claude/skills/` directory). This task writes it for real, as a single self-contained project skill (not 8 separate docs to keep in sync), so that any future request to build or import a LogixSphere page in this repo follows the pattern established in Tasks 1–3 automatically.

**Files:**
- Create: `.claude/skills/logixsphere-page/SKILL.md`

**Interfaces:**
- Consumes: nothing (documentation only).
- Produces: an invokable skill (`/logixsphere-page` or auto-triggered on matching requests) that future sessions use — no other task in this plan depends on it.

- [ ] **Step 1: Create `.claude/skills/logixsphere-page/SKILL.md`**

```markdown
---
name: logixsphere-page
description: Use when asked to create, import, or rebuild a LogixSphere page/screen as a mock-data prototype in this repository — enforces the Industrial Terminal design system (tokens, components/ui, mock-client) instead of ad hoc styling.
---

# Building a LogixSphere page

Every page built under this rule follows the pattern established by
`app/(private)/daily-ops/current-performance/` (the reference implementation —
copy its shape, don't invent a new one) and is governed by
`docs/superpowers/specs/2026-09-23-daily-ops-design-system-migration-design.md`.

## The six rules

1. **No literal value.** Every color, font, spacing, radius or shadow comes
   from `var(--token)` in `styles/tokens.css`. Enforced by `npm run check:tokens`.
2. **No `fetch` in a `.tsx` file.** Data lives in a `hooks/useX.ts` that calls
   `lib/mock-client.ts`'s `api.get`/`api.post`, which resolves a fixture from
   `lib/mocks/daily-ops/*.ts` (or another feature folder under `lib/mocks/`).
3. **Search `components/ui/` before creating a component.** The library
   (`Button`, `DataTable`, `EntityCard`, `KpiCard`/`KpiRow`, `StatTile`,
   `StatusPill`, `ProgressBar`, `SectionBox`, `CollapsibleSection`,
   `OptionSwitcher`, `SearchField`, `PageHeader`/`PageContent`/`PageSection`/`PageFooter`,
   `LoadingState`/`EmptyState`/`ErrorState`/`MissingData`, `Toast`) covers most
   screens. Only add a new one when nothing there fits, and put it there —
   not inside the page's own folder — so the next page can reuse it.
4. **Copy the reference, don't invent.** `app/(private)/daily-ops/current-performance/`
   is the page with the most complete paper trail (spec + plan + real-source
   research) in this repository. When in doubt about folder shape, mapper
   split, or how to wire the 4 states, open that page, not a blank file.
5. **Critical state is never color alone.** Color **+** label **+** icon —
   use `StatusPill` with a `tone`, never a bare colored `<span>`.
6. **Missing data is marked, never invented.** If a field's real source or
   shape is unknown, render `<MissingData question="..." />` from
   `components/ui`, or — for a whole unavailable action (PDF export, bulk
   submit, anything backend-only) — a disabled control with a short "not
   available in this prototype" note, matching how Route Balance and the
   Daily Ops pages already handle this.

## Where things live

```
styles/tokens.css            the only file allowed to declare a literal value
styles/fonts.css             @font-face, reusing public/route-balance/assets/
components/ui/               the component library — index.ts is the barrel
lib/mock-client.ts           api.get / api.post — same shape as a future lib/api-client.ts
lib/useMockQuery.ts          same return shape as TanStack Query's useQuery
lib/case.ts                  camelizeKeys — snake_case fixtures become camelCase at read time
lib/mocks/<feature>/         fixtures, written in snake_case
scripts/check-tokens.mjs     the lint gate — add your new page's folder to GOVERNED_PATHS
app/(private)/<feature>/     one folder per feature area (e.g. daily-ops), with:
  page.tsx                     hub/index, if the feature has more than one screen
  <slug>/
    page.tsx                   "use client" orchestrator only — no business logic
    loading.tsx                 NavbarWrapper + <LoadingState />
    types.ts                    the SCREEN model, not the backend DTO
    constants.ts                 real endpoint path (as a comment) + fixed screen values
    components/Content.tsx      composes the page from components/ui + page-local components
    hooks/use<Slug>.ts          useMockQuery + the mapper
    utils/<slug>Mappers.ts      DTO (camelCase, matches real source) -> screen model
```

## Process for deriving content

- **If real source code exists** (as it did for the 6 Daily Ops pages, read
  from `logix-sphere-frontend-nextjs-main`): read it. Extract real field
  names, real component props, real table columns, real thresholds. Do not
  ask the user questions the source code already answers.
- **If no real source exists**: ask the user directly — what does the screen
  show, what are the states, what's the data shape. Do not invent field
  names or business rules to fill a gap.
- **If the logic is backend-only** (a validation rule, a rate-resolution
  formula, a role gate that lives server-side): note it in a code comment,
  bake a plausible *result* into the fixture instead of the *formula*, and
  never reimplement the formula client-side.

## Before calling a page done

- [ ] `npm run typecheck` passes.
- [ ] `npm run check:tokens` passes — and the page's folder is listed in
      `scripts/check-tokens.mjs`'s `GOVERNED_PATHS`.
- [ ] `npm run lint` and `npm run test` pass.
- [ ] `npm run build` succeeds.
- [ ] All 4 states are reachable: default, `?mock=empty`, `?mock=error`, `?mock=slow`.
- [ ] No backend/database call anywhere — everything resolves through `lib/mock-client.ts`.
- [ ] The page is reachable from the app (a hub card, a sidebar entry, or a
      link from an existing page) — an unreachable route isn't done.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/logixsphere-page/SKILL.md
git commit -m "docs: add the logixsphere-page skill

The page-kit referenced this skill in its own docs but never actually
wrote it. This makes the design-system rule executable for future
LogixSphere page requests in this repository, not just the 6 built here."
```

---

### Task 5: `current-month` page

Real source: `app/(private)/current-month/`. Driver-facing monthly earnings screen: a month summary card, an info grid (days worked / average daily), a clickable earnings list, and a day-details drill-down (route header, metrics, work hours, stops, payment breakdown, notes). Reuses the same September 2026 narrative as Task 3 (same driver, same month) for internal consistency across the module, though each page's fixture is independent.

**Files:**
- Create: `app/(private)/daily-ops/current-month/types.ts`
- Create: `app/(private)/daily-ops/current-month/constants.ts`
- Create: `app/(private)/daily-ops/current-month/utils/currentMonthMappers.ts`
- Create: `app/(private)/daily-ops/current-month/utils/currentMonthMappers.test.ts`
- Create: `app/(private)/daily-ops/current-month/hooks/useCurrentMonth.ts`
- Create: `app/(private)/daily-ops/current-month/hooks/useDayDetails.ts`
- Create: `app/(private)/daily-ops/current-month/components/SummaryCard.tsx`
- Create: `app/(private)/daily-ops/current-month/components/EarningsList.tsx`
- Create: `app/(private)/daily-ops/current-month/components/DayDetails.tsx`
- Create: `app/(private)/daily-ops/current-month/components/Content.tsx`
- Create: `app/(private)/daily-ops/current-month/page.tsx`
- Create: `app/(private)/daily-ops/current-month/loading.tsx`
- Create: `lib/mocks/daily-ops/current-month-fixtures.ts`

**Interfaces:**
- Consumes: `components/ui` (`StatTile`, `SectionBox`, `EmptyState`, `LoadingState`, `ErrorState`, `PageHeader`, `PageFooter`, `PageSection`, `Button`) from Task 1.
- Produces: route `/daily-ops/current-month`. `formatGBP(amount: number): string` (a small local helper, since this is the one page in the module that formats currency — no other page needs it, so it isn't promoted to `components/ui`).

- [ ] **Step 1: Create `types.ts`**

```ts
export interface MonthSummary {
  name: string;
  daysWorked: number;
  totalAmount: number;
  averagePerDay: number;
}

export interface EarningsRow {
  date: string;
  dateName: string;
  amount: number;
  vehiclePlate?: string;
  vehicleModel?: string;
}

export interface PaidStops {
  pu: number;
  ok: number;
  hn: number;
  pd: number | null;
}

export interface DayOperation {
  operationId: number;
  routeName: string;
  isVerified: boolean;
  totalStops: number;
  avgHourlyRate: number;
  totalAmount: number;
  workedHours: number | null;
  departTime: string | null;
  arriveTime: string | null;
  breakMinutes: number;
  paidStops: PaidStops | null;
  baseRate: number;
  adhocTotal: number;
  note: string | null;
}
```

- [ ] **Step 2: Create `constants.ts`**

```ts
/**
 * Real endpoints this page will call once integrated:
 *   GET /bff/daily-overview/list/{userId}/{month+1}/{year}   (month summary + earnings list)
 *   GET /bff/daily-overview/{userId}/{year}/{month}/{day}    (day-details drill-down)
 */
export const MONTH_ENDPOINT = "/bff/daily-overview/list";
export const DAY_ENDPOINT = "/bff/daily-overview";

export const YEAR = 2026;
export const MONTH = 9; // September — the one month with fixture data in this prototype.
```

- [ ] **Step 3: Create `utils/currentMonthMappers.ts`**

```ts
import type { DayOperation, EarningsRow, MonthSummary, PaidStops } from "../types";

export interface MonthOverviewDTO {
  currentMonth: { name: string; daysWorked: number; total: number; averagePerDay: number };
  dailyEarnings: Array<{
    date: string;
    dateName: string;
    amount: string;
    operations?: Array<{ vehicle?: { vehicleModel: string; vehicleRegistrationPlate: string } }>;
  }>;
}

export interface DailyOverviewDTO {
  operationId: number;
  routeName: string;
  isSpms: boolean;
  totalStops: number;
  amountTotal: string;
  workedHours: string | null;
  departTime: string | null;
  arriveTime: string | null;
  breakMinutes: number;
  paidStops?: PaidStops;
  rate: number;
  adhocSort: number;
  extra: number;
  routeSort: number;
  note?: string;
}

export function mapMonthSummary(dto: MonthOverviewDTO): MonthSummary {
  return {
    name: dto.currentMonth.name,
    daysWorked: dto.currentMonth.daysWorked,
    totalAmount: dto.currentMonth.total,
    averagePerDay: dto.currentMonth.averagePerDay,
  };
}

export function mapEarningsRows(dto: MonthOverviewDTO): EarningsRow[] {
  return dto.dailyEarnings
    .filter((entry) => parseFloat(entry.amount) > 0)
    .map((entry) => ({
      date: entry.date,
      dateName: entry.dateName,
      amount: parseFloat(entry.amount),
      vehiclePlate: entry.operations?.[0]?.vehicle?.vehicleRegistrationPlate,
      vehicleModel: entry.operations?.[0]?.vehicle?.vehicleModel,
    }));
}

/** avgHourlyRate = 0 when there are no worked hours — exact real-page rule, avoids a divide-by-zero display. */
export function mapDayOperation(dto: DailyOverviewDTO): DayOperation {
  const workedHours = dto.workedHours !== null ? parseFloat(dto.workedHours) : null;
  const totalAmount = parseFloat(dto.amountTotal);
  return {
    operationId: dto.operationId,
    routeName: dto.routeName,
    isVerified: dto.isSpms,
    totalStops: dto.totalStops,
    avgHourlyRate: workedHours ? totalAmount / workedHours : 0,
    totalAmount,
    workedHours,
    departTime: dto.departTime,
    arriveTime: dto.arriveTime,
    breakMinutes: dto.breakMinutes,
    paidStops: dto.paidStops ?? null,
    baseRate: dto.rate,
    adhocTotal: dto.adhocSort + dto.extra + dto.routeSort,
    note: dto.note ?? null,
  };
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}

export function formatTime(value: string | null): string {
  if (!value) return "--:--";
  return value.slice(0, 5);
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
```

- [ ] **Step 4: Write the mapper test**

Create `app/(private)/daily-ops/current-month/utils/currentMonthMappers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  formatGBP,
  formatMinutesToTime,
  formatTime,
  mapDayOperation,
  mapEarningsRows,
  mapMonthSummary,
  type DailyOverviewDTO,
  type MonthOverviewDTO,
} from "./currentMonthMappers";

const MONTH_DTO: MonthOverviewDTO = {
  currentMonth: { name: "September", daysWorked: 11, total: 2485.55, averagePerDay: 225.96 },
  dailyEarnings: [
    { date: "2026-09-01", dateName: "Tue 01 Sep", amount: "245.10", operations: [{ vehicle: { vehicleModel: "Ford Transit", vehicleRegistrationPlate: "LK19 XYZ" } }] },
    { date: "2026-09-05", dateName: "Sat 05 Sep", amount: "0.00" },
  ],
};

describe("mapMonthSummary", () => {
  it("maps the month totals directly", () => {
    expect(mapMonthSummary(MONTH_DTO)).toEqual({ name: "September", daysWorked: 11, totalAmount: 2485.55, averagePerDay: 225.96 });
  });
});

describe("mapEarningsRows", () => {
  it("drops zero-amount (day off) rows and carries the vehicle from the first operation", () => {
    const rows = mapEarningsRows(MONTH_DTO);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ date: "2026-09-01", dateName: "Tue 01 Sep", amount: 245.1, vehiclePlate: "LK19 XYZ", vehicleModel: "Ford Transit" });
  });
});

describe("mapDayOperation", () => {
  const DTO: DailyOverviewDTO = {
    operationId: 5501, routeName: "LCY-042", isSpms: true, totalStops: 63,
    amountTotal: "245.10", workedHours: "8.25", departTime: "06:15:00", arriveTime: "14:40:00",
    breakMinutes: 30, paidStops: { pu: 12, ok: 45, hn: 2, pd: 0 }, rate: 4.2, adhocSort: 0, extra: 12.5, routeSort: 5,
  };

  it("computes avgHourlyRate from amount and worked hours", () => {
    expect(mapDayOperation(DTO).avgHourlyRate).toBeCloseTo(245.1 / 8.25, 5);
  });

  it("returns avgHourlyRate 0 when workedHours is null, instead of dividing by zero", () => {
    expect(mapDayOperation({ ...DTO, workedHours: null }).avgHourlyRate).toBe(0);
  });

  it("sums adhocSort + extra + routeSort into adhocTotal", () => {
    expect(mapDayOperation(DTO).adhocTotal).toBe(17.5);
  });
});

describe("formatGBP", () => {
  it("formats using en-GB currency style", () => {
    expect(formatGBP(245.1)).toBe("£245.10");
  });
});

describe("formatTime / formatMinutesToTime", () => {
  it("truncates a time string to HH:MM", () => {
    expect(formatTime("06:15:00")).toBe("06:15");
  });
  it("shows --:-- for a null time", () => {
    expect(formatTime(null)).toBe("--:--");
  });
  it("converts break minutes to HH:MM", () => {
    expect(formatMinutesToTime(30)).toBe("00:30");
    expect(formatMinutesToTime(90)).toBe("01:30");
  });
});
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- currentMonthMappers`
Expected: PASS (9 tests).

- [ ] **Step 6: Create the fixture `lib/mocks/daily-ops/current-month-fixtures.ts`**

```ts
export const CURRENT_MONTH_FIXTURE = {
  current_month: { name: "September", days_worked: 11, total: 2485.55, average_per_day: 225.96 },
  daily_earnings: [
    { date: "2026-09-01", date_name: "Tue 01 Sep", amount: "245.10", operations: [{ vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" } }] },
    { date: "2026-09-02", date_name: "Wed 02 Sep", amount: "198.00", operations: [{ vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" } }] },
    { date: "2026-09-04", date_name: "Fri 04 Sep", amount: "231.40", operations: [{ vehicle: { vehicle_model: "Mercedes Sprinter", vehicle_registration_plate: "MS20 ABC" } }] },
    { date: "2026-09-05", date_name: "Sat 05 Sep", amount: "0.00" },
    { date: "2026-09-08", date_name: "Tue 08 Sep", amount: "260.75", operations: [{ vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" } }] },
    { date: "2026-09-09", date_name: "Wed 09 Sep", amount: "204.20", operations: [{ vehicle: { vehicle_model: "Iveco Daily", vehicle_registration_plate: "IV21 LSE" } }] },
    { date: "2026-09-10", date_name: "Thu 10 Sep", amount: "212.60", operations: [{ vehicle: { vehicle_model: "Iveco Daily", vehicle_registration_plate: "IV21 LSE" } }] },
    { date: "2026-09-11", date_name: "Fri 11 Sep", amount: "0.00" },
    { date: "2026-09-15", date_name: "Tue 15 Sep", amount: "255.00", operations: [{ vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" } }] },
    { date: "2026-09-16", date_name: "Wed 16 Sep", amount: "198.90", operations: [{ vehicle: { vehicle_model: "Mercedes Sprinter", vehicle_registration_plate: "MS20 ABC" } }] },
    { date: "2026-09-17", date_name: "Thu 17 Sep", amount: "241.30", operations: [{ vehicle: { vehicle_model: "Renault Master", vehicle_registration_plate: "RM22 BSP" } }] },
    { date: "2026-09-18", date_name: "Fri 18 Sep", amount: "189.40", operations: [{ vehicle: { vehicle_model: "Renault Master", vehicle_registration_plate: "RM22 BSP" } }] },
    { date: "2026-09-22", date_name: "Tue 22 Sep", amount: "248.90", operations: [{ vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" } }] },
    { date: "2026-09-23", date_name: "Wed 23 Sep", amount: "0.00" },
  ],
};

/** Day-details fixture, keyed by ISO date. Only the 11 worked days have entries. */
export const CURRENT_MONTH_DAY_DETAILS_FIXTURE: Record<string, unknown[]> = {
  "2026-09-01": [{ operation_id: 5501, route_name: "LCY-042", is_spms: true, total_stops: 63, amount_total: "245.10", worked_hours: "8.25", depart_time: "06:15:00", arrive_time: "14:40:00", break_minutes: 30, paid_stops: { pu: 12, ok: 45, hn: 2, pd: 0 }, rate: 4.2, adhoc_sort: 0, extra: 12.5, route_sort: 5 }],
  "2026-09-02": [{ operation_id: 5502, route_name: "LCY-042", is_spms: true, total_stops: 52, amount_total: "198.00", worked_hours: "7.75", depart_time: "06:20:00", arrive_time: "14:05:00", break_minutes: 30, paid_stops: { pu: 9, ok: 38, hn: 1, pd: 0 }, rate: 4.0, adhoc_sort: 0, extra: 0, route_sort: 0 }],
  "2026-09-04": [{ operation_id: 5504, route_name: "MSE-118", is_spms: true, total_stops: 58, amount_total: "231.40", worked_hours: "8.0", depart_time: "06:10:00", arrive_time: "14:10:00", break_minutes: 30, paid_stops: { pu: 10, ok: 42, hn: 2, pd: null }, rate: 4.1, adhoc_sort: 0, extra: 8.4, route_sort: 0, note: "Traffic delay on the A40 outbound." }],
  "2026-09-08": [{ operation_id: 5508, route_name: "LCY-042", is_spms: true, total_stops: 67, amount_total: "260.75", worked_hours: "8.5", depart_time: "06:05:00", arrive_time: "14:35:00", break_minutes: 30, paid_stops: { pu: 14, ok: 48, hn: 2, pd: 0 }, rate: 4.2, adhoc_sort: 0, extra: 12.35, route_sort: 0 }],
  "2026-09-09": [{ operation_id: 5509, route_name: "LSE-076", is_spms: false, total_stops: 49, amount_total: "204.20", worked_hours: "7.5", depart_time: "06:30:00", arrive_time: "14:00:00", break_minutes: 30, paid_stops: { pu: 8, ok: 36, hn: 3, pd: 0 }, rate: 4.0, adhoc_sort: 0, extra: 6.6, route_sort: 0 }],
  "2026-09-10": [{ operation_id: 5510, route_name: "LSE-076", is_spms: true, total_stops: 51, amount_total: "212.60", worked_hours: "7.75", depart_time: "06:25:00", arrive_time: "14:10:00", break_minutes: 30, paid_stops: { pu: 9, ok: 38, hn: 2, pd: 0 }, rate: 4.05, adhoc_sort: 0, extra: 5.9, route_sort: 0 }],
  "2026-09-15": [{ operation_id: 5515, route_name: "LCY-042", is_spms: true, total_stops: 65, amount_total: "255.00", worked_hours: "8.25", depart_time: "06:10:00", arrive_time: "14:30:00", break_minutes: 30, paid_stops: { pu: 13, ok: 46, hn: 1, pd: 0 }, rate: 4.2, adhoc_sort: 0, extra: 11.7, route_sort: 0 }],
  "2026-09-16": [{ operation_id: 5516, route_name: "MSE-118", is_spms: false, total_stops: 50, amount_total: "198.90", worked_hours: "7.6", depart_time: "06:20:00", arrive_time: "14:00:00", break_minutes: 30, paid_stops: { pu: 8, ok: 37, hn: 3, pd: null }, rate: 4.0, adhoc_sort: 0, extra: 5.3, route_sort: 0, note: "One dispatch failure — left with the operations team." }],
  "2026-09-17": [{ operation_id: 5517, route_name: "BASP-021", is_spms: true, total_stops: 60, amount_total: "241.30", worked_hours: "8.0", depart_time: "06:15:00", arrive_time: "14:15:00", break_minutes: 30, paid_stops: { pu: 11, ok: 44, hn: 2, pd: 0 }, rate: 4.15, adhoc_sort: 0, extra: 9.5, route_sort: 0 }],
  "2026-09-18": [{ operation_id: 5518, route_name: "BASP-021", is_spms: false, total_stops: 47, amount_total: "189.40", worked_hours: "7.4", depart_time: "06:35:00", arrive_time: "14:00:00", break_minutes: 30, paid_stops: { pu: 7, ok: 35, hn: 3, pd: null }, rate: 4.0, adhoc_sort: 0, extra: 3.4, route_sort: 0 }],
  "2026-09-22": [{ operation_id: 5522, route_name: "LCY-042", is_spms: true, total_stops: 64, amount_total: "248.90", worked_hours: "8.1", depart_time: "06:12:00", arrive_time: "14:22:00", break_minutes: 30, paid_stops: { pu: 12, ok: 47, hn: 1, pd: 0 }, rate: 4.2, adhoc_sort: 0, extra: 10.7, route_sort: 0 }],
};
```

- [ ] **Step 7: Create `hooks/useCurrentMonth.ts`**

```ts
"use client";

import { api } from "@/lib/mock-client";
import { useMockQuery } from "@/lib/useMockQuery";
import { CURRENT_MONTH_FIXTURE } from "@/lib/mocks/daily-ops/current-month-fixtures";
import { MONTH_ENDPOINT, MONTH, YEAR } from "../constants";
import { mapEarningsRows, mapMonthSummary, type MonthOverviewDTO } from "../utils/currentMonthMappers";

const EMPTY_DTO: MonthOverviewDTO = { currentMonth: { name: "", daysWorked: 0, total: 0, averagePerDay: 0 }, dailyEarnings: [] };

export function useCurrentMonth() {
  const query = useMockQuery<MonthOverviewDTO>(["current-month", YEAR, MONTH], () =>
    api.get<MonthOverviewDTO>(MONTH_ENDPOINT, {
      data: CURRENT_MONTH_FIXTURE,
      empty: EMPTY_DTO,
      errorMessage: "Could not load this month's earnings.",
    }),
  );

  const dto = query.data ?? EMPTY_DTO;
  return { ...query, summary: mapMonthSummary(dto), earnings: mapEarningsRows(dto) };
}
```

- [ ] **Step 8: Create `hooks/useDayDetails.ts`**

```ts
"use client";

import { useState } from "react";
import { api } from "@/lib/mock-client";
import { CURRENT_MONTH_DAY_DETAILS_FIXTURE } from "@/lib/mocks/daily-ops/current-month-fixtures";
import { DAY_ENDPOINT } from "../constants";
import { mapDayOperation, type DailyOverviewDTO } from "../utils/currentMonthMappers";
import type { DayOperation } from "../types";

export function useDayDetails() {
  const [selectedDate, setSelectedDate] = useState<string>();
  const [operations, setOperations] = useState<DayOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function open(date: string) {
    setSelectedDate(date);
    setLoading(true);
    setError(undefined);
    try {
      const raw = CURRENT_MONTH_DAY_DETAILS_FIXTURE[date] ?? [];
      const dtos = await api.get<DailyOverviewDTO[]>(DAY_ENDPOINT, { data: raw, empty: [] });
      setOperations(dtos.map(mapDayOperation));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this day.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setSelectedDate(undefined);
    setOperations([]);
  }

  return { selectedDate, operations, loading, error, open, close };
}
```

- [ ] **Step 9: Create `components/SummaryCard.tsx`**

```tsx
import { formatGBP } from "../utils/currentMonthMappers";
import type { MonthSummary } from "../types";

export function SummaryCard({ summary }: { summary: MonthSummary }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        padding: "var(--space-xl)",
        background: "var(--container-low)",
        outline: "var(--stroke) solid var(--outline-variant)",
        outlineOffset: "-1px",
      }}
    >
      <span style={{ font: "var(--type-section-label)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
        {summary.name} Earnings
      </span>
      <span style={{ font: "var(--type-display-lg)", color: "var(--on-surface)", fontVariantNumeric: "tabular-nums" }}>
        {formatGBP(summary.totalAmount)}
      </span>
      <div style={{ display: "flex", gap: "var(--space-xl)" }}>
        <span style={{ font: "var(--type-metric-value)", color: "var(--on-surface-variant)" }}>
          Days Worked: <strong style={{ color: "var(--on-surface)" }}>{summary.daysWorked}</strong>
        </span>
        <span style={{ font: "var(--type-metric-value)", color: "var(--state-good)" }}>
          Avg. Daily: <strong>{formatGBP(summary.averagePerDay)}</strong>
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Create `components/EarningsList.tsx`**

```tsx
import { CollapsibleSection, EmptyState } from "@/components/ui";
import { formatGBP } from "../utils/currentMonthMappers";
import type { EarningsRow } from "../types";

export function EarningsList({ earnings, onSelect }: { earnings: EarningsRow[]; onSelect: (date: string) => void }) {
  if (earnings.length === 0) {
    return <EmptyState title="No earnings this month" body="Earnings appear here once operations are logged for the selected month." />;
  }
  return (
    <CollapsibleSection label="Daily Earnings Breakdown">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stroke)" }}>
        {earnings.map((row) => (
          <button
            key={row.date}
            type="button"
            onClick={() => onSelect(row.date)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "var(--space-md) var(--space-lg)",
              background: "var(--container-lowest)",
              border: "none",
              borderBottom: "var(--stroke) solid var(--stroke-divider)",
              cursor: "pointer",
              textAlign: "left",
              font: "var(--type-ui-aux)",
              color: "var(--on-surface)",
            }}
          >
            <span>
              {row.dateName}
              {row.vehiclePlate ? (
                <span style={{ display: "block", font: "var(--type-timestamp)", color: "var(--text-quaternary)" }}>
                  {row.vehiclePlate} ({row.vehicleModel})
                </span>
              ) : null}
            </span>
            <span style={{ font: "var(--type-data-md)", fontVariantNumeric: "tabular-nums", color: "var(--state-good)" }}>
              {formatGBP(row.amount)}
            </span>
          </button>
        ))}
      </div>
    </CollapsibleSection>
  );
}
```

- [ ] **Step 11: Create `components/DayDetails.tsx`**

```tsx
import { Button, ErrorState, LoadingState, SectionBox, StatusPill } from "@/components/ui";
import { formatGBP, formatMinutesToTime, formatTime } from "../utils/currentMonthMappers";
import type { DayOperation } from "../types";

function OperationCard({ operation }: { operation: DayOperation }) {
  return (
    <SectionBox>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ font: "var(--type-driver-name)", color: "var(--on-surface)" }}>{operation.routeName}</span>
        {operation.isVerified ? <StatusPill tone="success">Verified</StatusPill> : <StatusPill tone="warning">Wait Verification</StatusPill>}
      </div>

      <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
        <div className="num" style={{ font: "var(--type-data-md)" }}>Total Stops: {operation.totalStops}</div>
        <div className="num" style={{ font: "var(--type-data-md)" }}>Avg H/R: {formatGBP(operation.avgHourlyRate)}</div>
        <div className="num" style={{ font: "var(--type-data-md)" }}>Total £: {formatGBP(operation.totalAmount)}</div>
      </div>

      {operation.workedHours ? (
        <div style={{ display: "flex", gap: "var(--space-lg)", flexWrap: "wrap" }}>
          <span>Departure Time: {formatTime(operation.departTime)}</span>
          <span>Break Time: {formatMinutesToTime(operation.breakMinutes)}</span>
          <span>Arrival Time: {formatTime(operation.arriveTime)}</span>
        </div>
      ) : null}

      {operation.paidStops ? (
        <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
          <span>PU: {operation.paidStops.pu}</span>
          <span>OK: {operation.paidStops.ok}</span>
          <span>HN: {operation.paidStops.hn}</span>
          <span>PD: {operation.paidStops.pd ?? "--:--"}</span>
        </div>
      ) : null}

      {operation.baseRate > 0 || operation.adhocTotal > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          <span style={{ font: "var(--type-section-label)", textTransform: "uppercase" }}>Payment Breakdown</span>
          <span>Base Rate: {formatGBP(operation.baseRate)}</span>
          {operation.adhocTotal > 0 ? <span>Ad-hoc: {formatGBP(operation.adhocTotal)}</span> : null}
        </div>
      ) : null}

      {operation.note ? (
        <div>
          <span style={{ font: "var(--type-section-label)", textTransform: "uppercase" }}>Notes</span>
          <p style={{ margin: 0 }}>{operation.note}</p>
        </div>
      ) : null}
    </SectionBox>
  );
}

export function DayDetails({
  dateLabel,
  operations,
  loading,
  error,
  onBack,
}: {
  dateLabel: string;
  operations: DayOperation[];
  loading: boolean;
  error?: string;
  onBack: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <Button variant="ghost" onClick={onBack}>&larr; Back to Month Overview</Button>
      <h2 style={{ margin: 0, font: "var(--type-headline-sm)" }}>{dateLabel}</h2>
      {loading ? <LoadingState rows={2} /> : null}
      {error ? <ErrorState body={error} /> : null}
      {!loading && !error ? operations.map((op) => <OperationCard key={op.operationId} operation={op} />) : null}
    </div>
  );
}
```

- [ ] **Step 12: Create `components/Content.tsx`**

```tsx
"use client";

import { ErrorState, LoadingState, PageFooter, PageHeader } from "@/components/ui";
import { useCurrentMonth } from "../hooks/useCurrentMonth";
import { useDayDetails } from "../hooks/useDayDetails";
import { SummaryCard } from "./SummaryCard";
import { EarningsList } from "./EarningsList";
import { DayDetails } from "./DayDetails";

export function Content() {
  const { summary, earnings, isLoading, isError, error, refetch } = useCurrentMonth();
  const dayDetails = useDayDetails();

  if (dayDetails.selectedDate) {
    const row = earnings.find((e) => e.date === dayDetails.selectedDate);
    return (
      <DayDetails
        dateLabel={row?.dateName ?? dayDetails.selectedDate}
        operations={dayDetails.operations}
        loading={dayDetails.loading}
        error={dayDetails.error}
        onBack={dayDetails.close}
      />
    );
  }

  return (
    <>
      <PageHeader title="Current Month" subtitle="Monthly earnings summary with a day-by-day drill-down." />

      {isLoading ? <LoadingState rows={3} /> : null}
      {isError ? <ErrorState body={error?.message ?? "Unknown error."} onRetry={refetch} /> : null}

      {!isLoading && !isError ? (
        <>
          <SummaryCard summary={summary} />
          <EarningsList earnings={earnings} onSelect={dayDetails.open} />
        </>
      ) : null}

      <PageFooter left={`${earnings.length} days with earnings`} right="Simulated data — prototype" />
    </>
  );
}
```

- [ ] **Step 13: Create `page.tsx` and `loading.tsx`**

`app/(private)/daily-ops/current-month/page.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { Content } from "./components/Content";

export default function CurrentMonthPage() {
  return (
    <NavbarWrapper title="CURRENT MONTH" active="daily-ops">
      <Content />
    </NavbarWrapper>
  );
}
```

`app/(private)/daily-ops/current-month/loading.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { LoadingState } from "@/components/ui";

export default function CurrentMonthLoading() {
  return (
    <NavbarWrapper title="CURRENT MONTH" active="daily-ops">
      <LoadingState rows={4} />
    </NavbarWrapper>
  );
}
```

- [ ] **Step 14: Run the full gate**

Run: `npm run typecheck && npm run check:tokens && npm run lint && npm run test && npm run build`
Expected: all succeed.

- [ ] **Step 15: Manual checkpoint**

Run: `npm run dev`, open `http://localhost:3000/daily-ops/current-month`. Confirm: summary card shows £2,485.55 total, 11 days worked, £225.96 average; clicking any earnings row opens its day-details with the right route and figures; "Back to Month Overview" returns to the list; `?mock=empty` and `?mock=error` both render correctly.

- [ ] **Step 16: Commit**

```bash
git add "app/(private)/daily-ops/current-month/" "lib/mocks/daily-ops/current-month-fixtures.ts"
git commit -m "feat: add Current Month page to Daily Ops

Rebuilds the real current-month screen (monthly summary + earnings list
+ day-details drill-down) on the Industrial Terminal design system."
```

---

### Task 6: `daily-performance-insight` page

Real source: `app/(private)/daily-performance-insight/`. Driver-facing daily insights: a month selector, a days carousel (all days of the month, not just worked ones), and — per selected day — one or more operation cards with a verified badge, vehicle info, a 4-metric row (SPR/SPOR-H/TW/AFD), a 3-point timeline, a failed-deliveries breakdown, and notes. Research found the real DTOs here are **already camelCase** (not snake_case like the other 5 pages) — fixtures below are written in snake_case anyway, matching this repo's own convention (`camelizeKeys` converts them), which is a deliberate, documented divergence from the literal real source (see spec §11, divergence 6).

**Files:**
- Create: `app/(private)/daily-ops/daily-performance-insight/types.ts`
- Create: `app/(private)/daily-ops/daily-performance-insight/constants.ts`
- Create: `app/(private)/daily-ops/daily-performance-insight/utils/insightMappers.ts`
- Create: `app/(private)/daily-ops/daily-performance-insight/utils/insightMappers.test.ts`
- Create: `app/(private)/daily-ops/daily-performance-insight/hooks/useDailyPerformanceInsight.ts`
- Create: `app/(private)/daily-ops/daily-performance-insight/components/DaysCarousel.tsx`
- Create: `app/(private)/daily-ops/daily-performance-insight/components/MetricsRow.tsx`
- Create: `app/(private)/daily-ops/daily-performance-insight/components/FailedDeliveriesCard.tsx`
- Create: `app/(private)/daily-ops/daily-performance-insight/components/OperationCard.tsx`
- Create: `app/(private)/daily-ops/daily-performance-insight/components/Content.tsx`
- Create: `app/(private)/daily-ops/daily-performance-insight/page.tsx`
- Create: `app/(private)/daily-ops/daily-performance-insight/loading.tsx`
- Create: `lib/mocks/daily-ops/daily-performance-insight-fixtures.ts`

**Interfaces:**
- Consumes: `components/ui` (`StatusPill`, `StatTile`, `SectionBox`, `EmptyState`, `LoadingState`, `ErrorState`, `PageHeader`, `PageFooter`, `TONE_VAR`) from Task 1.
- Produces: route `/daily-ops/daily-performance-insight`.

- [ ] **Step 1: Create `types.ts`**

```ts
export interface UnpaidStops {
  nr: number;
  fp: number;
  ba: number;
  nh: number;
  cm: number;
  ca: number;
}

export interface OperationInsight {
  operationId: number;
  routeName: string;
  isDayOff: boolean;
  isVerified: boolean;
  note: string | null;
  spr: number;
  sporH: string;
  tw: number; // 0-100
  afd: number;
  departTime: string | null;
  arriveTime: string | null;
  breakMinutes: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  unpaidStops: UnpaidStops;
  /** Derived: real page hides the metrics/timeline/failed-deliveries block for day-off
   *  entries and for routes whose name starts with B, S or O. */
  showMetrics: boolean;
}
```

- [ ] **Step 2: Create `constants.ts`**

```ts
/** Real endpoint: GET /bff/day-overview/{userId}/{date}?metrics=performance */
export const ENDPOINT = "/bff/day-overview";

export const YEAR = 2026;
export const MONTH = 9; // September 2026 — matches the rest of the Daily Ops module.
export const DEFAULT_DAY = 17;
```

- [ ] **Step 3: Create `utils/insightMappers.ts`**

```ts
import type { OperationInsight, UnpaidStops } from "../types";
import type { StatusTone } from "@/components/ui";

export interface OperationInsightDTO {
  operationId: number;
  routeName: string;
  isDayOff: boolean;
  isSpms: boolean;
  note: string | null;
  spr: number;
  sporh: number;
  twPercentage: number;
  afd: number;
  departTime: string | null;
  arriveTime: string | null;
  breakMinutes: number;
  vehicle?: { vehicleModel: string; vehicleRegistrationPlate: string };
  unpaidStops: UnpaidStops;
}

function showMetricsFor(routeName: string, isDayOff: boolean): boolean {
  return !isDayOff && !/^[BSO]/i.test(routeName);
}

export function mapOperationInsight(dto: OperationInsightDTO): OperationInsight {
  return {
    operationId: dto.operationId,
    routeName: dto.routeName,
    isDayOff: dto.isDayOff,
    isVerified: dto.isSpms,
    note: dto.note,
    spr: Math.round(dto.spr),
    sporH: dto.sporh.toFixed(2),
    tw: dto.twPercentage,
    afd: dto.afd,
    departTime: dto.departTime,
    arriveTime: dto.arriveTime,
    breakMinutes: dto.breakMinutes,
    vehiclePlate: dto.vehicle?.vehicleRegistrationPlate,
    vehicleModel: dto.vehicle?.vehicleModel,
    unpaidStops: dto.unpaidStops,
    showMetrics: showMetricsFor(dto.routeName, dto.isDayOff),
  };
}

/**
 * Exact TW bands from the real page's getTWColorClass:
 *   90-100 success · 80-<90 warning · 70-<80 orange · 60-<70 neutral · <60 danger
 */
export function twTone(tw: number): StatusTone {
  if (tw >= 90) return "good";
  if (tw >= 80) return "warning";
  if (tw >= 70) return "alert";
  if (tw >= 60) return "neutral";
  return "critical";
}

export function formatTime(value: string | null): string {
  if (!value) return "--:--";
  return value.slice(0, 5);
}

/** Real page hardcodes this tile to 0 — there is no `shp` field on UnpaidStops in the real source. */
export const SHIP_FAILURE_PLACEHOLDER = 0;
```

- [ ] **Step 4: Write the mapper test**

Create `app/(private)/daily-ops/daily-performance-insight/utils/insightMappers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { formatTime, mapOperationInsight, twTone, type OperationInsightDTO } from "./insightMappers";

const DTO: OperationInsightDTO = {
  operationId: 48213, routeName: "LCY-14", isDayOff: false, isSpms: false,
  note: "Traffic delay on A40", spr: 63, sporh: 7.85, twPercentage: 92,
  afd: 5, departTime: "06:15:00", arriveTime: "16:40:00", breakMinutes: 32,
  vehicle: { vehicleModel: "Ford Transit", vehicleRegistrationPlate: "LX19 BAX" },
  unpaidStops: { nr: 1, fp: 0, ba: 1, nh: 1, cm: 0, ca: 0 },
};

describe("mapOperationInsight", () => {
  it("rounds spr and formats sporH to 2 decimals", () => {
    const insight = mapOperationInsight(DTO);
    expect(insight.spr).toBe(63);
    expect(insight.sporH).toBe("7.85");
  });

  it("shows metrics for a normal route on a working day", () => {
    expect(mapOperationInsight(DTO).showMetrics).toBe(true);
  });

  it("hides metrics for a day-off entry", () => {
    expect(mapOperationInsight({ ...DTO, isDayOff: true, routeName: "DAY OFF" }).showMetrics).toBe(false);
  });

  it("hides metrics for routes starting with B, S or O", () => {
    expect(mapOperationInsight({ ...DTO, routeName: "BASP-021" }).showMetrics).toBe(false);
    expect(mapOperationInsight({ ...DTO, routeName: "SPMS-3" }).showMetrics).toBe(false);
    expect(mapOperationInsight({ ...DTO, routeName: "OFF-9" }).showMetrics).toBe(false);
  });
});

describe("twTone", () => {
  it("applies the exact 5-band scale", () => {
    expect(twTone(95)).toBe("good");
    expect(twTone(85)).toBe("warning");
    expect(twTone(75)).toBe("alert");
    expect(twTone(65)).toBe("neutral");
    expect(twTone(50)).toBe("critical");
  });
});

describe("formatTime", () => {
  it("truncates to HH:MM and falls back to --:-- for null", () => {
    expect(formatTime("06:15:00")).toBe("06:15");
    expect(formatTime(null)).toBe("--:--");
  });
});
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- insightMappers`
Expected: PASS (6 tests).

- [ ] **Step 6: Create the fixture `lib/mocks/daily-ops/daily-performance-insight-fixtures.ts`**

```ts
/** Keyed by day-of-month (September 2026). Days off use a synthetic entry, same as the real page. */
export const DAILY_PERFORMANCE_INSIGHT_FIXTURE: Record<number, unknown[]> = {
  1: [{ operation_id: 90001, route_name: "LCY-042", is_day_off: false, is_spms: true, note: null, spr: 156, sporh: 22.1, tw_percentage: 94.0, afd: 2, depart_time: "06:15:00", arrive_time: "14:40:00", break_minutes: 30, vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" }, unpaid_stops: { nr: 1, fp: 0, ba: 0, nh: 1, cm: 0, ca: 0 } }],
  2: [{ operation_id: 90002, route_name: "LCY-042", is_day_off: false, is_spms: true, note: null, spr: 132, sporh: 17.4, tw_percentage: 83.5, afd: 3, depart_time: "06:20:00", arrive_time: "14:05:00", break_minutes: 30, vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" }, unpaid_stops: { nr: 2, fp: 1, ba: 0, nh: 0, cm: 0, ca: 0 } }],
  4: [{ operation_id: 90004, route_name: "MSE-118", is_day_off: false, is_spms: true, note: "Traffic delay on the A40 outbound.", spr: 141, sporh: 19.8, tw_percentage: 88.2, afd: 4, depart_time: "06:10:00", arrive_time: "14:10:00", break_minutes: 30, vehicle: { vehicle_model: "Mercedes Sprinter", vehicle_registration_plate: "MS20 ABC" }, unpaid_stops: { nr: 1, fp: 1, ba: 1, nh: 1, cm: 0, ca: 0 } }],
  5: [{ operation_id: 90005, route_name: "DAY OFF", is_day_off: true, is_spms: true, note: "Day off - Folga", spr: 0, sporh: 0, tw_percentage: 0, afd: 0, depart_time: null, arrive_time: null, break_minutes: 0, unpaid_stops: { nr: 0, fp: 0, ba: 0, nh: 0, cm: 0, ca: 0 } }],
  8: [{ operation_id: 90008, route_name: "LCY-042", is_day_off: false, is_spms: false, note: null, spr: 163, sporh: 23.4, tw_percentage: 96.1, afd: 1, depart_time: "06:05:00", arrive_time: "14:35:00", break_minutes: 30, vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" }, unpaid_stops: { nr: 0, fp: 0, ba: 1, nh: 0, cm: 0, ca: 0 } }],
  9: [{ operation_id: 90009, route_name: "LSE-076", is_day_off: false, is_spms: true, note: null, spr: 128, sporh: 16.9, tw_percentage: 79.0, afd: 5, depart_time: "06:30:00", arrive_time: "14:00:00", break_minutes: 30, vehicle: { vehicle_model: "Iveco Daily", vehicle_registration_plate: "IV21 LSE" }, unpaid_stops: { nr: 3, fp: 1, ba: 0, nh: 1, cm: 0, ca: 0 } }],
  10: [{ operation_id: 90010, route_name: "LSE-076", is_day_off: false, is_spms: true, note: null, spr: 134, sporh: 18.5, tw_percentage: 91.4, afd: 2, depart_time: "06:25:00", arrive_time: "14:10:00", break_minutes: 30, vehicle: { vehicle_model: "Iveco Daily", vehicle_registration_plate: "IV21 LSE" }, unpaid_stops: { nr: 1, fp: 0, ba: 0, nh: 1, cm: 0, ca: 0 } }],
  11: [{ operation_id: 90011, route_name: "DAY OFF", is_day_off: true, is_spms: true, note: "Day off - Folga", spr: 0, sporh: 0, tw_percentage: 0, afd: 0, depart_time: null, arrive_time: null, break_minutes: 0, unpaid_stops: { nr: 0, fp: 0, ba: 0, nh: 0, cm: 0, ca: 0 } }],
  15: [{ operation_id: 90015, route_name: "LCY-042", is_day_off: false, is_spms: true, note: null, spr: 159, sporh: 22.7, tw_percentage: 95.5, afd: 1, depart_time: "06:10:00", arrive_time: "14:30:00", break_minutes: 30, vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" }, unpaid_stops: { nr: 0, fp: 0, ba: 0, nh: 1, cm: 0, ca: 0 } }],
  16: [{ operation_id: 90016, route_name: "MSE-118", is_day_off: false, is_spms: false, note: "One dispatch failure — left with the operations team.", spr: 130, sporh: 17.1, tw_percentage: 82.0, afd: 4, depart_time: "06:20:00", arrive_time: "14:00:00", break_minutes: 30, vehicle: { vehicle_model: "Mercedes Sprinter", vehicle_registration_plate: "MS20 ABC" }, unpaid_stops: { nr: 2, fp: 1, ba: 1, nh: 0, cm: 0, ca: 0 } }],
  17: [{ operation_id: 90017, route_name: "BASP-021", is_day_off: false, is_spms: true, note: null, spr: 150, sporh: 20.9, tw_percentage: 93.8, afd: 2, depart_time: "06:15:00", arrive_time: "14:15:00", break_minutes: 30, vehicle: { vehicle_model: "Renault Master", vehicle_registration_plate: "RM22 BSP" }, unpaid_stops: { nr: 1, fp: 0, ba: 0, nh: 1, cm: 0, ca: 0 } }],
  18: [{ operation_id: 90018, route_name: "BASP-021", is_day_off: false, is_spms: false, note: null, spr: 121, sporh: 15.8, tw_percentage: 74.0, afd: 6, depart_time: "06:35:00", arrive_time: "14:00:00", break_minutes: 30, vehicle: { vehicle_model: "Renault Master", vehicle_registration_plate: "RM22 BSP" }, unpaid_stops: { nr: 3, fp: 2, ba: 1, nh: 0, cm: 0, ca: 0 } }],
  22: [{ operation_id: 90022, route_name: "LCY-042", is_day_off: false, is_spms: true, note: null, spr: 154, sporh: 21.6, tw_percentage: 92.9, afd: 2, depart_time: "06:12:00", arrive_time: "14:22:00", break_minutes: 30, vehicle: { vehicle_model: "Ford Transit", vehicle_registration_plate: "LK19 XYZ" }, unpaid_stops: { nr: 1, fp: 0, ba: 0, nh: 1, cm: 0, ca: 0 } }],
  23: [{ operation_id: 90023, route_name: "DAY OFF", is_day_off: true, is_spms: true, note: "Day off - Folga", spr: 0, sporh: 0, tw_percentage: 0, afd: 0, depart_time: null, arrive_time: null, break_minutes: 0, unpaid_stops: { nr: 0, fp: 0, ba: 0, nh: 0, cm: 0, ca: 0 } }],
};
```

- [ ] **Step 7: Create `hooks/useDailyPerformanceInsight.ts`**

```ts
"use client";

import { useState } from "react";
import { api } from "@/lib/mock-client";
import { useMockQuery } from "@/lib/useMockQuery";
import { DAILY_PERFORMANCE_INSIGHT_FIXTURE } from "@/lib/mocks/daily-ops/daily-performance-insight-fixtures";
import { DEFAULT_DAY, ENDPOINT } from "../constants";
import { mapOperationInsight, type OperationInsightDTO } from "../utils/insightMappers";

export function useDailyPerformanceInsight() {
  const [day, setDay] = useState(DEFAULT_DAY);

  const query = useMockQuery<OperationInsightDTO[]>(["daily-performance-insight", day], () =>
    api.get<OperationInsightDTO[]>(ENDPOINT, {
      data: DAILY_PERFORMANCE_INSIGHT_FIXTURE[day] ?? [],
      empty: [],
      errorMessage: "Could not load this day's performance data.",
    }),
  );

  const operations = (query.data ?? []).map(mapOperationInsight);
  return { ...query, day, setDay, operations };
}
```

- [ ] **Step 8: Create `components/DaysCarousel.tsx`**

```tsx
"use client";

const DAYS_IN_SEPTEMBER_2026 = 30;

export function DaysCarousel({ selected, onSelect }: { selected: number; onSelect: (day: number) => void }) {
  const days = Array.from({ length: DAYS_IN_SEPTEMBER_2026 }, (_, i) => i + 1);
  return (
    <div role="group" aria-label="Select day" style={{ display: "flex", gap: "var(--space-sm)", overflowX: "auto", paddingBottom: "var(--space-sm)" }}>
      {days.map((day) => {
        const isSelected = day === selected;
        return (
          <button
            key={day}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(day)}
            style={{
              flex: "0 0 auto",
              minWidth: 40,
              padding: "var(--space-sm) var(--space-md)",
              border: "var(--stroke) solid var(--outline-variant)",
              background: isSelected ? "var(--on-surface-variant)" : "var(--container-lowest)",
              color: isSelected ? "var(--container-lowest)" : "var(--on-surface)",
              font: "var(--type-metric-value)",
              cursor: "pointer",
            }}
          >
            {String(day).padStart(2, "0")}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 9: Create `components/MetricsRow.tsx`**

```tsx
import { StatTile } from "@/components/ui";
import { twTone } from "../utils/insightMappers";
import type { OperationInsight } from "../types";

export function MetricsRow({ operation }: { operation: OperationInsight }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
      <StatTile label="SPR" value={operation.spr} tone="neutral" />
      <StatTile label="SPOR-H" value={operation.sporH} tone="info" />
      <StatTile label="TW" value={`${Math.round(operation.tw)}%`} tone={twTone(operation.tw)} />
      <StatTile label="AFD" value={`${operation.afd}%`} tone="neutral" />
    </div>
  );
}
```

- [ ] **Step 10: Create `components/FailedDeliveriesCard.tsx`**

```tsx
import { SectionBox } from "@/components/ui";
import { SHIP_FAILURE_PLACEHOLDER } from "../utils/insightMappers";
import type { UnpaidStops } from "../types";

const TILES: Array<{ label: string; title: string; field: keyof UnpaidStops | null }> = [
  { label: "NR", title: "Not Received", field: "nr" },
  { label: "FP", title: "Failed Pick", field: "fp" },
  { label: "BA", title: "Business Address", field: "ba" },
  { label: "NH", title: "Not Home", field: "nh" },
  { label: "SHP", title: "Ship", field: null },
  { label: "CM", title: "Customer", field: "cm" },
  { label: "CA", title: "Closed on Arrival", field: "ca" },
];

export function FailedDeliveriesCard({ unpaidStops }: { unpaidStops: UnpaidStops }) {
  return (
    <SectionBox label="Failed Deliveries">
      <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
        {TILES.map((tile) => (
          <div key={tile.label} title={tile.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 48 }}>
            <span style={{ font: "var(--type-metric-label)", color: "var(--text-quaternary)" }}>{tile.label}</span>
            <span className="num" style={{ font: "var(--type-data-md)" }}>
              {tile.field ? unpaidStops[tile.field] : SHIP_FAILURE_PLACEHOLDER}
            </span>
          </div>
        ))}
      </div>
    </SectionBox>
  );
}
```

- [ ] **Step 11: Create `components/OperationCard.tsx`**

```tsx
import { SectionBox, StatusPill } from "@/components/ui";
import { formatTime } from "../utils/insightMappers";
import { MetricsRow } from "./MetricsRow";
import { FailedDeliveriesCard } from "./FailedDeliveriesCard";
import type { OperationInsight } from "../types";

export function OperationCard({ operation }: { operation: OperationInsight }) {
  return (
    <SectionBox>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ font: "var(--type-driver-name)", color: "var(--on-surface)" }}>{operation.routeName}</span>
        {operation.isVerified ? <StatusPill tone="success">Verified</StatusPill> : <StatusPill tone="warning">Wait Verification</StatusPill>}
      </div>

      {operation.vehiclePlate ? (
        <div style={{ font: "var(--type-vehicle-plate)", color: "var(--on-surface-variant)" }}>
          {operation.vehiclePlate} ({operation.vehicleModel})
        </div>
      ) : null}

      {operation.showMetrics ? (
        <>
          <MetricsRow operation={operation} />
          <div style={{ display: "flex", gap: "var(--space-lg)", flexWrap: "wrap" }}>
            <span>Departed: {formatTime(operation.departTime)}</span>
            <span>Break: {Math.round(operation.breakMinutes)} Min</span>
            <span>Arrived: {formatTime(operation.arriveTime)}</span>
          </div>
          <FailedDeliveriesCard unpaidStops={operation.unpaidStops} />
        </>
      ) : null}

      {operation.note ? (
        <div>
          <span style={{ font: "var(--type-section-label)", textTransform: "uppercase" }}>Notes</span>
          <p style={{ margin: 0 }}>{operation.note}</p>
        </div>
      ) : null}
    </SectionBox>
  );
}
```

- [ ] **Step 12: Create `components/Content.tsx`**

```tsx
"use client";

import { EmptyState, ErrorState, LoadingState, PageFooter, PageHeader } from "@/components/ui";
import { useDailyPerformanceInsight } from "../hooks/useDailyPerformanceInsight";
import { DaysCarousel } from "./DaysCarousel";
import { OperationCard } from "./OperationCard";

export function Content() {
  const { day, setDay, operations, isLoading, isError, error, refetch } = useDailyPerformanceInsight();

  return (
    <>
      <PageHeader title="Daily Performance Insight" subtitle="September 2026 — pick a day to see its operations." />

      <DaysCarousel selected={day} onSelect={setDay} />

      {isLoading ? <LoadingState rows={2} /> : null}
      {isError ? <ErrorState body={error?.message ?? "Unknown error."} onRetry={refetch} /> : null}

      {!isLoading && !isError && operations.length === 0 ? (
        <EmptyState title="No operations this day" body="Pick a different day from the carousel above." />
      ) : null}

      {!isLoading && !isError
        ? operations.map((op, i) => (
            <div key={op.operationId}>
              {i > 0 ? <hr style={{ border: "none", borderTop: "var(--stroke) solid var(--stroke-divider)" }} /> : null}
              <OperationCard operation={op} />
            </div>
          ))
        : null}

      <PageFooter left={`${operations.length} operation(s)`} right="Simulated data — prototype" />
    </>
  );
}
```

- [ ] **Step 13: Create `page.tsx` and `loading.tsx`**

`app/(private)/daily-ops/daily-performance-insight/page.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { Content } from "./components/Content";

export default function DailyPerformanceInsightPage() {
  return (
    <NavbarWrapper title="DAILY PERFORMANCE INSIGHT" active="daily-ops">
      <Content />
    </NavbarWrapper>
  );
}
```

`app/(private)/daily-ops/daily-performance-insight/loading.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { LoadingState } from "@/components/ui";

export default function DailyPerformanceInsightLoading() {
  return (
    <NavbarWrapper title="DAILY PERFORMANCE INSIGHT" active="daily-ops">
      <LoadingState rows={4} />
    </NavbarWrapper>
  );
}
```

- [ ] **Step 14: Run the full gate**

Run: `npm run typecheck && npm run check:tokens && npm run lint && npm run test && npm run build`
Expected: all succeed.

- [ ] **Step 15: Manual checkpoint**

Run: `npm run dev`, open `http://localhost:3000/daily-ops/daily-performance-insight`. Confirm: day 17 (default) shows the BASP-021 operation with metrics hidden (route starts with B) but the route/badge/vehicle still visible; day 5 shows the "DAY OFF" note with no metrics; day 3 (no fixture entry) shows the empty state; `?mock=error` shows the error state.

- [ ] **Step 16: Commit**

```bash
git add "app/(private)/daily-ops/daily-performance-insight/" "lib/mocks/daily-ops/daily-performance-insight-fixtures.ts"
git commit -m "feat: add Daily Performance Insight page to Daily Ops

Rebuilds the real daily-performance-insight screen (days carousel +
per-operation metrics/timeline/failed-deliveries) on the Industrial
Terminal design system."
```

---

### Task 7: shared `FilterBar` + `daily-operations-reports` page

Real source: `app/(private)/daily-operations-reports/`. A filterable, paginated 11-column operations report table (644-line real `page.tsx`). This task also adds `components/ui/FilterBar.tsx`, since research confirmed `daily-operations-reports` and `daily-financial-insights` (Task 8) share the same filter/table skeleton — building it once here means Task 8 only consumes it.

**Files:**
- Create: `components/ui/FilterBar.tsx`
- Modify: `components/ui/ui.module.css` (append `.dateInput`, `.filterBar` classes)
- Modify: `components/ui/index.ts` (export `FilterBar`)
- Create: `app/(private)/daily-ops/daily-operations-reports/types.ts`
- Create: `app/(private)/daily-ops/daily-operations-reports/constants.ts`
- Create: `app/(private)/daily-ops/daily-operations-reports/utils/reportsMappers.ts`
- Create: `app/(private)/daily-ops/daily-operations-reports/utils/reportsMappers.test.ts`
- Create: `app/(private)/daily-ops/daily-operations-reports/hooks/useDailyOperationsReports.ts`
- Create: `app/(private)/daily-ops/daily-operations-reports/components/ReportsTable.tsx`
- Create: `app/(private)/daily-ops/daily-operations-reports/components/VendorDetailsPanel.tsx`
- Create: `app/(private)/daily-ops/daily-operations-reports/components/Content.tsx`
- Create: `app/(private)/daily-ops/daily-operations-reports/page.tsx`
- Create: `app/(private)/daily-ops/daily-operations-reports/loading.tsx`
- Create: `lib/mocks/daily-ops/daily-operations-reports-fixtures.ts`

**Interfaces:**
- Consumes: `components/ui` (`DataTable`, `Column`, `OptionSwitcher`, `SearchField`, `Button`, `EmptyState`, `LoadingState`, `ErrorState`, `PageHeader`, `PageFooter`, `TONE_VAR`) from Task 1.
- Produces: `components/ui`'s new `FilterBar` (props: `dateFrom`, `dateTo`, `onDateFromChange`, `onDateToChange`, `depots: string[]`, `selectedDepot`, `onDepotChange`, `loops: string[]`, `selectedLoop`, `onLoopChange`, `search`, `onSearchChange`) — consumed by this task and by Task 8. Route `/daily-ops/daily-operations-reports`.

- [ ] **Step 1: Create `components/ui/FilterBar.tsx`**

```tsx
"use client";

import { OptionSwitcher } from "./OptionSwitcher";
import { SearchField } from "./SearchField";
import styles from "./ui.module.css";

export function FilterBar({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  depots,
  selectedDepot,
  onDepotChange,
  loops,
  selectedLoop,
  onLoopChange,
  search,
  onSearchChange,
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  depots: readonly string[];
  selectedDepot: string;
  onDepotChange: (value: string) => void;
  loops: readonly string[];
  selectedLoop: string;
  onLoopChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className={styles.filterBar}>
      <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
        <input type="date" className={styles.dateInput} value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} aria-label="From date" />
        <span style={{ color: "var(--text-tertiary)" }}>&ndash;</span>
        <input type="date" className={styles.dateInput} value={dateTo} onChange={(e) => onDateToChange(e.target.value)} aria-label="To date" />
      </div>
      <OptionSwitcher options={depots} value={selectedDepot} onChange={onDepotChange} label="Filter by depot" />
      <OptionSwitcher options={loops} value={selectedLoop} onChange={onLoopChange} label="Filter by loop" />
      <SearchField placeholder="Search route, VRN or vendor" defaultValue={search} onChange={onSearchChange} />
    </div>
  );
}
```

- [ ] **Step 2: Append to `components/ui/ui.module.css`**

```css

/* ============================================================ filter bar */
.filterBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-lg);
}

.dateInput {
  height: var(--layout-search-height);
  padding: 0 var(--space-md);
  background: var(--surface-search);
  border: none;
  border-radius: var(--radius-micro);
  outline: var(--stroke) solid var(--text-tertiary);
  outline-offset: -1px;
  font: var(--type-timestamp);
  color: var(--on-surface);
}
```

- [ ] **Step 3: Update `components/ui/index.ts`**

Add this line (anywhere among the other exports):
```ts
export { FilterBar } from "./FilterBar";
```

- [ ] **Step 4: Create `types.ts`**

```ts
export interface ReportRow {
  operationId: number;
  date: string;
  route: string;
  isFlexRoute: boolean;
  isSortYes: boolean;
  vendor: string;
  vrn: string;
  tw: number | null; // fraction 0-1, matches real percentageOtTwDl
  depart: string | null;
  arrive: string | null;
  breakTime: string | null;
  workHours: number | null;
  stops: number;
  note: string;
  depot: string;
  loop: string | null;
  isVerified: boolean;
}

export interface ReportTotals {
  totalWorkHours: number;
  totalStops: number;
}

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  depot: string;
  loop: string;
  search: string;
}
```

- [ ] **Step 5: Create `constants.ts`**

```ts
/**
 * Real endpoint: GET /bff/reports/by-date-range?initialDate&finalDate&depositId&...
 * Single-day mode (initialDate === finalDate) pages at 500/page; range mode at 50/page.
 * Not reproduced here — this prototype shows one fixed result set, no server pagination.
 */
export const ENDPOINT = "/bff/reports/by-date-range";

export const ALL_DEPOTS = "All" as const;
export const ALL_LOOPS = "All" as const;
export const DEPOTS = [ALL_DEPOTS, "LCY", "MSE", "LSE", "BASP"] as const;
export const LOOPS = [ALL_LOOPS, "LCY01", "MSE02", "LSE01", "BASP03"] as const;

export const DEFAULT_FILTERS = {
  dateFrom: "2026-09-01",
  dateTo: "2026-09-23",
  depot: ALL_DEPOTS,
  loop: ALL_LOOPS,
  search: "",
};
```

- [ ] **Step 6: Create `utils/reportsMappers.ts`**

```ts
import type { ReportFilters, ReportRow, ReportTotals } from "../types";
import type { StatusTone } from "@/components/ui";

export interface ReportRowDTO {
  operationId: number;
  operationDate: string;
  routeName: string;
  isFlexRoute: boolean;
  isSort: boolean;
  courierName: string;
  vrn: string;
  percentageOtTwDl: number | null;
  departTime: string | null;
  arriveTime: string | null;
  breakMinutes: number | null;
  totalWorkHours: number | null;
  totalStops: number;
  note: string | null;
  depositName: string;
  loop: string | null;
  isSpms: boolean;
}

export interface ReportsDTO {
  rows: ReportRowDTO[];
  /** Pre-computed by the (simulated) backend — the real total includes a
   *  per-vendor sort-time addition this prototype deliberately does not
   *  reimplement client-side (see spec §3, §9). */
  totals: ReportTotals;
}

function formatBreak(minutes: number | null): string | null {
  if (minutes === null) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function mapReportRow(dto: ReportRowDTO): ReportRow {
  return {
    operationId: dto.operationId,
    date: dto.operationDate,
    route: dto.routeName,
    isFlexRoute: dto.isFlexRoute,
    isSortYes: dto.isSort,
    vendor: dto.courierName,
    vrn: dto.vrn,
    tw: dto.percentageOtTwDl,
    depart: dto.departTime,
    arrive: dto.arriveTime,
    breakTime: formatBreak(dto.breakMinutes),
    workHours: dto.totalWorkHours,
    stops: dto.totalStops,
    note: dto.note ?? "",
    depot: dto.depositName,
    loop: dto.loop,
    isVerified: dto.isSpms,
  };
}

/** Exact real getTWClass bands, operating on the *100 percentage. null -> gray/neutral. */
export function twTone(tw: number | null): StatusTone {
  if (tw === null) return "neutral";
  const percent = tw * 100;
  if (percent >= 90) return "good";
  if (percent >= 80) return "warning";
  return "critical";
}

export function formatTW(tw: number | null): string {
  if (tw === null) return "--:--";
  return `${(tw * 100).toFixed(2)}%`;
}

export function formatTime(value: string | null): string {
  return value ? value.slice(0, 5) : "--:--";
}

export function applyFilters(rows: ReportRow[], filters: ReportFilters): ReportRow[] {
  return rows.filter((row) => {
    if (row.date < filters.dateFrom || row.date > filters.dateTo) return false;
    if (filters.depot !== "All" && row.depot !== filters.depot) return false;
    if (filters.loop !== "All" && row.loop !== filters.loop) return false;
    if (filters.search) {
      const needle = filters.search.toLowerCase();
      const haystack = `${row.route} ${row.vrn} ${row.vendor}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

export function formatTotalWorkHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}
```

- [ ] **Step 7: Write the mapper test**

Create `app/(private)/daily-ops/daily-operations-reports/utils/reportsMappers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { applyFilters, formatTW, formatTime, formatTotalWorkHours, mapReportRow, twTone, type ReportRowDTO } from "./reportsMappers";
import type { ReportFilters } from "../types";

const DTO: ReportRowDTO = {
  operationId: 1, operationDate: "2026-09-08", routeName: "LCY-042", isFlexRoute: false, isSort: true,
  courierName: "Marek Nowak", vrn: "LK19 XYZ", percentageOtTwDl: 0.961, departTime: "06:05:00", arriveTime: "14:35:00",
  breakMinutes: 30, totalWorkHours: 8.5, totalStops: 67, note: null, depositName: "LCY", loop: "LCY01", isSpms: true,
};

describe("mapReportRow", () => {
  it("maps every field, formatting break minutes to H:MM and defaulting a null note to empty string", () => {
    expect(mapReportRow(DTO)).toEqual({
      operationId: 1, date: "2026-09-08", route: "LCY-042", isFlexRoute: false, isSortYes: true,
      vendor: "Marek Nowak", vrn: "LK19 XYZ", tw: 0.961, depart: "06:05:00", arrive: "14:35:00",
      breakTime: "00:30", workHours: 8.5, stops: 67, note: "", depot: "LCY", loop: "LCY01", isVerified: true,
    });
  });
});

describe("twTone / formatTW", () => {
  it("applies the exact 3-band scale on the *100 percentage", () => {
    expect(twTone(0.96)).toBe("good");
    expect(twTone(0.85)).toBe("warning");
    expect(twTone(0.5)).toBe("critical");
    expect(twTone(null)).toBe("neutral");
  });
  it("formats as a 2-decimal percentage", () => {
    expect(formatTW(0.961)).toBe("96.10%");
    expect(formatTW(null)).toBe("--:--");
  });
});

describe("formatTime", () => {
  it("truncates to HH:MM, falls back to --:-- for null", () => {
    expect(formatTime("06:05:00")).toBe("06:05");
    expect(formatTime(null)).toBe("--:--");
  });
});

describe("applyFilters", () => {
  const rows = [mapReportRow(DTO), mapReportRow({ ...DTO, operationId: 2, depositName: "MSE", loop: "MSE02", routeName: "MSE-118", operationDate: "2026-09-16" })];

  it("filters by date range", () => {
    const filters: ReportFilters = { dateFrom: "2026-09-08", dateTo: "2026-09-08", depot: "All", loop: "All", search: "" };
    expect(applyFilters(rows, filters)).toHaveLength(1);
  });

  it("filters by depot", () => {
    const filters: ReportFilters = { dateFrom: "2026-09-01", dateTo: "2026-09-30", depot: "MSE", loop: "All", search: "" };
    expect(applyFilters(rows, filters).map((r) => r.route)).toEqual(["MSE-118"]);
  });

  it("filters by free-text search across route/vrn/vendor", () => {
    const filters: ReportFilters = { dateFrom: "2026-09-01", dateTo: "2026-09-30", depot: "All", loop: "All", search: "nowak" };
    expect(applyFilters(rows, filters)).toHaveLength(2); // both rows share courierName "Marek Nowak"
  });
});

describe("formatTotalWorkHours", () => {
  it("converts a decimal hour total to H:MM", () => {
    expect(formatTotalWorkHours(8.5)).toBe("8:30");
    expect(formatTotalWorkHours(16)).toBe("16:00");
  });
});
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm run test -- reportsMappers`
Expected: PASS (8 tests).

- [ ] **Step 9: Create the fixture `lib/mocks/daily-ops/daily-operations-reports-fixtures.ts`**

```ts
export const DAILY_OPERATIONS_REPORTS_FIXTURE = {
  rows: [
    { operation_id: 1, operation_date: "2026-09-01", route_name: "LCY-042", is_flex_route: false, is_sort: true, courier_name: "Marek Nowak", vrn: "LK19 XYZ", percentage_ot_tw_dl: 0.94, depart_time: "06:15:00", arrive_time: "14:40:00", break_minutes: 30, total_work_hours: 8.25, total_stops: 63, note: null, deposit_name: "LCY", loop: "LCY01", is_spms: true },
    { operation_id: 2, operation_date: "2026-09-02", route_name: "LCY-042", is_flex_route: false, is_sort: true, courier_name: "Marek Nowak", vrn: "LK19 XYZ", percentage_ot_tw_dl: 0.835, depart_time: "06:20:00", arrive_time: "14:05:00", break_minutes: 30, total_work_hours: 7.75, total_stops: 52, note: null, deposit_name: "LCY", loop: "LCY01", is_spms: true },
    { operation_id: 3, operation_date: "2026-09-04", route_name: "MSE-118", is_flex_route: false, is_sort: true, courier_name: "Dana Kowalski", vrn: "MS20 ABC", percentage_ot_tw_dl: 0.882, depart_time: "06:10:00", arrive_time: "14:10:00", break_minutes: 30, total_work_hours: 8.0, total_stops: 58, note: "Traffic delay on the A40 outbound.", deposit_name: "MSE", loop: "MSE02", is_spms: true },
    { operation_id: 4, operation_date: "2026-09-08", route_name: "LCY-042", is_flex_route: false, is_sort: true, courier_name: "Marek Nowak", vrn: "LK19 XYZ", percentage_ot_tw_dl: 0.961, depart_time: "06:05:00", arrive_time: "14:35:00", break_minutes: 30, total_work_hours: 8.5, total_stops: 67, note: null, deposit_name: "LCY", loop: "LCY01", is_spms: false },
    { operation_id: 5, operation_date: "2026-09-09", route_name: "LSE-076", is_flex_route: true, is_sort: false, courier_name: "Owen Pryce", vrn: "IV21 LSE", percentage_ot_tw_dl: 0.79, depart_time: "06:30:00", arrive_time: "14:00:00", break_minutes: 30, total_work_hours: 7.5, total_stops: 49, note: null, deposit_name: "LSE", loop: "LSE01", is_spms: true },
    { operation_id: 6, operation_date: "2026-09-10", route_name: "LSE-076", is_flex_route: true, is_sort: false, courier_name: "Owen Pryce", vrn: "IV21 LSE", percentage_ot_tw_dl: 0.914, depart_time: "06:25:00", arrive_time: "14:10:00", break_minutes: 30, total_work_hours: 7.75, total_stops: 51, note: null, deposit_name: "LSE", loop: "LSE01", is_spms: true },
    { operation_id: 7, operation_date: "2026-09-15", route_name: "LCY-042", is_flex_route: false, is_sort: true, courier_name: "Marek Nowak", vrn: "LK19 XYZ", percentage_ot_tw_dl: 0.955, depart_time: "06:10:00", arrive_time: "14:30:00", break_minutes: 30, total_work_hours: 8.25, total_stops: 65, note: null, deposit_name: "LCY", loop: "LCY01", is_spms: true },
    { operation_id: 8, operation_date: "2026-09-16", route_name: "MSE-118", is_flex_route: false, is_sort: true, courier_name: "Dana Kowalski", vrn: "MS20 ABC", percentage_ot_tw_dl: 0.82, depart_time: "06:20:00", arrive_time: "14:00:00", break_minutes: 30, total_work_hours: 7.6, total_stops: 50, note: "One dispatch failure — left with the operations team.", deposit_name: "MSE", loop: "MSE02", is_spms: false },
    { operation_id: 9, operation_date: "2026-09-17", route_name: "BASP-021", is_flex_route: false, is_sort: true, courier_name: "Freya Haugen", vrn: "RM22 BSP", percentage_ot_tw_dl: 0.938, depart_time: "06:15:00", arrive_time: "14:15:00", break_minutes: 30, total_work_hours: 8.0, total_stops: 60, note: null, deposit_name: "BASP", loop: "BASP03", is_spms: true },
    { operation_id: 10, operation_date: "2026-09-18", route_name: "BASP-021", is_flex_route: false, is_sort: true, courier_name: "Freya Haugen", vrn: "RM22 BSP", percentage_ot_tw_dl: 0.74, depart_time: "06:35:00", arrive_time: "14:00:00", break_minutes: 30, total_work_hours: 7.4, total_stops: 47, note: null, deposit_name: "BASP", loop: "BASP03", is_spms: false },
    { operation_id: 11, operation_date: "2026-09-22", route_name: "LCY-042", is_flex_route: false, is_sort: true, courier_name: "Marek Nowak", vrn: "LK19 XYZ", percentage_ot_tw_dl: 0.929, depart_time: "06:12:00", arrive_time: "14:22:00", break_minutes: 30, total_work_hours: 8.1, total_stops: 64, note: null, deposit_name: "LCY", loop: "LCY01", is_spms: true },
  ],
  totals: { total_work_hours: 87.1, total_stops: 626 },
};
```

- [ ] **Step 10: Create `hooks/useDailyOperationsReports.ts`**

```ts
"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/mock-client";
import { useMockQuery } from "@/lib/useMockQuery";
import { DAILY_OPERATIONS_REPORTS_FIXTURE } from "@/lib/mocks/daily-ops/daily-operations-reports-fixtures";
import { DEFAULT_FILTERS, ENDPOINT } from "../constants";
import { applyFilters, mapReportRow, type ReportsDTO } from "../utils/reportsMappers";
import type { ReportFilters } from "../types";

const EMPTY_DTO: ReportsDTO = { rows: [], totals: { totalWorkHours: 0, totalStops: 0 } };

export function useDailyOperationsReports() {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);

  const query = useMockQuery<ReportsDTO>(["daily-operations-reports"], () =>
    api.get<ReportsDTO>(ENDPOINT, {
      data: DAILY_OPERATIONS_REPORTS_FIXTURE,
      empty: EMPTY_DTO,
      errorMessage: "Could not load the operations report.",
    }),
  );

  const dto = query.data ?? EMPTY_DTO;
  const allRows = useMemo(() => dto.rows.map(mapReportRow), [dto]);
  const rows = useMemo(() => applyFilters(allRows, filters), [allRows, filters]);

  return { ...query, rows, totals: dto.totals, filters, setFilters };
}
```

- [ ] **Step 11: Create `components/ReportsTable.tsx`**

```tsx
import { DataTable, StatusPill, type Column } from "@/components/ui";
import { formatTW, formatTime, formatTotalWorkHours, twTone } from "../utils/reportsMappers";
import type { ReportRow, ReportTotals } from "../types";

function makeColumns(onVendorClick: (vendor: string) => void): Column<ReportRow>[] {
  return [
    { key: "date", header: "Date", render: (r) => r.date },
    {
      key: "route",
      header: "Route",
      render: (r) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-xs)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "var(--radius-pill)", background: r.isSortYes ? "var(--state-good)" : "var(--state-critical)", display: "inline-block" }} />
          {r.isFlexRoute && !r.route.startsWith("FLEX") ? `Flex ${r.route}` : r.route}
        </span>
      ),
    },
    {
      key: "vendor",
      header: "Vendor",
      render: (r) => (
        <button type="button" onClick={() => onVendorClick(r.vendor)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--secondary)", textDecoration: "underline" }}>
          {r.vendor}
        </button>
      ),
    },
    { key: "vrn", header: "VRN", render: (r) => r.vrn },
    { key: "tw", header: "TW (%)", numeric: true, render: (r) => <StatusPill tone={twTone(r.tw)} showIcon={false}>{formatTW(r.tw)}</StatusPill> },
    { key: "depart", header: "Depart", numeric: true, render: (r) => formatTime(r.depart) },
    { key: "arrive", header: "Arrive", numeric: true, render: (r) => formatTime(r.arrive) },
    { key: "break", header: "Break", numeric: true, render: (r) => r.breakTime ?? "--:--" },
    { key: "workHours", header: "Work Hours", numeric: true, render: (r) => (r.workHours !== null ? r.workHours.toFixed(2) : "--:--") },
    {
      key: "stops",
      header: "Stops",
      numeric: true,
      render: (r) => <span style={{ background: !r.isVerified ? "var(--state-alert-bg)" : undefined }}>{r.stops}</span>,
    },
    { key: "note", header: "Note", render: (r) => r.note || "—" },
  ];
}

export function ReportsTable({ rows, totals, onVendorClick }: { rows: ReportRow[]; totals: ReportTotals; onVendorClick: (vendor: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      <DataTable columns={makeColumns(onVendorClick)} rows={rows} getRowKey={(r) => String(r.operationId)} caption="Daily operations report" />
      <div style={{ display: "flex", gap: "var(--space-xl)", font: "var(--type-data-md)", color: "var(--on-surface-variant)" }}>
        <span>Total Work Hours: <strong>{formatTotalWorkHours(totals.totalWorkHours)}</strong></span>
        <span>Total Stops: <strong>{totals.totalStops}</strong></span>
      </div>
    </div>
  );
}
```

- [ ] **Step 12: Create `components/VendorDetailsPanel.tsx`**

```tsx
import { Button, DataTable, SectionBox, type Column } from "@/components/ui";
import { formatTW, formatTime } from "../utils/reportsMappers";
import type { ReportRow } from "../types";

const COLUMNS: Column<ReportRow>[] = [
  { key: "date", header: "Date", render: (r) => r.date },
  { key: "route", header: "Route", render: (r) => r.route },
  { key: "tw", header: "TW", numeric: true, render: (r) => formatTW(r.tw) },
  { key: "depart", header: "Depart", numeric: true, render: (r) => formatTime(r.depart) },
  { key: "arrive", header: "Arrive", numeric: true, render: (r) => formatTime(r.arrive) },
  { key: "stops", header: "Stops", numeric: true, render: (r) => String(r.stops) },
];

export function VendorDetailsPanel({ vendor, rows, onClose }: { vendor: string; rows: ReportRow[]; onClose: () => void }) {
  const totalStops = rows.reduce((sum, r) => sum + r.stops, 0);
  return (
    <SectionBox label={`Vendor details — ${vendor}`}>
      <DataTable columns={COLUMNS} rows={rows} getRowKey={(r) => String(r.operationId)} caption={`Rows for ${vendor}`} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Total stops: <strong>{totalStops}</strong></span>
        <Button variant="neutral" onClick={onClose}>Close</Button>
      </div>
    </SectionBox>
  );
}
```

- [ ] **Step 13: Create `components/Content.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button, EmptyState, ErrorState, FilterBar, LoadingState, PageFooter, PageHeader } from "@/components/ui";
import { DEPOTS, LOOPS } from "../constants";
import { useDailyOperationsReports } from "../hooks/useDailyOperationsReports";
import { ReportsTable } from "./ReportsTable";
import { VendorDetailsPanel } from "./VendorDetailsPanel";

export function Content() {
  const { rows, totals, filters, setFilters, isLoading, isError, error, refetch } = useDailyOperationsReports();
  const [selectedVendor, setSelectedVendor] = useState<string>();

  return (
    <>
      <PageHeader
        title="Daily Operations Reports"
        subtitle="Filterable table of operational report rows."
        toolbar={
          <Button variant="outline" disabled title="Not available in this prototype">
            Export PDF
          </Button>
        }
      />

      <FilterBar
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onDateFromChange={(dateFrom) => setFilters((f) => ({ ...f, dateFrom }))}
        onDateToChange={(dateTo) => setFilters((f) => ({ ...f, dateTo }))}
        depots={DEPOTS}
        selectedDepot={filters.depot}
        onDepotChange={(depot) => setFilters((f) => ({ ...f, depot }))}
        loops={LOOPS}
        selectedLoop={filters.loop}
        onLoopChange={(loop) => setFilters((f) => ({ ...f, loop }))}
        search={filters.search}
        onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
      />

      {isLoading ? <LoadingState rows={4} /> : null}
      {isError ? <ErrorState body={error?.message ?? "Unknown error."} onRetry={refetch} /> : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState title="No rows match these filters" body="Widen the date range or clear a filter to see report rows." />
      ) : null}

      {!isLoading && !isError && rows.length > 0 ? <ReportsTable rows={rows} totals={totals} onVendorClick={setSelectedVendor} /> : null}

      {selectedVendor ? (
        <VendorDetailsPanel vendor={selectedVendor} rows={rows.filter((r) => r.vendor === selectedVendor)} onClose={() => setSelectedVendor(undefined)} />
      ) : null}

      <PageFooter left={`${rows.length} rows`} right="Simulated data — prototype" />
    </>
  );
}
```

- [ ] **Step 14: Create `page.tsx` and `loading.tsx`**

`app/(private)/daily-ops/daily-operations-reports/page.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { Content } from "./components/Content";

export default function DailyOperationsReportsPage() {
  return (
    <NavbarWrapper title="DAILY OPERATIONS REPORTS" active="daily-ops">
      <Content />
    </NavbarWrapper>
  );
}
```

`app/(private)/daily-ops/daily-operations-reports/loading.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { LoadingState } from "@/components/ui";

export default function DailyOperationsReportsLoading() {
  return (
    <NavbarWrapper title="DAILY OPERATIONS REPORTS" active="daily-ops">
      <LoadingState rows={5} />
    </NavbarWrapper>
  );
}
```

- [ ] **Step 15: Run the full gate**

Run: `npm run typecheck && npm run check:tokens && npm run lint && npm run test && npm run build`
Expected: all succeed. (`check:tokens` now also scans the modified `components/ui/FilterBar.tsx` and `ui.module.css` — both use only `var(--token)`.)

- [ ] **Step 16: Manual checkpoint**

Run: `npm run dev`, open `http://localhost:3000/daily-ops/daily-operations-reports`. Confirm: 11 rows visible by default; filtering by depot "MSE" narrows to Dana Kowalski's rows; clicking a vendor name opens the vendor details panel below the table; "Export PDF" is visibly disabled with a tooltip; `?mock=empty` and `?mock=error` render correctly.

- [ ] **Step 17: Commit**

```bash
git add components/ui/FilterBar.tsx components/ui/ui.module.css components/ui/index.ts "app/(private)/daily-ops/daily-operations-reports/" "lib/mocks/daily-ops/daily-operations-reports-fixtures.ts"
git commit -m "feat: add Daily Operations Reports page and a shared FilterBar

Adds components/ui/FilterBar (reused by Daily Financial Insights in the
next task) and rebuilds the real daily-operations-reports screen on the
Industrial Terminal design system."
```

---

### Task 8: `daily-financial-insights` page

Real source: `app/(private)/daily-financial-insights/` (547-line real `page.tsx`). Same table/filter/pagination skeleton as Task 7, for financial rows tied to service partners, plus an edit/delete action pair. Reuses `components/ui/FilterBar` from Task 7 unchanged; adds one page-local payment-mode filter that FilterBar doesn't carry (research confirmed this filter is specific to this page).

**Files:**
- Create: `app/(private)/daily-ops/daily-financial-insights/types.ts`
- Create: `app/(private)/daily-ops/daily-financial-insights/constants.ts`
- Create: `app/(private)/daily-ops/daily-financial-insights/utils/insightsMappers.ts`
- Create: `app/(private)/daily-ops/daily-financial-insights/utils/insightsMappers.test.ts`
- Create: `app/(private)/daily-ops/daily-financial-insights/hooks/useDailyFinancialInsights.ts`
- Create: `app/(private)/daily-ops/daily-financial-insights/components/InsightsTable.tsx`
- Create: `app/(private)/daily-ops/daily-financial-insights/components/OperationEditPanel.tsx`
- Create: `app/(private)/daily-ops/daily-financial-insights/components/Content.tsx`
- Create: `app/(private)/daily-ops/daily-financial-insights/page.tsx`
- Create: `app/(private)/daily-ops/daily-financial-insights/loading.tsx`
- Create: `lib/mocks/daily-ops/daily-financial-insights-fixtures.ts`

**Interfaces:**
- Consumes: `components/ui` (`FilterBar`, `DataTable`, `Column`, `OptionSwitcher`, `Button`, `Toast`, `EmptyState`, `LoadingState`, `ErrorState`, `PageHeader`, `PageFooter`) from Tasks 1 and 7.
- Produces: route `/daily-ops/daily-financial-insights`.

- [ ] **Step 1: Create `types.ts`**

```ts
export type PaymentMode = "DR" | "FSR" | "VSR" | "OFF";

export interface InsightRow {
  operationId: number;
  date: string;
  depot: string;
  vrn: string;
  vendor: string;
  route: string;
  paymentMode: PaymentMode;
  rate: number;
  stops: number | null;
  totalPaidStops: number | null;
  routeSort: number | null;
  adhoc: number | null;
  extras: number | null;
  notes: string;
  total: number;
  avgPerStop: number;
  canEdit: boolean;
}

export interface InsightFilters {
  dateFrom: string;
  dateTo: string;
  depot: string;
  loop: string;
  /** Matches `(typeof PAYMENT_MODES)[number]` from constants.ts — kept as a
   *  plain type alias here (not imported) to avoid types.ts depending on
   *  constants.ts; the two are kept in sync by hand, same as the rest of
   *  this file's fields mirror their DTO counterparts. */
  payment: "All" | "DR" | "FSR" | "VSR" | "OFF";
  search: string;
}

export interface PageTotals {
  total: number;
  avg: number;
  count: number;
}
```

- [ ] **Step 2: Create `constants.ts`**

```ts
/** Real endpoint: GET /bff/reports/by-date-range (same family as daily-operations-reports, different projection). */
export const ENDPOINT = "/bff/financial-insights/by-date-range";

export const ALL = "All" as const;
export const DEPOTS = [ALL, "LCY", "MSE", "LSE", "BASP"] as const;
export const LOOPS = [ALL, "LCY01", "MSE02", "LSE01", "BASP03"] as const;
export const PAYMENT_MODES = [ALL, "DR", "FSR", "VSR", "OFF"] as const;

export const DEFAULT_FILTERS = {
  dateFrom: "2026-09-01",
  dateTo: "2026-09-23",
  depot: ALL,
  loop: ALL,
  payment: ALL,
  search: "",
};
```

- [ ] **Step 3: Create `utils/insightsMappers.ts`**

```ts
import type { InsightFilters, InsightRow, PageTotals, PaymentMode } from "../types";

export interface InsightRowDTO {
  operationId: number;
  operationDate: string;
  depositName: string;
  vrn: string;
  courierName: string;
  routeName: string;
  paymentMode: PaymentMode;
  rate: number;
  totalStops: number | null;
  totalPaidStops: number | null;
  routeSort: number | null;
  adhoc: number | null;
  extras: number | null;
  note: string | null;
  total: number;
  avgPerStop: number;
  invoiceId: number | null;
}

export function mapInsightRow(dto: InsightRowDTO): InsightRow {
  return {
    operationId: dto.operationId,
    date: dto.operationDate,
    depot: dto.depositName,
    vrn: dto.vrn,
    vendor: dto.courierName,
    route: dto.routeName,
    paymentMode: dto.paymentMode,
    rate: dto.rate,
    stops: dto.totalStops,
    totalPaidStops: dto.totalPaidStops,
    routeSort: dto.routeSort,
    adhoc: dto.adhoc,
    extras: dto.extras,
    notes: dto.note ?? "",
    total: dto.total,
    avgPerStop: dto.avgPerStop,
    // Real rule: editable only when the row has an operationId and no invoiceId yet.
    canEdit: dto.invoiceId === null,
  };
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}

export function applyFilters(rows: InsightRow[], filters: InsightFilters): InsightRow[] {
  return rows.filter((row) => {
    if (row.date < filters.dateFrom || row.date > filters.dateTo) return false;
    if (filters.depot !== "All" && row.depot !== filters.depot) return false;
    if (filters.payment !== "All" && row.paymentMode !== filters.payment) return false;
    if (filters.search) {
      const needle = filters.search.toLowerCase();
      const haystack = `${row.route} ${row.vrn} ${row.vendor}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

export function computeTotals(rows: InsightRow[]): PageTotals {
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  return { total, avg: rows.length ? total / rows.length : 0, count: rows.length };
}
```

- [ ] **Step 4: Write the mapper test**

Create `app/(private)/daily-ops/daily-financial-insights/utils/insightsMappers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { applyFilters, computeTotals, formatGBP, mapInsightRow, type InsightRowDTO } from "./insightsMappers";
import type { InsightFilters } from "../types";

const DTO: InsightRowDTO = {
  operationId: 1, operationDate: "2026-09-08", depositName: "LCY", vrn: "LK19 XYZ", courierName: "Marek Nowak",
  routeName: "LCY-042", paymentMode: "DR", rate: 4.2, totalStops: 67, totalPaidStops: 65, routeSort: 5,
  adhoc: 0, extras: 12.35, note: null, total: 281.4, avgPerStop: 4.2, invoiceId: null,
};

describe("mapInsightRow", () => {
  it("maps every field and derives canEdit from a null invoiceId", () => {
    expect(mapInsightRow(DTO).canEdit).toBe(true);
    expect(mapInsightRow({ ...DTO, invoiceId: 900 }).canEdit).toBe(false);
  });

  it("defaults a null note to an empty string", () => {
    expect(mapInsightRow(DTO).notes).toBe("");
  });
});

describe("formatGBP", () => {
  it("formats using en-GB currency style", () => {
    expect(formatGBP(281.4)).toBe("£281.40");
  });
});

describe("applyFilters", () => {
  const rows = [mapInsightRow(DTO), mapInsightRow({ ...DTO, operationId: 2, paymentMode: "FSR", depositName: "MSE", operationDate: "2026-09-16" })];

  it("filters by payment mode", () => {
    const filters: InsightFilters = { dateFrom: "2026-09-01", dateTo: "2026-09-30", depot: "All", loop: "All", payment: "FSR", search: "" };
    expect(applyFilters(rows, filters)).toHaveLength(1);
    expect(applyFilters(rows, filters)[0].paymentMode).toBe("FSR");
  });

  it("filters by depot and date range together", () => {
    const filters: InsightFilters = { dateFrom: "2026-09-01", dateTo: "2026-09-10", depot: "LCY", loop: "All", payment: "All", search: "" };
    expect(applyFilters(rows, filters)).toHaveLength(1);
  });
});

describe("computeTotals", () => {
  it("sums total and averages across rows", () => {
    const rows = [mapInsightRow(DTO), mapInsightRow({ ...DTO, operationId: 2, total: 118.6 })];
    expect(computeTotals(rows)).toEqual({ total: 400, avg: 200, count: 2 });
  });

  it("returns a zero average for an empty list, not NaN", () => {
    expect(computeTotals([])).toEqual({ total: 0, avg: 0, count: 0 });
  });
});
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- insightsMappers`
Expected: PASS (7 tests).

- [ ] **Step 6: Create the fixture `lib/mocks/daily-ops/daily-financial-insights-fixtures.ts`**

```ts
export const DAILY_FINANCIAL_INSIGHTS_FIXTURE = {
  rows: [
    { operation_id: 1, operation_date: "2026-09-01", deposit_name: "LCY", vrn: "LK19 XYZ", courier_name: "Marek Nowak", route_name: "LCY-042", payment_mode: "DR", rate: 4.2, total_stops: 63, total_paid_stops: 61, route_sort: 5, adhoc: 0, extras: 8.2, note: null, total: 264.6, avg_per_stop: 4.2, invoice_id: null },
    { operation_id: 2, operation_date: "2026-09-02", deposit_name: "LCY", vrn: "LK19 XYZ", courier_name: "Marek Nowak", route_name: "LCY-042", payment_mode: "DR", rate: 4.0, total_stops: 52, total_paid_stops: 50, route_sort: 0, adhoc: 0, extras: 0, note: null, total: 208.0, avg_per_stop: 4.0, invoice_id: 9001 },
    { operation_id: 3, operation_date: "2026-09-04", deposit_name: "MSE", vrn: "MS20 ABC", courier_name: "Dana Kowalski", route_name: "MSE-118", payment_mode: "FSR", rate: 4.1, total_stops: 58, total_paid_stops: 56, route_sort: 0, adhoc: 12.0, extras: 8.4, note: "Traffic delay on the A40 outbound.", total: 258.2, avg_per_stop: 4.45, invoice_id: null },
    { operation_id: 4, operation_date: "2026-09-08", deposit_name: "LCY", vrn: "LK19 XYZ", courier_name: "Marek Nowak", route_name: "LCY-042", payment_mode: "DR", rate: 4.2, total_stops: 67, total_paid_stops: 65, route_sort: 5, adhoc: 0, extras: 12.35, note: null, total: 281.4, avg_per_stop: 4.2, invoice_id: null },
    { operation_id: 5, operation_date: "2026-09-09", deposit_name: "LSE", vrn: "IV21 LSE", courier_name: "Owen Pryce", route_name: "LSE-076", payment_mode: "VSR", rate: 4.0, total_stops: 49, total_paid_stops: 45, route_sort: 0, adhoc: 0, extras: 6.6, note: null, total: 202.6, avg_per_stop: 4.13, invoice_id: null },
    { operation_id: 6, operation_date: "2026-09-16", deposit_name: "MSE", vrn: "MS20 ABC", courier_name: "Dana Kowalski", route_name: "MSE-118", payment_mode: "FSR", rate: 4.0, total_stops: 50, total_paid_stops: 47, route_sort: 0, adhoc: 0, extras: 5.3, note: "One dispatch failure — left with the operations team.", total: 205.3, avg_per_stop: 4.11, invoice_id: null },
    { operation_id: 7, operation_date: "2026-09-17", deposit_name: "BASP", vrn: "RM22 BSP", courier_name: "Freya Haugen", route_name: "BASP-021", payment_mode: "DR", rate: 4.15, total_stops: 60, total_paid_stops: 58, route_sort: 0, adhoc: 0, extras: 9.5, note: null, total: 249.5, avg_per_stop: 4.15, invoice_id: null },
    { operation_id: 8, operation_date: "2026-09-22", deposit_name: "LCY", vrn: "LK19 XYZ", courier_name: "Marek Nowak", route_name: "LCY-042", payment_mode: "DR", rate: 4.2, total_stops: 64, total_paid_stops: 63, route_sort: 0, adhoc: 0, extras: 10.7, note: null, total: 259.7, avg_per_stop: 4.06, invoice_id: null },
  ],
};
```

- [ ] **Step 7: Create `hooks/useDailyFinancialInsights.ts`**

```ts
"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/mock-client";
import { useMockQuery } from "@/lib/useMockQuery";
import { DAILY_FINANCIAL_INSIGHTS_FIXTURE } from "@/lib/mocks/daily-ops/daily-financial-insights-fixtures";
import { DEFAULT_FILTERS, ENDPOINT } from "../constants";
import { applyFilters, computeTotals, mapInsightRow, type InsightRowDTO } from "../utils/insightsMappers";
import type { InsightFilters } from "../types";

export function useDailyFinancialInsights() {
  const [filters, setFilters] = useState<InsightFilters>(DEFAULT_FILTERS);

  const query = useMockQuery<{ rows: InsightRowDTO[] }>(["daily-financial-insights"], () =>
    api.get<{ rows: InsightRowDTO[] }>(ENDPOINT, {
      data: DAILY_FINANCIAL_INSIGHTS_FIXTURE,
      empty: { rows: [] },
      errorMessage: "Could not load financial insights.",
    }),
  );

  const allRows = useMemo(() => (query.data?.rows ?? []).map(mapInsightRow), [query.data]);
  const rows = useMemo(() => applyFilters(allRows, filters), [allRows, filters]);
  const totals = useMemo(() => computeTotals(rows), [rows]);

  return { ...query, rows, totals, filters, setFilters };
}
```

- [ ] **Step 8: Create `components/InsightsTable.tsx`**

```tsx
import { Button, DataTable, type Column } from "@/components/ui";
import { formatGBP } from "../utils/insightsMappers";
import type { InsightRow, PageTotals } from "../types";

function makeColumns(onEdit: (row: InsightRow) => void): Column<InsightRow>[] {
  return [
    { key: "date", header: "Date", render: (r) => r.date },
    { key: "vrn", header: "VRN", render: (r) => r.vrn },
    { key: "vendor", header: "Vendor", render: (r) => r.vendor },
    { key: "route", header: "Route", render: (r) => r.route },
    { key: "payment", header: "Payment", render: (r) => r.paymentMode },
    { key: "rate", header: "Rate", numeric: true, render: (r) => formatGBP(r.rate) },
    { key: "stops", header: "Stops", numeric: true, render: (r) => (r.stops ?? "--:--").toString() },
    { key: "totalPaid", header: "Total Paid", numeric: true, render: (r) => (r.totalPaidStops ?? "--:--").toString() },
    { key: "routeSort", header: "Route Sort", numeric: true, render: (r) => (r.routeSort ?? "--:--").toString() },
    { key: "adhoc", header: "Ad-hoc Service", numeric: true, render: (r) => (r.adhoc ? formatGBP(r.adhoc) : "--:--") },
    { key: "extras", header: "Extras", numeric: true, render: (r) => (r.extras ? formatGBP(r.extras) : "--:--") },
    { key: "notes", header: "Notes", render: (r) => r.notes || "—" },
    {
      key: "total",
      header: "Total",
      numeric: true,
      render: (r) => <strong style={{ color: "var(--secondary)" }}>{formatGBP(r.total)}</strong>,
    },
    { key: "avgPerStop", header: "Avg/Stop", numeric: true, render: (r) => formatGBP(r.avgPerStop) },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (r.canEdit ? <Button variant="ghost" onClick={() => onEdit(r)}>Edit</Button> : null),
    },
  ];
}

export function InsightsTable({ rows, totals, onEdit }: { rows: InsightRow[]; totals: PageTotals; onEdit: (row: InsightRow) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      <DataTable columns={makeColumns(onEdit)} rows={rows} getRowKey={(r) => String(r.operationId)} caption="Daily financial insights" />
      <div style={{ display: "flex", gap: "var(--space-xl)", font: "var(--type-data-md)", color: "var(--on-surface-variant)" }}>
        <span>Total: <strong>{formatGBP(totals.total)}</strong></span>
        <span>Avg: <strong>{formatGBP(totals.avg)}</strong></span>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create `components/OperationEditPanel.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button, SectionBox } from "@/components/ui";
import type { InsightRow } from "../types";

export function OperationEditPanel({ row, onClose, onSubmit }: { row: InsightRow; onClose: () => void; onSubmit: () => void }) {
  const [notes, setNotes] = useState(row.notes);

  return (
    <SectionBox label={`Edit operation — ${row.route} · ${row.date}`}>
      <label style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <span style={{ font: "var(--type-metric-label)", textTransform: "uppercase" }}>Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{ font: "var(--type-ui-aux)", padding: "var(--space-sm)", border: "var(--stroke) solid var(--outline-variant)" }}
        />
      </label>
      <div style={{ display: "flex", gap: "var(--space-sm)" }}>
        <Button variant="primary" onClick={onSubmit}>Save</Button>
        <Button variant="neutral" onClick={onClose}>Cancel</Button>
      </div>
    </SectionBox>
  );
}
```

- [ ] **Step 10: Create `components/Content.tsx`**

```tsx
"use client";

import { useState } from "react";
import { EmptyState, ErrorState, FilterBar, LoadingState, OptionSwitcher, PageFooter, PageHeader, Toast } from "@/components/ui";
import { DEPOTS, LOOPS, PAYMENT_MODES } from "../constants";
import { useDailyFinancialInsights } from "../hooks/useDailyFinancialInsights";
import { InsightsTable } from "./InsightsTable";
import { OperationEditPanel } from "./OperationEditPanel";
import type { InsightRow } from "../types";

export function Content() {
  const { rows, totals, filters, setFilters, isLoading, isError, error, refetch } = useDailyFinancialInsights();
  const [editing, setEditing] = useState<InsightRow>();
  const [toast, setToast] = useState<string>();

  function handleSave() {
    setEditing(undefined);
    setToast("Action submitted — prototype, nothing was saved.");
  }

  return (
    <>
      <PageHeader title="Daily Financial Insights" subtitle="Filterable table of financial rows tied to service partners." />

      <FilterBar
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onDateFromChange={(dateFrom) => setFilters((f) => ({ ...f, dateFrom }))}
        onDateToChange={(dateTo) => setFilters((f) => ({ ...f, dateTo }))}
        depots={DEPOTS}
        selectedDepot={filters.depot}
        onDepotChange={(depot) => setFilters((f) => ({ ...f, depot }))}
        loops={LOOPS}
        selectedLoop={filters.loop}
        onLoopChange={(loop) => setFilters((f) => ({ ...f, loop }))}
        search={filters.search}
        onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
      />
      <OptionSwitcher options={PAYMENT_MODES} value={filters.payment} onChange={(payment) => setFilters((f) => ({ ...f, payment }))} label="Filter by payment mode" />

      {isLoading ? <LoadingState rows={4} /> : null}
      {isError ? <ErrorState body={error?.message ?? "Unknown error."} onRetry={refetch} /> : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState title="No rows match these filters" body="Widen the date range or clear a filter to see financial rows." />
      ) : null}

      {!isLoading && !isError && rows.length > 0 ? <InsightsTable rows={rows} totals={totals} onEdit={setEditing} /> : null}

      {editing ? <OperationEditPanel row={editing} onClose={() => setEditing(undefined)} onSubmit={handleSave} /> : null}
      {toast ? <Toast message={toast} onDismiss={() => setToast(undefined)} /> : null}

      <PageFooter left={`${rows.length} rows`} right="Simulated data — prototype" />
    </>
  );
}
```

- [ ] **Step 11: Create `page.tsx` and `loading.tsx`**

`app/(private)/daily-ops/daily-financial-insights/page.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { Content } from "./components/Content";

export default function DailyFinancialInsightsPage() {
  return (
    <NavbarWrapper title="DAILY FINANCIAL INSIGHTS" active="daily-ops">
      <Content />
    </NavbarWrapper>
  );
}
```

`app/(private)/daily-ops/daily-financial-insights/loading.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { LoadingState } from "@/components/ui";

export default function DailyFinancialInsightsLoading() {
  return (
    <NavbarWrapper title="DAILY FINANCIAL INSIGHTS" active="daily-ops">
      <LoadingState rows={5} />
    </NavbarWrapper>
  );
}
```

- [ ] **Step 12: Run the full gate**

Run: `npm run typecheck && npm run check:tokens && npm run lint && npm run test && npm run build`
Expected: all succeed.

- [ ] **Step 13: Manual checkpoint**

Run: `npm run dev`, open `http://localhost:3000/daily-ops/daily-financial-insights`. Confirm: 8 rows visible; operation 2 (has an `invoice_id`) shows no Edit button, all others do; editing a row and clicking Save shows the toast and closes the panel; filtering payment mode to "FSR" narrows to Dana Kowalski's 2 rows.

- [ ] **Step 14: Commit**

```bash
git add "app/(private)/daily-ops/daily-financial-insights/" "lib/mocks/daily-ops/daily-financial-insights-fixtures.ts"
git commit -m "feat: add Daily Financial Insights page to Daily Ops

Reuses the shared FilterBar from Daily Operations Reports, adds a
page-local payment-mode filter, and rebuilds the real screen's edit
flow ending in the same 'nothing was saved' toast convention already
used by Week Planner and Route Balance."
```

---

### Task 9: `daily-game-plan` page

Real source: `app/(private)/daily-game-plan/` — the largest and most complex real page in the module (~20 supporting files: master-data hooks for deposits/vendors/routes/vehicles, cross-deposit reassignment cascades, bulk-payload validation). Per the research recommendation, this prototype stubs deposits/vendors as static fixture data rather than porting those master-data hooks, and does not reimplement `validateBulkPayload`'s rules or the auto-cascade status logic — both are backend-only per spec §3.6 and §9.

**Files:**
- Create: `app/(private)/daily-ops/daily-game-plan/types.ts`
- Create: `app/(private)/daily-ops/daily-game-plan/constants.ts`
- Create: `app/(private)/daily-ops/daily-game-plan/utils/gamePlanMappers.ts`
- Create: `app/(private)/daily-ops/daily-game-plan/utils/gamePlanMappers.test.ts`
- Create: `app/(private)/daily-ops/daily-game-plan/hooks/useDailyGamePlan.ts`
- Create: `app/(private)/daily-ops/daily-game-plan/components/ActionBar.tsx`
- Create: `app/(private)/daily-ops/daily-game-plan/components/OperationRow.tsx`
- Create: `app/(private)/daily-ops/daily-game-plan/components/DepositGroup.tsx`
- Create: `app/(private)/daily-ops/daily-game-plan/components/VendorsOffPanel.tsx`
- Create: `app/(private)/daily-ops/daily-game-plan/components/NotAllocatedPanel.tsx`
- Create: `app/(private)/daily-ops/daily-game-plan/components/Content.tsx`
- Create: `app/(private)/daily-ops/daily-game-plan/page.tsx`
- Create: `app/(private)/daily-ops/daily-game-plan/loading.tsx`
- Create: `lib/mocks/daily-ops/daily-game-plan-fixtures.ts`

**Interfaces:**
- Consumes: `components/ui` (`Button`, `CollapsibleSection`, `DataTable`, `Column`, `SearchField`, `StatusPill`, `SectionBox`, `Toast`, `EmptyState`, `LoadingState`, `ErrorState`, `PageHeader`, `PageFooter`) from Task 1.
- Produces: route `/daily-ops/daily-game-plan`.

- [ ] **Step 1: Create `types.ts`**

```ts
export type OperationStatus = "Working" | "Off" | "NotAllocated";

export interface Operation {
  operationId: number;
  depositId: number;
  routeName: string;
  vendorName: string;
  vehiclePlate: string;
  paymentMode: "DR" | "AD-HOC";
  rate: number;
  sort: "Yes" | "No";
  notes: string;
  status: OperationStatus;
  isAdhoc: boolean;
  adhocServiceName?: string;
}

export interface Deposit {
  depositId: number;
  depositName: string;
  operations: Operation[];
}

export interface OffEntry {
  vendorName: string;
  depositName: string;
  reason: string;
  vehiclePlate: string;
}

export interface NotAllocatedEntry {
  vendorName: string;
  depositName: string;
  usualRoute: string;
}
```

- [ ] **Step 2: Create `constants.ts`**

```ts
/**
 * Real endpoints this page composes (no single "board" endpoint exists —
 * confirmed by reading the real hook): fetchDailyGamePlanOperations({date}),
 * fetchDailyGamePlanOperationsDayOff(date), fetchDailyGamePlansByDate(date).
 * This prototype resolves all three from one fixture object instead.
 */
export const ENDPOINT = "/bff/daily-game-plan";
export const BULK_FINISH_ENDPOINT = "/bff/daily-operations-management/bulk";

export const BOARD_DATE = "2026-09-23"; // Wednesday — matches the module's running September 2026 narrative.
export const BOARD_LABEL = "Daily Game Plan - Wednesday - 23/09 - Week 38";
```

- [ ] **Step 3: Create `utils/gamePlanMappers.ts`**

```ts
import type { Deposit, NotAllocatedEntry, Operation, OffEntry } from "../types";

export interface OperationDTO {
  dailyGamePlanOperationId: number;
  depositId: number;
  depositName: string;
  routeName: string;
  fullName: string;
  vehicleRegistrationPlate: string;
  paymentMode: "DR" | "AD-HOC";
  rate: number;
  isSort: boolean;
  notes: string;
  status: "Working" | "Off" | "NotAllocated";
  isAdhoc: boolean;
  adhocServiceName?: string;
}

export interface DepositDTO {
  depositId: number;
  depositName: string;
  operations: OperationDTO[];
}

export interface OffEntryDTO {
  fullName: string;
  depositName: string;
  reason: string;
  vehicleRegistrationPlate: string;
}

export interface NotAllocatedEntryDTO {
  fullName: string;
  depositName: string;
  usualRouteName: string;
}

export interface DailyGamePlanBoardDTO {
  deposits: DepositDTO[];
  vendorsOff: OffEntryDTO[];
  notAllocated: NotAllocatedEntryDTO[];
}

export function mapOperation(dto: OperationDTO): Operation {
  return {
    operationId: dto.dailyGamePlanOperationId,
    depositId: dto.depositId,
    routeName: dto.routeName,
    vendorName: dto.fullName,
    vehiclePlate: dto.vehicleRegistrationPlate,
    paymentMode: dto.paymentMode,
    rate: dto.rate,
    sort: dto.isSort ? "Yes" : "No",
    notes: dto.notes,
    status: dto.status,
    isAdhoc: dto.isAdhoc,
    adhocServiceName: dto.adhocServiceName,
  };
}

export function mapDeposit(dto: DepositDTO): Deposit {
  return {
    depositId: dto.depositId,
    depositName: dto.depositName,
    operations: dto.operations.map(mapOperation),
  };
}

export function mapOffEntry(dto: OffEntryDTO): OffEntry {
  return {
    vendorName: dto.fullName,
    depositName: dto.depositName,
    reason: dto.reason,
    vehiclePlate: dto.vehicleRegistrationPlate || "–",
  };
}

export function mapNotAllocatedEntry(dto: NotAllocatedEntryDTO): NotAllocatedEntry {
  return {
    vendorName: dto.fullName,
    depositName: dto.depositName,
    usualRoute: dto.usualRouteName,
  };
}
```

- [ ] **Step 4: Write the mapper test**

Create `app/(private)/daily-ops/daily-game-plan/utils/gamePlanMappers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { mapDeposit, mapNotAllocatedEntry, mapOffEntry, mapOperation, type DepositDTO, type NotAllocatedEntryDTO, type OffEntryDTO } from "./gamePlanMappers";

describe("mapOperation", () => {
  it("converts isSort to a Yes/No string, matching the real screen's display convention", () => {
    expect(mapOperation({
      dailyGamePlanOperationId: 1, depositId: 12, depositName: "LCY", routeName: "LCY014",
      fullName: "Marek Nowak", vehicleRegistrationPlate: "LK19 XYZ", paymentMode: "DR",
      rate: 145.5, isSort: true, notes: "", status: "Working", isAdhoc: false,
    }).sort).toBe("Yes");
  });
});

describe("mapDeposit", () => {
  it("maps nested operations", () => {
    const dto: DepositDTO = {
      depositId: 12, depositName: "LCY",
      operations: [{ dailyGamePlanOperationId: 1, depositId: 12, depositName: "LCY", routeName: "LCY014", fullName: "Marek Nowak", vehicleRegistrationPlate: "LK19 XYZ", paymentMode: "DR", rate: 145.5, isSort: true, notes: "", status: "Working", isAdhoc: false }],
    };
    expect(mapDeposit(dto).operations).toHaveLength(1);
    expect(mapDeposit(dto).operations[0].vendorName).toBe("Marek Nowak");
  });
});

describe("mapOffEntry", () => {
  it("falls back to an em-dash when there's no vehicle plate", () => {
    const dto: OffEntryDTO = { fullName: "Casey Fitzgerald", depositName: "LCY", reason: "Annual leave", vehicleRegistrationPlate: "" };
    expect(mapOffEntry(dto).vehiclePlate).toBe("–");
  });
});

describe("mapNotAllocatedEntry", () => {
  it("carries the vendor's usual route", () => {
    const dto: NotAllocatedEntryDTO = { fullName: "Priya Sharma", depositName: "LSE", usualRouteName: "LSE076" };
    expect(mapNotAllocatedEntry(dto).usualRoute).toBe("LSE076");
  });
});
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run typecheck && npm run test -- gamePlanMappers`
Expected: both succeed (4 tests).

- [ ] **Step 6: Create the fixture `lib/mocks/daily-ops/daily-game-plan-fixtures.ts`**

```ts
export const DAILY_GAME_PLAN_FIXTURE = {
  deposits: [
    {
      deposit_id: 1, deposit_name: "LCY",
      operations: [
        { daily_game_plan_operation_id: 4821, deposit_id: 1, deposit_name: "LCY", route_name: "LCY014", full_name: "Marek Nowak", vehicle_registration_plate: "LK19 XYZ", payment_mode: "DR", rate: 145.5, is_sort: true, notes: "", status: "Working", is_adhoc: false },
        { daily_game_plan_operation_id: 4822, deposit_id: 1, deposit_name: "LCY", route_name: "Pallet Collection", full_name: "Owen Pryce", vehicle_registration_plate: "IV21 LSE", payment_mode: "AD-HOC", rate: 60, is_sort: false, notes: "", status: "Working", is_adhoc: true, adhoc_service_name: "Pallet Collection" },
      ],
    },
    {
      deposit_id: 2, deposit_name: "MSE",
      operations: [
        { daily_game_plan_operation_id: 4830, deposit_id: 2, deposit_name: "MSE", route_name: "MSE118", full_name: "Dana Kowalski", vehicle_registration_plate: "MS20 ABC", payment_mode: "DR", rate: 138.0, is_sort: true, notes: "Started 15 min late — reported to supervisor.", status: "Working", is_adhoc: false },
      ],
    },
    {
      deposit_id: 4, deposit_name: "BASP",
      operations: [
        { daily_game_plan_operation_id: 4840, deposit_id: 4, deposit_name: "BASP", route_name: "BASP021", full_name: "Freya Haugen", vehicle_registration_plate: "RM22 BSP", payment_mode: "DR", rate: 150.0, is_sort: true, notes: "", status: "Working", is_adhoc: false },
      ],
    },
  ],
  vendors_off: [
    { full_name: "Casey Fitzgerald", deposit_name: "LCY", reason: "Annual leave", vehicle_registration_plate: "" },
    { full_name: "Ibrahim Toure", deposit_name: "MSE", reason: "Sick leave", vehicle_registration_plate: "" },
  ],
  not_allocated: [
    { full_name: "Priya Sharma", deposit_name: "LSE", usual_route_name: "LSE076" },
  ],
};
```

- [ ] **Step 7: Create `hooks/useDailyGamePlan.ts`**

```ts
"use client";

import { useState } from "react";
import { api } from "@/lib/mock-client";
import { useMockQuery } from "@/lib/useMockQuery";
import { DAILY_GAME_PLAN_FIXTURE } from "@/lib/mocks/daily-ops/daily-game-plan-fixtures";
import { BOARD_DATE, BULK_FINISH_ENDPOINT, ENDPOINT } from "../constants";
import { mapDeposit, mapNotAllocatedEntry, mapOffEntry, type DailyGamePlanBoardDTO } from "../utils/gamePlanMappers";

const EMPTY_BOARD: DailyGamePlanBoardDTO = { deposits: [], vendorsOff: [], notAllocated: [] };

export function useDailyGamePlan() {
  const [search, setSearch] = useState("");
  const [finishedDeposits, setFinishedDeposits] = useState<Set<number>>(new Set());

  const query = useMockQuery<DailyGamePlanBoardDTO>(["daily-game-plan", BOARD_DATE], () =>
    api.get<DailyGamePlanBoardDTO>(ENDPOINT, {
      data: DAILY_GAME_PLAN_FIXTURE,
      empty: EMPTY_BOARD,
      errorMessage: "Could not load the daily game plan.",
    }),
  );

  const board = query.data ?? EMPTY_BOARD;
  const deposits = board.deposits.map(mapDeposit).map((deposit) => ({
    ...deposit,
    operations: search
      ? deposit.operations.filter((op) => `${op.routeName} ${op.vendorName}`.toLowerCase().includes(search.toLowerCase()))
      : deposit.operations,
  }));
  const vendorsOff = board.vendorsOff.map(mapOffEntry);
  const notAllocated = board.notAllocated.map(mapNotAllocatedEntry);

  function toggleFinished(depositId: number) {
    setFinishedDeposits((prev) => {
      const next = new Set(prev);
      if (next.has(depositId)) next.delete(depositId);
      else next.add(depositId);
      return next;
    });
  }

  /**
   * Real bulk-finish validates the payload server-side (validateBulkPayload:
   * every dailyGamePlanOperationId and createdBy must be a positive finite
   * number, no duplicate ids) — not reimplemented here per spec §9. This
   * prototype's submit only calls the mock POST and reports success.
   */
  async function submitBulkFinish() {
    await api.post(BULK_FINISH_ENDPOINT, { items: Array.from(finishedDeposits) });
  }

  return { ...query, deposits, vendorsOff, notAllocated, search, setSearch, finishedDeposits, toggleFinished, submitBulkFinish };
}
```

- [ ] **Step 8: Create `components/ActionBar.tsx`**

```tsx
import { SearchField } from "@/components/ui";
import { BOARD_LABEL } from "../constants";

export function ActionBar({ search, onSearchChange }: { search: string; onSearchChange: (value: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-lg)", flexWrap: "wrap" }}>
      <h2 style={{ margin: 0, font: "var(--type-headline-sm)", color: "var(--on-surface)" }}>{BOARD_LABEL}</h2>
      <SearchField placeholder="Search route or vendor" defaultValue={search} onChange={onSearchChange} />
    </div>
  );
}
```

- [ ] **Step 9: Create `components/OperationRow.tsx`**

```tsx
import { StatusPill } from "@/components/ui";
import type { Operation } from "../types";

export function OperationRow({ operation }: { operation: Operation }) {
  return (
    <tr>
      <td>
        {operation.routeName}
        {operation.isAdhoc ? <StatusPill tone="info" showIcon={false}>AD-HOC</StatusPill> : null}
      </td>
      <td>{operation.vendorName}</td>
      <td>{operation.sort}</td>
      <td>{operation.vehiclePlate || "NO VEHICLE"}</td>
      <td>{operation.notes || "—"}</td>
      <td className="num">£{operation.rate.toFixed(2)}</td>
    </tr>
  );
}
```

- [ ] **Step 10: Create `components/DepositGroup.tsx`**

```tsx
"use client";

import { Button, CollapsibleSection, StatusPill } from "@/components/ui";
import { OperationRow } from "./OperationRow";
import type { Deposit } from "../types";

export function DepositGroup({
  deposit,
  isFinished,
  onToggleFinished,
}: {
  deposit: Deposit;
  isFinished: boolean;
  onToggleFinished: () => void;
}) {
  return (
    <CollapsibleSection
      label={`${deposit.depositName} — ${deposit.operations.length} operations`}
      meta={
        <>
          {isFinished ? <StatusPill tone="success">Finished</StatusPill> : <StatusPill tone="neutral">In Progress</StatusPill>}
          <Button variant={isFinished ? "neutral" : "primary"} onClick={onToggleFinished}>
            {isFinished ? "Reopen" : "Finish"}
          </Button>
        </>
      }
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", font: "var(--type-table-header)", color: "var(--on-surface)" }}>
              <th>Route / Service</th>
              <th>Vendor</th>
              <th>Sort</th>
              <th>Vehicle</th>
              <th>Notes</th>
              <th className="num">Rate</th>
            </tr>
          </thead>
          <tbody>
            {deposit.operations.map((op) => (
              <OperationRow key={op.operationId} operation={op} />
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
}
```

- [ ] **Step 11: Create `components/VendorsOffPanel.tsx` and `components/NotAllocatedPanel.tsx`**

```tsx
import { SectionBox } from "@/components/ui";
import type { OffEntry } from "../types";

export function VendorsOffPanel({ entries }: { entries: OffEntry[] }) {
  return (
    <SectionBox label={`Off (${entries.length})`}>
      {entries.length === 0 ? (
        <span style={{ color: "var(--text-quaternary)" }}>No one off today.</span>
      ) : (
        entries.map((e) => (
          <div key={e.vendorName} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-md)" }}>
            <span>{e.vendorName} · {e.depositName}</span>
            <span style={{ color: "var(--text-quaternary)" }}>{e.reason}</span>
          </div>
        ))
      )}
    </SectionBox>
  );
}
```

```tsx
import { SectionBox } from "@/components/ui";
import type { NotAllocatedEntry } from "../types";

export function NotAllocatedPanel({ entries }: { entries: NotAllocatedEntry[] }) {
  return (
    <SectionBox label={`Not Allocated (${entries.length})`}>
      {entries.length === 0 ? (
        <span style={{ color: "var(--text-quaternary)" }}>Everyone is allocated.</span>
      ) : (
        entries.map((e) => (
          <div key={e.vendorName} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-md)" }}>
            <span>{e.vendorName} · {e.depositName}</span>
            <span style={{ color: "var(--state-alert)" }}>Usually {e.usualRoute}</span>
          </div>
        ))
      )}
    </SectionBox>
  );
}
```

The second snippet is `components/NotAllocatedPanel.tsx`; the first is `components/VendorsOffPanel.tsx` — two separate files, each exporting one component, per the file list above.

- [ ] **Step 12: Create `components/Content.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button, EmptyState, ErrorState, LoadingState, PageFooter, PageHeader, Toast } from "@/components/ui";
import { useDailyGamePlan } from "../hooks/useDailyGamePlan";
import { ActionBar } from "./ActionBar";
import { DepositGroup } from "./DepositGroup";
import { VendorsOffPanel } from "./VendorsOffPanel";
import { NotAllocatedPanel } from "./NotAllocatedPanel";

export function Content() {
  const {
    deposits, vendorsOff, notAllocated, search, setSearch,
    finishedDeposits, toggleFinished, submitBulkFinish,
    isLoading, isError, error, refetch,
  } = useDailyGamePlan();
  const [toast, setToast] = useState<string>();

  async function handleBulkFinish() {
    await submitBulkFinish();
    setToast("Action submitted — prototype, nothing was sent to drivers.");
  }

  return (
    <>
      <PageHeader title="Daily Game Plan" subtitle="Dispatcher board: deposits, operations, unallocated vendors and off-panel." />

      <ActionBar search={search} onSearchChange={setSearch} />

      {isLoading ? <LoadingState rows={4} /> : null}
      {isError ? <ErrorState body={error?.message ?? "Unknown error."} onRetry={refetch} /> : null}

      {!isLoading && !isError && deposits.every((d) => d.operations.length === 0) ? (
        <EmptyState title="No operations today" body="Nothing is scheduled for this board yet." />
      ) : null}

      {!isLoading && !isError
        ? deposits.map((deposit) => (
            <DepositGroup
              key={deposit.depositId}
              deposit={deposit}
              isFinished={finishedDeposits.has(deposit.depositId)}
              onToggleFinished={() => toggleFinished(deposit.depositId)}
            />
          ))
        : null}

      {!isLoading && !isError ? (
        <div style={{ display: "flex", gap: "var(--space-lg)", flexWrap: "wrap" }}>
          <VendorsOffPanel entries={vendorsOff} />
          <NotAllocatedPanel entries={notAllocated} />
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <Button variant="dark" onClick={handleBulkFinish} disabled={finishedDeposits.size === 0}>
          Submit Finished Deposits ({finishedDeposits.size})
        </Button>
      ) : null}

      {toast ? <Toast message={toast} onDismiss={() => setToast(undefined)} /> : null}

      <PageFooter left={`${deposits.reduce((n, d) => n + d.operations.length, 0)} operations`} right="Simulated data — prototype" />
    </>
  );
}
```

- [ ] **Step 13: Create `page.tsx` and `loading.tsx`**

`app/(private)/daily-ops/daily-game-plan/page.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { Content } from "./components/Content";

export default function DailyGamePlanPage() {
  return (
    <NavbarWrapper title="DAILY GAME PLAN" active="daily-ops">
      <Content />
    </NavbarWrapper>
  );
}
```

`app/(private)/daily-ops/daily-game-plan/loading.tsx`:
```tsx
import NavbarWrapper from "../../components/NavbarWrapper";
import { LoadingState } from "@/components/ui";

export default function DailyGamePlanLoading() {
  return (
    <NavbarWrapper title="DAILY GAME PLAN" active="daily-ops">
      <LoadingState rows={6} />
    </NavbarWrapper>
  );
}
```

- [ ] **Step 14: Run the full gate**

Run: `npm run typecheck && npm run check:tokens && npm run lint && npm run test && npm run build`
Expected: all succeed.

- [ ] **Step 15: Manual checkpoint**

Run: `npm run dev`, open `http://localhost:3000/daily-ops/daily-game-plan`. Confirm: 3 deposit groups render (LCY with 2 operations including the AD-HOC one, MSE with 1, BASP with 1); "Finish" toggles a deposit to "Finished" and enables the bulk-submit button; the Off and Not Allocated panels show Casey/Ibrahim and Priya respectively; submitting shows the toast.

- [ ] **Step 16: Commit**

```bash
git add "app/(private)/daily-ops/daily-game-plan/" "lib/mocks/daily-ops/daily-game-plan-fixtures.ts"
git commit -m "feat: add Daily Game Plan page to Daily Ops

Rebuilds the dispatcher board (deposits, operations, off/not-allocated
panels, bulk-finish) with static fixture master data instead of the
real page's live deposit/vendor/route/vehicle hooks, per spec §3.6."
```

---

### Task 10: Final integration pass

**Files:**
- Modify: `README.md` (add a "Daily Ops" section, following the existing "Route Balance" section's style)

**Interfaces:**
- Consumes: everything from Tasks 1–9.
- Produces: nothing new — this is the whole-module verification gate plus documentation.

- [ ] **Step 1: Run every gate across the whole repository**

Run: `npm run typecheck && npm run check:tokens && npm run lint && npm run test && npm run build`
Expected: all five succeed. `check:tokens` now scans `styles/`, `components/ui/` (including the Task 7 `FilterBar` addition), `lib/{mock-client,useMockQuery,case}.ts`, and the entire `app/(private)/daily-ops/` tree (hub + 6 pages) — 0 violations.

- [ ] **Step 2: Confirm every page is reachable and every required state works**

Run: `npm run dev`. For each of the 6 pages plus the hub, open it once at the default URL and once each with `?mock=empty`, `?mock=error`, `?mock=slow` appended:
- `/daily-ops`
- `/daily-ops/current-performance`
- `/daily-ops/current-month`
- `/daily-ops/daily-performance-insight`
- `/daily-ops/daily-operations-reports`
- `/daily-ops/daily-financial-insights`
- `/daily-ops/daily-game-plan`

Confirm: no console errors, every empty/error/slow variant renders the right `components/ui` state, and clicking every hub card lands on a working page (not a 404 — this was expected during Task 2's checkpoint and must be resolved now that Tasks 3–9 exist).

- [ ] **Step 3: Confirm the existing pages are untouched**

Run: `git diff --stat main -- "app/(private)/week-planner" "app/(private)/route-balance"` (or `git status` if working directly on `main`)
Expected: no output — neither folder was touched by any task in this plan, per spec §2 and divergence 2.

- [ ] **Step 4: Update `README.md`**

Add a new section after the existing "Route Balance — Operations e Rebalance" section (matching its style and language):

```markdown
## Daily Ops — Industrial Terminal design system

- `/daily-ops`: índice com as 6 pages do módulo Daily Ops.
- `/daily-ops/current-performance`, `/current-month`, `/daily-performance-insight`,
  `/daily-operations-reports`, `/daily-financial-insights`, `/daily-game-plan`:
  reconstruções das telas reais equivalentes de `logix-sphere-frontend-nextjs`,
  com dados mock e sem nenhuma chamada de backend/banco.

Estas 6 pages são a primeira aplicação do Design System **Industrial Terminal**
(`styles/tokens.css`, `components/ui/`, `lib/mock-client.ts`) como base central
de estilo deste repositório — ver
`docs/superpowers/specs/2026-09-23-daily-ops-design-system-migration-design.md`.
O Week Planner e o Route Balance continuam no padrão anterior de cópia literal
do Figma, por decisão registrada nesse mesmo documento (seção 2): a regra do
novo sistema vale para pages novas a partir desta entrega, não retroativamente.

Qualquer page futura construída sob esse sistema deve seguir a skill
`.claude/skills/logixsphere-page/SKILL.md` — ela documenta as seis regras, a
estrutura de pastas obrigatória e onde cada peça do sistema mora.

Para ver os 4 estados obrigatórios de qualquer uma das 6 pages sem editar
código, adicione `?mock=empty`, `?mock=error` ou `?mock=slow` à URL.

Validação: `npm run typecheck`, `npm run check:tokens`, `npm run lint`,
`npm run test`, `npm run build`, e verificação manual dos 4 estados e da
navegação a partir do hub em `/daily-ops`.
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: document the Daily Ops module and the Industrial Terminal design system

Records the new central styling rule, the explicit decision to leave
Week Planner and Route Balance on the old pattern, and where the
logixsphere-page skill lives for future pages."
```

---

## Summary

10 tasks: a design-system foundation (tokens, components, mock infra, lint gate), a navigation hub, 6 real Daily Ops pages rebuilt with mock data (pilot → two shared-pattern table pages → the largest dispatcher board last), a project skill making the rule executable for future requests, and a final whole-module verification pass. Every task ends with `npm run typecheck && npm run check:tokens && npm run lint && npm run test && npm run build` green and a commit — nothing in `week-planner/` or `route-balance/` is ever touched, and nothing anywhere calls a real backend.

