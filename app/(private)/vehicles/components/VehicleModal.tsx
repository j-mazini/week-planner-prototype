import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import type { Vehicle, VehicleFormData } from '../utils/vehicleMappers';
import { emptyFormData, normalizeFuelType } from '../utils/vehicleMappers';
import type { VehicleType } from '@/lib/vehicles';
import type { ServicePartnerDTO as ServicePartner } from '@/lib/service-partners-api';
import { vehiclesStyles } from '../styles';

type ModalMode = 'add' | 'edit';

interface VehicleModalProps {
  mode: ModalMode;
  vehicle?: Vehicle;
  isOpen: boolean;
  isSaving: boolean;
  vehicleTypes: VehicleType[];
  servicePartners?: ServicePartner[];
  servicePartnersLoading?: boolean;
  onClose: () => void;
  onSave: (formData: VehicleFormData) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  mode,
  vehicle,
  isOpen,
  isSaving,
  vehicleTypes,
  servicePartners = [],
  servicePartnersLoading = false,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<VehicleFormData>(emptyFormData);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Update form data when vehicle changes
  useEffect(() => {
    if (mode === 'edit' && vehicle) {
      const { id, ...rest } = vehicle;
      setFormData({
        ...rest,
        wrappedVehicle: Boolean(rest.wrappedVehicle),
        slamLock: Boolean(rest.slamLock),
        camera: Boolean(rest.camera),
        gps: Boolean(rest.gps),
        bulkhead: Boolean(rest.bulkhead),
        doors270: Boolean(rest.doors270)
      });
    } else {
      // For 'add' mode, set registrationDate to current date
      setFormData({
        ...emptyFormData,
        registrationDate: getCurrentDate()
      });
    }
  }, [mode, vehicle]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    let normalizedValue: unknown = value;

    if (id === 'fuelType') {
      normalizedValue = normalizeFuelType(value);
    } else if (id === 'servicePartnerId' && value) {
      normalizedValue = parseInt(value, 10);
    } else if (id === 'servicePartnerId' && !value) {
      normalizedValue = null;
    }

    setFormData((prev) => ({
      ...prev,
      [id]: normalizedValue
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleSave = useCallback(() => {
    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }
    onSave(formData);
  }, [formData, onSave]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={vehiclesStyles.modalBackdrop}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={vehiclesStyles.vehicleModalContainer}>
        <div className={vehiclesStyles.vehicleModalContent}>
          {/* Header */}
          <div className={vehiclesStyles.modalHeader}>
            <h5 className={vehiclesStyles.modalHeaderTitle}>
              {mode === 'edit' ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h5>
            <button
              type="button"
              className={vehiclesStyles.modalHeaderClose}
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className={vehiclesStyles.modalHeaderCloseIcon} />
            </button>
          </div>

          {/* Body */}
          <div className={vehiclesStyles.modalBody} style={{ fontFamily: "'Inter', sans-serif" }}>
            <form id="vehicleForm" ref={formRef} className={vehiclesStyles.form}>
              {/* Basic Information */}
              <div>
                <h6 className={vehiclesStyles.formSection}>Basic Information</h6>
                <div className={vehiclesStyles.formGrid}>
                  <div>
                    <label className={vehiclesStyles.formLabel} htmlFor="vrn">
                      Registration Plate <span className={vehiclesStyles.formLabelRequired}>*</span>
                    </label>
                    <input
                      type="text"
                      className={vehiclesStyles.formInput}
                      id="vrn"
                      placeholder="e.g., AB12CDE"
                      required
                      minLength={1}
                      value={formData.vrn}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={vehiclesStyles.formLabel} htmlFor="brand">
                      Manufacturer <span className={vehiclesStyles.formLabelRequired}>*</span>
                    </label>
                    <input
                      type="text"
                      className={vehiclesStyles.formInput}
                      id="brand"
                      placeholder="e.g., Ford, Toyota, BMW"
                      required
                      value={formData.brand}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={vehiclesStyles.formLabel} htmlFor="model">
                      Model <span className={vehiclesStyles.formLabelRequired}>*</span>
                    </label>
                    <input
                      type="text"
                      className={vehiclesStyles.formInput}
                      id="model"
                      placeholder="e.g., Focus, Corolla, 3 Series"
                      required
                      value={formData.model}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={vehiclesStyles.formLabel} htmlFor="registrationDate">
                      Registration Date <span className={vehiclesStyles.formLabelRequired}>*</span>
                    </label>
                    <input
                      type="date"
                      className={vehiclesStyles.formInput}
                      id="registrationDate"
                      required
                      value={formData.registrationDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={vehiclesStyles.formLabel} htmlFor="color">
                      Color <span className={vehiclesStyles.formLabelRequired}>*</span>
                    </label>
                    <input
                      type="text"
                      className={vehiclesStyles.formInput}
                      id="color"
                      placeholder="e.g., Blue, Red, Black"
                      required
                      value={formData.color}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={vehiclesStyles.formLabel} htmlFor="fuelType">Fuel Type</label>
                    <select
                      className={vehiclesStyles.formSelect}
                      id="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className={vehiclesStyles.formLabel} htmlFor="vehicleType">Vehicle Type</label>
                    <select
                      className={vehiclesStyles.formSelect}
                      id="vehicleType"
                      value={formData.vehicleType || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          vehicleType: value ? parseInt(value, 10) : undefined
                        }));
                      }}
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleTypes.length > 0 ? (
                        vehicleTypes
                          .filter((type) => {
                            const typeName = type.typeName.toLowerCase();
                            return typeName === 'cargobike' ||
                              typeName === 'motorbike' ||
                              typeName === 'van' ||
                              typeName === 'car';
                          })
                          .map((type) => (
                            <option key={type.vehicleTypeId} value={type.vehicleTypeId}>
                              {type.typeName}
                            </option>
                          ))
                      ) : (
                        <option value="" disabled>Loading vehicle types...</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h6 className={vehiclesStyles.formSection}>Status</h6>
                <div className={vehiclesStyles.formGrid}>
                  <div>
                    <label className={vehiclesStyles.formLabel} htmlFor="status">Status</label>
                    <select
                      className={vehiclesStyles.formSelect}
                      id="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className={vehiclesStyles.formLabel} htmlFor="servicePartnerId">Service Partner</label>
                    <select
                      className={vehiclesStyles.formSelect}
                      id="servicePartnerId"
                      value={formData.servicePartnerId ? String(formData.servicePartnerId) : ''}
                      onChange={handleInputChange}
                      disabled={servicePartnersLoading}
                    >
                      <option value="">Select a service partner</option>
                      {servicePartnersLoading ? (
                        <option value="" disabled>Loading service partners...</option>
                      ) : servicePartners && servicePartners.length > 0 ? (
                        servicePartners.map((partner) => (
                          <option key={partner.servicePartnerId} value={String(partner.servicePartnerId)}>
                            {partner.partnerName}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No service partners available</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Technical Information */}
              <div>
                <h6 className={vehiclesStyles.formSection}>Technical Information</h6>
                <div className={vehiclesStyles.formGridTechnical}>
                  {[
                    { id: 'wrappedVehicle', label: 'Wrapped' },
                    { id: 'slamLock', label: 'Slam Lock' },
                    { id: 'camera', label: 'Camera' },
                    { id: 'gps', label: 'GPS' },
                    { id: 'bulkhead', label: 'Bulkhead' },
                    { id: 'doors270', label: '270° Doors' }
                  ].map(({ id, label }) => (
                    <div key={id} className={vehiclesStyles.formCheckboxContainer}>
                      <input
                        className={vehiclesStyles.formCheckbox}
                        type="checkbox"
                        id={id}
                        checked={Boolean(formData[id as keyof VehicleFormData])}
                        onChange={handleCheckboxChange}
                      />
                      <label className={vehiclesStyles.formCheckboxLabel} htmlFor={id}>
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h6 className={vehiclesStyles.formSection}>Additional Information</h6>
                <div>
                  <label className={vehiclesStyles.formLabel} htmlFor="additionalNotes">Additional Notes</label>
                  <textarea
                    className={vehiclesStyles.formTextarea}
                    id="additionalNotes"
                    rows={3}
                    value={formData.additionalNotes || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className={vehiclesStyles.modalFooter}>
            <button
              type="button"
              className={`${vehiclesStyles.modalButton} ${vehiclesStyles.modalButtonCancel}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${vehiclesStyles.modalButton} ${vehiclesStyles.modalButtonSave}`}
              id="saveVehicleBtn"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className={vehiclesStyles.modalButtonSpinner}></div>
                  Saving...
                </>
              ) : (
                'Save Vehicle'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
