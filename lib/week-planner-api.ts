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
