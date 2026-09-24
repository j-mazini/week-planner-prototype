import React from 'react';
import { motion } from 'framer-motion';
import { NotificationCategory } from '../types';
import { cardStyles, categoryGradients, severityColors } from '../styles';

interface NotificationCategoryCardProps {
  category: NotificationCategory;
  index: number;
  onOpenModal: () => void;
  isSidebarOpen?: boolean;
}

const NotificationCategoryCardComponent: React.FC<NotificationCategoryCardProps> = ({
  category,
  index,
  onOpenModal,
  isSidebarOpen = false
}) => {
  const notificationCount = category.badgeCount ?? category.notifications.length;
  const styles = cardStyles.notification;
  const categoryGradient = categoryGradients[category.key] || 'from-slate-500 to-slate-600';
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenModal();
  };

  return (
    <motion.div
      className={styles.base}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0
      }}
      transition={{ 
        delay: index * 0.05, 
        type: 'spring', 
        stiffness: 260, 
        damping: 24
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
    >
      {/* Side gradient bar */}
      <div className={`${styles.bar.base} ${categoryGradient}`} />
      
      {/* Card content */}
      <div className={`relative flex flex-col h-full transition-all duration-300 ${
        isSidebarOpen ? styles.content.padding.sidebarOpen : styles.content.padding.sidebarClosed
      }`}>
        {/* Card header */}
        <div className={`${styles.header.container.base} ${
          isSidebarOpen ? styles.header.container.sidebarOpen : styles.header.container.sidebarClosed
        }`}>
          {/* Icon and title */}
          <div className={`flex items-start flex-1 min-w-0 transition-all duration-300 ${
            isSidebarOpen ? styles.header.iconTitle.gap.sidebarOpen : styles.header.iconTitle.gap.sidebarClosed
          }`}>
            <div className={`${styles.header.icon.base} ${categoryGradient} ${
              isSidebarOpen ? styles.header.icon.size.sidebarOpen : styles.header.icon.size.sidebarClosed
            }`}>
              <i className={`bi ${category.icon} transition-all duration-300 ${
                isSidebarOpen ? styles.header.icon.iconSize.sidebarOpen : styles.header.icon.iconSize.sidebarClosed
              }`} />
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`${styles.header.icon.badge.base} ${
                    isSidebarOpen ? styles.header.icon.badge.size.sidebarOpen : styles.header.icon.badge.size.sidebarClosed
                  }`}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </motion.span>
              )}
            </div>
            <div className={styles.header.title.container}>
              <h3 className={`${styles.header.title.text.base} ${
                isSidebarOpen ? styles.header.title.text.sidebarOpen : styles.header.title.text.sidebarClosed
              }`} title={category.title}>
                {category.title}
              </h3>
              <p className={`${styles.header.title.subtitle.base} ${
                isSidebarOpen ? styles.header.title.subtitle.sidebarOpen : styles.header.title.subtitle.sidebarClosed
              }`} title={category.subtitle}>
                {category.subtitle}
              </p>
            </div>
          </div>

          {/* Arrow icon */}
          <div className={styles.header.arrow.container}>
            <motion.div
              className={`${styles.header.arrow.button.base} ${
                isSidebarOpen ? styles.header.arrow.button.size.sidebarOpen : styles.header.arrow.button.size.sidebarClosed
              }`}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <i className={`bi bi-arrow-right transition-all duration-300 ${
                isSidebarOpen ? styles.header.arrow.button.iconSize.sidebarOpen : styles.header.arrow.button.iconSize.sidebarClosed
              }`} />
            </motion.div>
          </div>
        </div>

        {/* Preview of first notifications */}
        {category.notifications.length > 0 ? (
          <div className={`${styles.preview.container.base} ${
            isSidebarOpen ? styles.preview.container.sidebarOpen : styles.preview.container.sidebarClosed
          }`}>
            <div className={`transition-all duration-300 ${
              isSidebarOpen ? styles.preview.list.gap.sidebarOpen : styles.preview.list.gap.sidebarClosed
            }`}>
              {category.notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start group/notif transition-all duration-300 ${
                    isSidebarOpen ? styles.preview.item.gap.sidebarOpen : styles.preview.item.gap.sidebarClosed
                  }`}
                >
                  <div className={`${styles.preview.item.dot.base} ${
                    isSidebarOpen ? styles.preview.item.dot.size.sidebarOpen : styles.preview.item.dot.size.sidebarClosed
                  } ${
                    severityColors[notification.severity] || severityColors.info
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`${styles.preview.item.title.base} ${
                      isSidebarOpen ? styles.preview.item.title.size.sidebarOpen : styles.preview.item.title.size.sidebarClosed
                    }`}>
                      {notification.title}
                    </p>
                    <p className={`${styles.preview.item.time.base} ${
                      isSidebarOpen ? styles.preview.item.time.size.sidebarOpen : styles.preview.item.time.size.sidebarClosed
                    }`}>
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
              {category.notifications.length > 3 && (
                <div className="pt-2">
                  <p className={`${styles.preview.more.base} ${styles.preview.more.size}`}>
                    +{category.notifications.length - 3} more notifications
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`${styles.preview.container.base} ${
            isSidebarOpen ? styles.preview.container.sidebarOpen : styles.preview.container.sidebarClosed
          }`}>
            <div className="text-center py-2">
              <p className={`${styles.preview.empty.text.base} ${styles.preview.empty.text.size}`}>
                No notifications
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const NotificationCategoryCard = NotificationCategoryCardComponent;
NotificationCategoryCard.displayName = 'NotificationCategoryCard';
