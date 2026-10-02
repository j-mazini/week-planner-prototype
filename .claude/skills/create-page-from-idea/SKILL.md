---
name: create-page-from-idea
description: Turn a stakeholder's spoken/written idea for a new LogixSphere page into a styled mockup for approval, then generate the real page code once approved. Use this whenever someone (especially a non-developer like a manager or "chefe") describes a new screen, dashboard, or report they want in the system — even informally, like "quero uma página que mostra X" or "would be great if we had a screen for Y" — rather than jumping straight to writing code from a vague description. Also use when asked to "mock up", "prototype", or "preview" a new page idea before building it for real.
---

# Create Page From Idea

Someone with an idea for a new page — often not a developer — describes what they want in
plain language. Your job is to turn that into a real LogixSphere page, but with a human
approval checkpoint in the middle so nobody has to accept the final code on faith.

The flow has three stages. Do not skip stage 2 (the mockup) and jump to real code, even if the
idea sounds simple — the mockup is cheap to adjust and the real page is not.

## Stage 1 — Understand the idea

Read these three docs in the repo root first if you haven't already this session, since they
define every convention you need and save you from re-deriving them:

- `ANATOMIA-DE-UMA-PAGE.md` — how a page is structured (routing, auth layers, data fetching
  pattern, where loading.tsx goes, etc.)
- `CATALOGO-DE-PAGES.md` — what pages already exist, who sees them, and how they're reached from
  the menu. Check this so you don't propose a duplicate of something that already exists, and so
  you can point to a similar existing page as a reference when generating code later.
- `CONTRATO-DE-API-PARA-PAGES.md` — what the backend actually exposes under `/bff/*`.

Then have a short conversation to pin down what's fuzzy. Don't interrogate with a long
checklist — ask only what you can't reasonably infer, one or two questions at a time:

- What is this page for, and who should be able to see it (admin only? supervisor? vendor/driver
  on mobile?) — cross-check against the profile conventions in `lib/route-permissions.ts`
  (`USER_TYPE_2_ALLOWED`, `USER_TYPE_3_ALLOWED`, `USER_TYPE_5_ALLOWED`; admin implicitly sees
  everything and needs no entry).
- What data does it show — and does an existing `/bff` endpoint already provide it (check the
  contract doc), or will this need a new endpoint (flag that explicitly — it means backend work
  beyond this skill's scope)?
- Roughly what layout: a table/list, a dashboard with cards and charts, a form, a detail view?
  Any filters, search, or actions (export, edit, approve) the user needs?
- Where should it live in navigation — sidebar, mobile menu, or standalone? If sidebar or mobile,
  note it's added to a nav component in Stage 3 (see below) — you don't need to ask which file,
  just whether it belongs in nav at all.

Keep this conversational. If the person describing the idea is non-technical, don't ask about
implementation details they won't have opinions on (state management, component names) — ask
about what they want to *see and do* on the page.

**If the idea looks like a near-duplicate of an existing catalog entry** (same data, same
audience, just phrased differently), don't silently build a second page. Say so directly — name
the existing route from `CATALOGO-DE-PAGES.md` and ask whether this should be: (a) a new view of
that same data (e.g. a filtered/specialized route, like this skill's own example of
"overdue invoices" being a focused view of a general `/invoices` page), (b) a change request
against the existing page instead, or (c) genuinely a different page that happens to share a data
source. Proceed based on their answer rather than guessing.

## Stage 2 — Mockup as an artifact, iterate until approved

Publish an HTML Artifact that is a realistic, styled preview of the page — not a text
description of it. This is the thing the person actually looks at and reacts to, so it needs to
look like it belongs in LogixSphere, not like a generic wireframe:

- Pull real visual language from the project — don't invent a generic SaaS palette (bright blue
  primary, dark navy sidebar, saturated red/blue/purple status colors). The current app shell is
  the paper/teal/lime system defined in `app/(private)/components/NavbarWrapper.css`: paper
  background `#fafaef`, card surface `#fffef8`, ink text `#1a1c16`, teal `#27676c`/`#003b3e` as
  the primary action color, lime `#b2f746` for active-nav highlight, `Space Grotesk` for headings
  and `IBM Plex Mono` for body/data text, sharp corners (2–3px radius, not rounded-xl/2xl pills).
  Status/severity badges must match `components/status-badge.css` specifically — it's a calm,
  desaturated three-bucket system (olive for positive/complete, amber for pending/attention, rose
  for risk/overdue/expired, plus a neutral olive-grey default), not bright red/green/blue chips.
  The older `hsl(var(--primary))`/Tailwind-token system in `tailwind.config.js` and
  `app/globals.css` encodes the same paper/teal/lime palette as HSL variables, so either source
  should agree — if they visually conflict, trust `NavbarWrapper.css` and `status-badge.css` as
  the more concrete, current reference. For layout shape (not color), still look at a page similar
  to the one being built for structure — e.g. a KPI/card grid or a table/list — but reskin
  whatever you copy into the paper/teal/lime language above rather than carrying over its colors
  verbatim, since some existing pages (e.g. `app/(private)/home/`, `app/(private)/financial-invoices/`)
  still carry an older white/slate/blue-indigo visual style that doesn't match the current shell.
  Load the `artifact-design` skill before building the artifact so the visual treatment is
  deliberate rather than templated.
