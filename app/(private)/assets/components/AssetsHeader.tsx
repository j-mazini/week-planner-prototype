'use client';

import { memo } from 'react';
import { UserCard } from '@/components/user-card';

interface AssetsHeaderProps {
  userFullName: string;
  currentDate: string;
}

function AssetsHeaderContent({ currentDate }: AssetsHeaderProps) {
  return (
    <header className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 px-4 py-3 sm:px-5 sm:py-4 text-foreground shadow-md shadow-black/5 mb-6">
      {/* Glass highlights */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
      </div>
      <div className="relative z-10 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            <span className="bg-gradient-to-br from-slate-900 to-indigo-600 bg-clip-text text-transparent">
              Assets Management
            </span>
          </h1>
          {currentDate && (
            <p className="mt-1 text-sm text-slate-500">{currentDate}</p>
          )}
        </div>
        {/* Right side: User Card */}
        <div className="flex items-start justify-end gap-3">
          <UserCard />
        </div>
      </div>
    </header>
  );
}

export const AssetsHeader = memo(AssetsHeaderContent);
AssetsHeader.displayName = 'AssetsHeader';
