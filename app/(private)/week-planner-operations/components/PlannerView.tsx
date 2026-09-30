"use client";



import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { ChevronLeft, ChevronRight, Calendar, Download, CheckCircle, Sparkles, UserMinus } from 'lucide-react';

import WeeklyView from './WeeklyView';

// DailyView removed - only weekly view is available

import VendorList from './VendorList';

import DayOffModal, { type DayOffEntry } from './DayOffModal';

import type { WeekPlannerRecord } from '../contexts/PlannerContext';

import type { Route } from '@/lib/api/routes';

import type { Vendor } from '@/lib/vendors';

import { getWeekDates, formatDate, getWeekStart, getWeekEnd } from '../utils/dateUtils';

import { registerDayOff, deleteDayOff } from '@/lib/day-off-api';

import '../planner-styles.css';



type PlannerViewProps = {

  date: string; // YYYY-MM-DD format

  data: {

    assignments: WeekPlannerRecord[];

    routes: Route[];

    vendors: Vendor[];

  };

  dayOffEntries?: DayOffEntry[];

  onDrop: (e: React.DragEvent<Element>, routeId: number, dateStr: string) => void;

  onEdit: (assignment: WeekPlannerRecord) => void;

  onAssignVendor?: (userId: number, routeId: number, date: string) => void;

  onDateChange?: (date: string) => void;

  onExport?: () => void;

  onSubmitWeek?: () => void;

  onDefaultSchedule?: () => void;

  onDayOffChange?: (entries: DayOffEntry[]) => void;

  onAssignmentDelete?: (assignmentId: string | number) => Promise<void>;

};



