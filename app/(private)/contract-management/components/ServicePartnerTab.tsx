'use client';

import React, { useState } from 'react';
import { useServicePartners } from '../hooks/useServicePartners';
import { ServicePartnerCard } from './ServicePartnerCard';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';

const ServicePartnerModal = React.lazy(() => import('./ServicePartnerModal'));

interface ServicePartnerTabProps {
  onNewServicePartner?: () => void;
  exportButton?: React.ReactNode;
}

export const ServicePartnerTab: React.FC<ServicePartnerTabProps> = ({ exportButton }) => {
  const {
    filteredServicePartners,
    isLoading,
    error,
    filter,
    setFilter,
    handleSave,
    handleDeleteClick,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deletingItem,
    handleConfirmDelete,
    isDeleting,
  } = useServicePartners();

  const [showModal, setShowModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<ServicePartnerDTO | null>(null);

  const handleNew = () => {
    setSelectedPartner(null);
    setShowModal(true);
  };

  const handleEdit = (sp: ServicePartnerDTO) => {
    setSelectedPartner(sp);
    setShowModal(true);
  };

  const handleModalSave = async (
    data: { partnerName: string; address?: string; phone?: string; vatNumber?: string; dailyServiceCharge?: number; reimbursement?: number },
    selected: ServicePartnerDTO | null,
  ) => {
    await handleSave({ ...data, dailyServiceCharge: data.dailyServiceCharge ?? 0, reimbursement: data.reimbursement ?? 0 }, selected);
    setShowModal(false);
    setSelectedPartner(null);
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        {exportButton}
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
        >
          <i className="bi bi-plus-lg text-sm" />
          Add Service Partner
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        {/* Filters */}
        <aside className="space-y-4">
          <FiltersPanel onClear={() => setFilter({ search: '' })}>
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search service partners..."
            />
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading service partners..." />
          ) : filteredServicePartners.length === 0 ? (
            <EmptyState
              icon="🤝"
              title="No service partners found"
              subtitle="Try adjusting the filters or adding a new service partner."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredServicePartners.map((sp) => (
                <ServicePartnerCard
                  key={sp.servicePartnerId}
                  servicePartner={sp}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create / Edit Modal */}
      <React.Suspense fallback={null}>
        <ServicePartnerModal
          show={showModal}
          onClose={() => { setShowModal(false); setSelectedPartner(null); }}
          onSave={handleModalSave}
          servicePartner={selectedPartner}
        />
      </React.Suspense>

      {/* Delete Confirm */}
      {showDeleteConfirm && deletingItem && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[1040]" onClick={() => setShowDeleteConfirm(false)} />
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1050, position: 'fixed' }}>
            <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 1051 }}>
              <div className="modal-content" style={{ zIndex: 1052 }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title">
                    <i className="bi bi-exclamation-triangle-fill text-warning me-2" />
                    Confirm Deletion
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} />
                </div>
                <div className="modal-body pt-3">
                  <p>
                    Are you sure you want to delete{' '}
                    <strong>{deletingItem.partnerName}</strong>?
                  </p>
                  <div className="alert alert-warning mt-3 mb-0" role="alert">
                    <i className="bi bi-info-circle me-2" />
                    This action cannot be undone.
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash-fill me-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
