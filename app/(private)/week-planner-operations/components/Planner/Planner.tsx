"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { SectionFlexRouteControl } from '../FlexRouteVisibilityControls';
import { getSectionKeyForLoop } from '../../utils/flexRouteVisibilityUtils';
import type { Vendor } from '@/lib/vendors';
import type { Route } from '@/lib/api/routes';
import type { Vehicle } from '@/lib/vehicles';

interface PlannerProps {
  date: string;
  vendors: Vendor[];
  routes: Route[];
  vehicles: Vehicle[];
  onDateChange: (date: string) => void;
  onExport: () => void;
  onSubmitWeek: () => void;
  onDefaultSchedule: () => void;
}

const Planner: React.FC<PlannerProps> = ({
  date,
  vendors,
  routes,
  vehicles,
  onDateChange: _onDateChange,
  onExport,
  onSubmitWeek,
  onDefaultSchedule,
}) => {
  const plannerRef = useRef<HTMLDivElement>(null);

  const initializePlanner = useCallback(() => {
    if (!plannerRef.current) return;
    // Aqui você integraria a lógica JavaScript do planner
    console.warn('Initializing planner with:', { date, vendors, routes, vehicles });
  }, [date, vendors, routes, vehicles]);

  useEffect(() => {
    if (plannerRef.current) {
      initializePlanner();
    }
  }, [initializePlanner]);

  return (
    <div ref={plannerRef}>
      <div className="wrapper">
        <main id="main-content">
          {/* Header Section */}
          <div className="page-header">
            <div className="page-header-top">
              <div className="page-title-area">
                <button type="button" className="btn" id="sidebarToggleBtn">
                  <i className="bi bi-list"></i>
                </button>
                <div className="page-title-stack">
                  <h1 className="page-title" id="page-title">Weekly Planner</h1>
                  <p className="page-subtitle" id="page-subtitle">Weekly overview - Week 00</p>
                </div>
              </div>
              <div className="page-header-meta">
                <div className="header-pill-group">
                  <div className="header-pill">
                    <span className="pill-label">Week</span>
                    <span className="pill-value" id="page-date-range">--</span>
                  </div>
                  <div className="header-pill">
                    <span className="pill-label">Assignments</span>
                    <span className="pill-value" id="header-metric-assignments">--</span>
                  </div>
                  <div className="header-pill">
                    <span className="pill-label">Vendors</span>
                    <span className="pill-value" id="header-metric-vendors">--</span>
                  </div>
                </div>
                <div className="user-profile-box">
                  <Image src="/logo-ba-express.png" alt="Company Logo" width={40} height={40} className="user-logo" />
                  <div className="user-info">
                    <div className="company-name">BA Express</div>
                    <div className="user-name">Admin User</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="page-header-bottom">
              <div className="page-header-controls">
                <div className="page-header-controls-left">
                  <div className="date-selector-group" id="date-selector-group">
                    <button type="button" className="btn btn-sm" id="prevWeekBtn">
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    
                    <select id="monthSelect" className="form-select form-select-sm"></select>
                    <select id="yearSelect" className="form-select form-select-sm"></select>
                    
                    <button type="button" className="btn btn-sm" id="nextWeekBtn">
                      <i className="bi bi-chevron-right"></i>
                    </button>
                    <button type="button" className="btn btn-sm" id="todayBtn">
                      <i className="bi bi-calendar-event"></i>
                    </button>
                  </div>
                </div>
                <div className="page-header-controls-right">
                  <div className="filter-group">
                    <button type="button" className="btn btn-sm" id="toggleWeekendsBtn">
                      <i className="bi bi-calendar-week"></i>
                      <span>Weekend</span>
                    </button>
                    <button type="button" className="btn btn-sm" id="dayOffBtn">
                      <i className="bi bi-person-dash"></i>
                      <span>Day Off</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      id="exportWeekBtn"
                      onClick={onExport}
                    >
                      <i className="bi bi-download"></i> Export Week
                    </button>
                    <button type="button" className="btn btn-sm" id="toggleViewBtn">
                      <i className="bi bi-calendar-day"></i> Daily View
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-default-schedule" 
                      id="defaultScheduleBtn"
                      onClick={onDefaultSchedule}
                    >
                      <i className="bi bi-magic"></i> Default Schedule
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-submit-week" 
                      id="submitWeekBtn" 
                      disabled
                      onClick={onSubmitWeek}
                    >
                      <i className="bi bi-check-circle"></i> Save Week
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Vendors Section */}
          <div className="collapsible-container" id="off-vendors-container">
            <div className="collapsible-header" data-bs-toggle="collapse" data-bs-target="#off-vendors-content">
              <h5><i className="bi bi-person-check-fill"></i> Available Vendors</h5>
              <i className="bi bi-chevron-down collapsible-toggle-icon" id="off-vendors-toggle-icon"></i>
            </div>
            <div className="collapse show" id="off-vendors-content">
              <div className="week-vendor-menu" id="week-vendor-menu"></div>
            </div>
          </div>

          {/* Weekly Planner View */}
          <div id="weekly-planner-view">
            <div id="planner-loading" className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading planner...</p>
            </div>
            
            {/* Management & Other Section */}
            <div className="collapsible-container" id="management-container">
              <div className="collapsible-header" data-bs-toggle="collapse" data-bs-target="#management-content">
                <h5><i className="bi bi-briefcase"></i> Management & Other</h5>
                <i className="bi bi-chevron-down collapsible-toggle-icon" id="management-toggle-icon"></i>
              </div>
              <div className="collapse show" id="management-content">
                <div className="planner-container">
                  <div className="planner-grid" id="planner-grid-management"></div>
                </div>
              </div>
            </div>

            {/* DCY Loops Section */}
            <div className="collapsible-container" id="loops-container">
              <div className="collapsible-header" data-bs-toggle="collapse" data-bs-target="#loops-dcy-content">
                <h5><i className="bi bi-arrow-repeat"></i> DCY Loops</h5>
                <div className="collapsible-header-actions">
                  <i className="bi bi-chevron-down collapsible-toggle-icon" id="loops-toggle-icon"></i>
                </div>
              </div>
              
              <div className="collapse show" id="loops-dcy-content">
                <div id="loops-wrapper" className="loops-wrapper">
                  {/* DY1 Loops */}
                  <div className="planner-container" id="dy1-loops-container" style={{display: 'block'}}>
                    <div className="planner-container-heading">
                      <div className="planner-container-title">
                        <span>DY1 Loops</span>
                      </div>
                      <div className="planner-container-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', visibility: 'visible' }}>
                        <SectionFlexRouteControl sectionKey={getSectionKeyForLoop('dy1') || 'dcy-dy1'} />
                        <button type="button" className="btn btn-outline-primary btn-sm loop-flex-btn" data-loop="dy1">
                          <i className="bi bi-plus-square"></i> Flex Route
                        </button>
                      </div>
                    </div>
                    <div className="planner-grid" id="planner-grid-dy1-loops"></div>
                  </div>

                  {/* DY2 Loops */}
                  <div className="planner-container" id="dy2-loops-container" style={{display: 'block'}}>
                    <div className="planner-container-heading">
                      <div className="planner-container-title">
                        <span>DY2 Loops</span>
                      </div>
                      <div className="planner-container-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', visibility: 'visible' }}>
                        <SectionFlexRouteControl sectionKey={getSectionKeyForLoop('dy2') || 'dcy-dy2'} />
                        <button type="button" className="btn btn-outline-primary btn-sm loop-flex-btn" data-loop="dy2">
                          <i className="bi bi-plus-square"></i> Flex Route
                        </button>
                      </div>
                    </div>
                    <div className="planner-grid" id="planner-grid-dy2-loops"></div>
                  </div>

                  {/* DCY Ad-hoc Services */}
                  <div className="planner-container ad-hoc-inline force-show" id="ad-hoc-dcy-container" style={{display: 'none'}}>
                    <div className="planner-container-heading">
                      <div className="planner-container-title">
                        <span>DCY Ad-hoc Services</span>
                      </div>
                      <div className="planner-container-actions">
                        <button type="button" className="btn btn-outline-primary btn-sm add-ad-hoc-btn" data-depot="dcy">
                          <i className="bi bi-plus-square"></i> New Row
                        </button>
                      </div>
                    </div>
                    <div className="planner-grid ad-hoc-grid" id="planner-grid-ad-hoc-dcy"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue com as outras seções... */}
            {/* LSE Loops, MSE Loops, etc. */}
          </div>

          {/* Daily Planner View (hidden by default) */}
          <div id="daily-planner-view" style={{display: 'none'}}>
            <div id="daily-depot-grid"></div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AssignmentModal />
      <NewAssignmentModal />
      <DayOffModal />
      <FlexRouteModal />
      <AdHocServiceModal />
    </div>
  );
};

