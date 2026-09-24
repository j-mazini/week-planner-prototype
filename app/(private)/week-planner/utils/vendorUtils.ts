import type { Vendor } from "@/lib/vendors";
import { BUSINESS_RULES } from "@/src/constants/businessRules";

/**
 * IDs de tipo de usuário elegíveis para o Week Planner.
 * Fonte de verdade: `BUSINESS_RULES.USER_TYPE`.
 */
export const ALLOWED_USER_TYPE_IDS = [
  BUSINESS_RULES.USER_TYPE.ADMIN,
  BUSINESS_RULES.USER_TYPE.DRIVER,
  BUSINESS_RULES.USER_TYPE.SUPERVISOR,
] as number[];

function isTruthyActive(value: unknown): boolean {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    (typeof value === "string" && value.toLowerCase() === "true")
  );
}

/**
 * Converte o array bruto de vendors (GET /bff/vendor) em Vendor[],
 * aplicando as regras globais de elegibilidade do Week Planner.
 *
 * Regras aplicadas:
 *   - active truthy (true | 1 | "1" | "true")
 *   - userId > 0
 *   - userTypeId em `ALLOWED_USER_TYPE_IDS` (Admin, Vendor, Supervisor)
 *   - endDate ausente ou no futuro
 *
 * NÃO filtra por:
 *   - alocação / assignment
 *   - depósito  (filtro contextual — aplicar no componente quando necessário)
 *
 * Esta é a ÚNICA fonte de verdade para normalização de vendors no Week Planner.
 * Todos os componentes (AvailableVendors, AddAssignment, EditAssignment) devem
 * usar esta função como ponto de partida antes de aplicar filtros contextuais.
 */
export function normalizeVendors(
  vendors: Record<string, unknown>[]
): Vendor[] {
  return vendors
    .filter((v) => {
      if (!v) return false;

      // `active` may be absent when the input is an already-normalised Vendor object
      // (the Vendor interface does not carry this field). Treat undefined as active.
      if (v.active !== undefined && !isTruthyActive(v.active)) return false;

      const userId = Number(v.userId ?? v.userId ?? 0);
      if (userId <= 0) return false;

      const userTypeId = Number(
        v.userTypeId ?? v.userTypeId ?? v.userType ?? v.userType ?? 0
      );

      if (!ALLOWED_USER_TYPE_IDS.includes(userTypeId)) return false;

      if (v.endDate) {
        const endDate = new Date(String(v.endDate));
        if (!Number.isNaN(endDate.getTime()) && endDate <= new Date()) return false;
      }

      return true;
    })
    .map((v): Vendor | null => {
      const userId = Number(v.userId ?? v.userId ?? 0);
      if (userId <= 0) return null;

      const fullName =
        String(v.fullName ?? v.fullName ?? "").trim() ||
        `${String(v.name ?? v.first_name ?? v.firstName ?? "")} ${String(v.lastName ?? v.lastName ?? "")}`.trim() ||
        "Unknown Vendor";

      return {
        userId: userId,
        fullName: fullName,
        userTypeId: Number(v.userTypeId ?? v.userTypeId ?? 0) || undefined,
        depositId: v.depositId != null ? Number(v.depositId) : null,
        drivingLicenceExpiryDate: v.drivingLicenceExpiryDate
          ? String(v.drivingLicenceExpiryDate)
          : null,
        dvlaCheckDate: v.dvlaCheckDate ? String(v.dvlaCheckDate) : null,
        vendorTypeId: v.vendorTypeId != null ? Number(v.vendorTypeId) : null,
        costModelId: v.costModelId != null ? Number(v.costModelId) : null,
        routeId: v.routeId != null ? Number(v.routeId) : null,
        vehicleId: v.vehicleId != null ? Number(v.vehicleId) : null,
        servicePartnerId:
          v.servicePartnerId != null
            ? (typeof v.servicePartnerId === "string"
                ? parseInt(v.servicePartnerId, 10)
                : Number(v.servicePartnerId))
            : null,
        costModels: Array.isArray(v.costModels) ? v.costModels : undefined,
      } as Vendor;
    })
    .filter((d): d is Vendor => d !== null);
}

/**
 * @deprecated Use normalizeVendors instead
 */
export const normalizeVendorsToVendors = normalizeVendors;


