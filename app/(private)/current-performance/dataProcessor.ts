import { parseDateLocal } from './utils';

export interface DayData {
  day: number;
  dayOfWeek: number;
  route: string;
  stops: number | string;
  sporH: string;
  tw: string;
  spr: number | string;
  sporHClass?: string;
  twClass?: string;
  sprClass?: string;
}

export interface DailyOverview {
  operationId: number;
  routeId: number;
  routeName: string;
  amountTotal: string;
  totalStops: number;
  totalPaidStops: number;
  totalUnpaidStops: number;
  departTime: string | null;
  arriveTime: string | null;
  workedHours: number | null;
  breakMinutes: number;
  extra: number;
  adhocSort: number;
  routeSort: number;
  rate: number;
  operationCostModel: number;
  costModelName: string;
  status: string;
  dateName: string;
  percentageOnTime: number;
  sporh: number;
  /** Pré-computados pelo backend (PerformanceCalculationService). */
  spr?: number;
  twPercentage?: number;
}

export interface MonthOverview {
  currentMonth: {
    name: string;
    daysWorked: number;
    totalAmount: string;
    averagePerDay: string;
    /** Médias do mês pré-computadas pelo backend. */
    avgTw?: string;
    avgSpr?: string;
    avgSporH?: string;
  };
  dailyEarnings: Array<{
    date: string;
    dateName: string;
    amount: string;
    /** Agregado do dia pré-computado pelo backend (PerformanceCalculationService). */
    dailySpr?: number;
    dailySporH?: number;
    dailyTwPercentage?: number;
    operations?: DailyOverview[];
    totalAmount?: string | null;
    calculatedAmount?: string;
  }>;
}

export const processMonthData = (
  data: MonthOverview,
  year: number,
  month: number,
  today: Date,
  getSporHClass: (value: string) => string,
  getTimeWindowClass: (value: string) => string
): DayData[] => {
  const mappedData: DayData[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay();

  // Criar um mapa de dados por dia
  const dataByDay: { [key: number]: DailyOverview[] } = {};
  // Agregado do dia pré-computado pelo backend (razão ponderada, não média simples
  // das operações) — ver PerformanceCalculationService.computeDailyValues.
  const dailyAggByDay: { [key: number]: { spr: number; sporH: number; tw: number | null } } = {};
  data.dailyEarnings.forEach(earning => {
    const dateObj = parseDateLocal(earning.date);
    const day = dateObj.getDate();
    if (earning.operations && earning.operations.length > 0) {
      dataByDay[day] = earning.operations;
    }
    dailyAggByDay[day] = {
      spr: earning.dailySpr ?? 0,
      sporH: earning.dailySporH ?? 0,
      tw: earning.dailyTwPercentage ?? null,
    };
  });

  // Processar cada dia do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (startDayOfWeek + day - 1) % 7;
    if (dayOfWeek === 0) continue; // Pular Domingos

    const isCurrentMonth = (year === today.getFullYear() && month === today.getMonth());
    const isFutureMonth = (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth()));

    // Mês futuro ou dia futuro no mês atual: --:--
    if (isFutureMonth || (isCurrentMonth && day > today.getDate())) {
      mappedData.push({
        day,
        dayOfWeek,
        route: '--:--',
        stops: '--:--',
        sporH: '--:--',
        tw: '--:--',
        spr: '--:--',
      });
      continue;
    }

    const dayOperations = dataByDay[day];

    // Se não há operações para este dia, usar --:--
    if (!dayOperations || dayOperations.length === 0) {
      mappedData.push({
        day,
        dayOfWeek,
        route: '--:--',
        stops: '--:--',
        sporH: '--:--',
        tw: '--:--',
        spr: '--:--',
      });
      continue;
    }

    // spr/sporH/tw do dia vêm prontos do backend (dailyAggByDay) — só extraímos o
    // nome da rota aqui, sem recalcular nenhuma fórmula de performance.
    const dayAgg = dailyAggByDay[day] ?? { spr: 0, sporH: 0, tw: null };
    const routeNames = dayOperations.map(op => op.routeName || '--:--');

    const sporH = dayAgg.sporH.toFixed(1);
    const sporHClass = getSporHClass(sporH);

    const tw = dayAgg.tw !== null ? `${dayAgg.tw.toFixed(1)}%` : '--:--';
    const twClass = dayAgg.tw !== null ? getTimeWindowClass(tw) : '--:--';

    // SPR só é calculado quando há stops; caso contrário fica '--:--'.
    const spr = dayAgg.spr > 0 ? dayAgg.spr : '--:--';
    const route = routeNames.length > 0 ? routeNames[0] : '--:--';

    mappedData.push({
      day,
      dayOfWeek,
      route,
      stops: dayOperations.reduce((total, operation) => total + (Number.isFinite(operation.totalStops) ? operation.totalStops : 0), 0),
      sporH,
      tw,
      spr,
      sporHClass,
      twClass,
      sprClass: 'neutral-value',
    });
  }

  return mappedData;
};
