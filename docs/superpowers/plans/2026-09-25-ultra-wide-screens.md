# Telas ultra-wide — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que as pages densas do LogixSphere aproveitem monitores de 2560 a 5120px, e que o conteúdo passe a centrar-se no ecrã em vez da área que sobra da rail de navegação.

**Architecture:** Um degrau novo na escala de largura, `ultra`, que abaixo de 2200px é literalmente igual a `wide` e acima disso solta para 3520px. Duas rungs novas de breakpoint (`3xl`, `4xl`) dão colunas aos grids de contagem variável. Uma linha de CSS no wrapper de conteúdo torna a caixa simétrica em relação à rail, o que centra tudo o que está lá dentro no ecrã físico.

**Tech Stack:** Next.js (App Router), Tailwind CSS 3 com tokens em CSS custom properties, vitest + @testing-library/react em jsdom, e um harness de medição em HTML estático conduzido pelo browser.

**Spec:** `docs/superpowers/specs/2026-09-25-ultra-wide-screens-design.md`

## Global Constraints

- **O limiar é 2200px, repetido onde o CSS obriga, nunca divergente.** O token e o breakpoint `3xl` partilham o número. CSS `@media` não lê custom properties, por isso o número 2200 aparece literal em cinco sítios (`globals.css` ×2, `home-new.css` ×2, `tailwind.config.js` ×1); a regra não é "nunca duplicar" — é "nunca escrever um número diferente nesses sítios". Cada um dos cinco leva um comentário a apontar para os outros.
- **Teto de `ultra`: 220rem (3520px).** `wide` continua em 100rem (1600px), `standard` em 80rem, `narrow` em 48rem.
- **Rungs:** `3xl: 2200px`, `4xl: 3000px`. Não existe terceira rung — acima de 3000 o container satura e não há nada de novo a dizer. São declaradas como API para trabalho futuro; o único reflow implementado (a home) usa media queries escritas à mão nos mesmos dois limiares, não os utilitários `3xl:`/`4xl:`.
- **Abaixo de 2200px nada muda, com uma exceção declarada:** a centragem da Task 4, que desloca o conteúdo 29px para a esquerda (87px com a rail expandida) — mas só a partir de 1024px. Abaixo de 1024px a centragem não se aplica: a sidebar já consome demasiado de um ecrã apertado para gastar metade em padding simétrico.
- **Grids de contagem fixa não ganham colunas.** Nunca. Mais colunas que itens encolhe os cards em vez de os multiplicar.
- **Bentos com `span` não ganham colunas.** A aritmética dos spans está presa à contagem atual.
- **Tokens vivem em dois sítios, sempre a partir da mesma var:** `app/globals.css` (`:root`) e `tailwind.config.js` (`theme.extend.maxWidth`), porque três telas são CSS puro e precisam do `var()` direto.
- **O portal do motorista não migra.** current-month, deductions, mobile-invoice, subcontractor, requests-admin, current-performance, daily-performance-insight ficam em 1840px.
- Comandos: `npm test` (vitest run), `npm run typecheck` (baseline), `npm run typecheck:all` (tsc --noEmit), `npm run dev`.

---

### Task 1: Harness de medição e baseline

Esta task vem primeiro porque é o teste de tudo o que vem depois. As Tasks 3, 4 e 5 são CSS e não se conseguem testar em jsdom — `getComputedStyle` em jsdom não resolve media queries. E 3440 e 5120 não cabem no painel físico da máquina, portanto um screenshot mente exatamente sobre o que este trabalho decide. A saída aqui é uma medição, não uma imagem.

**Files:**
- Create: `public/ultrawide-harness.html`
- Create: `docs/superpowers/plans/2026-09-25-ultra-wide-baseline.md`

**Interfaces:**
- Consumes: nada.
- Produces: uma página em `http://localhost:3000/ultrawide-harness.html?route=<rota>` que imprime no `console` linhas com o prefixo `[UW]`, uma por viewport, no formato
  `[UW] {"width":3440,"selector":"dgp-page-frame-container","contentWidth":1600,"centreOffset":29,"cols":{...}}`.
  As Tasks 3, 4 e 5 leem `contentWidth`, `centreOffset` e `cols` desta saída.

- [ ] **Step 1: Escrever o harness**

Criar `public/ultrawide-harness.html`. É servido estaticamente pelo Next em `/ultrawide-harness.html`, portanto os iframes são same-origin e o seu DOM é legível. Os iframes têm largura de layout real (5120px) e só são *desenhados* em escala, para caberem no ecrã.

