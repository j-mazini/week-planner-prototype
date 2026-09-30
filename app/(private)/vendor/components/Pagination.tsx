"use client";

import { PAGE_SIZES } from "../constants";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
}) {
  return (
    <div className="v-pager">
      <span>
        Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        {" · "}
        <label>
          Per page{" "}
          <select className="v-pagesize" value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}>
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </span>
      <div className="v-pager-controls">
        <button type="button" className="v-pagebtn" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Previous page">‹</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button type="button" className="v-pagebtn" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label="Next page">›</button>
      </div>
    </div>
  );
}
