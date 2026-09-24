/**
 * React Hook for managing Flex Routes
 * 
 * Provides functionality to add and remove flex routes
 * based on templates and active routes.
 */

import { useCallback, useMemo } from 'react';
import type { FlexRoute } from '../types/planner';
import type { ExtendedRoute } from '../utils/routeDistributionUtils';
import {
  getAvailableFlexTemplates,
  removeFlexRoute,
  getFlexRoutes,
  getFlexRoutesByLoop,
  validateFlexRouteAddition,
  validateFlexRouteRemoval,
  createFlexRouteFromTemplate,
  type FlexRouteTemplate,
} from '../utils/flexRouteUtils';
import { getSectionKeyForLoop } from '../utils/flexRouteVisibilityUtils';

export interface UseFlexRoutesOptions {
  templates: FlexRouteTemplate[] | FlexRoute[];
  routes: ExtendedRoute[];
  assignments?: Array<{ routeId?: string | number; [key: string]: unknown }>;
  onRouteAdded?: (route: ExtendedRoute) => void;
  onRouteRemoved?: (route: ExtendedRoute) => void;
  onVisibilityChanged?: (sectionKey: string, visible: boolean) => void;
}

export interface UseFlexRoutesReturn {
  // State
  flexRoutes: ExtendedRoute[];
  
  // Actions
  addRoute: (template: FlexRouteTemplate, loopKey: string) => {
    success: boolean;
    route?: ExtendedRoute;
    error?: string;
  };
  removeRoute: (routeId: string | number) => {
    success: boolean;
    route?: ExtendedRoute;
    error?: string;
  };
  
  // Queries
  getAvailableTemplates: (loopKey: string) => FlexRouteTemplate[];
  getFlexRoutesForLoop: (loopKey: string) => ExtendedRoute[];
  canAddRoute: (template: FlexRouteTemplate) => { valid: boolean; error?: string };
  canRemoveRoute: (routeId: string | number) => { valid: boolean; error?: string; hasAssignments: boolean };
}

/**
 * Hook for managing flex routes
 */
export function useFlexRoutes(options: UseFlexRoutesOptions): UseFlexRoutesReturn {
  const {
    templates,
    routes,
    assignments = [],
    onRouteAdded,
    onRouteRemoved,
    onVisibilityChanged,
  } = options;

  // Convert FlexRoute[] to FlexRouteTemplate[] if needed
  const normalizedTemplates = useMemo(() => {
    return templates.map(template => {
      if ('loopType' in template) {
        // It's a FlexRoute, convert to template
        return {
          id: template.id,
          name: template.name,
          loop: template.loopType.toLowerCase(),
          depot: template.depot,
        };
      }
      return template as FlexRouteTemplate;
    });
  }, [templates]);

  // Get all flex routes
  const flexRoutes = useMemo(() => {
    return getFlexRoutes(routes);
  }, [routes]);

  // Get available templates for a loop
  const getAvailableTemplates = useCallback(
    (loopKey: string): FlexRouteTemplate[] => {
      return getAvailableFlexTemplates(normalizedTemplates, loopKey, routes);
    },
    [normalizedTemplates, routes]
  );

  // Get flex routes for a specific loop
  const getFlexRoutesForLoop = useCallback(
    (loopKey: string): ExtendedRoute[] => {
      return getFlexRoutesByLoop(routes, loopKey);
    },
    [routes]
  );

  // Validate if a route can be added
  const canAddRoute = useCallback(
    (template: FlexRouteTemplate): { valid: boolean; error?: string } => {
      return validateFlexRouteAddition(template, routes);
    },
    [routes]
  );

  // Validate if a route can be removed
  const canRemoveRoute = useCallback(
    (routeId: string | number): { valid: boolean; error?: string; hasAssignments: boolean } => {
      return validateFlexRouteRemoval(routeId, routes, assignments);
    },
    [routes, assignments]
  );

  // Add a flex route
  const addRoute = useCallback(
    (template: FlexRouteTemplate, loopKey: string): {
      success: boolean;
      route?: ExtendedRoute;
      error?: string;
    } => {
      // Validate
      const validation = validateFlexRouteAddition(template, routes);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Check if template is available for this loop
      const availableTemplates = getAvailableFlexTemplates(normalizedTemplates, loopKey, routes);
      const isAvailable = availableTemplates.some(t => t.id === template.id);
      
      if (!isAvailable) {
        return {
          success: false,
          error: `Template "${template.name}" is not available for loop "${loopKey}" or is already active.`,
        };
      }

      // Create and add route
      const newRoute = createFlexRouteFromTemplate(template);
      
      // Ensure section visibility is enabled when adding a flex route
      const sectionKey = getSectionKeyForLoop(loopKey);
      if (sectionKey && onVisibilityChanged) {
        onVisibilityChanged(sectionKey, true);
      }
      
      // Callback
      if (onRouteAdded) {
        onRouteAdded(newRoute);
      }

      return {
        success: true,
        route: newRoute,
      };
    },
    [routes, normalizedTemplates, onRouteAdded, onVisibilityChanged]
  );

  // Remove a flex route
  const removeRoute = useCallback(
    (routeId: string | number): {
      success: boolean;
      route?: ExtendedRoute;
      error?: string;
    } => {
      // Validate
      const validation = validateFlexRouteRemoval(routeId, routes, assignments);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Remove route
      const result = removeFlexRoute(routes, routeId);
      
      if (!result.removedRoute) {
        return {
          success: false,
          error: 'Route not found or is not a flex route.',
        };
      }

      // Callback
      if (onRouteRemoved) {
        onRouteRemoved(result.removedRoute);
      }

      return {
        success: true,
        route: result.removedRoute,
      };
    },
    [routes, assignments, onRouteRemoved]
  );

  return {
    flexRoutes,
    addRoute,
    removeRoute,
    getAvailableTemplates,
    getFlexRoutesForLoop,
    canAddRoute,
    canRemoveRoute,
  };
}

