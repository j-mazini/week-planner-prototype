# Ultra-wide baseline

Captured 2026-09-25, at commit `a216d2f` (branch `feat/ultra-wide-screens`), which includes Task 2's
commit `1a143fc` (the `--content-ultra` var and the `3xl`/`4xl` breakpoint rungs) and the fix-round-1
correction to the harness's column-counting and layout-detection logic. No page consumes `ultra` yet,
so none of this changes any rendered width — the `/vendor` numbers below still match the brief's
stated sanity check exactly.

Measured with `public/ultrawide-harness.html` via `http://localhost:3000/ultrawide-harness.html?route=<rota>`,
authenticated session in Chrome, widths `[1920, 2560, 3440, 3840, 5120]`. Lines below are the `[UW]`
console/`#out` output verbatim — not rounded or edited.

## Fix round 1 (superseding the first capture)

The first capture of this baseline used a harness with two bugs, both in `cols` computation only —
`contentWidth`/`centreOffset`/`selector` for `/vendor`, `/home`, `/current-performance` were correct
from the start and are unchanged below:

1. `gridTemplateColumns` was counted by `split(' ').length`, which is only valid once the browser has
   resolved the property to a track list (`"300px 300px 300px"`). On an element with no layout, the
   browser can return the specified form instead (`"repeat(5, minmax(0px, 1fr))"`), and splitting that
   on spaces counts syntax fragments, not columns — 3 instead of 5. The harness now only emits a
   column count when the computed value matches a resolved all-`px` track list; otherwise it emits
   `{raw, note}` instead of a plausible-looking wrong integer.
2. `querySelector` returns the first match in document order regardless of whether it's rendered. A
   hidden mobile-only variant of a grid (or of the container) could be selected over a visible desktop
   one, and a zero-width hidden element is exactly when bug 1's wrong count fires. The harness now
   picks the first match with `getClientRects().length > 0`, for both the container and every entry in
   `GRIDS`, and reports how many matches existed if none were rendered.

`cardGrid` has been **removed from `GRIDS` entirely** — see the "`/vehicles` removed" note below.

Re-running `/vendor`, `/home`, and `/current-performance` with the corrected harness reproduced
byte-identical `contentWidth`/`centreOffset`/`cols` values to the first capture (`home`'s
`homeKpis`/`homePageGrid`/`homeWorkspace` are still `4`/`4`/`2` — the corrected counting method changes
nothing for elements that were already laid out and already produced a resolved track list). This is
recorded as a real finding, not assumed: both bugs only manifested on unrendered elements, and none of
these three routes' `GRIDS` selectors ever matched an unrendered element.

## Sanity check

The brief's expected result for `/vendor`: `contentWidth` saturates at 1600 from 1920 up, `centreOffset`
+29 (rail recolhida). Measured value matches exactly (see table below). `/home`'s `homeKpis: 4`,
`homePageGrid: 4`, `homeWorkspace: 2` also hold at every width, confirmed under the corrected counting
method as well as the original one. The instrument reads correctly.

## `/vendor` (tabela densa)

| width | selector | contentWidth | centreOffset | cols |
|-------|----------|-------------|--------------|------|
| 1920  | w-full   | 1600        | 29           | {}   |
| 2560  | w-full   | 1600        | 29           | {}   |
| 3440  | w-full   | 1600        | 29           | {}   |
| 3840  | w-full   | 1600        | 29           | {}   |
| 5120  | w-full   | 1600        | 29           | {}   |

```
{"width":1920,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{}}
{"width":2560,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{}}
{"width":3440,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{}}
{"width":3840,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{}}
{"width":5120,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{}}
```

## `/home` (dashboard de grid em CSS puro)

