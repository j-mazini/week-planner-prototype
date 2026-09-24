'use client';
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NavbarWrapper from "@/components/navbar-wrapper";
import { hasAuthSession, getBearerAuthHeader } from "@/lib/auth"
import { TodayDateLine } from '@/app/(private)/components';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import './schedule.css';

interface Payment {
  id: number;
  invoiceId: string;
  vendor: string;
  period: string;
  paymentDate: Date;
  amount: number;
  deductions: number;
  status: 'Scheduled' | 'Paid' | 'Pending';
}

interface InvoiceApiResponse {
  invoiceId: number;
  invoiceNumber: string;
  userCode: string;
  courier: string;
  invoiceCreatedOn?: string;
  createdAt?: string;
  totalPayment: number;
  referenceDate: string;
  totalDeductions?: number;
  totalDetails?: number;
  subtotal?: number;
  total?: number;
}

const SchedulePayment = () => {
  // --- States ---
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { guard } = useSubmitGuard();
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Pending', 'Scheduled', 'Paid'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('');

  // Checkbox state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal / Edit States
  const [showModal, setShowModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Payment | null>(null);

  // Initialize month/year after mount
  useEffect(() => {
    if (!selectedMonthYear && typeof window !== 'undefined') {
      const now = new Date();
      const initialValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonthYear(initialValue);
    }
  }, [selectedMonthYear]);

  // Function to generate last 12 months
  const getLast12Months = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentDate = new Date();
    const availableMonths = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();

      availableMonths.push({
        value: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
        label: `${months[monthIndex]} ${year}`,
        date: date
      });
    }

    return availableMonths;
  };

  // Function to fetch invoices from API
  const fetchInvoices = useCallback(async (monthYearOverride?: string) => {
    const monthYearToUse = monthYearOverride || selectedMonthYear;

    const API_BASE_URL = getApiBaseUrl();

    if (!API_BASE_URL) {
      setError("API URL is not configured. Please check your environment variables.");
      setIsLoading(false);
      return;
    }

    if (!hasAuthSession()) {
      setError("Authentication token not found. Please login again.");
      setIsLoading(false);
      return;
    }

    if (!monthYearToUse) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [ano, mes] = monthYearToUse.split('-').map(Number);
      const params = new URLSearchParams();
      params.append('mes', mes.toString());
      params.append('ano', ano.toString());

      const url = `${API_BASE_URL}/bff/invoices/search?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getBearerAuthHeader(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        let errorMessage = `Failed to fetch invoices (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text().catch(() => '');
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }

      const data: InvoiceApiResponse[] = await response.json();

      // Transform API data to Payment format
      const transformedPayments: Payment[] = data.map((invoice) => {
        let cleanInvoiceNumber = invoice.invoiceNumber || '';
        if (typeof cleanInvoiceNumber === 'string' && cleanInvoiceNumber.includes("null")) {
          cleanInvoiceNumber = cleanInvoiceNumber.replace("null", "");
        }

        const createdDate = invoice.createdAt || invoice.createdAt || invoice.invoiceCreatedOn || invoice.referenceDate;

        let period = 'N/A';
        if (invoice.referenceDate) {
          try {
            const refDate = new Date(invoice.referenceDate);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            period = `${monthNames[refDate.getMonth()]} ${refDate.getFullYear()}`;
          } catch (e) {
            console.warn('Error parsing referenceDate:', e);
          }
        }

        let deductions = 0;
        if (invoice.totalDeductions !== undefined) {
          deductions = invoice.totalDeductions;
        } else if (invoice.subtotal !== undefined && invoice.total !== undefined) {
          deductions = invoice.subtotal - invoice.total;
        }

        const status: 'Scheduled' | 'Paid' | 'Pending' = 'Pending';

        return {
          id: invoice.invoiceId,
          invoiceId: cleanInvoiceNumber || `INV-${invoice.invoiceId}`,
          vendor: invoice.courier || invoice.userCode || 'N/A',
          period: period,
          paymentDate: createdDate ? new Date(createdDate) : new Date(),
          amount: invoice.totalPayment || invoice.total || 0,
          deductions: deductions,
          status: status
        };
      });

      setPayments(transformedPayments);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonthYear]);

  // Fetch invoices when month/year changes
  useEffect(() => {
    if (selectedMonthYear) {
      fetchInvoices();
    }
  }, [selectedMonthYear, fetchInvoices]);

  // --- Helpers ---
  const formatCurrency = (val: number) => `£${Number(val || 0).toFixed(2)}`;

  const formatDate = (dateObj: Date | string) => {
    if (!dateObj) return '-';
    const d = new Date(dateObj);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const dateToInputString = (dateObj: Date | string) => {
    if (!dateObj) return '';
    return new Date(dateObj).toISOString().split('T')[0];
  };

  // --- Derived Data (Stats & Filtering) ---

  // 1. Calculate Stats (based on ALL data, regardless of filter)
  const stats = useMemo(() => {
    const init = { Paid: { count: 0, total: 0 }, Scheduled: { count: 0, total: 0 }, Pending: { count: 0, total: 0 } };
    return payments.reduce((acc, cur) => {
      const key = cur.status;
      if (acc[key as keyof typeof acc]) {
        acc[key as keyof typeof acc].count += 1;
        acc[key as keyof typeof acc].total += (Number(cur.amount) - Number(cur.deductions));
      }
      return acc;
    }, init);
  }, [payments]);

  // 2. Filter & Sort Data
  const filteredData = useMemo(() => {
    let data = [...payments];

    // Filter by Status
    if (filterStatus !== 'All') {
      data = data.filter(item => item.status === filterStatus);
    }

    // Sort by Date (ascending)
    data.sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

    return data;
  }, [payments, filterStatus]);

  // 3. Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // --- Handlers ---

  const handleTabChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEditClick = (item: Payment) => {
    setEditFormData({ ...item });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditFormData(null);
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    setPayments(prev => prev.map(p =>
      p.id === editFormData.id
        ? {
          ...editFormData,
          paymentDate: new Date(editFormData.paymentDate),
          amount: parseFloat(String(editFormData.amount)),
          deductions: parseFloat(String(editFormData.deductions))
        }
        : p
    ));
    handleModalClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (!editFormData) return;

    const keyMap: Record<string, keyof Payment> = {
      editInvoiceId: 'invoiceId',
      editVendor: 'vendor',
      editPeriod: 'period',
      editPaymentDate: 'paymentDate',
      editAmount: 'amount',
      editDeductions: 'deductions',
      editStatus: 'status'
    };

    const key = keyMap[id];
    if (key) {
      setEditFormData(prev => {
        if (!prev) return null;
        return { ...prev, [key]: value };
      });
    }
  };

  // Checkbox Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // --- Render Helpers ---

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <i className="bi bi-check2-circle"></i>;
      case 'Scheduled': return <i className="bi bi-calendar2-check"></i>;
      case 'Pending': return <i className="bi bi-hourglass-split"></i>;
      default: return null;
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Paid': return 'paid';
      case 'Scheduled': return 'scheduled';
      case 'Pending': return 'pending';
      default: return '';
    }
  };

  return (
    <NavbarWrapper>
      <div className="wrapper">
        <div id="main-content">

          {/* Header */}
          <header className="page-header">
            <h1 className="page-title">Schedule for Payment</h1>
            <TodayDateLine className="mt-1 text-xs font-medium text-slate-500" />
            <div className="user-profile-box ms-auto">
              <div className="user-info">
                <div className="company-name">Thiago Brito</div>
              </div>
              <div className="user-logo d-flex align-items-center justify-content-center text-muted small">Logo</div>
            </div>
          </header>

          <main className="page-content">

            {/* Status Cards */}
            <div className="status-cards">
              {['Paid', 'Scheduled', 'Pending'].map(status => (
                <div
                  key={status}
                  className={`status-card ${status.toLowerCase()} ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => handleTabChange(status)}
                >
                  <div className="icon-wrap">{getStatusIcon(status)}</div>
                  <div className="meta">
                    <div className="label">{status}</div>
                    <div className="value">{stats[status as keyof typeof stats].count} invoices</div>
                    <div className="subvalue">Total {formatCurrency(stats[status as keyof typeof stats].total)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Month/Year Selector */}
            <div className="controls-bar mb-3">
              <div className="input-group" style={{ maxWidth: '250px', minWidth: '200px' }}>
                <span className="input-group-text">
                  <i className="bi bi-calendar3" />
                </span>
                <select
                  className="form-select"
                  value={selectedMonthYear || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setSelectedMonthYear(newValue);
                    setCurrentPage(1);
                    fetchInvoices(newValue);
                  }}
                  style={{ height: '44px' }}
                  disabled={!selectedMonthYear}
                >
                  {selectedMonthYear ? (
                    getLast12Months().map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading...</option>
                  )}
                </select>
              </div>
            </div>

            {/* Main Table Content */}
            <div className="payment-content">

              {/* Tabs */}
              <ul className="nav nav-tabs">
                {['All', 'Pending', 'Scheduled', 'Paid'].map(tab => (
                  <li className="nav-item" key={tab}>
                    <button
                      className={`nav-link ${filterStatus === tab ? 'active' : ''}`}
                      onClick={() => handleTabChange(tab)}
                    >
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="tab-content p-0">
                <div className="tab-pane fade show active">
                  {isLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">Loading payments...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger m-4" role="alert">
                      <h5 className="alert-heading">Error loading payments</h5>
                      <p>{error}</p>
                      <button className="btn btn-primary mt-2" onClick={() => fetchInvoices()}>
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="table-container">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th scope="col" className="text-center">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  onChange={handleSelectAll}
                                  checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                                />
                              </th>
                              <th scope="col">Invoice ID</th>
                              <th scope="col">Vendor</th>
                              <th scope="col">Period</th>
                              <th scope="col">Payment Date</th>
                              <th scope="col" className="text-right">Amount</th>
                              <th scope="col" className="text-right">Deductions</th>
                              <th scope="col">Status</th>
                              <th scope="col" className="text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedData.length === 0 ? (
                              <tr><td colSpan={9} className="text-center py-4 text-muted">No payments found.</td></tr>
                            ) : (
                              paginatedData.map(item => (
                                <tr key={item.id}>
                                  <td className="text-center">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={selectedIds.includes(item.id)}
                                      onChange={() => handleSelectOne(item.id)}
                                    />
                                  </td>
                                  <td>{item.invoiceId}</td>
                                  <td>{item.vendor}</td>
                                  <td>{item.period}</td>
                                  <td>{formatDate(item.paymentDate)}</td>
                                  <td className="text-right">{formatCurrency(item.amount)}</td>
                                  <td className="text-right">{formatCurrency(item.deductions)}</td>
                                  <td>
                                    <span className={`status-badge ${getBadgeClass(item.status)}`}>
                                      {item.status === 'Paid' ? <i className="bi bi-check-circle-fill"></i> :
                                        item.status === 'Scheduled' ? <i className="bi bi-calendar-check-fill"></i> :
                                          <i className="bi bi-hourglass-split"></i>}
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <i
                                      className="bi bi-pencil-square action-icon edit"
                                      onClick={() => handleEditClick(item)}
                                      title="Edit"
                                    ></i>
                                    <i
                                      className="bi bi-trash action-icon delete"
                                      onClick={() => handleDelete(item.id)}
                                      title="Delete"
                                    ></i>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="pagination-container">
                        <div className="pagination-info">
                          Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                        </div>
                        <nav>
                          <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Edit Modal - Custom Implementation controlled by React State */}
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={handleModalClose}>
          <div className="modal-dialog modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <form onSubmit={guard(handleModalSave)}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Payment Schedule</h5>
                  <button type="button" className="btn-close" onClick={handleModalClose}></button>
                </div>
                <div className="modal-body">
                  {editFormData && (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="editInvoiceId" className="form-label">Invoice ID</label>
                        <input type="text" className="form-control" id="editInvoiceId" value={editFormData.invoiceId} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="editVendor" className="form-label">Vendor</label>
                        <input type="text" className="form-control" id="editVendor" value={editFormData.vendor} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="editPeriod" className="form-label">Period</label>
                        <input type="text" className="form-control" id="editPeriod" value={editFormData.period} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="editPaymentDate" className="form-label">Payment Date</label>
                        <input
                          type="date"
                          className="form-control"
                          id="editPaymentDate"
                          value={dateToInputString(editFormData.paymentDate)}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="editAmount" className="form-label">Amount (£)</label>
                        <input type="number" step="0.01" className="form-control" id="editAmount" value={editFormData.amount} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="editDeductions" className="form-label">Deductions (£)</label>
                        <input type="number" step="0.01" className="form-control" id="editDeductions" value={editFormData.deductions} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="editStatus" className="form-label">Status</label>
                        <select className="form-select" id="editStatus" value={editFormData.status} onChange={handleInputChange} required>
                          <option value="Pending">Pending</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <Button type="button" variant="outline" onClick={handleModalClose}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </NavbarWrapper>
  );
};

export default SchedulePayment;
