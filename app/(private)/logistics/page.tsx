'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NavbarWrapper from "@/components/navbar-wrapper";
import { TodayDateLine } from '@/app/(private)/components';
import { Button } from '@/components/ui/button';
import './Logistics.css';

type LoopRoute = {
  id: string;
  type: string;
  vendor: string;
  postcodes: string[];
  targetDel: number;
  targetPu: number;
  puCutoff: string;
  dificultLevel: number;
  notes: string;
  flexIn: string;
  flexOut: string;
  meetAddress: string;
  meetPostcode: string;
  meetTime: string;
  sortStart: string;
  sortFinish: string;
  timeOnRoute: string;
  arriveTime: string;
  break: number | string;
  sporhTarget: number | string;
  avgMon: number | string;
  avgTue: number | string;
  avgWed: number | string;
  avgThu: number | string;
  avgFri: number | string;
};

type LoopsRecord = Record<string, LoopRoute[]>;
type ModalMode = 'add' | 'edit';

type RouteForm = {
  routeType: string;
  routeId: string;
  vendor: string;
  puCutoff: string;
  dificultLevel: number | string;
  notes: string;
  flexIn: string;
  flexOut: string;
  meetAddress: string;
  meetPostcode: string;
  meetTime: string;
  sortStart: string;
  sortFinish: string;
  timeOnRoute: string;
  arriveTime: string;
  break: number | string;
  sporhTarget: number | string;
  avgMon: number | string;
  avgTue: number | string;
  avgWed: number | string;
  avgThu: number | string;
  avgFri: number | string;
};

type PreservedRouteData = {
  postcodes: string[];
  targetDel: number;
  targetPu: number;
};

type ModalInstance = {
  show: () => void;
  hide: () => void;
};

type BootstrapGlobal = {
  Modal: {
    getOrCreateInstance: (el: HTMLElement) => ModalInstance;
  };
};

const INITIAL_LOOPS: LoopsRecord = {
  ll3: [
    {
      id: 'LL3A',
      type: 'Child',
      vendor: 'David Chen',
      postcodes: ['SE1 8XX', 'SE1 9YY'],
      targetDel: 115,
      targetPu: 20,
      puCutoff: '10:00',
      dificultLevel: 3,
      notes: 'Standard route, no issues.',
      flexIn: '',
      flexOut: '',
      meetAddress: 'Depot A',
      meetPostcode: 'SE1 1AA',
      meetTime: '08:00',
      sortStart: '06:00',
      sortFinish: '07:30',
      timeOnRoute: '04:30',
      arriveTime: '12:30',
      break: 30,
      sporhTarget: 25,
      avgMon: 10,
      avgTue: 12,
      avgWed: 15,
      avgThu: 11,
      avgFri: 18
    },
    {
      id: 'LL3P',
      type: 'Flex',
      vendor: 'Sophie Turner',
      postcodes: ['SW1A 0AA'],
      targetDel: 95,
      targetPu: 35,
      puCutoff: '11:00',
      dificultLevel: 4,
      notes: 'Heavy traffic expected around Buckingham.',
      flexIn: 'SW1A',
      flexOut: 'SW1E',
      meetAddress: 'Depot A',
      meetPostcode: 'SE1 1AA',
      meetTime: '09:00',
      sortStart: '07:00',
      sortFinish: '08:30',
      timeOnRoute: '05:00',
      arriveTime: '14:00',
      break: 45,
      sporhTarget: 20,
      avgMon: 20,
      avgTue: 25,
      avgWed: 22,
      avgThu: 28,
      avgFri: 30
    }
  ],
  ll4: [
    {
      id: 'LL4C',
      type: 'Child',
      vendor: 'Chris Evans',
      postcodes: ['E1 6AN'],
      targetDel: 105,
      targetPu: 18,
      puCutoff: '10:30',
      dificultLevel: 2,
      notes: 'Easy route, mostly residential.',
      flexIn: '',
      flexOut: '',
      meetAddress: 'Depot B',
      meetPostcode: 'E14 5AA',
      meetTime: '08:30',
      sortStart: '06:30',
      sortFinish: '08:00',
      timeOnRoute: '04:00',
      arriveTime: '12:30',
      break: 30,
      sporhTarget: 28,
      avgMon: 8,
      avgTue: 10,
      avgWed: 9,
      avgThu: 12,
      avgFri: 15
    }
  ]
};

