import { useQuery } from '@tanstack/react-query';
import { fetchBankHolidays } from '@/lib/bank-holidays-api';

/**
 * Hook para buscar feriados bancários da API do backend.
 * Substitui o cálculo local que existia em business-days.ts.
 * 
 * @param year - O ano desejado para consulta de feriados.
 * @param country - O código do país desejado (padrão 'UK').
 * @returns Um objeto do React Query contendo as datas dos feriados (YYYY-MM-DD).
 * 
 * Sem cache client-side: cada montagem/refetch deve consultar o backend.
 */
export function useBankHolidays(year: number = new Date().getFullYear(), country: string = 'UK', enabled = true) {
  return useQuery({
    queryKey: ['bank-holidays', year, country],
    queryFn: () => fetchBankHolidays(year, country),
    enabled,
  });
}