| width | selector | contentWidth | centreOffset | cols |
|-------|----------|-------------|--------------|------|
| 1920  | home-new | 1600        | 29           | homeKpis:4, homePageGrid:4, homeWorkspace:2 |
| 2560  | home-new | 1600        | 29           | homeKpis:4, homePageGrid:4, homeWorkspace:2 |
| 3440  | home-new | 1600        | 29           | homeKpis:4, homePageGrid:4, homeWorkspace:2 |
| 3840  | home-new | 1600        | 29           | homeKpis:4, homePageGrid:4, homeWorkspace:2 |
| 5120  | home-new | 1600        | 29           | homeKpis:4, homePageGrid:4, homeWorkspace:2 |

```
{"width":1920,"selector":"home-new","contentWidth":1600,"centreOffset":29,"cols":{"homeKpis":4,"homePageGrid":4,"homeWorkspace":2}}
{"width":2560,"selector":"home-new","contentWidth":1600,"centreOffset":29,"cols":{"homeKpis":4,"homePageGrid":4,"homeWorkspace":2}}
{"width":3440,"selector":"home-new","contentWidth":1600,"centreOffset":29,"cols":{"homeKpis":4,"homePageGrid":4,"homeWorkspace":2}}
{"width":3840,"selector":"home-new","contentWidth":1600,"centreOffset":29,"cols":{"homeKpis":4,"homePageGrid":4,"homeWorkspace":2}}
{"width":5120,"selector":"home-new","contentWidth":1600,"centreOffset":29,"cols":{"homeKpis":4,"homePageGrid":4,"homeWorkspace":2}}
```

## `/current-performance` (portal do motorista — controlo, não deve mudar em nenhuma task)

| width | selector | contentWidth | centreOffset | cols |
|-------|----------|-------------|--------------|------|
| 1920  | my-performance | 1806 | 29 | {} |
| 2560  | my-performance | 1840 | 29 | {} |
| 3440  | my-performance | 1840 | 29 | {} |
| 3840  | my-performance | 1840 | 29 | {} |
| 5120  | my-performance | 1840 | 29 | {} |

```
{"width":1920,"selector":"my-performance","contentWidth":1806,"centreOffset":29,"cols":{}}
{"width":2560,"selector":"my-performance","contentWidth":1840,"centreOffset":29,"cols":{}}
{"width":3440,"selector":"my-performance","contentWidth":1840,"centreOffset":29,"cols":{}}
{"width":3840,"selector":"my-performance","contentWidth":1840,"centreOffset":29,"cols":{}}
{"width":5120,"selector":"my-performance","contentWidth":1840,"centreOffset":29,"cols":{}}
```

**Contradiction with the brief's framing to flag:** this route is described as the control that "não
deve mudar em nenhuma task deste plano" — but its `contentWidth` is *not* flat across viewports even
today, before any of Tasks 3-5 touch anything: 1806 at 1920px, then 1840 from 2560px up. This is an
existing pre-plan characteristic of `/current-performance`, not something the harness introduced. Any
later task that verifies this route as "unchanged" must compare against this two-value baseline
(1806 @ 1920, 1840 @ 2560+), not against a single flat number.

## `/vehicles` — removed from this baseline

The first capture of this baseline included a `/vehicles` run to validate the `cardGrid` selector for
Task 5. That run reported `cardGrid: 3`, which fix round 1 established was wrong: `/vehicles` renders
`VehicleCardGrid` as a mobile-only component behind `<main class="block md:hidden">`; at the 2998px
viewport used inside the harness's iframe it is `display: none`, so its `gridTemplateColumns` never
resolves to a track list and the old counting method silently produced a plausible but false `3`
(the true value, from `repeat(5, minmax(0px, 1fr))`, is 5). On `/vendor` the equivalent mobile-only
`VendorCardGrid` selector matches nothing at all — zero elements, not merely a hidden one. Both pages
render as tables on desktop. This card-grid work has been dropped from the plan and the spec
(commit `a216d2f`); no later task depends on `cardGrid` any more, so it has been removed from the
harness's `GRIDS` map and is not re-measured here.
