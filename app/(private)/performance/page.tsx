"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MobileProfileHeader } from "../components/MobileProfileHeader";
import { GradientDotsBackground } from "@/components/gradient-dots-background";
import { PerformanceHeader } from "./components/PerformanceHeader";
import { MonthCarousel } from "./components/MonthCarousel";
import { MonthlyAverages } from "./components/MonthlyAverages";
import { DailyBreakdownTable } from "./components/DailyBreakdownTable";

type DayData = {
  day: number;
  dayOfWeek: number;
  stops: number | "N/A";
  sporH: string | "N/A";
  tw: string | "N/A";
  arrive: string | "N/A";
  sporHClass?: string;
  twClass?: string;
  arriveClass?: string;
};

export default function PerformancePage() {
  const today = useMemo(() => new Date("2025-10-10T12:00:00"), []);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [monthData, setMonthData] = useState<DayData[]>([]);

  const generateMonthData = useCallback((year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();
    const dayMap: Record<number, number> = {};
    for (let i = 0; i < daysInMonth; i++) {
      const dayOfWeek = (startDayOfWeek + i) % 7;
      dayMap[i + 1] = dayOfWeek;
    }

    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const isFutureMonth =
      year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());

    const generated: DayData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = dayMap[day];
      if (dayOfWeek === 0) continue; // Skip Sundays

      if (isFutureMonth || (isCurrentMonth && day > today.getDate())) {
        generated.push({ day, dayOfWeek, stops: "N/A", sporH: "N/A", tw: "N/A", arrive: "N/A" });
        continue;
      }

      const stops = 100 + Math.floor(Math.random() * 40);

      let sporH: string | "N/A";
      let sporHClass: string;
      const sporHRand = Math.random();
      if (sporHRand < 0.7) {
        sporH = (18.0 + Math.random() * 4).toFixed(1);
        sporHClass = "positive-value";
      } else if (sporHRand < 0.9) {
        sporH = (16.0 + Math.random() * 2).toFixed(1);
        sporHClass = "negative-value";
      } else {
        sporH = "N/A";
        sporHClass = "na-value";
      }

      let tw: string;
      let twClass: string;
      const twRand = Math.random();
      const twValue = twRand < 0.2 ? 0 : (twRand < 0.8 ? Math.random() * 5 : 5.1 + Math.random() * 5);
      
      if (twValue === 0) {
        tw = "--:--";
        twClass = "na-value";
      } else {
        tw = twValue.toFixed(1) + "%";
        twClass = twValue <= 5.0 ? "positive-value" : "negative-value";
      }

      let arrive: string;
      let arriveClass: string;
      if (Math.random() < 0.9) {
        arrive = (Math.random() * 2).toFixed(1) + "%";
        arriveClass = "positive-value";
      } else {
        arrive = (2.1 + Math.random() * 3).toFixed(1) + "%";
        arriveClass = "negative-value";
      }

      generated.push({
        day,
        dayOfWeek,
        stops,
        sporH,
        tw,
        arrive,
        sporHClass,
        twClass,
        arriveClass,
      });
    }
    setMonthData(generated);
  }, [today]);

  const averages = useMemo(() => {
    let totalSporH = 0;
    let countSporH = 0;
    let totalTw = 0;
    let countTw = 0;
    let totalArrive = 0;
    let countArrive = 0;

    monthData.forEach((d) => {
      if (d.sporH !== "N/A") {
        totalSporH += parseFloat(d.sporH);
        countSporH++;
      }
      // Calcula TW apenas para valores diferentes de 0 e "--:--"
      if (d.tw !== "N/A" && d.tw !== "--:--") {
        const twValue = parseFloat(d.tw);
        // Ignora valores 0
        if (twValue !== 0) {
          totalTw += twValue;
          countTw++;
        }
      }
      if (d.arrive !== "N/A") {
        totalArrive += parseFloat(d.arrive);
        countArrive++;
      }
    });

    if (countSporH === 0 && countTw === 0 && countArrive === 0 && monthData.length > 0) {
      return { sporH: "N/A", tw: "N/A", arrive: "N/A" } as const;
    }

    const avgSporH = countSporH > 0 ? (totalSporH / countSporH).toFixed(1) : "N/A";
    const avgTw = countTw > 0 ? (totalTw / countTw).toFixed(1) : "N/A";
    const avgArrive = countArrive > 0 ? (totalArrive / countArrive).toFixed(1) : "N/A";
    return { sporH: avgSporH, tw: avgTw, arrive: avgArrive } as const;
  }, [monthData]);

  const monthLabel = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth, 1);
    let monthName = selectedDate.toLocaleString("en-GB", { month: "long" });
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    return monthName;
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    generateMonthData(selectedYear, selectedMonth);
  }, [generateMonthData, selectedYear, selectedMonth]);

  const handleSelect = useCallback((year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, []);

  const monthsToDisplay = 12;
  const carouselItems = useMemo(() => {
    const items: { key: string; year: number; month: number; label: string }[] = [];
    for (let i = -monthsToDisplay + 1; i <= 0; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      let monthName = date.toLocaleString("en-GB", { month: "short" }).replace(".", "");
      monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      items.push({ key: `${year}-${month}`, year, month, label: `${monthName}/${year}` });
    }
    return items;
  }, [today]);


  return (
    <GradientDotsBackground className="relative min-h-screen z-[1] pointer-events-auto overflow-x-hidden w-full">
      <div className="min-h-screen md:pb-12 pb-[70px]">
        {/* Safe area no topo */}
        <div className="md:hidden" style={{ height: 'env(safe-area-inset-top, 0px)', minHeight: 'env(safe-area-inset-top, 0px)' }}></div>
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto px-4 sm:px-6 lg:px-10 pt-5 sm:pt-8 lg:pt-9 pb-12 lg:pb-14 relative z-[1]"
        >
          <MobileProfileHeader />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="pt-6 max-w-screen-sm mx-auto"
          >
            <PerformanceHeader />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <MonthCarousel
                items={carouselItems}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onSelect={handleSelect}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <MonthlyAverages monthLabel={monthLabel} averages={averages} />

              <DailyBreakdownTable monthData={monthData} />
            </motion.div>
          </motion.div>
        </motion.main>

        {/* Safe area no rodapé */}
        <div className="md:hidden" style={{ height: 'env(safe-area-inset-bottom, 0px)', minHeight: 'env(safe-area-inset-bottom, 0px)' }}></div>
      </div>
    </GradientDotsBackground>
  );
}