```html
<!doctype html>
<meta charset="utf-8">
<title>Ultra-wide harness</title>
<style>
  body { margin: 0; background: #111; color: #eee; font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; }
  #out { padding: 12px; white-space: pre; line-height: 1.6; }
  .rig { overflow: hidden; border-top: 1px solid #333; }
  .rig > iframe { display: block; border: 0; transform-origin: 0 0; }
</style>
<div id="out">a medir…</div>
<div id="rigs"></div>
<script>
const WIDTHS = [1920, 2560, 3440, 3840, 5120];
const HEIGHT = 1440;
const SCALE = 0.16;

// O primeiro selector que existir na page é o container de conteúdo.
const CONTAINER = [
  '.dgp-page-frame-container',
  '.home-new',
  '.my-performance',
  'main[class*="max-w-content"]',
].join(', ');

// Grids nomeados. Ausentes numa dada rota: simplesmente não aparecem no resultado.
const GRIDS = {
  homeKpis:     '.home-new__kpis',
  homePageGrid: '.home-new__page-grid',
  homeWorkspace:'.home-new__workspace',
  // Especifico o bastante para nao colidir com a faixa de stats do
  // service-partner-invoices, que partilha o prefixo `grid-cols-2 sm:grid-cols-3`.
  cardGrid:     '.grid.grid-cols-2.sm\\:grid-cols-3.xl\\:grid-cols-5',
};

const route = new URLSearchParams(location.search).get('route') || '/vendor';
const out = document.getElementById('out');
const rigs = document.getElementById('rigs');

function measure(win, width) {
  const doc = win.document;
  const el = doc.querySelector(CONTAINER);
  if (!el) return { width, error: 'container nao encontrado' };
  const r = el.getBoundingClientRect();
  const cols = {};
  for (const [name, sel] of Object.entries(GRIDS)) {
    const g = doc.querySelector(sel);
    if (g) {
      cols[name] = win.getComputedStyle(g)
        .gridTemplateColumns.split(' ').filter(Boolean).length;
    }
  }
  return {
    width,
    selector: (el.className || '').toString().split(/\s+/)[0] || el.tagName.toLowerCase(),
    contentWidth: Math.round(r.width),
    // >0 significa deslocado para a direita do centro do ecra.
    centreOffset: Math.round((r.left + r.width / 2) - width / 2),
    cols,
  };
}

function load(width) {
  return new Promise((resolve) => {
    const rig = document.createElement('div');
    rig.className = 'rig';
    rig.style.height = Math.round(HEIGHT * SCALE) + 'px';
    const f = document.createElement('iframe');
    f.width = String(width);
    f.height = String(HEIGHT);
    f.style.transform = 'scale(' + SCALE + ')';
    f.src = route;
    f.addEventListener('load', () => {
      // Deixa o layout do cliente assentar antes de medir.
      setTimeout(() => {
        let result;
        try { result = measure(f.contentWindow, width); }
        catch (e) { result = { width, error: String(e && e.message || e) }; }
        resolve(result);
      }, 1200);
    });
    rig.appendChild(f);
    rigs.appendChild(rig);
  });
}

(async () => {
  const rows = [];
  for (const w of WIDTHS) {
    const r = await load(w);
    rows.push(r);
    console.log('[UW] ' + JSON.stringify(r));
    out.textContent = 'rota: ' + route + '\n\n' + rows.map(x => JSON.stringify(x)).join('\n');
  }
  console.log('[UW] done ' + route);
})();
</script>
```

- [ ] **Step 2: Arrancar o dev server e autenticar**

Run: `npm run dev`

As rotas medidas são privadas (passam por `RequireAuthClient`). O iframe é same-origin e partilha a sessão, mas **a sessão tem de existir**: abrir `http://localhost:3000/vendor` no browser e fazer login antes de usar o harness. Um `contentWidth` igual em todos os viewports é o sintoma de estar a medir o ecrã de login.

- [ ] **Step 3: Capturar a baseline**

Abrir, uma de cada vez, e ler as linhas `[UW]` do console:

```
http://localhost:3000/ultrawide-harness.html?route=/vendor
http://localhost:3000/ultrawide-harness.html?route=/home
http://localhost:3000/ultrawide-harness.html?route=/current-performance
```

`/vendor` é a tabela densa, `/home` é o dashboard de grid em CSS puro, `/current-performance` é o portal do motorista — que **não** deve mudar em nenhuma task deste plano, e por isso é o controlo.

Valores esperados hoje, para reconhecer que o harness está a medir bem: em `/vendor` o `contentWidth` satura em 1600 a partir dos 1920, e o `centreOffset` é +29 (rail recolhida).

- [ ] **Step 4: Gravar a baseline**

Escrever `docs/superpowers/plans/2026-09-25-ultra-wide-baseline.md` com as linhas `[UW]` tal como saíram, uma tabela por rota, e a data. É contra este ficheiro que as Tasks 3 a 5 se verificam, e é ele que prova que `/current-performance` não mexeu.

- [ ] **Step 5: Commit**

```bash
git add public/ultrawide-harness.html docs/superpowers/plans/2026-09-25-ultra-wide-baseline.md
git commit -m "test: add ultra-wide measurement harness and baseline"
```

---

### Task 2: O degrau `ultra` e as duas rungs

