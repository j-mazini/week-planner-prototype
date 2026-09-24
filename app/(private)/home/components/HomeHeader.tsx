import React, { memo } from 'react';
import { ModernPageHeader } from '@/components/modern-page-header';

interface HomeHeaderProps {
  userFullName: string;
  currentDate: string;
}

const HomeHeaderContent: React.FC<HomeHeaderProps> = ({ userFullName, currentDate }) => {
  return (
    <div className="mb-3 sm:mb-4">
      <ModernPageHeader
        title={`Welcome, ${userFullName || 'User'}!`}
        subtitle={currentDate || undefined}
        metrics={[]}
        gradientFrom="slate-900"
        gradientTo="blue-600"
      />
    </div>
  );
};

export const HomeHeader: React.FC<HomeHeaderProps> = memo(HomeHeaderContent);

HomeHeader.displayName = 'HomeHeader';
