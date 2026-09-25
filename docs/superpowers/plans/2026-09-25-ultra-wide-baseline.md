# Ultra-wide baseline

Captured 2026-09-25, at commit `3ab9333` (branch `feat/ultra-wide-screens`), which includes Task 2's
commit `1a143fc` (the `--content-ultra` var and the `3xl`/`4xl` breakpoint rungs). No page consumes
`ultra` yet, so Task 2 landing does not change any rendered width — the `/vendor` numbers below match
the brief's stated sanity check exactly, confirming the baseline is still valid at this commit.

Measured with `public/ultrawide-harness.html` via `http://localhost:3000/ultrawide-harness.html?route=<rota>`,
authenticated session in Chrome, widths `[1920, 2560, 3440, 3840, 5120]`. Lines below are the `[UW]`
console/`#out` output verbatim — not rounded or edited.

## Sanity check

The brief's expected result for `/vendor`: `contentWidth` saturates at 1600 from 1920 up, `centreOffset`
+29 (rail recolhida). Measured value matches exactly (see table below). The instrument reads correctly.

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

## `/vehicles` (extra route, run to validate `cardGrid` for Task 5)

Not one of the three routes named in the brief's Step 3, but run because Task 5 verifies column counts
on `/vehicles` and the brief's `cardGrid` selector needed to be checked against a real page before
being trusted as an instrument for that task.

| width | selector | contentWidth | centreOffset | cols |
|-------|----------|-------------|--------------|------|
| 1920  | w-full | 1600 | 29 | cardGrid:3 |
| 2560  | w-full | 1600 | 29 | cardGrid:3 |
| 3440  | w-full | 1600 | 29 | cardGrid:3 |
| 3840  | w-full | 1600 | 29 | cardGrid:3 |
| 5120  | w-full | 1600 | 29 | cardGrid:3 |

```
{"width":1920,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{"cardGrid":3}}
{"width":2560,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{"cardGrid":3}}
{"width":3440,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{"cardGrid":3}}
{"width":3840,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{"cardGrid":3}}
{"width":5120,"selector":"w-full","contentWidth":1600,"centreOffset":29,"cols":{"cardGrid":3}}
```

`cardGrid` reports `3` at every width measured here — the selector resolves and the grid instrument
works for `/vehicles`. It stays flat at 3 across all five widths in this baseline (expected: the page's
content is capped at 1600px `w-full` at every one of these viewports, so the grid never receives more
horizontal room to add columns — Task 5's work is exactly what's expected to change this).
