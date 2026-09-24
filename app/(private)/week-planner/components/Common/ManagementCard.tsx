"use client";

import React from 'react';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';

type ManagementCardProps = {
  assignment: WeekPlannerRecord;
  onEdit: (assignment: WeekPlannerRecord) => void;
  compact?: boolean;
};

const ManagementCard: React.FC<ManagementCardProps> = ({
  assignment,
  onEdit,
  compact = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(assignment);
  };

  const sizeClasses = compact
    ? 'text-[0.65rem] px-1 py-0.5 gap-0.5'
    : 'text-[0.72rem] px-1.5 py-0.5 gap-1';

  return (
    <div
      className={[
        'group relative overflow-hidden w-full flex-1',
        'flex flex-col justify-center items-start',
        'border rounded-lg cursor-pointer',
        'transition-all duration-200',
        'select-none',
        sizeClasses,
        // Management: Azul claro
        'bg-[linear-gradient(135deg,rgba(59,130,246,0.25),rgba(37,99,235,0.3))]',
        'border-[rgba(59,130,246,0.5)]',
        'shadow-[0_10px_18px_rgba(59,130,246,0.15)]',
        'hover:bg-[linear-gradient(135deg,rgba(59,130,246,0.35),rgba(37,99,235,0.4))]',
        'hover:border-[rgba(59,130,246,0.7)]',
      ].join(' ')}
      data-assignment-id={assignment.weekPlannerId}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1 w-full min-w-0">
        <span className={`font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${compact ? 'text-[0.65rem]' : ''}`}>
          {assignment.name}
        </span>
      </div>
    </div>
  );
};

export default ManagementCard;

