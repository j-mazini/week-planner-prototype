/**
 * Export utilities for week planner data
 */

import type { Assignment } from '../types/planner';
import { formatDate } from './dateUtils';

/**
 * Convert assignments to CSV format
 */
export function assignmentsToCSV(assignments: Assignment[]): string {
  const headers = [
    'Date',
    'Vendor Name',
    'Route Name',
    'Vehicle Registration',
    'Cost Model',
    'Rate',
    'Route Cost',
    'Route Sort',
    'AD-HOC Sort',
    'Extras',
    'Notes',
    'Status',
  ];

  const rows = assignments.map(a => [
    a.date,
    a.userName || '',
    a.routeName || '',
    a.vehicleRegistration || '',
    a.costModel || '',
    a.rate?.toString() || '',
    a.routeCost?.toString() || '',
    a.routeSort?.toString() || '',
    a.adhocSort?.toString() || '',
    a.extras?.toString() || '',
    a.notes || '',
    a.status || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export week planner data to CSV
 */
export function exportWeekPlannerToCSV(
  assignments: Assignment[],
  weekStart: Date,
  weekEnd: Date
): void {
  const weekAssignments = assignments.filter(a => {
    const assignmentDate = new Date(a.date);
    return assignmentDate >= weekStart && assignmentDate <= weekEnd;
  });

  const csvContent = assignmentsToCSV(weekAssignments);
  const filename = `week-planner-${formatDate(weekStart, 'yyyy-mm-dd')}-to-${formatDate(weekEnd, 'yyyy-mm-dd')}.csv`;
  
  downloadCSV(csvContent, filename);
}

/**
 * Convert assignments to Excel-compatible format (TSV)
 */
export function assignmentsToTSV(assignments: Assignment[]): string {
  const headers = [
    'Date',
    'Vendor Name',
    'Route Name',
    'Vehicle Registration',
    'Cost Model',
    'Rate',
    'Route Cost',
    'Route Sort',
    'AD-HOC Sort',
    'Extras',
    'Notes',
    'Status',
  ];

  const rows = assignments.map(a => [
    a.date,
    a.userName || '',
    a.routeName || '',
    a.vehicleRegistration || '',
    a.costModel || '',
    a.rate?.toString() || '',
    a.routeCost?.toString() || '',
    a.routeSort?.toString() || '',
    a.adhocSort?.toString() || '',
    a.extras?.toString() || '',
    a.notes || '',
    a.status || '',
  ]);

  const tsvContent = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  return tsvContent;
}

/**
 * Download TSV file (Excel-compatible)
 */
export function downloadTSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export week planner data to Excel (TSV format)
 */
export function exportWeekPlannerToExcel(
  assignments: Assignment[],
  weekStart: Date,
  weekEnd: Date
): void {
  const weekAssignments = assignments.filter(a => {
    const assignmentDate = new Date(a.date);
    return assignmentDate >= weekStart && assignmentDate <= weekEnd;
  });

  const tsvContent = assignmentsToTSV(weekAssignments);
  const filename = `week-planner-${formatDate(weekStart, 'yyyy-mm-dd')}-to-${formatDate(weekEnd, 'yyyy-mm-dd')}.tsv`;
  
  downloadTSV(tsvContent, filename);
}

/**
 * Export week schedule with detailed information
 */
export function exportWeekSchedule(
  assignments: Assignment[],
  vendors: { userId?: number; fullName?: string }[],
  routes: { routeId?: number; routeName?: string }[],
  weekDates: Date[],
  formatWeekRangeLabel: (dates: Date[]) => string
): void {
  const weekDateKeys = weekDates.map(date => formatDate(date, 'yyyy-mm-dd'));
  
  const weekAssignments = assignments.filter(assignment => 
    weekDateKeys.includes(assignment.date)
  );
  
  // Preparar dados CSV
  const csvRows: string[] = [];
  csvRows.push(['Date', 'Day', 'Route', 'Vendor', 'VRN', 'Sort Status', 'Notes'].map(cell => `"${cell}"`).join(','));
  
  weekAssignments.forEach(assignment => {
    const vendor = vendors.find(d => d.userId === assignment.userId);
    const route = routes.find(r => String(r.routeId) === String(assignment.routeId));
    const date = new Date(assignment.date);
    
    const row = [
      formatDate(date, 'dd/mm/yyyy'),
      date.toLocaleDateString('en-GB', { weekday: 'short' }),
      route?.routeName || String(assignment.routeId),
      vendor?.fullName || assignment.userName || 'Unknown',
      assignment.vehicleRegistration || 'N/A',
      assignment.routeSort?.toString() || 'no',
      assignment.notes || ''
    ];
    
    csvRows.push(row.map(cell => `"${cell}"`).join(','));
  });
  
  // Criar e baixar arquivo
  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `schedule-${formatWeekRangeLabel(weekDates)}.csv`;
  link.click();
  
  URL.revokeObjectURL(url);
}


