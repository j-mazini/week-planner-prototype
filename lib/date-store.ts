import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DateState {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

// Calculate default date based on current day of the week
// Monday (1): current day - 3
// Sunday (0): current day - 2
// Tuesday to Saturday (2-6): current day - 1
export const getDefaultDate = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  let daysToSubtract = 1; // Default: Terça a Sábado
  
  if (dayOfWeek === 1) {
    // Segunda-feira
    daysToSubtract = 3;
  } else if (dayOfWeek === 0) {
    // Domingo
    daysToSubtract = 2;
  }
  
  const defaultDate = new Date(today);
  defaultDate.setDate(today.getDate() - daysToSubtract);
  defaultDate.setHours(0, 0, 0, 0);
  
  return defaultDate;
};

export const useDateStore = create<DateState>()(
  persist(
    (set) => ({
      selectedDate: getDefaultDate(),
      setSelectedDate: (date: Date) => {
        // Ensure the date is set to midnight to avoid timezone issues
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        set({ selectedDate: normalizedDate });
      },
    }),
    {
      name: 'shared-date-storage',
      // Custom storage functions to handle Date object serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            // Convert the stored string back to Date object
            if (parsed.state?.selectedDate) {
              const storedDate = new Date(parsed.state.selectedDate);
              // Check if stored date is valid and not too old (more than 7 days)
              const today = new Date();
              const daysDiff = Math.abs(today.getTime() - storedDate.getTime()) / (1000 * 60 * 60 * 24);
              
              if (isNaN(storedDate.getTime()) || daysDiff > 7) {
                // If stored date is invalid or too old, use default date based on day of week
                parsed.state.selectedDate = getDefaultDate();
              } else {
                parsed.state.selectedDate = storedDate;
              }
            } else {
              // If no date in storage, use default date based on day of week
              parsed.state = { selectedDate: getDefaultDate() };
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
); 