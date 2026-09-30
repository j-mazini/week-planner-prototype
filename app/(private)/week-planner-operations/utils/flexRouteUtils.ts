/**
 * Flex Route Management Utilities
 * 
 * This module implements the logic for adding and removing flex routes
 * based on the planner.html structure.
 */

import type { FlexRoute } from '../types/planner';
import type { ExtendedRoute } from './routeDistributionUtils';
import { getRouteName } from './routeDistributionUtils';

export interface FlexRouteTemplate {
  id: string | number;
  name: string;
  loop: string; // 'dy1', 'dy2', 'lse', 'mse', etc.
  depot?: 'DCY' | 'LSE' | 'MSE';
}

export interface FlexRouteWithTemplate extends ExtendedRoute {
  isFlex: true;
  templateId: string | number;
  variant: 'flex';
}

/**
 * Checks if a route is a flex route
 */
export function isFlexRoute(route: ExtendedRoute): boolean {
  if ('isFlex' in route && route.isFlex === true) return true;
  if ('variant' in route && route.variant === 'flex') return true;
  const routeName = getRouteName(route).toUpperCase();
  return routeName.includes('FLEX') || routeName.startsWith('FLEX');
}

/**
 * Gets available flex route templates for a specific loop
 * Filters out templates that are already active (already in loopRoutes)
 * 
 * @param templates - Array of flex route templates
 * @param loopKey - Loop key (e.g., 'dy1', 'dy2', 'lse-ll3')
 * @param activeRoutes - Array of currently active routes
 * @returns Array of available templates
 */
export function getAvailableFlexTemplates(
  templates: FlexRouteTemplate[],
  loopKey: string,
  activeRoutes: ExtendedRoute[]
): FlexRouteTemplate[] {
  // Get active template IDs
  const activeTemplateIds = new Set(
    activeRoutes
      .filter(route => isFlexRoute(route) && 'templateId' in route)
      .map(route => ('templateId' in route ? route.templateId : null))
      .filter((id): id is string | number => id !== null && id !== undefined)
  );

  // Filter templates for this loop that aren't already active
  return templates.filter(
    template => 
      template.loop === loopKey && 
      !activeTemplateIds.has(template.id)
  );
}

/**
 * Creates a new flex route from a template
 * 
 * @param template - Flex route template
 * @returns New flex route object
 */
export function createFlexRouteFromTemplate(
  template: FlexRouteTemplate
): FlexRouteWithTemplate {
  const routeId = typeof template.id === 'number' 
    ? `flex-${template.id}-${Date.now()}`
    : `${template.id}-${Date.now()}`;

  return {
    id: routeId,
    name: template.name,
    type: 'flex',
    variant: 'flex',
    isFlex: true,
    templateId: template.id,
    loopType: template.loop.toUpperCase() as Uppercase<string>,
    depot: template.depot,
  };
}

/**
 * Adds a flex route to the routes array
 * 
 * @param routes - Current array of routes
 * @param template - Flex route template to create route from
 * @returns New array with the flex route added
 */
export function addFlexRoute(
  routes: ExtendedRoute[],
  template: FlexRouteTemplate
): ExtendedRoute[] {
  const newRoute = createFlexRouteFromTemplate(template);
  
  // Check if route already exists
  const existingIndex = routes.findIndex(
    route => 
      isFlexRoute(route) && 
      'templateId' in route && 
      route.templateId === template.id
  );

  if (existingIndex >= 0) {
    // Route already exists, return unchanged
    return routes;
  }

  return [...routes, newRoute];
}

/**
 * Removes a flex route from the routes array
 * 
 * @param routes - Current array of routes
 * @param routeId - ID of the flex route to remove
 * @returns Object with updated routes and removed route info
 */
export function removeFlexRoute(
  routes: ExtendedRoute[],
  routeId: string | number
): {
  routes: ExtendedRoute[];
  removedRoute: ExtendedRoute | null;
} {
  const routeIndex = routes.findIndex(route => {
    const id = 'id' in route ? route.id : ('routeId' in route ? route.routeId : undefined);
    return id === routeId;
  });

  if (routeIndex === -1) {
    return { routes, removedRoute: null };
  }

  const route = routes[routeIndex];
  
  // Only remove if it's a flex route
  if (!isFlexRoute(route)) {
    return { routes, removedRoute: null };
  }

  const updatedRoutes = [...routes];
  const removedRoute = updatedRoutes.splice(routeIndex, 1)[0];

  return {
    routes: updatedRoutes,
    removedRoute,
  };
}

