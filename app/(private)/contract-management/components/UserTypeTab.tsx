'use client';

import { useUserTypes } from '../hooks/useUserTypes';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { UserTypeCard } from './UserTypeCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import ExportButton from '@/components/export-button';
import type { UserType } from '@/lib/types-config-api';

interface UserTypeTabProps {
  onNewUserType: () => void;
  onEditUserType: (userType: UserType) => void;
  onDeleteUserType?: (userType: UserType) => void;
}

export const UserTypeTab: React.FC<UserTypeTabProps> = ({
  onNewUserType,
  onEditUserType,
  onDeleteUserType: _onDeleteUserType,
}) => {
  const {
    filteredUserTypes,
    isLoading,
    error,
    filter,
    setFilter,
  } = useUserTypes();

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        <button
          onClick={onNewUserType}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
        >
          <i className="bi bi-plus-lg text-sm"></i>
          Add User Type
        </button>
      </div>

      {/* API Error Message */}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        {/* Control column */}
        <aside className="space-y-4">
          <FiltersPanel
            onClear={() => setFilter({ search: '' })}
            exportButton={
              <ExportButton
                data={filteredUserTypes.map((u) => ({ id: u.userTypeId, name: u.nameType }))}
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Name' },
                ]}
                filename={`user-types-${new Date().toISOString().split('T')[0]}`}
                variant="outline"
                size="sm"
                label="Export"
                showOnlyExcelAndPdf={true}
                hasActiveFilters={!!filter.search?.trim()}
                reportTitle="User Types"
              />
            }
          >
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search user types..."
            />
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading user types..." />
          ) : filteredUserTypes.length === 0 ? (
            <EmptyState
              icon="👤"
              title="No user types found"
              subtitle="Try adjusting the filters or creating a new user type."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredUserTypes.map((userType) => (
                <UserTypeCard
                  key={userType.userTypeId}
                  userType={userType}
                  onEdit={() => onEditUserType(userType)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};


