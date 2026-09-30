"use client";
import { useMemo, useState } from "react";
import type { RouteDetailModel } from "../../types";
import RouteBalanceModal from "./RouteBalanceModal";

export default function AllStopsModal({ detail, onClose }: { detail: RouteDetailModel; onClose: () => void }) {
  const [sort, setSort] = useState("no-show");
  const stops = useMemo(() => {
    const list = [...detail.stops];
    if (sort === "postcode") list.sort((a, b) => a.postcode.localeCompare(b.postcode));
    if (sort === "no-show") list.sort((a, b) => (a.flag ? 1 : 0) - (b.flag ? 1 : 0));
    return list;
  }, [detail.stops, sort]);

  return (
    <RouteBalanceModal title={`All Stops / ${detail.routeId}`} variant="stops" wide onClose={onClose}>
      <div className="rbm-stops-tools">
        <div>PRE 12:<b>{detail.pre12Count}</b></div>
        <div>ASR:<b>{detail.asrCount}</b></div>
        <div>DSR:<b>{detail.dsrCount}</b></div>
        <label>SORT:
          <select aria-label="Sort stops" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="no-show">NO-SHOW</option><option value="postcode">POSTCODE</option><option value="default">DEFAULT</option>
          </select>
        </label>
      </div>
      <div className="rbm-table-scroll">
        <table className="rbm-table">
          <thead><tr><th>ADDRESS</th><th>POSTCODE</th><th>CUSTOMER</th><th>FLAG</th></tr></thead>
          <tbody>{stops.map((stop, index) => <tr key={index}>
            <td>{stop.address}</td><td>{stop.postcode}</td><td>{stop.customer}</td>
            <td>{stop.flag && <span className={`rbm-flag ${stop.flag}`}>{stop.flag === "PRE12" ? "PRE 12" : stop.flag}</span>}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </RouteBalanceModal>
  );
}
