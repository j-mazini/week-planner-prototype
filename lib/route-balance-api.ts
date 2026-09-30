import { ROUTE_BALANCE_BOARD, ROUTE_BALANCE_IMPORT_PREVIEW } from "./mocks/route-balance-fixtures";
import type { ImportPreviewModel, RouteBalanceBoardModel } from "@/app/(private)/route-balance/types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves the local fixture — this prototype has no backend or database. */
export async function fetchRouteBalanceBoard(): Promise<RouteBalanceBoardModel> {
  await wait(350);
  return ROUTE_BALANCE_BOARD;
}

export async function submitRouteBalanceAction(actionLabel: string): Promise<{ message: string }> {
  await wait(250);
  return { message: `${actionLabel.toUpperCase()} — submitted (prototype, nothing was saved).` };
}

export async function processImportFile(): Promise<ImportPreviewModel> {
  await wait(700);
  return ROUTE_BALANCE_IMPORT_PREVIEW;
}
