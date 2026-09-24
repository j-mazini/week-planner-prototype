"use client";

import React from 'react';

export interface RouteGroupHeaderProps {
  label: string;
  columnCount: number; // Number of day columns (5 for weekdays, 7 with weekends)
  className?: string;
}

/**
 * Header component for route groups (CORE/FLEX)
 * Displays a category label spanning the full width
 */
const RouteGroupHeader: React.FC<RouteGroupHeaderProps> = ({
  label,
  columnCount,
  className = '',
}) => {
  return (
    <div
      className={`route-group-header grid gap-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-orange-500 ${className}`}
      style={{
        gridTemplateColumns: `120px repeat(${columnCount}, 1fr)`,
      }}
    >
      <div className="route-label bg-transparent border-none font-semibold text-orange-600 py-2 px-3">
        <div className="route-label-content">
          <span className="route-badge is-category bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold">
            {label}
          </span>
        </div>
      </div>
      {/* Empty cells for day columns */}
      {Array.from({ length: columnCount }).map((_, index) => (
        <div
          key={index}
          className="day-cell bg-transparent border-none shadow-none"
        />
      ))}
    </div>
  );
};

export default RouteGroupHeader;

