"use client";

import React from 'react';
import { SectionFlexRouteControl } from '../FlexRouteVisibilityControls';
import { getSectionKeyForLoop } from '../../utils/flexRouteVisibilityUtils';
import { Plus } from 'lucide-react';

export interface LoopSectionHeaderProps {
  loopKey: string;
  title: string;
  onAddFlexRoute?: (loopKey: string) => void;
  className?: string;
}

/**
 * Header component for loop sections with flex route controls
 */
const LoopSectionHeader: React.FC<LoopSectionHeaderProps> = ({
  loopKey,
  title,
  onAddFlexRoute,
  className = '',
}) => {
  const sectionKey = getSectionKeyForLoop(loopKey);

  return (
    <div 
      className={`bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center justify-between ${className}`}
    >
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      <div className="flex items-center gap-2">
        {sectionKey && (
          <SectionFlexRouteControl sectionKey={sectionKey} />
        )}
        {onAddFlexRoute && (
          <button
            type="button"
            onClick={() => onAddFlexRoute(loopKey)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Add Flex Route"
          >
            <Plus className="w-3 h-3" />
            <span>Add Flex</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LoopSectionHeader;

