import { HOME_DASHBOARD_FIXTURE } from "./mocks/home-fixtures";
import { mapHomeDashboardDtoToModel } from "@/app/(private)/home/utils/homeMappers";
import type { HomeDashboardModel } from "@/app/(private)/home/types";

const MOCK_DELAY_MS = 400;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves the local fixture — this prototype has no backend or database. */
export async function fetchHomeDashboard(): Promise<HomeDashboardModel> {
  await wait(MOCK_DELAY_MS);
  return mapHomeDashboardDtoToModel(HOME_DASHBOARD_FIXTURE);
}
