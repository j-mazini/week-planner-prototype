'use client';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NavbarWrapper from "@/components/navbar-wrapper";
import { StatusBadge } from "@/components/status-badge";
import './InvoiceProcessingWorkflow.css';
import type { Modal } from 'bootstrap';
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TodayDateLine } from '@/app/(private)/components';
import { 
  fetchInvoiceProcessingItems, 
  createInvoiceProcessingItem, 
  updateInvoiceProcessingItem, 
  createMultipleInvoiceProcessingItems,
  type InvoiceProcessingItem as BackendInvoiceItem
} from "@/lib/invoice-processing-api";
import { removeToken, hasAuthSession } from "@/lib/auth"
import { useRouter } from "next/navigation";
import ExportButton from "@/components/export-button";
import { exportInvoicesToPDF } from "./utils/pdfExport";
import { loadXlsx } from '@/lib/lazy-imports';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

declare global {
  interface Window {
    bootstrap: typeof import('bootstrap');
  }
}

interface InvoiceItem {
  id: number;
  recordId: string;
  subcontractor: string;
  period: string;
  amount: number;
  status: string;
}

interface InvoiceForm {
  subcontractor: string;
  period: string;
}

interface MultiInvoiceForm {
  data: string;
  status: string;
}

interface LoopForm {
  client: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
}

interface EditForm {
  id: number | null;
  recordId: string;
  subcontractor: string;
  period: string;
  amount: string;
  status: string;
}

type SortField = 'recordId' | 'subcontractor' | 'period' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc' | null;

// Month names in English (module scope to avoid recreation on every render)
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper function to map backend invoice to frontend format
const mapBackendToFrontend = (backend: BackendInvoiceItem): InvoiceItem => {
  return {
    id: backend.id,
    recordId: backend.recordId,
    subcontractor: backend.subcontractor,
    period: backend.period,
    amount: backend.amount,
    status: backend.status
  };
};

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// Helper function to map status to StatusBadge type
const getStatusType = (status: string): string => {
  switch (status) {
    case 'Pending Verification':
    case 'Pending':
      return 'pending';
    case 'Ready for Invoicing':
    case 'Approved':
      return 'active';
    case 'Invoices':
    case 'Sent':
      return 'completed';
    case 'Rejected':
      return 'disputed';
    case 'Draft':
    default:
      return 'default';
  }
};

// const getNextInternalId = (invoices: InvoiceItem[]): number => (invoices.length === 0 ? 1 : Math.max(...invoices.map((item) => item.id)) + 1);

// const generateNextRecordId = (invoices: InvoiceItem[]): string => {
//   const maxNumeric = invoices.reduce((max, item) => {
//     const match = item.recordId.match(/INV-\d{4}-(\d+)/);
//     if (!match) return max;
//     const num = Number.parseInt(match[1], 10);
//     return Number.isNaN(num) ? max : Math.max(max, num);
//   }, 0);
//   const next = maxNumeric + 1;
//   return `INV-2024-${String(next).padStart(3, '0')}`;
// };