**Files:**
- Modify: `app/globals.css:24-28`
- Modify: `tailwind.config.js:13-15` e `tailwind.config.js:18-22`
- Modify: `app/(private)/components/DgpPageFrame.tsx:7-14`
- Modify: `app/(private)/components/StandardPageLayout.tsx:9-15`
- Test: `app/(private)/components/DgpPageFrame.test.tsx`
- Test: `app/(private)/components/StandardPageLayout.test.tsx`

**Interfaces:**
- Consumes: nada.
- Produces: `type DgpPageFrameWidth = 'narrow' | 'standard' | 'wide' | 'ultra' | 'full'`, exportado de `app/(private)/components/DgpPageFrame.tsx` e importado tal e qual por `StandardPageLayout.tsx`. A classe utilitária `max-w-content-ultra` e a var `--content-ultra`. As Task 3 e 5 dependem dos dois nomes exatos.

- [ ] **Step 1: Escrever os testes que falham**

Acrescentar a `app/(private)/components/DgpPageFrame.test.tsx`, dentro do `describe('DgpPageFrame width')` que já lá está:

```tsx
  it('applies the ultra token', () => {
    render(<DgpPageFrame width="ultra"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-content-ultra');
    expect(container()).not.toHaveClass('max-w-content-wide');
  });

  it('keeps ultra capped — it is a step on the scale, not an escape from it', () => {
    render(<DgpPageFrame width="ultra"><p>content</p></DgpPageFrame>);
    expect(container()).not.toHaveClass('max-w-none');
  });
```

E a `app/(private)/components/StandardPageLayout.test.tsx`, dentro do `describe('StandardPageLayout width')`:

```tsx
  it('accepts the ultra token through the shared union', () => {
    render(<StandardPageLayout width="ultra"><p>content</p></StandardPageLayout>);
    expect(main()).toHaveClass('max-w-content-ultra');
    expect(main()).not.toHaveClass('max-w-content-narrow');
  });
```

- [ ] **Step 2: Correr os testes e confirmar que falham**

Run: `npm test -- app/\(private\)/components`
Expected: FAIL. Os três testes novos falham em compilação de tipos ou em `toHaveClass`, porque `'ultra'` não existe no union nem nos mapas de classe.

- [ ] **Step 3: Declarar a var**

Em `app/globals.css`, substituir o bloco das linhas 24-28:

```css
  /* Escala de largura de conteúdo. Ver docs/superpowers/specs/2026-09-24-wide-screen-content-width-design.md */
  --content-narrow: 48rem;
  --content-standard: 80rem;
  --content-wide: 100rem;

  /* Degrau ultra-wide: igual a `wide` até ao limiar, solta acima dele.
     Ver docs/superpowers/specs/2026-09-25-ultra-wide-screens-design.md */
  --content-ultra: 100rem;
}

@media (min-width: 2200px) {
  :root { --content-ultra: 220rem; }
}
```

Atenção ao `}` — o `--content-ultra` fica **dentro** do `:root` existente, e o `@media` vem **depois** dele, não aninhado.

- [ ] **Step 4: Expor a var e as rungs ao Tailwind**

Em `tailwind.config.js`, dentro de `theme.extend`, a seguir ao bloco `maxWidth` das linhas 18-22 — que ganha ele próprio uma entrada:

```js
      maxWidth: {
        'content-narrow': 'var(--content-narrow)',
        'content-standard': 'var(--content-standard)',
        'content-wide': 'var(--content-wide)',
        'content-ultra': 'var(--content-ultra)',
      },
      screens: {
        '3xl': '2200px',
        '4xl': '3000px',
      },
```

**Tem de ser `theme.extend.screens`, não `theme.container.screens`.** O `"2xl": "1400px"` das linhas 13-15 vive dentro de `theme.container` e configura só as larguras da classe `.container` — não gera variante nenhuma. Os prefixos utilitários vêm de `theme.screens`, que este projeto nunca declara, portanto as variantes são as do Tailwind por omissão (e o `2xl:` deste código dispara aos 1536px, não aos 1400). Pôr as rungs em `container.screens` não geraria `3xl:grid-cols-7`, e a Task 5 falharia sem erro nenhum.

Confirmar que as variantes passaram mesmo a existir:

```bash
node -e "const r=require('tailwindcss/resolveConfig')(require('./tailwind.config.js')); console.log(JSON.stringify(r.theme.screens))"
```

Expected: a saída inclui `"3xl":"2200px"` e `"4xl":"3000px"`, a par dos cinco defaults.

- [ ] **Step 5: Acrescentar o membro ao union e aos dois mapas**

Em `app/(private)/components/DgpPageFrame.tsx`, linhas 7-14:

```tsx
export type DgpPageFrameWidth = 'narrow' | 'standard' | 'wide' | 'ultra' | 'full';

const widthClass: Record<DgpPageFrameWidth, string> = {
  narrow: 'w-full max-w-content-narrow',
  standard: 'w-full max-w-content-standard',
  wide: 'w-full max-w-content-wide',
  ultra: 'w-full max-w-content-ultra',
  full: 'w-full max-w-none',
};
```

