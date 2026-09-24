import React from 'react';
import { motion } from 'framer-motion';
import { NotificationItem } from '../types';

interface NotificationPreviewProps {
  notification: NotificationItem;
}

const severityConfig: Record<string, {
  bg: string;
  border: string;
  text: string;
  icon: string;
  dot: string;
}> = {
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    icon: 'bi-info-circle-fill',
    dot: 'bg-sky-500'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'bi-exclamation-triangle-fill',
    dot: 'bg-amber-500'
  },
  danger: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: 'bi-shield-exclamation-fill',
    dot: 'bg-rose-500'
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'bi-check-circle-fill',
    dot: 'bg-emerald-500'
  }
};

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({ notification }) => {
  const config = severityConfig[notification.severity] || severityConfig.info;
  const icon = notification.icon || config.icon;

  return (
    <motion.div
      className={`relative ${config.bg} ${config.border} border rounded-xl p-3.5 hover:shadow-md transition-all duration-200 cursor-pointer group`}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Severity indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.dot} rounded-l-xl`} />
      
      <div className="flex items-start gap-3 pl-2">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center ${config.text}`}>
          <i className={`bi ${icon} text-base`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${config.text} text-sm leading-tight mb-1`}>
            {notification.title}
          </h4>
          <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
            {notification.description}
          </p>
          
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <i className="bi bi-clock" />
            <span>{notification.time}</span>
          </div>
        </div>
        
        {/* New indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`flex-shrink-0 w-2 h-2 ${config.dot} rounded-full`}
        />
      </div>
    </motion.div>
  );
};

NotificationPreview.displayName = 'NotificationPreview';
