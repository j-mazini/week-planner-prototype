import { WEEK_PLANNER_BOARD_FIXTURE } from "./mocks/week-planner-fixtures";
import { mapWeekPlannerBoardDtoToModel } from "@/app/(private)/week-planner/utils/weekPlannerMappers";
import type { WeekPlannerBoardModel } from "@/app/(private)/week-planner/types";

const MOCK_DELAY_MS = 400;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolve a fixture local — este protótipo não tem backend nem banco de dados. */
export async function fetchWeekPlannerBoard(params: {
  depotId: string;
  weekId: string;
}): Promise<WeekPlannerBoardModel> {
  await wait(MOCK_DELAY_MS);
  const dto = { ...WEEK_PLANNER_BOARD_FIXTURE, week_id: params.weekId, depot_id: params.depotId };
  return mapWeekPlannerBoardDtoToModel(dto);
}

/** Cobre todas as ações de escrita "genéricas" do protótipo (botões do cabeçalho e submits de modal). */
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

/** Gera uma fixture de resultado — sem chamada real, sem backend. */
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