Em `app/(private)/components/StandardPageLayout.tsx`, linhas 9-15:

```tsx
const widthClass: Record<DgpPageFrameWidth, string> = {
  narrow: 'max-w-content-narrow',
  standard: 'max-w-content-standard',
  wide: 'max-w-content-wide',
  ultra: 'max-w-content-ultra',
  full: 'max-w-none',
};
```

Os defaults não mudam: `standard` no `DgpPageFrame`, `narrow` no `StandardPageLayout`.

- [ ] **Step 6: Correr os testes e confirmar que passam**

Run: `npm test -- app/\(private\)/components`
Expected: PASS, incluindo os testes que já existiam. Nenhum deles deve ter sido tocado.

Run: `npm run typecheck:all`
Expected: sem erros novos. `Record<DgpPageFrameWidth, string>` garante que os dois mapas ficaram exaustivos — se faltasse `ultra` num deles, isto falhava.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css tailwind.config.js "app/(private)/components/DgpPageFrame.tsx" "app/(private)/components/StandardPageLayout.tsx" "app/(private)/components/DgpPageFrame.test.tsx" "app/(private)/components/StandardPageLayout.test.tsx"
git commit -m "feat: add the ultra step and the 3xl/4xl rungs to the width scale"
```

---

### Task 3: Migrar as 17 pages para `ultra`

**Files:**
- Modify (16 call sites, uma linha cada): `app/(private)/financial-invoices/page.tsx:303`, `app/(private)/week-planner/WeekPlannerPageContent.tsx:7564`, `app/(private)/requests-inbox/page.tsx:513`, `app/(private)/service-partner-invoices/page.tsx:102`, `app/(private)/vendor-performance/page.tsx:198`, `app/(private)/week-planner-operations/page.tsx:2233`, `app/(private)/week-planner-operations/DailyOperationsManagementPage.tsx:1937`, `app/(private)/requests/page.tsx:296`, `app/(private)/daily-operations-reports/page.tsx:437`, `app/(private)/daily-financial-insights/page.tsx:399`, `app/(private)/vehicles/page.tsx:417`, `app/(private)/contract-management/page.tsx:557`, `app/(private)/assets/page.tsx:166`, `app/(private)/deductions-disbursements-recharges/page.tsx:824`, `app/(private)/vendor/page.tsx:334`, `app/(private)/adhoc-works-invoice-management/page.tsx:358`
- Modify: `app/(private)/home/home-new.css:1`
- Modify: `app/(private)/components/NavbarWrapper.css:203`

**Interfaces:**
- Consumes: `width="ultra"` e `var(--content-ultra)` da Task 2.
- Produces: nada de novo. As Tasks 4 e 5 medem estas pages.

- [ ] **Step 1: Migrar os 16 call sites do `DgpPageFrame`**

São todos `width="wide"` → `width="ultra"`, e **só** os do `DgpPageFrame`. Os cinco do `StandardPageLayout` (mobile-invoice, deductions, requests-admin, current-month, subcontractor) são o portal do motorista e **ficam em `wide`**.

```bash
for f in \
  "app/(private)/financial-invoices/page.tsx" \
  "app/(private)/week-planner/WeekPlannerPageContent.tsx" \
  "app/(private)/requests-inbox/page.tsx" \
  "app/(private)/service-partner-invoices/page.tsx" \
  "app/(private)/vendor-performance/page.tsx" \
  "app/(private)/week-planner-operations/page.tsx" \
  "app/(private)/week-planner-operations/DailyOperationsManagementPage.tsx" \
  "app/(private)/requests/page.tsx" \
  "app/(private)/daily-operations-reports/page.tsx" \
  "app/(private)/daily-financial-insights/page.tsx" \
  "app/(private)/vehicles/page.tsx" \
  "app/(private)/contract-management/page.tsx" \
  "app/(private)/assets/page.tsx" \
  "app/(private)/deductions-disbursements-recharges/page.tsx" \
  "app/(private)/vendor/page.tsx" \
  "app/(private)/adhoc-works-invoice-management/page.tsx" \
; do
  perl -pi -e 's/width="wide"/width="ultra"/g' "$f"
