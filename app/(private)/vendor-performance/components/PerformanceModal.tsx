"use client";

import { useMemo, useEffect, useRef, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import type { DailyPerformanceData } from '@/lib/vendor-performance-api';
import type { ProcessedVendor } from '../utils';
import { formatMonthYear, getTimeWindowClass, generateCarouselMonths } from '../utils';
import { LoadingSpinner } from './LoadingSpinner';
import { AnimatedMetricChart } from './AnimatedMetricChart';
import { PerformanceTableRow } from './PerformanceTableRow';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export interface VendorMonthAverages {
  avgTw: string;
  avgSpr: string;
  avgSporH: string;
  avgAfd: string;
}

const EMPTY_AVERAGES: VendorMonthAverages = { avgTw: '--:--', avgSpr: '--:--', avgSporH: '--:--', avgAfd: '--:--' };

interface PerformanceModalProps {
  show: boolean;
  vendor: ProcessedVendor | null;
  selectedYear: number;
  selectedMonth: number;
  monthData: DailyPerformanceData[];
  /** Médias do mês pré-computadas pelo backend (currentMonth de /bff/daily-overview/list). */
  averages?: VendorMonthAverages;
  loading: boolean;
  onClose: () => void;
  onMonthSelect: (year: number, month: number) => void;
}

function PerformanceModalComponent({
  show,
  vendor,
  selectedYear,
  selectedMonth,
  monthData,
  averages = EMPTY_AVERAGES,
  loading,
  onClose,
  onMonthSelect
}: PerformanceModalProps) {
  const today = useMemo(() => new Date(), []);
  const carouselMonths = useMemo(() => generateCarouselMonths(today), [today]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Control body overflow when modal is open
  useBodyScrollLock(show);

  // Scroll carousel to selected month when modal opens or month changes
  useEffect(() => {
    if (show && carouselRef.current) {
      const selectedMonthIndex = carouselMonths.findIndex(
        item => item.year === selectedYear && item.month === selectedMonth
      );

      if (selectedMonthIndex !== -1) {
        // Wait for animations to complete before scrolling
        const timeoutId = setTimeout(() => {
          const carouselItems = carouselRef.current?.querySelectorAll('[data-month-item]');
          if (carouselItems && carouselItems[selectedMonthIndex]) {
            carouselItems[selectedMonthIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        }, 400); // Wait for modal animation to complete

        return () => clearTimeout(timeoutId);
      }
    }
  }, [show, carouselMonths, selectedYear, selectedMonth]);

  const calculateAverages = averages;

  // Memoize table data processing
  const processedTableRows = useMemo(() => {
    const daysWithData = monthData.filter(dayData => {
      return !(
        dayData.route === 'N/A' &&
        dayData.stops === 'N/A' &&
        dayData.sporH === 'N/A' &&
        dayData.tw === 'N/A' &&
        dayData.spr === 'N/A'
      );
    });

    if (daysWithData.length === 0) {
      return (
        <tr>
          <td colSpan={16} className="text-center py-8 text-gray-400 italic">
            No data available for this month.
          </td>
        </tr>
      );
    }
    
    return daysWithData.reverse().map((dayData, idx) => (
      <PerformanceTableRow key={`${dayData.day}-${dayData.route}-${idx}`} dayData={dayData} index={idx} />
    ));
  }, [monthData]);

  if (!mounted) return null;

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  const modalContent = (
    <AnimatePresence>
      {show && vendor && (
        <>
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-[1050]"
          />
          <div
            className="fixed inset-0 z-[1055] overflow-auto flex items-start justify-center p-4"
          >
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-xl w-full max-w-7xl my-8 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <motion.div 
                key={`header-${show}`}
                className="flex items-center justify-between p-6 border-b border-gray-200"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                <h5 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {vendor.firstName} {vendor.lastName} - Performance
                </h5>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>

              {/* Body */}
              <div className="flex-1 overflow-auto p-6">
                {/* Date Carousel */}
                <div className="mb-6">
                  <div 
                    className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 touch-pan-x"
                    ref={carouselRef}
                  >
                    {carouselMonths.map((item, _idx) => {
                      const isActive = item.year === selectedYear && item.month === selectedMonth;
                      
                      return (
                        <button
                          key={`${item.year}-${item.month}`}
                          data-month-item
                          className={`px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap text-sm font-medium transition-all duration-200 border flex-shrink-0
                            ${isActive 
                              ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' 
                              : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50'
                            }`}
                          onClick={() => onMonthSelect(item.year, item.month)}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Metrics Card with Animated Charts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                  <h6 className="text-base font-semibold text-slate-800 mb-4">
                    {vendor.firstName} {vendor.lastName} - {formatMonthYear(selectedYear, selectedMonth)} Performance
                  </h6>
                  <div className="flex flex-wrap gap-4">
                    <AnimatedMetricChart 
                      label="TW" 
                      value={calculateAverages.avgTw}
                      className={getTimeWindowClass(calculateAverages.avgTw)}
                      isNA={calculateAverages.avgTw === '--:--'}
                      type="gauge"
                    />
                    <AnimatedMetricChart 
                      label="SPR" 
                      value={calculateAverages.avgSpr}
                      isNA={calculateAverages.avgSpr === '--:--'}
                      type="thermometer"
                    />
                    <AnimatedMetricChart 
                      label="SPOR-H" 
                      value={calculateAverages.avgSporH}
                      isNA={calculateAverages.avgSporH === '--:--'}
                      type="clock"
                    />
                    <AnimatedMetricChart 
                      label="AFD" 
                      value={calculateAverages.avgAfd}
                      className="text-blue-600"
                      isNA={calculateAverages.avgAfd === '--:--'}
                      type="gauge"
                    />
                  </div>
                </div>

                {/* Daily Breakdown Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b-2 border-blue-600">
                    <h6 className="text-base font-bold text-slate-800">
                      Daily Breakdown
                    </h6>
                  </div>
                  {loading ? (
                    <div className="p-8">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b-2 border-blue-600">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Day</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Route</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Not Received">NR</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Failed Pick">FP</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Business Address">BA</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Not Home">NH</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Customer">CM</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Closed on Arrival">CA</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Pick Up">PU</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="OK">OK</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Home Not">HN</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Paid">PD</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">SPR</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">SPOR-H</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Route Hours (worked hours)">HR RTE</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide" title="Route Time Window %">RTW</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">AFD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processedTableRows}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

export const PerformanceModal = memo(PerformanceModalComponent);
