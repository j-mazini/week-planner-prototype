// Utility functions for current-performance page

export const getTimeWindowClass = (twValue: string): string => {
  if (twValue === 'N/A' || twValue === '--:--' || twValue === '0.0%') return 'na-value';
  
  const percentage = parseFloat(twValue);
  if (percentage >= 90) return 'positive-value';
  if (percentage >= 80 && percentage < 90) return 'warning-value';
  return 'negative-value';
};

export const getSporHClass = (sporHValue: string): string => {
  if (sporHValue === 'N/A' || sporHValue === '--:--' || sporHValue === '0.0') return 'na-value';
  
  const value = parseFloat(sporHValue);
  // Verifica primeiro se está entre 80-89 (laranja)
  if (value >= 80 && value < 90) return 'warning-value';
  // Depois verifica se é >= 90 (verde)
  if (value >= 90) return 'positive-value';
  // Para valores menores, mantém a lógica original do SPOR-H
  if (value >= 18.0) return 'positive-value';
  return 'negative-value';
};

export const parseDateLocal = (dateString: string): Date => {
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  return new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
};

