"use client";

import { DepositMock } from "../../mockDailyGamePlanData";
import DriverTable from "./DriverTable";

type Props = {
  deposit: DepositMock;
  finished: boolean;
  onFinish: () => void;
  onEditDriver: (index: number) => void;
  onDeleteDriver: (index: number) => void;
};

export default function DepositBench({
  deposit,
  finished,
  onFinish,
  onEditDriver,
  onDeleteDriver,
}: Props) {
  const offCount = deposit.drivers.filter((d) => d.route === "OFF" || !d.route).length;
  const workingCount = deposit.drivers.length - offCount;

  return (
    <div className="dgp-bench">
      <div className="dgp-bench__card">
        <div className="dgp-bench__header">
          <div>
            <h2 className="dgp-bench__title">{deposit.key}</h2>
            <p className="dgp-bench__subtitle">
              Supervisor Lead: <span>{deposit.lead}</span>
            </p>
          </div>
          <div className="dgp-bench__actions">
            {finished ? (
              <span className="dgp-badge dgp-badge--finished">FINISHED</span>
            ) : (
              <button type="button" className="dgp-btn dgp-btn--finish" onClick={onFinish}>
                ⚑ FINISH
              </button>
            )}
          </div>
        </div>
        <div className="dgp-bench__stats">
          <div className="dgp-stat">
            <span className="dgp-stat__label">OFF</span>
            <span className="dgp-stat__value dgp-stat__value--off">{offCount}</span>
          </div>
          <div className="dgp-stat">
            <span className="dgp-stat__label">Working</span>
            <span className="dgp-stat__value dgp-stat__value--working">{workingCount}</span>
          </div>
        </div>
      </div>

      {deposit.hasData ? (
        <DriverTable
          drivers={deposit.drivers}
          canEdit={!finished}
          onEdit={onEditDriver}
          onDelete={onDeleteDriver}
        />
      ) : (
        <div className="dgp-empty-state">Awaiting data for this depot.</div>
      )}
    </div>
  );
}
