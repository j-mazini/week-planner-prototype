import { api } from "@/lib/api-client";
import { DepositDTO } from "./deposits";

export interface Route {
  routeId?: number;
  routeName?: string;
  active?: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  customerId?: number;
  depositId?: number;
  serviceTypeId?: number;
  servicePartnerId?: number;
  isFlex?: boolean;
  category?: string;
  routeDefaultId?: number;
  routeDefaultName?: string;
}

export interface RoutesResponse {
  routes?: Route[];
}

export interface RouteByDepositDTO {
  routeId: number;
  routeName: string;
  active: boolean;
  customerId: number;
  depositId: number;
  serviceTypeId: number;
  isFlex?: boolean;
  routeDefaultId?: number;
  routeDefaultName?: string;
}

export interface DepositWithRoutesDTO {
  depositId: number;
  depositName: string;
  isPhysical?: boolean;
  routes: RouteByDepositDTO[];
}

export interface DepositWithRoutesFullDTO {
  depositId: number;
  depositName: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  customerId?: number;
  isPhysical?: boolean;
  routes: RouteByDepositDTO[];
}

export interface FetchDepositsWithRoutesOptions {
  /** When true, returns only routes where is_flex=false (core/fixed routes). Used by week planner. */
  onlyNonFlex?: boolean;
}

/**
 * Fetches deposits with all their information and routes
 * @param options.onlyNonFlex - When true, only routes with is_flex=false are included (for week planner)
 * @returns Promise with array of deposits containing full deposit info and routes
 */
export const fetchDepositsWithRoutesFull = async (
  options?: FetchDepositsWithRoutesOptions,
): Promise<DepositWithRoutesFullDTO[]> => {
  try {
    const deposits = await api.get<DepositWithRoutesFullDTO[]>("/bff/deposits");

    // Create a map of depositId to full deposit info
    const depositMap = new Map<number, DepositWithRoutesFullDTO>();
    deposits.forEach((deposit) => {
      const id = deposit.depositId;
      if (id) {
        depositMap.set(id, deposit);
      }
    });

    // Try to get routes grouped by deposit
    const routesByDeposit = new Map<number, RouteByDepositDTO[]>();
    try {
      const withRoutesData = await api.get<Record<string, unknown> | Record<string, unknown>[]>("/bff/deposits/with-routes");

      // withRoutesData can be:
      // 1. [ { routeId, routeName, depositId, ... }, ... ] (Flat array of routes)
      // 2. [ { depositId, depositName, routes: [...] }, ... ] (Nested deposits with routes)
      // 3. { deposits: [ { depositId, depositName, routes: [...] }, ... ] } (Nested with wrapper)

      const rawData: Array<Record<string, unknown>> = Array.isArray(withRoutesData)
        ? withRoutesData
        : Array.isArray((withRoutesData as Record<string, unknown> | undefined)?.deposits)
          ? ((withRoutesData as Record<string, unknown>).deposits as Array<Record<string, unknown>>)
          : Array.isArray((withRoutesData as Record<string, unknown> | undefined)?.data)
            ? ((withRoutesData as Record<string, unknown>).data as Array<Record<string, unknown>>)
            : [];

      rawData.forEach((item) => {
        // Case 1: Flat array of routes
        if (!Array.isArray(item?.routes) && item?.depositId) {
          const depId = Number(item.depositId);
          if (!routesByDeposit.has(depId)) {
            routesByDeposit.set(depId, []);
          }

          const mapped: RouteByDepositDTO = {
            routeId: Number(item?.routeId ?? 0),
            routeName: String(item?.routeName ?? item?.routeDefaultName ?? ""),
            active: Boolean(item?.active ?? true),
            customerId: Number(item?.customerId ?? 0),
            depositId: depId,
            serviceTypeId: Number(item?.serviceTypeId ?? 0),
            isFlex: item?.isFlex as boolean | undefined,
            routeDefaultId: item?.routeDefaultId as number | undefined,
            routeDefaultName: item?.routeDefaultName as string | undefined,
          };

          // Filter flex if requested
          if (options?.onlyNonFlex === true && mapped.isFlex === true) return;

          routesByDeposit.get(depId)!.push(mapped);
        }
        // Case 2 & 3: Array of deposits with nested routes
        else if (Array.isArray(item?.routes) && item?.depositId) {
          const depId = Number(item.depositId);
          const routesRaw: Array<Record<string, unknown>> = item.routes as Array<Record<string, unknown>>;

          let mappedRoutes: RouteByDepositDTO[] = routesRaw.map((r) => ({
            routeId: Number(r?.routeId ?? 0),
            routeName: String(r?.routeName ?? r?.routeDefaultName ?? ""),
            active: Boolean(r?.active ?? true),
            customerId: Number(r?.customerId ?? 0),
            depositId: depId,
            serviceTypeId: Number(r?.serviceTypeId ?? 0),
            isFlex: r?.isFlex as boolean | undefined,
            routeDefaultId: r?.routeDefaultId as number | undefined,
            routeDefaultName: r?.routeDefaultName as string | undefined,
          }));

          if (options?.onlyNonFlex === true) {
            mappedRoutes = mappedRoutes.filter((r) => r.isFlex === false);
          }

          routesByDeposit.set(depId, mappedRoutes);
        }
      });
    } catch (innerErr) {
      console.warn("[fetchDepositsWithRoutesFull] /with-routes failed, falling back to /bff/routes:", innerErr);
    }

    // Fallback route source if aggregated did not populate anything
    if (routesByDeposit.size === 0) {
      const routes = await api.get<Route[]>("/bff/routes");
      routes.forEach((route) => {
        const depositId = route.depositId ?? 0;
        if (!depositId) return;
        if (!routesByDeposit.has(depositId)) {
          routesByDeposit.set(depositId, []);
        }

        const onlyNonFlex = options?.onlyNonFlex === true;
        if (onlyNonFlex) {
          const isFlex =
            route.isFlex === true ||
            ((route.isFlex === undefined || route.isFlex === null || route.isFlex === undefined) &&
              (route.routeName ?? "").trim().toLowerCase().startsWith("flex"));
          if (isFlex) return;
        }

        routesByDeposit.get(depositId)!.push({
          routeId: Number(route.routeId ?? 0),
          routeName: String(route.routeName ?? ""),
          active: route.active ?? true,
          customerId: Number(route.customerId ?? 0),
          depositId: depositId,
          serviceTypeId: Number(route.serviceTypeId ?? 0),
          isFlex: route.isFlex,
          routeDefaultId: route.routeDefaultId,
          routeDefaultName: route.routeDefaultName,
        });
      });
    }

    // Merge: ALWAYS return all deposits
    const result: DepositWithRoutesFullDTO[] = [];
    depositMap.forEach((depositInfo, depositId) => {
      result.push({
        ...depositInfo,
        routes: routesByDeposit.get(depositId) ?? [],
      });
    });

    result.sort((a, b) => a.depositId - b.depositId);
    return result;
  } catch (error) {
    console.error("Error fetching deposits with routes:", error);
    throw error;
  }
};

