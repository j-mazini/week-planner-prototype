import type { Route } from '@/lib/api/routes';

/**
 * Checks if a route is a flex route.
 * Uses is_flex property from API when available (is_flex === true).
 * Falls back to route name starting with "flex" (case insensitive) for backwards compatibility.
 */
export function isFlexRoute(route: Route): boolean {
  if (!route) return false;
  
  const isFlexProp = route.isFlex;
  if (typeof isFlexProp === 'boolean') {
    return isFlexProp;
  }
  
  const name = route.routeName ?? route.routeDefaultName ?? '';
  if (!name) return false;
  
  const routeNameLower = String(name).trim().toLowerCase();
  return routeNameLower.startsWith('flex');
}

/**
 * Checks if a route is a core route (isFlex === false).
 * Core routes are shown by default; flex routes only when they have week-planner items.
 */
export function isCoreRoute(route: Route): boolean {
  return !isFlexRoute(route);
}

