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
        route("mon-4", "LS3D", "ok", "R. Chandran", "MK19 PLV", "ok"),
        route("mon-5", "LS1B", "warning", "M. Whitfield", "LK71 XWD", "ok"),
        route("mon-6", "LS4E", "ok", "S. McAlister", "LX68 GTR", "ok"),
        route("mon-7", "LS2A", "conflict", "J. Corrigan", "BV23 ORE", "sub"),
        route("mon-8", "LS5F", "ok", "J. Blake", "KV68 TRD", "ok"),
        route("mon-9", "LS3M", "open", null, null, null),
        route("mon-10", "LS6G", "ok", "A. Strood", "WM24 QSE", "ok"),
        route("mon-11", "LS1R", "ok", "V. Ilic", "LR71 PFA", "ok"),
      ],
      adhoc_routes: [
        route("mon-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("mon-a2", "LS2C", "open", null, null, null),
        route("mon-a3", "LS7H", "ok", "D. Adeyemi", "OY69 HDK", "ok"),
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
        route("tue-4", "LS3D", "ok", "R. Chandran", "MK19 PLV", "ok"),
        route("tue-5", "LS4E", "ok", "S. McAlister", "LX68 GTR", "ok"),
        route("tue-6", "LS1Q", "error", "K. Lennon", null, "none", true),
        route("tue-7", "LS5F", "warning", "J. Blake", "KV68 TRD", "ok"),
        route("tue-8", "LS6G", "ok", "A. Strood", "WM24 QSE", "ok"),
        route("tue-9", "LS3M", "open", null, null, null),
      ],
      adhoc_routes: [
        route("tue-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("tue-a2", "LS7H", "ok", "D. Adeyemi", "OY69 HDK", "ok"),
      ],
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
        route("wed-4", "LS3D", "ok", "R. Chandran", "MK19 PLV", "ok"),
        route("wed-5", "LS4E", "ok", "S. McAlister", "LX68 GTR", "ok"),
        route("wed-6", "LS5F", "ok", "J. Blake", "KV68 TRD", "ok"),
        route("wed-7", "LS2C", "open", null, null, null),
        route("wed-8", "LS1Q", "error", "K. Lennon", null, "none", true),
      ],
      adhoc_routes: [
        route("wed-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("wed-a2", "LS6G", "ok", "A. Strood", "WM24 QSE", "ok"),
      ],
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
        route("thu-5", "LS3D", "ok", "R. Chandran", "MK19 PLV", "ok"),
        route("thu-6", "LS4E", "warning", "S. McAlister", "LX68 GTR", "ok"),
        route("thu-7", "LS5F", "ok", "J. Blake", "KV68 TRD", "ok"),
        route("thu-8", "LS3M", "open", null, null, null),
      ],
      adhoc_routes: [
        route("thu-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("thu-a2", "LS2C", "open", null, null, null),
        route("thu-a3", "LS7H", "ok", "D. Adeyemi", "OY69 HDK", "ok"),
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
        route("fri-3", "LS2A", "conflict", "J. Corrigan", "BV23 ORE", "sub"),
        route("fri-4", "LS3D", "ok", "R. Chandran", "MK19 PLV", "ok"),
        route("fri-5", "LS4E", "ok", "S. McAlister", "LX68 GTR", "ok"),
        route("fri-6", "LS2C", "open", null, null, null),
      ],
      adhoc_routes: [
        route("fri-a1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("fri-a2", "LS6G", "ok", "A. Strood", "WM24 QSE", "ok"),
      ],
    },
    {
      date: "2024-07-18",
      name: "SATURDAY",
      day_number: "18",
      is_weekend: true,
      review_badge: null,
      assignment_count: 8,
      main_routes: [
        route("sat-1", "LS1B", "ok", "M. Whitfield", "LK71 XWD", "ok"),
        route("sat-2", "LS2C", "open", null, null, null),
        route("sat-3", "LS5F", "ok", "J. Blake", "KV68 TRD", "ok"),
      ],
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
    {
      id: "n3",
      severity: "URGENT",
      body: "LS3M open all week — no vendor confirmed. Escalate to service partner before Thursday's cut-off.",
      acknowledged: false,
    },
    {
      id: "n4",
      severity: "CRITICAL",
      body: "KV68 TRD flagged for tacho recalibration on Friday morning — do not assign before 10:00.",
      acknowledged: true,
    },
  ],
  absences: [
    {
      day_label: "MON",
      chips: [
        { kind: "OFF", person_name: "T. Farris" },
        { kind: "LEAVE", person_name: "G. Adeb.." },
        { kind: "OFF", person_name: "P. Oyelaran" },
      ],
      extra_count: 0,
    },
    {
      day_label: "TUE",
      chips: [
        { kind: "OFF", person_name: "B. Whit.." },
        { kind: "LEAVE", person_name: "P. Novak" },
        { kind: "OFF", person_name: "J. Carew" },
        { kind: "OFF", person_name: "H. Mabaso" },
      ],
      extra_count: 1,
    },
    { day_label: "WED", chips: [{ kind: "LEAVE", person_name: "F. Grech" }], extra_count: 0 },
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
    {
      day_label: "FRI",
      chips: [
        { kind: "OFF", person_name: "R. Chan.." },
        { kind: "LEAVE", person_name: "E. Kami.." },
        { kind: "OFF", person_name: "T. Osei" },
      ],
      extra_count: 0,
    },
  ],
  management: [
    { day_label: "MON 13", cells: [{ manager_name: "G. Ellison", is_muted: false }, { manager_name: "Leandro Dias", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "K. Mensah", is_muted: true }] },
    { day_label: "TUE 14", cells: [{ manager_name: "G. Ellison", is_muted: false }, { manager_name: "Leandro Dias", is_muted: false }, { manager_name: "Marlon Valesan", is_muted: false }, { manager_name: "K. Mensah", is_muted: true }] },
    {
      day_label: "WED 15",
      cells: [
        { manager_name: "G. Ellison", is_muted: false },
        { manager_name: "G. Ellison", is_muted: false, tooltip: "+A.STROOD - AT OTHER DEPOT" },
        { manager_name: "Marlon Valesan", is_muted: false },
        { manager_name: "K. Mensah", is_muted: true },
      ],
    },
    { day_label: "THU 16", cells: [{ manager_name: "G. Ellison", is_muted: false }, { manager_name: "Leandro Dias", is_muted: false }, { manager_name: "Marlon Valesan", is_muted: false, tooltip: "+P.RAMANATHAN - COVERING BASP" }, { manager_name: "K. Mensah", is_muted: true }] },
    { day_label: "FRI 17", cells: [{ manager_name: "G. Ellison", is_muted: false }, { manager_name: "Leandro Dias", is_muted: false }, { manager_name: "G. Ellison", is_muted: false }, { manager_name: "K. Mensah", is_muted: true }] },
  ],
  exceptions_by_date: {
    "2024-07-13": {
      day_label: "MONDAY",
      vehicles: {
        utilization_label: "10/15",
        utilization_percent: 67,
        depot_label: "LCY",
        items: [
          { tag: "SPARE", plate: "MK19 PLV", usable: true },
          { tag: "SPARE", plate: "LX68 GTR", usable: true },
          { tag: "VOR", plate: "BV23 ORE — BODYWORK", usable: false },
        ],
      },
      drivers: {
        unallocated: { tag: "UNALLOCATED", name: "P. Oyelaran", placeable: true },
        items: [
          { tag: "SPARE", name: "H. Mabaso", placeable: false },
          { tag: "FLEX", name: "T. Osei", placeable: false },
        ],
      },
    },
    "2024-07-14": {
      day_label: "TUESDAY",
      vehicles: {
        utilization_label: "13/15",
        utilization_percent: 87,
        depot_label: "MSE",
        items: [
          { tag: "SPARE", plate: "LR71 PFA", usable: true },
          { tag: "VOR", plate: "KV68 TRD — TACHO CHECK", usable: false },
        ],
      },
      drivers: {
        unallocated: null,
        items: [
          { tag: "SPARE", name: "V. Ilic", placeable: false },
          { tag: "FLEX", name: "J. Blake", placeable: false },
        ],
      },
    },
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
    "2024-07-17": {
      day_label: "FRIDAY",
      vehicles: {
        utilization_label: "9/15",
        utilization_percent: 60,
        depot_label: "BASP",
        items: [
          { tag: "SPARE", plate: "MK19 PLV", usable: true },
          { tag: "SPARE", plate: "OY69 HDK", usable: true },
          { tag: "SPARE", plate: "LX68 GTR", usable: true },
          { tag: "VOR", plate: "WM24 QSE — GLASS DAMAGE", usable: false },
        ],
      },
      drivers: {
        unallocated: { tag: "UNALLOCATED", name: "N. Quinn", placeable: true },
        items: [
          { tag: "SPARE", name: "C. Reid", placeable: false },
          { tag: "FLEX", name: "D. Adeyemi", placeable: false },
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
