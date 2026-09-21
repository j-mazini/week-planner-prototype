# Week Planner Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js 14 (App Router, TypeScript) prototype of the LogixSphere `/week-planner` page, visually and behaviorally faithful to the approved artifact, backed by mock data through a data-access layer shaped exactly like a real API integration would be.

**Architecture:** A single private route (`app/(private)/week-planner`) follows the real LogixSphere page anatomy (`page.tsx` orchestrator, `loading.tsx`, local `components/`, `hooks/`, `types.ts`, `utils/*Mappers.ts`). All data flows through `lib/week-planner-api.ts`, which today resolves fixtures and tomorrow can be swapped for real `fetch`/`api-client` calls without touching hooks or components. TanStack Query owns server-state caching; local component state owns UI-only state (selected day, popovers, modal open/closed).

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, `@tanstack/react-query` v5, plain CSS (tokens ported from the artifact), Vitest + React Testing Library for logic-level tests.

**Spec:** `docs/superpowers/specs/2026-09-21-week-planner-prototype-design.md`

## Global Constraints

- New, isolated project — do not attempt to connect to any real LogixSphere repository or backend.
- Data access must go exclusively through `lib/week-planner-api.ts` (or a new file directly beside it) — never `fetch` inside a `.tsx` file, per the anatomy doc's core rule.
- DTOs returned by `lib/week-planner-api.ts` must be `snake_case`; the `utils/weekPlannerMappers.ts` module converts to the `camelCase` view models in `types.ts` — this mirrors the real backend contract described in `CONTRATO-DE-API-PARA-PAGES.md`.
- No persistence of any kind. Every write action resolves through a mock function and ends in a toast; nothing is stored beyond in-memory React state.
- Automated tests apply to pure logic (mappers, hooks) using Vitest — presentational components are verified by `tsc`, `next build`, and a manual browser checklist (documented in the final task), not automated render tests. This is a deliberate, spec-approved scope reduction (design doc §8) — not a gap to silently fill in later.
- Visual fidelity: CSS classes/structure should match the artifact 1:1 so the ported stylesheet (Task 7) applies without modification.
- Package manager: npm (works everywhere without extra setup assumptions).

---

## File Structure

```
week-planner-prototype/
  package.json, tsconfig.json, next.config.ts, .eslintrc.json, vitest.config.ts
  app/
    layout.tsx
    providers.tsx
    (private)/
      layout.tsx
      components/
        NavbarWrapper.tsx
        PrivateRouteLoading.tsx
      week-planner/
        page.tsx
        loading.tsx
        types.ts
        constants.ts
        styles.css
        components/
          Toast.tsx
          StatusDisc.tsx
          RouteCard.tsx
          DayGrid.tsx
          AdhocSection.tsx
          DepotTabs.tsx
          TeamLeaderTrack.tsx
          WeekPickerButton.tsx
          WeekPickerPopover.tsx
          rail/
            NotesPanel.tsx
            ManagementSupportPanel.tsx
            OffHolidayPanel.tsx
            ExceptionsPanel.tsx
            PlanHorizonPanel.tsx
          modals/
            PlannerModal.tsx
            modalConfigs.tsx
            fields.tsx
        hooks/
          useWeekPlannerBoard.ts
          useWeekPlannerActions.ts
        utils/
          weekPlannerMappers.ts
          weekPlannerMappers.test.ts
  lib/
    week-planner-api.ts
    mocks/
      week-planner-fixtures.ts
  README.md
```

---

