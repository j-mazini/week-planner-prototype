'use client';

import React from 'react';

interface TableLoadingSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableLoadingSkeleton: React.FC<TableLoadingSkeletonProps> = ({
  rows = 5,
  columns = 7,
  showHeader = true,
}) => {
  return (
    <div className="table-responsive">
      <table className="table align-middle text-[0.85rem]">
        {showHeader && (
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="border-b border-[#e9ecef]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="py-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};



