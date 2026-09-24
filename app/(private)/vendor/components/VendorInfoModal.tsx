'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { VendorDocumentsDTO, Vendor } from '@/lib/vendors-api';
import { fetchVendorTrainingsByUserId } from '@/lib/vendors-api';
import { StatusBadge } from '@/components/status-badge';
import { formatDateForDisplay, isExpired, isExpiringSoon, getTrainingExpiryDate } from '../utils/vendor-utils';
import { vendorStyles } from '../styles';

type InfoType = 'training' | 'documents' | null;

interface VendorInfoModalProps {
  show: boolean;
  vendor: Vendor | null;
  type: InfoType;
  onClose: () => void;
}

const VendorInfoModal: React.FC<VendorInfoModalProps> = memo(({ show, vendor, type, onClose }) => {
  const [trainingData, setTrainingData] = useState<VendorDocumentsDTO | null>(null);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const loadTrainings = async () => {
      if (!show || type !== 'training') return;
      if (!vendor?.userId) {
        setTrainingError('Vendor ID not found for this vendor.');
        setTrainingData(null);
        return;
      }

      try {
        setLoadingTraining(true);
        setTrainingError(null);
        const data = await fetchVendorTrainingsByUserId(vendor.userId);
        setTrainingData(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load trainings.';
        setTrainingError(message);
        setTrainingData(null);
      } finally {
        setLoadingTraining(false);
      }
    };

    loadTrainings();

    if (!show || type !== 'training') {
      setTrainingData(null);
      setTrainingError(null);
      setLoadingTraining(false);
    }
  }, [show, type, vendor?.userId]);

  const title = type === 'training' ? 'Training Details' : 'Documents Details';

  const trainingItems = useMemo(() => {
    if (type !== 'training') return [];

    if (trainingData?.training?.vendorTrainings?.length) {
      return trainingData.training.vendorTrainings.map((item) => {
        const expiryDate = getTrainingExpiryDate(item.completedDate);
        const expired = expiryDate ? isExpired(expiryDate) : false;
        const expiringSoon = expiryDate ? isExpiringSoon(expiryDate) : false;
        
        let badge: string | null = item.completedDate ? 'active' : 'pending';
        if (expired) {
          badge = 'expired';
        } else if (expiringSoon) {
          badge = 'expiring';
        }

        let detail = item.completedDate
          ? `Date: ${formatDateForDisplay(item.completedDate)}`
          : null;
        
        if (expiryDate) {
          const expiryDisplay = formatDateForDisplay(expiryDate);
          detail = detail ? `${detail} | Expires: ${expiryDisplay}` : `Expires: ${expiryDisplay}`;
        }

        return {
          label: item.trainingName || `Training ${item.trainingId ?? item.vendorTrainingId ?? ''}`,
          value: item.completedDate ? 'Completed' : 'Pending',
          badge,
          detail,
        };
      });
    }

    const getTrainingItem = (
      label: string,
      completed: boolean,
      completedDate: string | undefined,
      trainingName?: string
    ) => {
      const expiryDate = getTrainingExpiryDate(completedDate);
      const expired = expiryDate ? isExpired(expiryDate) : false;
      const expiringSoon = expiryDate ? isExpiringSoon(expiryDate) : false;
      
      let badge: string | null = completed ? 'active' : 'pending';
      if (expired) {
        badge = 'expired';
      } else if (expiringSoon) {
        badge = 'expiring';
      }

      let detail = completedDate ? `Date: ${formatDateForDisplay(completedDate)}` : null;
      
      if (expiryDate) {
        const expiryDisplay = formatDateForDisplay(expiryDate);
        detail = detail ? `${detail} | Expires: ${expiryDisplay}` : `Expires: ${expiryDisplay}`;
      }

      return {
        label: trainingName || label,
        value: completed ? 'Completed' : 'Pending',
        badge,
        detail,
      };
    };

    return [
      getTrainingItem('Cargo Training', !!vendor?.cargoTraining, vendor?.cargoTrainingDate),
      getTrainingItem('Dangerous Goods Training', !!vendor?.dangerousGoodsTraining, vendor?.dangerousGoodsTrainingDate),
      getTrainingItem('Manual Handling Training', !!vendor?.manualHandlingTraining, vendor?.manualHandlingTrainingDate),
      {
        label: 'DHL Training Number',
        value: vendor?.dhlTrainingNumber || 'N/A',
        badge: null,
        detail: null,
      },
    ];
  }, [type, trainingData, vendor]);

  const documentItems = useMemo(() => {
    if (type !== 'documents') return [];

    const getDocumentItem = (
      label: string,
      expiryDate: string | undefined,
      checkDate?: string | undefined
    ) => {
      const expired = expiryDate ? isExpired(expiryDate) : false;
      const expiringSoon = expiryDate ? isExpiringSoon(expiryDate) : false;
      
      let badge: string | null = null;
      if (checkDate) {
        badge = 'verified';
      } else if (expired) {
        badge = 'expired';
      } else if (expiringSoon) {
        badge = 'expiring';
      } else if (!expiryDate) {
        badge = 'pending';
      }

      const value = expiryDate ? formatDateForDisplay(expiryDate) : (checkDate ? formatDateForDisplay(checkDate) : 'N/A');
      
      return {
        label,
        value,
        badge,
        detail: null,
      };
    };

    return [
      {
        label: 'Criminal Record Check',
        value: vendor?.criminalRecordDate ? formatDateForDisplay(vendor.criminalRecordDate) : 'Pending',
        badge: vendor?.criminalRecordDate ? 'verified' : 'pending',
        detail: null,
      },
      {
        label: 'DVLA Check',
        value: vendor?.dvlaCheckDate ? formatDateForDisplay(vendor.dvlaCheckDate) : 'Pending',
        badge: vendor?.dvlaCheckDate ? 'verified' : 'pending',
        detail: null,
      },
      getDocumentItem('Visa Validity', vendor?.visaValidity),
      getDocumentItem('Driving Licence Expiry', vendor?.licenceExpiringDate),
      getDocumentItem('Passport Expiry', vendor?.passportExpiringDate),
    ];
  }, [type, vendor]);

  const infoItems = type === 'training' ? trainingItems : documentItems;

  if (!mounted || !show || !vendor || !type) return null;

  return createPortal(
    <>
      <div 
        className={vendorStyles.modalBackdrop}
        aria-hidden="true"
      />

      <div 
        className={vendorStyles.modalContainer}
        role="dialog"
        aria-modal="true"
      >
        <div 
          className={`vendor-theme ${vendorStyles.modalContentLarge}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={vendorStyles.modalHeader}>
            <div>
              <p className="text-xs text-[#6c757d] mb-1">Vendor</p>
              <h5 className="text-lg font-semibold text-[#2c3e50]">
                {vendor.firstName} {vendor.lastName}
              </h5>
              {vendor.email && (
                <p className="text-sm text-[#6c757d]">{vendor.email}</p>
              )}
            </div>
            <div className="flex items-start gap-2">
              <span className={vendorStyles.modalInfoBadge}>
                {title}
              </span>
              <button 
                type="button" 
                className={vendorStyles.modalHeaderClose}
                onClick={onClose}
                aria-label="Close"
              >
                <i className={vendorStyles.modalHeaderCloseIcon}></i>
              </button>
            </div>
          </div>

          <div className={vendorStyles.modalScrollableContent}>
            {type === 'training' && loadingTraining && (
              <div className={vendorStyles.modalInfoLoading}>
                <div className={vendorStyles.modalInfoLoadingSpinner} />
                Loading trainings...
              </div>
            )}

            {type === 'training' && trainingError && (
              <div className={vendorStyles.modalInfoError}>
                {trainingError}
              </div>
            )}

            {!loadingTraining && !trainingError && infoItems.length === 0 && (
              <div className={vendorStyles.modalInfoEmpty}>
                No information available.
              </div>
            )}

            {!loadingTraining && !trainingError && infoItems.map((item) => (
              <div key={item.label} className={vendorStyles.modalInfoItem}>
                <div className="flex flex-col">
                  <span className={vendorStyles.modalInfoItemLabel}>{item.label}</span>
                  {item.detail && <span className={vendorStyles.modalInfoItemDetail}>{item.detail}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge ? (
                    <StatusBadge status={item.badge} className="text-xs">
                      {item.value}
                    </StatusBadge>
                  ) : (
                    <span className={vendorStyles.modalInfoItemValue}>
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  , document.body);
});

VendorInfoModal.displayName = 'VendorInfoModal';

export default VendorInfoModal;


