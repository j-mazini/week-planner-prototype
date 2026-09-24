/**
 * Route Distribution and Loop Organization Utilities
 * 
 * This module implements the logic for distributing routes and organizing loops
 * based on the planner.html structure. It groups routes by depot and loop type,
 * similar to the original planner implementation.
 */

import type { Route } from '../types/planner';

export type DepotKey = 'dcy' | 'lcy' | 'mse';
export type LoopType = 'dy1' | 'dy2' | 'lse-ll3' | 'lse-ll4' | 'lse-lm9' | 'mse-md7' | 'mse-md9';

/**
 * Extended Route type that supports both planner Route format and lib/routes Route format
 */
export type ExtendedRoute = Route | {
  routeId?: number;
  routeName?: string;
  [key: string]: unknown;
};

/**
 * Helper to get route name from either format
 */
export function getRouteName(route: ExtendedRoute): string {
  if ('name' in route && route.name) return route.name;
  if ('routeName' in route && route.routeName) return route.routeName;
  return '';
}

/**
 * Helper to get route ID from either format
 */
export function getRouteId(route: ExtendedRoute): number | string | undefined {
  if ('id' in route) return route.id;
  if ('routeId' in route) return route.routeId;
  return undefined;
}

export interface LoopSectionConfig {
  key: LoopType;
  title: string;
  filter: (route: ExtendedRoute) => boolean;
  depot: DepotKey;
}

export interface DepotGroup {
  title: string;
  loops: LoopGroup[];
  adHoc: AdHocGroup[];
}

export interface LoopGroup {
  key: LoopType;
  title: string;
  bodyId: string;
  routes: ExtendedRoute[];
  isHidden: boolean;
}

export interface AdHocGroup {
  depot: DepotKey;
  title: string;
  bodyId: string;
  routes: ExtendedRoute[];
  isHidden: boolean;
}

/**
 * Configuration for loop sections matching the planner.html structure
 */
export const LOOP_SECTION_CONFIGS: LoopSectionConfig[] = [
  {
    key: 'dy1',
    title: 'DY1 Loops',
    filter: (route) => {
      const routeName = getRouteName(route).toUpperCase();
      const loopType = ('loopType' in route ? route.loopType : '') || '';
      return String(loopType).toUpperCase() === 'DY1' || routeName.startsWith('DY1');
    },
    depot: 'dcy',
  },
  {
    key: 'dy2',
    title: 'DY2 Loops',
    filter: (route) => {
      const routeName = getRouteName(route).toUpperCase();
      const loopType = ('loopType' in route ? route.loopType : '') || '';
      return String(loopType).toUpperCase() === 'DY2' || routeName.startsWith('DY2');
    },
    depot: 'dcy',
  },
  {
    key: 'lse-ll3',
    title: 'LL3 Loops',
    filter: (route) => {
      const routeName = getRouteName(route).toUpperCase();
      const depot = ('depot' in route ? route.depot : '') || '';
      return (String(depot).toUpperCase() === 'LSE' || String(depot).toUpperCase() === 'LCY') && routeName.startsWith('LL3');
    },
    depot: 'lcy',
  },
  {
    key: 'lse-ll4',
    title: 'LL4 Loops',
    filter: (route) => {
      const routeName = getRouteName(route).toUpperCase();
      const depot = ('depot' in route ? route.depot : '') || '';
      return (String(depot).toUpperCase() === 'LSE' || String(depot).toUpperCase() === 'LCY') && routeName.startsWith('LL4');
    },
    depot: 'lcy',
  },
  {
    key: 'lse-lm9',
    title: 'LM9 Loops',
    filter: (route) => {
      const routeName = getRouteName(route).toUpperCase();
      const depot = ('depot' in route ? route.depot : '') || '';
      return (String(depot).toUpperCase() === 'LSE' || String(depot).toUpperCase() === 'LCY') && routeName.startsWith('LM9');
    },
    depot: 'lcy',
  },
  {
    key: 'mse-md7',
    title: 'MD7 Loops',
    filter: (route) => {
      const routeName = getRouteName(route).toUpperCase();
      const depot = ('depot' in route ? route.depot : '') || '';
      return String(depot).toUpperCase() === 'MSE' && routeName.startsWith('MD7');
    },
    depot: 'mse',
  },
  {
    key: 'mse-md9',
    title: 'MD9 Loops',
    filter: (route) => {
      const routeName = getRouteName(route).toUpperCase();
      const depot = ('depot' in route ? route.depot : '') || '';
      return String(depot).toUpperCase() === 'MSE' && routeName.startsWith('MD9');
    },
    depot: 'mse',
  },
];

