import type { ProcessedVendorSummary } from '@/lib/vendor-performance-api';

export interface ProcessedVendor {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  avgTw: string;
  avgSpr: string;
  avgSporH: string;
  avgAfd: string;
  routeName?: string;
}

/**
 * Maps the backend's already-computed per-vendor summary (GET /bff/daily-overview/summary)
 * into the shape the vendor-performance table/components expect. No math here — TW/SPR/
 * SPOR-H/AFD come pre-computed from PerformanceCalculationService on the backend.
 */
export function mapVendorSummaryToProcessedVendors(vendors: ProcessedVendorSummary[]): ProcessedVendor[] {
  return vendors
    .filter((v): v is ProcessedVendorSummary & { id: number } => v.id !== undefined)
    .map((v) => ({
      id: v.id,
      firstName: v.firstName || '',
      lastName: v.lastName || '',
      email: v.email,
      avgTw: String(v.avgTw ?? '--:--'),
      avgSpr: String(v.avgSpr ?? '--:--'),
      avgSporH: String(v.avgSporH ?? '--:--'),
      avgAfd: String(v.avgAfd ?? '--:--'),
    }))
    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
}

/**
 * Retorna sempre preto para Time Window
 */
export function getTimeWindowClass(_twValue: string): string {
  return 'text-[#000]';
}

/**
 * Retorna a classe Tailwind apropriada para SPOR-H baseado no valor
 * >= 18.0: verde (success)
 * < 18.0: vermelho (accent)
 */
export function getSporHClass(sporHValue: string): string {
  if (sporHValue === 'N/A' || sporHValue === '--:--') {
    return 'text-[#000] italic text-[0.9rem] font-medium';
  }

  const value = parseFloat(sporHValue);
  if (isNaN(value)) {
    return 'text-[#000] italic text-[0.9rem] font-medium';
  }
  if (value >= 18.0) {
    return 'text-[#27ae60] font-semibold';
  }
  return 'text-[#e74c3c] font-semibold';
}

// Month names in English
const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats month/year for display
 */
export function formatMonthYear(year: number, month: number): string {
  const monthName = MONTH_NAMES_LONG[month] || 'Unknown';
  return `${monthName} ${year}`;
}

/**
 * Generates array of months for carousel (last 12 months)
 */
export function generateCarouselMonths(today: Date): Array<{ year: number; month: number; label: string }> {
  const months: Array<{ year: number; month: number; label: string }> = [];
  for (let i = -11; i <= 0; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = MONTH_NAMES_SHORT[month] || 'Unknown';
    months.push({
      year,
      month,
      label: `${monthName}/${year}`
    });
  }
  return months;
}
