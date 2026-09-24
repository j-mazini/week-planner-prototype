'use client';

import React from 'react';
import { useAdhocCategories } from '../hooks/useAdhocCategories';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { AdhocCategoryCard } from './AdhocCategoryCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import ExportButton from '@/components/export-button';
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import type { AdhocCategory } from '@/lib/types-config-api';

interface AdhocCategoryTabProps {
  onNewAdhocCategory: () => void;
  onEditAdhocCategory: (category: AdhocCategory) => void;
}

export const AdhocCategoryTab: React.FC<AdhocCategoryTabProps> = ({
  onNewAdhocCategory,
  onEditAdhocCategory,
}) => {
  const {
    filteredAdhocCategories,
    isLoading,
    error,
    filter,
    setFilter,
    handleDelete,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleConfirmDelete,
    isDeleting,
  } = useAdhocCategories();

  return (
    <>
      <ConfirmDeleteModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Adhoc Category"
        message="Are you sure you want to delete this category? This action cannot be undone and will affect associated services."
      />

      <div className="flex flex-wrap gap-2 justify-end mb-4">
        <button
          onClick={onNewAdhocCategory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
        >
          <i className="bi bi-plus-lg text-sm"></i>
          Add Adhoc Category
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        <aside className="space-y-4">
          <FiltersPanel
            onClear={() => setFilter({ search: '' })}
            exportButton={
              <ExportButton
                data={filteredAdhocCategories.map((c) => ({ 
                  id: c.adhocCategoriesId, 
                  name: c.name,
                  description: c.description,
                  active: c.active ? 'Yes' : 'No'
                }))}
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Name' },
                  { key: 'description', label: 'Description' },
                  { key: 'active', label: 'Active' },
                ]}
                filename={`adhoc-categories-${new Date().toISOString().split('T')[0]}`}
                variant="outline"
                size="sm"
                label="Export"
                showOnlyExcelAndPdf={true}
                hasActiveFilters={!!filter.search?.trim()}
                reportTitle="Adhoc Categories"
              />
            }
          >
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search categories..."
            />
          </FiltersPanel>
        </aside>

        <section className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading adhoc categories..." />
          ) : filteredAdhocCategories.length === 0 ? (
            <EmptyState
              icon="🏷️"
              title="No adhoc categories found"
              subtitle="Try adjusting the filters or creating a new adhoc category."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredAdhocCategories.map((category) => (
                <AdhocCategoryCard
                  key={category.adhocCategoriesId}
                  adhocCategory={category}
                  onEdit={() => onEditAdhocCategory(category)}
                  onDelete={() => handleDelete(category.adhocCategoriesId)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};
