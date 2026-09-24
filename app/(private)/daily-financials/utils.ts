import { format, parseISO, isValid } from 'date-fns';
import { enGB } from 'date-fns/locale';

/**
 * Formata data para exibição
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    // Se já estiver no formato YYYY-MM-DD, usar diretamente
    if (dateString.includes('T')) {
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString.split('T')[0];
      return format(date, 'dd MMM', { locale: enGB });
    }
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'dd MMM', { locale: enGB });
  } catch {
    return dateString ? dateString.split('T')[0] : '';
  }
};

/**
 * Formata valor monetário
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '---';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue) || numValue === 0) return '---';
  return `£${numValue.toFixed(2)}`;
};

/**
 * Formata valor para exibição
 */
export const formatValue = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '---';
  if (typeof value === 'number') {
    if (value % 1 === 0) return value.toString();
    return value.toFixed(2);
  }
  return value.toString();
};

/**
 * Obtém o nome do Cost Model
 */
export const getCostModelName = (costModelId: number | null | undefined): string => {
  switch (costModelId) {
    case 1: return 'DAF';
    case 2: return 'DR';
    case 3: return 'FSR';
    case 4: return 'VSR';
    default: return '---';
  }
};

