"use client";
import type { RouteCardModel } from "../../types";
import RouteBalanceModal from "./RouteBalanceModal";

export default function SpecialDeliveriesModal({ route, onClose }: { route: RouteCardModel; onClose: () => void }) {
  const rows = route.specialDeliveries.flatMap((item, i) => Array.from({ length: item.total }, (_, j) => ({
    postcode: `${item.subpostcode} ${2 + i + j}AB`,
    customer: `Customer ${381 + i * 10 + j}`,
    category: j % 2 === 0 ? "DSR" : "ASR",
  })));
  return (
    <RouteBalanceModal title="Special Deliveries" variant="special" wide onClose={onClose}>
      <div className="rbm-table-scroll">
        <table className="rbm-table">
          <thead><tr><th>POSTCODE</th><th>CUSTOMER</th><th>CATEGORY</th></tr></thead>
          <tbody>{rows.map((row, i) => <tr key={i}>
            <td>{row.postcode}</td><td>{row.customer}</td><td><span className={`rbm-flag ${row.category}`}>{row.category}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </RouteBalanceModal>
  );
}
