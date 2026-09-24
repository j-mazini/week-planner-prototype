'use client';

import React, { memo } from 'react';
import type { UserType } from '@/lib/types-config-api';

interface UserTypeCardProps {
  userType: UserType;
  onEdit: () => void;
}

export const UserTypeCard = memo<UserTypeCardProps>(({
  userType,
  onEdit
}) => {
  return (
    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-green-600 to-green-500" aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900">
              {userType.nameType || `User Type ${userType.userTypeId}`}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
            {userType.userTypeId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-hash text-[10px]" />
                ID: <span className="font-medium">{userType.userTypeId}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-800 transition hover:border-blue-200 hover:shadow"
            onClick={onEdit}
            title="Edit user type"
          >
            <i className="bi bi-pencil text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
});

UserTypeCard.displayName = 'UserTypeCard';


