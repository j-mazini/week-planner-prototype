import React, { memo } from 'react';
import { ModernPageHeader } from '@/components/modern-page-header';

interface RoutesHeaderProps {
  userFullName: string;
  currentDate: string;
}

const RoutesHeaderContent: React.FC<RoutesHeaderProps> = ({ currentDate }) => {
  return (
    <div className="mb-4">
      <ModernPageHeader
        title="Contract Management"
        subtitle={currentDate || undefined}
        metrics={[]}
        gradientFrom="slate-900"
        gradientTo="indigo-600"
      />
    </div>
  );
};

export const RoutesHeader: React.FC<RoutesHeaderProps> = memo(RoutesHeaderContent);

RoutesHeader.displayName = 'RoutesHeader';

