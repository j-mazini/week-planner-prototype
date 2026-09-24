'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import {
  type ServicePartnerDTO,
  type CostModelServicePartnerItem,
  type ServicePartnerSpVsrForm,
  buildSpVsrCostModels,
  parseSpVsrToForm,
  groupSpVsrPeriods,
} from '@/lib/service-partners-api';

export interface ServicePartnerFormData {
  partnerName: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  /** Cost models (SP_VSR) do service partner. */
  costModels?: CostModelServicePartnerItem[];
  dailyServiceCharge?: number;
  reimbursement?: number;
}

interface ServicePartnerModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: ServicePartnerFormData, selected: ServicePartnerDTO | null) => Promise<void>;
  servicePartner: ServicePartnerDTO | null;
}

const BAND_NUMBERS = [1, 2, 3, 4] as const;
type BandNumber = (typeof BAND_NUMBERS)[number];

/** Estado de um grupo de cost model (SP_VSR ou SP_VSR Electric): seus períodos + rascunho de novo período. */
interface CostModelGroupState {
  periods: ServicePartnerSpVsrForm[];
  activeIndex: number;
  isAddingNew: boolean;
  newPeriod: ServicePartnerSpVsrForm;
}

const emptyGroupState = (): CostModelGroupState => ({
  periods: [{}],
  activeIndex: 0,
  isAddingNew: false,
  newPeriod: {},
});

const subtractOneDay = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const getTodayDateString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatDateForDisplay = (dateString?: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return year && month && day ? `${day}/${month}/${year}` : dateString;
};

const isFilled = (v?: string): boolean => v !== undefined && v !== null && v.trim() !== '';

/** Tudo-ou-nada: se qualquer campo das 4 faixas foi preenchido, todas as 4 faixas + a data de início passam a ser obrigatórias. */
const validateSpVsrPeriod = (period: ServicePartnerSpVsrForm, label: string): string[] => {
  const hasAnyField = BAND_NUMBERS.some(
    (n) => isFilled(period[`band${n}MaxStops`]) || isFilled(period[`band${n}Rate`])
  ) || isFilled(period.validityStartDate) || isFilled(period.validityEndDate);

  if (!hasAnyField) return [];

  const missing: string[] = [];
  BAND_NUMBERS.forEach((n) => {
    if (!isFilled(period[`band${n}MaxStops`])) missing.push(`${label} — Band ${n} Max Stops`);
    if (!isFilled(period[`band${n}Rate`])) missing.push(`${label} — Band ${n} Price per Stop`);
  });
  if (!isFilled(period.validityStartDate)) missing.push(`${label} — Validity Start Date`);
  return missing;
};

