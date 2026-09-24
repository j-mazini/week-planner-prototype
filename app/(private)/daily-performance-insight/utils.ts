import { DailyPerformanceData } from './types';

/**
 * Função para determinar a cor do TW baseado na porcentagem
 */
export const getTWColorClass = (percentage: number): string => {
  if (percentage >= 90 && percentage <= 100) {
    return "success";
  } else if (percentage >= 80 && percentage < 90) {
    return "warning";
  } else if (percentage >= 70 && percentage < 80) {
    return "orange";
  } else if (percentage < 60) {
    return "danger";
  }
  return ""; // Sem cor específica para 60-70%
};

/**
 * Função para determinar se o horário de chegada deve ser destacado
 */
export const shouldHighlightArrivalTime = (arriveTime: string | null): boolean => {
  if (!arriveTime) return false;
  
  try {
    const cleanTimeString = arriveTime.replace(/Z|[+-]\d{2}:\d{2}$/g, '');
    const arriveDate = new Date(cleanTimeString);
    const hours = arriveDate.getHours();
    
    // Destaca se chegou antes das 17h
    return hours < 17;
  } catch {
    return false;
  }
};

/**
 * Determina o ícone do veículo baseado no modelo
 */
export const getVehicleIcon = (vehicleModel: string): string => {
  const model = vehicleModel.toLowerCase();
  
  if (model.includes('van') || model.includes('bullet') || model.includes('transit')) {
    return 'bi-truck';
  } else if (model.includes('car') || model.includes('sedan')) {
    return 'bi-car-front';
  } else if (model.includes('bike') || model.includes('motorcycle')) {
    return 'bi-bicycle';
  } else if (model.includes('cargo')) {
    return 'bi-box-seam';
  }
  
  return 'bi-truck';
};

/**
 * Verifica se é "day off"
 */
export const isDayOff = (operation: DailyPerformanceData): boolean => {
  return (
    operation.status?.toLowerCase().includes('day off') ||
    operation.status?.toLowerCase().includes('dayoff') ||
    operation.note?.toLowerCase().includes('day off') ||
    operation.note?.toLowerCase().includes('dayoff') ||
    operation.route.routeName.toUpperCase() === "DAY OFF" ||
    operation.route.routeName.toUpperCase() === "OFF"
  );
};

/**
 * Verifica se deve mostrar métricas
 */
export const shouldShowMetrics = (operation: DailyPerformanceData): boolean => {
  const isDayOffOperation = isDayOff(operation);
  return !isDayOffOperation && 
         operation.route.routeName.charAt(0) !== 'B' && 
         operation.route.routeName.charAt(0) !== 'S' && 
         operation.route.routeName.charAt(0) !== 'O';
};

/**
 * Formata porcentagem
 */
export const formatPercentage = (value: number): string => {
  if (value === 0) return "--:--";
  return `${Math.round(value * 100)}%`;
};

import { format as formatDate } from "date-fns";

/**
 * Formata tempo
 */
export const formatTime = (timeString: string | null): string => {
  if (!timeString) return "--:--";
  
  if (timeString.includes(":") && timeString.split(":").length >= 2) {
    const timeParts = timeString.split(":");
    return `${timeParts[0]}:${timeParts[1]}`;
  }
  
  try {
    const cleanTimeString = timeString.replace(/Z|[+-]\d{2}:\d{2}$/g, '');
    const date = formatDate(new Date(cleanTimeString), "HH:mm");
    return date;
  } catch {
    return "--:--";
  }
};

