'use client';

import React from 'react';
import { vendorStyles } from '../styles';

export interface VendorPaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PaginationProps {
  pagination: VendorPaginationState;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
}) => {
  if (isLoading || pagination.totalItems === 0) {
    return null;
  }

  const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const end = Math.min(
    pagination.currentPage * pagination.itemsPerPage,
    pagination.totalItems
  );

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
    scrollToTop();
  };

  return (
    <div className={vendorStyles.paginationContainer}>
      <div className={vendorStyles.paginationCount}>
        Showing {start}–{end} of {pagination.totalItems}
      </div>
      <div className={vendorStyles.paginationControls}>
        {onItemsPerPageChange && (
          <div className={vendorStyles.paginationItemsPerPage}>
            <label htmlFor="vendor-items-per-page" className={vendorStyles.paginationItemsPerPageLabel}>
              Per page:
            </label>
            <select
              id="vendor-items-per-page"
              value={pagination.itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                handlePageChange(1);
              }}
              className={vendorStyles.paginationItemsPerPageSelect}
            >
              {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
        <nav aria-label="Vendor list pagination">
          <ul className={vendorStyles.paginationNav}>
            <li>
              <button
                type="button"
                className={`${vendorStyles.paginationButton} ${
                  pagination.currentPage <= 1
                    ? vendorStyles.paginationButtonDisabled
                    : vendorStyles.paginationButtonEnabled
                }`}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>
            </li>
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 7) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 4) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 3) {
                pageNum = pagination.totalPages - 6 + i;
              } else {
                pageNum = pagination.currentPage - 3 + i;
              }
              return (
                <li key={pageNum}>
                  <button
                    type="button"
                    className={`${vendorStyles.paginationButton} ${
                      pagination.currentPage === pageNum
                        ? vendorStyles.paginationButtonActive
                        : vendorStyles.paginationButtonEnabled
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={pagination.currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                className={`${vendorStyles.paginationButton} ${
                  pagination.currentPage >= pagination.totalPages || pagination.totalPages === 0
                    ? vendorStyles.paginationButtonDisabled
                    : vendorStyles.paginationButtonEnabled
                }`}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || pagination.totalPages === 0}
                aria-label="Next page"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
