"use client";

import { DepositKey, DepositMock } from "../../mockDailyGamePlanData";

type Props = {
  deposits: Record<DepositKey, DepositMock>;
  selected: DepositKey;
  onSelect: (key: DepositKey) => void;
  finished: boolean;
};

const ORDER: DepositKey[] = ["BAOP", "LCY", "MSE", "LSE"];

export default function DepotAside({ deposits, selected, onSelect, finished }: Props) {
  return (
    <aside className="dgp-aside">
      {ORDER.map((key) => {
        const deposit = deposits[key];
        const isActive = key === selected;
        const configuredCount = deposit.drivers.length;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`dgp-depot-card${isActive ? " dgp-depot-card--active" : ""}`}
          >
            <span className="dgp-depot-card__status">
              {key === "BAOP" && finished ? "✓ FINISHED" : "PENDING"}
            </span>
            <span className="dgp-depot-card__name">{key}</span>
            <span className="dgp-depot-card__lead">
              <span className="dgp-depot-card__lead-label">Lead:</span> {deposit.lead}
            </span>
            <span className="dgp-depot-card__count">
              {deposit.hasData
                ? `● ${configuredCount} Drivers Configured`
                : "● no Drivers Configured"}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
