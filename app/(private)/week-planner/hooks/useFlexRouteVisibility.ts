/**
 * React Hook for managing Flex Route Visibility
 * 
 * Provides functionality to show/hide flex routes by section,
 * with localStorage persistence.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SectionKey } from '../utils/flexRouteVisibilityUtils';
import {
  loadFlexRoutesVisibility,
  saveFlexRoutesVisibility,
  isFlexRouteVisible,
  type FlexRoutesVisibilityState,
} from '../utils/flexRouteVisibilityUtils';

export interface UseFlexRouteVisibilityReturn {
  visibility: FlexRoutesVisibilityState;
  isSectionVisible: (sectionKey: SectionKey) => boolean;
  toggleSection: (sectionKey: SectionKey) => void;
  toggleAll: () => void;
  setSectionVisibility: (sectionKey: SectionKey, visible: boolean) => void;
  setAllVisibility: (visible: boolean) => void;
}

/**
 * Hook for managing flex route visibility
 */
export function useFlexRouteVisibility(): UseFlexRouteVisibilityReturn {
  const [visibility, setVisibility] = useState<FlexRoutesVisibilityState>(() => {
    return loadFlexRoutesVisibility();
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFlexRoutesVisibility();
    setVisibility(saved);
  }, []);

  // Save to localStorage whenever visibility changes
  useEffect(() => {
    saveFlexRoutesVisibility(visibility);
  }, [visibility]);

  // Check if a section is visible
  const isSectionVisible = useCallback(
    (sectionKey: SectionKey): boolean => {
      return isFlexRouteVisible(sectionKey, visibility);
    },
    [visibility]
  );

  // Toggle a specific section
  const toggleSection = useCallback(
    (sectionKey: SectionKey) => {
      setVisibility(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [sectionKey]: !prev.sections[sectionKey],
        },
      }));
    },
    []
  );

  // Toggle all sections
  const toggleAll = useCallback(() => {
    setVisibility(prev => {
      const newShowAll = !prev.showAll;
      return {
        showAll: newShowAll,
        sections: {
          ...prev.sections,
          // When toggling all, set all sections to the same state
          ...Object.keys(prev.sections).reduce((acc, key) => {
            acc[key as SectionKey] = newShowAll;
            return acc;
          }, {} as Record<SectionKey, boolean>),
        },
      };
    });
  }, []);

  // Set specific section visibility
  const setSectionVisibility = useCallback(
    (sectionKey: SectionKey, visible: boolean) => {
      setVisibility(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [sectionKey]: visible,
        },
      }));
    },
    []
  );

  // Set all sections visibility
  const setAllVisibility = useCallback((visible: boolean) => {
    setVisibility(prev => ({
      showAll: visible,
      sections: {
        ...prev.sections,
        ...Object.keys(prev.sections).reduce((acc, key) => {
          acc[key as SectionKey] = visible;
          return acc;
        }, {} as Record<SectionKey, boolean>),
      },
    }));
  }, []);

  return {
    visibility,
    isSectionVisible,
    toggleSection,
    toggleAll,
    setSectionVisibility,
    setAllVisibility,
  };
}

