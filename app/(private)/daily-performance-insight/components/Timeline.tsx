import React from 'react';
import { motion } from 'framer-motion';
import { formatTime, shouldHighlightArrivalTime } from '../utils';
import { DailyPerformanceData } from '../types';
import { dailyPerformanceInsightStyles } from '../styles';

interface TimelineProps {
  operation: DailyPerformanceData;
}

export const Timeline = React.memo<TimelineProps>(({ operation }) => {
  const arrivalTimeHighlighted = shouldHighlightArrivalTime(operation.deliveryDetails.arriveTime);

  const timelineItems = [
    { 
      label: 'Departed', 
      value: formatTime(operation.deliveryDetails.departTime),
      icon: 'bi-arrow-right-circle',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      label: 'Break', 
      value: `${Math.round(operation.dailyMetrics.breakMinutes)} Min`,
      icon: 'bi-pause-circle',
      gradient: 'from-amber-500 to-amber-600'
    },
    { 
      label: 'Arrived', 
      value: formatTime(operation.deliveryDetails.arriveTime),
      icon: 'bi-check-circle',
      gradient: arrivalTimeHighlighted ? 'from-red-500 to-red-600' : 'from-emerald-500 to-emerald-600',
      highlighted: arrivalTimeHighlighted
    },
  ];

  return (
    <div className={dailyPerformanceInsightStyles.timelineContainer}>
      {/* Linha horizontal moderna */}
      <div className={dailyPerformanceInsightStyles.timelineLine} />
      
      {timelineItems.map((item) => (
        <div
          key={item.label}
          className={dailyPerformanceInsightStyles.timelineItem}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`${dailyPerformanceInsightStyles.timelineDot} bg-gradient-to-br ${item.gradient}`}
          >
            <i className={`bi ${item.icon} ${dailyPerformanceInsightStyles.timelineDotIcon}`} />
          </motion.div>
          {/* Two lines, not one string of HTML: the break is layout, and the
              value comes from the API. */}
          <div 
            className={`${dailyPerformanceInsightStyles.timelineLabel} ${item.highlighted ? dailyPerformanceInsightStyles.timelineLabelHighlighted : dailyPerformanceInsightStyles.timelineLabelDefault}`}
          >
            <span style={{ display: 'block' }}>{item.label}</span>
            <span style={{ display: 'block' }}>{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
});

Timeline.displayName = 'Timeline';

