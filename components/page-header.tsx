"use client";

import React, { useMemo } from 'react';
import './page-header.css';

interface PageHeaderProps {
  title: string;
  showDate?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showDate = true 
}) => {
  const currentDate = useMemo(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
  }, []);

  return (
    <header className="page-header-section">
      <div className="page-header-welcome-text">
        <h1 className="page-header-title">{title}</h1>
        {showDate && (
          <div className="d-none d-md-block page-header-date">
            <i className="bi bi-calendar-event me-2"></i>
            <span>{currentDate}</span>
          </div>
        )}
      </div>
    </header>
  );
};