/**
 * Ad-Hoc service configurations by depot
 */
export const AD_HOC_CONFIGS = [
  { depot: 'dcy' as DepotKey, title: 'Ad-Hoc Services' },
  { depot: 'lcy' as DepotKey, title: 'Ad-Hoc Services' },
  { depot: 'mse' as DepotKey, title: 'Ad-Hoc Services' },
];

/**
 * Sort function for loop routes (similar to planner.html sortLoopRoutes)
 * Sorts by variant (core first, then flex), then by name
 */
export function sortLoopRoutes(a: ExtendedRoute, b: ExtendedRoute): number {
  // Core routes come before flex routes
  const variantA = ('variant' in a ? a.variant : '') || '';
  const variantB = ('variant' in b ? b.variant : '') || '';
  const variantALower = String(variantA).toLowerCase();
  const variantBLower = String(variantB).toLowerCase();
  
  if (variantALower === 'core' && variantBLower !== 'core') return -1;
  if (variantALower !== 'core' && variantBLower === 'core') return 1;
  
  // If same variant, sort by name
  const nameA = getRouteName(a).toUpperCase();
  const nameB = getRouteName(b).toUpperCase();
  return nameA.localeCompare(nameB);
}

/**
 * Organizes routes into depot groups with loops and ad-hoc services
 * This is the main distribution logic matching planner.html renderDailyStructure
 * 
 * @param loopRoutes - Array of loop routes (DY1, DY2, LSE, MSE)
 * @param rotaRoutes - Array of rota routes (Core/Flex routes)
 * @param adHocServices - Array of ad-hoc services
 * @param hiddenLoopSections - Set of hidden loop section keys
 * @param hiddenAdHocSections - Set of hidden ad-hoc section keys
 * @returns Object with depot groups containing loops and ad-hoc services
 */
export function organizeRoutesByDepot(
  loopRoutes: ExtendedRoute[],
  rotaRoutes: ExtendedRoute[],
  adHocServices: ExtendedRoute[],
  hiddenLoopSections: Set<string> = new Set(),
  hiddenAdHocSections: Set<string> = new Set()
): Record<DepotKey, DepotGroup> {
  // Combine all routes (matching planner.html logic)
  const allRoutes = [...loopRoutes, ...rotaRoutes];

  // Initialize depot groups
  const depotGroups: Record<DepotKey, DepotGroup> = {
    dcy: { title: 'DCY', loops: [], adHoc: [] },
    lcy: { title: 'LCY', loops: [], adHoc: [] },
    mse: { title: 'MSE', loops: [], adHoc: [] },
  };

  // Organize loops and routes by depot
  LOOP_SECTION_CONFIGS.forEach((config) => {
    const routes = allRoutes.filter(config.filter).sort(sortLoopRoutes);
    const isHidden = config.key && hiddenLoopSections.has(config.key);

    if (routes.length > 0 || isHidden) {
      const bodyId = `loops-${config.key}`;
      depotGroups[config.depot].loops.push({
        key: config.key,
        title: config.title,
        bodyId: bodyId,
        routes: routes,
        isHidden: isHidden,
      });
    }
  });

  // Organize Ad-Hoc by depot
  AD_HOC_CONFIGS.forEach((config) => {
    const depotKey = config.depot.toLowerCase() as DepotKey;
    const routes = adHocServices
      .filter((service) => {
        const serviceDepot = ('depot' in service ? service.depot : '') || '';
        return String(serviceDepot).toLowerCase() === depotKey;
      })
      .map((service) => ({
        ...service,
        type: 'ad-hoc' as const,
      }))
      .sort(sortLoopRoutes);

    const isHidden = depotKey && hiddenAdHocSections.has(depotKey);

    if (routes.length > 0 || isHidden) {
      const bodyId = `ad-hoc-${depotKey}`;
      depotGroups[depotKey].adHoc.push({
        depot: depotKey,
        title: config.title,
        bodyId: bodyId,
        routes: routes,
        isHidden: isHidden,
      });
    }
  });

  return depotGroups;
}