done
```

- [ ] **Step 2: Confirmar que só mudou o que devia**

Run: `git diff --stat && grep -rn 'width="wide"' app --include="*.tsx" | grep -v test`

Expected: 16 ficheiros alterados, uma linha cada. O `grep` deve devolver **exatamente seis** linhas sobreviventes — os cinco `StandardPageLayout` do portal do motorista, mais `app/(private)/home/page.legacy.tsx:100`, que o Next não monta. Qualquer outra linha é um call site migrado por engano.

- [ ] **Step 3: Migrar a home, que declara a largura em CSS**

`app/(private)/home/home-new.css:1` contém `max-width:var(--content-wide);` dentro da regra `.home-new`. Trocar por `var(--content-ultra)`:

```bash
perl -pi -e 's/\Qmax-width:var(--content-wide);\E/max-width:var(--content-ultra);/' "app/(private)/home/home-new.css"
grep -c 'var(--content-ultra)' "app/(private)/home/home-new.css"
```

Expected: `1`.

- [ ] **Step 4: Desarmar o override que anularia a `requests`**

`app/(private)/components/NavbarWrapper.css:199-205` impõe `max-width: 1840px` ao container da `requests`. Sem isto, a page migra e o CSS anula-a em silêncio. Trocar **só o valor**, na linha 203:

```bash
perl -pi -e 's/^(\s*max-width: )1840px;$/${1}var(--content-ultra);/ if $. == 203' "app/(private)/components/NavbarWrapper.css"
sed -n '199,206p' "app/(private)/components/NavbarWrapper.css"
```

Expected: o bloco `.app-imported-page[data-page="requests"] .dgp-page-frame-container` mostra `max-width: var(--content-ultra);`. O `width: min(calc(100% - 48px), 1840px)` da linha acima **fica como está** nesta task — a Task 4 trata dele.

As outras ocorrências de 1840px (linhas 190-195) são o portal do motorista e **não se tocam**.

- [ ] **Step 5: Verificar com o harness**

Run: `npm run dev`, depois abrir `http://localhost:3000/ultrawide-harness.html?route=/vendor` e `?route=/home`.

Expected, em ambas. O harness mede a **caixa** do container, e sob `box-sizing: border-box` o
`max-width` já inclui o padding do elemento — portanto estes números são `min(viewport − 58, 3520)`,
com a rail descontada de um lado só, que é o estado antes da Task 4:

| width | contentWidth |
|---|---|
| 1920 | 1600 |
| 2560 | 2446 |
| 3440 | 3326 |
| 3840 | 3520 |
| 5120 | 3520 |

São `min(viewport − 114, 3520)`. Os 114 são a rail de 58px **mais os 28px de padding de cada
lado que o `.app-imported-page` já tem** — medido no browser, não deduzido. E note-se que 1920,
3840 e 5120 estão todos no teto, logo não testam a fórmula: só 2560 e 3440 a exercitam.

O `centreOffset` continua +29 — a centragem é a Task 4. Tolerância de ±2px. A home dá os mesmos
números que o vendor: tem padding próprio de 28px em vez do gutter de 48px, mas a caixa é limitada
pela mesma largura disponível e pelo mesmo teto.

E `?route=/current-performance`: **esta rota muda nesta task, e é suposto mudar.** A centragem
desconta a rail dos dois lados dentro do `.app-imported-page`, que é o pai de todas as pages —
portanto custa 58px de largura a todas, portal do motorista incluído. O esperado passa a ser:

| width | contentWidth | centreOffset |
|---|---|---|
| 1920 | 1748 *(era 1806)* | 0 *(era 29)* |
| 2560 | 1840 | 0 |
| 3440 | 1840 | 0 |
| 3840 | 1840 | 0 |
| 5120 | 1840 | 0 |

A 2560 e acima não mexe, porque lá o teto de 1840 é que manda e não a largura disponível. O que
esta rota continua a provar é o que interessa: o teto dela **continua em 1840** e não subiu para
3520 — ou seja, nenhuma page do portal do motorista foi migrada para `ultra`. Se aparecer 3520
ali, houve migração a mais.

- [ ] **Step 6: Commit**

```bash
git add -A "app/(private)" && git commit -m "feat: put the dense operational pages on the ultra step"
```

---

### Task 4: Centrar o conteúdo no ecrã

**Files:**
- Modify: `app/(private)/components/NavbarWrapper.css:188` (acrescentar regra) e `:200-201` (remover compensação duplicada)

**Interfaces:**
- Consumes: `--sidebar-offset`, já declarada em `.app-shell` (`NavbarWrapper.css:4`, 58px; `:5`, 175px quando expandida; `:39`, 0px abaixo de 640px).
- Produces: nada. É a última regra de posicionamento; a Task 5 mede colunas dentro da caixa que esta task centra.

- [ ] **Step 1: Acrescentar a regra**

Em `app/(private)/components/NavbarWrapper.css`, logo a seguir a `.app-imported-page { min-width: 0; }` (linha 188):

```css
/* Centra o conteúdo no ecrã, não na área que sobra da rail fixa.
   Recuo à esquerda = 58px de rail + 28px de padding próprio = 86px.
   O recuo à direita tem de igualar isso, senão a caixa não fica simétrica.
   Ver docs/superpowers/specs/2026-09-25-ultra-wide-screens-design.md §7 */
.app-imported-page { padding-right: calc(28px + var(--sidebar-offset, 0px)); }
```

