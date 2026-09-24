import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { NotificationCategory, NotificationItem } from '../types';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface NotificationModalProps {
  category: NotificationCategory | null;
  onClose: () => void;
  onClearNotifications?: (categoryKey: string) => void;
}

const severityConfig: Record<string, {
  bg: string;
  border: string;
  text: string;
  icon: string;
  dot: string;
  headerBg: string;
  iconBg: string;
}> = {
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    icon: 'bi-info-circle-fill',
    dot: 'bg-sky-500',
    headerBg: 'bg-sky-500',
    iconBg: 'bg-sky-100'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'bi-exclamation-triangle-fill',
    dot: 'bg-amber-500',
    headerBg: 'bg-amber-500',
    iconBg: 'bg-amber-100'
  },
  danger: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: 'bi-shield-exclamation-fill',
    dot: 'bg-rose-500',
    headerBg: 'bg-rose-500',
    iconBg: 'bg-rose-100'
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'bi-check-circle-fill',
    dot: 'bg-emerald-500',
    headerBg: 'bg-emerald-500',
    iconBg: 'bg-emerald-100'
  }
};

const categoryColors = {
  admin: 'from-purple-500 to-indigo-600',
  ops: 'from-blue-500 to-cyan-600',
  invoices: 'from-emerald-500 to-teal-600',
  compliance: 'from-amber-500 to-orange-600'
};

const NotificationItemCard: React.FC<{ 
  notification: NotificationItem; 
  index: number;
  onNavigate: (href: string) => void;
  fallbackHref?: string;
}> = ({ notification, index, onNavigate, fallbackHref }) => {
  const config = severityConfig[notification.severity] || severityConfig.info;
  const icon = notification.icon || config.icon;
  const targetHref = notification.href || fallbackHref;
  const hasLink = Boolean(targetHref);

  const handleClick = () => {
    if (targetHref) {
      onNavigate(targetHref);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      className={`relative ${config.bg} ${config.border} border-2 rounded-2xl p-5 transition-all duration-300 group ${
        hasLink ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-opacity-60' : ''
      }`}
      onClick={hasLink ? handleClick : undefined}
      whileHover={hasLink ? { x: 4 } : {}}
    >
      {/* Thicker severity side bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.dot} rounded-l-2xl`} />
      
      <div className="flex items-start gap-5 pl-4">
        {/* Improved icon */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${config.iconBg} ${config.border} border-2 flex items-center justify-center ${config.text} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <i className={`bi ${icon} text-xl`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4 className={`font-bold ${config.text} text-lg leading-tight flex-1`}>
              {notification.title}
            </h4>
            {hasLink && (
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.2, rotate: 15 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <i className="bi bi-arrow-up-right text-xl text-slate-400 group-hover:text-slate-600" />
              </motion.div>
            )}
          </div>
          
          <p className="text-sm text-slate-700 mb-4 leading-relaxed">
            {notification.description}
          </p>
          
          {/* Footer with timestamp and single redirect action */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200/50">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <i className="bi bi-clock text-sm" />
              <span className="font-medium">{notification.time}</span>
            </div>
            {hasLink && (
              <motion.button
                type="button"
                onClick={handleClick}
                className="px-3 py-1.5 rounded-lg border border-sky-200 text-sky-700 text-xs font-semibold bg-white hover:bg-sky-50 transition-all duration-200 flex items-center gap-1 shadow-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className="bi bi-box-arrow-up-right text-xs" />
                <span>Go to page</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const NotificationModal: React.FC<NotificationModalProps> = ({ category, onClose, onClearNotifications }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useBodyScrollLock(!!category);

  useEffect(() => {
    setIsOpen(!!category);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && category) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [category, onClose]);

  const handleNavigate = (href: string) => {
    onClose();
    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  const handleClearNotifications = () => {
    if (onClearNotifications && category) {
      onClearNotifications(category.key);
    }
  };

  if (!category) return null;

  const categoryGradient = categoryColors[category.key] || 'from-slate-500 to-slate-600';
  const notificationCount = category.notifications.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Improved backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Improved header */}
            <div className={`relative bg-gradient-to-r ${categoryGradient} px-8 py-6`}>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md text-white flex items-center justify-center shadow-xl border border-white/20">
                    <i className={`bi ${category.icon} text-3xl`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white leading-tight mb-1.5">
                      {category.title}
                    </h2>
                    <p className="text-sm text-white/95 font-medium">{category.subtitle}</p>
                  </div>
                </div>
                
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="w-12 h-12 rounded-xl bg-white/25 hover:bg-white/35 backdrop-blur-md text-white flex items-center justify-center transition-all duration-200 border border-white/20 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className="bi bi-x-lg text-xl" />
                </motion.button>
              </div>
              
            </div>

            {/* Improved notifications list */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 bg-gradient-to-b from-slate-50 to-white">
              {category.notifications.length > 0 ? (
                <>
                  {category.notifications.map((notification, index) => (
                    <NotificationItemCard
                      key={notification.id}
                      notification={notification}
                      index={index}
                      onNavigate={handleNavigate}
                      fallbackHref={category.link}
                    />
                  ))}
                </>
              ) : (
                <div className="py-16 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <i className="bi bi-inbox text-6xl text-slate-300 mb-4 block" />
                    <p className="text-slate-500 font-semibold text-lg">No notifications available</p>
                    <p className="text-slate-400 text-sm mt-2">Notifications will appear here when available</p>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Improved footer */}
            <div className="border-t border-slate-200 px-8 py-5 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="bi bi-bell text-slate-400" />
                  <p className="text-sm text-slate-600 font-medium">
                    <span className="font-bold text-slate-800">{notificationCount}</span> {notificationCount === 1 ? 'notification' : 'notifications'} in total
                  </p>
                </div>
                {notificationCount > 0 && onClearNotifications && (
                  <motion.button
                    type="button"
                    onClick={handleClearNotifications}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="bi bi-trash text-sm" />
                    <span>Clear all</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

NotificationModal.displayName = 'NotificationModal';
