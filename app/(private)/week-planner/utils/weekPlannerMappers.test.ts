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