const EMPTY_FORM: RouteForm = {
  routeType: '',
  routeId: '',
  vendor: '',
  puCutoff: '',
  dificultLevel: 1,
  notes: '',
  flexIn: '',
  flexOut: '',
  meetAddress: '',
  meetPostcode: '',
  meetTime: '',
  sortStart: '',
  sortFinish: '',
  timeOnRoute: '',
  arriveTime: '',
  break: '',
  sporhTarget: '',
  avgMon: '',
  avgTue: '',
  avgWed: '',
  avgThu: '',
  avgFri: ''
};

const LogisticsDashboard = () => {
  const [loops, setLoops] = useState(INITIAL_LOOPS);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [currentLoop, setCurrentLoop] = useState('ll3');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [routeForm, setRouteForm] = useState(EMPTY_FORM);
  const [preservedRouteData, setPreservedRouteData] = useState<PreservedRouteData>({ postcodes: [], targetDel: 0, targetPu: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const routeModalRef = useRef<HTMLDivElement | null>(null);
  const [routeModalInstance, setRouteModalInstance] = useState<ModalInstance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      void import('bootstrap/dist/js/bootstrap.bundle.min.js').then(() => {
        const bootstrap = (window as unknown as { bootstrap?: BootstrapGlobal }).bootstrap;
        if (bootstrap && routeModalRef.current) {
          const instance = bootstrap.Modal.getOrCreateInstance(routeModalRef.current);
          setRouteModalInstance(instance);
        }
      });
    }
  }, []);

  const filteredLoops = useMemo(() => {
    if (!searchTerm.trim()) return loops;
    const s = searchTerm.toLowerCase().trim();
    const newLoops: LoopsRecord = {};
    Object.entries(loops).forEach(([loopId, routes]: [string, LoopRoute[]]) => {
      const filtered = routes.filter((r: LoopRoute) => 
        (r.id && r.id.toLowerCase().includes(s)) ||
        (r.vendor && r.vendor.toLowerCase().includes(s)) ||
        (r.notes && r.notes.toLowerCase().includes(s))
      );
      if (filtered.length > 0 || loopId.toLowerCase().includes(s)) {
        newLoops[loopId] = filtered;
      }
    });
    return newLoops;
  }, [loops, searchTerm]);

  const loopEntries = useMemo<[string, LoopRoute[]][]>(() => Object.entries(filteredLoops), [filteredLoops]);

  const handleOpenModal = (mode: ModalMode, loopId: string, route: LoopRoute | null = null) => {
    setModalMode(mode);
    setCurrentLoop(loopId);

    if (mode === 'edit' && route) {
      setEditingRouteId(route.id);
      setRouteForm({
        routeType: route.type,
        routeId: route.id,
        vendor: route.vendor,
        puCutoff: route.puCutoff,
        dificultLevel: route.dificultLevel,
        notes: route.notes,
        flexIn: route.flexIn,
        flexOut: route.flexOut,
        meetAddress: route.meetAddress,
        meetPostcode: route.meetPostcode,
        meetTime: route.meetTime,
        sortStart: route.sortStart,
        sortFinish: route.sortFinish,
        timeOnRoute: route.timeOnRoute,
        arriveTime: route.arriveTime,
        break: route.break,
        sporhTarget: route.sporhTarget,
        avgMon: route.avgMon,
        avgTue: route.avgTue,
        avgWed: route.avgWed,
        avgThu: route.avgThu,
        avgFri: route.avgFri
      });
      setPreservedRouteData({
        postcodes: route.postcodes ?? [],
        targetDel: route.targetDel ?? 0,
        targetPu: route.targetPu ?? 0
      });
    } else {
      setEditingRouteId(null);
      setRouteForm(EMPTY_FORM);
      setPreservedRouteData({ postcodes: [], targetDel: 0, targetPu: 0 });
    }

    routeModalInstance?.show();
  };

  const handleCloseModal = () => {
    routeModalInstance?.hide();
  };

  const handleDeleteRoute = (loopId: string, routeId: string) => {
    if (!window.confirm(`Are you sure you want to delete route ${routeId}?`)) {
      return;
    }
    setLoops((prev) => ({
      ...prev,
      [loopId]: prev[loopId].filter((route) => route.id !== routeId)
    }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = event.target;
    const key = id as keyof RouteForm;
    setRouteForm((prev) => ({
      ...prev,
      [key]: key === 'dificultLevel' ? Number(value) : value
    }));
  };

  const handleSaveRoute = () => {
    const { routeType, routeId } = routeForm;

    if (!routeId || !routeType || routeType === 'Choose...') {
      window.alert('Route ID and Type are required.');
      return;
    }

    setLoops((prev) => {
      const loopRoutes = prev[currentLoop] ?? [];

      if (modalMode === 'add' && loopRoutes.some((route) => route.id.toUpperCase() === routeId.toUpperCase())) {
        window.alert(`Route ID ${routeId.toUpperCase()} already exists. Please choose a unique ID.`);
        return prev;
      }

      const normalizedRoute = {
        id: routeForm.routeId.toUpperCase(),
        type: routeForm.routeType,
        vendor: routeForm.vendor,
        postcodes: preservedRouteData.postcodes ?? [],
        targetDel: preservedRouteData.targetDel ?? 0,
        targetPu: preservedRouteData.targetPu ?? 0,
        puCutoff: routeForm.puCutoff,
        dificultLevel: Number(routeForm.dificultLevel),
        notes: routeForm.notes,
        flexIn: routeForm.flexIn,
        flexOut: routeForm.flexOut,
        meetAddress: routeForm.meetAddress,
        meetPostcode: routeForm.meetPostcode,
        meetTime: routeForm.meetTime,
        sortStart: routeForm.sortStart,
        sortFinish: routeForm.sortFinish,
        timeOnRoute: routeForm.timeOnRoute,
        arriveTime: routeForm.arriveTime,
        break: routeForm.break,
        sporhTarget: routeForm.sporhTarget,
        avgMon: routeForm.avgMon,
        avgTue: routeForm.avgTue,
        avgWed: routeForm.avgWed,
        avgThu: routeForm.avgThu,
        avgFri: routeForm.avgFri
      };

      let updatedLoopRoutes;

      if (modalMode === 'add') {
        updatedLoopRoutes = [...loopRoutes, normalizedRoute];
      } else {
        updatedLoopRoutes = loopRoutes.map((route: LoopRoute) => (route.id === editingRouteId ? { ...normalizedRoute, postcodes: route.postcodes, targetDel: route.targetDel, targetPu: route.targetPu } : route));
      }

      return {
        ...prev,
        [currentLoop]: updatedLoopRoutes
      };
    });

    handleCloseModal();
  };

  const renderRouteRow = (route: LoopRoute, loopId: string) => {
    const postcodesHtml = route.postcodes.map((postcode: string) => (
      <span key={postcode} className="badge-custom badge-postcode me-1">
        {postcode}
      </span>
    ));
    const typeBadgeClass = route.type.toLowerCase() === 'child' ? 'badge-child' : 'badge-flex';

    return (
      <tr key={route.id}>
        <td>
          <strong>{route.id}</strong>
        </td>
        <td>
          <span className={`badge-custom ${typeBadgeClass}`}>{route.type}</span>
        </td>
        <td>{route.vendor}</td>
        <td>{postcodesHtml}</td>
        <td>{route.targetDel}</td>
        <td>{route.targetPu}</td>
        <td>{(route.targetDel ?? 0) + (route.targetPu ?? 0)}</td>
        <td>
          <button
            type="button"
            className="action-icon btn btn-link p-0"
            title="Edit"
            onClick={() => handleOpenModal('edit', loopId, route)}
          >
            <i className="bi bi-pencil-fill" />
          </button>
          <button
            type="button"
            className="action-icon btn btn-link p-0"
            title="Delete"
            onClick={() => handleDeleteRoute(loopId, route.id)}
          >
            <i className="bi bi-trash-fill" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <NavbarWrapper>
      <div className="pt-16">

        <header className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Loops &amp; Routes</h1>
            <TodayDateLine className="mt-1 text-xs font-medium text-slate-500" />
          </div>
          <div className="search-wrapper" style={{ width: '300px' }}>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search route or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <main className="page-content" id="main-page-content">

            {loopEntries.map(([loopId, routes]) => (
              <div className="loop-card" key={loopId}>
                <div className="loop-header d-flex justify-content-between align-items-center">
                  <h2 className="loop-title mb-0">Loop: {loopId.toUpperCase()}</h2>
                  <button
                    className="btn btn-primary btn-add-route"
                    data-bs-toggle="modal"
                    data-bs-target="#routeModal"
                    data-loop-id={loopId}
                    type="button"
                    onClick={() => handleOpenModal('add', loopId)}
                  >
                    <i className="bi bi-plus-lg" /> Add Route
                  </button>
                </div>
                <div className="loop-body">
                  {loopId === 'll3' && (
                    <div className="rates-section">
                      <p className="mb-1">
                        <strong>Child Rates:</strong> <span>Band 1: (£3.67)</span> <span>Band 2: (£3.33)</span>{' '}
                        <span>Band 3: (£3.10)</span> <span>Band 4: (£2.74)</span>
                      </p>
                      <p className="mb-0">
                        <strong>Flex Rates:</strong> <span>Band 1: 1-80 (£3.30)</span> <span>Band 2: 81-90 (£3.10)</span>{' '}
                        <span>Band 3: 91-100 (£2.90)</span> <span>Band 4: 100+ (£2.60)</span>
                      </p>
                    </div>
                  )}
                  {loopId === 'll4' && (
                    <div className="rates-section">
                      <p className="mb-1">
                        <strong>Child Rates:</strong> <span>Band 1: (£3.56)</span> <span>Band 2: (£3.31)</span>{' '}
                        <span>Band 3: (£3.06)</span> <span>Band 4: (£2.66)</span>
                      </p>
                      <p className="mb-0">
                        <strong>Flex Rates:</strong> <span>Band 1: 1-80 (£3.30)</span> <span>Band 2: 81-90 (£3.10)</span>{' '}
                        <span>Band 3: 91-100 (£2.90)</span> <span>Band 4: 100+ (£2.60)</span>
                      </p>
                    </div>
                  )}
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Route ID</th>
                          <th>Type</th>
                          <th>Vendor</th>
                          <th>Postcodes</th>
                          <th>Target Del</th>
                          <th>Target PU</th>
                          <th>Target Total</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody id={`loop-${loopId}-table-body`}>
                        {routes.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                              No routes yet.
                            </td>
                          </tr>
                        ) : (
                          routes.map((route) => renderRouteRow(route, loopId))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
        </main>

      <div
        className="modal fade"
        id="routeModal"
        tabIndex={-1}
        aria-labelledby="routeModalLabel"
        aria-hidden="true"
        ref={routeModalRef}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="routeModalLabel">
                {modalMode === 'edit' ? `Edit Route: ${routeForm.routeId}` : `Add New Route to Loop ${currentLoop.toUpperCase()}`}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseModal} />
            </div>
            <div className="modal-body">
              <form id="routeForm" onSubmit={(event) => event.preventDefault()}>
                <h6 className="form-section-title">Basic Info</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6 col-lg-3">
                    <label htmlFor="routeType" className="form-label">
                      Route Type
                    </label>
                    <select id="routeType" className="form-select" value={routeForm.routeType} onChange={handleInputChange}>
                      <option>Choose...</option>
                      <option value="Child">Child</option>
                      <option value="Flex">Flex</option>
                    </select>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <label htmlFor="routeId" className="form-label">
                      Route ID
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="routeId"
                      required
                      readOnly={modalMode === 'edit'}
                      value={routeForm.routeId}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <label htmlFor="vendor" className="form-label">
                      Vendor
                    </label>
                    <input type="text" className="form-control" id="vendor" value={routeForm.vendor} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <label htmlFor="puCutoff" className="form-label">
                      PU Cut-off
                    </label>
                    <input type="time" className="form-control" id="puCutoff" value={routeForm.puCutoff} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-12 col-lg-3">
                    <label htmlFor="dificultLevel" className="form-label">
                      Dificult Level
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="1"
                      max="5"
                      id="dificultLevel"
                      value={routeForm.dificultLevel}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-12 col-lg-9">
                    <label htmlFor="notes" className="form-label">
                      Notes
                    </label>
                    <textarea className="form-control" id="notes" rows={1} value={routeForm.notes} onChange={handleInputChange} style={{ backgroundColor: '#fffef0', borderColor: '#f5e6a3' }} />
                  </div>
                </div>

                <h6 className="form-section-title">Postcode Info</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Flex Postcodes</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id="flexIn"
                        placeholder="Flex Postcode In"
                        value={routeForm.flexIn}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        id="flexOut"
                        className="form-control"
                        placeholder="Flex Postcode Out"
                        value={routeForm.flexOut}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Meet Location</label>
                    <div className="input-group">
                      <input
                        type="text"
                        id="meetAddress"
                        className="form-control"
                        placeholder="Address"
                        value={routeForm.meetAddress}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        id="meetPostcode"
                        className="form-control"
                        placeholder="Postcode"
                        value={routeForm.meetPostcode}
                        onChange={handleInputChange}
                      />
                      <input
                        type="time"
                        id="meetTime"
                        className="form-control"
                        placeholder="Time"
                        value={routeForm.meetTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Regular PU Locations</label>
                    <div className="input-group mb-2">
                      <input type="text" className="form-control" placeholder="Address" disabled />
                      <input type="text" className="form-control" placeholder="Postcode" disabled />
                    </div>
                    <button type="button" className="btn btn-outline-primary btn-sm" disabled>
                      <i className="bi bi-plus" /> Add Location
                    </button>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Service Points</label>
                    <div className="input-group mb-2">
                      <input type="text" className="form-control" placeholder="Address" disabled />
                      <input type="text" className="form-control" placeholder="Postcode" disabled />
                    </div>
                    <button type="button" className="btn btn-outline-primary btn-sm" disabled>
                      <i className="bi bi-plus" /> Add Service Point
                    </button>
                  </div>
                </div>

                <h6 className="form-section-title">Schedule Info</h6>
                <div className="row g-3">
                  <div className="col-md-4 col-lg-2">
                    <label className="form-label" htmlFor="sortStart">
                      Sort Start
                    </label>
                    <input type="time" id="sortStart" className="form-control" value={routeForm.sortStart} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-4 col-lg-2">
                    <label className="form-label" htmlFor="sortFinish">
                      Sort Finish
                    </label>
                    <input type="time" id="sortFinish" className="form-control" value={routeForm.sortFinish} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-4 col-lg-2">
                    <label className="form-label" htmlFor="timeOnRoute">
                      Time on Route
                    </label>
                    <input type="time" id="timeOnRoute" className="form-control" value={routeForm.timeOnRoute} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-4 col-lg-2">
                    <label className="form-label" htmlFor="arriveTime">
                      Arrive Time
                    </label>
                    <input type="time" id="arriveTime" className="form-control" value={routeForm.arriveTime} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-4 col-lg-2">
                    <label className="form-label" htmlFor="break">
                      Break (mins)
                    </label>
                    <input type="number" id="break" className="form-control" value={routeForm.break} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-4 col-lg-2">
                    <label className="form-label" htmlFor="sporhTarget">
                      SPORH Target
                    </label>
                    <input type="number" id="sporhTarget" className="form-control" value={routeForm.sporhTarget} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="row g-3 mt-3">
                  <div className="col-12">
                    <label className="form-label mb-0">PU Average per Weekday</label>
                  </div>
                  <div className="col">
                    <input type="number" id="avgMon" className="form-control" placeholder="MON" value={routeForm.avgMon} onChange={handleInputChange} />
                  </div>
                  <div className="col">
                    <input type="number" id="avgTue" className="form-control" placeholder="TUE" value={routeForm.avgTue} onChange={handleInputChange} />
                  </div>
                  <div className="col">
                    <input type="number" id="avgWed" className="form-control" placeholder="WED" value={routeForm.avgWed} onChange={handleInputChange} />
                  </div>
                  <div className="col">
                    <input type="number" id="avgThu" className="form-control" placeholder="THU" value={routeForm.avgThu} onChange={handleInputChange} />
                  </div>
                  <div className="col">
                    <input type="number" id="avgFri" className="form-control" placeholder="FRI" value={routeForm.avgFri} onChange={handleInputChange} />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleCloseModal}>
                Close
              </button>
              <Button type="button" id="saveRouteBtn" onClick={handleSaveRoute}>
                Save Route
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </NavbarWrapper>
  );
};

export default LogisticsDashboard;