**Os 28px não são decorativos e não podem ser omitidos.** O `.app-imported-page` já tem 28px de
padding de cada lado — medido no browser: `28px / 28px`. Um `padding-right:
var(--sidebar-offset)` simples **substituiria** esse valor, deixando 86px de recuo à esquerda
contra 58px à direita: o conteúdo ficaria 14px ao lado do centro. Menos errado do que hoje, e
errado na mesma, sem dar sinal. Em telemóvel continua a dar 28px, porque abaixo de 640px
`--sidebar-offset` é `0px`.

**Tem de ser `.app-imported-page`, não `.app-main`.** A `.app-topbar` é irmã dentro do `.app-main` e tem fundo e `border-bottom` próprios — padding no pai faria a barra e a sua borda pararem 58px antes da direita.

- [ ] **Step 2: Apagar o bloco da `requests` por inteiro**

O bloco é hoje este:

```css
.app-imported-page[data-page="requests"] .dgp-page-frame-container {
  position: relative;
  left: calc(var(--sidebar-offset, 0px) / -2);
  width: min(calc(100% - 48px), 1840px);
  max-width: var(--content-ultra);
}
```

Apagar as quatro declarações e o bloco. Cada linha tem a sua razão:

- `position` e `left` faziam, só para a `requests`, exatamente o que a regra do Step 1 agora faz
  para todas. Mantê-las às duas desloca a page 29px a mais para a esquerda.
- **`width` é a linha que importa, e a Task 3 não lhe podia tocar.** Um `width` com `min(...,
  1840px)` fixa a largura usada em 1840; um `max-width` maior não a levanta — `max-width` só
  reduz. Ou seja: a Task 3 migrou a `requests` para `var(--content-ultra)` e o efeito era zero,
  porque esta linha continuava a travá-la em 1840px. Sem este Step, a `requests` é a única das
  17 pages que não ganha nada com a migração, e falha em silêncio.
- `max-width` fica redundante: o elemento já tem `max-w-content-ultra` pela sua própria classe.

Com o bloco fora, a `requests` passa a comportar-se como as outras 16 — que é o que o spec
quer dizer com absorver a camada de override.

**Não tocar em mais nada nesse ficheiro.** A regra `[data-page="requests"] main[class*="max-w-"]
{ max-width: none !important }` é outra coisa e fica. A regra homónima dentro do
`@media (max-width: 1100px)` também fica: abaixo de 1100px o container já é mais estreito que
qualquer teto, portanto não muda nada.

- [ ] **Step 3: Dar `mx-auto` às nove pages que não o têm**

Uma caixa simétrica só centra o que estiver centrado dentro dela. Nove dos 17 call sites passam
um `containerClassName` próprio e nenhum deles inclui `mx-auto`, por isso o container fica
encostado à esquerda sempre que o teto morde. Com o teto em 1600px isso valia ~100px e lia-se
como gutter; com o teto em 3520px num 5120 vale −714px.

Acrescentar `mx-auto` ao início de cada um destes `containerClassName`, sem mexer em mais nada
da string:

| ficheiro | linha |
|---|---|
| `app/(private)/financial-invoices/page.tsx` | 304 |
| `app/(private)/requests-inbox/page.tsx` | 514 |
| `app/(private)/week-planner-operations/page.tsx` | 2234 |
| `app/(private)/requests/page.tsx` | 297 |
| `app/(private)/daily-operations-reports/page.tsx` | 438 |
| `app/(private)/daily-financial-insights/page.tsx` | 400 |
| `app/(private)/adhoc-works-invoice-management/page.tsx` | 359 |
| `app/(private)/week-planner-operations/DailyOperationsManagementPage.tsx` | 1937 |
| `app/(private)/deductions-disbursements-recharges/page.tsx` | 825 |

Exemplo, em `requests/page.tsx:297`:

```tsx
containerClassName="mx-auto w-full px-[3%] md:px-6 lg:px-8 py-[2%] md:py-6 space-y-[2%] md:space-y-6"
```

O `px-0` de cinco destas pages é deliberado — elas gerem o próprio padding — e **mantém-se**.
`mx-auto` não mexe em padding: só reparte a folga quando o `max-width` morde.

Os outros oito call sites usam o `containerClassName` por omissão, que já tem `mx-auto`.

- [ ] **Step 4: Verificar com o harness**

Run: `http://localhost:3000/ultrawide-harness.html?route=/vendor`, `?route=/home`, `?route=/requests`

A `/requests` é a asserção que prova o Step 2: se ela ficar em 1840 em vez de acompanhar as
outras, o bloco não foi removido — ou foi removido só em parte.

Expected: `centreOffset` igual a **0** (±2px) em todos os viewports e nas três rotas. E `contentWidth` desce exatamente 58px face à Task 3 (2446→2388 e 3326→3268), porque a caixa passa a descontar a rail dos dois lados:

| width | contentWidth |
|---|---|
| 1920 | 1600 |
| 2560 | 2388 |
| 3440 | 3268 |
| 3840 | 3520 |
| 5120 | 3520 |

