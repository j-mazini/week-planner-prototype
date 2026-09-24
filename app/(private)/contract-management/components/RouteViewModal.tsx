'use client';

import React, { useState, useEffect } from 'react';
import { fetchCustomers } from '@/lib/customers-api';
import { fetchServiceTypesDTO } from '@/lib/serviceTypes';

export interface RouteViewData {
  routeId: number;
  routeName: string;
  active: boolean;
  customerId: number;
  depositId: number;
  serviceTypeId?: number;
}

// Type guard to check if route has serviceTypeId
const hasServiceTypeId = (route: RouteViewData): route is RouteViewData & { serviceTypeId: number } => {
  return route.serviceTypeId !== undefined && route.serviceTypeId !== null && route.serviceTypeId !== 0;
};

interface RouteViewModalProps {
  show: boolean;
  onClose: () => void;
  route: RouteViewData | null;
  depositName?: string;
}

const RouteViewModal: React.FC<RouteViewModalProps> = ({ 
  show, 
  onClose, 
  route,
  depositName
}) => {
  const [customerName, setCustomerName] = useState<string>('');
  const [serviceTypeName, setServiceTypeName] = useState<string>('');
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isLoadingServiceType, setIsLoadingServiceType] = useState(false);

  useEffect(() => {
    if (show && route) {
      // Fetch customer name
      if (route.customerId) {
        setIsLoadingCustomer(true);
        fetchCustomers()
          .then(customers => {
            const customer = customers.find(c => c.customerId === route.customerId);
            setCustomerName(customer?.customerName || '');
          })
          .catch(error => {
            console.error('Error fetching customer:', error);
            setCustomerName('');
          })
          .finally(() => {
            setIsLoadingCustomer(false);
          });
      } else {
        setCustomerName('');
      }

      // Fetch service type name
      if (hasServiceTypeId(route)) {
        setIsLoadingServiceType(true);
        fetchServiceTypesDTO()
          .then(serviceTypes => {
            const serviceType = serviceTypes.find(st => st.serviceTypeId === route.serviceTypeId);
            setServiceTypeName(serviceType?.name || '');
          })
          .catch(error => {
            console.error('Error fetching service type:', error);
            setServiceTypeName('');
          })
          .finally(() => {
            setIsLoadingServiceType(false);
          });
      } else {
        setServiceTypeName('');
      }
    } else {
      setCustomerName('');
      setServiceTypeName('');
    }
  }, [show, route]);

  if (!show || !route) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1055, position: 'fixed' }}>
      <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 1056, maxWidth: '800px', width: '90%' }}>
        <div className="modal-content" style={{ zIndex: 1057 }}>
          <div className="modal-header border-bottom py-3">
            <div className="flex-1">
              <h5 className="modal-title mb-0" style={{ fontSize: '1.1rem' }}>Route Dashboard</h5>
              <p className="text-muted small mb-0 mt-1">{route.routeName || `Route ${route.routeId}`}</p>
            </div>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-3">
            {/* Dashboard Cards - Compact */}
            <div className="row g-2 mb-3">
              {/* Status Card */}
              <div className="col-md-4">
                <div className={`card border-0 shadow-sm ${route.active ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <div className="card-body p-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <p className="text-[10px] text-muted mb-0 fw-semibold uppercase">Status</p>
                        <span className={`badge ${route.active ? 'bg-emerald-600' : 'bg-rose-600'} px-2 py-1 mt-1`} style={{ fontSize: '11px' }}>
                          {route.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${route.active ? 'bg-emerald-100' : 'bg-rose-100'}`} style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                        <i className={`bi bi-${route.active ? 'check-circle-fill' : 'x-circle-fill'} ${route.active ? 'text-emerald-600' : 'text-rose-600'}`} style={{ fontSize: '18px', lineHeight: '1', display: 'block' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Card */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm bg-blue-50">
                  <div className="card-body p-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted mb-0 fw-semibold uppercase">Customer</p>
                        <p className="mb-0 text-xs fw-bold text-slate-900 truncate mt-1">
                          {isLoadingCustomer ? (
                            <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }}></span>
                          ) : (
                            customerName || 'N/A'
                          )}
                        </p>
                      </div>
                      <div className="rounded-circle p-2 bg-blue-100 ms-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                        <i className="bi bi-person-fill text-blue-600" style={{ fontSize: '18px', lineHeight: '1', display: 'block' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Card */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm bg-indigo-50">
                  <div className="card-body p-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted mb-0 fw-semibold uppercase">Deposit</p>
                        <p className="mb-0 text-xs fw-bold text-slate-900 truncate mt-1">
                          {depositName || 'N/A'}
                        </p>
                      </div>
                      <div className="rounded-circle p-2 bg-indigo-100 ms-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                        <i className="bi bi-building text-indigo-600" style={{ fontSize: '18px', lineHeight: '1', display: 'block' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Type Card (if available) */}
              {hasServiceTypeId(route) && (
                <div className="col-md-12 mt-2">
                  <div className="card border-0 shadow-sm bg-purple-50">
                    <div className="card-body p-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted mb-0 fw-semibold uppercase">Service Type</p>
                          <p className="mb-0 text-xs fw-bold text-slate-900 truncate mt-1">
                            {isLoadingServiceType ? (
                              <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }}></span>
                            ) : (
                              serviceTypeName || 'N/A'
                            )}
                          </p>
                        </div>
                        <div className="rounded-circle p-2 bg-purple-100 ms-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                          <i className="bi bi-gear-fill text-purple-600" style={{ fontSize: '18px', lineHeight: '1', display: 'block' }}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer border-top py-2 d-flex justify-content-between">
            <div>
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm" 
                onClick={onClose}
              >
                <i className="bi bi-x-lg me-1"></i>
                Close
              </button>
            </div>
            <div />
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default RouteViewModal;


