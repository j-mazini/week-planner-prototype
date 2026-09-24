"use client";

import React from 'react';
import { SectionFlexRouteControl } from './FlexRouteVisibilityControls';
import { getSectionKeyForLoop } from '../utils/flexRouteVisibilityUtils';
import type { LoopType } from '../utils/routeDistributionUtils';
import type { ExtendedRoute } from '../utils/routeDistributionUtils';

export interface LoopSectionProps {
  loopKey: LoopType | string;
  title: string;
  routes: ExtendedRoute[];
  onAddFlexRoute?: (loopKey: string) => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Component for rendering a loop section with flex route controls
 */
const LoopSection: React.FC<LoopSectionProps> = ({
  loopKey,
  title,
  routes: _routes,
  onAddFlexRoute,
  children,
  className = '',
}) => {
  const sectionKey = getSectionKeyForLoop(loopKey);

  return (
    <div className={`planner-container ${className}`} id={`${loopKey}-loops-container`}>
      <div className="planner-container-heading">
        <div className="planner-container-title">
          <span>{title}</span>
        </div>
        <div 
          className="planner-container-actions" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {sectionKey && (
            <SectionFlexRouteControl sectionKey={sectionKey} />
          )}
          {onAddFlexRoute && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm loop-flex-btn"
              data-loop={loopKey}
              onClick={() => onAddFlexRoute(loopKey)}
              title="Add Flex Route"
            >
              <i className="bi bi-plus-square"></i> Flex Route
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default LoopSection;

