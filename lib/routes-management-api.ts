import { api } from "./api-client";

export interface RouteManagement {
  id: string;
  routeId?: number;
  routeName?: string;
  type: "Child" | "Flex";
  vendor: string;
  postcodes: string[];
  targetDel: number;
  targetPu: number;
  puCutoff: string;
  dificultLevel: number;
  notes: string;
  flexIn: string;
  flexOut: string;
  meetAddress: string;
  meetPostcode: string;
  meetTime: string;
  sortStart: string;
  sortFinish: string;
  timeOnRoute: string;
  arriveTime: string;
  break: number;
  sporhTarget: number;
  avgMon: number;
  avgTue: number;
  avgWed: number;
  avgThu: number;
  avgFri: number;
  loopId: string;
  active?: boolean;
  customerId?: number;
  depositId?: number;
  serviceTypeId?: number;
  isFlex?: boolean;
}

export interface RoutesByLoopResponse {
  [loopId: string]: RouteManagement[];
}

interface BackendRoute {
  routeId?: number;
  routeName?: string;
  active?: boolean;
  customerId?: number;
  depositId?: number;
  serviceTypeId?: number;
  isFlex?: boolean;
}

const emptyRouteDefaults = {
  postcodes: [] as string[],
  targetDel: 0,
  targetPu: 0,
  puCutoff: "",
  dificultLevel: 0,
  notes: "",
  flexIn: "",
  flexOut: "",
  meetAddress: "",
  meetPostcode: "",
  meetTime: "",
  sortStart: "",
  sortFinish: "",
  timeOnRoute: "",
  arriveTime: "",
  break: 0,
  sporhTarget: 0,
  avgMon: 0,
  avgTue: 0,
  avgWed: 0,
  avgThu: 0,
  avgFri: 0,
};

const mapBackendRoute = (route: BackendRoute): RouteManagement => {
  const routeName = route.routeName ?? "";
  const isFlex = route.isFlex === true || routeName.trim().toLowerCase().startsWith("flex");

  return {
    ...emptyRouteDefaults,
    id: String(route.routeId ?? ""),
    routeId: route.routeId,
    routeName,
    type: isFlex ? "Flex" : "Child",
    vendor: routeName,
    loopId: String(route.serviceTypeId ?? route.depositId ?? "unassigned"),
    active: route.active,
    customerId: route.customerId,
    depositId: route.depositId,
    serviceTypeId: route.serviceTypeId,
    isFlex,
  };
};

const toBackendPayload = (routeData: Partial<RouteManagement>): Partial<BackendRoute> => {
  const loopServiceTypeId = routeData.loopId ? Number(routeData.loopId) : undefined;
  const serviceTypeId = routeData.serviceTypeId ?? (
    Number.isFinite(loopServiceTypeId) ? loopServiceTypeId : undefined
  );
  const isFlex = routeData.isFlex ?? (
    routeData.type !== undefined ? routeData.type === "Flex" : undefined
  );

  return {
    routeName: routeData.routeName ?? routeData.vendor,
    active: routeData.active,
    customerId: routeData.customerId,
    depositId: routeData.depositId,
    serviceTypeId,
    isFlex,
  };
};

/**
 * Busca todas as rotas reais do backend e as agrupa por serviceTypeId/loopId.
 */
export const fetchRoutesByLoop = async (): Promise<RoutesByLoopResponse> => {
  try {
    const routes = await api.get<BackendRoute[]>("/bff/routes");

    return routes.reduce<RoutesByLoopResponse>((acc, route) => {
      const mapped = mapBackendRoute(route);
      if (!acc[mapped.loopId]) {
        acc[mapped.loopId] = [];
      }
      acc[mapped.loopId].push(mapped);
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching routes by loop:", error);
    throw error;
  }
};

/**
 * Cria uma nova rota usando o endpoint backend canônico.
 */
export const createRoute = async (routeData: Partial<RouteManagement>): Promise<RouteManagement> => {
  try {
    const data = await api.post<BackendRoute>("/bff/routes", toBackendPayload(routeData));
    return mapBackendRoute(data);
  } catch (error) {
    console.error("Error creating route:", error);
    throw error;
  }
};

/**
 * Atualiza uma rota existente usando PATCH /bff/routes/:routeId.
 */
export const updateRoute = async (
  routeId: string,
  loopId: string,
  routeData: Partial<RouteManagement>
): Promise<RouteManagement> => {
  try {
    const data = await api.patch<BackendRoute>(`/bff/routes/${routeId}`, toBackendPayload({
      ...routeData,
      loopId,
    }));
    return mapBackendRoute(data);
  } catch (error) {
    console.error("Error updating route:", error);
    throw error;
  }
};

/**
 * Deleta uma rota usando DELETE /bff/routes/:routeId.
 */
export const deleteRoute = async (routeId: string, _loopId: string): Promise<void> => {
  try {
    await api.delete(`/bff/routes/${routeId}`);
  } catch (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
};