const InvoiceProcessingWorkflow: React.FC = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const { guard } = useSubmitGuard();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('subcontractor');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [newInvoiceForm, setNewInvoiceForm] = useState<InvoiceForm>({ subcontractor: '', period: '' });
  const [multiInvoiceForm, setMultiInvoiceForm] = useState<MultiInvoiceForm>({ data: '', status: 'Pending Verification' });
  const [loopForm, setLoopForm] = useState<LoopForm>({ client: '', origin: '', destination: '', departure: '', arrival: '' });
  const [editForm, setEditForm] = useState<EditForm>({ id: null, recordId: '', subcontractor: '', period: '', amount: '', status: 'Pending Verification' });

  const [selectedEditInvoice, setSelectedEditInvoice] = useState<InvoiceItem | null>(null);

  const newInvoiceModalRef = useRef<HTMLDivElement | null>(null);
  const multiInvoiceModalRef = useRef<HTMLDivElement | null>(null);
  const editInvoiceModalRef = useRef<HTMLDivElement | null>(null);
  const newLoopModalRef = useRef<HTMLDivElement | null>(null);

  const [newInvoiceModalInstance, setNewInvoiceModalInstance] = useState<Modal | null>(null);
  const [multiInvoiceModalInstance, setMultiInvoiceModalInstance] = useState<Modal | null>(null);
  const [editInvoiceModalInstance, setEditInvoiceModalInstance] = useState<Modal | null>(null);
  const [newLoopModalInstance, setNewLoopModalInstance] = useState<Modal | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      void import('bootstrap/dist/js/bootstrap.bundle.min.js').then(() => {
        const bootstrap = window.bootstrap;
        if (!bootstrap) return;

        if (newInvoiceModalRef.current) {
          setNewInvoiceModalInstance(bootstrap.Modal.getOrCreateInstance(newInvoiceModalRef.current));
        }
        if (multiInvoiceModalRef.current) {
          setMultiInvoiceModalInstance(bootstrap.Modal.getOrCreateInstance(multiInvoiceModalRef.current));
        }
        if (editInvoiceModalRef.current) {
          setEditInvoiceModalInstance(bootstrap.Modal.getOrCreateInstance(editInvoiceModalRef.current));
        }
        if (newLoopModalRef.current) {
          setNewLoopModalInstance(bootstrap.Modal.getOrCreateInstance(newLoopModalRef.current));
        }
      });
    }
  }, []);

  // Fetch invoices from backend
  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!hasAuthSession()) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const backendInvoices = await fetchInvoiceProcessingItems(
        periodFilter,
        statusFilter !== 'all' ? statusFilter : undefined,
        searchTerm || undefined
      );
      const mappedInvoices = backendInvoices.map(mapBackendToFrontend);
      setInvoices(mappedInvoices);
    } catch (error) {
      console.error("Error loading invoices:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // If it's an authentication error, redirect to login
      if (errorMessage.includes("Invalid token") || errorMessage.includes("authentication")) {
        removeToken();
        router.push("/");
        return;
      } else {
        alert(`Error loading invoices: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [periodFilter, statusFilter, searchTerm, router]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadInvoices();
    }, searchTerm ? 500 : 0); // Wait 500ms after user stops typing, but immediate for filters

    return () => clearTimeout(timeoutId);
  }, [searchTerm, periodFilter, statusFilter, loadInvoices]);

  const periodOptions = useMemo<Array<{ value: string; label: string }>>(() => {
    const options: Array<{ value: string; label: string }> = [{ value: 'all', label: 'All Periods' }];
    const currentDate = new Date();

    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = MONTH_NAMES[date.getMonth()];
      
      options.push({
        value: `${year}-${month}`,
        label: `${monthName} ${year}`
      });
    }
    
    return options;
  }, []);

  const statusOptions: string[] = ['all', 'Pending Verification', 'Ready for Invoicing', 'Invoices', 'Pending', 'Approved', 'Rejected', 'Sent', 'Draft'];

  // Since filtering is done on the backend, we use invoices directly
  const filteredInvoices = useMemo<InvoiceItem[]>(() => {
    // Additional client-side filtering if needed (for search that wasn't sent to backend)
    if (!searchTerm) return invoices;
    
    const lowerSearch = searchTerm.toLowerCase();
    return invoices.filter((item) => {
      return item.recordId.toLowerCase().includes(lowerSearch) || 
             item.subcontractor.toLowerCase().includes(lowerSearch);
    });
  }, [invoices, searchTerm]);

  const kpiValues = useMemo(() => {
    const total = filteredInvoices.reduce((sum, item) => sum + item.amount, 0);
    const pendingVerification = filteredInvoices.filter((item) => item.status === 'Pending Verification' || item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0);
    const readyForInvoicing = filteredInvoices.filter((item) => item.status === 'Ready for Invoicing' || item.status === 'Approved').reduce((sum, item) => sum + item.amount, 0);
    return {
      total: CURRENCY_FORMATTER.format(total),
      pendingVerification: CURRENCY_FORMATTER.format(pendingVerification),
      readyForInvoicing: CURRENCY_FORMATTER.format(readyForInvoicing)
    };
  }, [filteredInvoices]);

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction: asc -> desc -> null (remove sort)
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('subcontractor'); // Reset to default
      } else {
        setSortDirection('asc');
      }
    } else {
      // New field, start with asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sorted invoices
  const sortedInvoices = useMemo(() => {
    if (!sortDirection) return filteredInvoices;
    
    return [...filteredInvoices].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'recordId':
          comparison = (a.recordId || '').localeCompare(b.recordId || '');
          break;
        case 'subcontractor':
          comparison = (a.subcontractor || '').toLowerCase().localeCompare((b.subcontractor || '').toLowerCase());
          break;
        case 'period':
          comparison = (a.period || '').localeCompare(b.period || '');
          break;
        case 'amount':
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case 'status':
          comparison = (a.status || '').toLowerCase().localeCompare((b.status || '').toLowerCase());
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredInvoices, sortField, sortDirection]);

  // Sortable header component
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    
    return (
      <button
        className="d-flex align-items-center justify-content-start border-0 bg-transparent p-0 w-100 text-start text-decoration-none"
        onClick={() => handleSort(field)}
        type="button"
        style={{ cursor: 'pointer', color: 'inherit', fontWeight: 'inherit' }}
      >
        {children}
        <span className="ms-2">
          {isActive && sortDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" style={{ width: '16px', height: '16px' }} />
          ) : isActive && sortDirection === 'desc' ? (
            <ArrowDown className="h-4 w-4" style={{ width: '16px', height: '16px' }} />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" style={{ width: '16px', height: '16px' }} />
          )}
        </span>
      </button>
    );
  };


  // const closeAllModals = () => {
  //   newInvoiceModalInstance?.hide();
  //   multiInvoiceModalInstance?.hide();
  //   editInvoiceModalInstance?.hide();
  //   newLoopModalInstance?.hide();
  // };

  const handleNewInvoiceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { subcontractor, period } = newInvoiceForm;
    if (!subcontractor || !period) return;

    try {
      setIsLoading(true);
      const newInvoice = await createInvoiceProcessingItem({
        subcontractor,
        period,
        status: 'Pending Verification'
      });
      
      const mappedInvoice = mapBackendToFrontend(newInvoice);
      setInvoices((prev) => [...prev, mappedInvoice]);
      setNewInvoiceForm({ subcontractor: '', period: '' });
      newInvoiceModalInstance?.hide();
      window.alert(
        `Invoice generated for ${subcontractor} in ${period}!\nAmount: ${CURRENCY_FORMATTER.format(mappedInvoice.amount)}\nStatus: Pending Verification`
      );
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert(`Error creating invoice: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiInvoiceCreate = async () => {
    const { data, status } = multiInvoiceForm;
    if (!data.trim()) {
      window.alert('Please paste invoice data.');
      return;
    }

    const lines = data.split('\n');
    const invoicesToCreate: Array<{ subcontractor: string; period: string; amount?: number; status: string }> = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return;
      const parts = line.split(',');
      if (parts.length !== 3) {
        errors.push(`Line ${index + 1}: Invalid format.`);
        return;
      }

      const [subcontractorRaw, periodRaw, amountRaw] = parts;
      const subcontractor = subcontractorRaw.trim();
      const period = periodRaw.trim();
      const amount = Number.parseFloat(amountRaw.trim());

      if (!subcontractor || !/^\d{4}-\d{2}$/.test(period) || Number.isNaN(amount) || amount <= 0) {
        errors.push(`Line ${index + 1}: Invalid data.`);
        return;
      }

      invoicesToCreate.push({
        subcontractor,
        period,
        amount,
        status: status
      });
    });

    if (invoicesToCreate.length === 0) {
      window.alert('No valid invoices to create.');
      return;
    }

    try {
      setIsLoading(true);
      const createdInvoices = await createMultipleInvoiceProcessingItems(invoicesToCreate);
      const mappedInvoices = createdInvoices.map(mapBackendToFrontend);
      setInvoices((prev) => [...prev, ...mappedInvoices]);
      setMultiInvoiceForm((prev) => ({ ...prev, data: '' }));
      multiInvoiceModalInstance?.hide();

      let summary = `${createdInvoices.length} invoices created successfully.`;
      if (errors.length > 0) {
        summary += `\n${errors.length} lines failed to process.\n\nErrors:\n${errors.join('\n')}`;
      }
      window.alert(summary);
    } catch (error) {
      console.error("Error creating multiple invoices:", error);
      alert(`Error creating invoices: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (invoice: InvoiceItem) => {
    setSelectedEditInvoice(invoice);
    setEditForm({
      id: invoice.id,
      recordId: invoice.recordId,
      subcontractor: invoice.subcontractor,
      period: invoice.period,
      amount: invoice.amount.toString(),
      status: invoice.status
    });
    editInvoiceModalInstance?.show();
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEditInvoice) return;

    try {
      setIsLoading(true);
      const updatedInvoice = await updateInvoiceProcessingItem(selectedEditInvoice.id, {
        subcontractor: editForm.subcontractor,
        period: editForm.period,
        amount: Number.parseFloat(editForm.amount),
        status: editForm.status
      });

      const mappedInvoice = mapBackendToFrontend(updatedInvoice);
      setInvoices((prev) =>
        prev.map((item) => (item.id === selectedEditInvoice.id ? mappedInvoice : item))
      );
      setSelectedEditInvoice(null);
      editInvoiceModalInstance?.hide();
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert(`Error updating invoice: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoopSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    newLoopModalInstance?.hide();
    window.alert(`New loop created for ${loopForm.client} from ${loopForm.origin}!`);
    setLoopForm({ client: '', origin: '', destination: '', departure: '', arrival: '' });
  };

  const handleExport = async (format: 'xlsx' | 'pdf' | 'csv'): Promise<Blob | null> => {
    if (format === 'pdf') {
      const blob = await exportInvoicesToPDF(filteredInvoices, periodFilter, statusFilter, searchTerm);
      return blob;
    } else if (format === 'xlsx') {
      const XLSX = await loadXlsx();
      // Exportar para Excel
      const worksheetData = filteredInvoices.map((invoice) => ({
        'Record ID': invoice.recordId,
        'Vendor': invoice.subcontractor,
        'Period': invoice.period,
        'Amount': invoice.amount,
        'Status': invoice.status,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(worksheetData);
      ws['!cols'] = [{ wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Invoices');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } else {
      // CSV
      const headers = ['Record ID', 'Vendor', 'Period', 'Amount', 'Status'];
      const rows = filteredInvoices.map((invoice) => [
        invoice.recordId || '',
        invoice.subcontractor || '',
        invoice.period || '',
        invoice.amount.toString(),
        invoice.status || '',
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const BOM = '\uFEFF';
      return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    }
  };

  return (
    <NavbarWrapper>
      <div className="pt-4 invoice-workflow-container">
        <div className="w-full max-w-content-wide mx-auto">

        <main className="page-content">
          <header className="header-section">
            <div className="welcome-text">
              <h1>Invoice Processing</h1>
              <TodayDateLine className="mt-1 text-xs font-medium text-slate-500" />
              <div style={{ color: 'var(--text-secondary)' }} className="mt-2">Process and manage vendor invoices.</div>
            </div>
          </header>

            <div className="content-actions-bar reveal">
              <div className="actions-top-row">
                <input
                  type="search"
                  className="form-control"
                  style={{ maxWidth: '350px', flexGrow: 1 }}
                  id="searchInput"
                  placeholder="Search by ID or Vendor..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />

                <div className="ms-auto d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#newInvoiceModal"
                    onClick={() => newInvoiceModalInstance?.show()}
                  >
                    <i className="bi bi-file-earmark-plus" /> New Single Invoice
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#multiInvoiceModal"
                    onClick={() => multiInvoiceModalInstance?.show()}
                  >
                    <i className="bi bi-files" /> New Multiple Invoices
                  </button>

                  <ExportButton
                    onExport={handleExport}
                    filename={`invoices-${new Date().toISOString().split('T')[0]}`}
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    label="Export"
                    showOnlyExcelAndPdf={true}
                    hasActiveFilters={periodFilter !== 'all' || statusFilter !== 'all' || searchTerm !== ''}
                  />
                </div>
              </div>

              <div className="filter-groups-row">
                <div className="filter-group">
                  <strong className="text-nowrap">Period:</strong>
                  <select
                    className="form-select form-select-sm"
                    id="periodFilter"
                    style={{ minWidth: '180px' }}
                    value={periodFilter}
                    onChange={(event) => setPeriodFilter(event.target.value)}
                  >
                    {periodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <strong className="text-nowrap">Status:</strong>
                  <select
                    className="form-select form-select-sm"
                    id="statusFilter"
                    style={{ minWidth: '150px' }}
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'all' ? 'All Status' : option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <section className="summary-stats mb-4">
              <div className="row g-3">
                <div className="col-sm-6 col-xl-3">
                  <div className="stat-card reveal">
                    <div className="stat-card-icon blue">
                      <i className="bi bi-file-earmark-text-fill" />
                    </div>
                    <div className="stat-card-info">
                      <label>Total Value</label>
                      <span className="value" id="kpi-total-value">
                        {kpiValues.total}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="stat-card reveal">
                    <div className="stat-card-icon yellow">
                      <i className="bi bi-clock-fill" />
                    </div>
                    <div className="stat-card-info">
                      <label>Pending Verification</label>
                      <span className="value" id="kpi-pending-value">
                        {kpiValues.pendingVerification}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="stat-card reveal">
                    <div className="stat-card-icon green">
                      <i className="bi bi-check-circle-fill" />
                    </div>
                    <div className="stat-card-info">
                      <label>Ready for Invoicing</label>
                      <span className="value" id="kpi-approved-value">
                        {kpiValues.readyForInvoicing}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="card table-container reveal">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover" id="iprocess-table">
                    <thead>
                      <tr>
                        <th>
                          <SortableHeader field="recordId">Record ID</SortableHeader>
                        </th>
                        <th>
                          <SortableHeader field="subcontractor">Vendor</SortableHeader>
                        </th>
                        <th>
                          <SortableHeader field="period">Period</SortableHeader>
                        </th>
                        <th>
                          <SortableHeader field="amount">Amount</SortableHeader>
                        </th>
                        <th>
                          <SortableHeader field="status">Status</SortableHeader>
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="iprocess-table-body">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Loading invoices...
                            </div>
                          </td>
                        </tr>
                      ) : sortedInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={6}>
                            <div id="no-results-message" className="no-results">
                              <i className="bi bi-search" />
                              <p>No invoices found for the applied filters.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        sortedInvoices.map((invoice) => {
                          return (
                            <tr key={invoice.id}>
                              <td>
                                <span 
                                  className="fw-medium" 
                                  style={{ cursor: 'pointer', color: 'var(--bs-primary)', textDecoration: 'underline' }}
                                  onClick={() => openEditModal(invoice)}
                                  title="Click to view invoice details"
                                >
                                  {invoice.recordId}
                                </span>
                              </td>
                              <td>
                                <span className="fw-medium">{invoice.subcontractor}</span>
                              </td>
                              <td>
                                <span className="text-muted">{invoice.period}</span>
                              </td>
                              <td>
                                <span className="fw-medium">{CURRENCY_FORMATTER.format(invoice.amount)}</span>
                              </td>
                              <td>
                                <StatusBadge status={getStatusType(invoice.status)}>
                                  {invoice.status}
                                </StatusBadge>
                              </td>
                              <td>
                                <button
                                  className="btn btn-icon edit-btn"
                                  data-id={invoice.id}
                                  title="Edit"
                                  type="button"
                                  onClick={() => openEditModal(invoice)}
                                >
                                  <i className="bi bi-pencil-square" />
                                </button>
                                <button className="btn btn-icon" title="View Details" type="button">
                                  <i className="bi bi-eye" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        </main>

      <div
        className="modal fade"
        id="newInvoiceModal"
        tabIndex={-1}
        aria-labelledby="newInvoiceModalLabel"
        aria-hidden="true"
        ref={newInvoiceModalRef}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 'var(--border-radius-lg)' }}>
            <div className="modal-header border-0">
              <h5 className="modal-title" id="newInvoiceModalLabel">
                Generate Invoice
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => newInvoiceModalInstance?.hide()} />
            </div>
            <div className="modal-body p-4">
              <form id="newInvoiceForm" onSubmit={guard(handleNewInvoiceSubmit)}>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="newSubcontractor" className="form-label">
                      Vendor (Vendor)
                    </label>
                    <select
                      className="form-select"
                      id="newSubcontractor"
                      required
                      value={newInvoiceForm.subcontractor}
                      onChange={(event) =>
                        setNewInvoiceForm((prev) => ({
                          ...prev,
                          subcontractor: event.target.value
                        }))
                      }
                    >
                      <option value="" disabled>
                        Select vendor
                      </option>
                      <option value="Rapid Transport">Rapid Transport</option>
                      <option value="Swift Logistics">Swift Logistics</option>
                      <option value="Agile Deliveries">Agile Deliveries</option>
                      <option value="Southern Freight">Southern Freight</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="newPeriod" className="form-label">
                      Period
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="newPeriod"
                      placeholder="YYYY-MM"
                      required
                      value={newInvoiceForm.period}
                      onChange={(event) =>
                        setNewInvoiceForm((prev) => ({
                          ...prev,
                          period: event.target.value
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="alert alert-info mt-3">
                  <i className="bi bi-info-circle-fill me-2" />
                  The invoice amount will be calculated automatically based on the loops associated with this vendor for the selected period.
                </div>
                <div className="modal-footer border-0 px-0">
                  <button type="button" className="btn btn-light" data-bs-dismiss="modal" onClick={() => newInvoiceModalInstance?.hide()}>
                    Cancel
                  </button>
                  <Button type="submit">
                    Generate Invoice
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="multiInvoiceModal"
        tabIndex={-1}
        aria-labelledby="multiInvoiceModalLabel"
        aria-hidden="true"
        ref={multiInvoiceModalRef}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 'var(--border-radius-lg)' }}>
            <div className="modal-header border-0">
              <h5 className="modal-title" id="multiInvoiceModalLabel">
                New Multiple Invoices
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => multiInvoiceModalInstance?.hide()}
              />
            </div>
            <div className="modal-body p-4">
              <p className="text-muted">
                Paste invoice data below. Each line should be in the format:<code>Vendor Name,Period (YYYY-MM),Amount</code>
              </p>
              <textarea
                className="form-control"
                id="multiInvoiceData"
                rows={10}
                placeholder="Rapid Transport,2024-12,1500.00&#10;Swift Logistics,2024-12,2300.50"
                value={multiInvoiceForm.data}
                onChange={(event) =>
                  setMultiInvoiceForm((prev) => ({
                    ...prev,
                    data: event.target.value
                  }))
                }
              />
              <div className="mt-3">
                <label htmlFor="multiInvoiceStatus" className="form-label">
                  Default Status for new invoices
                </label>
                <select
                  className="form-select"
                  id="multiInvoiceStatus"
                  value={multiInvoiceForm.status}
                  onChange={(event) =>
                    setMultiInvoiceForm((prev) => ({
                      ...prev,
                      status: event.target.value
                    }))
                  }
                >
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Ready for Invoicing">Ready for Invoicing</option>
                  <option value="Invoices">Invoices</option>
                </select>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-light" data-bs-dismiss="modal" onClick={() => multiInvoiceModalInstance?.hide()}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" id="createMultiInvoiceBtn" onClick={handleMultiInvoiceCreate}>
                Create Invoices
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editInvoiceModal"
        tabIndex={-1}
        aria-labelledby="editInvoiceModalLabel"
        aria-hidden="true"
        ref={editInvoiceModalRef}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 'var(--border-radius-lg)' }}>
            <div className="modal-header border-0">
              <h5 className="modal-title" id="editInvoiceModalLabel">
                Edit Invoice
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  setSelectedEditInvoice(null);
                  editInvoiceModalInstance?.hide();
                }}
              />
            </div>
            <div className="modal-body p-4">
              <form id="editInvoiceForm" onSubmit={guard(handleEditSubmit)}>
                <input type="hidden" id="editInternalId" value={editForm.id ?? ''} readOnly />
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="editRecordId" className="form-label">
                      Record ID (INV)
                    </label>
                    <input type="text" className="form-control" id="editRecordId" value={editForm.recordId} readOnly disabled />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="editPeriod" className="form-label">
                      Period
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editPeriod"
                      placeholder="YYYY-MM"
                      required
                      value={editForm.period}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          period: event.target.value
                        }))
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="editSubcontractor" className="form-label">
                      Vendor
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editSubcontractor"
                      required
                      value={editForm.subcontractor}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          subcontractor: event.target.value
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="editAmount" className="form-label">
                      Amount
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        id="editAmount"
                        required
                        value={editForm.amount}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            amount: event.target.value
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="editStatus" className="form-label">
                      Status
                    </label>
                    <select
                      className="form-select"
                      id="editStatus"
                      required
                      value={editForm.status}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          status: event.target.value
                        }))
                      }
                    >
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Ready for Invoicing">Ready for Invoicing</option>
                      <option value="Invoices">Invoices</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 px-0">
                  <button
                    type="button"
                    className="btn btn-light"
                    data-bs-dismiss="modal"
                    onClick={() => {
                      setSelectedEditInvoice(null);
                      editInvoiceModalInstance?.hide();
                    }}
                  >
                    Cancel
                  </button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="newLoopModal" tabIndex={-1} aria-labelledby="newLoopModalLabel" aria-hidden="true" ref={newLoopModalRef}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 'var(--border-radius-lg)' }}>
            <div className="modal-header border-0">
              <h5 className="modal-title" id="newLoopModalLabel">
                New Loop
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => newLoopModalInstance?.hide()}
              />
            </div>
            <div className="modal-body p-4">
              <form id="newLoopForm" onSubmit={guard(handleLoopSubmit)}>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="newLoopClient" className="form-label">
                      Client
                    </label>
                    <select
                      className="form-select"
                      id="newLoopClient"
                      required
                      value={loopForm.client}
                      onChange={(event) =>
                        setLoopForm((prev) => ({
                          ...prev,
                          client: event.target.value
                        }))
                      }
                    >
                      <option value="" disabled>
                        Select client
                      </option>
                      <option value="Client A">Client A</option>
                      <option value="Client B">Client B</option>
                      <option value="Client C">Client C</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="newLoopOrigin" className="form-label">
                      Origin
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="newLoopOrigin"
                      placeholder="e.g., New York"
                      required
                      value={loopForm.origin}
                      onChange={(event) =>
                        setLoopForm((prev) => ({
                          ...prev,
                          origin: event.target.value
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="newLoopDestination" className="form-label">
                      Destination
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="newLoopDestination"
                      placeholder="e.g., Los Angeles"
                      required
                      value={loopForm.destination}
                      onChange={(event) =>
                        setLoopForm((prev) => ({
                          ...prev,
                          destination: event.target.value
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="newLoopEstDeparture" className="form-label">
                      Est. Departure
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="newLoopEstDeparture"
                      required
                      value={loopForm.departure}
                      onChange={(event) =>
                        setLoopForm((prev) => ({
                          ...prev,
                          departure: event.target.value
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="newLoopEstArrival" className="form-label">
                      Est. Arrival
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="newLoopEstArrival"
                      required
                      value={loopForm.arrival}
                      onChange={(event) =>
                        setLoopForm((prev) => ({
                          ...prev,
                          arrival: event.target.value
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 px-0">
                  <button type="button" className="btn btn-light" data-bs-dismiss="modal" onClick={() => newLoopModalInstance?.hide()}>
                    Cancel
                  </button>
                  <Button type="submit">
                    Create Loop
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </NavbarWrapper>
  );
};

export default InvoiceProcessingWorkflow;