- Use realistic placeholder data (names, numbers, dates) relevant to the domain described —
  logistics, invoices, deductions, performance, whatever the page is about — not "Lorem ipsum" or
  "Item 1, Item 2".
- Include the layout elements discussed: filters, columns, action buttons, charts — laid out the
  way they'd actually appear, even though nothing is wired to real data yet.

Treat the first version as a draft. Ask directly: "Is this close? Anything to change before I
build the real thing?" Update the same artifact in place based on feedback — don't publish a new
one each round, so the link stays stable and prior context isn't lost. Keep iterating until the
person clearly signs off (e.g. "isso", "aprovado", "pode seguir", "yes, build it").

Do not move to Stage 3 on an ambiguous response. If they said "looks nice" without confirming
it's ready, ask directly whether you should proceed to building the real page.

## Stage 3 — Generate the real code, automatically, on approval

As soon as approval is clear, continue in the same turn — don't stop and ask again.

**If Stage 1's near-duplicate check concluded this modifies an existing page** (options (a) or
(b) — a focused view or a change request against a page that already exists), don't generate a
full mirrored `page.tsx`/`loading.tsx`/route-permissions diff as if this were a new route — there
is no new route, so most of that template doesn't apply. Instead generate just the new/changed
piece: the component(s) implementing the approved addition, a hook or `lib/` change if new data is
needed, and a README that says plainly where it plugs into the existing page (e.g. "add
`<WorstBySLASection />` near the top of `app/(private)/vendor-performance/page.tsx`"). Skip the
nav and route-permissions steps entirely — nothing changes there when no new route is added.

Otherwise, this is a genuinely new page — generate it following the exact structure documented in
`ANATOMIA-DE-UMA-PAGE.md`:

- `page.tsx` under the right route in `app/(private)/<route>/` (or `app/(public)/` if it's public),
  using `NavbarWrapper` and the private layout conventions.
- A `loading.tsx` alongside it, matching the one-line pattern used elsewhere.
- Data fetching through a `lib/` module or a `hooks/` TanStack Query hook — never a bare `fetch`
  in the component — pointed at the real `/bff` endpoint identified in Stage 1, or clearly marked
  with a `// TODO:` and mock data if the endpoint doesn't exist yet.
- Styling and component choices matching what you used in the approved mockup, adapted to the
  project's real shared components under `components/` instead of one-off artifact markup —
  anchored on the reference page you picked in Stage 2, not reinvented.
- A route-permissions snippet for the audience agreed in Stage 1: show the diff against
  `lib/route-permissions.ts` as it exists today — which `USER_TYPE_*_ALLOWED` array(s) gain the
  new route, or none at all if it's admin-only (admin needs no entry; only non-admin profiles are
  whitelisted there). Don't invent a new permissions mechanism — this file is the single source of
  truth for routing access.
- If the page belongs in navigation (per Stage 1), a snippet showing the new entry in the nav
  component matching where it was placed — `components/app-sidebar.tsx` and
  `components/beam-sidebar.tsx` both maintain sidebar entries (`{ name, url, icon }` from
  `lucide-react`) and tend to need the same addition in both; `components/nav-operations.tsx` /
  `components/nav-financial.tsx` group entries by section if the sidebar is organized that way for
  this user type. Match the icon style already used by neighboring entries.

If any file this step names (`lib/route-permissions.ts`, a specific nav component, a reference
page) genuinely doesn't exist when you check, don't invent a stand-in silently — say so in the
README's open-items list and describe the convention you assumed instead, so a developer knows
exactly what to verify by hand.

**Do not write any of this into the git repository.** Save the generated files to a local,
out-of-repo folder instead, so they can be reviewed before anything is committed:

```
~/Desktop/logixsphere-page-requests/<kebab-case-page-name>/
```

Mirror the intended repo-relative paths inside that folder (e.g.
`app/(private)/vendor-returns/page.tsx`, `app/(private)/vendor-returns/loading.tsx`,
`lib/vendor-returns-api.ts`), so moving them into the real repo later is a straight copy. Include
a short `README.md` in that folder summarizing: what the page does, which existing page(s) it's
modeled after, which `/bff` endpoint(s) it expects, and anything that still needs backend work or
a human decision before merging.

Tell the person where the files landed and what's inside, in plain terms — they likely don't
need (or want) a code walkthrough, just confirmation it's ready for a developer to pick up.
