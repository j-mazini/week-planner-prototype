import React, { memo, useMemo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Vehicle } from '../utils/vehicleMappers';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';
import { StatusBadge } from '@/components/status-badge';
import VrnPlate from '@/components/vrn-plate';
import { ServicePartnerBadge } from '@/components/service-partner-badge';
import { vehiclesStyles } from '../styles';

interface VehicleTableProps {
  vehicles: Vehicle[];
  servicePartners: ServicePartnerDTO[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

// Funções movidas para fora do componente para evitar recriação
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    const [year, month, rest] = dateString.split('-');
    if (!year || !month || !rest) return dateString;

    const day = rest.split('T')[0]?.split(' ')[0];
    if (!day) return dateString;

    return `${day}/${month}/${year}`;
  } catch (_err) {
    return dateString;
  }
};

const getStatusBadge = (status: string) => {
  if (status === 'Active') {
    return <StatusBadge status="active">Active</StatusBadge>;
  } else if (status === 'Maintenance') {
    return <StatusBadge status="maintenance">Maintenance</StatusBadge>;
  } else if (status === 'Inactive') {
    return <StatusBadge status="inactive">Inactive</StatusBadge>;
  }
  return <StatusBadge status={status}>{status}</StatusBadge>;
};

const renderFuelType = (vehicle: Vehicle) => {
  if (vehicle.fuelType === 'Electric') {
    return (
      <span className={vehiclesStyles.fuelTypeElectric}>
        <i className={vehiclesStyles.fuelTypeElectricIcon} title="Electric Vehicle"></i>
        Electric
      </span>
    );
  }
  return <span>{vehicle.fuelType || '-'}</span>;
};

// Componente de linha memoizado
const VehicleRow = memo(({ vehicle, isDeleting, onEdit, onDelete, index, servicePartnerMap }: {
  vehicle: Vehicle;
  isDeleting: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  index: number;
  servicePartnerMap: Map<number, string>;
}) => (
  <tr
    className={`${vehiclesStyles.tableRow} ${
      index % 2 === 0 ? vehiclesStyles.tableRowEven : vehiclesStyles.tableRowOdd
    } ${vehiclesStyles.tableRowHover}`}
  >
    <td className={vehiclesStyles.tableCell}>
      <div className={`${vehiclesStyles.tableCellVrn} flex items-center gap-1.5 flex-wrap`}>
        <VrnPlate
          vrn={vehicle.vrn}
          size="sm"
          badgeVariant={vehicle.fuelType === 'Electric' ? 'green' : 'blue'}
        />
        {vehicle.servicePartnerId != null && (() => {
          const vehicleSpId = typeof vehicle.servicePartnerId === 'string'
            ? parseInt(vehicle.servicePartnerId, 10)
            : vehicle.servicePartnerId;
          const partnerName = !Number.isNaN(vehicleSpId) ? servicePartnerMap.get(vehicleSpId) ?? null : null;
          return <ServicePartnerBadge partnerName={partnerName} />;
        })()}
      </div>
    </td>
    <td className={vehiclesStyles.tableCell}>
      {vehicle.brand}
    </td>
    <td className={vehiclesStyles.tableCell}>
      {vehicle.model}
    </td>
    <td className={vehiclesStyles.tableCell}>
      {formatDate(vehicle.registrationDate)}
    </td>
    <td className={vehiclesStyles.tableCell}>
      {renderFuelType(vehicle)}
    </td>
    <td className={vehiclesStyles.tableCell}>
      {getStatusBadge(vehicle.status)}
    </td>
    <td className={vehiclesStyles.tableCell}>
      <button 
        className={`${vehiclesStyles.tableActionButton} ${vehiclesStyles.tableActionEdit}`}
        data-id={vehicle.id} 
        title="Edit"
        onClick={() => onEdit(vehicle)}
        aria-label="Edit vehicle"
      >
        <i className="bi bi-pencil-fill"></i>
      </button>
      <button 
        className={`${vehiclesStyles.tableActionButton} ${vehiclesStyles.tableActionDelete} ${
          isDeleting ? vehiclesStyles.tableActionDeleteDisabled : vehiclesStyles.tableActionDeleteEnabled
        }`}
        data-id={vehicle.id} 
        title="Delete"
        onClick={() => onDelete(vehicle)}
        aria-label="Delete vehicle"
      >
        <i className="bi bi-trash-fill"></i>
      </button>
    </td>
  </tr>
));

VehicleRow.displayName = 'VehicleRow';

// Componente de header memoizado
const TableHeader = memo(({ field, label, sortField, sortDirection, onSort }: {
  field: string;
  label: string;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}) => (
  <th 
    className={vehiclesStyles.tableHeader}
    onClick={() => onSort(field)}
  >
    <div className={vehiclesStyles.tableHeaderContent}>
      {label}
      {sortField === field && (
        sortDirection === 'asc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />
      )}
    </div>
  </th>
));

TableHeader.displayName = 'TableHeader';

const VehicleTableComponent: React.FC<VehicleTableProps> = ({
  vehicles,
  servicePartners,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort,
}) => {
  // Criar mapa de servicePartnerId -> partnerName
  const servicePartnerMap = useMemo(() => {
    const map = new Map<number, string>();
    servicePartners.forEach(sp => {
      map.set(sp.servicePartnerId, sp.partnerName);
    });
    return map;
  }, [servicePartners]);
  // Memoizar linhas da tabela
  const tableRows = useMemo(() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={7} className={vehiclesStyles.tableLoadingCell}>
            <div className={vehiclesStyles.tableLoadingSpinner}>
              <div className={vehiclesStyles.tableLoadingIcon}></div>
              Loading vehicles...
            </div>
          </td>
        </tr>
      );
    }
    
    if (vehicles.length === 0) {
      return (
        <tr>
          <td colSpan={7} className={vehiclesStyles.tableEmptyCell}>
            No vehicles match the current filters.
          </td>
        </tr>
      );
    }
    
    return vehicles.map((vehicle, index) => (
      <VehicleRow
        key={vehicle.id}
        vehicle={vehicle}
        isDeleting={isDeleting}
        onEdit={onEdit}
        onDelete={onDelete}
        index={index}
        servicePartnerMap={servicePartnerMap}
      />
    ));
  }, [vehicles, isLoading, isDeleting, onEdit, onDelete, servicePartnerMap]);

  // Memoizar headers
  const tableHeaders = useMemo(() => [
    { field: 'vrn', label: 'VRN' },
    { field: 'brand', label: 'Manufacturer' },
    { field: 'model', label: 'Model' },
    { field: 'registrationDate', label: 'Registration Date' },
    { field: 'fuelType', label: 'Fuel Type' },
    { field: 'status', label: 'Status' },
  ], []);

  return (
    <div className={vehiclesStyles.tableWrapper}>
      {/* Glass highlights */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
      </div>
      <div className="relative z-10 w-full overflow-x-hidden overflow-y-visible">
        <table className={vehiclesStyles.table}>
        <thead>
          <tr>
            {tableHeaders.map(({ field, label }) => (
              <TableHeader
                key={field}
                field={field}
                label={label}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            ))}
            <th className={vehiclesStyles.tableHeaderActions}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody id="vehiclesTableBody">
          {tableRows}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export const VehicleTable = memo(VehicleTableComponent);
