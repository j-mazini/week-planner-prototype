import React from 'react';
import { vehiclesStyles } from '../styles';

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PaginationProps {
  pagination: PaginationState;
  itemsPerPage: number;
  onPageChange: (newPage: number) => void;
  onItemsPerPageChange: (newItemsPerPage: number) => void;
  loading: boolean;
  currentItemsCount?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading,
  currentItemsCount,
}) => {
  if (loading || pagination.totalPages === 0) {
    return null;
  }

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Calcular quantos itens estão sendo exibidos na página atual
  const displayCount = currentItemsCount ?? Math.min(
    pagination.itemsPerPage,
    pagination.totalItems - (pagination.currentPage - 1) * pagination.itemsPerPage
  );

  return (
    <div className={vehiclesStyles.paginationContainer}>
      <div className={vehiclesStyles.paginationCount} id="record-count">
        Showing {displayCount} of {pagination.totalItems} records
      </div>
      <div className={vehiclesStyles.paginationControls}>
        <div className={vehiclesStyles.paginationItemsPerPage}>
          <label htmlFor="itemsPerPage" className={vehiclesStyles.paginationItemsPerPageLabel}>
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              scrollToTop();
            }}
            className={vehiclesStyles.paginationItemsPerPageSelect}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <nav>
          <ul className={vehiclesStyles.paginationNav}>
            <li>
              <button
                className={`${vehiclesStyles.paginationButton} ${
                  pagination.currentPage === 1
                    ? vehiclesStyles.paginationButtonDisabled
                    : vehiclesStyles.paginationButtonEnabled
                }`}
                onClick={() => {
                  onPageChange(pagination.currentPage - 1);
                  scrollToTop();
                }}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 10) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 4) {
                pageNum = pagination.totalPages - 9 + i;
              } else {
                pageNum = pagination.currentPage - 5 + i;
              }
              return (
                <li key={pageNum}>
                  <button
                    className={`${vehiclesStyles.paginationButton} ${
                      pagination.currentPage === pageNum
                        ? vehiclesStyles.paginationButtonActive
                        : vehiclesStyles.paginationButtonEnabled
                    }`}
                    onClick={() => {
                      onPageChange(pageNum);
                      scrollToTop();
                    }}
                  >
                    {pageNum}
                  </button>
                </li>
              );
            })}
            <li>
              <button
                className={`${vehiclesStyles.paginationButton} ${
                  pagination.currentPage === pagination.totalPages || pagination.totalPages === 0
                    ? vehiclesStyles.paginationButtonDisabled
                    : vehiclesStyles.paginationButtonEnabled
                }`}
                onClick={() => {
                  onPageChange(pagination.currentPage + 1);
                  scrollToTop();
                }}
                disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
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

