'use client';

import React, { useEffect, useState } from 'react';
import { createRoute, updateRoute, type RouteInDepositDTO, fetchLoops, type LoopDTO } from '@/lib/serviceTypes';
import { fetchDeposits, type DepositDTO } from '@/lib/api/deposits';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import { fetchServicePartners, type ServicePartnerDTO } from '@/lib/service-partners-api';

interface RouteModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: RouteInDepositDTO) => Promise<void>;
  route?: RouteInDepositDTO | null;
  depositId?: number;
  loopId?: number;
  customerId?: number; // Optional customerId from parent deposit
  customUpdateRoute?: (routeId: number, routeData: Partial<RouteInDepositDTO>) => Promise<RouteInDepositDTO>; // Optional custom update function
  showServicePartner?: boolean; // Show Service Partner select (BA Costs Centers)
}

const RouteModal: React.FC<RouteModalProps> = ({ 
  show, 
  onClose, 
  onSave, 
  route,
  depositId,
  loopId,
  customerId,
  customUpdateRoute,
  showServicePartner = false,
}) => {
  // O backend persiste `serviceTypeId` (coluna service_type_id). O select abaixo é
  // rotulado "Loop" por legado, mas as opções vêm de GET /bff/service-types via
  // fetchLoops(), que renomeia serviceTypeId -> loopId. O estado do formulário usa
  // `serviceTypeId` para que o payload chegue ao backend com a chave correta.
  const [formData, setFormData] = useState<Partial<RouteInDepositDTO & { serviceTypeId?: number; servicePartnerId?: number }>>({
    routeName: '',
    depositId: depositId,
    serviceTypeId: loopId,
    active: true,
    customerId: undefined,
    servicePartnerId: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();
  const [loops, setLoops] = useState<LoopDTO[]>([]);
  const [deposits, setDeposits] = useState<DepositDTO[]>([]);
  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Load loops, deposits, and (optionally) service partners when modal opens
  useEffect(() => {
    if (show) {
      setIsLoadingOptions(true);
      Promise.all([
        fetchLoops().catch(err => {
          console.error('Error fetching loops:', err);
          return [];
        }),
        fetchDeposits().catch(err => {
          console.error('Error fetching deposits:', err);
          return [];
        }),
        showServicePartner
          ? fetchServicePartners().catch(err => {
              console.error('Error fetching service partners:', err);
              return [] as ServicePartnerDTO[];
            })
          : Promise.resolve([] as ServicePartnerDTO[]),
      ]).then(([loopsData, depositsData, servicePartnersData]) => {
        setLoops(loopsData);
        setDeposits(depositsData);
        setServicePartners(servicePartnersData);
        setIsLoadingOptions(false);
      });
    }
  }, [show, showServicePartner]);

  useEffect(() => {
    if (show) {
      // Check if route exists AND has a valid routeId (greater than 0) for edit mode
      const isEditMode = route && route.routeId && route.routeId > 0;
      
      // If customerId is not provided but depositId is, try to find it in deposits
      let effectiveCustomerId = customerId;
      if (!effectiveCustomerId && depositId && deposits.length > 0) {
        const deposit = deposits.find(d => d.depositId === depositId);
        if (deposit) effectiveCustomerId = deposit.customerId;
      }
      
      if (isEditMode) {
        // Edit mode
        setFormData({
          routeName: route.routeName || '',
          depositId: route.depositId || depositId,
          // `serviceTypeId` é o que os callers passam (page.tsx); `loopId` fica como
          // fallback para chamadas legadas que ainda usem o nome antigo.
          serviceTypeId: route.serviceTypeId ?? route.loopId ?? loopId,
          active: route.active !== undefined ? route.active : true,
          customerId: route.customerId || effectiveCustomerId,
          servicePartnerId: route.servicePartnerId,
        });
      } else {
        // New mode
        setFormData({
          routeName: '',
          depositId: depositId,
          serviceTypeId: loopId,
          active: true,
          customerId: effectiveCustomerId,
          servicePartnerId: route?.servicePartnerId || undefined,
        });
      }
    }
  }, [show, route, depositId, loopId, customerId, deposits]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'serviceTypeId' || name === 'servicePartnerId') {
      // For select boxes, value is already the ID as string
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else if (name === 'depositId') {
      const newDepositId = value ? Number(value) : undefined;
      // When deposit changes, also try to update customerId
      const deposit = deposits.find(d => d.depositId === newDepositId);
      setFormData(prev => ({ 
        ...prev, 
        depositId: newDepositId,
        customerId: deposit?.customerId || prev.customerId 
      }));
    } else if (name === 'customerId') {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.routeName?.trim()) {
      alert('Route name is required');
      return;
    }
    
    if (formData.routeName.length > 10) {
      alert('Route name cannot exceed 10 characters');
      return;
    }

    if (!formData.depositId) {
      alert('Deposit is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if route exists AND has a valid routeId (greater than 0) for edit mode
      const isEditMode = route && route.routeId && route.routeId > 0;

      const payload = { ...formData };

      if (isEditMode && route?.routeId) {
        // Update - use custom function if provided, otherwise use default
        const updateFn = customUpdateRoute || updateRoute;
        const updatedRoute = await updateFn(route.routeId, payload as Partial<RouteInDepositDTO>);
        await onSave(updatedRoute);
      } else {
        // Create
        const newRoute = await createRoute(payload as Omit<RouteInDepositDTO, 'routeId'>);
        await onSave(newRoute);
      }
      onClose();
    } catch (error) {
      console.error('Error saving route:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save route'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1055, position: 'fixed' }}>
      <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 1056 }}>
        <div className="modal-content bg-white" style={{ zIndex: 1057 }}>
          <div className="modal-header">
            <h5 className="modal-title text-dark">{(route && route.routeId && route.routeId > 0) ? 'Edit Route' : 'New Route'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body text-dark">
              <div className="mb-3">
                <label className="form-label text-dark">Route Name *</label>
                <input
                  type="text"
                  name="routeName"
                  className="form-control text-dark bg-white"
                  value={formData.routeName || ''}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  maxLength={10}
                />
              </div>

              {/* Deposit Select - Only show if depositId is not provided as prop */}
              {!depositId && (
                <div className="mb-3">
                  <label className="form-label text-dark">Deposit *</label>
                  <select
                    name="depositId"
                    className="form-control text-dark bg-white"
                    value={formData.depositId || ''}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || isLoadingOptions}
                  >
                    <option value="">Select a deposit...</option>
                    {deposits.map(deposit => (
                      <option key={deposit.depositId} value={deposit.depositId}>
                        {deposit.depositName || `Deposit ${deposit.depositId}`}
                      </option>
                    ))}
                  </select>
                  {isLoadingOptions && <small className="text-secondary">Loading deposits...</small>}
                </div>
              )}
              
              {/* Loop Select - Only show if loopId is not provided as prop */}
              {!loopId && (
                <div className="mb-3">
                  <label className="form-label text-dark">Loop</label>
                  <select
                    name="serviceTypeId"
                    className="form-control text-dark bg-white"
                    value={formData.serviceTypeId || ''}
                    onChange={handleChange}
                    disabled={isSubmitting || isLoadingOptions}
                  >
                    <option value="">Select a loop (optional)...</option>
                    {loops
                      .filter(loop => !depositId || (loop.depositId && loop.depositId === depositId))
                      .map(loop => (
                        <option key={loop.loopId} value={loop.loopId}>
                          {loop.loop_name || loop.loopName || `Loop ${loop.loopId}`}
                        </option>
                      ))}
                  </select>
                  {isLoadingOptions && <small className="text-secondary">Loading loops...</small>}
                  {!isLoadingOptions && loops.length === 0 && (
                    <small className="text-secondary">No loops available</small>
                  )}
                </div>
              )}

              {/* Service Partner Select (BA Costs Centers) */}
              {showServicePartner && (
                <div className="mb-3">
                  <label className="form-label text-dark">Service Partner</label>
                  <select
                    name="servicePartnerId"
                    className="form-control text-dark bg-white"
                    value={formData.servicePartnerId || ''}
                    onChange={handleChange}
                    disabled={isSubmitting || isLoadingOptions}
                  >
                    <option value="">Select a service partner (optional)...</option>
                    {servicePartners.map(sp => (
                      <option key={sp.servicePartnerId} value={sp.servicePartnerId}>
                        {sp.partnerName || `Service Partner ${sp.servicePartnerId}`}
                      </option>
                    ))}
                  </select>
                  {isLoadingOptions && <small className="text-secondary">Loading service partners...</small>}
                  {!isLoadingOptions && servicePartners.length === 0 && (
                    <small className="text-secondary">No service partners available</small>
                  )}
                </div>
              )}

              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="active"
                    id="active"
                    checked={formData.active !== undefined ? formData.active : true}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <label className="form-check-label text-dark" htmlFor="active">
                    Active
                  </label>
                </div>
              </div>
              <p className="text-secondary small mb-0">Fields marked with * are required.</p>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting}>
                {isSubmitting ? 'Saving...' : (route && route.routeId && route.routeId > 0) ? 'Update Route' : 'Create Route'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default RouteModal;

