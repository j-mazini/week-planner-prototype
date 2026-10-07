# Animações de entrada em todas as pages — 2026-10-07

## Problema

As 46 pages entravam de maneiras diferentes ou não entravam de todo. `framer-motion`
aparecia em 41 ficheiros, cada um com a sua duração e o seu easing. Sete pages passavam
por `StandardPageLayout` e apanhavam um fade de 0.22s; catorze usavam `DgpPageFrame` e
não apanhavam nada; as restantes montavam o shell à mão. Não havia tratamento de
`prefers-reduced-motion` em lado nenhum.

## Decisões

**Os tokens vivem em dois sítios espelhados.** `lib/motion.ts` para o framer-motion,
custom properties `--motion-*` em `globals.css` para a via CSS. Os números repetem-se
porque o framer não lê custom properties; nunca devem divergir.

**A entrada de página vive num sítio só: `components/navbar-wrapper.tsx`.** O div
`.app-imported-page` embrulha exactamente o conteúdo da page e deixa o navbar de fora,
por isso é o ponto de inserção certo. Todas as pages privadas passam por lá — as que
usam `DgpPageFrame`, as que usam `StandardPageLayout`, as que montam o shell à mão, e
`/daily` e `/op-management`, que o recebem do `app/(private)/layout.tsx`.

Consequência: `DgpPageFrame` e `StandardPageLayout` **não** animam. O fade de 0.22s que
`StandardPageLayout` tinha foi removido por ser agora redundante — mantê-lo aninharia
dois fades.

O `key={route}` no motion.div é o que faz a entrada repetir a cada navegação. Sem ele o
elemento fica na mesma posição da árvore e `initial` só correria no primeiro mount.

**Só opacidade na entrada.** Uma página inteira a deslizar lê-se como instabilidade, e um
`transform` no contentor de topo criaria um containing block que partiria qualquer
descendente `sticky` ou `fixed`.

**A cascata das secções é CSS, não framer.** A utility `.page-stagger` escalona os
filhos directos em 55ms. Em CSS porque não força re-render e funciona em conteúdo
renderizado no servidor.

Aplica-se no contentor cujos filhos directos *são* as secções. Nas pages com
`DgpPageFrame` isso é quase sempre o `<main>` interno, não o `#main-content` — este
costuma ter um filho só, e a cascata não teria o que escalonar.

Duas protecções em CSS, para que a regra não dependa de quem a aplica se lembrar dela:

- `.page-stagger .page-stagger > * { animation: none }` — cascatas aninhadas somavam
  atrasos e a page entrava aos soluços.
- `.page-stagger > [data-no-stagger] { animation: none }` — válvula de escape para um
  filho `position: fixed` (overlay de loading, modal), que de outra forma ficaria preso
  ao contentor em vez do viewport durante a animação.

**`prefers-reduced-motion` em dois níveis.** Um bloco global em `globals.css` colapsa
`animation-duration` e `transition-duration` para 0.01ms (colapsar, não `none`: `none`
partiria estados finais que dependem da animação), e `<MotionConfig reducedMotion="user">`
em `app/providers.tsx` faz o framer-motion respeitar a preferência — incluindo nas 41
animações que já existiam. O GSAP do ecrã de sign-in já tratava disto sozinho
(`hooks/useSignInAnimations.ts`).

## Pages sem cascata, e porquê

Todas têm a entrada de página; estas não levam `.page-stagger`:

| Page | Razão |
|---|---|
| `assets` | Conteúdo em tabs. A cascata re-animaria o painel com atraso a cada troca de tab. |
| `route-balance` | Canvas exportado do Figma com `transform: scale()`. Um transform acima compunha-se com a escala. |
| `week-planner` | `react-grid-layout` posiciona os filhos. |
| `driver-route-balance` | Shell mobile que troca de ecrã; uma cascata a cada troca leria mal. |
| `operations-management`, `op-management` | Já têm cascata própria (`FadeIn delay`, `.reveal`). |
| `deductions-disbursements-recharges` | A cascata está nos `DesktopView`/`MobileView`, não na page. |

## Limpeza incluída

`tailwind.config.js` declarava `fadeIn` três vezes. As duas primeiras, mais ricas,
estavam a ser silenciosamente sobrepostas pela terceira (`{ to: { opacity: 1 } }`) e
foram removidas. `animate-fadeIn` sempre fez só opacidade — agora diz isso.