`min(viewport − 172, 3520)`: rail e padding descontados dos dois lados, 58+28 de cada.

O 1920 não desce, porque lá o teto de 1600 já manda — é o que torna esta task invisível em largura nos monitores normais, mesmo sendo visível em posição.

- [ ] **Step 5: Verificar os dois estados da rail e o telemóvel**

No browser, em `/vendor` a 1920: alternar a sidebar com o `.sidebar-toggle`.

Expected: o conteúdo **não desliza para o lado** ao abrir — só estreita. Antes desta task deslocava-se 117px para a direita.

Depois, estreitar a janela para 375px de largura.

Expected: renderização idêntica à de hoje. Abaixo de 640px `--sidebar-offset` é `0px` (linha 39), portanto o padding é zero.

- [ ] **Step 6: Commit**

```bash
git add "app/(private)/components/NavbarWrapper.css" "app/(private)/financial-invoices/page.tsx" "app/(private)/requests-inbox/page.tsx" "app/(private)/week-planner-operations/page.tsx" "app/(private)/requests/page.tsx" "app/(private)/daily-operations-reports/page.tsx" "app/(private)/daily-financial-insights/page.tsx" "app/(private)/adhoc-works-invoice-management/page.tsx" "app/(private)/week-planner-operations/DailyOperationsManagementPage.tsx"
git commit -m "feat: centre page content on the screen instead of on the leftover area"
```

---

### Task 5: Reflow dos grids de contagem variável

**Files:**
- Modify: `app/(private)/home/home-new.css:10` (`.home-new__page-grid`) e `:11` (`.home-new__workspace`)


**Interfaces:**
- Consumes: as rungs `3xl`/`4xl` da Task 2, e a largura de container da Task 4.
- Produces: nada.

**O que NÃO se toca, e porquê.** Esta lista é metade da task:

- `.home-new__kpis` — `home/page.tsx:12` declara `kpis` como um `as const` de **quatro** entradas. Seis colunas sobre quatro itens não criam um quinto KPI: deixam duas células vazias e encolhem os quatro cards.
- `InvoiceSummaryStats.tsx:24` (`lg:grid-cols-5`) — a faixa é semanticamente fixa em cinco (Generated, Period, Service Partners, Total Items, Total Amount), como o próprio comentário do componente diz. Mesmo motivo.
- `PerformanceBentoGrid.tsx:19` e `GeneralDashboardBento.tsx:50` (`lg:grid-cols-3`) — são bentos, e os filhos usam `BentoCard span={2}`. A aritmética dos spans está presa a três colunas; mudar a contagem parte o layout em vez de o melhorar.
- `VendorDetailsModal.tsx:190` — é um modal. Não é um container de page e não herda a largura de `ultra`.
- `VehicleCardGrid.tsx:45` e `VendorCardGrid.tsx:63` — **removidos desta task depois de medidos.** Parecem o caso óbvio, mas os dois vivem dentro de `block md:hidden`. Medido no browser a 2998px: em `/vehicles` o único match tem `width: 0` e pai em `display: none`; em `/vendor` o selector não devolve match nenhum. Em desktop as duas pages são tabelas. As rungs nunca disparariam.

- [ ] **Step 1: Dar colunas ao hub de pages da home**

Em `app/(private)/home/home-new.css`, a regra `.home-new__page-grid` na linha 10 é hoje
`.home-new__page-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }`.

Acrescentar **no fim do ficheiro** (para não lutar com a media query de 1050px que já lá está na linha 17):

```css
@media (min-width:2200px) { .home-new__page-grid { grid-template-columns:repeat(6,minmax(0,1fr)); } }
@media (min-width:3000px) { .home-new__page-grid { grid-template-columns:repeat(8,minmax(0,1fr)); } }
```

Estes são page-cards pequenos (texto de 10px, `min-height:65px`), com largura-alvo de ~380px: a que já têm a 1600px. Seis colunas dão ~391px num 2560 e oito dão ~401px num 3440, já descontando os 28px de padding de cada lado do `.home-new`.

- [ ] **Step 2: Alargar o rail da home**

A regra `.home-new__workspace` na linha 11 é hoje
`.home-new__workspace { display:grid; grid-template-columns:minmax(0,1fr) 330px; gap:28px; }`.

Acrescentar, também no fim do ficheiro:

```css
@media (min-width:2200px) { .home-new__workspace { grid-template-columns:minmax(0,1fr) 400px; } }
@media (min-width:3000px) { .home-new__workspace { grid-template-columns:minmax(0,1fr) 460px; } }
```

A coluna principal leva o resto, que é o que a tabela de schedule quer — ela está em `overflow-x:auto` com `white-space:nowrap` e a 3228px deixa de pedir scroll.

- [ ] **Step 3: Verificar com o harness**

Run: `http://localhost:3000/ultrawide-harness.html?route=/home`

Expected em `/home` (`cols` na saída `[UW]`):