/**
 * Seeking all routes from the routes table
 * @returns Promise with array of routes
 */
export const fetchRoutes = async (): Promise<Route[]> => {
  try {
    return await api.get<Route[]>("/bff/routes");
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
};

/**
 * Fetches the NALC (Not Allocated) route configuration from the backend.
 * @returns Promise with the NALC Route object
 */
export const fetchNalcRoute = async (): Promise<Route> => {
  try {
    return await api.get<Route>("/bff/routes/nalc");
  } catch (error) {
    console.error("Error fetching NALC route:", error);
    throw error;
  }
};

/**
 * Busca rotas agrupadas por depósito
 * @returns Promise com array de depósitos contendo suas rotas
 */
export const fetchRoutesByDeposit = async (): Promise<DepositWithRoutesDTO[]> => {
  try {
    // Fetch routes and deposits in parallel
    const [routes, deposits] = await Promise.all([
      api.get<Route[]>("/bff/routes"),
      api.get<DepositDTO[]>("/bff/deposits"),
    ]);

    // Create a map of depositId to depositName and isPhysical
    const depositMap = new Map<number, { name: string; isPhysical?: boolean }>();
    deposits.forEach((deposit) => {
      const depositId = deposit.depositId;
      const depositName = deposit.depositName ?? "";
      if (depositId) {
        depositMap.set(depositId, { name: depositName, isPhysical: deposit.isPhysical });
      }
    });

    // Group routes by depositId
    const routesByDeposit = new Map<number, RouteByDepositDTO[]>();

    routes.forEach((route) => {
      const depositId = route.depositId ?? 0;
      if (!routesByDeposit.has(depositId)) {
        routesByDeposit.set(depositId, []);
      }

      const routeDTO: RouteByDepositDTO = {
        routeId: Number(route.routeId ?? 0),
        routeName: String(route.routeName ?? ""),
        active: route.active ?? true,
        customerId: Number(route.customerId ?? 0),
        depositId: depositId,
        serviceTypeId: Number(route.serviceTypeId ?? 0),
        isFlex: route.isFlex,
        routeDefaultId: route.routeDefaultId,
        routeDefaultName: route.routeDefaultName,
      };

      routesByDeposit.get(depositId)!.push(routeDTO);
    });

    // Build the result array
    const result: DepositWithRoutesDTO[] = [];

    routesByDeposit.forEach((routeList, depositId) => {
      const depositInfo = depositMap.get(depositId);
      if (depositInfo !== undefined) {
        result.push({
          depositId,
          depositName: depositInfo.name,
          isPhysical: depositInfo.isPhysical,
          routes: routeList,
        });
      }
    });

    result.sort((a, b) => a.depositId - b.depositId);
    return result;
  } catch (error) {
    console.error("Error fetching routes by deposit:", error);
    throw error;
  }
};

/**
 * Updates a route by id
 */
export const updateRoute = async (
  routeId: number,
  routeData: Partial<Route>
): Promise<Route> => {
  try {
    return await api.patch<Route>(`/bff/routes/${routeId}`, routeData);
  } catch (error) {
    console.error("Error updating route:", error);
    throw error;
  }
};

/**
 * Deletes a route by id
 */
export const deleteRoute = async (routeId: number): Promise<void> => {
  try {
    await api.delete(`/bff/routes/${routeId}`);
  } catch (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
};