/**
 * Filters routes by loop type
 * 
 * @param routes - Array of routes to filter
 * @param loopType - Loop type to filter by
 * @returns Filtered array of routes
 */
export function filterRoutesByLoopType(routes: ExtendedRoute[], loopType: LoopType): ExtendedRoute[] {
  const config = LOOP_SECTION_CONFIGS.find((c) => c.key === loopType);
  if (!config) return [];
  return routes.filter(config.filter).sort(sortLoopRoutes);
}

/**
 * Gets all routes for a specific depot
 * 
 * @param loopRoutes - Array of loop routes
 * @param rotaRoutes - Array of rota routes
 * @param adHocServices - Array of ad-hoc services
 * @param depot - Depot key
 * @returns Array of routes for the depot
 */
export function getRoutesByDepot(
  loopRoutes: ExtendedRoute[],
  rotaRoutes: ExtendedRoute[],
  adHocServices: ExtendedRoute[],
  depot: DepotKey
): ExtendedRoute[] {
  const allRoutes = [...loopRoutes, ...rotaRoutes];
  const depotRoutes: Route[] = [];

  // Get loop routes for this depot
  LOOP_SECTION_CONFIGS.forEach((config) => {
    if (config.depot === depot) {
      const routes = allRoutes.filter(config.filter);
      depotRoutes.push(...routes);
    }
  });

  // Get ad-hoc services for this depot
  const depotAdHoc = adHocServices.filter((service) => {
    const serviceDepot = ('depot' in service ? service.depot : '') || '';
    return String(serviceDepot).toLowerCase() === depot;
  });

  depotRoutes.push(...depotAdHoc);

  return depotRoutes.sort(sortLoopRoutes);
}

/**
 * Checks if a route belongs to a specific loop type
 * 
 * @param route - Route to check
 * @param loopType - Loop type to check against
 * @returns True if route belongs to the loop type
 */
export function isRouteInLoopType(route: ExtendedRoute, loopType: LoopType): boolean {
  const config = LOOP_SECTION_CONFIGS.find((c) => c.key === loopType);
  if (!config) return false;
  return config.filter(route);
}

/**
 * Gets the depot for a route based on its properties
 * 
 * @param route - Route to analyze
 * @returns Depot key or null if cannot be determined
 */
export function getRouteDepot(route: ExtendedRoute): DepotKey | null {
  // Check explicit depot property
  if ('depot' in route && route.depot) {
    const depot = String(route.depot).toLowerCase();
    if (depot === 'dcy' || depot === 'lcy' || depot === 'mse') {
      return depot as DepotKey;
    }
  }

  // Infer from route name or loop type
  const routeName = getRouteName(route).toUpperCase();
  const loopType = ('loopType' in route ? route.loopType : '') || '';
  const loopTypeUpper = String(loopType).toUpperCase();

  if (routeName.startsWith('DY1') || routeName.startsWith('DY2') || loopTypeUpper === 'DY1' || loopTypeUpper === 'DY2') {
    return 'dcy';
  }

  if (routeName.startsWith('LL3') || routeName.startsWith('LL4') || routeName.startsWith('LM9')) {
    return 'lcy';
  }

  if (routeName.startsWith('MD7') || routeName.startsWith('MD9')) {
    return 'mse';
  }

  return null;
}

/**
 * Gets the loop type for a route based on its properties
 * 
 * @param route - Route to analyze
 * @returns Loop type or null if cannot be determined
 */
export function getRouteLoopType(route: ExtendedRoute): LoopType | null {
  const routeName = getRouteName(route).toUpperCase();
  const loopType = ('loopType' in route ? route.loopType : '') || '';
  const loopTypeUpper = String(loopType).toUpperCase();

  if (routeName.startsWith('DY1') || loopTypeUpper === 'DY1') return 'dy1';
  if (routeName.startsWith('DY2') || loopTypeUpper === 'DY2') return 'dy2';
  if (routeName.startsWith('LL3')) return 'lse-ll3';
  if (routeName.startsWith('LL4')) return 'lse-ll4';
  if (routeName.startsWith('LM9')) return 'lse-lm9';
  if (routeName.startsWith('MD7')) return 'mse-md7';
  if (routeName.startsWith('MD9')) return 'mse-md9';

  return null;
}


