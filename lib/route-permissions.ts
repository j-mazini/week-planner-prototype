import { BUSINESS_RULES } from "@/src/constants/businessRules";

/**
 * Permissões de roteamento por tipo de utilizador.
 * Usado no middleware, sidebar e Quick Access da home.
 *
 * Alinhamento conceitual com `ROLE_PERMISSIONS` no backend (`user_type_id` 2 = vendor, 3 = supervisor);
 * o middleware só consegue ler `userTypeId` do JWT — as listas abaixo são a whitelist de paths.
 */

/** Personal views shared by drivers, supervisors and admins; queries use the signed-in user. */
export const MY_PERFORMANCE_ROUTES = [
  "/daily-performance-insight",
  "/subcontractor",
  "/deductions",
  "/current-month",
  "/current-performance",
  "/driver-route-balance",
  "/mobile-invoice",
  "/requests",
] as const;

export const USER_TYPE_2_ALLOWED = ["/home", ...MY_PERFORMANCE_ROUTES] as const;

/** URLs permitidas para `SUPERVISOR` — corresponde a `user_type_id` 3 */
export const USER_TYPE_3_ALLOWED = [
  ...MY_PERFORMANCE_ROUTES,
  "/week-planner",
  "/daily-game-plan",
  "/vendor",
  "/vehicles",
] as const;

/** URLs permitidas para `SERVICE_PARTNER` — corresponde a `user_type_id` 5 */
export const USER_TYPE_5_ALLOWED = [
  "/home",
  "/week-planner",
  "/daily-financial-insights",
  "/service-partner-invoices",
  "/vendor",
  "/vehicles",
  "/daily-operations-insight",
  "/vendor-performance",
  "/deductions",
  "/invoices",
] as const;

/** Match exato ou subpath `/${route}/`. */
export function isPathAllowed(
  pathname: string,
  allowedRoutes: readonly string[]
): boolean {
  return allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/** Verifica se o path está permitido para utilizador com whitelist de motorista (`user_type_id` 2). */
export function isAllowedForUserType2(pathname: string): boolean {
  return isPathAllowed(pathname, USER_TYPE_2_ALLOWED);
}

/** Verifica se o path está permitido para utilizador com whitelist de supervisor (`user_type_id` 3). */
export function isAllowedForUserType3(pathname: string): boolean {
  return isPathAllowed(pathname, USER_TYPE_3_ALLOWED);
}

/** Verifica se o path está permitido para utilizador com whitelist de service partner (`user_type_id` 5). */
export function isAllowedForUserType5(pathname: string): boolean {
  return isPathAllowed(pathname, USER_TYPE_5_ALLOWED);
}

export function canAccessPath(
  userTypeId: number | null | undefined,
  pathname: string
): boolean {
  if (userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN) {
    return true;
  }

  if (userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER) {
    return isAllowedForUserType2(pathname);
  }

  if (userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR) {
    return isAllowedForUserType3(pathname);
  }

  if (userTypeId === BUSINESS_RULES.USER_TYPE.SERVICE_PARTNER) {
    return isAllowedForUserType5(pathname);
  }

  return false;
}

export function getBeamSidebarAccess(userTypeId: number | null | undefined): {
  canSeeSidebar: boolean;
  canSeeFinancial: boolean;
  canSeeVendorRequests: boolean;
} {
  if (userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN) {
    return {
      canSeeSidebar: true,
      canSeeFinancial: true,
      canSeeVendorRequests: true,
    };
  }

  if (userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR) {
    return {
      canSeeSidebar: true,
      canSeeFinancial: false,
      canSeeVendorRequests: false,
    };
  }

  if (userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER) {
    return {
      canSeeSidebar: true,
      canSeeFinancial: false,
      canSeeVendorRequests: false,
    };
  }

  if (userTypeId === BUSINESS_RULES.USER_TYPE.SERVICE_PARTNER) {
    return {
      canSeeSidebar: true,
      canSeeFinancial: true,
      canSeeVendorRequests: false,
    };
  }

  return {
    canSeeSidebar: false,
    canSeeFinancial: false,
    canSeeVendorRequests: false,
  };
}
