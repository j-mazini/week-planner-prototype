"use client";

import React, { useState, useEffect } from "react";
import { DeductionItem as DeductionItemType } from "../types";
import { formatDate } from "../utils";
import { deductionsStyles } from "../styles";
import ServicePartnerBadge from "@/components/service-partner-badge";
import { useServicePartnerNameByUserId } from "@/hooks/useServicePartnerNameByUserId";

interface DeductionItemComponentProps {
  deduction: DeductionItemType;
  currencyFormatter: Intl.NumberFormat;
  index?: number;
}

function AnimatedCurrency({ value, formatter }: { value: number; formatter: Intl.NumberFormat }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      current = Math.min(increment * step, value);
      setDisplayValue(current);
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{formatter.format(displayValue)}</span>;
}

export const DeductionItem = React.memo<DeductionItemComponentProps>(
  ({ deduction, currencyFormatter, index: _index = 0 }) => {
    const servicePartnerMap = useServicePartnerNameByUserId();
    const spName = deduction.userId ? servicePartnerMap.get(Number(deduction.userId)) ?? null : null;

    return (
      <div className={deductionsStyles.deductionRow}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className={`${deductionsStyles.deductionRef} flex items-center gap-1.5 flex-wrap`}>
              <i className={deductionsStyles.deductionRefIcon}></i>
              <span>{deduction.referenceNumber}</span>
              {spName !== null && (
                <ServicePartnerBadge partnerName={spName} size="xs" />
              )}
            </div>
            <div className={deductionsStyles.deductionDescription}>
              {deduction.description}
            </div>
          </div>
          <div className="text-right">
            <div className={deductionsStyles.deductionAmount}>
              <AnimatedCurrency
                value={parseFloat(deduction.amount)}
                formatter={currencyFormatter}
              />
            </div>
            <div className={deductionsStyles.deductionDate}>
              {formatDate(deduction.date)}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DeductionItem.displayName = "DeductionItem";