// Componentes para os modais
const AssignmentModal: React.FC = () => (
  <div className="modal fade" id="assignmentModal" tabIndex={-1}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Assignment</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div className="modal-body">
          {/* Conteúdo do modal de edição */}
        </div>
      </div>
    </div>
  </div>
);

const NewAssignmentModal: React.FC = () => (
  <div className="modal fade" id="newAssignmentModal" tabIndex={-1}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Create New Assignment</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div className="modal-body">
          {/* Conteúdo do modal de nova atribuição */}
        </div>
      </div>
    </div>
  </div>
);

const DayOffModal: React.FC = () => (
  <div className="modal fade" id="dayOffModal" tabIndex={-1}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Register Day Off</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div className="modal-body">
          {/* Conteúdo do modal de day off */}
        </div>
      </div>
    </div>
  </div>
);

const FlexRouteModal: React.FC = () => (
  <div className="modal fade" id="flexRouteModal" tabIndex={-1}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add Flex Route</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div className="modal-body">
          {/* Conteúdo do modal de flex route */}
        </div>
      </div>
    </div>
  </div>
);

const AdHocServiceModal: React.FC = () => (
  <div className="modal fade" id="adHocServiceModal" tabIndex={-1}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add Ad-hoc Service</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div className="modal-body">
          {/* Conteúdo do modal de ad-hoc service */}
        </div>
      </div>
    </div>
  </div>
);

export default Planner;

