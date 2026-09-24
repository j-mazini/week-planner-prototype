'use client';
import React, { useMemo, useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NavbarWrapper from "@/components/navbar-wrapper";
import { TodayDateLine } from '@/app/(private)/components';
import './OpDashboard.css';

type TableRow = Record<string, string | number>;
type TableData = TableRow[];
type CellContent = React.ReactNode;

const FULL_ADHOC_DATA = [
  { id: 'CMP', desc: 'Unload CMP', client: 'DHL-LSE', type: 'Logistics', value: 50.0 },
  { id: 'PRED', desc: 'Pre-D Delivery', client: 'DHL-LSE', type: 'Delivery', value: 10.0 },
  { id: 'FLY', desc: 'Flyer Sort', client: 'DHL-LCY', type: 'Sorting', value: 35.0 },
  { id: 'BOAT', desc: 'Boat Sort', client: 'DHL-MSE', type: 'Sorting', value: 40.0 },
  { id: 'URG', desc: 'Urgent Parcel', client: 'DHL-MSE', type: 'Delivery', value: 75.0 },
  { id: 'PALLET', desc: 'Pallet Relocation', client: 'DHL-MSE', type: 'Logistics', value: 120.0 },
  { id: 'SPEC', desc: 'Special Handling', client: 'DHL-LSE', type: 'Sorting', value: 55.0 },
  { id: 'RET', desc: 'Return Pickup', client: 'DHL-LCY', type: 'Logistics', value: 45.0 },
  { id: 'DOC', desc: 'Document Run', client: 'BAOP', type: 'Delivery', value: 30.0 },
  { id: 'SUP', desc: 'Supply Drop', client: 'BAOP', type: 'Logistics', value: 65.0 },
  { id: 'BOX', desc: 'Box Assembly', client: 'DHL-MSE', type: 'Sorting', value: 150.0 },
  { id: 'TRANS', desc: 'Inter-depot Transfer', client: 'DHL-LSE', type: 'Logistics', value: 200.0 }
];

const FULL_LOOPS_DATA = [
  { loop: 'LL3', routeId: 'LL3A', type: 'Child', vendor: 'Vendor LL3A', target: 119 },
  { loop: 'LL3', routeId: 'LL3P', type: 'Flex', vendor: 'Vendor LL3P', target: 145 },
  { loop: 'DY1', routeId: 'DY1A', type: 'Child', vendor: 'Vendor DY1A', target: 97 },
  { loop: 'MSE', routeId: 'MSEG', type: 'Flex', vendor: 'Vendor MSEG', target: 128 },
  { loop: 'LCY', routeId: 'LCY1', type: 'Child', vendor: 'Vendor LCY1', target: 105 },
  { loop: 'LCY', routeId: 'LCY2', type: 'Flex', vendor: 'Vendor LCY2', target: 130 },
  { loop: 'LSE', routeId: 'LSEA', type: 'Child', vendor: 'Vendor LSEA', target: 110 },
  { loop: 'LSE', routeId: 'LSEP', type: 'Flex', vendor: 'Vendor LSEP', target: 150 },
  { loop: 'BAOP', routeId: 'B-01', type: 'Child', vendor: 'Vendor B-01', target: 88 },
  { loop: 'BAOP', routeId: 'B-02', type: 'Flex', vendor: 'Vendor B-02', target: 112 }
];

const CHART_DATA = {
  labels: ['DHL-LSE', 'DHL-LCY', 'DHL-MSE', 'BAOP'],
  deliveries: [526, 350, 290, 120],
  pickups: [274, 180, 150, 80]
};

const OperationsDashboard = () => {
  const [activeView, setActiveView] = useState('#summary-view');
  const summaryAdhocData = useMemo(() => FULL_ADHOC_DATA.slice(0, 4), []);
  const summaryLoopsData = useMemo(() => FULL_LOOPS_DATA.slice(0, 4), []);
  const maxChartValue = useMemo(
    () => Math.max(...CHART_DATA.deliveries, ...CHART_DATA.pickups),
    []
  );

  const handleViewChange = (viewId: string) => {
    setActiveView(viewId);
  };

  const handleViewAllClick = (viewId: string) => {
    setActiveView(viewId);
  };

  const renderTable = (data: TableData) => {
    if (!data || data.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={5} className="text-center py-3 text-muted">
              No data available.
            </td>
          </tr>
        </tbody>
      );
    }

    const headers = Object.keys(data[0]);

    return (
      <>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header.replace('desc', 'description')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={headers.map((header) => row[header]).join('-')}>
              {headers.map((header) => {
                let cellContent: CellContent = row[header];
                if (header === 'type') {
                  cellContent = (
                    <span className={`badge bg-${String(row[header]).toLowerCase()}`}>{row[header]}</span>
                  );
                } else if (header === 'value') {
                  const numValue = typeof row[header] === 'number' ? row[header] : parseFloat(String(row[header]));
                  cellContent = `£${numValue.toFixed(2)}`;
                }
                return <td key={header}>{cellContent}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </>
    );
  };

  return (
    <NavbarWrapper>
      <div className="pt-16">

        <header className="page-header">
          <h1 className="page-title">Operations Dashboard</h1>
          <TodayDateLine className="mt-1 text-xs font-medium text-slate-500" />
        </header>

        <main className="page-content">

            <div className="row g-4 mb-4">
              <div className="col-lg-4">
                <div className="card kpi-card-top p-4">
                  <h6 className="kpi-title">TOTAL SERVICES</h6>
                  <div className="kpi-value">12</div>
                  <p className="text-secondary small mb-0">Adhoc Services Currently Active</p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card kpi-card-top p-4">
                  <h6 className="kpi-title">TOTAL CONTRACT VALUE</h6>
                  <div className="kpi-value">£875.00</div>
                  <p className="text-secondary small mb-0">Combined Contract Value</p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card kpi-card-top p-4">
                  <h6 className="kpi-title">TOTAL ROUTES</h6>
                  <div className="kpi-value">10</div>
                  <p className="text-secondary small mb-0">Active Routes Across All Loops</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header dashboard-nav">
                <ul className="nav nav-pills">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeView === '#summary-view' ? 'active' : ''}`}
                      data-view-target="#summary-view"
                      onClick={() => handleViewChange('#summary-view')}
                    >
                      Summary
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeView === '#adhoc-view' ? 'active' : ''}`}
                      data-view-target="#adhoc-view"
                      onClick={() => handleViewChange('#adhoc-view')}
                    >
                      AdHoc Works
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeView === '#loops-view' ? 'active' : ''}`}
                      data-view-target="#loops-view"
                      onClick={() => handleViewChange('#loops-view')}
                    >
                      Logistics Loops
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body p-4">
                <div id="summary-view" className={`view-container ${activeView === '#summary-view' ? 'active' : ''}`}>
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <h5 className="mb-0 fs-6 fw-bold">AdHoc Works Summary</h5>
                          <button
                            type="button"
                            id="viewAllAdhoc"
                            className="btn-link text-decoration-none fw-bold small"
                            onClick={() => handleViewAllClick('#adhoc-view')}
                          >
                            View All <i className="bi bi-arrow-right-short" />
                          </button>
                        </div>
                        <div className="card-body">
                          <table className="table" id="summary-adhoc-table">
                            {renderTable(summaryAdhocData)}
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <h5 className="mb-0 fs-6 fw-bold">Logistics Loops Summary</h5>
                          <button
                            type="button"
                            id="viewAllLoops"
                            className="btn-link text-decoration-none fw-bold small"
                            onClick={() => handleViewAllClick('#loops-view')}
                          >
                            View All <i className="bi bi-arrow-right-short" />
                          </button>
                        </div>
                        <div className="card-body">
                          <table className="table" id="summary-loops-table">
                            {renderTable(summaryLoopsData)}
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="card">
                        <div className="card-body">
                          <div className="custom-chart-container">
                            <div className="custom-chart-bars">
                              {CHART_DATA.labels.map((label, index) => {
                                const deliveryHeight = (CHART_DATA.deliveries[index] / maxChartValue) * 100;
                                const pickupHeight = (CHART_DATA.pickups[index] / maxChartValue) * 100;
                                return (
                                  <div className="chart-bar" key={label}>
                                    <div className="bar-wrapper">
                                      <div
                                        className="bar bar-deliveries"
                                        style={{ height: `${deliveryHeight}%` }}
                                        title={`Deliveries: ${CHART_DATA.deliveries[index]}`}
                                      >
                                        <span className="bar-value">{CHART_DATA.deliveries[index]}</span>
                                      </div>
                                      <div
                                        className="bar bar-pickups"
                                        style={{ height: `${pickupHeight}%` }}
                                        title={`Pickups: ${CHART_DATA.pickups[index]}`}
                                      >
                                        <span className="bar-value">{CHART_DATA.pickups[index]}</span>
                                      </div>
                                    </div>
                                    <span className="bar-label">{label}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="custom-chart-legend">
                              <span>
                                <span className="legend-box deliveries" /> Deliveries
                              </span>
                              <span>
                                <span className="legend-box pickups" /> Pickups
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="adhoc-view" className={`view-container ${activeView === '#adhoc-view' ? 'active' : ''}`}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold">All AdHoc Works</h5>
                    <span className="text-secondary small">Showing all 12 records</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-striped" id="full-adhoc-table">
                      {renderTable(FULL_ADHOC_DATA)}
                    </table>
                  </div>
                </div>

                <div id="loops-view" className={`view-container ${activeView === '#loops-view' ? 'active' : ''}`}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold">All Logistics Loops</h5>
                    <span className="text-secondary small">Showing all 10 records</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-striped" id="full-loops-table">
                      {renderTable(FULL_LOOPS_DATA)}
                    </table>
                  </div>
                </div>
              </div>
            </div>
        </main>
      </div>
    </NavbarWrapper>
  );
};

export default OperationsDashboard;