const PlannerView: React.FC<PlannerViewProps> = ({

  date,

  data,

  dayOffEntries = [],

  onDrop,

  onEdit,

  onAssignVendor,

  onDateChange,

  onExport,

  onSubmitWeek,

  onDefaultSchedule,

  onDayOffChange,

  onAssignmentDelete,

}) => {

  // Always use weekly view - daily view removed

  const [_isSidebarCollapsed, _setIsSidebarCollapsed] = useState(false);

  const [showWeekends, setShowWeekends] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date(date));

  const [showDayOffModal, setShowDayOffModal] = useState(false);

  const [localDayOffEntries, setLocalDayOffEntries] = useState<DayOffEntry[]>(dayOffEntries);

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const [successWeekRange, setSuccessWeekRange] = useState<string>('');

  

  // Use ref to track previous dayOffEntries to avoid infinite loops

  const prevDayOffEntriesRef = useRef<string>(JSON.stringify(dayOffEntries));

  const isInternalUpdateRef = useRef(false);



  // Calculate week dates - always weekly view

  const weekDates = useMemo(() => {

    return getWeekDates(date);

  }, [date]);



  const weekStart = useMemo(() => getWeekStart(new Date(date)), [date]);

  const weekEnd = useMemo(() => getWeekEnd(new Date(date)), [date]);



  // Format week range for display

  const weekRangeDisplay = useMemo(() => {

    return `${formatDate(weekStart, 'dd/mm')} - ${formatDate(weekEnd, 'dd/mm')}`;

  }, [weekStart, weekEnd]);



  // Get ISO week number

  const getISOWeekNumber = useCallback((date: Date): number | null => {

    if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {

      return null;

    }

    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    const dayNumber = target.getUTCDay() || 7;

    target.setUTCDate(target.getUTCDate() + 4 - dayNumber);

    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));

    const weekNumber = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

    return Number.isFinite(weekNumber) ? weekNumber : null;

  }, []);



  const weekNumber = useMemo(() => {

    const week = getISOWeekNumber(new Date(date));

    return week !== null ? week.toString().padStart(2, '0') : '00';

  }, [date, getISOWeekNumber]);



  // Show success animation

  const handleSubmitSuccess = useCallback(() => {

    setSuccessWeekRange(weekRangeDisplay);

    setShowSuccessAnimation(true);

    setTimeout(() => {

      setShowSuccessAnimation(false);

    }, 5000);

  }, [weekRangeDisplay]);



  // Update current date when prop changes

  useEffect(() => {

    setCurrentDate(new Date(date));

  }, [date]);



  // Sync local day off entries with prop - using ref to prevent infinite loops

  useEffect(() => {

    // Skip update if this is an internal update (from our own handlers)

    if (isInternalUpdateRef.current) {

      isInternalUpdateRef.current = false;

      return;

    }

    

    // Compare by JSON string to check if arrays are actually different

    const currentStr = JSON.stringify(dayOffEntries);

    const prevStr = prevDayOffEntriesRef.current;

    

    // Only update if the arrays are actually different

    if (prevStr !== currentStr) {

      setLocalDayOffEntries(dayOffEntries);

      prevDayOffEntriesRef.current = currentStr;

    }

  }, [dayOffEntries]);



  // Header metrics

  const headerMetrics = useMemo(() => {

    const weekDateStrs = weekDates.map(d => formatDate(d, 'yyyy-mm-dd'));

    const assignmentsCount = data.assignments.filter(a => 

      weekDateStrs.includes(a.date)

    ).length;



    const uniqueVendors = new Set(

      data.assignments

        .filter(a => weekDateStrs.includes(a.date))

        .map(a => a.name)

    ).size;



    return {

      assignments: assignmentsCount,

      vendors: uniqueVendors,

    };

  }, [data.assignments, weekDates]);



  // Date navigation - always weekly

  const handlePrev = () => {

    const newDate = new Date(currentDate);

    newDate.setDate(newDate.getDate() - 7);

    const dateStr = formatDate(newDate, 'yyyy-mm-dd');

    setCurrentDate(newDate);

    onDateChange?.(dateStr);

  };



  const handleNext = () => {

    const newDate = new Date(currentDate);

    newDate.setDate(newDate.getDate() + 7);

    const dateStr = formatDate(newDate, 'yyyy-mm-dd');

    setCurrentDate(newDate);

    onDateChange?.(dateStr);

  };



  const handleToday = () => {

    const today = new Date();

    const dateStr = formatDate(today, 'yyyy-mm-dd');

    setCurrentDate(today);

    onDateChange?.(dateStr);

  };



  // Month and year selection

  const months = Array.from({ length: 12 }, (_, i) => {

    const date = new Date(2000, i, 1);

    return {

      value: i,

      label: date.toLocaleDateString('en-US', { month: 'long' }),

    };

  });



  const currentYear = currentDate.getFullYear();

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);



  const handleMonthChange = (month: number) => {

    const newDate = new Date(currentDate);

    newDate.setMonth(month);

    const dateStr = formatDate(newDate, 'yyyy-mm-dd');

    setCurrentDate(newDate);

    onDateChange?.(dateStr);

  };



  const handleYearChange = (year: number) => {

    const newDate = new Date(currentDate);

    newDate.setFullYear(year);

    const dateStr = formatDate(newDate, 'yyyy-mm-dd');

    setCurrentDate(newDate);

    onDateChange?.(dateStr);

  };



  // Daily view removed - always use weekly view

  // const toggleViewMode = () => {

  //   setViewMode(prev => prev === 'weekly' ? 'daily' : 'weekly');

  // };



  // Handle day off registration

  const handleSaveDayOff = async (dayOffData: { userId: number; dates: string[]; reason: string; notes: string }) => {

    try {

      // Check for conflicting assignments

      const conflictingAssignments = data.assignments.filter(a => 

        a.name && 

        dayOffData.dates.includes(a.date) &&

        data.vendors.find(d => d.userId === dayOffData.userId)?.fullName === a.name

      );



      if (conflictingAssignments.length > 0) {

        const assignmentSummary = conflictingAssignments

          .map(assignment => {

            const dateLabel = formatDate(new Date(assignment.date), 'dd/mm');

            return `${dateLabel} • ${assignment.route}`;

          })

          .join('\n');



        const confirmMessage = [

          'The vendor is assigned on the following days/routes:',

          assignmentSummary,

          '',

          'Do you want to automatically remove these assignments and register the day off?'

        ].join('\n');



        const confirmed = window.confirm(confirmMessage);

        if (!confirmed) {

          throw new Error('Operation cancelled. Remove assignments manually or adjust the period.');

        }



        // Delete conflicting assignments

        if (onAssignmentDelete) {

          for (const assignment of conflictingAssignments) {

            await onAssignmentDelete(assignment.weekPlannerId);

          }

        }

      }



      // Check for conflicting day off entries

      const conflictingDayOff = localDayOffEntries.find(entry => 

        entry.userId === dayOffData.userId && 

        dayOffData.dates.includes(entry.date)

      );



      if (conflictingDayOff) {

        throw new Error('There is already a day off registered for this vendor on one of the selected dates.');

      }



      // Register day off

      const createdEntries = await registerDayOff(dayOffData);

      const newEntries = [...localDayOffEntries, ...createdEntries];

      setLocalDayOffEntries(newEntries);

      

      // Mark as internal update to prevent loop

      isInternalUpdateRef.current = true;

      const newEntriesStr = JSON.stringify(newEntries);

      prevDayOffEntriesRef.current = newEntriesStr;

      onDayOffChange?.(newEntries);

    } catch (error: unknown) {

      throw error;

    }

  };



  // Handle day off removal

  const handleRemoveDayOff = async (entryId: string) => {

    try {

      await deleteDayOff(entryId);

      const newEntries = localDayOffEntries.filter(e => e.id !== entryId);

      setLocalDayOffEntries(newEntries);

      

      // Mark as internal update to prevent loop

      isInternalUpdateRef.current = true;

      const newEntriesStr = JSON.stringify(newEntries);

      prevDayOffEntriesRef.current = newEntriesStr;

      onDayOffChange?.(newEntries);

    } catch (error: unknown) {

      console.error('Failed to remove day off:', error);

      alert('Could not remove day off. Please try again.');

    }

  };



  return (

    <div className="planner-page-wrapper">

      {/* Page Header */}

      <div className="planner-page-header mb-6">

        <div className="planner-page-header-top">

          <div className="planner-page-title-area">

            <div className="planner-page-title-stack">

              <h1 className="planner-page-title">

                Weekly Planner

              </h1>

              <p className="planner-page-subtitle">

                Weekly overview - Week {weekNumber}

              </p>

            </div>

          </div>



          {/* Header Metrics */}

          <div className="planner-page-header-meta">

            <div className="planner-header-pill-group">

              <div className="planner-header-pill">

                <span className="pill-label">Week</span>

                <span className="pill-value">{weekRangeDisplay}</span>

              </div>

              <div className="planner-header-pill">

                <span className="pill-label">Assignments</span>

                <span className="pill-value">{headerMetrics.assignments}</span>

              </div>

              <div className="planner-header-pill">

                <span className="pill-label">Vendors</span>

                <span className="pill-value">{headerMetrics.vendors}</span>

              </div>

            </div>

          </div>

        </div>



        {/* Controls Section */}

        <div className="planner-page-header-bottom">

          <div className="planner-page-header-controls">

            {/* Left Controls */}

            <div className="planner-page-header-controls-left">

              <div className="planner-date-selector-group">

                <button

                  onClick={handlePrev}

                  type="button"

                  title="Previous Week"

                >

                  <ChevronLeft className="w-4 h-4" />

                </button>



                <select

                  value={currentDate.getMonth()}

                  onChange={(e) => handleMonthChange(Number(e.target.value))}

                  className="form-select-sm text-sm px-3 py-2 rounded-lg bg-white/15 border border-white/20 text-white"

                  style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}

                >

                  {months.map((m) => (

                    <option key={m.value} value={m.value} style={{ color: '#1e293b' }}>

                      {m.label}

                    </option>

                  ))}

                </select>

                <select

                  value={currentDate.getFullYear()}

                  onChange={(e) => handleYearChange(Number(e.target.value))}

                  className="form-select-sm text-sm px-3 py-2 rounded-lg bg-white/15 border border-white/20 text-white"

                  style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}

                >

                  {years.map((y) => (

                    <option key={y} value={y} style={{ color: '#1e293b' }}>

                      {y}

                    </option>

                  ))}

                </select>



                <button

                  onClick={handleNext}

                  type="button"

                  title="Next Week"

                >

                  <ChevronRight className="w-4 h-4" />

                </button>



                <button

                  onClick={handleToday}

                  type="button"

                  title="Go to Today"

                >

                  <Calendar className="w-4 h-4" />

                </button>

              </div>

            </div>



            {/* Right Controls */}

            <div className="planner-page-header-controls-right">

              <div className="planner-filter-group">

                <button

                  onClick={() => setShowWeekends(!showWeekends)}

                  type="button"

                >

                  <Calendar className="w-4 h-4" />

                  <span className="text-sm">{showWeekends ? 'Hide Weekends' : 'Show Weekends'}</span>

                </button>



                <button

                  onClick={() => setShowDayOffModal(true)}

                  type="button"

                  title="Register day off"

                >

                  <UserMinus className="w-4 h-4" />

                  <span className="text-sm">Day Off</span>

                </button>



                <button

                  onClick={onExport}

                  type="button"

                  title="Export this view to CSV"

                >

                  <Download className="w-4 h-4" />

                  <span className="text-sm">Export Week</span>

                </button>





                {onDefaultSchedule && (

                  <button

                    onClick={onDefaultSchedule}

                    type="button"

                    className="planner-btn-default-schedule"

                    title="Generate default schedule for all core routes"

                  >

                    <Sparkles className="w-4 h-4" />

                    <span className="text-sm">Default Schedule</span>

                  </button>

                )}



                {onSubmitWeek && (

                  <button

                    onClick={() => {

                      onSubmitWeek?.();

                      handleSubmitSuccess();

                    }}

                    type="button"

                    className="planner-btn-submit-week"

                    title="Save week - All core routes must be assigned for all days"

                  >

                    <CheckCircle className="w-4 h-4" />

                    <span className="text-sm">Save Week</span>

                  </button>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>



      {/* Available Vendors Panel - Repositioned after header */}

      <div className="vendors-panel-container">

        <VendorList

          vendors={data.vendors}

          dayOffEntries={localDayOffEntries}

          weekDates={weekDates}

          assignments={data.assignments.map(a => ({

            userId: data.vendors.find(d => d.fullName === a.name)?.userId,

            name: a.name,

            date: a.date,

          }))}

          onDragStart={(_userId) => {

            // Optional: visual feedback

          }}

          onRemoveDayOff={handleRemoveDayOff}

          showWeekends={showWeekends}

        />

      </div>



      {/* Main Content */}

      <div className="flex gap-6">

        {/* Main View */}

        <div className="flex-1 min-w-0">

          <WeeklyView

            date={date}

            data={data}

            dayOffEntries={localDayOffEntries}

            onDrop={onDrop}

            onEdit={onEdit}

            onAssignVendor={onAssignVendor}

          />

        </div>

      </div>



      {/* Day Off Modal */}

      <DayOffModal

        open={showDayOffModal}

        onClose={() => setShowDayOffModal(false)}

        onSave={handleSaveDayOff}

        vendors={data.vendors}

        currentDate={currentDate}

      />



      {/* Success Animation Modal */}

      {showSuccessAnimation && (

        <div 

          className="planner-submit-success-overlay"

          onClick={() => setShowSuccessAnimation(false)}

        >

          <div 

            className="planner-submit-success-content"

            onClick={(e) => e.stopPropagation()}

          >

            <div className="planner-confetti-container">

              {Array.from({ length: 15 }).map((_, i) => (

                <div

                  key={i}

                  className="planner-confetti"

                  style={{

                    left: `${10 + (i % 5) * 20}%`,

                    animationDelay: `${i * 0.1}s`,

                    background: i % 2 === 0 ? '#22c55e' : '#ffffff',

                  }}

                />

              ))}

            </div>

            <div className="planner-submit-success-icon">

              <CheckCircle className="w-20 h-20" fill="currentColor" />

            </div>

            <div className="planner-submit-success-title">Successfully Saved!</div>

            <div className="planner-submit-success-message">

              Week {successWeekRange} has been saved.

            </div>

            <button

              onClick={() => {

                onExport?.();

                setShowSuccessAnimation(false);

              }}

              className="planner-submit-success-download-btn"

            >

              <Download className="w-5 h-5" />

              Download Schedule

            </button>

          </div>

        </div>

      )}



    </div>

  );

};



export default PlannerView;