### Task 1: Project scaffold, TypeScript config, TanStack Query provider

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `.eslintrc.json`
- Create: `next-env.d.ts`
- Create: `app/layout.tsx`
- Create: `app/providers.tsx`
- Create: `app/globals.css`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `Providers` component (`app/providers.tsx`, default export) wrapping children in `QueryClientProvider`. Every later page/layout renders inside it.
- Produces: path alias `@/*` → project root (used by every subsequent task's imports).

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "week-planner-prototype",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.59.0",
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.1",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.15",
    "jsdom": "^25.0.1",
    "typescript": "^5.6.3",
    "vitest": "^2.1.2"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 4: Write `.eslintrc.json`**

```json
{
  "extends": "next/core-web-vitals"
}
```

- [ ] **Step 5: Write `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 6: Write `app/globals.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { -webkit-font-smoothing: antialiased; }
```

- [ ] **Step 7: Write `app/providers.tsx`**

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 8: Write `app/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "LogixSphere Week Planner — Protótipo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 10: Install dependencies and verify the scaffold boots**

Run: `npm install`
Expected: installs without error.

Run: `npm run typecheck`
Expected: passes (no `.tsx` route exists yet other than the root layout, which type-checks cleanly).

- [ ] **Step 11: Commit**

```bash
git init -q 2>/dev/null || true
git add package.json tsconfig.json next.config.ts .eslintrc.json next-env.d.ts vitest.config.ts app/
git commit -m "chore: scaffold Next.js project with TanStack Query provider"
```

---

### Task 2: Private-route shell stubs

**Files:**
- Create: `app/(private)/layout.tsx`
- Create: `app/(private)/components/NavbarWrapper.tsx`
- Create: `app/(private)/components/PrivateRouteLoading.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks besides the `Providers` wrapper already applied in `app/layout.tsx`.
- Produces: `NavbarWrapper` (default export, `{ children: ReactNode }`) and `PrivateRouteLoading` (default export, no props) — both imported directly by the `week-planner` route in Task 17.

- [ ] **Step 1: Write `app/(private)/components/NavbarWrapper.tsx`**

```tsx
import type { ReactNode } from "react";

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "#1a1a1e",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          fontSize: 12,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span>LogixSphere — stub navbar (protótipo isolado)</span>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Write `app/(private)/components/PrivateRouteLoading.tsx`**

```tsx
export default function PrivateRouteLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
        color: "#6b7280",
      }}
    >
      Carregando…
    </div>
  );
}
```

- [ ] **Step 3: Write `app/(private)/layout.tsx`**

```tsx
import type { ReactNode } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 4: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add "app/(private)"
git commit -m "feat: add private-route shell stubs (NavbarWrapper, PrivateRouteLoading)"
```

---

### Task 3: Domain types and static constants

**Files:**
- Create: `app/(private)/week-planner/types.ts`
- Create: `app/(private)/week-planner/constants.ts`

**Interfaces:**
- Produces: every type used by later tasks — `RouteStatus`, `VehicleBadge`, `RouteCardModel`, `DayColumnModel`, `WeekOption`, `NoteModel`, `AbsenceChip`, `AbsenceDayModel`, `ManagementCellModel`, `ManagementDayModel`, `SpareVehicleModel`, `SpareDriverModel`, `ExceptionsModel`, `HorizonAction`, `HorizonDepotStatus`, `HorizonStat`, `HorizonWeekModel`, `WeekPlannerBoardModel`.
- Produces: constants — `DEPOTS: string[]`, `LEADERS: string[]`, `HEADER_ACTIONS: { id: string; label: string }[]`, `OPTIONS: { vendor, vehicle, fn, manager, flex, adhoc }`, `WEEK_OPTIONS: WeekOption[]`, `MONTH_LABELS: string[]`.

- [ ] **Step 1: Write `app/(private)/week-planner/types.ts`**

```ts
export type RouteStatus = "ok" | "warning" | "conflict" | "error" | "open";
export type VehicleBadge = "ok" | "sub" | "none" | null;

export interface RouteCardModel {
  id: string;
  code: string;
  isFlex: boolean;
  status: RouteStatus;
  driverName: string | null;
  vehiclePlate: string | null;
  vehicleBadge: VehicleBadge;
}

export type ReviewBadge = "reviewed" | "re-review" | null;

export interface DayColumnModel {
  date: string;
  name: string;
  dayNumber: string;
  isWeekend: boolean;
  reviewBadge: ReviewBadge;
  assignmentCount: number;
  mainRoutes: RouteCardModel[];
  adhocRoutes: RouteCardModel[];
}

export type WeekState = "past" | "current" | "next" | "draft" | "future";

export interface WeekOption {
  id: string;
  label: string;
  range: string;
  state: WeekState;
}

export interface NoteModel {
  id: string;
  severity: "URGENT" | "CRITICAL";
  body: string;
  acknowledged: boolean;
}

export interface AbsenceChip {
  kind: "OFF" | "LEAVE";
  personName: string;
}

export interface AbsenceDayModel {
  dayLabel: string;
  chips: AbsenceChip[];
  extraCount: number;
}

export interface ManagementCellModel {
  managerName: string;
  isMuted: boolean;
  tooltip?: string;
}

export interface ManagementDayModel {
  dayLabel: string;
  cells: ManagementCellModel[];
}

export interface SpareVehicleModel {
  tag: "SPARE" | "VOR";
  plate: string;
  usable: boolean;
}

export interface SpareDriverModel {
  tag: "UNALLOCATED" | "SPARE" | "FLEX";
  name: string;
  placeable: boolean;
}

export interface ExceptionsModel {
  dayLabel: string;
  vehicles: {
    utilizationLabel: string;
    utilizationPercent: number;
    depotLabel: string;
    items: SpareVehicleModel[];
  };
  drivers: {
    unallocated: SpareDriverModel | null;
    items: SpareDriverModel[];
  };
}

export interface HorizonAction {
  label: string;
  variant: "primary" | "pill" | "default";
}

export interface HorizonDepotStatus {
  code: string;
  approved: boolean;
}

export type HorizonStatTone = "sealed" | "pending" | "fix" | "open";

export interface HorizonStat {
  label: string;
  tone: HorizonStatTone;
}

export type HorizonDayMark = "ok" | "bad" | "weekend";

export interface HorizonWeekModel {
  weekLabel: string;
  range: string;
  isActive: boolean;
  dayStrip: HorizonDayMark[];
  actions: HorizonAction[];
  depots: HorizonDepotStatus[];
  stats: HorizonStat[];
}

export interface WeekPlannerBoardModel {
  weekId: string;
  depotId: string;
  days: DayColumnModel[];
  notes: NoteModel[];
  absences: AbsenceDayModel[];
  management: ManagementDayModel[];
  exceptionsByDate: Record<string, ExceptionsModel>;
  horizon: HorizonWeekModel[];
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/constants.ts`**

```ts
export const DEPOTS = ["LCY", "MSE", "LSE", "BASP"] as const;

export const LEADERS = ["MARLON VALESAN", "PRIYA RAMANATHAN", "DEAN OKONKWO", "S. BRAITHWAITE"] as const;

export const HEADER_ACTIONS = [
  { id: "save", label: "SAVE" },
  { id: "managementSupport", label: "MANAGEMENT AND SUPPORT" },
  { id: "addNote", label: "ADD ANNOTATIONS" },
  { id: "registerDayOff", label: "DAY OFF" },
  { id: "exportWeek", label: "EXPORT WEEK" },
  { id: "exportDay", label: "EXPORT DAY" },
  { id: "generateWeek", label: "GENERATE WEEK" },
] as const;

export const OPTIONS = {
  vendor: ["M. Whitfield", "K. Lennon", "J. Corrigan", "R. Chandran", "S. McAlister"],
  vehicle: ["LK71 XWD", "BV23 ORE", "KV68 TRD", "LR71 PFA", "WM24 QSE"],
  fn: ["Ops Manager", "Team Leader", "Admin"],
  manager: ["Leandro Dias", "Marlon Valesan", "G. Ellison", "K. Mensah"],
  flex: ["LS1Q", "LS3F", "MD7C"],
  adhoc: ["Container unload", "Trailer shunt", "Yard support"],
};

export const WEEK_OPTIONS = [
  { id: "w32", label: "W32", range: "30 Jun – 06 Jul", state: "past" as const },
  { id: "w33", label: "W33", range: "07 Jul – 13 Jul", state: "past" as const },
  { id: "w34", label: "W34", range: "13 Jul — 19 Jul", state: "current" as const },
  { id: "w35", label: "W35", range: "20 Jul – 26 Jul", state: "next" as const },
  { id: "w36", label: "W36", range: "27 Jul – 02 Ago", state: "draft" as const },
  { id: "w37", label: "W37", range: "03 Ago – 09 Ago", state: "future" as const },
];

export const MONTH_LABELS = ["JULY", "AUGUST", "SEPTEMBER"];

export const DEFAULT_WEEK_ID = "w34";
export const DEFAULT_DEPOT_ID: (typeof DEPOTS)[number] = "LCY";
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/week-planner/types.ts" "app/(private)/week-planner/constants.ts"
git commit -m "feat: add week-planner domain types and static constants"
```

---

### Task 4: Mock fixtures (backend-shaped, snake_case)

**Files:**
- Create: `lib/mocks/week-planner-fixtures.ts`

**Interfaces:**
- Produces: `WeekPlannerBoardDTO` type (snake_case mirror of the real backend response) and `WEEK_PLANNER_BOARD_FIXTURE: WeekPlannerBoardDTO` — the single source of mock board data, consumed by `lib/week-planner-api.ts` (Task 5).

- [ ] **Step 1: Write `lib/mocks/week-planner-fixtures.ts`**

```ts
export interface RouteCardDTO {
  id: string;
  code: string;
  is_flex: boolean;
  status: "ok" | "warning" | "conflict" | "error" | "open";
  driver_name: string | null;
  vehicle_plate: string | null;
  vehicle_badge: "ok" | "sub" | "none" | null;
}

export interface DayColumnDTO {
  date: string;
  name: string;
  day_number: string;
  is_weekend: boolean;
  review_badge: "reviewed" | "re-review" | null;
  assignment_count: number;
  main_routes: RouteCardDTO[];
  adhoc_routes: RouteCardDTO[];
}

export interface NoteDTO {
  id: string;
  severity: "URGENT" | "CRITICAL";
  body: string;
  acknowledged: boolean;
}

export interface AbsenceDayDTO {
  day_label: string;
  chips: { kind: "OFF" | "LEAVE"; person_name: string }[];
  extra_count: number;
}

export interface ManagementDayDTO {
  day_label: string;
  cells: { manager_name: string; is_muted: boolean; tooltip?: string }[];
}

export interface ExceptionsDTO {
  day_label: string;
  vehicles: {
    utilization_label: string;
    utilization_percent: number;
    depot_label: string;
    items: { tag: "SPARE" | "VOR"; plate: string; usable: boolean }[];
  };
  drivers: {
    unallocated: { tag: "UNALLOCATED"; name: string; placeable: boolean } | null;
    items: { tag: "SPARE" | "FLEX"; name: string; placeable: boolean }[];
  };
}

export interface HorizonWeekDTO {
  week_label: string;
  range: string;
  is_active: boolean;
  day_strip: ("ok" | "bad" | "weekend")[];
  actions: { label: string; variant: "primary" | "pill" | "default" }[];
  depots: { code: string; approved: boolean }[];
  stats: { label: string; tone: "sealed" | "pending" | "fix" | "open" }[];
}

export interface WeekPlannerBoardDTO {
  week_id: string;
  depot_id: string;
  days: DayColumnDTO[];
  notes: NoteDTO[];
  absences: AbsenceDayDTO[];
  management: ManagementDayDTO[];
  exceptions_by_date: Record<string, ExceptionsDTO>;
  horizon: HorizonWeekDTO[];
}

const route = (
  id: string,
  code: string,
  status: RouteCardDTO["status"],
  driver: string | null,
  plate: string | null,
  badge: RouteCardDTO["vehicle_badge"],
  isFlex = false,
): RouteCardDTO => ({
  id,
  code,
  is_flex: isFlex,
  status,
  driver_name: driver,
  vehicle_plate: plate,
  vehicle_badge: badge,
});

export const WEEK_PLANNER_BOARD_FIXTURE: WeekPlannerBoardDTO = {
  week_id: "w34",
  depot_id: "LCY",
  days: [
    {
      date: "2024-07-13",
      name: "MONDAY",
      day_number: "13",
      is_weekend: false,
      review_badge: "reviewed",
      assignment_count: 50,
      main_routes: [
        route("mon-1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("mon-2", "LS2C", "open", null, null, null),
        route("mon-3", "LS1Q", "error", "K. Lennon", null, "none", true),
        route("mon-4", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("mon-5", "LS1B", "warning", "M. Whitfield", "LK71 XWD", "ok"),
      ],
      adhoc_routes: [
        route("mon-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("mon-a2", "LS2C", "open", null, null, null),
      ],
    },
    {
      date: "2024-07-14",
      name: "TUESDAY",
      day_number: "14",
      is_weekend: false,
      review_badge: "re-review",
      assignment_count: 56,
      main_routes: [
        route("tue-1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("tue-2", "LS2A", "conflict", "J. Corrigan", "BV23 ORE", "sub"),
        route("tue-3", "LS2C", "open", null, null, null),
      ],
      adhoc_routes: [route("tue-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok")],
    },
    {
      date: "2024-07-15",
      name: "WEDNESDAY",
      day_number: "15",
      is_weekend: false,
      review_badge: null,
      assignment_count: 56,
      main_routes: [
        route("wed-1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("wed-2", "LS2A", "conflict", "J. Corrigan", "BV23 ORE", "sub"),
        route("wed-3", "LS1B", "warning", "M. Whitfield", "LK71 XWD", "ok"),
      ],
      adhoc_routes: [route("wed-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok")],
    },
    {
      date: "2024-07-16",
      name: "THURSDAY",
      day_number: "16",
      is_weekend: false,
      review_badge: null,
      assignment_count: 56,
      main_routes: [
        route("thu-1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("thu-2", "LS2C", "open", null, null, null),
        route("thu-3", "LS1Q", "error", "K. Lennon", null, "none", true),
        route("thu-4", "LS2A", "conflict", "J. Corrigan", "BV23 ORE", "sub"),
      ],
      adhoc_routes: [
        route("thu-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("thu-a2", "LS2C", "open", null, null, null),
      ],
    },
    {
      date: "2024-07-17",
      name: "FRIDAY",
      day_number: "17",
      is_weekend: false,
      review_badge: null,
      assignment_count: 56,
      main_routes: [
        route("fri-1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("fri-2", "LS1Q", "error", "K. Lennon", null, "none", true),
      ],
      adhoc_routes: [route("fri-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok")],
    },
    {
      date: "2024-07-18",
      name: "SATURDAY",
      day_number: "18",
      is_weekend: true,
      review_badge: null,
      assignment_count: 3,
      main_routes: [route("sat-1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"), route("sat-2", "LS2C", "open", null, null, null)],
      adhoc_routes: [],
    },
    {
      date: "2024-07-19",
      name: "SUNDAY",
      day_number: "19",
      is_weekend: true,
      review_badge: null,
      assignment_count: 0,
      main_routes: [],
      adhoc_routes: [],
    },
  ],
  notes: [
    {
      id: "n1",
      severity: "URGENT",
      body: "Prioritize Wave 1 dispatch for LS1Q and LS2A. South corridor restricted to single lane until 09:30.",
      acknowledged: true,
    },
    {
      id: "n2",
      severity: "CRITICAL",
      body: "Re-calibrated with 4s tacho verification. Inbound drivers from MSE must use manual bypass lane 1B if camera delay exceeds 10s.",
      acknowledged: false,
    },
  ],
  absences: [
    { day_label: "MON", chips: [{ kind: "OFF", person_name: "T. Farris" }, { kind: "LEAVE", person_name: "G. Adeb.." }], extra_count: 0 },
    {
      day_label: "TUE",
      chips: [
        { kind: "OFF", person_name: "B. Whit.." },
        { kind: "LEAVE", person_name: "P. Novak" },
        { kind: "OFF", person_name: "J. Carew" },
      ],
      extra_count: 0,
    },
    { day_label: "WED", chips: [], extra_count: 0 },
    {
      day_label: "THU",
      chips: [
        { kind: "OFF", person_name: "D. Adey.." },
        { kind: "OFF", person_name: "C. Reid" },
        { kind: "LEAVE", person_name: "J. Dool.." },
        { kind: "OFF", person_name: "N. Quinn" },
      ],
      extra_count: 2,
    },
    { day_label: "FRI", chips: [{ kind: "OFF", person_name: "R. Chan.." }, { kind: "LEAVE", person_name: "E. Kami.." }], extra_count: 0 },
  ],
  management: [
    { day_label: "MON 13", cells: [{ manager_name: "G. Ellison", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "K. Mensah", is_muted: true }] },
    { day_label: "TUE 14", cells: [{ manager_name: "G. Ellison", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "K. Mensah", is_muted: true }] },
    {
      day_label: "WED 15",
      cells: [
        { manager_name: "G. Ellison", is_muted: false },
        { manager_name: "G. Ellison", is_muted: false, tooltip: "+A.STROOD - AT OTHER DEPOT" },
        { manager_name: "G. Ellison", is_muted: false },
        { manager_name: "K. Mensah", is_muted: true },
      ],
    },
    { day_label: "THU 16", cells: [{ manager_name: "G. Ellison", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "K. Mensah", is_muted: true }] },
    { day_label: "FRI 17", cells: [{ manager_name: "G. Ellison", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "K. Mensah", is_muted: true }] },
  ],
  exceptions_by_date: {
    "2024-07-16": {
      day_label: "THURSDAY",
      vehicles: {
        utilization_label: "12/15",
        utilization_percent: 80,
        depot_label: "LSE",
        items: [
          { tag: "SPARE", plate: "KV68 TRD", usable: true },
          { tag: "SPARE", plate: "LR71 PFA", usable: true },
          { tag: "SPARE", plate: "WM24 QSE", usable: true },
          { tag: "VOR", plate: "OY69 HDK — WORKSHOP", usable: false },
        ],
      },
      drivers: {
        unallocated: { tag: "UNALLOCATED", name: "R. Chandran", placeable: true },
        items: [
          { tag: "SPARE", name: "S. McAlister", placeable: false },
          { tag: "SPARE", name: "J. Blake", placeable: false },
          { tag: "FLEX", name: "A. Strood", placeable: false },
          { tag: "FLEX", name: "V. Ilic", placeable: false },
        ],
      },
    },
  },
  horizon: [
    { week_label: "W28", range: "06 – 12 JUL", is_active: false, day_strip: ["ok", "ok", "ok", "ok", "ok", "weekend", "weekend"], actions: [{ label: "REVIEW ▸", variant: "pill" }], depots: [{ code: "LCY", approved: true }, { code: "MSE", approved: true }, { code: "LSE", approved: true }], stats: [{ label: "SEALED ✓", tone: "sealed" }] },
    { week_label: "W29", range: "13 – 19 JUL", is_active: true, day_strip: ["ok", "ok", "ok", "bad", "ok", "weekend", "weekend"], actions: [{ label: "APPROVE LSE ▸", variant: "primary" }, { label: "SEND — AFTER SEAL", variant: "default" }], depots: [{ code: "LCY", approved: true }, { code: "MSE", approved: true }, { code: "LSE", approved: false }], stats: [{ label: "2 OF 3", tone: "pending" }, { label: "3 TO FIX", tone: "fix" }] },
    { week_label: "W30", range: "20 – 26 JUL", is_active: false, day_strip: ["ok", "ok", "ok", "ok", "ok", "weekend", "weekend"], actions: [{ label: "GENERATE MSE + LSE…", variant: "default" }, { label: "COPY W29…", variant: "default" }], depots: [{ code: "LCY", approved: true }, { code: "MSE", approved: false }, { code: "LSE", approved: false }], stats: [{ label: "1 OF 3", tone: "pending" }] },
    { week_label: "W31", range: "27 JUL – 02 AUG", is_active: false, day_strip: ["ok", "ok", "ok", "ok", "ok", "weekend", "weekend"], actions: [{ label: "GENERATE…", variant: "default" }], depots: [{ code: "LCY", approved: false }, { code: "MSE", approved: false }, { code: "LSE", approved: false }], stats: [{ label: "OPEN", tone: "open" }] },
    { week_label: "W32", range: "03 – 09 AUG", is_active: false, day_strip: ["ok", "ok", "ok", "ok", "ok", "weekend", "weekend"], actions: [{ label: "GENERATE…", variant: "default" }], depots: [{ code: "LCY", approved: false }, { code: "MSE", approved: false }, { code: "LSE", approved: false }], stats: [{ label: "OPEN", tone: "open" }] },
    { week_label: "W33", range: "10 – 16 AUG", is_active: false, day_strip: ["ok", "ok", "ok", "ok", "ok", "weekend", "weekend"], actions: [{ label: "GENERATE…", variant: "default" }], depots: [{ code: "LCY", approved: false }, { code: "MSE", approved: false }, { code: "LSE", approved: false }], stats: [{ label: "OPEN", tone: "open" }] },
  ],
};
```

> Note: the fixture is intentionally independent of the selected week/depot (mirroring the artifact's own behavior — changing the week or depot in the picker there only changed the label, not the board). `lib/week-planner-api.ts` (Task 5) returns this same fixture regardless of the params it receives, but stamps the requested `week_id`/`depot_id` onto the response so the UI reflects the current selection.

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add lib/mocks/week-planner-fixtures.ts
git commit -m "feat: add backend-shaped mock fixture for the week planner board"
```

---

### Task 5: Data-access layer and DTO→model mappers

**Files:**
- Create: `app/(private)/week-planner/utils/weekPlannerMappers.ts`
- Create: `app/(private)/week-planner/utils/weekPlannerMappers.test.ts`
- Create: `lib/week-planner-api.ts`

**Interfaces:**
- Consumes: `WeekPlannerBoardDTO` and `WEEK_PLANNER_BOARD_FIXTURE` from `lib/mocks/week-planner-fixtures.ts` (Task 4); `WeekPlannerBoardModel` and friends from `types.ts` (Task 3).
- Produces: `mapWeekPlannerBoardDtoToModel(dto: WeekPlannerBoardDTO): WeekPlannerBoardModel` (used by `lib/week-planner-api.ts` and testable standalone); `fetchWeekPlannerBoard(params: { depotId: string; weekId: string }): Promise<WeekPlannerBoardModel>`, `submitPlannerAction(actionLabel: string): Promise<{ message: string }>`, and `generateDefaultSchedule(): Promise<GenerateScheduleResult>` from `lib/week-planner-api.ts` — the only functions later hooks (Task 6) are allowed to call.

- [ ] **Step 1: Write the failing test `app/(private)/week-planner/utils/weekPlannerMappers.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { mapWeekPlannerBoardDtoToModel } from "./weekPlannerMappers";
import type { WeekPlannerBoardDTO } from "@/lib/mocks/week-planner-fixtures";

const dto: WeekPlannerBoardDTO = {
  week_id: "w34",
  depot_id: "LCY",
  days: [
    {
      date: "2024-07-13",
      name: "MONDAY",
      day_number: "13",
      is_weekend: false,
      review_badge: "reviewed",
      assignment_count: 50,
      main_routes: [
        {
          id: "mon-1",
          code: "LS1B",
          is_flex: false,
          status: "ok",
          driver_name: "M. Whitfield",
          vehicle_plate: "LK71 XWD",
          vehicle_badge: "ok",
        },
      ],
      adhoc_routes: [],
    },
  ],
  notes: [{ id: "n1", severity: "URGENT", body: "test", acknowledged: false }],
  absences: [{ day_label: "MON", chips: [{ kind: "OFF", person_name: "T. Farris" }], extra_count: 0 }],
  management: [{ day_label: "MON 13", cells: [{ manager_name: "G. Ellison", is_muted: false }] }],
  exceptions_by_date: {
    "2024-07-13": {
      day_label: "MONDAY",
      vehicles: { utilization_label: "12/15", utilization_percent: 80, depot_label: "LSE", items: [] },
      drivers: { unallocated: null, items: [] },
    },
  },
  horizon: [
    {
      week_label: "W28",
      range: "06 – 12 JUL",
      is_active: false,
      day_strip: ["ok"],
      actions: [{ label: "REVIEW ▸", variant: "pill" }],
      depots: [{ code: "LCY", approved: true }],
      stats: [{ label: "SEALED ✓", tone: "sealed" }],
    },
  ],
};

describe("mapWeekPlannerBoardDtoToModel", () => {
  it("converts snake_case DTO fields to camelCase view-model fields", () => {
    const model = mapWeekPlannerBoardDtoToModel(dto);

    expect(model.weekId).toBe("w34");
    expect(model.days[0].dayNumber).toBe("13");
    expect(model.days[0].isWeekend).toBe(false);
    expect(model.days[0].reviewBadge).toBe("reviewed");
    expect(model.days[0].mainRoutes[0]).toEqual({
      id: "mon-1",
      code: "LS1B",
      isFlex: false,
      status: "ok",
      driverName: "M. Whitfield",
      vehiclePlate: "LK71 XWD",
      vehicleBadge: "ok",
    });
    expect(model.notes[0].acknowledged).toBe(false);
    expect(model.absences[0].chips[0].personName).toBe("T. Farris");
    expect(model.management[0].cells[0].managerName).toBe("G. Ellison");
    expect(model.exceptionsByDate["2024-07-13"].vehicles.utilizationPercent).toBe(80);
    expect(model.horizon[0].isActive).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- weekPlannerMappers`
Expected: FAIL — `weekPlannerMappers.ts` does not exist / `mapWeekPlannerBoardDtoToModel` is not defined.

- [ ] **Step 3: Write `app/(private)/week-planner/utils/weekPlannerMappers.ts`**

```ts
import type {
  AbsenceDayDTO,
  DayColumnDTO,
  ExceptionsDTO,
  HorizonWeekDTO,
  ManagementDayDTO,
  NoteDTO,
  RouteCardDTO,
  WeekPlannerBoardDTO,
} from "@/lib/mocks/week-planner-fixtures";
import type {
  AbsenceDayModel,
  DayColumnModel,
  ExceptionsModel,
  HorizonWeekModel,
  ManagementDayModel,
  NoteModel,
  RouteCardModel,
  WeekPlannerBoardModel,
} from "../types";

function mapRoute(dto: RouteCardDTO): RouteCardModel {
  return {
    id: dto.id,
    code: dto.code,
    isFlex: dto.is_flex,
    status: dto.status,
    driverName: dto.driver_name,
    vehiclePlate: dto.vehicle_plate,
    vehicleBadge: dto.vehicle_badge,
  };
}

function mapDay(dto: DayColumnDTO): DayColumnModel {
  return {
    date: dto.date,
    name: dto.name,
    dayNumber: dto.day_number,
    isWeekend: dto.is_weekend,
    reviewBadge: dto.review_badge,
    assignmentCount: dto.assignment_count,
    mainRoutes: dto.main_routes.map(mapRoute),
    adhocRoutes: dto.adhoc_routes.map(mapRoute),
  };
}

function mapNote(dto: NoteDTO): NoteModel {
  return { id: dto.id, severity: dto.severity, body: dto.body, acknowledged: dto.acknowledged };
}

function mapAbsenceDay(dto: AbsenceDayDTO): AbsenceDayModel {
  return {
    dayLabel: dto.day_label,
    chips: dto.chips.map((c) => ({ kind: c.kind, personName: c.person_name })),
    extraCount: dto.extra_count,
  };
}

function mapManagementDay(dto: ManagementDayDTO): ManagementDayModel {
  return {
    dayLabel: dto.day_label,
    cells: dto.cells.map((c) => ({ managerName: c.manager_name, isMuted: c.is_muted, tooltip: c.tooltip })),
  };
}

function mapExceptions(dto: ExceptionsDTO): ExceptionsModel {
  return {
    dayLabel: dto.day_label,
    vehicles: {
      utilizationLabel: dto.vehicles.utilization_label,
      utilizationPercent: dto.vehicles.utilization_percent,
      depotLabel: dto.vehicles.depot_label,
      items: dto.vehicles.items.map((v) => ({ tag: v.tag, plate: v.plate, usable: v.usable })),
    },
    drivers: {
      unallocated: dto.drivers.unallocated
        ? { tag: "UNALLOCATED", name: dto.drivers.unallocated.name, placeable: dto.drivers.unallocated.placeable }
        : null,
      items: dto.drivers.items.map((d) => ({ tag: d.tag, name: d.name, placeable: d.placeable })),
    },
  };
}

function mapHorizonWeek(dto: HorizonWeekDTO): HorizonWeekModel {
  return {
    weekLabel: dto.week_label,
    range: dto.range,
    isActive: dto.is_active,
    dayStrip: dto.day_strip,
    actions: dto.actions,
    depots: dto.depots,
    stats: dto.stats,
  };
}

export function mapWeekPlannerBoardDtoToModel(dto: WeekPlannerBoardDTO): WeekPlannerBoardModel {
  return {
    weekId: dto.week_id,
    depotId: dto.depot_id,
    days: dto.days.map(mapDay),
    notes: dto.notes.map(mapNote),
    absences: dto.absences.map(mapAbsenceDay),
    management: dto.management.map(mapManagementDay),
    exceptionsByDate: Object.fromEntries(
      Object.entries(dto.exceptions_by_date).map(([date, exc]) => [date, mapExceptions(exc)]),
    ),
    horizon: dto.horizon.map(mapHorizonWeek),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- weekPlannerMappers`
Expected: PASS.

- [ ] **Step 5: Write `lib/week-planner-api.ts`**

```ts
import { WEEK_PLANNER_BOARD_FIXTURE } from "./mocks/week-planner-fixtures";
import { mapWeekPlannerBoardDtoToModel } from "@/app/(private)/week-planner/utils/weekPlannerMappers";
import type { WeekPlannerBoardModel } from "@/app/(private)/week-planner/types";

const MOCK_DELAY_MS = 400;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hoje: resolve a fixture local. Amanhã: trocar o corpo por uma chamada real
 * via lib/api-client.ts contra GET /bff/week-planners?depot=&week=
 * (ver CONTRATO-DE-API-PARA-PAGES.md). Assinatura e formato de retorno não
 * mudam — hooks e componentes não precisam ser tocados.
 */
export async function fetchWeekPlannerBoard(params: {
  depotId: string;
  weekId: string;
}): Promise<WeekPlannerBoardModel> {
  await wait(MOCK_DELAY_MS);
  const dto = { ...WEEK_PLANNER_BOARD_FIXTURE, week_id: params.weekId, depot_id: params.depotId };
  return mapWeekPlannerBoardDtoToModel(dto);
}

/**
 * Cobre todas as ações de escrita "genéricas" do protótipo (botões do
 * cabeçalho e submits de modal) — amanhã, cada uma vira uma chamada real
 * (POST/PATCH) para o endpoint específico documentado no contrato de API.
 */
export async function submitPlannerAction(actionLabel: string): Promise<{ message: string }> {
  await wait(250);
  return { message: `${actionLabel.toUpperCase()} — enviado (protótipo, nada foi gravado).` };
}

export interface GenerateScheduleResult {
  totalCreated: number;
  managementCreated: number;
  primaryCreated: number;
  secondaryCreated: number;
  vendorCount: number;
  dayCount: number;
}

/**
 * Amanhã: POST /bff/week-planners/bulk-approve (ou endpoint equivalente de
 * geração de escala padrão — a confirmar com o backend).
 */
export async function generateDefaultSchedule(): Promise<GenerateScheduleResult> {
  await wait(600);
  return {
    totalCreated: 124,
    managementCreated: 30,
    primaryCreated: 124,
    secondaryCreated: 0,
    vendorCount: 40,
    dayCount: 5,
  };
}
```

- [ ] **Step 6: Type-check and run the full test suite**

Run: `npm run typecheck && npm run test`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add "app/(private)/week-planner/utils" lib/week-planner-api.ts
git commit -m "feat: add DTO-to-model mappers and mock data-access layer"
```

---

### Task 6: Hooks — board query, actions, toast context

**Files:**
- Create: `app/(private)/week-planner/components/Toast.tsx`
- Create: `app/(private)/week-planner/hooks/useWeekPlannerBoard.ts`
- Create: `app/(private)/week-planner/hooks/useWeekPlannerActions.ts`

**Interfaces:**
- Consumes: `fetchWeekPlannerBoard`, `submitPlannerAction`, `generateDefaultSchedule` from `lib/week-planner-api.ts` (Task 5).
- Produces: `ToastProvider` (default export, wraps children) and `useToast(): { showToast: (message: string) => void }` from `Toast.tsx`; `useWeekPlannerBoard(depotId: string, weekId: string)` returning a TanStack Query result of `WeekPlannerBoardModel`; `useWeekPlannerActions()` returning `{ runAction: (label: string) => Promise<void>; runGenerateWeek: () => Promise<GenerateScheduleResult> }` — consumed by every interactive component from Task 8 onward.

- [ ] **Step 1: Write `app/(private)/week-planner/components/Toast.tsx`**

```tsx
"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((next: string) => {
    setMessage(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast" hidden={message === null}>
        {message}
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/hooks/useWeekPlannerBoard.ts`**

```ts
import { useQuery } from "@tanstack/react-query";
import { fetchWeekPlannerBoard } from "@/lib/week-planner-api";

export function useWeekPlannerBoard(depotId: string, weekId: string) {
  return useQuery({
    queryKey: ["week-planner-board", depotId, weekId],
    queryFn: () => fetchWeekPlannerBoard({ depotId, weekId }),
  });
}
```

- [ ] **Step 3: Write `app/(private)/week-planner/hooks/useWeekPlannerActions.ts`**

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateDefaultSchedule, submitPlannerAction, type GenerateScheduleResult } from "@/lib/week-planner-api";
import { useToast } from "../components/Toast";

export function useWeekPlannerActions() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const actionMutation = useMutation({
    mutationFn: (label: string) => submitPlannerAction(label),
    onSuccess: (result) => {
      showToast(result.message);
      queryClient.invalidateQueries({ queryKey: ["week-planner-board"] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => generateDefaultSchedule(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week-planner-board"] });
    },
  });

  return {
    runAction: (label: string) => actionMutation.mutateAsync(label).then(() => undefined),
    runGenerateWeek: (): Promise<GenerateScheduleResult> => generateMutation.mutateAsync(),
  };
}
```

- [ ] **Step 4: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add "app/(private)/week-planner/components/Toast.tsx" "app/(private)/week-planner/hooks"
git commit -m "feat: add toast context and week-planner query/mutation hooks"
```

---

### Task 7: Ported stylesheet (design tokens + component classes)

**Files:**
- Create: `app/(private)/week-planner/styles.css`

**Interfaces:**
- Produces: every CSS class referenced by Tasks 8–16 (`.wrap`, `.topbar`, `.title`, `.demo-tag`, `.header`, `.weekbtn`, `.tbtn`, `.controls`, `.tabs`, `.tab`, `.wkend`, `.addrow`, `.addbtn`, `.cols`, `.board`, `.tltrack`, `.tlscroll`, `.tlchip`, `.chip-nav`, `.gridscroll`, `.grid`, `.day`, `.dayhead`, `.daybtn`, `.dayname`, `.daynum`, `.daybadge`, `.dayadd`, `.rc`, `.plate`, `.flexlbl`, `.code`, `.notchel`, `.disc`, `.rcbody`, `.driver`, `.veh`, `.drop`, `.assign`, `.sechead`, `footer.pg`, `.railcol`, `.rhead`, `.notes`, `.noteshd`, `.dot`, `.noteslbl`, `.mini`, `.noteslist`, `.note`, `.sev`, `.notebody`, `.notemeta`, `.mgrid`, `.mday`, `.mcard`, `.mband`, `.mname`, `.tip`, `.offgrid`, `.offday`, `.hatch`, `.more`, `.exc`, `.excard`, `.exhd`, `.daychip`, `.exkind`, `.excount`, `.exrow`, `.exlbl`, `.plate-chip`, `.use`, `.unall`, `.place`, `.exname`, `.foot`, `.hz`, `.hzrow`, `.hzwk`, `.strip`, `.hzact`, `.hzbtn`, `.hzend`, `.depots`, `.stat`, `.scrim`, `.dlg`, `.dlghd`, `.xbtn`, `.dlgbody`, `.dlgdesc`, `.dlgft`, `.ghost`, `.primary`, `.two`, `.span2`, `.fld`, `.ctl`, `.seg`, `.chkrow`, `.box`, `.depotrow`, `.depotchip`, `.rad`, `.fullwk`, `.orsel`, `.daycards`, `.daycard`, `.dctop`, `.dcname`, `.dcdate`, `.dccount`, `.callout`, `.result`, `.count`, `.breakdown`, `.pickwrap`, `.picker`, `.pkhd`, `.pkmonth`, `.gotonow`, `.pklist`, `.pkrow`, `.curbadge`, `.toast`).

- [ ] **Step 1: Write `app/(private)/week-planner/styles.css`**

```css
/* ===========================================================================
   LogixSphere — Week Planner (protótipo)
   Tokens portados do artifact aprovado (Figma "Week-Planner",
   Qx1Tf0v03GgwzvaGt2Y6Vw). Esta tela comete deliberadamente ao mundo visual
   único do produto (papel quente, ações teal, cards oliva-lima); por isso
   não segue o tema do navegador — toda superfície e cor é pintada
   explicitamente, igual ao protótipo original.
   =========================================================================== */
.week-planner-page {
  --surface: #fafaef; --rail: #e9e9de; --paper: #ffffff; --notch: #fdfcfa;
  --ghost: #f4f4e9; --overlay: rgba(250, 249, 245, .5); --disabled: #e3e3e3;
  --ink: #1a1c16; --ink-strong: #17171a; --ink-plate: #1a1a1e; --ink-muted: #424936;
  --ink-soft: #6b7280; --ink-faint: #8a8a84; --ink-foot: #707979; --ink-card: #1c1917;
  --ink-help: #78716c; --ink-off: #727a64;
  --line: #bfc8c9; --line-hard: #111827; --line-modal: #d1d1c4; --line-rail: #e4e4d8;
  --line-row: #f0efea; --line-panel: #cecec0;
  --teal: #27676c; --teal-soft: #afedf3; --teal-deep: #003b3e;
  --lime: #b2f746; --lime-primary: #a3e635; --lime-sel: #e4f063;
  --olive: #446900; --olive-deep: #416400; --olive-code: #59651b; --olive-alt: #565f0e;
  --red: #ba1a1a; --orange: #e0592b; --amber: #c98a12; --amber-ink: #8a5c0b;
  --green: #17a673; --weekend-bg: #fff7ed; --weekend-ink: #c2410c; --weekend-accent: #ea580c;
  --flex-blue: #3b3af0;
  --card: linear-gradient(107.71deg, rgb(218, 227, 152) 42%, rgb(230, 236, 187) 68%, rgb(235, 240, 202) 100%);
  --card-open: linear-gradient(110.05deg, rgb(221, 235, 85) 42%, rgb(237, 243, 126) 68%, rgb(241, 246, 154) 100%);
  --wash: radial-gradient(circle at 100% 100%, rgba(89, 101, 27, .15) 0%, rgba(89, 101, 27, 0) 58%);
  --sheen: radial-gradient(circle at 100% 0%, rgba(255, 255, 255, .42) 0%, rgba(255, 255, 255, 0) 52%);
  --sh-card: 0 1px 2px rgba(23, 23, 26, .05), 0 6px 15px rgba(23, 23, 26, .05);
  --sh-disc: 0 0 0 3.5px var(--notch), 0 0 0 4.5px rgba(23, 23, 26, .09), 0 2px 6px rgba(23, 23, 26, .18);
  --sh-pop: 0 25px 50px -12px rgba(0, 0, 0, .25);
  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --display: "Space Grotesk", "Helvetica Neue", Arial, sans-serif;

  background: var(--surface); color: var(--ink); font-family: var(--mono); min-height: 100vh;
}
.week-planner-page * { box-sizing: border-box; }
.week-planner-page h1, .week-planner-page h2, .week-planner-page h3 { margin: 0; text-wrap: balance; }
.week-planner-page button { font: inherit; color: inherit; cursor: pointer; }
.week-planner-page :focus-visible { outline: 2px solid var(--teal-deep); outline-offset: 2px; }
.week-planner-page .mono { font-family: var(--mono); }
.week-planner-page .disp { font-family: var(--display); }

.wrap { max-width: 2253px; margin: 0 auto; padding-inline: 16px; padding-block: 20px 40px; }

.topbar { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 12px; }
.title { font-family: var(--display); font-size: 28px; font-weight: 700; line-height: 32px; }
.demo-tag { font-size: 9px; letter-spacing: .9px; text-transform: uppercase; color: var(--ink-foot); border: 1px solid var(--line); padding: 4px 8px; }
.header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--line); padding-block: 16px; margin-top: 8px; }
.weekbtn { display: flex; align-items: center; gap: 12px; background: none; border: 0; padding: 0; }
.weekbtn .wk { font-family: var(--display); font-size: 18px; font-weight: 700; line-height: 32px; }
.weekbtn .rg { font-size: 13px; font-weight: 500; color: var(--ink-muted); }
.actions { display: flex; flex-wrap: wrap; gap: 8px; }
.tbtn { background: var(--teal); border: 1px solid var(--teal); color: #fff; padding: 8px 16px; font-size: 12px; font-weight: 600; letter-spacing: .6px; text-transform: uppercase; line-height: 12px; }
.tbtn:hover { opacity: .88; }

.controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding-top: 16px; }
.tabs { display: flex; gap: 8px; }
.tab { background: var(--paper); border: 1px solid var(--line); color: var(--ink-muted); padding: 10px 16px; font-size: 11px; font-weight: 500; line-height: 14px; }
.tab[aria-pressed="true"] { background: var(--lime); border-color: var(--teal-deep); color: var(--olive); font-weight: 700; }
.wkend { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--ink-muted); cursor: pointer; }
.addrow { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 11px; padding-top: 16px; }
.addbtn { display: flex; align-items: center; gap: 8px; background: var(--teal); color: #fff; border: 1px solid var(--olive); border-radius: 2px; padding: 9px 17px; }
.addbtn:hover { opacity: .88; }
.addbtn .plus { font-size: 18px; font-weight: 600; line-height: 12px; color: var(--surface); }
.addbtn .lbl { font-size: 12px; font-weight: 600; line-height: 12px; text-transform: uppercase; }

.cols { display: flex; flex-direction: column; gap: 24px; padding-top: 16px; }
@media (min-width: 1280px) { .cols { flex-direction: row; gap: 24px; } }
.board { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 16px; }

.tltrack { display: flex; align-items: stretch; gap: 16px; height: 40px; }
.tltrack .cat { display: flex; align-items: center; width: 145px; flex: none; background: var(--teal-soft); color: var(--teal); padding: 0 12px; font-size: 12px; font-weight: 700; line-height: 14px; }
.tlscroll { display: flex; gap: 8px; min-width: 0; flex: 1; overflow-x: auto; padding: 8px; }
.tlchip { flex: none; height: 24px; display: flex; align-items: center; padding: 0 8px; border: 0; background: var(--rail); color: var(--ink-muted); font-size: 12px; font-weight: 600; line-height: 11px; }
.tlchip[aria-pressed="true"] { background: var(--lime); color: var(--olive); }
.chip-nav { width: 22px; height: 22px; flex: none; align-self: center; display: grid; place-items: center; background: var(--ghost); border: 1px solid var(--line); padding: 0; }

.gridscroll { overflow-x: auto; }
.grid { display: grid; gap: 16px; min-width: 760px; }
.day { background: var(--overlay); padding: 8px; display: flex; flex-direction: column; gap: 8px; border: 1px solid transparent; min-width: 0; }
.day.sel { border-color: var(--lime); }
.dayhead { display: flex; align-items: center; justify-content: space-between; padding: 0 4px; gap: 6px; }
.daybtn { display: flex; align-items: center; gap: 8px; min-width: 0; background: none; border: 0; padding: 0; text-align: left; }
.dayname { font-family: var(--display); font-size: 12px; font-weight: 700; letter-spacing: .36px; color: var(--ink-strong); white-space: nowrap; }
.daynum { font-size: 10px; letter-spacing: .36px; color: var(--ink-faint); }
.daybadge { height: 17.5px; display: inline-flex; align-items: center; padding: 0 6px; font-size: 8.5px; line-height: 8.5px; white-space: nowrap; }
.daybadge.rev { background: rgba(23, 166, 115, .12); color: var(--green); border-radius: 999px; }
.daybadge.rerev { background: rgba(201, 138, 18, .14); color: var(--amber-ink); border-radius: 999px; }
.daybadge.sel { background: var(--lime-sel); color: var(--ink-strong); font-weight: 600; }
.dayadd { font-family: var(--display); font-size: 17px; line-height: 17px; background: none; border: 0; padding: 0 4px; }

.rc { position: relative; display: flex; align-items: center; height: 42px; width: 100%; overflow: hidden; border: 0; padding: 0; text-align: left; box-shadow: var(--sh-card); background-image: var(--card), var(--wash), var(--sheen); transition: transform .12s ease; }
.rc:hover { transform: translateY(-1px); }
.rc.open { background-image: var(--card-open), var(--wash), var(--sheen); }
.plate { position: relative; width: 76px; flex: none; height: 100%; display: flex; flex-direction: column; justify-content: center; padding-left: 12px; }
.flexlbl { font-size: 8px; font-weight: 600; text-transform: uppercase; line-height: 1; color: var(--olive-code); }
.code { font-size: 11.5px; font-weight: 600; letter-spacing: .345px; color: var(--olive-code); text-shadow: 0 0 3px rgba(255, 255, 255, .9), 0 0 9px rgba(255, 255, 255, .95); }
.rc.open .code { color: var(--olive-alt); }
.notchel { position: absolute; top: -5px; bottom: -4.5px; left: 60px; width: 17px; background: var(--notch); transform: skewX(-15.65deg); box-shadow: -1px 0 0 rgba(23, 23, 26, .09), 1px 0 0 rgba(23, 23, 26, .09); }
.disc { position: relative; z-index: 1; margin-left: -9px; width: 19px; height: 19px; flex: none; border-radius: 50%; display: grid; place-items: center; box-shadow: var(--sh-disc); }
.disc .gl { font-size: 9px; font-weight: 500; line-height: 9px; }
.disc .spec { position: absolute; left: 2px; top: 2px; width: 5px; height: 5px; border-radius: 2.5px; background: rgba(255, 255, 255, .8); }
.rcbody { margin-left: 8px; padding-right: 9px; min-width: 0; flex: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.driver { font-family: var(--display); font-size: 10px; font-weight: 700; line-height: 1; letter-spacing: -.1px; color: var(--ink-strong); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.veh { height: 15.5px; display: inline-flex; align-items: center; padding: 0 5px; font-size: 7.5px; font-weight: 600; letter-spacing: .6px; white-space: nowrap; max-width: 100%; overflow: hidden; }
.veh.ok { background: #fff; border: 1px solid rgba(23, 23, 26, .3); color: var(--ink-plate); border-radius: 3.5px; }
.veh.none { background: rgba(255, 255, 255, .6); border: 1px dashed var(--orange); color: var(--orange); }
.veh.sub { background: #fff; border: 1px solid var(--amber); color: var(--amber-ink); }
.drop { margin: 0 10px 0 12px; height: 32px; flex: 1; display: flex; align-items: center; justify-content: flex-end; border: 1px dashed rgba(70, 78, 12, .45); padding: 0 8px; }
.assign { height: 19px; background: var(--ink-strong); color: #fff; border: 0; padding: 0 12px; font-size: 9px; font-weight: 600; }

.sechead { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 16px; }
.sechead h2 { font-family: var(--display); font-size: 20px; font-weight: 700; line-height: 32px; }
footer.pg { margin-top: 24px; border-top: 1px solid var(--line); padding-top: 16px; text-align: right; font-size: 10px; line-height: 15px; color: var(--ink-foot); }

.railcol { width: 100%; display: flex; flex-direction: column; gap: 24px; min-width: 0; }
@media (min-width: 1280px) { .railcol { width: 404px; flex: none; } }
.rhead { letter-spacing: 2px; }
.rhead b { font-size: 10px; font-weight: 600; color: var(--ink-strong); }
.rhead span { font-size: 8px; letter-spacing: .8px; color: var(--ink-faint); }
.notes { border: 1px solid var(--line-panel); background: #fff; padding: 1px; }
.noteshd { height: 35px; display: flex; align-items: center; justify-content: space-between; gap: 8px; background: #fafaf4; border-bottom: 1px solid var(--line-rail); padding: 4px 8px 5px; }
.dot { width: 8px; height: 8px; border-radius: 999px; background: #f43f5e; }
.noteslbl { font-size: 11px; font-weight: 700; letter-spacing: .55px; color: var(--ink-card); }
.mini { font-size: 10px; font-weight: 700; line-height: 16px; border: 1px solid var(--line-rail); background: #fff; color: #44403c; padding: 5px 9px; }
.mini.solid { background: #2d4f46; color: #fff; border-color: #2d4f46; padding: 4px 10px; }
.noteslist { display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; padding: 8px 4px 8px 8px; }
.note { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; padding: 11px; border: 1px solid; }
.note.urgent { background: rgba(255, 241, 242, .7); border-color: #fecdd3; }
.note.critical { background: rgba(255, 251, 235, .7); border-color: #fde68a; }
.sev { flex: none; margin-top: 2px; padding: 3px 7px; font-size: 9px; font-weight: 700; text-transform: uppercase; border: 1px solid; }
.sev.urgent { background: #ffe4e6; border-color: #fda4af; color: #9f1239; }
.sev.critical { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
.notebody { font-size: 11px; line-height: 15.13px; color: var(--ink-card); margin: 0; }
.notemeta { font-size: 9px; line-height: 16px; color: var(--ink-help); }

.mgrid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.mday { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.mday > b { font-size: 8.5px; font-weight: 600; color: var(--ink-strong); }
.mcard { box-shadow: var(--sh-card); position: relative; }
.mband { height: 22px; display: grid; place-items: center; background: var(--ink-strong); color: rgba(255, 255, 255, .94); font-size: 11px; font-weight: 600; letter-spacing: .675px; }
.mcard.muted .mband { background: rgba(23, 23, 26, .45); }
.mname { height: 24px; display: grid; place-items: center; background-image: var(--card); font-family: var(--display); font-size: 10px; font-weight: 700; letter-spacing: -.105px; color: var(--ink-strong); }
.tip { position: absolute; left: calc(100% + 6px); top: 50%; transform: translateY(-50%); z-index: 5; background: #181818; color: #f5f5f5; font-size: 9px; padding: 4px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .12s ease; }
.mcard.hastip:hover .tip, .mcard.hastip:focus-within .tip { opacity: 1; }

.offgrid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.offday { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.offday > b { font-size: 8.5px; font-weight: 600; color: var(--ink-strong); }
.hatch { height: 22px; display: flex; align-items: center; gap: 4px; padding: 0 3px; border: 1px dashed rgba(23, 23, 26, .12); background-image: repeating-linear-gradient(56deg, rgba(23, 23, 26, .035) 0 2px, transparent 2px 6px); }
.hatch .k { font-size: 6px; letter-spacing: .6px; }
.hatch .p { font-family: var(--display); font-size: 9px; color: #6b6b63; overflow: hidden; text-overflow: ellipsis; }
.more { font-size: 6.5px; letter-spacing: .52px; color: var(--ink-faint); }

.exc { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.excard { background: #fff; padding: 12px; display: flex; flex-direction: column; gap: 6px; box-shadow: var(--sh-card); }
.exhd { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.daychip { background: var(--lime-sel); padding: 4px; font-size: 9px; font-weight: 600; color: var(--ink-strong); }
.exkind { font-size: 7px; letter-spacing: .98px; color: var(--ink-faint); }
.excount { font-size: 14px; font-weight: 600; }
.exrow { display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 4px 5px; border-bottom: 1px solid var(--line-row); }
.exlbl { font-size: 6.5px; letter-spacing: .52px; color: var(--ink-faint); }
.plate-chip { border: 1px solid rgba(0, 0, 0, .3); padding: 4px; font-size: 7.5px; font-weight: 600; letter-spacing: .6px; color: var(--ink-plate); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.use { background: #000; color: #fff; border: 0; padding: 4px 8px; font-family: var(--display); font-size: 8.5px; font-weight: 700; }
.unall { display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 7px 6px; background: rgba(228, 240, 99, .28); border: 1px dashed rgba(70, 78, 12, .4); }
.place { background: var(--ink-strong); color: #fff; border: 0; border-radius: 999px; padding: 4px 12px; font-family: var(--display); font-size: 8.5px; font-weight: 700; }
.exname { font-family: var(--display); font-size: 10.5px; font-weight: 700; color: var(--ink-strong); }
.foot { font-size: 6.5px; line-height: 11px; letter-spacing: .325px; color: var(--ink-faint); margin: 0; }

.hz { display: flex; flex-direction: column; gap: 8px; }
.hzrow { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; background: rgba(255, 255, 255, .9); border: 1px solid transparent; padding: 8px 12px; box-shadow: var(--sh-card); }
.hzrow.active { border-color: var(--lime); }
.hzwk { width: 70px; flex: none; display: flex; flex-direction: column; }
.hzwk b { font-size: 14px; font-weight: 600; color: var(--ink-strong); }
.hzwk span { font-size: 7px; letter-spacing: .28px; color: var(--ink-faint); }
.strip { display: flex; gap: 2px; flex: none; }
.strip i { width: 21px; height: 21px; display: grid; place-items: center; font-style: normal; font-size: 8px; }
.strip i.ok { background: rgba(23, 166, 115, .16); color: var(--green); font-weight: 600; }
.strip i.bad { background: rgba(224, 89, 43, .16); color: var(--orange); font-weight: 600; }
.strip i.we { border: 1px dashed rgba(23, 23, 26, .12); color: var(--ink-faint); }
.hzact { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; min-width: 0; }
.hzbtn { padding: 7px 12px; font-size: 7.5px; font-weight: 600; letter-spacing: .45px; color: var(--ink-strong); border: 1px solid #e3e2dc; background: rgba(255, 255, 255, .9); }
.hzbtn.pri { background: var(--lime-sel); border-color: transparent; }
.hzbtn.pill { border-radius: 999px; }
.hzend { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.depots { display: flex; gap: 1px; }
.depots span { padding: 2px 4px; font-size: 6.5px; font-weight: 600; letter-spacing: .325px; }
.depots .ap { background: rgba(23, 166, 115, .14); color: var(--green); }
.depots .pd { background: rgba(201, 138, 18, .16); color: var(--amber-ink); }
.stat { padding: 5px 8px; font-size: 7px; font-weight: 600; letter-spacing: .7px; }
.stat.sealed { background: rgba(23, 166, 115, .13); color: var(--green); }
.stat.pending { background: rgba(201, 138, 18, .15); color: var(--amber-ink); }
.stat.fix { background: rgba(224, 89, 43, .14); border: 1px solid rgba(224, 89, 43, .3); color: var(--orange); }
.stat.open { background: rgba(23, 23, 26, .06); color: var(--ink-strong); }

.scrim { position: fixed; inset: 0; z-index: 40; background: rgba(15, 23, 42, .25); backdrop-filter: blur(8px) saturate(120%); display: flex; justify-content: center; padding: 24px 16px; overflow-y: auto; }
.dlg { background: var(--surface); width: 100%; max-width: 870px; align-self: flex-start; box-shadow: 0 24px 60px rgba(0, 0, 0, .25); display: flex; flex-direction: column; }
.dlg.narrow { max-width: 454px; }
.dlghd { height: 61px; flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--ghost); border-bottom: 1px solid var(--line-modal); padding: 16px 16px 17px; }
.dlghd h2 { font-family: var(--display); font-size: 24px; font-weight: 700; line-height: 32px; text-transform: uppercase; color: #1a1a1a; }
.xbtn { background: none; border: 0; padding: 0; line-height: 0; color: #1a1a1a; }
.dlgbody { padding: 24px 24px 8px; display: flex; flex-direction: column; gap: 16px; }
.dlgdesc { font-size: 14px; line-height: 20px; color: #4a4a4a; margin: 0; white-space: pre-line; }
.dlgft { display: flex; justify-content: flex-end; gap: 10px; padding: 24px; background: var(--surface); }
.ghost { height: 30px; background: transparent; border: 1px solid var(--line-hard); padding: 0 17px; font-family: var(--display); font-size: 12px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: var(--olive-deep); }
.primary { height: 30px; background: var(--lime-primary); border: 1px solid var(--olive); padding: 0 17px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--olive-deep); }
.two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
@media (max-width: 700px) { .two { grid-template-columns: 1fr; } }
.span2 { grid-column: 1 / -1; }
.fld { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.fld > label, .fld > span { font-size: 10px; font-weight: 700; line-height: 15px; letter-spacing: 1px; text-transform: uppercase; color: var(--ink-soft); }
.ctl { width: 100%; height: 42px; border: 1px solid var(--line-hard); border-radius: 2px; padding: 11px; font-family: var(--mono); font-size: 14px; line-height: 20px; color: #000; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, .05); }
textarea.ctl { height: 78px; resize: none; }
textarea.ctl.tall { height: 100px; }
.ctl[disabled] { background: var(--disabled); color: var(--ink-off); }
.seg { display: flex; gap: 4px; padding: 5px; background: #fff; border: 1px solid var(--line-modal); }
.seg button { flex: 1; height: 36px; border: 0; background: #fff; color: #1a1a1a; font-family: var(--display); font-size: 14px; font-weight: 600; }
.seg button[aria-pressed="true"] { background: #1a1a1a; color: #fff; }
.chkrow { display: flex; align-items: center; gap: 11px; background: #fff; padding: 12px; cursor: pointer; }
.box { width: 18px; height: 18px; flex: none; display: grid; place-items: center; border: 1px solid var(--ink-soft); background: #fff; }
.box[data-on="1"] { background: #1a1c16; border-color: #1a1c16; }
.box[data-on="1"]::after { content: ""; width: 10px; height: 5px; border: 2px solid #fff; border-top: 0; border-right: 0; transform: translateY(-1px) rotate(-45deg); }
.chkrow span { font-size: 14px; font-weight: 500; line-height: 24px; color: var(--ink-card); }
.depotrow { display: flex; flex-wrap: wrap; gap: 12px; }
.depotchip { flex: 1; min-width: 120px; display: flex; align-items: center; gap: 7px; height: 36px; background: #f3f4f6; padding: 0 7px; cursor: pointer; }
.depotchip span { font-size: 14px; font-weight: 500; color: #000; }
.rad { width: 16px; height: 16px; flex: none; border-radius: 50%; border: 1px solid var(--ink-soft); background: #fff; display: grid; place-items: center; }
.rad[data-on="1"] { width: 18px; height: 18px; background: #1a1c16; border-color: #1a1c16; }
.rad[data-on="1"]::after { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #fff; }
.rad.we { border-color: var(--weekend-accent); }
.fullwk { display: flex; align-items: center; gap: 12px; background: #fff; padding: 12px; cursor: pointer; }
.fullwk span { font-size: 13px; font-weight: 500; line-height: 24px; color: var(--ink-card); }
.orsel { font-size: 14px; line-height: 20px; color: var(--ink-help); margin: 4px 0 0; }
.daycards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
@media (max-width: 760px) { .daycards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.daycard { height: 88px; display: flex; flex-direction: column; justify-content: space-between; background: #fff; padding: 12px; cursor: pointer; }
.daycard.on { background: rgba(163, 230, 53, .1); }
.daycard.we { background: var(--weekend-bg); }
.dctop { display: flex; align-items: flex-start; gap: 8px; }
.dcname { font-size: 14px; font-weight: 700; line-height: 16px; color: var(--ink-card); }
.dcdate { font-size: 14px; line-height: 20px; color: var(--ink-card); }
.daycard.we .dcname, .daycard.we .dcdate { color: var(--weekend-ink); }
.dccount { align-self: flex-end; font-size: 12px; line-height: 16px; color: var(--ink-help); }
.daycard.we .dccount { color: var(--weekend-accent); }
.callout { border-left: 4px solid #1a1a1a; padding: 4px 0 4px 16px; display: flex; flex-direction: column; gap: 4px; }
.callout p { margin: 0; font-size: 14px; line-height: 20px; color: #374151; }
.result { text-align: center; font-size: 14px; line-height: 28px; color: #111827; margin: 0; }
.count { display: inline-flex; align-items: center; justify-content: center; min-width: 42px; height: 25px; margin: 0 4px; background: #fff; border: 1px solid #1f2937; border-radius: 2px; font-size: 14px; font-weight: 600; }
.breakdown { display: flex; flex-direction: column; font-size: 14px; line-height: 20px; color: #4a4a4a; }

.pickwrap { position: relative; }
.picker { position: absolute; top: calc(100% + 8px); left: 0; z-index: 30; width: 276px; background: #fff; box-shadow: var(--sh-pop); }
.pkhd { height: 69px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid var(--line-rail); padding: 14px 10px; }
.pkmonth { font-size: 12px; font-weight: 700; line-height: 16px; letter-spacing: .3px; color: #1a1a18; }
.gotonow { border: 1px solid #a3a3a3; background: #fff; padding: 5px 9px; font-size: 11px; font-weight: 600; line-height: 16.5px; color: #1a1a18; }
.pklist { max-height: 254px; overflow-y: auto; border-top: 1px solid #e5e4d8; }
.pkrow { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 8px; background: none; border: 0; border-top: 1px solid #f1efe6; padding: 11px 10px 10px; text-align: left; }
.pkrow .l { display: flex; align-items: center; gap: 12px; }
.pkrow b { font-size: 12px; font-weight: 700; line-height: 16px; }
.pkrow em { font-style: normal; font-size: 11px; line-height: 16px; }
.pkrow.cur { background: rgba(233, 249, 177, .6); border-top: 0; padding: 12px 10px; }
.curbadge { background: #000; color: var(--lime-primary); padding: 2px 6px; font-size: 9px; font-weight: 700; letter-spacing: .45px; text-transform: uppercase; line-height: 16px; }
.pkrow.past b { color: #737373; } .pkrow.past em { color: #525252; }
.pkrow.next b { color: #262626; } .pkrow.next em { color: #525252; }
.pkrow.draft b { color: #a3a3a3; } .pkrow.draft em { color: #737373; }
.pkrow.future { opacity: .75; } .pkrow.future b, .pkrow.future em { color: #a3a3a3; }

.toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 60; background: var(--ink-strong); color: #fff; padding: 10px 16px; font-size: 11px; letter-spacing: .4px; box-shadow: 0 8px 24px rgba(0, 0, 0, .25); }
.toast[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) { .week-planner-page * { transition: none !important; animation: none !important; } }
```

- [ ] **Step 2: Commit**

```bash
git add "app/(private)/week-planner/styles.css"
git commit -m "feat: port week-planner design tokens and component stylesheet"
```

---

### Task 8: `StatusDisc` and `RouteCard`

**Files:**
- Create: `app/(private)/week-planner/components/StatusDisc.tsx`
- Create: `app/(private)/week-planner/components/RouteCard.tsx`

**Interfaces:**
- Consumes: `RouteCardModel`, `RouteStatus` from `types.ts` (Task 3).
- Produces: `StatusDisc` (default export, `{ status: RouteStatus }`) and `RouteCard` (default export, `{ route: RouteCardModel; onOpen: (route: RouteCardModel) => void }`) — consumed by `DayGrid` (Task 9).

- [ ] **Step 1: Write `app/(private)/week-planner/components/StatusDisc.tsx`**

```tsx
import type { RouteStatus } from "../types";

const DISC_STYLE: Record<RouteStatus, { bg: string; ring?: string }> = {
  ok: { bg: "radial-gradient(circle at 30% 30%, rgb(129,138,82) 0%, rgb(109,119,54) 37%, rgb(89,101,27) 74%)" },
  warning: { bg: "radial-gradient(circle at 30% 30%, rgb(129,138,82) 0%, rgb(109,119,54) 37%, rgb(89,101,27) 74%)" },
  error: { bg: "var(--red)" },
  conflict: { bg: "var(--notch)", ring: "var(--olive-code)" },
  open: { bg: "radial-gradient(circle at 30% 30%, rgb(241,248,144) 0%, rgb(229,240,108) 37%, rgb(217,232,72) 74%)", ring: "rgba(90,100,16,.35)" },
};

function Glyph({ status }: { status: RouteStatus }) {
  if (status === "ok") {
    return (
      <svg width="11" height="11" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 10.5l4.2 4.2L17 5" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "warning") {
    return (
      <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 2L19 18H1z" fill="var(--orange)" />
        <path d="M10 7.5v5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="10" cy="15" r=".9" fill="#fff" />
      </svg>
    );
  }
  if (status === "error" || status === "conflict") {
    return <span className="gl" style={{ color: status === "error" ? "#fff" : "var(--olive-code)" }}>!</span>;
  }
  return <span className="gl" style={{ color: "var(--ink-strong)" }}>+</span>;
}

export default function StatusDisc({ status }: { status: RouteStatus }) {
  const style = DISC_STYLE[status];
  const boxShadow = style.ring ? `0 0 0 1px ${style.ring}, var(--sh-disc)` : "var(--sh-disc)";
  return (
    <span className="disc" style={{ background: style.bg, boxShadow }}>
      <Glyph status={status} />
      {(status === "ok" || status === "warning") && <span className="spec" />}
    </span>
  );
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/components/RouteCard.tsx`**

```tsx
import type { RouteCardModel } from "../types";
import StatusDisc from "./StatusDisc";

function VehicleBadge({ route }: { route: RouteCardModel }) {
  if (route.vehicleBadge === "ok") return <span className="veh ok">{route.vehiclePlate}</span>;
  if (route.vehicleBadge === "sub") return <span className="veh sub">{route.vehiclePlate}</span>;
  if (route.vehicleBadge === "none") return <span className="veh none">NO VEHICLE</span>;
  return null;
}

export default function RouteCard({ route, onOpen }: { route: RouteCardModel; onOpen: (route: RouteCardModel) => void }) {
  const isOpen = route.status === "open";
  return (
    <button
      type="button"
      className={`rc${isOpen ? " open" : ""}`}
      onClick={() => onOpen(route)}
      aria-label={`Rota ${route.code}${route.driverName ? ` — ${route.driverName}` : " — sem alocação"}`}
    >
      <span className="plate">
        {route.isFlex && <span className="flexlbl">FLEX</span>}
        <span className="code">{route.code}</span>
      </span>
      <span className="notchel" aria-hidden="true" />
      <StatusDisc status={route.status} />
      {isOpen ? (
        <span className="drop">
          <span className="assign" role="presentation">Assign</span>
        </span>
      ) : (
        <span className="rcbody">
          <span className="driver">{route.driverName}</span>
          <VehicleBadge route={route} />
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/week-planner/components/StatusDisc.tsx" "app/(private)/week-planner/components/RouteCard.tsx"
git commit -m "feat: add StatusDisc and RouteCard components"
```

---

### Task 9: `DayGrid` and `AdhocSection`

**Files:**
- Create: `app/(private)/week-planner/components/DayGrid.tsx`
- Create: `app/(private)/week-planner/components/AdhocSection.tsx`

**Interfaces:**
- Consumes: `DayColumnModel`, `RouteCardModel` from `types.ts`; `RouteCard` from Task 8.
- Produces: `DayGrid` (default export, `{ days: DayColumnModel[]; variant: "main" | "adhoc"; selectedDate: string | null; onSelectDay: (date: string | null) => void; onAddInDay: (date: string) => void; onOpenRoute: (route: RouteCardModel) => void }`) and `AdhocSection` (default export, `{ days: DayColumnModel[]; onAddAdhoc: () => void; onOpenRoute: (route: RouteCardModel) => void }`) — both consumed by `page.tsx` (Task 17).

- [ ] **Step 1: Write `app/(private)/week-planner/components/DayGrid.tsx`**

```tsx
import type { DayColumnModel, RouteCardModel } from "../types";
import RouteCard from "./RouteCard";

function badgeFor(day: DayColumnModel, selected: boolean): [string, string] | null {
  if (selected) return ["sel", "SELECTED"];
  if (day.reviewBadge === "reviewed") return ["rev", "✓ REV"];
  if (day.reviewBadge === "re-review") return ["rerev", "RE-REV"];
  return null;
}

interface DayGridProps {
  days: DayColumnModel[];
  variant: "main" | "adhoc";
  selectedDate: string | null;
  onSelectDay: (date: string | null) => void;
  onAddInDay: (date: string) => void;
  onOpenRoute: (route: RouteCardModel) => void;
}

export default function DayGrid({ days, variant, selectedDate, onSelectDay, onAddInDay, onOpenRoute }: DayGridProps) {
  return (
    <div className="gridscroll">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((day) => {
          const selected = variant === "main" && day.date === selectedDate;
          const badge = badgeFor(day, selected);
          const routes = variant === "main" ? day.mainRoutes : day.adhocRoutes;

          return (
            <div key={day.date} className={`day${selected ? " sel" : ""}`}>
              <div className="dayhead">
                <button
                  type="button"
                  className="daybtn"
                  onClick={() => onSelectDay(selectedDate === day.date ? null : day.date)}
                >
                  <span className="dayname">{day.name}</span>
                  <span className="daynum">{day.dayNumber}</span>
                  {badge && <span className={`daybadge ${badge[0]}`}>{badge[1]}</span>}
                </button>
                <button
                  type="button"
                  className="dayadd"
                  aria-label={`Adicionar em ${day.name}`}
                  onClick={() => onAddInDay(day.date)}
                >
                  +
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {routes.map((route) => (
                  <RouteCard key={route.id} route={route} onOpen={onOpenRoute} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/components/AdhocSection.tsx`**

```tsx
import type { DayColumnModel, RouteCardModel } from "../types";
import DayGrid from "./DayGrid";

interface AdhocSectionProps {
  days: DayColumnModel[];
  onAddAdhoc: () => void;
  onOpenRoute: (route: RouteCardModel) => void;
}

export default function AdhocSection({ days, onAddAdhoc, onOpenRoute }: AdhocSectionProps) {
  return (
    <>
      <div className="sechead">
        <h2 className="disp">ADHOC</h2>
        <button type="button" className="addbtn" onClick={onAddAdhoc}>
          <span className="plus">+</span>
          <span className="lbl">ADD ADHOC</span>
        </button>
      </div>
      <DayGrid
        days={days}
        variant="adhoc"
        selectedDate={null}
        onSelectDay={() => undefined}
        onAddInDay={onAddAdhoc}
        onOpenRoute={onOpenRoute}
      />
    </>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/week-planner/components/DayGrid.tsx" "app/(private)/week-planner/components/AdhocSection.tsx"
git commit -m "feat: add DayGrid and AdhocSection components"
```

---

### Task 10: `DepotTabs` and `TeamLeaderTrack`

**Files:**
- Create: `app/(private)/week-planner/components/DepotTabs.tsx`
- Create: `app/(private)/week-planner/components/TeamLeaderTrack.tsx`

**Interfaces:**
- Consumes: `DEPOTS`, `LEADERS` from `constants.ts` (Task 3); `useToast` from Task 6.
- Produces: `DepotTabs` (default export, `{ selected: string; onSelect: (depot: string) => void }`) and `TeamLeaderTrack` (default export, `{ selectedIndex: number; onSelect: (index: number) => void }`) — consumed by `page.tsx` (Task 17).

- [ ] **Step 1: Write `app/(private)/week-planner/components/DepotTabs.tsx`**

```tsx
"use client";

import { DEPOTS } from "../constants";
import { useToast } from "./Toast";

export default function DepotTabs({ selected, onSelect }: { selected: string; onSelect: (depot: string) => void }) {
  const { showToast } = useToast();

  return (
    <div className="tabs">
      {DEPOTS.map((depot) => (
        <button
          key={depot}
          type="button"
          className="tab"
          aria-pressed={depot === selected}
          onClick={() => {
            onSelect(depot);
            showToast(`Depósito ${depot} selecionado.`);
          }}
        >
          {depot}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/components/TeamLeaderTrack.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { LEADERS } from "../constants";

export default function TeamLeaderTrack({ selectedIndex, onSelect }: { selectedIndex: number; onSelect: (index: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className="tltrack">
      <span className="cat">Team Leader</span>
      <div className="tlscroll" ref={trackRef}>
        {LEADERS.map((name, index) => (
          <button
            key={name}
            type="button"
            className="tlchip"
            aria-pressed={index === selectedIndex}
            onClick={() => onSelect(index)}
          >
            {name}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="chip-nav"
        aria-label="Próximos team leaders"
        onClick={() => trackRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M3.5 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/week-planner/components/DepotTabs.tsx" "app/(private)/week-planner/components/TeamLeaderTrack.tsx"
git commit -m "feat: add DepotTabs and TeamLeaderTrack components"
```

---

### Task 11: `WeekPickerButton` and `WeekPickerPopover`

**Files:**
- Create: `app/(private)/week-planner/components/WeekPickerButton.tsx`
- Create: `app/(private)/week-planner/components/WeekPickerPopover.tsx`

**Interfaces:**
- Consumes: `WeekOption`, `WeekState` from `types.ts`; `WEEK_OPTIONS`, `MONTH_LABELS`, `DEFAULT_WEEK_ID` from `constants.ts`; `useToast` from Task 6.
- Produces: `WeekPickerButton` (default export, `{ week: WeekOption; onPick: (week: WeekOption) => void }` — composes the trigger button and the popover internally, owns its own open/close and month-index state) — consumed by `page.tsx` (Task 17).

- [ ] **Step 1: Write `app/(private)/week-planner/components/WeekPickerPopover.tsx`**

```tsx
"use client";

import { MONTH_LABELS, WEEK_OPTIONS } from "../constants";
import type { WeekOption } from "../types";

interface WeekPickerPopoverProps {
  monthIndex: number;
  onMonthChange: (index: number) => void;
  onPick: (week: WeekOption) => void;
  onGoToCurrent: () => void;
}

export default function WeekPickerPopover({ monthIndex, onMonthChange, onPick, onGoToCurrent }: WeekPickerPopoverProps) {
  return (
    <div className="picker">
      <div className="pkhd">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="chip-nav"
            aria-label="Mês anterior"
            onClick={(e) => {
              e.stopPropagation();
              onMonthChange(Math.max(0, monthIndex - 1));
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M6.5 1L2.5 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <span className="pkmonth">{MONTH_LABELS[monthIndex]}</span>
          <button
            type="button"
            className="chip-nav"
            aria-label="Próximo mês"
            onClick={(e) => {
              e.stopPropagation();
              onMonthChange(Math.min(MONTH_LABELS.length - 1, monthIndex + 1));
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M3.5 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <button type="button" className="gotonow" onClick={onGoToCurrent}>
          [GO TO CURRENT WEEK]
        </button>
      </div>
      <div className="pklist">
        {WEEK_OPTIONS.map((week) => {
          const isCurrent = week.state === "current";
          return (
            <button
              key={week.id}
              type="button"
              className={`pkrow ${isCurrent ? "cur" : week.state}`}
              onClick={() => onPick(week)}
            >
              <span className="l">
                <b>{week.label}</b>
                <em>{week.range}</em>
              </span>
              {isCurrent && <span className="curbadge">CURRENT WEEK</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/components/WeekPickerButton.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_WEEK_ID, WEEK_OPTIONS } from "../constants";
import type { WeekOption } from "../types";
import { useToast } from "./Toast";
import WeekPickerPopover from "./WeekPickerPopover";

export default function WeekPickerButton({ week, onPick }: { week: WeekOption; onPick: (week: WeekOption) => void }) {
  const [open, setOpen] = useState(false);
  const [monthIndex, setMonthIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function pick(nextWeek: WeekOption) {
    onPick(nextWeek);
    setOpen(false);
    showToast(`Semana ${nextWeek.label} carregada.`);
  }

  const currentWeek = WEEK_OPTIONS.find((w) => w.id === DEFAULT_WEEK_ID)!;

  return (
    <div className="pickwrap" ref={wrapRef}>
      <button type="button" className="weekbtn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="wk disp">{week.label}</span>
        <span className="rg">{week.range.toUpperCase()} 2024</span>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open && (
        <WeekPickerPopover
          monthIndex={monthIndex}
          onMonthChange={setMonthIndex}
          onPick={pick}
          onGoToCurrent={() => pick(currentWeek)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/week-planner/components/WeekPickerButton.tsx" "app/(private)/week-planner/components/WeekPickerPopover.tsx"
git commit -m "feat: add week picker trigger and popover"
```

---

### Task 12: Rail — `NotesPanel`

**Files:**
- Create: `app/(private)/week-planner/components/rail/NotesPanel.tsx`

**Interfaces:**
- Consumes: `NoteModel` from `types.ts`.
- Produces: `NotesPanel` (default export, `{ notes: NoteModel[]; onAddNote: () => void; onAcknowledge: (noteId: string) => void }`) — consumed by `page.tsx` (Task 17).

- [ ] **Step 1: Write `app/(private)/week-planner/components/rail/NotesPanel.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { NoteModel } from "../../types";

interface NotesPanelProps {
  notes: NoteModel[];
  onAddNote: () => void;
  onAcknowledge: (noteId: string) => void;
}

export default function NotesPanel({ notes, onAddNote, onAcknowledge }: NotesPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="notes">
      <div className="noteshd">
        <span style={{ display: "flex", alignItems: "center", gap: 6, borderRight: "1px solid var(--line-rail)", paddingRight: 9 }}>
          <span className="dot" />
          <span className="noteslbl">NOTES</span>
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          <button type="button" className="mini solid" onClick={onAddNote}>+ NOVA NOTA</button>
          <button type="button" className="mini" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "RECOLHER" : "EXPANDIR"}
          </button>
        </span>
      </div>
      {expanded && (
        <div className="noteslist">
          {notes.map((note) => (
            <article key={note.id} className={`note ${note.severity.toLowerCase()}`}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                <span className={`sev ${note.severity.toLowerCase()}`}>{note.severity}</span>
                <div style={{ minWidth: 0 }}>
                  <p className="notebody">{note.body}</p>
                  <span className="notemeta">{note.body.length} CHARS</span>
                </div>
              </div>
              <button type="button" className="mini" onClick={() => onAcknowledge(note.id)}>
                {note.acknowledged ? "SALVO" : "EDITAR"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add "app/(private)/week-planner/components/rail/NotesPanel.tsx"
git commit -m "feat: add NotesPanel rail component"
```

---

### Task 13: Rail — `ManagementSupportPanel` and `OffHolidayPanel`

**Files:**
- Create: `app/(private)/week-planner/components/rail/ManagementSupportPanel.tsx`
- Create: `app/(private)/week-planner/components/rail/OffHolidayPanel.tsx`

**Interfaces:**
- Consumes: `ManagementDayModel`, `AbsenceDayModel` from `types.ts`.
- Produces: `ManagementSupportPanel` (default export, `{ days: ManagementDayModel[] }`) and `OffHolidayPanel` (default export, `{ days: AbsenceDayModel[] }`) — consumed by `page.tsx` (Task 17).

- [ ] **Step 1: Write `app/(private)/week-planner/components/rail/ManagementSupportPanel.tsx`**

```tsx
import type { ManagementDayModel } from "../../types";

export default function ManagementSupportPanel({ days }: { days: ManagementDayModel[] }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 className="rhead"><b>MANAGEMENT &amp; SUPPORT</b> <span>DEEP MATERIAL · RUNS THE DAY</span></h3>
      <div className="mgrid">
        {days.map((day) => (
          <div key={day.dayLabel} className="mday">
            <b>{day.dayLabel}</b>
            {day.cells.map((cell, index) => (
              <div key={`${day.dayLabel}-${index}`} className={`mcard${cell.isMuted ? " muted" : ""}${cell.tooltip ? " hastip" : ""}`} tabIndex={cell.tooltip ? 0 : -1}>
                <div className="mband">TL·SORT</div>
                <div className="mname">{cell.managerName}</div>
                {cell.tooltip && <span className="tip">{cell.tooltip}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/components/rail/OffHolidayPanel.tsx`**

```tsx
import type { AbsenceDayModel } from "../../types";

export default function OffHolidayPanel({ days }: { days: AbsenceDayModel[] }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 className="rhead"><b>OFF · HOLIDAY</b> <span>ABSENCE IS INFORMATION — HATCH SURRENDERS THE DEPOT HUE</span></h3>
      <div className="offgrid">
        {days.map((day) => (
          <div key={day.dayLabel} className="offday">
            <b>{day.dayLabel}</b>
            {day.chips.length === 0 && <span className="disp" style={{ fontSize: 9, color: "#6b6b63" }}>NO ONE OFF</span>}
            {day.chips.map((chip, index) => (
              <span key={`${day.dayLabel}-${index}`} className="hatch">
                <span className="k" style={{ color: chip.kind === "OFF" ? "#a6a69e" : "var(--amber-ink)" }}>{chip.kind}</span>
                <span className="p">{chip.personName}</span>
              </span>
            ))}
            {day.extraCount > 0 && <span className="more">+ {day.extraCount} MORE</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/week-planner/components/rail/ManagementSupportPanel.tsx" "app/(private)/week-planner/components/rail/OffHolidayPanel.tsx"
git commit -m "feat: add ManagementSupportPanel and OffHolidayPanel rail components"
```

---

### Task 14: Rail — `ExceptionsPanel` and `PlanHorizonPanel`

**Files:**
- Create: `app/(private)/week-planner/components/rail/ExceptionsPanel.tsx`
- Create: `app/(private)/week-planner/components/rail/PlanHorizonPanel.tsx`

**Interfaces:**
- Consumes: `ExceptionsModel`, `HorizonWeekModel` from `types.ts`; `useToast` from Task 6.
- Produces: `ExceptionsPanel` (default export, `{ exceptions: ExceptionsModel | null; fallbackLabel: string }`) and `PlanHorizonPanel` (default export, `{ weeks: HorizonWeekModel[] }`) — consumed by `page.tsx` (Task 17).

- [ ] **Step 1: Write `app/(private)/week-planner/components/rail/ExceptionsPanel.tsx`**

```tsx
"use client";

import type { ExceptionsModel } from "../../types";
import { useToast } from "../Toast";

interface ExceptionsPanelProps {
  exceptions: ExceptionsModel | null;
  fallbackLabel: string;
}

export default function ExceptionsPanel({ exceptions, fallbackLabel }: ExceptionsPanelProps) {
  const { showToast } = useToast();
  const dayLabel = exceptions?.dayLabel ?? fallbackLabel;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 className="rhead"><b>EXCEPTIONS</b> <span>FOLLOW THE SELECTED DAY · AUTO-ALLOCATION</span></h3>
      <div className="exc">
        <article className="excard">
          <div className="exhd">
            <span className="daychip">{dayLabel}</span>
            <span className="exkind">VEHICLES</span>
            <span className="excount">{exceptions?.vehicles.items.length ?? 0}</span>
          </div>
          {exceptions && (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{exceptions.vehicles.utilizationLabel}</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: "var(--green)" }}>{exceptions.vehicles.utilizationPercent}%</span>
              </div>
              <span style={{ fontSize: "6.5px", letterSpacing: ".65px", color: "var(--ink-faint)" }}>
                UTILIZATION · {exceptions.vehicles.depotLabel} · {dayLabel.slice(0, 3)}
              </span>
              {exceptions.vehicles.items.map((item, index) => (
                <div key={index} className="exrow">
                  <span className="exlbl" style={{ color: item.tag === "VOR" ? "var(--orange)" : "var(--ink-faint)" }}>{item.tag}</span>
                  <span className="plate-chip">{item.plate}</span>
                  {item.usable ? (
                    <button type="button" className="use" onClick={() => showToast("Veículo alocado ao dia (protótipo).")}>Use</button>
                  ) : (
                    <span style={{ width: 34 }} />
                  )}
                </div>
              ))}
              <p className="foot">UNUSED VANS AUTO-TAG AS SPARE · VOR = OFF ROAD, EXCLUDED FROM FLEET COUNT</p>
            </>
          )}
        </article>

        <article className="excard">
          <div className="exhd">
            <span className="daychip">{dayLabel}</span>
            <span className="exkind">DRIVERS</span>
            <span className="excount">{exceptions?.drivers.items.length ?? 0}</span>
          </div>
          {exceptions?.drivers.unallocated && (
            <div className="unall">
              <span className="exlbl" style={{ color: "var(--olive-alt)", fontWeight: 600 }}>UNALL</span>
              <span className="exname">{exceptions.drivers.unallocated.name}</span>
              <button type="button" className="place" onClick={() => showToast(`${exceptions.drivers.unallocated!.name} alocado (protótipo).`)}>
                Place
              </button>
            </div>
          )}
          {exceptions?.drivers.items.map((item, index) => (
            <div key={index} className="exrow">
              <span className="exlbl" style={{ color: item.tag === "FLEX" ? "var(--flex-blue)" : "var(--ink-faint)" }}>{item.tag}</span>
              <span className="exname">{item.name}</span>
            </div>
          ))}
          <p className="foot">UNPLACED BY THE ENGINE — EVERYONE ELSE IS ALREADY ON THE BOARD</p>
        </article>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/components/rail/PlanHorizonPanel.tsx`**

```tsx
"use client";

import type { HorizonWeekModel } from "../../types";
import { useToast } from "../Toast";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default function PlanHorizonPanel({ weeks }: { weeks: HorizonWeekModel[] }) {
  const { showToast } = useToast();

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 className="rhead"><b>PLAN HORIZON — SIX WEEKS</b> <span>A WEEK SEALS ITSELF WHEN ALL THREE DEPOTS APPROVE</span></h3>
      <div className="hz">
        {weeks.map((week) => (
          <div key={week.weekLabel} className={`hzrow${week.isActive ? " active" : ""}`}>
            <span className="hzwk">
              <b>{week.weekLabel}</b>
              <span>{week.range}</span>
            </span>
            <span className="strip">
              {week.dayStrip.map((mark, index) => (
                <i key={index} className={mark === "ok" ? "ok" : mark === "bad" ? "bad" : "we"}>
                  {DAY_LETTERS[index]}
                </i>
              ))}
            </span>
            <span className="hzact">
              {week.actions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  className={`hzbtn${action.variant === "primary" ? " pri" : action.variant === "pill" ? " pill" : ""}`}
                  onClick={() => showToast(`${action.label.trim()} — ação do protótipo.`)}
                >
                  {action.label}
                </button>
              ))}
            </span>
            <span className="hzend">
              <span className="depots">
                {week.depots.map((depot) => (
                  <span key={depot.code} className={depot.approved ? "ap" : "pd"}>{depot.code}</span>
                ))}
              </span>
              <span style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {week.stats.map((stat, index) => (
                  <span key={index} className={`stat ${stat.tone}`}>{stat.label}</span>
                ))}
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className="foot">
        ALL DEPOTS SAFE THROUGH SUN 19 JUL (LSE PENDING APPROVAL) · LCY ALONE REACHES W30 · GENERATE W30 FOR MSE + LSE BY FRI 17
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/week-planner/components/rail/ExceptionsPanel.tsx" "app/(private)/week-planner/components/rail/PlanHorizonPanel.tsx"
git commit -m "feat: add ExceptionsPanel and PlanHorizonPanel rail components"
```

---

### Task 15: Modal shell, form field primitives

**Files:**
- Create: `app/(private)/week-planner/components/modals/fields.tsx`
- Create: `app/(private)/week-planner/components/modals/PlannerModal.tsx`

**Interfaces:**
- Produces: field components `SelectField`, `TextField`, `DateField`, `ReadonlyField`, `TextareaField`, `SegmentedField`, `DaySelectorField`, `DepotPickerField` (all default-exported by name from `fields.tsx`) and `PlannerModal` (default export, `{ title: string; description?: string; narrow?: boolean; primaryLabel: string; onCancel: () => void; onSubmit: () => void; children: ReactNode }`) — consumed by `modalConfigs.tsx` (Task 16).

- [ ] **Step 1: Write `app/(private)/week-planner/components/modals/fields.tsx`**

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { DEPOTS } from "../../constants";

export function SelectField({ label, placeholder, options }: { label: string; placeholder: string; options: readonly string[] }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <select className="ctl" defaultValue="">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function TextField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input className="ctl" placeholder={placeholder} />
    </label>
  );
}

export function DateField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input className="ctl" type="date" defaultValue={defaultValue} />
    </label>
  );
}

export function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input className="ctl" value={value} disabled readOnly />
    </label>
  );
}

export function TextareaField({ label, placeholder, tall }: { label: string; placeholder: string; tall?: boolean }) {
  return (
    <label className="fld span2">
      <span>{label}</span>
      <textarea className={`ctl${tall ? " tall" : ""}`} placeholder={placeholder} />
    </label>
  );
}

export function SegmentedField({ options, onChange }: { options: [string, string]; onChange?: (index: 0 | 1) => void }) {
  const [active, setActive] = useState<0 | 1>(0);
  return (
    <div className="fld">
      <span>Day off mode</span>
      <div className="seg">
        {options.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={active === index}
            onClick={() => {
              setActive(index as 0 | 1);
              onChange?.(index as 0 | 1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DayCardDef {
  code: string;
  label: string;
  date: string;
  count: number;
  weekend: boolean;
}

export function DaySelectorField({ fullWeekLabel, days }: { fullWeekLabel: string; days: DayCardDef[] }) {
  const [selected, setSelected] = useState<string>("full");

  return (
    <div className="fld span2">
      <span>SELECT DAYS</span>
      <div className="fullwk" onClick={() => setSelected("full")}>
        <span className="rad" data-on={selected === "full" ? "1" : "0"} />
        <span>{fullWeekLabel}</span>
      </div>
      <p className="orsel">Or select specific days:</p>
      <div className="daycards">
        {days.map((day) => (
          <div
            key={day.code}
            className={`daycard${selected === day.code ? " on" : ""}${day.weekend ? " we" : ""}`}
            onClick={() => setSelected(day.code)}
          >
            <div className="dctop">
              <span className={`rad${day.weekend ? " we" : ""}`} data-on={selected === day.code ? "1" : "0"} />
              <span>
                <span className="dcname">{day.label}</span>
                <br />
                <span className="dcdate">{day.date}</span>
              </span>
            </div>
            <span className="dccount">{day.count} assignments</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DepotPickerField() {
  const [selected, setSelected] = useState<Set<string>>(new Set(DEPOTS));

  function toggle(depot: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(depot)) next.delete(depot);
      else next.add(depot);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === DEPOTS.length ? new Set() : new Set(DEPOTS)));
  }

  return (
    <div className="fld span2">
      <span>DEPOTS</span>
      <div className="chkrow" onClick={toggleAll}>
        <span className="box" data-on={selected.size === DEPOTS.length ? "1" : "0"} />
        <span>All depots ({DEPOTS.length})</span>
      </div>
      <div className="depotrow">
        {DEPOTS.map((depot) => (
          <div key={depot} className="depotchip" onClick={() => toggle(depot)}>
            <span className="box" data-on={selected.has(depot) ? "1" : "0"} />
            <span>{depot}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="two">{children}</div>;
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/components/modals/PlannerModal.tsx`**

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface PlannerModalProps {
  title: string;
  description?: string;
  narrow?: boolean;
  primaryLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export default function PlannerModal({ title, description, narrow, primaryLabel, onCancel, onSubmit, children }: PlannerModalProps) {
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel]);

  return (
    <div
      className="scrim"
      ref={scrimRef}
      onMouseDown={(event) => {
        if (event.target === scrimRef.current) onCancel();
      }}
    >
      <div className={`dlg${narrow ? " narrow" : ""}`} role="dialog" aria-modal="true" aria-label={title.toUpperCase()}>
        <div className="dlghd">
          <h2>{title}</h2>
          <button type="button" className="xbtn" aria-label="Fechar" onClick={onCancel}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        <div className="dlgbody">
          {description && <p className="dlgdesc">{description}</p>}
          {children}
        </div>
        <div className="dlgft">
          <button type="button" className="ghost" onClick={onCancel}>CANCEL</button>
          <button type="button" className="primary" onClick={onSubmit}>{primaryLabel}</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/week-planner/components/modals/fields.tsx" "app/(private)/week-planner/components/modals/PlannerModal.tsx"
git commit -m "feat: add modal shell and form field primitives"
```

---

### Task 16: The 9 modal configs

**Files:**
- Create: `app/(private)/week-planner/components/modals/modalConfigs.tsx`

**Interfaces:**
- Consumes: `PlannerModal`, field components from Task 15; `OPTIONS` from `constants.ts`; `useWeekPlannerActions` from Task 6.
- Produces: `ModalKind` type (union of the 9 modal ids + `null`) and `PlannerModalHost` (default export, `{ openModal: ModalKind; contextRoute: string; contextDate: string; onClose: () => void }`) — the single component `page.tsx` (Task 17) renders for all modal traffic.

- [ ] **Step 1: Write `app/(private)/week-planner/components/modals/modalConfigs.tsx`**

```tsx
"use client";

import { useState } from "react";
import { OPTIONS } from "../../constants";
import { useWeekPlannerActions } from "../../hooks/useWeekPlannerActions";
import { useToast } from "../Toast";
import {
  DaySelectorField,
  DateField,
  DepotPickerField,
  FieldRow,
  ReadonlyField,
  SegmentedField,
  SelectField,
  TextField,
  TextareaField,
} from "./fields";
import PlannerModal from "./PlannerModal";

export type ModalKind =
  | "registerDayOff"
  | "addAssignment"
  | "editAssignment"
  | "exportDay"
  | "exportWeek"
  | "addNote"
  | "managementSupport"
  | "addAdhoc"
  | "addTeamLeader"
  | "generateWeekResult"
  | null;

const FULL_WEEK_DAYS = [
  { code: "mon", label: "Mon", date: "13/07", count: 50, weekend: false },
  { code: "tue", label: "Tue", date: "14/07", count: 56, weekend: false },
  { code: "wed", label: "Wed", date: "15/07", count: 56, weekend: false },
  { code: "thu", label: "Thu", date: "16/07", count: 56, weekend: false },
  { code: "fri", label: "Fri", date: "17/07", count: 56, weekend: false },
  { code: "sat", label: "Sat", date: "18/07", count: 3, weekend: true },
  { code: "sun", label: "Sun", date: "19/07", count: 0, weekend: true },
];
const FULL_WEEK_LABEL = "Full Week (13/07 to 19/07)";

interface PlannerModalHostProps {
  openModal: ModalKind;
  contextRoute: string;
  contextDate: string;
  onClose: () => void;
}

export default function PlannerModalHost({ openModal, contextRoute, contextDate, onClose }: PlannerModalHostProps) {
  const { runAction, runGenerateWeek } = useWeekPlannerActions();
  const { showToast } = useToast();
  const [generated, setGenerated] = useState<Awaited<ReturnType<typeof runGenerateWeek>> | null>(null);

  if (!openModal) return null;

  async function submit(title: string) {
    await runAction(title);
    onClose();
  }

  if (openModal === "generateWeekResult") {
    if (!generated) {
      runGenerateWeek().then(setGenerated);
      return null;
    }
    return (
      <PlannerModal title="Default Schedule Created" narrow primaryLabel="SAVE" onCancel={onClose} onSubmit={() => { setGenerated(null); onClose(); }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p className="result">
            Successfully created <span className="count">{generated.totalCreated}</span> default schedule assignments.
          </p>
          <div className="breakdown">
            <span>Management &amp; Support created first: {generated.managementCreated}.</span>
            <span>Primary assignments: {generated.primaryCreated},</span>
            <span>Secondary pass (filling empty routes): {generated.secondaryCreated}.</span>
            <span>
              Assignments created for {generated.vendorCount} vendor(s) across {generated.dayCount} day(s) (weekdays only) of the week.
            </span>
          </div>
        </div>
      </PlannerModal>
    );
  }

  if (openModal === "registerDayOff") {
    return (
      <PlannerModal
        title="Register Day Off"
        narrow
        primaryLabel="SAVE"
        description={"Register a day off for a vendor. Choose a single\nday or a period."}
        onCancel={onClose}
        onSubmit={() => submit("Register Day Off")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SelectField label="Vendor" placeholder="Select a vendor" options={OPTIONS.vendor} />
          <SegmentedField options={["Single Day", "Period"]} />
          <DateField label="Start Date" defaultValue="2024-07-13" />
          <DateField label="End Date" defaultValue="2024-07-13" />
          <TextField label="Reason" placeholder="Reason for the day off" />
          <TextareaField label="Notes" placeholder="WRITE ANY NOTES" tall />
        </div>
      </PlannerModal>
    );
  }

  if (openModal === "addAssignment" || openModal === "editAssignment") {
    const title = openModal === "addAssignment" ? "Add Assignment" : "Edit Assigment";
    return (
      <PlannerModal
        title={title}
        primaryLabel="ADD"
        description={openModal === "addAssignment" ? "Associate an Admin or Team Leader vendor to Management and Support - Management and Support." : undefined}
        onCancel={onClose}
        onSubmit={() => submit(title)}
      >
        <FieldRow>
          <ReadonlyField label="Route" value={contextRoute} />
          <ReadonlyField label="Date" value={contextDate} />
          <SelectField label="Vendor" placeholder="Select a function" options={OPTIONS.vendor} />
          <SelectField label="Vehice" placeholder="Select a mananger" options={OPTIONS.vehicle} />
          <SelectField label="Sort" placeholder="YES" options={["YES", "NO"]} />
          <span />
          <DaySelectorField fullWeekLabel={FULL_WEEK_LABEL} days={FULL_WEEK_DAYS} />
          <TextareaField label="Notes (optional)" placeholder="WRITE ANY NOTES" />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "exportDay") {
    return (
      <PlannerModal title="Export Day Schedule" primaryLabel="EXPORT" description="Select one or more days and depots to export." onCancel={onClose} onSubmit={() => submit("Export Day Schedule")}>
        <FieldRow>
          <DepotPickerField />
          <DaySelectorField fullWeekLabel={FULL_WEEK_LABEL} days={FULL_WEEK_DAYS} />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "exportWeek") {
    return (
      <PlannerModal
        title="Export WEEK Schedule"
        narrow
        primaryLabel="EXPORT"
        description={"Select one or more depots to export. One PDF will\nbe generated per depot."}
        onCancel={onClose}
        onSubmit={() => submit("Export WEEK Schedule")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DepotPickerField />
          <div className="chkrow">
            <span className="box" data-on="0" />
            <span>Include weekends (Sat &amp; Sun)</span>
          </div>
          <div className="callout">
            <p>Week: <b>13/07/2024 to 17/07/2024</b></p>
            <p>Will generate <b>4 PDFs</b>: LCY, MSE, LSE, BASP</p>
          </div>
        </div>
      </PlannerModal>
    );
  }

  if (openModal === "addNote") {
    return (
      <PlannerModal title="Add Note" narrow primaryLabel="SAVE" onCancel={onClose} onSubmit={() => submit("Add Note")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SelectField label="Vendor" placeholder="Select a vendor" options={OPTIONS.vendor} />
          <DateField label="Date" defaultValue="2024-07-13" />
          <TextareaField label="Notes" placeholder="my note" tall />
        </div>
      </PlannerModal>
    );
  }

  if (openModal === "managementSupport") {
    return (
      <PlannerModal
        title="Associate Management and Support"
        primaryLabel="ADD"
        description="Associate an Admin or Team Leader vendor to Management and Support - Management and Support."
        onCancel={onClose}
        onSubmit={() => submit("Associate Management and Support")}
      >
        <FieldRow>
          <SelectField label="Function" placeholder="Select a function" options={OPTIONS.fn} />
          <SelectField label="Mananger" placeholder="Select a mananger" options={OPTIONS.manager} />
          <DaySelectorField fullWeekLabel={FULL_WEEK_LABEL} days={FULL_WEEK_DAYS} />
          <TextareaField label="Notes (optional)" placeholder="WRITE ANY NOTES" />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "addAdhoc") {
    return (
      <PlannerModal title="Add ADHOC Service" primaryLabel="CREATE SERVICE" description="Create a new ad-hoc service for this depot." onCancel={onClose} onSubmit={() => submit("Add ADHOC Service")}>
        <FieldRow>
          <SelectField label="Vendor" placeholder="Select a vendor" options={OPTIONS.vendor} />
          <SelectField label="Adhoc Service" placeholder="Select an adhoc service" options={OPTIONS.adhoc} />
          <ReadonlyField label="Adhoc sort" value="40" />
          <span />
          <DaySelectorField fullWeekLabel="Select all available weekdays (from tomorrow)" days={FULL_WEEK_DAYS} />
          <TextareaField label="Notes (optional)" placeholder="WRITE ANY NOTES" />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "addTeamLeader") {
    return (
      <PlannerModal
        title="Add Team Leader"
        primaryLabel="EXPORT"
        description="Associate an Admin or Team Leader vendor to Management and Support - Management and Support."
        onCancel={onClose}
        onSubmit={() => submit("Add Team Leader")}
      >
        <FieldRow>
          <SelectField label="Function" placeholder="Ops Manager" options={OPTIONS.fn} />
          <SelectField label="Select the mananger" placeholder="Leandro Dias" options={OPTIONS.manager} />
          <ReadonlyField label="Deposit" value="BOAP" />
          <span />
          <DaySelectorField fullWeekLabel={FULL_WEEK_LABEL} days={FULL_WEEK_DAYS} />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "addFlexRoute") {
    return (
      <PlannerModal title="Add New Flex Route" primaryLabel="ADD" description="Choose a flex route, date, and vendor to add an item to the week planner." onCancel={onClose} onSubmit={() => submit("Add New Flex Route")}>
        <FieldRow>
          <SelectField label="Flex route" placeholder="Select flex route" options={OPTIONS.flex} />
          <SelectField label="Vendor" placeholder="Select a vendor" options={OPTIONS.vendor} />
          <SelectField label="Vehicle" placeholder="Select a vehicle" options={OPTIONS.vehicle} />
          <SelectField label="Sort" placeholder="Yes" options={["Yes", "No"]} />
          <DaySelectorField fullWeekLabel="Select all available weekdays (from tomorrow)" days={FULL_WEEK_DAYS} />
          <TextareaField label="Notes (optional)" placeholder="WRITE ANY NOTES" />
        </FieldRow>
      </PlannerModal>
    );
  }

  return null;
}
```

> Note: `addFlexRoute` is included above as a 10th branch alongside the 9 named in the design (the artifact's own `MODALS` object also includes it — `addFlexRoute` is one of the two `data-modal` buttons in the `.addrow`). `ModalKind` must include `"addFlexRoute"` too — update the type union accordingly.

- [ ] **Step 2: Fix the `ModalKind` union to include `addFlexRoute`**

```ts
export type ModalKind =
  | "registerDayOff"
  | "addAssignment"
  | "editAssignment"
  | "exportDay"
  | "exportWeek"
  | "addNote"
  | "managementSupport"
  | "addAdhoc"
  | "addTeamLeader"
  | "addFlexRoute"
  | "generateWeekResult"
  | null;
```

Apply this as the real `ModalKind` definition in the file written in Step 1 (replace the union written there).

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add "app/(private)/week-planner/components/modals/modalConfigs.tsx"
git commit -m "feat: add the 10 planner modal configurations and host component"
```

---

### Task 17: `page.tsx` and `loading.tsx` — wire everything together

**Files:**
- Create: `app/(private)/week-planner/page.tsx`
- Create: `app/(private)/week-planner/loading.tsx`

**Interfaces:**
- Consumes: every component/hook produced by Tasks 2, 3, 6, 8–16.
- Produces: the `/week-planner` route itself — nothing downstream depends on this file.

- [ ] **Step 1: Write `app/(private)/week-planner/loading.tsx`**

```tsx
import PrivateRouteLoading from "../components/PrivateRouteLoading";

export default function Loading() {
  return <PrivateRouteLoading />;
}
```

- [ ] **Step 2: Write `app/(private)/week-planner/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import NavbarWrapper from "../components/NavbarWrapper";
import ToastProvider from "./components/Toast";
import "./styles.css";
import AdhocSection from "./components/AdhocSection";
import DayGrid from "./components/DayGrid";
import DepotTabs from "./components/DepotTabs";
import ExceptionsPanel from "./components/rail/ExceptionsPanel";
import ManagementSupportPanel from "./components/rail/ManagementSupportPanel";
import NotesPanel from "./components/rail/NotesPanel";
import OffHolidayPanel from "./components/rail/OffHolidayPanel";
import PlanHorizonPanel from "./components/rail/PlanHorizonPanel";
import PlannerModalHost, { type ModalKind } from "./components/modals/modalConfigs";
import TeamLeaderTrack from "./components/TeamLeaderTrack";
import WeekPickerButton from "./components/WeekPickerButton";
import { DEFAULT_DEPOT_ID, HEADER_ACTIONS, WEEK_OPTIONS } from "./constants";
import { useWeekPlannerActions } from "./hooks/useWeekPlannerActions";
import { useWeekPlannerBoard } from "./hooks/useWeekPlannerBoard";
import { useToast } from "./components/Toast";
import type { RouteCardModel, WeekOption } from "./types";

function WeekPlannerBoard() {
  const [depot, setDepot] = useState<string>(DEFAULT_DEPOT_ID);
  const [week, setWeek] = useState<WeekOption>(WEEK_OPTIONS.find((w) => w.state === "current")!);
  const [leaderIndex, setLeaderIndex] = useState(0);
  const [showWeekend, setShowWeekend] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>("2024-07-16");
  const [modal, setModal] = useState<ModalKind>(null);
  const [ctxRoute, setCtxRoute] = useState("MD7C");
  const [ctxDate, setCtxDate] = useState("13/07/2024");

  const { data: board, isLoading } = useWeekPlannerBoard(depot, week.id);
  const { runAction } = useWeekPlannerActions();
  const { showToast } = useToast();

  if (isLoading || !board) {
    return (
      <div className="week-planner-page">
        <div className="wrap">Carregando board…</div>
      </div>
    );
  }

  const visibleDays = showWeekend ? board.days : board.days.filter((d) => !d.isWeekend);
  const selectedDay = board.days.find((d) => d.date === selectedDate) ?? null;
  const exceptions = selectedDate ? board.exceptionsByDate[selectedDate] ?? null : null;

  function openRouteModal(route: RouteCardModel) {
    setCtxRoute(route.code);
    setCtxDate(formatDate(selectedDay?.date ?? board!.days[0].date));
    setModal("editAssignment");
  }

  function openAddInDay(date: string) {
    setCtxDate(formatDate(date));
    setModal("addAssignment");
  }

  return (
    <div className="week-planner-page">
      <div className="wrap">
        <div className="topbar">
          <h1 className="title disp">WEEK PLANNER</h1>
          <span className="demo-tag">Protótipo · dados de exemplo</span>
        </div>

        <div className="header">
          <WeekPickerButton week={week} onPick={setWeek} />
          <div className="actions">
            {HEADER_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="tbtn"
                onClick={() => {
                  if (action.id === "save") {
                    showToast("Semana salva (protótipo — nada foi persistido).");
                    return;
                  }
                  if (action.id === "generateWeek") {
                    setModal("generateWeekResult");
                    return;
                  }
                  setModal(action.id as ModalKind);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="controls">
          <DepotTabs selected={depot} onSelect={setDepot} />
          <label className="wkend">
            <input type="checkbox" checked={showWeekend} onChange={(e) => setShowWeekend(e.target.checked)} />
            SHOW WEEKEND
          </label>
        </div>

        <div className="addrow">
          <button type="button" className="addbtn" onClick={() => setModal("addFlexRoute")}>
            <span className="plus">+</span><span className="lbl">ADD NEW FLEXROUTE</span>
          </button>
          <button type="button" className="addbtn" onClick={() => setModal("addTeamLeader")}>
            <span className="plus">+</span><span className="lbl">TEAM LEADERS</span>
          </button>
        </div>

        <div className="cols">
          <div className="board">
            <TeamLeaderTrack selectedIndex={leaderIndex} onSelect={setLeaderIndex} />
            <DayGrid
              days={visibleDays}
              variant="main"
              selectedDate={selectedDate}
              onSelectDay={setSelectedDate}
              onAddInDay={openAddInDay}
              onOpenRoute={openRouteModal}
            />
            <AdhocSection days={visibleDays} onAddAdhoc={() => setModal("addAdhoc")} onOpenRoute={openRouteModal} />
          </div>

          <aside className="railcol">
            <NotesPanel
              notes={board.notes}
              onAddNote={() => setModal("addNote")}
              onAcknowledge={() => runAction("Nota marcada como salva")}
            />
            <ManagementSupportPanel days={board.management} />
            <OffHolidayPanel days={board.absences} />
            <ExceptionsPanel exceptions={exceptions} fallbackLabel="WEEK" />
            <PlanHorizonPanel weeks={board.horizon} />
          </aside>
        </div>

        <footer className="pg">© 2026 LOGIX / SPHERE OPERATIONAL SYSTEMS</footer>
      </div>

      <PlannerModalHost openModal={modal} contextRoute={ctxRoute} contextDate={ctxDate} onClose={() => setModal(null)} />
    </div>
  );
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function WeekPlannerPage() {
  return (
    <NavbarWrapper>
      <ToastProvider>
        <WeekPlannerBoard />
      </ToastProvider>
    </NavbarWrapper>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: passes. If `ExceptionsPanel`, `PlanHorizonPanel`, or any prior task's prop names drifted, fix the mismatch here (this task is the integration point where signature drift surfaces).

- [ ] **Step 4: Run the full test suite**

Run: `npm run test`
Expected: PASS (mapper tests from Task 5 still green).

- [ ] **Step 5: Boot the dev server and smoke-check in the browser**

Run: `npm run dev`

Open `http://localhost:3000/week-planner` and confirm:
- the board renders with Monday–Sunday columns (weekend hidden by default);
- toggling "SHOW WEEKEND" reveals Saturday/Sunday;
- clicking a route card opens the "Edit Assigment" modal with the right route code;
- clicking "+ ADD ADHOC" opens "Add ADHOC Service";
- the week picker popover opens, navigates months, and "GO TO CURRENT WEEK" works;
- the rail (Notes, Management & Support, Off/Holiday, Exceptions, Plan Horizon) all render with data;
- every header action button opens its modal or shows a toast;
- "GENERATE WEEK" shows the numeric summary modal.

Stop the dev server after confirming (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
git add "app/(private)/week-planner/page.tsx" "app/(private)/week-planner/loading.tsx"
git commit -m "feat: assemble the week-planner page from all board components"
```

---

### Task 18: `README.md` and final validation pass

**Files:**
- Create: `README.md`

**Interfaces:**
- None — this task produces documentation and runs the project-wide validation gates; nothing else depends on it.

- [ ] **Step 1: Write `README.md`**

```markdown
# Week Planner — Protótipo (LogixSphere)

Protótipo Next.js isolado da page `/week-planner`, construído seguindo a
anatomia de page real do LogixSphere (ver `docs/superpowers/specs/2026-09-21-week-planner-prototype-design.md`),
mas alimentado por dados mock.

## Rodando localmente

\`\`\`bash
npm install
npm run dev
\`\`\`

Abra `http://localhost:3000/week-planner`.

## Testes e gates

\`\`\`bash
npm run typecheck
npm run lint
npm run test
npm run build
\`\`\`

## Como ligar ao banco de dados / backend real

Toda a camada de dados está isolada em `lib/week-planner-api.ts`. Hoje cada
função resolve uma fixture local (`lib/mocks/week-planner-fixtures.ts`) com um
delay simulado. Para ligar ao backend real:

1. Crie `lib/api-client.ts` seguindo o modelo descrito em
   `ANATOMIA-DE-UMA-PAGE.md` (monta query params, injeta Bearer, converte
   `snake_case` → `camelCase`).
2. Em `lib/week-planner-api.ts`, troque o corpo de cada função:
   - `fetchWeekPlannerBoard` → `GET /bff/week-planners?depot=&week=`
   - `submitPlannerAction` → o endpoint específico de cada ação (a confirmar
     com o backend — hoje é uma função genérica no protótipo)
   - `generateDefaultSchedule` → `POST /bff/week-planners/bulk-approve` (ou
     equivalente)
3. Confira se os nomes de campo do DTO real batem com os definidos em
   `lib/mocks/week-planner-fixtures.ts` (`WeekPlannerBoardDTO`) — ajuste
   `app/(private)/week-planner/utils/weekPlannerMappers.ts` se os nomes
   divergirem. Confirme sempre no Network do navegador, não apenas na
   tipagem (ver `CONTRATO-DE-API-PARA-PAGES.md`, seção de divergências).
4. Nenhum componente, hook ou `page.tsx` precisa mudar — a troca é isolada em
   `lib/` e `utils/weekPlannerMappers.ts`.

## Fora de escopo (deliberado)

- Autenticação, permissões por perfil, sidebar real, middleware — este é um
  protótipo de validação isolado, não uma rota do repositório real.
- Persistência: toda ação de escrita termina em um toast, nada é salvo.
- Drag-and-drop de assignments — não estava no protótipo visual original.
```

- [ ] **Step 2: Run every validation gate**

Run: `npm run typecheck`
Expected: 0 errors.

Run: `npm run lint`
Expected: 0 errors (warnings acceptable if they pre-exist in generated Next.js boilerplate only).

Run: `npm run test`
Expected: all tests pass (mapper tests from Task 5).

Run: `npm run build`
Expected: production build completes successfully.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README with run instructions and the mock-to-real-API migration checklist"
```

---

## Self-Review Notes

- **Spec coverage:** §3.1 header/week-picker → Tasks 11, 17. §3.2 controls → Task 10, 17. §3.3 main grid → Task 9, 17. §3.4 route cards → Task 8. §3.5 rail (5 panels) → Tasks 12–14. §3.6 modals (9 + `addFlexRoute`) → Task 16. §3.7 toast → Task 6. §5 mock-to-real migration → Tasks 5, 18 (README checklist). §7 styles → Task 7. §8 testing → Global Constraints note + Task 17 Step 5 + Task 18 Step 2.
- **Placeholder scan:** no TBD/TODO; every step has literal code or literal shell commands.
- **Type consistency:** `RouteCardModel`, `DayColumnModel`, `WeekOption`, `NoteModel`, `AbsenceDayModel`, `ManagementDayModel`, `ExceptionsModel`, `HorizonWeekModel`, `WeekPlannerBoardModel` are defined once in Task 3 and reused verbatim by every later task; DTOs are defined once in Task 4 and consumed only by Task 5's mapper. `ModalKind` is corrected in Task 16 Step 2 to include `addFlexRoute`, matching its usage in Task 17.
- **Known deviation flagged in-plan:** Task 16 identifies that the design doc's modal list (9) omits `addFlexRoute`, which the artifact itself wires as a 10th `data-modal` target — resolved directly in the task rather than silently dropped or silently added without note.
