"use client";

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface AnimatedMetricChartProps {
  label: string;
  value: string;
  className?: string;
  isNA?: boolean;
  type?: 'gauge' | 'bar' | 'circular' | 'clock' | 'thermometer';
}

export const AnimatedMetricChart = memo(function AnimatedMetricChart({
  label,
  value,
  className = '',
  isNA = false,
  type = 'gauge'
}: AnimatedMetricChartProps) {
  // Parse value to number
  const numericValue = useMemo(() => {
    if (isNA || value === '--:--' || value === 'N/A') return 0;
    const cleaned = value.replace('%', '').replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }, [value, isNA]);

  // Determine max value based on metric type
  const maxValue = useMemo(() => {
    if (type === 'clock') return 20; // Stops per hour
    if (type === 'thermometer') return 100; // Stop Rate (%)
    if (label === 'TW' || label === 'AFD') return 100; // Percentage metrics
    if (label === 'SPR') return 200; // Stops per route
    if (label === 'SPOR-H') return 20; // Stops per hour
    return 100;
  }, [label, type]);

  const percentage = useMemo(() => {
    return Math.min((numericValue / maxValue) * 100, 100);
  }, [numericValue, maxValue]);

  const barTextClassName = useMemo(() => {
    if (isNA) return 'text-gray-400';
    // When the fill is reasonably tall, the number sits on top of a strong color → use white text.
    // Otherwise, use a dark text for readability on the light background.
    return percentage >= 35 ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]' : (className || 'text-slate-800');
  }, [isNA, percentage, className]);

  // Get color based on value and metric type
  const color = useMemo(() => {
    if (isNA) return '#9CA3AF';
    if (className.includes('text-green')) return '#10B981';
    if (className.includes('text-yellow')) return '#F59E0B';
    if (className.includes('text-red')) return '#EF4444';
    if (className.includes('text-blue')) return '#3B82F6';
    return '#6366F1';
  }, [isNA, className]);

  if (type === 'clock') {
    const angle = Math.min((numericValue / maxValue) * 360, 360);
    const isClockNA = isNA || value === '--:--' || value === 'N/A';

    return (
      <div className="flex-1 min-w-[100px] p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200">
        <span className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wide">
          {label}
        </span>

        {/* Clock dial */}
        <div className="relative w-20 h-20 mb-1.5">
          <div className="absolute inset-0 rounded-full bg-white shadow-inner border border-gray-200" />

          {/* Ticks - string coords to avoid server/client float mismatch (hydration) */}
          <svg className="absolute inset-0" viewBox="0 0 120 120" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * 2 * Math.PI;
              const fmt = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
              const x1 = fmt(60 + Math.cos(a) * 44);
              const y1 = fmt(60 + Math.sin(a) * 44);
              const x2 = fmt(60 + Math.cos(a) * 50);
              const y2 = fmt(60 + Math.sin(a) * 50);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#CBD5E1"
                  strokeWidth={i % 3 === 0 ? 3 : 2}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Hand */}
          <motion.div
            className="absolute left-1/2 top-1/2 w-[2px] h-[42px] rounded-full"
            style={{
              background: isClockNA ? '#9CA3AF' : color,
              transformOrigin: '50% 100%',
              boxShadow: isClockNA ? undefined : `0 0 10px ${color}55`,
              translateX: '-50%',
              translateY: '-100%',
            }}
            initial={{ rotate: -90 }}
            animate={{ rotate: -90 + angle }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
          />

          {/* Center hub */}
          <div
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
            style={{
              background: isClockNA ? '#9CA3AF' : color,
              transform: 'translate(-50%, -50%)',
              boxShadow: isClockNA ? undefined : `0 0 10px ${color}55`,
            }}
          />
        </div>

        <motion.div
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
          style={{
            borderColor: isClockNA ? '#E5E7EB' : `${color}55`,
            background: isClockNA ? '#F3F4F6' : `${color}10`,
            color: isClockNA ? '#6B7280' : color,
          }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          {value} / hour
        </motion.div>
      </div>
    );
  }

  if (type === 'thermometer') {
    const p = Math.max(0, Math.min(percentage, 100));
    const marker = `${p}%`;
    const isThermoNA = isNA || value === '--:--' || value === 'N/A';

    return (
      <div className="flex-1 min-w-[100px] p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
        <span className="text-[10px] font-semibold text-slate-500 uppercase mb-1 tracking-wide text-center">
          {label}
        </span>

        <div className="relative mt-0.5">
          {/* Value badge */}
          <motion.div
            className="absolute -top-6"
            style={{ left: marker, transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
          >
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white shadow-sm">
              {value}
            </span>
          </motion.div>

          {/* Track */}
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${color}aa, ${color})`,
                boxShadow: `0 0 18px ${color}33`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${p}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
            />
          </div>

          {/* Ticks */}
          <div className="mt-1.5 flex justify-between text-[8px] text-slate-400 select-none">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>

          {!isThermoNA && (
            <motion.div
              className="mt-1 text-center text-[10px] text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.45 }}
            >
              Stop Rate
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'gauge') {
    return (
      <div className="flex-1 min-w-[100px] p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200">
        <span className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wide">
          {label}
        </span>
        
        {/* Gauge Chart */}
        <div className="relative w-20 h-20 mb-0">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            {/* Animated progress circle */}
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 50 * (1 - percentage / 100)
              }}
              transition={{ 
                duration: 1.5, 
                ease: "easeOut",
                delay: 0.2
              }}
              style={{
                filter: `drop-shadow(0 0 4px ${color}80)`
              }}
            />
          </svg>
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className={`text-sm font-bold ${isNA ? 'text-gray-400' : className || 'text-slate-800'}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.1 }}
            >
              {value}
            </motion.span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="flex-1 min-w-[100px] p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
        <span className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wide text-center">
          {label}
        </span>
        
        {/* Bar Chart */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="relative h-16 bg-gray-100 rounded overflow-hidden">
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-lg"
              style={{ 
                background: `linear-gradient(to top, ${color}, ${color}dd)`,
                boxShadow: `0 -4px 12px ${color}40`
              }}
              initial={{ height: 0 }}
              animate={{ height: `${percentage}%` }}
              transition={{ 
                duration: 1.5, 
                ease: "easeOut",
                delay: 0.2
              }}
            />
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-full opacity-30"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`
              }}
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "linear"
              }}
            />
            {/* Value overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <motion.span
                className={`text-lg font-bold ${barTextClassName}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {value}
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Circular progress
  return (
    <div className="flex-1 min-w-[100px] p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200">
      <span className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wide">
        {label}
      </span>
      
      {/* Circular Progress */}
      <div className="relative w-20 h-20 mb-0">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="10"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 50 * (1 - percentage / 100)
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut",
              delay: 0.2
            }}
            style={{
              filter: `drop-shadow(0 0 4px ${color}80)`
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-sm font-bold ${isNA ? 'text-gray-400' : className || 'text-slate-800'}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.1 }}
          >
            {value}
          </motion.span>
        </div>
      </div>
    </div>
  );
});
