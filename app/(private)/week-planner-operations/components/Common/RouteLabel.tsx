"use client";

import React from 'react';
import { X } from 'lucide-react';
import type { Route } from '@/lib/api/routes';

type RouteLabelProps = {
  route: Route & {
    variant?: string;
    notes?: string;
    isFlex?: boolean;
    category?: string;
  };
  onRemoveFlexRoute?: (routeId: number) => void;
  onRemoveAdHoc?: (routeId: number) => void;
};

const RouteLabel: React.FC<RouteLabelProps> = ({
  route,
  onRemoveFlexRoute,
  onRemoveAdHoc,
}) => {
  const notesText = (route.notes || '').trim();

  const shouldShowRemove =
    route.isFlex === true ||
    (route.category && route.category.toLowerCase() === 'ad_hoc');

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (route.isFlex && onRemoveFlexRoute && route.routeId) {
      onRemoveFlexRoute(route.routeId);
    } else if (onRemoveAdHoc && route.routeId) {
      onRemoveAdHoc(route.routeId);
    }
  };

  const getTooltipTitle = () => {
    if (notesText) {
      return notesText;
    }
    return '';
  };

  return (
    <div className="route-label">
      <div className="route-label-content" title={getTooltipTitle()}>
        {route.variant && (
          <span className={`route-badge variant-${route.variant}`}>
            {route.variant.toUpperCase()}
          </span>
        )}

        <span className="route-name">
          {route.routeName || `Route ${route.routeId}`}
        </span>
      </div>

      {shouldShowRemove && (
        <button
          type="button"
          className="btn btn-link btn-sm route-remove-btn"
          title={route.isFlex ? 'Remove flex route' : 'Remove ad-hoc service'}
          onClick={handleRemoveClick}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default RouteLabel;