| width | homePageGrid | homeKpis | homeWorkspace |
|---|---|---|---|
| 1920 | 4 | 4 | 2 |
| 2560 | 6 | 4 | 2 |
| 3440 | 8 | 4 | 2 |
| 5120 | 8 | 4 | 2 |

`homeKpis` em 4 nos cinco viewports é a asserção que protege a regra dos grids de contagem fixa. Se aparecer 5 ou 6 ali, o Step 1 foi aplicado à regra errada.

Estes dois grids são CSS puro em media queries, não classes do Tailwind, portanto não dependem das rungs. Não há nada a confirmar no `build` nesta task.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/home/home-new.css"
git commit -m "feat: give the home's variable-count grids columns at 3xl and 4xl"
```

---

### Task 6: Guarda de medida de texto e verificação final

**Files:**
- Modify: `app/globals.css` (fim do ficheiro)
- Modify: `docs/superpowers/plans/2026-09-25-ultra-wide-baseline.md`

**Interfaces:**
- Consumes: tudo o que vem antes.
- Produces: nada.

- [ ] **Step 1: Travar a medida de linha dos parágrafos de página inteira**

No fim de `app/globals.css`:

```css
/* Num container de 3228px um parágrafo solto vira uma linha de 3200px.
   Escopo deliberadamente estreito: só filhos directos do container de page,
   que é o único sítio onde um <p> ocupa a largura toda. Cards, células de
   tabela e filhos de flex não são apanhados.
   Ver docs/superpowers/specs/2026-09-25-ultra-wide-screens-design.md §6 */
@media (min-width: 2200px) {
  .dgp-page-frame-container > p { max-width: 68ch; }
}
```

Esta regra pode não corresponder a nada hoje. É uma guarda, tem uma linha e não tem risco: o selector não consegue alcançar texto dentro de cards ou tabelas.

- [ ] **Step 2: Correr a suite toda**

Run: `npm test`
Expected: PASS, sem testes saltados.

Run: `npx tsc --noEmit 2>&1 | grep -E "globals.css|tailwind.config|DgpPageFrame|StandardPageLayout|home-new|VehicleCardGrid|VendorCardGrid"`
Expected: saída vazia.

**Não usar `typecheck:all` limpo como critério — nunca foi atingível.** O projeto tem 266 erros
de tipo pré-existentes: 126 no `Logix-new-front/`, um clone de repo vizinho que o `.gitignore`
declara fora do projeto mas que o `tsconfig.json` continua a incluir, e 140 antigos na app
(`pdfGenerator.ts`, `dashboard-grid`, um conflito de casing em `week-planner/components/Modals`).
É por isso que existe o `npm run typecheck` com baseline. O critério desta tarefa é zero erros
**nos ficheiros que este trabalho tocou**, que é o que o grep acima verifica.

Run: `npm run lint`
Expected: sem erros novos face ao estado antes da Task 1.

- [ ] **Step 3: Medição final contra a baseline**

Correr o harness nas quatro rotas e comparar com `docs/superpowers/plans/2026-09-25-ultra-wide-baseline.md`:

| rota | o que tem de ser verdade |
|---|---|
| `/vendor` | contentWidth 1600/2388/3268/3520/3520; centreOffset 0 em todos |
| `/home` | as mesmas larguras; homePageGrid 4/6/8/8/8; homeKpis 4 em todos |
| `/current-performance` | 1748/1840/1840/1840/1840, centreOffset 0 — teto ainda em 1840, não 3520 |

`/vehicles` saiu desta tabela: o `cardGrid` foi removido do harness quando se mediu que as duas
grelhas de card são componentes só-mobile, e a page não tem mais nada de próprio para verificar
além das larguras que as outras rotas já cobrem.

A última linha é a que importa mais, e importa pela razão certa. `/current-performance` **muda**
nesta branch: perde 58px a 1920px e passa a estar centrada, porque a centragem custa isso a
todas as pages. O que ela prova é outra coisa — que o teto dela continua em **1840 e não 3520**.
Se lá aparecer 3520, uma page do portal do motorista foi migrada por engano, e isso sim é
regressão.

- [ ] **Step 4: Registar o resultado**

Acrescentar ao fim de `2026-09-25-ultra-wide-baseline.md` uma secção "Depois", com as linhas `[UW]` finais ao lado das da baseline. O ficheiro passa a ser o antes-e-depois do trabalho.

- [ ] **Step 5: Decidir o que fazer com o harness**

`public/ultrawide-harness.html` seria servido publicamente em produção. Mantê-lo — é útil para qualquer trabalho de largura seguinte — e excluí-lo do deploy:

```bash
echo "public/ultrawide-harness.html" >> .vercelignore
tail -3 .vercelignore
```

Expected: a última linha do `.vercelignore` é `public/ultrawide-harness.html`.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css .vercelignore docs/superpowers/plans/2026-09-25-ultra-wide-baseline.md
git commit -m "feat: cap line measure for full-bleed paragraphs on ultra-wide"
```
