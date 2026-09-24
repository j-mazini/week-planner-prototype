import { useEffect, useState } from 'react';
import { subDays, format } from 'date-fns';
import { fetchDailyOperationsReports } from '@/lib/daily-operations-api';
import { fetchSpStatus } from '../sp-api';

export function useLastDateWithOperations(daysToCheck = 30): { date: Date | null; isLoading: boolean } {
  const [date, setDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const findLastDate = async () => {
      setIsLoading(true);
      try {
        // Start from yesterday (i=1) to skip today
        for (let i = 1; i < daysToCheck; i++) {
          const checkDate = subDays(new Date(), i);
          const dateStr = format(checkDate, 'yyyy-MM-dd');

          try {
            const data = await fetchDailyOperationsReports(dateStr, dateStr);
            if (data && data.length > 0) {
              setDate(checkDate);
              return;
            }
          } catch {
            // No operations data for this date; continue checking earlier dates
          }
        }
        // If no date found with data, return null instead of fallback
        console.warn('No operations data found in last 30 days');
        setDate(null);
      } finally {
        setIsLoading(false);
      }
    };

    findLastDate();
  }, [daysToCheck]);

  return { date, isLoading };
}

export function useLastDateWithStatus(daysToCheck = 30): { date: Date | null; isLoading: boolean } {
  const [date, setDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const findLastDate = async () => {
      setIsLoading(true);
      try {
        // Start from yesterday (i=1) to skip today
        for (let i = 1; i < daysToCheck; i++) {
          const checkDate = subDays(new Date(), i);

          try {
            const data = await fetchSpStatus(checkDate);
            if (data?.status?.daily) {
              setDate(checkDate);
              return;
            }
          } catch {
            // No status data for this date; continue checking earlier dates
          }
        }
        // If no date found with data, return null instead of fallback
        console.warn('No status data found in last 30 days');
        setDate(null);
      } finally {
        setIsLoading(false);
      }
    };

    findLastDate();
  }, [daysToCheck]);

  return { date, isLoading };
}
