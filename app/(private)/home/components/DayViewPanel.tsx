"use client";

import { useMemo, useState } from "react";
import Modal from "../../components/Modal";
import type { DayViewOperationModel, DepotDayStatus, DepotDayViewModel } from "../types";

const STATUS_LABEL: Record<DepotDayStatus, string> = {
  started: "Operation started",
  finished: "Operation finished",
  waiting: "Waiting for supervisor",
};

function OperationsTable({ label, adhoc, rows, full }: { label: string; adhoc?: boolean; rows: DayViewOperationModel[]; full?: boolean }) {
  return (
    <div>
      <div className={`hp-sectiontitle${adhoc ? " adhoc" : ""}`}>
        {adhoc ? <span className="hp-adhoclbl">ADHOC Services</span> : "Routes"}
      </div>
      {rows.length === 0 ? (
        <div className="hp-empty" style={{ marginTop: 6 }}>{adhoc ? "No ADHOC services for today." : "No routes for today."}</div>
      ) : (
        <div className="hp-tablewrap" style={{ marginTop: 6 }}>
          <table className={`hp-table${adhoc ? " adhoc" : ""}`}>
            <thead>
              <tr>
                <th>{adhoc ? "Service" : "Route"}</th>
                <th>Vendor</th>
                <th>Vehicle</th>
                {full && <th>Sort</th>}
                {full && <th>Notes</th>}
                {full && <th>Status</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((op, i) => (
                <tr key={`${label}-${adhoc ? "a" : "r"}-${i}`}>
                  <td>{op.label}</td>
                  <td>{op.vendorName ?? "—"}</td>
                  <td>{op.vehiclePlate ?? "—"}</td>
                  {full && <td>{op.sortOrder}</td>}
                  {full && <td>{op.notes ?? "—"}</td>}
                  {full && <td>{op.status}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DayViewPanel({ dayView }: { dayView: DepotDayViewModel[] }) {
  const [selectedDepotId, setSelectedDepotId] = useState(dayView[0]?.depotId ?? "");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDepotId, setModalDepotId] = useState(selectedDepotId);

  const selected = useMemo(() => dayView.find((d) => d.depotId === selectedDepotId) ?? dayView[0] ?? null, [dayView, selectedDepotId]);
  const modalSelected = useMemo(() => dayView.find((d) => d.depotId === modalDepotId) ?? dayView[0] ?? null, [dayView, modalDepotId]);

  if (!selected) {
    return (
      <section className="hp-panel" aria-label="Day view">
        <div className="hp-panelhd"><h2 className="hp-panelttl">Day view</h2></div>
        <div className="hp-panelbd"><div className="hp-empty">No deposits found.</div></div>
      </section>
    );
  }

  return (
    <>
      <section className="hp-panel" aria-label="Day view">
        <button type="button" className="hp-panelhd-btn hp-panelhd" onClick={() => { setModalDepotId(selectedDepotId); setModalOpen(true); }}>
          <div>
            <h2 className="hp-panelttl">Day view <span className="hp-ext">↗</span></h2>
            <p className="hp-panelsub">One tab per depot, with the daily operation — click for full details</p>
          </div>
        </button>
        <div className="hp-panelbd">
          <div className="hp-chiprow">
            {dayView.map((d) => (
              <button
                key={d.depotId}
                type="button"
                className="hp-chip"
                aria-pressed={d.depotId === selectedDepotId}
                onClick={() => setSelectedDepotId(d.depotId)}
              >
                {d.depotId}
              </button>
            ))}
          </div>

          <span className={`hp-status ${selected.status}`}>{STATUS_LABEL[selected.status]}</span>

          <OperationsTable label={selected.depotId} rows={selected.routes} />
          <OperationsTable label={selected.depotId} adhoc rows={selected.adhocServices} />
        </div>
      </section>

      {modalOpen && modalSelected && (
        <Modal
          title="Full operation"
          onClose={() => setModalOpen(false)}
          classes={{ overlay: "hp-scrim", panel: "hp-dlg", header: "hp-dlghd", body: "hp-dlgbody", footer: "hp-dlgft", close: "hp-xbtn" }}
        >
          <div className="hp-chiprow">
            {dayView.map((d) => (
              <button
                key={d.depotId}
                type="button"
                className="hp-chip"
                aria-pressed={d.depotId === modalDepotId}
                onClick={() => setModalDepotId(d.depotId)}
              >
                {d.depotId}
              </button>
            ))}
          </div>
          <span className={`hp-status ${modalSelected.status}`}>{STATUS_LABEL[modalSelected.status]}</span>
          <OperationsTable label={modalSelected.depotId} rows={modalSelected.routes} full />
          <OperationsTable label={modalSelected.depotId} adhoc rows={modalSelected.adhocServices} full />
        </Modal>
      )}
    </>
  );
}
