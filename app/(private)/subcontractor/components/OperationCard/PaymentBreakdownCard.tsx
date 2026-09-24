"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PaymentBreakdownProps {
  baseValue: number;
  totalExtras: number;
}

function AnimatedCurrency({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, value);
      setDisplayValue(current);
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>£{displayValue.toFixed(2)}</span>;
}

export const PaymentBreakdown = memo(function PaymentBreakdown({
  baseValue,
  totalExtras,
}: PaymentBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 mb-3 box-border overflow-hidden border border-slate-100"
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-tr-full" />

      <div className="text-[0.85rem] font-bold mb-3.5 text-slate-800 uppercase flex items-center gap-2 relative z-10">
        <i className="bi bi-cash-stack text-green-600" />
        Payment Breakdown
      </div>

      <div className="grid grid-cols-2 gap-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.05 }}
          className="text-center bg-gradient-to-br from-green-50 to-white p-3 rounded-xl border border-green-100"
        >
          <i className="bi bi-currency-pound text-green-600 text-xl mb-2" />
          <span className="text-sm text-slate-600 font-medium mb-1 block">Base Rate</span>
          <div className="text-[clamp(1.75rem,6vw,2.25rem)] font-bold leading-none text-green-600">
            <AnimatedCurrency value={baseValue} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className="text-center bg-gradient-to-br from-orange-50 to-white p-3 rounded-xl border border-orange-100"
        >
          <i className="bi bi-plus-circle text-orange-600 text-xl mb-2" />
          <span className="text-sm text-slate-600 font-medium mb-1 block">Ad-hoc</span>
          <div className="text-[clamp(1.75rem,6vw,2.25rem)] font-bold leading-none text-orange-600">
            <AnimatedCurrency value={totalExtras} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

