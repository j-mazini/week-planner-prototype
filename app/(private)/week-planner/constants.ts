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
