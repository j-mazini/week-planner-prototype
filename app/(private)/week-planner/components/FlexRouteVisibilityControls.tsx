"use client";

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useFlexRouteVisibility } from '../hooks/useFlexRouteVisibility';

export interface FlexRouteVisibilityControlsProps {
  sectionKey?: string;
  showGlobalControl?: boolean;
  className?: string;
}

/**
 * Global control to toggle all flex routes
 */
export const GlobalFlexRouteControl: React.FC<{ className?: string }> = ({ className }) => {
  const { visibility, toggleAll } = useFlexRouteVisibility();
  const isVisible = visibility.showAll;

  return (
    <button
      type="button"
      onClick={toggleAll}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${className || ''}`}
      title={isVisible ? 'Hide all flex routes' : 'Show all flex routes'}
    >
      {isVisible ? (
        <>
          <Eye className="w-4 h-4" />
          <span>Hide All Flex</span>
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4" />
          <span>Show All Flex</span>
        </>
      )}
    </button>
  );
};

/**
 * Section-specific control to toggle flex routes for a section
 */
export const SectionFlexRouteControl: React.FC<{
  sectionKey: string;
  className?: string;
}> = ({ sectionKey, className }) => {
  const { isSectionVisible, toggleSection } = useFlexRouteVisibility();
  const isVisible = isSectionVisible(sectionKey);

  try {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSection(sectionKey);
        }}
        className={className || ''}
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: '#ea580c',
          textDecoration: 'none',
          border: '1px solid #ea580c',
          borderRadius: '0.25rem',
          background: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '80px',
          minHeight: '28px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#2563eb';
          e.currentTarget.style.borderColor = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#ea580c';
          e.currentTarget.style.borderColor = '#ea580c';
        }}
        title={isVisible ? 'Hide flex routes in this section' : 'Show flex routes in this section'}
      >
        {isVisible ? (
          <>
            <Eye style={{ width: '14px', height: '14px', display: 'inline-block' }} />
            <span>Hide Flex</span>
          </>
        ) : (
          <>
            <EyeOff style={{ width: '14px', height: '14px', display: 'inline-block' }} />
            <span>Show Flex</span>
          </>
        )}
      </button>
    );
  } catch (_error) {
    // Fallback button
    return (
      <button
        type="button"
        style={{
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          border: '1px solid #ea580c',
          borderRadius: '0.25rem',
          background: 'white',
          color: '#ea580c',
          cursor: 'pointer'
        }}
      >
        Flex
      </button>
    );
  }
};

/**
 * Combined component that shows both global and section controls
 */
const FlexRouteVisibilityControls: React.FC<FlexRouteVisibilityControlsProps> = ({
  sectionKey,
  showGlobalControl = false,
  className,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {showGlobalControl && <GlobalFlexRouteControl />}
      {sectionKey && <SectionFlexRouteControl sectionKey={sectionKey} />}
    </div>
  );
};

export default FlexRouteVisibilityControls;

