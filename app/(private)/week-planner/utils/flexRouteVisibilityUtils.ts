/**
 * Utilities for managing flex route visibility state
 * with localStorage persistence.
 */

const STORAGE_KEY = 'flex-routes-visibility';

/** A section key is any string identifier for a planner section */
export type SectionKey = string;

/** Visibility state for all flex route sections */
export interface FlexRoutesVisibilityState {
  showAll: boolean;
  sections: Record<SectionKey, boolean>;
}

const DEFAULT_STATE: FlexRoutesVisibilityState = {
  showAll: false,
  sections: {},
};

/** Load flex route visibility state from localStorage */
export function loadFlexRoutesVisibility(): FlexRoutesVisibilityState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as FlexRoutesVisibilityState;
    return {
      showAll: Boolean(parsed?.showAll),
      sections:
        parsed?.sections && typeof parsed.sections === 'object'
          ? parsed.sections
          : {},
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

/** Persist flex route visibility state to localStorage */
export function saveFlexRoutesVisibility(state: FlexRoutesVisibilityState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (private browsing mode, quota exceeded, etc.)
  }
}

/**
 * Returns whether a section's flex routes should be shown.
 * Falls back to `showAll` when the section has no explicit entry.
 */
export function isFlexRouteVisible(
  sectionKey: SectionKey,
  state: FlexRoutesVisibilityState
): boolean {
  if (sectionKey in state.sections) {
    return state.sections[sectionKey];
  }
  return state.showAll;
}

/**
 * Converts a section title into a stable, lowercase key safe for localStorage.
 * e.g. "LCY Loop A" → "lcy-loop-a"
 */
export function getSectionKeyForTitle(title: string): SectionKey {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
