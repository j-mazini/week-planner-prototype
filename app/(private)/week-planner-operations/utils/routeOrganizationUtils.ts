/**
 * Route Organization Utilities
 * 
 * Organizes routes by category (CORE and FLEX) for display.
 */

import type { ExtendedRoute } from './routeDistributionUtils';
import { getRouteName } from './routeDistributionUtils';
import { isFlexRoute } from './flexRouteUtils';

export interface OrganizedRoutes {
  core: ExtendedRoute[];
  flex: ExtendedRoute[];
}

/**
 * Organizes routes into CORE and FLEX categories
 * 
 * @param routes - Array of routes to organize
 * @returns Object with core and flex arrays
 */
export function organizeRoutesByCategory(routes: ExtendedRoute[]): OrganizedRoutes {
  const organized: OrganizedRoutes = {
    core: [],
    flex: [],
  };

  routes.forEach(route => {
    if (isFlexRoute(route)) {
      organized.flex.push(route);
    } else {
      organized.core.push(route);
    }
  });

  // Sort routes by name
  const sortRoute = (a: ExtendedRoute, b: ExtendedRoute) => {
    const nameA = getRouteName(a);
    const nameB = getRouteName(b);
    return nameA.localeCompare(nameB);
  };

  organized.core.sort(sortRoute);
  organized.flex.sort(sortRoute);

  return organized;
}

/**
 * Filters routes based on visibility state
 * 
 * @param routes - Array of routes to filter
 * @param showFlex - Whether to show flex routes
 * @returns Filtered array of routes
 */
export function filterRoutesByVisibility(
  routes: ExtendedRoute[],
  showFlex: boolean
): ExtendedRoute[] {
  if (showFlex) {
    return routes; // Show all routes
  }

  // Show only CORE routes
  return routes.filter(route => !isFlexRoute(route));
}

/**
 * Gets organized routes filtered by visibility
 * 
 * @param routes - Array of routes
 * @param showFlex - Whether to show flex routes
 * @returns Organized routes (may have empty flex array if hidden)
 */
export function getOrganizedRoutes(
  routes: ExtendedRoute[],
  showFlex: boolean
): OrganizedRoutes {
  const organized = organizeRoutesByCategory(routes);
  
  if (!showFlex) {
    organized.flex = [];
  }

  return organized;
}

