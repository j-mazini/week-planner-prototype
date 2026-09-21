import { WEEK_PLANNER_BOARD_FIXTURE } from "./mocks/week-planner-fixtures";
import { mapWeekPlannerBoardDtoToModel } from "@/app/(private)/week-planner/utils/weekPlannerMappers";
import type { WeekPlannerBoardModel } from "@/app/(private)/week-planner/types";

const MOCK_DELAY_MS = 400;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Today: resolves the local fixture. Tomorrow: replace the body with a real
 * call via lib/api-client.ts against GET /bff/week-planners?depot=&week=
 * (see CONTRATO-DE-API-PARA-PAGES.md). Signature and return shape don't
 * change — hooks and components don't need to be touched.
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
 * Covers all the prototype's "generic" write actions (header buttons and
 * modal submits) — tomorrow, each becomes a real call (POST/PATCH) to the
 * specific endpoint documented in the API contract.
 */
export async function submitPlannerAction(actionLabel: string): Promise<{ message: string }> {
  await wait(250);
  return { message: `${actionLabel.toUpperCase()} — submitted (prototype, nothing was saved).` };
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
 * Tomorrow: POST /bff/week-planners/bulk-approve (or the equivalent
 * default-schedule-generation endpoint — to confirm with the backend).
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
