"use client";

import { useEffect, useMemo, useState } from "react";
import { VEHICLE_PAGE_SIZES } from "../constants";
import type { VehicleAttentionModel } from "../types";

export default function VehiclesPanel({ vehicles }: { vehicles: VehicleAttentionModel[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(VEHICLE_PAGE_SIZES[0]);

  const totalPages = Math.max(1, Math.ceil(vehicles.length / pageSize));

  useEffect(() => { setPage(1); }, [vehicles.length]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return vehicles.slice(start, start + pageSize);
  }, [vehicles, page, pageSize]);

  return (
    <section className="hp-panel" aria-label="Vehicles requiring attention">
      <div className="hp-panelhd">
        <div>
          <h2 className="hp-panelttl">Vehicles requiring attention</h2>
          <p className="hp-panelsub">VRN, brand, depot and reason</p>
        </div>
      </div>
      <div className="hp-panelbd">
        {vehicles.length === 0 ? (
          <div className="hp-empty">No vehicles requiring attention.</div>
        ) : (
          <div className="hp-tablewrap">
            <table className="hp-table">
              <thead>
                <tr>
                  <th>VRN</th>
                  <th>Brand</th>
                  <th>Depot</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((v) => (
                  <tr key={v.vehicleId}>
                    <td>{v.registrationPlate}</td>
                    <td>{v.brand}</td>
                    <td>{v.depotId}</td>
                    <td>{v.reasons.join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hp-pager">
              <span>
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, vehicles.length)} of {vehicles.length}
                {" · "}
                <label>
                  Per page{" "}
                  <select className="hp-pagesize" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                    {VEHICLE_PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              </span>
              <div className="hp-pager-controls">
                <button type="button" className="hp-pagebtn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">‹</button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" className="hp-pagebtn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page">›</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
