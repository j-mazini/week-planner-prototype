/**
 * Formats the current date for display
 */
export const formatCurrentDate = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return now.toLocaleDateString('en-US', options);
};

/**
 * Formats yesterday's date for display
 */
export const formatYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return yesterday.toLocaleDateString('en-US', options);
};

/**
 * Checks if the device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768; // Same breakpoint as MobileNavBar
};