/**
 * Gets all flex routes from a routes array
 * 
 * @param routes - Array of routes
 * @returns Array of flex routes
 */
export function getFlexRoutes(routes: ExtendedRoute[]): ExtendedRoute[] {
  return routes.filter(isFlexRoute);
}

/**
 * Gets flex routes for a specific loop
 * 
 * @param routes - Array of routes
 * @param loopKey - Loop key (e.g., 'dy1', 'dy2')
 * @returns Array of flex routes for the loop
 */
export function getFlexRoutesByLoop(
  routes: ExtendedRoute[],
  loopKey: string
): ExtendedRoute[] {
  return routes.filter(route => {
    if (!isFlexRoute(route)) return false;
    
    // Check loop property
    if ('loop' in route && route.loop === loopKey) return true;
    if ('loopType' in route) {
      const loopType = String(route.loopType).toLowerCase();
      return loopType === loopKey || loopType.includes(loopKey);
    }
    
    // Check route name pattern
    const routeName = getRouteName(route).toUpperCase();

    if (loopKey === 'dy1' && routeName.startsWith('DY1')) return true;
    if (loopKey === 'dy2' && routeName.startsWith('DY2')) return true;
    if (loopKey === 'lse-ll3' && routeName.startsWith('LL3')) return true;
    if (loopKey === 'lse-ll4' && routeName.startsWith('LL4')) return true;
    if (loopKey === 'lse-lm9' && routeName.startsWith('LM9')) return true;
    if (loopKey === 'mse-md7' && routeName.startsWith('MD7')) return true;
    if (loopKey === 'mse-md9' && routeName.startsWith('MD9')) return true;
    
    return false;
  });
}

/**
 * Validates if a flex route can be added
 * 
 * @param template - Flex route template
 * @param activeRoutes - Currently active routes
 * @returns Validation result
 */
export function validateFlexRouteAddition(
  template: FlexRouteTemplate,
  activeRoutes: ExtendedRoute[]
): {
  valid: boolean;
  error?: string;
} {
  // Check if template already exists
  const existingRoute = activeRoutes.find(
    route => 
      isFlexRoute(route) && 
      'templateId' in route && 
      route.templateId === template.id
  );

  if (existingRoute) {
    return {
      valid: false,
      error: `Flex route "${template.name}" is already active.`,
    };
  }

  return { valid: true };
}

/**
 * Validates if a flex route can be removed
 * 
 * @param routeId - ID of the route to remove
 * @param routes - Array of routes
 * @param assignments - Array of assignments (to check if route has assignments)
 * @returns Validation result
 */
export function validateFlexRouteRemoval(
  routeId: string | number,
  routes: ExtendedRoute[],
  assignments: Array<{ routeId?: string | number; [key: string]: unknown }> = []
): {
  valid: boolean;
  error?: string;
  hasAssignments: boolean;
} {
  const route = routes.find(r => {
    const id = 'id' in r ? r.id : ('routeId' in r ? r.routeId : undefined);
    return id === routeId;
  });

  if (!route) {
    return {
      valid: false,
      error: 'Route not found.',
      hasAssignments: false,
    };
  }

  if (!isFlexRoute(route)) {
    return {
      valid: false,
      error: 'Route is not a flex route.',
      hasAssignments: false,
    };
  }

  // Check if route has assignments
  const routeAssignments = assignments.filter(a => {
    const assignmentRouteId = a.routeId;
    const routeIdValue = 'id' in route ? route.id : ('routeId' in route ? route.routeId : undefined);
    return assignmentRouteId === routeIdValue;
  });

  return {
    valid: true,
    hasAssignments: routeAssignments.length > 0,
  };
}

/**
 * Converts FlexRoute type to FlexRouteTemplate
 */
export function flexRouteToTemplate(flexRoute: FlexRoute): FlexRouteTemplate {
  return {
    id: flexRoute.id,
    name: flexRoute.name,
    loop: flexRoute.loopType.toLowerCase(),
    depot: flexRoute.depot,
  };
}