const ServicePartnerModal: React.FC<ServicePartnerModalProps> = ({ show, onClose, onSave, servicePartner }) => {
  const [partnerName, setPartnerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [dailyServiceCharge, setDailyServiceCharge] = useState('');
  const [reimbursement, setReimbursement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();

  // SP_VSR e SP_VSR Electric são dois grupos de cost model independentes, cada um
  // com seus próprios períodos/histórico/New/Delete (mesmo padrão do VendorModal).
  const [standardGroup, setStandardGroup] = useState<CostModelGroupState>(emptyGroupState());
  const [electricGroup, setElectricGroup] = useState<CostModelGroupState>(emptyGroupState());
  const [costModelErrors, setCostModelErrors] = useState<string[]>([]);
  // validityEndDate do período mais recente de cada grupo antes de abrir "New",
  // para o Cancel poder restaurar (o rascunho encurta automaticamente essa data).
  const standardOriginalEndDateRef = useRef<string | undefined>(undefined);
  const electricOriginalEndDateRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (show) {
      setPartnerName(servicePartner?.partnerName ?? '');
      setAddress(servicePartner?.address ?? '');
      setPhone(servicePartner?.phone ?? '');
      setVatNumber(servicePartner?.vatNumber ?? '');
      setDailyServiceCharge(servicePartner?.dailyServiceCharge ? String(servicePartner.dailyServiceCharge) : '');
      setReimbursement(servicePartner?.reimbursement ? String(servicePartner.reimbursement) : '');

      const standardGroups = groupSpVsrPeriods(servicePartner?.costModels, false);
      const electricGroups = groupSpVsrPeriods(servicePartner?.costModels, true);
      setStandardGroup({
        ...emptyGroupState(),
        periods: standardGroups.length > 0 ? standardGroups.map((g) => parseSpVsrToForm(g.items)) : [{}],
      });
      setElectricGroup({
        ...emptyGroupState(),
        periods: electricGroups.length > 0 ? electricGroups.map((g) => parseSpVsrToForm(g.items)) : [{}],
      });
      setCostModelErrors([]);
    }
  }, [show, servicePartner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      alert('Partner name is required');
      return;
    }

    const validateGroup = (group: CostModelGroupState, name: string) => {
      const errors = group.periods.flatMap((p, i) =>
        validateSpVsrPeriod(p, `${name} — Period ${i + 1} (${formatDateForDisplay(p.validityStartDate) || 'no date'})`)
      );
      if (group.isAddingNew) errors.push(...validateSpVsrPeriod(group.newPeriod, `${name} — New Period`));
      return errors;
    };
    const errors = [...validateGroup(standardGroup, 'SP_VSR'), ...validateGroup(electricGroup, 'SP_VSR Electric')];

    if (errors.length > 0) {
      setCostModelErrors(errors);
      return;
    }
    setCostModelErrors([]);

    setIsSubmitting(true);
    try {
      const flattenGroup = (group: CostModelGroupState, isElectric: boolean) => {
        const allPeriods = group.isAddingNew ? [...group.periods, group.newPeriod] : group.periods;
        return allPeriods.flatMap((p) => buildSpVsrCostModels(p, isElectric));
      };
      const payload: ServicePartnerFormData = {
        partnerName: partnerName.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        vatNumber: vatNumber.trim() || undefined,
        costModels: [...flattenGroup(standardGroup, false), ...flattenGroup(electricGroup, true)],
        dailyServiceCharge: dailyServiceCharge.trim() ? Number(dailyServiceCharge) : undefined,
        reimbursement: reimbursement.trim() ? Number(reimbursement) : undefined,
      };
      await onSave(payload, servicePartner);
      onClose();
    } catch (err) {
      console.error('Error saving service partner:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to save service partner'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  const isEditing = !!servicePartner;

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderBandRow = (
    bandNum: BandNumber,
    period: ServicePartnerSpVsrForm,
    onChange: (key: keyof ServicePartnerSpVsrForm, value: string) => void,
    disabled: boolean,
    testIdPrefix: string,
    onBand1Focus?: () => void,
  ) => {
    const maxKey = `band${bandNum}MaxStops` as const;
    const rateKey = `band${bandNum}Rate` as const;
    return (
      <div className="row g-2 mb-2 align-items-end" key={bandNum}>
        <div className="col-2"><label className="form-label text-black small mb-0">Band {bandNum}</label></div>
        <div className="col-5">
          <input
            type="number"
            min={0}
            step="1"
            className="form-control form-control-sm text-dark bg-white"
            placeholder="Up to stops"
            value={period[maxKey] ?? ''}
            onChange={(e) => onChange(maxKey, e.target.value)}
            onFocus={bandNum === 1 ? onBand1Focus : undefined}
            disabled={disabled}
            data-testid={`${testIdPrefix}-band-${bandNum}-max`}
          />
        </div>
        <div className="col-5">
          <input
            type="number"
            min={0}
            step="0.01"
            className="form-control form-control-sm text-dark bg-white"
            placeholder="Price per stop"
            value={period[rateKey] ?? ''}
            onChange={(e) => onChange(rateKey, e.target.value)}
            onFocus={bandNum === 1 ? onBand1Focus : undefined}
            disabled={disabled}
            data-testid={`${testIdPrefix}-band-${bandNum}-rate`}
          />
        </div>
      </div>
    );
  };

  /** Renderiza um grupo de cost model inteiro (SP_VSR ou SP_VSR Electric): título, New/Delete, bandas, histórico e rascunho de novo período. */
  const renderCostModelGroup = (
    title: string,
    group: CostModelGroupState,
    setGroup: React.Dispatch<React.SetStateAction<CostModelGroupState>>,
    originalEndDateRef: React.MutableRefObject<string | undefined>,
    isElectric: boolean,
    testIdPrefix: string,
  ) => {
    const { periods, activeIndex, isAddingNew, newPeriod } = group;
    const activePeriod = periods[activeIndex] ?? {};

    const setBand = (key: keyof ServicePartnerSpVsrForm, value: string) =>
      setGroup((g) => ({ ...g, periods: g.periods.map((p, i) => (i === g.activeIndex ? { ...p, [key]: value } : p)) }));

    const setNewBand = (key: keyof ServicePartnerSpVsrForm, value: string) =>
      setGroup((g) => ({ ...g, newPeriod: { ...g.newPeriod, [key]: value } }));

    const setActiveIndex = (i: number) => setGroup((g) => ({ ...g, activeIndex: i }));

    const toggleNewPeriod = () => {
      if (isAddingNew) {
        const original = originalEndDateRef.current;
        setGroup((g) => ({
          ...g,
          isAddingNew: false,
          newPeriod: {},
          periods: g.periods.map((p, i) => (i === 0 ? { ...p, validityEndDate: original } : p)),
        }));
        return;
      }
      originalEndDateRef.current = periods[0]?.validityEndDate;
      setGroup((g) => ({ ...g, activeIndex: 0, isAddingNew: true, newPeriod: {} }));
    };

    const handleNewValidityStartDateChange = (value: string) => {
      if (value && periods.some((p) => p.validityStartDate === value)) {
        alert(`A ${title} period starting ${formatDateForDisplay(value)} already exists. Choose another date.`);
        return;
      }
      setNewBand('validityStartDate', value);
      if (value) {
        const previousEndDate = subtractOneDay(value);
        setGroup((g) => ({ ...g, periods: g.periods.map((p, i) => (i === 0 ? { ...p, validityEndDate: previousEndDate } : p)) }));
      }
    };

    const handleDeleteActivePeriod = () => {
      if (!activePeriod.validityStartDate) return;
      const label = formatDateForDisplay(activePeriod.validityStartDate);
      if (!window.confirm(`Delete the ${title} period starting ${label}? This cannot be undone.`)) return;
      setGroup((g) => {
        const next = g.periods.filter((_, i) => i !== g.activeIndex);
        return { ...g, periods: next.length > 0 ? next : [{}], activeIndex: 0 };
      });
    };

    return (
      <div className="mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong className="text-primary">{title}</strong>
          {isEditing && (
            <div className="d-flex gap-2">
              {activePeriod.validityStartDate && !isAddingNew && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleDeleteActivePeriod}
                  disabled={isSubmitting}
                  data-testid={`${testIdPrefix}-delete-btn`}
                >
                  <i className="bi bi-trash" /> Delete
                </button>
              )}
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={toggleNewPeriod}
                disabled={isSubmitting}
                data-testid={`${testIdPrefix}-new-btn`}
              >
                <i className={`bi ${isAddingNew ? 'bi-x-lg' : 'bi-plus-lg'} me-1`} />
                {isAddingNew ? 'Cancel' : 'New'}
              </button>
            </div>
          )}
        </div>

        {BAND_NUMBERS.map((n) =>
          renderBandRow(n, activePeriod, setBand, isSubmitting, `${testIdPrefix}-active`, () => {
            if (!activePeriod.validityStartDate) setBand('validityStartDate', getTodayDateString());
          })
        )}

        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <label className="form-label text-black">Validity Start</label>
            <div className="input-group">
              <input
                type="date"
                className="form-control text-dark bg-white"
                value={activePeriod.validityStartDate ?? ''}
                onChange={(e) => setBand('validityStartDate', e.target.value)}
                disabled={isSubmitting || isAddingNew}
                data-testid={`${testIdPrefix}-active-validity-start`}
              />
              {periods.length > 1 && !isAddingNew && (
                <details className="position-relative">
                  <summary
                    className="btn btn-outline-secondary h-100 d-flex align-items-center"
                    style={{ listStyle: 'none' }}
                    title="Select existing period"
                    data-testid={`${testIdPrefix}-history-toggle`}
                  >
                    <i className="bi bi-caret-down-fill" />
                  </summary>
                  <div
                    className="position-absolute end-0 mt-1 bg-white border rounded shadow-sm"
                    style={{ minWidth: '160px', zIndex: 1080, maxHeight: '220px', overflowY: 'auto' }}
                  >
                    {periods.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        data-testid={`${testIdPrefix}-history-item-${i}`}
                        className="dropdown-item"
                        onClick={(e) => {
                          setActiveIndex(i);
                          const detailsEl = e.currentTarget.closest('details');
                          if (detailsEl) detailsEl.removeAttribute('open');
                        }}
                      >
                        {formatDateForDisplay(p.validityStartDate) || `Period ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label text-black">Validity End</label>
            <input
              type="date"
              className="form-control text-dark bg-white"
              value={activePeriod.validityEndDate ?? ''}
              onChange={(e) => setBand('validityEndDate', e.target.value)}
              disabled={isSubmitting || isAddingNew}
              data-testid={`${testIdPrefix}-active-validity-end`}
            />
          </div>
        </div>

        {isAddingNew && (
          <>
            <hr className="mt-3" />
            <strong className="text-primary d-block mb-2" style={{ color: '#6f42c1' }}>
              New {title} Period
            </strong>

            {BAND_NUMBERS.map((n) => renderBandRow(n, newPeriod, setNewBand, isSubmitting, `${testIdPrefix}-new`))}

            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <label className="form-label text-black">Validity Start</label>
                <input
                  type="date"
                  className="form-control text-dark bg-white"
                  value={newPeriod.validityStartDate ?? ''}
                  onChange={(e) => handleNewValidityStartDateChange(e.target.value)}
                  disabled={isSubmitting}
                  data-testid={`${testIdPrefix}-new-validity-start`}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-black">Validity End</label>
                <input
                  type="date"
                  className="form-control text-dark bg-white"
                  value={newPeriod.validityEndDate ?? ''}
                  onChange={(e) => setGroup((g) => ({ ...g, newPeriod: { ...g.newPeriod, validityEndDate: e.target.value } }))}
                  disabled={isSubmitting}
                  data-testid={`${testIdPrefix}-new-validity-end`}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[1040] bg-black/50 backdrop-blur-sm transition-opacity duration-300" aria-hidden="true" />
      <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 overflow-y-auto" tabIndex={-1} role="dialog" aria-modal="true">
        <div
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-[#e9ecef]">
            <h5 className="text-xl font-semibold text-[#2c3e50] flex items-center gap-2">
              <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-people'} text-primary`} />
              {isEditing ? 'Edit Service Partner' : 'New Service Partner'}
            </h5>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-[#f8f9fa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-[#6c757d]" />
            </button>
          </div>

          <form onSubmit={guard(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 text-[#2c3e50]">
              <h6 className="font-semibold pb-2 border-b border-[#e9ecef] mb-4 text-[#2c3e50]">
                <i className="bi bi-info-circle me-2 text-primary" />
                Identification
              </h6>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label text-black">Partner Name *</label>
                  <input
                    type="text"
                    className="form-control text-dark bg-white"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Enter partner name"
                    required
                    disabled={isSubmitting}
                    autoFocus
                    maxLength={255}
                  />
                </div>
              </div>

              <h6 className="font-semibold pb-2 border-b border-[#e9ecef] mb-4 mt-6 text-[#2c3e50]">
                <i className="bi bi-geo-alt me-2 text-primary" />
                Contact & Fiscal
              </h6>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label text-black">Address</label>
                  <input
                    type="text"
                    className="form-control text-dark bg-white"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, number, city, country"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-black">Phone</label>
                  <input
                    type="tel"
                    className="form-control text-dark bg-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+351 912 345 678"
                    disabled={isSubmitting}
                    maxLength={25}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-black">VAT Number</label>
                  <input
                    type="text"
                    className="form-control text-dark bg-white"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="PT123456789"
                    disabled={isSubmitting}
                    maxLength={30}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-black">Daily Service Charge</label>
                  <input
                    type="number"
                    className="form-control text-dark bg-white"
                    value={dailyServiceCharge}
                    onChange={(e) => setDailyServiceCharge(e.target.value)}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    min={0}
                    step="0.01"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-black">Reimbursement</label>
                  <input
                    type="number"
                    className="form-control text-dark bg-white"
                    value={reimbursement}
                    onChange={(e) => setReimbursement(e.target.value)}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    min={0}
                    step="0.01"
                  />
                </div>
              </div>

              <h6 className="font-semibold pb-2 border-b border-[#e9ecef] mb-4 mt-6 text-[#2c3e50]">
                <i className="bi bi-cash-coin me-2 text-primary" />
                Cost Model
              </h6>
              <p className="text-secondary small">
                4 stop bands per period. Each band: max stops and price per stop. Min stops is derived
                automatically (band 1 starts at 1; each next band starts after the previous band&apos;s max).
                SP_VSR and SP_VSR Electric are independent cost models, each with its own period history.
              </p>

              {costModelErrors.length > 0 && (
                <div className="alert alert-danger small py-2" data-testid="cost-model-errors">
                  <strong>Missing required fields:</strong>
                  <ul className="mb-0">
                    {costModelErrors.map((msg) => <li key={msg}>{msg}</li>)}
                  </ul>
                </div>
              )}

              {renderCostModelGroup('SP_VSR', standardGroup, setStandardGroup, standardOriginalEndDateRef, false, 'standard')}
              <hr className="my-4" />
              {renderCostModelGroup('SP_VSR Electric', electricGroup, setElectricGroup, electricOriginalEndDateRef, true, 'electric')}

              {isEditing && (servicePartner.createdBy || servicePartner.createdAt || servicePartner.updatedAt) && (
                <>
                  <h6 className="font-semibold pb-2 border-b border-[#e9ecef] mb-4 mt-6 text-[#2c3e50]">
                    <i className="bi bi-clock-history me-2 text-primary" />
                    Audit Information
                  </h6>
                  <div className="row g-2 small text-secondary">
                    {servicePartner.createdBy && (
                      <div className="col-md-6">
                        <i className="bi bi-person-circle me-1" />
                        <span className="fw-semibold">Created by: </span>
                        <span>{servicePartner.createdBy}</span>
                      </div>
                    )}
                    {servicePartner.createdAt && (
                      <div className="col-md-6">
                        <i className="bi bi-calendar-plus me-1" />
                        <span className="fw-semibold">Created: </span>
                        <span>{formatDate(servicePartner.createdAt)}</span>
                      </div>
                    )}
                    {servicePartner.updatedAt && (
                      <div className="col-md-6">
                        <i className="bi bi-arrow-repeat me-1" />
                        <span className="fw-semibold">Updated: </span>
                        <span>{formatDate(servicePartner.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <p className="text-secondary small mb-0 mt-3">Fields marked with * are required.</p>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#e9ecef] bg-[#f8f9fa]">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Service Partner' : 'Create Service Partner'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ServicePartnerModal;
