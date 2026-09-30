"use client";

import { useMemo, useState } from "react";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import type { DiscoDeliveryModel, MyDeliveriesModel } from "../types";
import { filterDeliveries, getDepotSummary, getLoopSummary, getRouteSummary, uniqueSorted, type GroupSummary } from "../utils/discoUtils";

function BreakdownList({ title, tone, rows }: { title: string; tone: "pre12" | "asr" | "dsr"; rows: DiscoDeliveryModel[] }) {
  return (
    <div className="hp-minilist">
      <div className="hp-minilisthd">{title}</div>
      {rows.length === 0 ? (
        <div className="hp-miniempty">—</div>
      ) : (
        <div className="hp-minilistbody">
          {rows.map((d, i) => (
            <div className="hp-minirow" key={`${tone}-${i}`}>
              <b>{d.subpostcode || "—"}</b>
              <span>{d.address || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BreakdownCard({ name, badge, summary, showPre12, deliveries }: { name: string; badge: string; summary: GroupSummary; showPre12: boolean; deliveries: DiscoDeliveryModel[] }) {
  return (
    <div className="hp-card">
      <div className="hp-cardhd">
        <span className="hp-cardname">{name}</span>
        <span className="hp-pill">{badge}</span>
      </div>
      <div className="hp-cardmeta">
        {showPre12 && <span className="hp-metachip">Pre-12: {summary.pre12}</span>}
        <span className="hp-metachip">ASR: {summary.asr}</span>
        <span className="hp-metachip">DSR: {summary.dsr}</span>
      </div>
      {showPre12 && <BreakdownList title="PRE-12" tone="pre12" rows={deliveries.filter((d) => d.pre12)} />}
      <BreakdownList title="ASR" tone="asr" rows={deliveries.filter((d) => d.asr)} />
      <BreakdownList title="DSR" tone="dsr" rows={deliveries.filter((d) => d.dsr)} />
    </div>
  );
}

export default function MyDeliveriesPanel({ data }: { data: MyDeliveriesModel }) {
  const { showToast } = useToast();
  const [amPm, setAmPm] = useState<"AM" | "PM">("AM");
  const [depotFilter, setDepotFilter] = useState("");
  const [loopFilter, setLoopFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(
    () => filterDeliveries(data.deliveries, { slot: amPm, depot: depotFilter, loop: loopFilter, amRoutes: data.amRoutes, pmRoutes: data.pmRoutes }),
    [data, amPm, depotFilter, loopFilter],
  );

  const uniqueDepots = useMemo(() => uniqueSorted(filtered.map((d) => d.depot)), [filtered]);
  const uniqueLoops = useMemo(() => uniqueSorted(filtered.map((d) => d.loop)), [filtered]);
  const depotSummary = useMemo(() => (!depotFilter ? getDepotSummary(filtered) : []), [filtered, depotFilter]);
  const loopSummary = useMemo(() => (depotFilter ? getLoopSummary(filtered, depotFilter) : []), [filtered, depotFilter]);
  const routeSummary = useMemo(() => (depotFilter && loopFilter ? getRouteSummary(filtered) : []), [filtered, depotFilter, loopFilter]);

  const totalRoutes = useMemo(() => uniqueSorted(filtered.map((d) => d.route)).length, [filtered]);
  const pre12Count = filtered.filter((d) => d.pre12).length;
  const asrCount = filtered.filter((d) => d.asr).length;
  const dsrCount = filtered.filter((d) => d.dsr).length;
  const spr = totalRoutes > 0 ? filtered.length / totalRoutes : 0;

  const sortedForTable = useMemo(() => [...filtered].sort((a, b) => a.route.localeCompare(b.route)), [filtered]);

  return (
    <>
      <section className="hp-panel" aria-label="My deliveries">
        <button type="button" className="hp-panelhd-btn hp-panelhd" onClick={() => setModalOpen(true)}>
          <div>
            <h2 className="hp-panelttl">My deliveries <span className="hp-ext">↗</span></h2>
            <p className="hp-panelsub">These are your operations today — click for the full delivery list.</p>
          </div>
          <div className="hp-tile" style={{ minWidth: 72, textAlign: "center" }}>
            <span className="hp-tile-lbl">Stops</span>
            <span className="hp-tile-val">{filtered.length}</span>
          </div>
        </button>

        <div className="hp-panelbd">
          <div className="hp-seg" role="group" aria-label="Morning or afternoon">
            <button type="button" aria-pressed={amPm === "AM"} onClick={() => setAmPm("AM")}>AM</button>
            <button type="button" aria-pressed={amPm === "PM"} onClick={() => setAmPm("PM")}>PM</button>
          </div>

          <div className="hp-filters">
            <div className="hp-filtercol">
              <span className="hp-filterlbl">Depot</span>
              <div className="hp-chiprow">
                <button type="button" className="hp-chip" aria-pressed={!depotFilter} onClick={() => { setDepotFilter(""); setLoopFilter(""); }}>All</button>
                {uniqueDepots.map((d) => (
                  <button key={d} type="button" className="hp-chip" aria-pressed={depotFilter === d} onClick={() => { setDepotFilter(d); setLoopFilter(""); }}>{d}</button>
                ))}
              </div>
            </div>
            <div className="hp-filtercol">
              <span className="hp-filterlbl">Loop</span>
              <div className="hp-chiprow">
                <button type="button" className="hp-chip" aria-pressed={!loopFilter} onClick={() => setLoopFilter("")}>All</button>
                {uniqueLoops.map((l) => (
                  <button key={l} type="button" className="hp-chip" aria-pressed={loopFilter === l} onClick={() => setLoopFilter(l)}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="hp-tiles">
            <div className="hp-tile"><span className="hp-tile-lbl">Total deliveries</span><span className="hp-tile-val">{filtered.length}</span></div>
            <div className="hp-tile"><span className="hp-tile-lbl">Routes</span><span className="hp-tile-val">{totalRoutes}</span></div>
            <div className="hp-tile pre12"><span className="hp-tile-lbl">Pre-12</span><span className="hp-tile-val">{pre12Count}</span></div>
            <div className="hp-tile asr"><span className="hp-tile-lbl">ASR</span><span className="hp-tile-val">{asrCount}</span></div>
            <div className="hp-tile dsr"><span className="hp-tile-lbl">DSR</span><span className="hp-tile-val">{dsrCount}</span></div>
            <div className="hp-tile"><span className="hp-tile-lbl">SPR</span><span className="hp-tile-val">{totalRoutes ? spr.toFixed(1) : "—"}</span></div>
          </div>

          {!depotFilter && depotSummary.length > 0 && (
            <div className="hp-cards">
              {depotSummary.map(({ depot, summary }) => (
                <BreakdownCard
                  key={depot}
                  name={depot}
                  badge={`${summary.totalDeliveries} deliveries`}
                  summary={summary}
                  showPre12={amPm === "AM"}
                  deliveries={filtered.filter((d) => d.depot === depot)}
                />
              ))}
            </div>
          )}

          {depotFilter && !loopFilter && loopSummary.length > 0 && (
            <>
              <p className="hp-panelsub" style={{ maxWidth: "none", whiteSpace: "normal" }}>Depot loops: {depotFilter}</p>
              <div className="hp-cards">
                {loopSummary.map(({ loop, summary }) => (
                  <BreakdownCard
                    key={loop}
                    name={loop}
                    badge={`${summary.totalDeliveries} deliveries`}
                    summary={summary}
                    showPre12={amPm === "AM"}
                    deliveries={filtered.filter((d) => d.loop === loop)}
                  />
                ))}
              </div>
            </>
          )}

          {depotFilter && loopFilter && routeSummary.length > 0 && (
            <div className="hp-cards">
              {routeSummary.map(({ route, summary }) => (
                <BreakdownCard
                  key={route}
                  name={route}
                  badge={`${summary.totalDeliveries} stops`}
                  summary={summary}
                  showPre12={amPm === "AM"}
                  deliveries={filtered.filter((d) => d.route === route)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className="hp-linkbtn"
            onClick={() => showToast("Sample data already loaded (prototype — import is disabled).")}
          >
            Import a different delivery file
          </button>
        </div>
      </section>

      {modalOpen && (
        <Modal
          title="Full delivery list"
          onClose={() => setModalOpen(false)}
          classes={{ overlay: "hp-scrim", panel: "hp-dlg", header: "hp-dlghd", body: "hp-dlgbody", footer: "hp-dlgft", close: "hp-xbtn" }}
        >
          <p className="hp-dlgmeta">
            {filtered.length} delivery stops{depotFilter ? ` · Depot: ${depotFilter}` : ""}{loopFilter ? ` · Loop: ${loopFilter}` : ""} · {amPm} slot
          </p>
          {sortedForTable.length === 0 ? (
            <div className="hp-empty">No deliveries to show for the current filters.</div>
          ) : (
            <div className="hp-tablewrap" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <table className="hp-table">
                <thead>
                  <tr>
                    <th>Route</th><th>Depot</th><th>Loop</th><th>Subpostcode</th><th>Address</th><th>Recipient</th><th>Pre-12</th><th>ASR</th><th>DSR</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedForTable.map((d, i) => (
                    <tr key={i}>
                      <td>{d.route}</td>
                      <td>{d.depot}</td>
                      <td>{d.loop}</td>
                      <td>{d.subpostcode}</td>
                      <td>{d.address}</td>
                      <td>{d.recipient}</td>
                      <td>{d.pre12 ? "Yes" : "—"}</td>
                      <td>{d.asr ? "Yes" : "—"}</td>
                      <td>{d.dsr ? "Yes" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
