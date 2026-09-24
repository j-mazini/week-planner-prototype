"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Route } from '@/lib/api/routes';
import { isFlexRoute } from '../../utils/depotOrganizationUtils';
import RemoveFlexRouteModal from '../modals/RemoveFlexRouteModal';

type RouteLabelProps = {
  route: Route & {
    variant?: string;
    notes?: string;
    isFlex?: boolean;
    category?: string;
  };
  onRemoveFlexRoute?: (routeId: number) => void;
  onRemoveAdHoc?: (routeId: number) => void;
  onEditFlexRoute?: (route: Route) => void;
  onEditAdHocService?: (route: Route) => void;
  compact?: boolean; // For Management section with long names
  allowFlexibleHeight?: boolean; // Stretch to match row height (e.g. ADHOC services with multiple users)
  /** Calculated row height for uniform cell heights in a row (when flexible height is enabled) */
  rowHeight?: number;
};

const RouteLabel: React.FC<RouteLabelProps> = ({
  route,
  onRemoveFlexRoute,
  onRemoveAdHoc,
  onEditFlexRoute,
  onEditAdHocService,
  compact = false,
  allowFlexibleHeight = false,
  rowHeight,
}) => {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const notesText = (route.notes || '').trim();

  // Check if route is flex using both the isFlex property and the isFlexRoute utility function
  const routeIsFlex = route.isFlex === true || isFlexRoute(route);

  // Ad-hoc detection must be robust because many call sites don't set route.category.
  const routeNameLower = String(route.routeName || "").toLowerCase();
  const isAdHoc =
    (typeof route.category === "string" && route.category.toLowerCase() === "ad_hoc") ||
    routeNameLower.includes("adhoc") ||
    routeNameLower.includes("ad-hoc") ||
    route.routeId === 55 ||
    route.routeId === 57;
  
  // Show remove button if:
  // 1. It's an adhoc route AND we have onRemoveAdHoc handler
  // 2. It's a flex route AND we have onRemoveFlexRoute handler
  const shouldShowRemove = (isAdHoc && onRemoveAdHoc) || (routeIsFlex && onRemoveFlexRoute);

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (routeIsFlex && onRemoveFlexRoute && route.routeId) {
      // Open modal for flex routes
      setIsRemoveModalOpen(true);
    } else if (onRemoveAdHoc && route.routeId) {
      // Direct removal for ad-hoc
      onRemoveAdHoc(route.routeId);
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If there's an edit handler, use it instead of remove
    if (routeIsFlex && onEditFlexRoute) {
      onEditFlexRoute(route);
    } else if (isAdHoc && onEditAdHocService) {
      onEditAdHocService(route);
    } else if (routeIsFlex && onRemoveFlexRoute && route.routeId) {
      // Fallback to remove modal if no edit handler
      setIsRemoveModalOpen(true);
    }
  };

  const handleConfirmRemove = (routeId: number) => {
    if (onRemoveFlexRoute) {
      onRemoveFlexRoute(routeId);
    }
    setIsRemoveModalOpen(false);
  };

  const getTooltipTitle = () => {
    if (notesText) {
      return notesText;
    }
    if (routeIsFlex && onRemoveFlexRoute) {
      return 'Click to remove flex route from planner';
    }
    return '';
  };
  const bgColor = isAdHoc ? 'bg-orange-50' : 'bg-white';
  const hoverColor = isAdHoc ? 'hover:bg-orange-100' : 'hover:bg-slate-50';
  const borderColor = isAdHoc ? 'border-orange-500/20' : 'border-border/60';
  const textColor = isAdHoc ? 'text-orange-900 dark:text-orange-200' : 'text-foreground';

  // When allowFlexibleHeight is true, only set min-height to allow natural growth
  const heightClass = allowFlexibleHeight ? 'min-h-[60px]' : 'h-[60px]';
  const heightStyle = rowHeight ? { minHeight: `${rowHeight}px` } : undefined;
  return (
    <div
      className={`flex items-center justify-between ${compact ? 'px-2 py-1.5' : 'px-3 py-2'} ${bgColor} border-r ${borderColor} border-b ${borderColor} font-semibold text-xs ${heightClass} box-border transition-colors duration-200 relative overflow-hidden min-w-0 ${hoverColor} last:border-r-0`}
      style={heightStyle}
    >
      <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'} flex-1 min-w-0`} title={getTooltipTitle()}>
        {route.variant && (
          <span className={`text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap uppercase tracking-wider ${
            route.variant === 'flex' 
              ? 'bg-purple-100 text-purple-700 border border-purple-300' 
              : route.variant === 'core'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : isAdHoc
              ? 'bg-orange-100 text-orange-700 border border-orange-300'
              : ''
          }`}>
            {route.variant.toUpperCase()}
          </span>
        )}

        <span 
          className={`${compact ? 'text-[10px] leading-tight break-words' : 'whitespace-nowrap overflow-hidden text-ellipsis'} font-semibold ${textColor} ${
            (routeIsFlex && (onEditFlexRoute || onRemoveFlexRoute)) || (isAdHoc && onEditAdHocService) ? 'cursor-pointer hover:underline' : ''
          }`}
          onClick={handleNameClick}
          title={
            routeIsFlex && onEditFlexRoute ? 'Click to edit flex route' :
            isAdHoc && onEditAdHocService ? 'Click to edit adhoc service' :
            routeIsFlex && onRemoveFlexRoute ? 'Click to remove flex route from planner' : 
            getTooltipTitle()
          }
        >
          {route.routeName || `Route ${route.routeId}`}
        </span>
      </div>

      {shouldShowRemove && (
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/60 text-muted-foreground transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive/40 hover:shadow-sm active:scale-95"
          title={routeIsFlex ? 'Close flex route' : 'Close ad-hoc route'}
          onClick={handleRemoveClick}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Remove Flex Route Modal */}
      {routeIsFlex && (
        <RemoveFlexRouteModal
          isOpen={isRemoveModalOpen}
          onClose={() => setIsRemoveModalOpen(false)}
          onConfirm={handleConfirmRemove}
          route={route}
        />
      )}
    </div>
  );
};

export default RouteLabel;

