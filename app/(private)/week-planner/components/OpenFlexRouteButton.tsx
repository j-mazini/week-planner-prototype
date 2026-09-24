"use client";

import React, { useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import type { SectionKey } from '../utils/flexRouteVisibilityUtils';
import FlexRouteSelectionModal from './modals/FlexRouteSelectionModal';
import type { Route } from '@/lib/api/routes';

export interface OpenFlexRouteButtonProps {
  sectionKey: SectionKey;
  loopKey: string;
  depositId: number;
  activeRoutes?: Route[];
  onRoutesSelected?: (routes: Route[]) => void;
  className?: string;
}

const OpenFlexRouteButton: React.FC<OpenFlexRouteButtonProps> = ({
  sectionKey: _sectionKey,
  loopKey,
  depositId,
  activeRoutes = [],
  onRoutesSelected,
  className,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = (selectedRoutes: Route[]) => {
    if (onRoutesSelected) {
      // Always call onRoutesSelected, even if empty array (to clear selection)
      onRoutesSelected(selectedRoutes);
    }
    setIsModalOpen(false);
  };

  // Get active route IDs (routes that are currently selected/visible)
  const activeRouteIds = activeRoutes
    .map(route => (route.routeId ?? route.routeId))
    .filter((id): id is number => id !== undefined && id !== null);

  const activeCount = activeRoutes.length;
  const hasActiveRoutes = activeCount > 0;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`relative inline-flex items-center justify-center gap-2 px-3.5 py-2 text-[0.8125rem] font-semibold text-white no-underline border-[1.5px] rounded-[10px] cursor-pointer transition-all duration-300 min-w-[140px] min-h-[36px] shadow-[0_4px_12px_rgba(99,102,241,0.25),0_2px_4px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden backdrop-blur-[8px] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full ${
          hasActiveRoutes 
            ? 'bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] border-[rgba(34,197,94,0.5)] shadow-[0_4px_12px_rgba(34,197,94,0.25),0_2px_4px_rgba(34,197,94,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-gradient-to-br hover:from-[#16a34a] hover:via-[#15803d] hover:to-[#166534] hover:border-[rgba(34,197,94,0.7)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.35),0_4px_8px_rgba(34,197,94,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]'
            : 'bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] border-[rgba(99,102,241,0.4)] hover:bg-gradient-to-br hover:from-[#4f46e5] hover:via-[#7c3aed] hover:to-[#9333ea] hover:border-[rgba(99,102,241,0.6)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35),0_4px_8px_rgba(99,102,241,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-[2px]'
        } active:translate-y-0 active:shadow-[0_2px_8px_rgba(99,102,241,0.3),0_1px_3px_rgba(99,102,241,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] ${className || ''}`}
        title={hasActiveRoutes 
          ? `${activeCount} ${activeCount === 1 ? 'flex route' : 'flex routes'} active. Click to manage.`
          : "Add or select flex routes for this loop"
        }
      >
        <div className="flex items-center gap-2 relative z-[1]">
          <div className={`flex items-center justify-center transition-transform duration-200 ${hasActiveRoutes ? 'hover:scale-110 hover:-rotate-5' : 'hover:scale-110 hover:rotate-5'}`}>
            {hasActiveRoutes ? (
              <Layers className="w-4 h-4 stroke-[2.5] transition-all duration-200" size={16} />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5] transition-all duration-200" size={16} />
            )}
          </div>
          <span className="whitespace-nowrap tracking-[0.01em] font-semibold">
            {hasActiveRoutes ? 'Manage Flex' : 'Add Flex Route'}
          </span>
          {hasActiveRoutes && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[0.6875rem] font-bold text-white bg-white/25 border border-white/30 rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-200 hover:bg-white/35 hover:border-white/40 hover:scale-105">
              {activeCount}
            </span>
          )}
        </div>
        {hasActiveRoutes && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8),0_0_12px_rgba(34,197,94,0.6)] animate-[pulse_2s_ease-in-out_infinite]" />
        )}
      </button>

      <FlexRouteSelectionModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        loopKey={loopKey}
        depositId={depositId}
        activeRouteIds={activeRouteIds}
      />
    </>
  );
};

export default OpenFlexRouteButton;

