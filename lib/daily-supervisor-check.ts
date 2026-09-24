import { getUserIdFromToken, getUserTypeFromToken, hasAuthSession, getBearerAuthHeader } from "@/lib/auth"
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { BUSINESS_RULES } from "@/src/constants/businessRules";

export type DailySupervisorCheckRecord = {
  date: string;
  depositId: number;
  depositName?: string;
  supervisorId?: number;
  supervisorName?: string;
};

/**
 * Busca o supervisor responsável por depósito em uma data (tabela daily_supervisor_check).
 *
 * Endpoint assumido:
 * GET /bff/daily-team-support?date=YYYY-MM-DD
 */
export async function fetchDailySupervisorCheck(
  date: string
): Promise<DailySupervisorCheckRecord[]> {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) throw new Error("API URL is not configured.");

  if (!hasAuthSession()) throw new Error("Authentication token not found. Please login again.");

  const response = await fetch(
    `${API_BASE_URL}/bff/daily-team-support?date=${encodeURIComponent(date)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch daily supervisor check (${response.status}): ${text || response.statusText}`
    );
  }

  const raw = await response.json().catch(() => null);
  const rawObj = raw as Record<string, unknown> | null;
  const arr: Array<Record<string, unknown>> = Array.isArray(raw)
    ? raw
    : rawObj && typeof rawObj === "object"
      ? Array.isArray(rawObj.data)
        ? (rawObj.data as Array<Record<string, unknown>>)
        : Array.isArray(rawObj.items)
          ? (rawObj.items as Array<Record<string, unknown>>)
          : Array.isArray(rawObj.result)
            ? (rawObj.result as Array<Record<string, unknown>>)
            : []
      : [];

  return arr
    .map((r) => {
      const deposit = r.deposit as Record<string, unknown> | undefined;
      const supervisor = r.supervisor as Record<string, unknown> | string | undefined;
      const supervisorObj = typeof supervisor === "object" ? supervisor : undefined;
      const depositId = Number(
        r.depositId ??
        deposit?.depositId ??
        0
      );
      const supervisorName = String(
        r.fullName ??
        r.supervisorName ??
        supervisorObj?.fullName ??
        supervisor ??
        ""
      ).trim();
      const supervisorId =
        Number(
          r.supervisorId ??
          r.userId ??
          supervisorObj?.userId ??
          0
        ) || undefined;
      const depositName = (r.depositName ??
        deposit?.depositName) as string | undefined;
      const recDate = String(r.date ?? r.day ?? r.operation_date ?? date);

      return {
        date: recDate,
        depositId: depositId,
        depositName: depositName,
        supervisorId: supervisorId,
        supervisorName: supervisorName || undefined,
      } satisfies DailySupervisorCheckRecord;
    })
    .filter((r) => !!r.date && Number.isFinite(r.depositId) && r.depositId > 0);
}

/**
 * Se o usuário logado for restricted (`BUSINESS_RULES.USER_TYPE.SUPERVISOR`), resolve todos os depositIds associados ao
 * supervisor do dia (daily_supervisor_check) para a data informada.
 */
export async function resolveSupervisorDepots(
  date: string
): Promise<DailySupervisorCheckRecord[]> {
  const userTypeId = getUserTypeFromToken();
  if (userTypeId !== BUSINESS_RULES.USER_TYPE.SUPERVISOR) return [];

  const userId = getUserIdFromToken();
  if (!userId) return [];

  try {
    const rows = await fetchDailySupervisorCheck(date);
    return rows.filter((r) => Number(r.supervisorId) === Number(userId));
  } catch {
    return [];
  }
}

/**
 * Se o usuário logado for restricted (`BUSINESS_RULES.USER_TYPE.SUPERVISOR`), resolve o depositId associado ao
 * supervisor do dia (daily_supervisor_check) para a data informada.
 */
export async function resolveDepositIdForRestrictedUser(
  date: string
): Promise<number | null> {
  const userTypeId = getUserTypeFromToken();
  if (userTypeId !== BUSINESS_RULES.USER_TYPE.SUPERVISOR) return null;

  const userId = getUserIdFromToken();
  if (!userId) return null;

  try {
    const rows = await fetchDailySupervisorCheck(date);
    const match = rows.find((r) => Number(r.supervisorId) === Number(userId));
    return match?.depositId ?? null;
  } catch {
    return null;
  }
}



