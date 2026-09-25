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
byte-identical `contentWidth`/`centreOffset`/`cols` values to the first capture, but the three routes
are not equally good evidence about the fix. Only **`/home`** exercises the corrected code path: its
`GRIDS` selectors (`homeKpis`, `homePageGrid`, `homeWorkspace`) match real, laid-out elements with
resolved px track lists, so both `firstLaidOut` and `countCols` actually run there, and the re-check
came back unchanged (`4`/`4`/`2` at every width) — a genuine confirmation that the fix didn't disturb
a case that was already correct. **`/vendor` and `/current-performance` have `cols: {}` in every
capture** — neither route's `GRIDS` selectors match anything at all, so neither `countCols` nor
`firstLaidOut`'s grid branch ever ran for them, before or after the fix. Their identical output is
expected because the fixed code paths were mechanically never exercised on these two routes; it is
not evidence that the fix is correct or incorrect, only that these two routes were never in scope for
either bug.

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

## Depois (Task 6, pós-migração completa)

Captured 2026-09-25 at the tip of `feat/ultra-wide-screens` (base `16cb164`), after Task 6's line-measure
guard. All five tasks (`ultra` step + `3xl`/`4xl` rungs, the 17-page migration onto `ultra`, the
`mx-auto` centring repairs, and the home grid reflow) have landed. Same harness, same widths
`[1920, 2560, 3440, 3840, 5120]`, same authenticated session. `[UW]` lines below are the final
verbatim `#out` output, placed next to the "Antes" tables above rather than replacing them.

### `/vendor` — Antes vs Depois

| width | Antes contentWidth/centreOffset | Depois contentWidth/centreOffset |
|-------|----------------------------------|-------------------------------------|
| 1920  | 1600 / 29 | 1600 / 0 |
| 2560  | 1600 / 29 | 2388 / 0 |
| 3440  | 1600 / 29 | 3268 / 0 |
| 3840  | 1600 / 29 | 3520 / 0 |
| 5120  | 1600 / 29 | 3520 / 0 |

```
[UW] {"width":1920,"selector":"w-full","contentWidth":1600,"centreOffset":0,"cols":{}}
[UW] {"width":2560,"selector":"w-full","contentWidth":2388,"centreOffset":0,"cols":{}}
[UW] {"width":3440,"selector":"w-full","contentWidth":3268,"centreOffset":0,"cols":{}}
[UW] {"width":3840,"selector":"w-full","contentWidth":3520,"centreOffset":0,"cols":{}}
[UW] {"width":5120,"selector":"w-full","contentWidth":3520,"centreOffset":0,"cols":{}}
```

Matches the brief's Step 3 table exactly: 1600/2388/3268/3520/3520, `centreOffset` 0 at every width.
(`centreOffset` moved from 29 to 0 because the parent-level centring fix in an earlier task recentred
the container; that shift applies to every migrated page, not a Task 6 change.)

### `/home` — Antes vs Depois

| width | Antes contentWidth / cols | Depois contentWidth / cols |
|-------|------------------------------|---------------------------------|
| 1920  | 1600 / homeKpis:4, homePageGrid:4, homeWorkspace:2 | 1600 / homeKpis:4, homePageGrid:4, homeWorkspace:2 |
| 2560  | 1600 / homeKpis:4, homePageGrid:4, homeWorkspace:2 | 2388 / homeKpis:4, homePageGrid:6, homeWorkspace:2 |
| 3440  | 1600 / homeKpis:4, homePageGrid:4, homeWorkspace:2 | 3268 / homeKpis:4, homePageGrid:8, homeWorkspace:2 |
| 3840  | 1600 / homeKpis:4, homePageGrid:4, homeWorkspace:2 | 3520 / homeKpis:4, homePageGrid:8, homeWorkspace:2 |
| 5120  | 1600 / homeKpis:4, homePageGrid:4, homeWorkspace:2 | 3520 / homeKpis:4, homePageGrid:8, homeWorkspace:2 |

```
[UW] {"width":1920,"selector":"home-new","contentWidth":1600,"centreOffset":0,"cols":{"homeKpis":4,"homePageGrid":4,"homeWorkspace":2}}
[UW] {"width":2560,"selector":"home-new","contentWidth":2388,"centreOffset":0,"cols":{"homeKpis":4,"homePageGrid":6,"homeWorkspace":2}}
[UW] {"width":3440,"selector":"home-new","contentWidth":3268,"centreOffset":0,"cols":{"homeKpis":4,"homePageGrid":8,"homeWorkspace":2}}
[UW] {"width":3840,"selector":"home-new","contentWidth":3520,"centreOffset":0,"cols":{"homeKpis":4,"homePageGrid":8,"homeWorkspace":2}}
[UW] {"width":5120,"selector":"home-new","contentWidth":3520,"centreOffset":0,"cols":{"homeKpis":4,"homePageGrid":8,"homeWorkspace":2}}
```

Matches the brief's Step 3 table: same widths as `/vendor`, `homePageGrid` 4/6/8/8/8, `homeKpis` 4 at
every width.

### `/vehicles` — Depois

`cardGrid` was already removed from the harness's `GRIDS` map before this task (see "`/vehicles` —
removed" note above): `VehicleCardGrid` is a mobile-only component hidden at these viewports, so
`cols` is expected to be `{}` at every width, not the `cardGrid: 5/7/9/9` figures named in the Task 6
brief's table — that line predates the removal and does not apply to this harness build.

```
[UW] {"width":1920,"selector":"w-full","contentWidth":1600,"centreOffset":0,"cols":{}}
[UW] {"width":2560,"selector":"w-full","contentWidth":2388,"centreOffset":0,"cols":{}}
[UW] {"width":3440,"selector":"w-full","contentWidth":3268,"centreOffset":0,"cols":{}}
[UW] {"width":3840,"selector":"w-full","contentWidth":3520,"centreOffset":0,"cols":{}}
[UW] {"width":5120,"selector":"w-full","contentWidth":3520,"centreOffset":0,"cols":{}}
```

`contentWidth` still matches the other migrated pages exactly (1600/2388/3268/3520/3520,
`centreOffset` 0 at every width); only `cardGrid` is unmeasurable by design.

### `/current-performance` — Antes vs Depois (control route)

| width | Antes contentWidth | Depois contentWidth | centreOffset |
|-------|---------------------|----------------------|--------------|
| 1920  | 1806 | 1748 | 0 |
| 2560  | 1840 | 1840 | 0 |
| 3440  | 1840 | 1840 | 0 |
| 3840  | 1840 | 1840 | 0 |
| 5120  | 1840 | 1840 | 0 |

```
[UW] {"width":1920,"selector":"my-performance","contentWidth":1748,"centreOffset":0,"cols":{}}
[UW] {"width":2560,"selector":"my-performance","contentWidth":1840,"centreOffset":0,"cols":{}}
[UW] {"width":3440,"selector":"my-performance","contentWidth":1840,"centreOffset":0,"cols":{}}
[UW] {"width":3840,"selector":"my-performance","contentWidth":1840,"centreOffset":0,"cols":{}}
[UW] {"width":5120,"selector":"my-performance","contentWidth":1840,"centreOffset":0,"cols":{}}
```

The number that matters: the ceiling is still **1840**, not 3520 — no driver-portal page was migrated
onto `ultra`. The 1920px cell moved from 1806 to 1748 and `centreOffset` moved from 29 to 0 across the
board; both are the expected, plan-wide cost of the earlier parent-level centring fix (`mx-auto` on
the shared shell), applied here too since this route shares that parent — not a Task 6 change and not
evidence that `/current-performance` was touched directly.
