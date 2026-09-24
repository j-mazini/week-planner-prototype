import { useState, useCallback, useMemo } from 'react';
import { fetchDailyOverviewList, type DailyPerformanceData, type DailyOverviewListResponse } from '@/lib/vendor-performance-api';
import { type ProcessedVendor } from '../utils';

const EMPTY_AVERAGES = { avgTw: '--:--', avgSpr: '--:--', avgSporH: '--:--', avgAfd: '--:--' };

export function useVendorMonthData() {
  const [monthData, setMonthData] = useState<DailyPerformanceData[]>([]);
  const [allOperations, setAllOperations] = useState<Array<{
    spr: number;
    sporH: number;
    tw: number;
  }>>([]);
  const [averages, setAverages] = useState(EMPTY_AVERAGES);
  const [loading, setModalLoading] = useState(false);
  const today = useMemo(() => new Date(), []);

  const loadMonthData = useCallback(async (
    year: number,
    month: number,
    vendor: ProcessedVendor
  ) => {
    setModalLoading(true);
    try {
      const apiMonth = month + 1; // Convert from 0-based to 1-based
      const response = await fetchDailyOverviewList(vendor.id, apiMonth, year);

      if (!response || !response.dailyEarnings) {
        setMonthData([]);
        setAllOperations([]);
        setAverages(EMPTY_AVERAGES);
        return;
      }

      // Médias já pré-computadas pelo backend (PerformanceCalculationService) no currentMonth.
      setAverages({
        avgTw: response.currentMonth?.avgTw ?? '--:--',
        avgSpr: response.currentMonth?.avgSpr ?? '--:--',
        avgSporH: response.currentMonth?.avgSporH ?? '--:--',
        avgAfd: response.currentMonth?.avgAfd ?? '--:--',
      });

      // Helper function to parse date in local timezone (avoids timezone issues)
      const parseDateLocal = (dateString: string): Date => {
        const [yearStr, monthStr, dayStr] = dateString.split('-');
        return new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
      };

      // Map API data to a map by day (same logic as current-performance)
      type OperationType = DailyOverviewListResponse['dailyEarnings'][0]['operations'][0];
      const dataByDay: { [key: number]: OperationType[] } = {};
      // Agregado do dia pré-computado pelo backend (razão ponderada, não média simples
      // das operações) — ver PerformanceCalculationService.computeDailyValues.
      const dailyAggByDay: { [key: number]: { spr: number; sporH: number; tw: number | null; afd: number } } = {};
      response.dailyEarnings.forEach(earning => {
        // Parse date in local timezone to avoid timezone issues
        const dateObj = parseDateLocal(earning.date);
        const day = dateObj.getDate();
        if (earning.operations && earning.operations.length > 0) {
          dataByDay[day] = earning.operations;
        }
        dailyAggByDay[day] = {
          spr: earning.dailySpr ?? 0,
          sporH: earning.dailySporH ?? 0,
          tw: earning.dailyTwPercentage ?? null,
          afd: earning.dailyAfd ?? 0,
        };
      });

      // Process all days of the month (same logic as current-performance)
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startDayOfWeek = new Date(year, month, 1).getDay();
      const mappedData: DailyPerformanceData[] = [];

      // Calculate all operations individually for accurate averages
      const operations: Array<{ spr: number; sporH: number; tw: number }> = [];

      // Process each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayOfWeek = (startDayOfWeek + day - 1) % 7;
        if (dayOfWeek === 0) continue; // Skip Sundays
        
        const isCurrentMonth = (year === today.getFullYear() && month === today.getMonth());
        const isFutureMonth = (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth()));
        
        // Future month or future day in current month: N/A
        if (isFutureMonth || (isCurrentMonth && day > today.getDate())) {
          mappedData.push({
            day,
            dayOfWeek,
            route: 'N/A',
            stops: 'N/A',
            sporH: 'N/A',
            tw: 'N/A',
            rtw: 'N/A',
            spr: 'N/A',
            afd: 'N/A',
            nr: 0,
            fp: 0,
            ba: 0,
            nh: 0,
            sup: 0,
            cm: 0,
            pu: 0,
            ok: 0,
            hn: 0,
            pd: 0,
          });
          continue;
        }

        const dayOperations = dataByDay[day];

        // If there are no operations for this day, use N/A
        if (!dayOperations || dayOperations.length === 0) {
          mappedData.push({
            day,
            dayOfWeek,
            route: 'N/A',
            stops: 'N/A',
            sporH: 'N/A',
            tw: 'N/A',
            rtw: 'N/A',
            spr: 'N/A',
            afd: 'N/A',
            nr: 0,
            fp: 0,
            ba: 0,
            nh: 0,
            sup: 0,
            cm: 0,
            pu: 0,
            ok: 0,
            hn: 0,
            pd: 0,
          });
          continue;
        }

        // Aggregate data from all day operations. spr/sporH/tw/afd do dia vêm prontos
        // do backend (dailyAggByDay) — só somamos aqui as contagens brutas de paradas
        // (exibição/tooltip), não recalculamos nenhuma fórmula de performance.
        const dayAgg = dailyAggByDay[day] ?? { spr: 0, sporH: 0, tw: null, afd: 0 };
        const routeNames: string[] = [];
        // Agregar unpaid stops para attempted failed deliveries
        let totalNr = 0;
        let totalFp = 0;
        let totalBa = 0;
        let totalNh = 0;
        let totalCm = 0;
        let totalCa = 0;
        // Agregar paid stops para successful stops
        let totalPu = 0;
        let totalOk = 0;
        let totalHn = 0;
        let totalPd = 0;
        // Time details for TW tooltip
        let dayWorkedHours = '';
        let dayDepartTime = '';
        let dayArriveTime = '';

        dayOperations.forEach(op => {
          if (op == null) return;
          const paidStops = op.paidStops;
          const unpaidStops = op.unpaidStops;

          routeNames.push(op.routeName || 'N/A');

          // Somar unpaid stops (attempted failed deliveries)
          if (unpaidStops) {
            totalNr += unpaidStops.nr || 0;
            totalFp += unpaidStops.fp || 0;
            totalBa += unpaidStops.ba || 0;
            totalNh += unpaidStops.nh || 0;
            totalCm += unpaidStops.cm || 0;
            totalCa += unpaidStops.ca || 0;
          }

          // Somar paid stops (successful stops)
          if (paidStops) {
            totalPu += paidStops.pu || 0;
            totalOk += paidStops.ok || 0;
            totalHn += paidStops.hn || 0;
            totalPd += paidStops.pd || 0;
          }

          // Collect time details for TW tooltip (use first operation's data)
          if (!dayWorkedHours && op.workedHours) {
            dayWorkedHours = typeof op.workedHours === 'string' ? op.workedHours : String(op.workedHours);
            dayDepartTime = op.departTime || '';
            dayArriveTime = op.arriveTime || '';
          }

          operations.push({ spr: op.spr ?? 0, sporH: op.sporh ?? 0, tw: op.twPercentage ?? 0 });
        });

        // spr/sporH/rtw/afd do dia vêm prontos do backend (dayAgg) — sem recalcular.
        const sporH = dayAgg.sporH.toFixed(1);

        // TW: use workedHours from day operations
        let tw = 'N/A';
        if (dayWorkedHours) {
          tw = dayWorkedHours;
        }

        const rtw = dayAgg.tw !== null ? `${dayAgg.tw.toFixed(1)}%` : '--:--';
        const afd = `${Math.round(dayAgg.afd)}%`;
        const spr = dayAgg.spr;
        const route = routeNames.length > 0 ? routeNames[0] : 'N/A'; // Use first route

        mappedData.push({
          day,
          dayOfWeek,
          route,
          stops: spr > 0 ? spr : 'N/A',
          sporH,
          tw,
          rtw,
          spr: spr > 0 ? spr : 'N/A',
          afd,
          // Attempted Failed Deliveries
          nr: totalNr,
          fp: totalFp,
          ba: totalBa,
          nh: totalNh,
          sup: 0, // SHP is not in backend, keep 0
          cm: totalCm,
          ca: totalCa,
          // Successful Stops
          pu: totalPu,
          ok: totalOk,
          hn: totalHn,
          pd: totalPd,
          // Time details for TW tooltip
          workedHours: dayWorkedHours || undefined,
          departTime: dayDepartTime || undefined,
          arriveTime: dayArriveTime || undefined,
        });
      }

      setMonthData(mappedData);
      setAllOperations(operations);
    } catch (err) {
      console.error('Error loading month data:', err);
      setMonthData([]);
      setAllOperations([]);
      setAverages(EMPTY_AVERAGES);
    } finally {
      setModalLoading(false);
    }
  }, [today]);

  return { monthData, allOperations, averages, loading, loadMonthData };
}

