import { memo } from 'react';
import type { DailyPerformanceData } from '@/lib/vendor-performance-api';
import { getTimeWindowClass } from '../utils';

interface PerformanceTableRowProps {
  dayData: DailyPerformanceData;
  index: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getTwColor = (twClass: string): string => {
  if (twClass.includes('italic')) return 'text-gray-400';
  if (twClass.includes('text-green') || twClass.includes('27ae60')) return 'text-green-600';
  if (twClass.includes('text-yellow') || twClass.includes('f39c12')) return 'text-yellow-600';
  if (twClass.includes('text-red') || twClass.includes('e74c3c')) return 'text-red-600';
  return 'text-slate-800';
};

export const PerformanceTableRow = memo(function PerformanceTableRow({
  dayData,
  index
}: PerformanceTableRowProps) {
  const dayOfWeekName = WEEKDAYS[dayData.dayOfWeek];
  const isSaturday = dayData.dayOfWeek === 6;
  const routeClass = (dayData.route === 'N/A' || dayData.route === '--:--') ? 'text-gray-400 italic' : '';

  // Format values to display "--:--" when N/A or empty
  const sprValue = dayData.spr;
  const displaySpr = (sprValue === 'N/A' || sprValue === '--:--' || sprValue === 0 || sprValue === '0') ? '--:--' : sprValue;
  const displaySporH = (dayData.sporH === 'N/A' || dayData.sporH === '--:--' || dayData.sporH === '0.0' || dayData.sporH === '0') ? '--:--' : dayData.sporH;
  const displayTw = (dayData.tw === 'N/A' || dayData.tw === '--:--' || dayData.tw === '0.0%' || dayData.tw === '0%') ? '--:--' : dayData.tw;
  const displayRtw = (dayData.rtw === 'N/A' || dayData.rtw === '--:--' || dayData.rtw === '0.0%' || dayData.rtw === '0%') ? '--:--' : dayData.rtw;
  const displayRoute = (dayData.route === 'N/A' || dayData.route === '--:--') ? '--:--' : dayData.route;

  // Classes for empty values
  const sprClass = (sprValue === 'N/A' || sprValue === '--:--' || sprValue === 0 || sprValue === '0') ? 'text-gray-400 italic' : '';
  const sporHClass = (dayData.sporH === 'N/A' || dayData.sporH === '--:--' || dayData.sporH === '0.0') ? 'text-gray-400 italic' : '';
  const twClass = (dayData.tw === 'N/A' || dayData.tw === '--:--' || dayData.tw === '0.0%') ? 'text-gray-400 italic' : getTimeWindowClass(dayData.tw);
  const rtwClass = (dayData.rtw === 'N/A' || dayData.rtw === '--:--' || dayData.rtw === '0.0%') ? 'text-gray-400 italic' : getTimeWindowClass(dayData.rtw);

  // AFD já vem pré-computado do backend (PerformanceCalculationService)
  const displayAfd = dayData.afd && dayData.afd !== 'N/A' ? dayData.afd : '--:--';
  const afdClass = displayAfd !== '--:--' ? 'text-blue-600' : 'text-gray-400 italic';

  const rowBgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  const twColor = getTwColor(twClass);
  const rtwColor = getTwColor(rtwClass);

  // Build TW tooltip with calculation details
  const twTooltip = dayData.departTime && dayData.arriveTime && dayData.workedHours
    ? `${dayData.arriveTime} - ${dayData.departTime} = ${dayData.workedHours}`
    : '';

  // Build SPOR-H tooltip with calculation details
  const sporHTooltip = dayData.workedHours
    ? (() => {
      const paidStops = (dayData.pu ?? 0) + (dayData.ok ?? 0) + (dayData.hn ?? 0) + (dayData.pd ?? 0);
      const unpaidStops = (dayData.nr ?? 0) + (dayData.fp ?? 0) + (dayData.ba ?? 0) + (dayData.nh ?? 0) + (dayData.cm ?? 0) + (dayData.ca ?? 0);
      const totalStops = paidStops + unpaidStops;
      return `Total Stops: ${totalStops} (Paid: ${paidStops}, Unpaid: ${unpaidStops}) / Worked Hours: ${dayData.workedHours} = ${displaySporH}`;
    })()
    : '';

  return (
    <tr className={`${rowBgColor} border-b border-gray-200`}>
      <td className="text-left px-2 py-2 text-xs">
        <strong className="font-bold text-slate-800 mr-2">
          {String(dayData.day).padStart(2, '0')}
        </strong>
        <span className={`inline-block px-2 py-0.5 rounded-xl bg-gray-200 text-slate-600 text-[0.7rem] font-medium uppercase ${isSaturday ? 'bg-blue-100 text-blue-700' : ''}`}>
          {dayOfWeekName}
        </span>
      </td>
      <td className={`text-left px-2 py-2 text-xs ${routeClass}`}>{displayRoute}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.nr ?? 0}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.fp ?? 0}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.ba ?? 0}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.nh ?? 0}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.cm ?? 0}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.ca ?? 0}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.pu ?? 0}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.ok ?? 0}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.hn ?? 0}</td>
      <td className="text-left px-2 py-2 text-xs text-slate-800">{dayData.pd ?? 0}</td>
      <td className={`text-left px-2 py-2 text-xs ${sprClass}`}>{displaySpr}</td>
      <td className={`text-left px-2 py-2 text-xs ${sporHClass}`} title={sporHTooltip}>{displaySporH}</td>
      <td className={`text-left px-2 py-2 text-xs ${twColor}`} title={twTooltip}>{displayTw}</td>
      <td className={`text-left px-2 py-2 text-xs ${rtwColor}`}>{displayRtw}</td>
      <td className={`text-left px-2 py-2 text-xs ${afdClass}`}>{displayAfd}</td>
    </tr>
  );
});

