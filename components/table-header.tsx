'use client';

import React from 'react';
import './table-header.css';

export type TableHeaderVariant = 'standard' | 'container' | 'minimal' | 'performance';

export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  variant?: TableHeaderVariant;
  children: React.ReactNode;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onClick?: () => void;
  fullText?: string; // Texto completo para tooltip quando o texto é truncado
}

/**
 * Componente reutilizável para labels (th) de tabelas
 * Unifica estilização e animações em todos os componentes
 */
export const TableHeader = React.memo<TableHeaderProps>(({
  variant = 'standard',
  children,
  sortable = false,
  sortDirection = null,
  onClick,
  className = '',
  fullText,
  title,
  ...props
}) => {
  const baseClasses = 'table-header';
  const variantClass = `table-header--${variant}`;
  const sortableClass = sortable ? 'table-header--sortable' : '';
  const sortClass = sortDirection ? `table-header--sort-${sortDirection}` : '';
  
  const combinedClasses = [
    baseClasses,
    variantClass,
    sortableClass,
    sortClass,
    className
  ].filter(Boolean).join(' ');

  // Use fullText for tooltip if provided, otherwise use title prop, otherwise use children as string
  const tooltipText = fullText || title || (typeof children === 'string' ? children : undefined);

  return (
    <th
      className={combinedClasses}
      onClick={sortable && onClick ? onClick : undefined}
      title={tooltipText}
      {...props}
    >
      <span className="table-header-content">
        {children}
        {sortable && sortDirection && (
          <span className="table-header-sort-indicator">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </span>
    </th>
  );
});

TableHeader.displayName = 'TableHeader';

/**
 * Helper component para criar uma linha de cabeçalho completa
 */
export interface TableHeaderRowProps {
  variant?: TableHeaderVariant;
  children: React.ReactNode;
  className?: string;
}

export const TableHeaderRow = React.memo<TableHeaderRowProps>(({
  variant = 'standard',
  children,
  className = ''
}) => {
  return (
    <tr className={`table-header-row table-header-row--${variant} ${className}`.trim()}>
      {children}
    </tr>
  );
});

TableHeaderRow.displayName = 'TableHeaderRow';

