/**
 * Flex Route Visibility Management Utilities
 * 
 * Manages the visibility state of flex routes by section,
 * with persistence to localStorage.
 */

export type SectionKey = 
  | 'dcy-dy1' 
  | 'dcy-dy2' 
  | 'lse-ll3' 
  | 'lse-ll4' 
  | 'lse-lm9' 
  | 'mse-md7' 
  | 'mse-md9';

export interface FlexRoutesVisibilityState {
  showAll: boolean;
  sections: Record<SectionKey, boolean>;
}

const DEFAULT_VISIBILITY: FlexRoutesVisibilityState = {
  showAll: true,
  sections: {
    'dcy-dy1': true,
    'dcy-dy2': true,
    'lse-ll3': true,
    'lse-ll4': true,
    'lse-lm9': true,
    'mse-md7': true,
    'mse-md9': true,
  },
};

const STORAGE_KEY = 'ba_express_flex_visibility';

/**
 * Loads visibility state from localStorage
 */
export function loadFlexRoutesVisibility(): FlexRoutesVisibilityState {
  if (typeof window === 'undefined') {
    return DEFAULT_VISIBILITY;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_VISIBILITY,
        ...parsed,
        sections: {
          ...DEFAULT_VISIBILITY.sections,
          ...(parsed.sections || {}),
        },
      };
    }
  } catch (error) {
    console.error('Error loading flex routes visibility:', error);
  }

  return DEFAULT_VISIBILITY;
}

/**
 * Saves visibility state to localStorage
 */
export function saveFlexRoutesVisibility(state: FlexRoutesVisibilityState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving flex routes visibility:', error);
  }
}

/**
 * Gets the section key for a loop key
 */
export function getSectionKeyForLoop(loopKey: string): SectionKey | null {
  const mapping: Record<string, SectionKey> = {
    'dy1': 'dcy-dy1',
    'dy2': 'dcy-dy2',
    'lse-ll3': 'lse-ll3',
    'lse-ll4': 'lse-ll4',
    'lse-lm9': 'lse-lm9',
    'mse-md7': 'mse-md7',
    'mse-md9': 'mse-md9',
  };

  return mapping[loopKey] || null;
}

/**
 * Checks if flex routes should be visible for a section
 */
export function isFlexRouteVisible(
  sectionKey: SectionKey,
  visibility: FlexRoutesVisibilityState
): boolean {
  // If showAll is false, check individual section
  if (!visibility.showAll) {
    return visibility.sections[sectionKey] !== false;
  }
  
  // If showAll is true, check individual section (can override)
  return visibility.sections[sectionKey] !== false;
}

