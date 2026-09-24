import React, { memo } from 'react';
import type { Vehicle } from '../utils/vehicleMappers';
import { StatusBadge } from '@/components/status-badge';
import VrnPlate from '@/components/vrn-plate';
import { vehiclesStyles } from '../styles';

interface MobileVehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

const MobileVehicleCard = memo<MobileVehicleCardProps>(({ vehicle, onEdit, onDelete }) => {
  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return <StatusBadge status="active">Active</StatusBadge>;
    } else if (status === 'Maintenance') {
      return <StatusBadge status="maintenance">Maint.</StatusBadge>;
    } else if (status === 'Inactive') {
      return <StatusBadge status="inactive">Inactive</StatusBadge>;
    }
    return <StatusBadge status={status}>{status}</StatusBadge>;
  };

  return (
    <div className={vehiclesStyles.mobileCard}>
      {/* Glass highlights */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
      </div>
      <div className="relative z-10">
        <div className={vehiclesStyles.mobileCardHeader}>
        <div className={vehiclesStyles.mobileCardName}>
          <h3 className={vehiclesStyles.mobileCardTitle}>
            <VrnPlate
              vrn={vehicle.vrn}
              size="sm"
              badgeVariant={vehicle.fuelType === 'Electric' ? 'green' : 'blue'}
            />
          </h3>
          <p className={vehiclesStyles.mobileCardSubtitle}>{vehicle.brand} {vehicle.model}</p>
        </div>
        <div className={vehiclesStyles.mobileCardActions}>
          <button 
            onClick={() => onEdit(vehicle)}
            className={vehiclesStyles.mobileCardActionEdit}
            aria-label="Edit vehicle"
          >
            <i className="bi bi-pencil-fill text-sm"></i>
          </button>
          <button 
            onClick={() => onDelete(vehicle)}
            className={vehiclesStyles.mobileCardActionDelete}
            aria-label="Delete vehicle"
          >
            <i className="bi bi-trash-fill text-sm"></i>
          </button>
        </div>
      </div>
      <div className={vehiclesStyles.mobileCardInfo}>
        <div className={vehiclesStyles.mobileCardInfoRow}>
          <span className={vehiclesStyles.mobileCardInfoLabel}>Fuel:</span>
          <span className={vehiclesStyles.mobileCardInfoValue}>{vehicle.fuelType || '-'}</span>
        </div>
        <div className={vehiclesStyles.mobileCardInfoRow}>
          <span className={vehiclesStyles.mobileCardInfoLabel}>Status:</span>
          <span>
            {getStatusBadge(vehicle.status)}
          </span>
        </div>
      </div>
      </div>
    </div>
  );
});

MobileVehicleCard.displayName = 'MobileVehicleCard';

export default MobileVehicleCard;

