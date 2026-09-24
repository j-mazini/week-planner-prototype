"use client";

import React, { memo, useMemo } from "react";
import { FadeIn } from '@/components/animations/page-animation';
import { ModernPageHeader } from "@/components/modern-page-header";
import { getDayNameEn, formatDate, getISOWeekNumber } from '@/app/(private)/week-planner/utils/dateUtils';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ActionBarProps {
    onRefresh: () => void;
    isLoading: boolean;
    /** Current view date in YYYY-MM-DD format */
    viewDate?: string;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

/**
 * Component representing the top action bar of the Daily Game Plan page.
 * Responsibility: Display the page title with date/day/week info.
 */
const ActionBar = memo(({
    viewDate,
    searchTerm,
    onSearchChange,
}: ActionBarProps) => {
    // Build the header title with date context: "Daily Game Plan - Monday - 09/04 - Week 15"
    const headerTitleContent = useMemo(() => {
        if (!viewDate || !/^\d{4}-\d{2}-\d{2}$/.test(viewDate)) return 'Daily Game Plan';
        const dayName = getDayNameEn(viewDate);
        const dateUK = formatDate(viewDate, 'dd/mm');
        const weekNum = getISOWeekNumber(viewDate);
        const weekNumber = weekNum !== null ? weekNum.toString().padStart(2, '0') : '00';
        return `Daily Game Plan - ${dayName} - ${dateUK} - Week ${weekNumber}`;
    }, [viewDate]);

    return (
        <FadeIn delay={0.1}>
            <div
                className="mb-8 daily-game-plan-header-wrapper"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-4">
                    <ModernPageHeader
                        title={headerTitleContent}
                        gradientFrom="slate-900"
                        gradientTo="blue-600"
                        showUserCard={false}
                    />

                    <div className="relative group/search w-full md:max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors duration-200 group-focus-within/search:text-blue-500" />
                        <Input
                            placeholder="Search route, vendor or vehicle..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-11 pl-12 pr-4 bg-white/50 backdrop-blur-md border-slate-200 rounded-xl transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 font-medium"
                        />
                    </div>
                </div>
            </div>
        </FadeIn>
    );
});

ActionBar.displayName = 'ActionBar';

export default ActionBar;
