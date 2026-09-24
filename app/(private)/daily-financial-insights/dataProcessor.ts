import { InsightRow, FilterState, PageTotals } from './types';
import { calculateRow, extractLoopPrefix, extractLoop } from './utils';

/**
 * Filtra dados baseado nos filtros aplicados
 */
export const filterInsightData = (
  insightRows: InsightRow[],
  filters: FilterState
): InsightRow[] => {
  const filtered = insightRows.filter((row) => {
    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesRoute = (row.route || '').toLowerCase().includes(searchTerm);
      const matchesVehicle = (row.vrm || '').toLowerCase().includes(searchTerm);
      const matchesVendor = (row.courier || '').toLowerCase().includes(searchTerm);
      if (!matchesRoute && !matchesVehicle && !matchesVendor) {
        return false;
      }
    }
    
    // Filtro de depot
    if (filters.depot !== 'All' && row.depot !== filters.depot) {
      return false;
    }
    
    // Filtro de loop - usar extractLoop para tratar rotas flex corretamente
    if (filters.loop !== 'All' && row.route) {
      const rowLoop = extractLoop(row.route);
      if (rowLoop !== filters.loop) {
        return false;
      }
    }
    
    // Filtro de payment mode
    if (filters.payment && filters.payment !== 'All' && row.paymentMode !== filters.payment) {
      return false;
    }
    
    return true;
  });
  
  // Sort filtered data by date (ascending), then by route name
  return filtered.sort((a, b) => {
    // First, sort by date (ascending)
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    
    if (dateA !== dateB) {
      return dateA - dateB; // Ascending order for dates
    }
    
    // If dates are the same, sort by route name alphabetically
    const routeA = a.route || '';
    const routeB = b.route || '';
    return routeA.localeCompare(routeB);
  });
};

/**
 * Calcula totais da página
 */
export const calculatePageTotals = (filteredData: InsightRow[]): PageTotals => {
  let total = 0;
  let totalStops = 0;

  filteredData.forEach((row) => {
    const { total: rowTotal } = calculateRow(row);
    total += rowTotal || 0;
    totalStops += row.stops ?? 0;
  });

  const pageAvg = totalStops > 0 ? total / totalStops : 0;

  return {
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    avg: Math.round(pageAvg * 100) / 100, // Round to 2 decimal places
    count: filteredData.length
  };
};

/**
 * Extrai loops únicos dos dados
 */
export const extractUniqueLoops = (insightRows: InsightRow[]): string[] => {
  const loops = new Set<string>(['All']);
  insightRows.forEach(row => {
    if (row.route) {
      const loopPrefix = extractLoopPrefix(row.route);
      if (loopPrefix) {
        loops.add(loopPrefix);
      }
    }
  });
  return Array.from(loops).sort();
};

