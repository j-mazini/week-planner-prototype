import type { Route } from '@/lib/api/routes';
import { isFlexRoute } from './depotOrganizationUtils';

export interface OrganizedRoutes {
  core: Route[];
  flex: Route[];
}

/**
 * Organizes routes into CORE and FLEX categories
 * 
 * @param routes - Array of routes to organize
 * @param showFlex - Whether to show flex routes
 * @returns Object with core and flex arrays
 */
export function getOrganizedRoutes(
  routes: Route[],
  showFlex: boolean = true
): OrganizedRoutes {
  const organized: OrganizedRoutes = {
    core: [],
    flex: [],
  };

  routes.forEach(route => {
    if (isFlexRoute(route)) {
      if (showFlex) {
        organized.flex.push(route);
      }
    } else {
      organized.core.push(route);
    }
  });

  // Sort routes by name
  const sortRoute = (a: Route, b: Route) => {
    const nameA = (a.routeName || '').toLowerCase();
    const nameB = (b.routeName || '').toLowerCase();
    return nameA.localeCompare(nameB);
  };

  organized.core.sort(sortRoute);
  organized.flex.sort(sortRoute);

  return organized;
}

/**
 * Filters ad-hoc routes by depot key
 * 
 * @param routes - Array of routes to filter
 * @param depotKey - Depot key to filter by (e.g., 'LCY', 'MSE', 'LSE')
 * @returns Filtered array of ad-hoc routes for the depot
 */
export function filterAdHocRoutesByDepot(
  routes: Route[],
  depotKey: string
): Route[] {
  const depotKeyLower = depotKey.toLowerCase();
  
  return routes.filter(route => {
    const routeName = (route.routeName || '').toLowerCase();
    const isAdHoc = routeName.includes('adhoc') || 
                    routeName.includes('ad-hoc') ||
                    route.routeId === 55; // Include BRTE route (routeId 55)
    
    if (!isAdHoc) {
      return false;
    }

    // Check if route belongs to the depot by checking route name or depositId
    // Routes typically have depot prefix in their name (e.g., "LCY AdHoc Service")
    if (route.depositId) {
      // If we have depositId, we could match by deposit name, but for now
      // we'll match by route name containing depot key
      return routeName.includes(depotKeyLower);
    }

    // Fallback: match by route name containing depot key
    return routeName.includes(depotKeyLower);
  });
}


