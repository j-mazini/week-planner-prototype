import React, { memo, useMemo, useState, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Vendor, VendorType, CostModel } from '@/lib/vendors-api';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';
import { ServicePartnerBadge } from '@/components/service-partner-badge';
import { formatDateOnly } from '../utils/vendor-utils';
import { vendorStyles } from '../styles';

type SortField = 'name' | 'vendorType' | 'paymentModel' | 'status' | 'startDate' | 'training' | 'documents';
type SortDirection = 'asc' | 'desc';

interface VendorTableProps {
  vendors: Vendor[];
  vendorTypes: VendorType[];
  costModels: CostModel[];
  servicePartners: ServicePartnerDTO[];
  isLoading: boolean;
  onEdit: (vendor: Vendor) => void;
  getStatusBadge: (vendor: Vendor) => JSX.Element;
  getTrainingBadge: (vendor: Vendor) => JSX.Element;
  getDocumentsBadge: (vendor: Vendor) => JSX.Element;
  onShowTraining: (vendor: Vendor) => void;
  onShowDocuments: (vendor: Vendor) => void;
}

const VendorTableComponent = ({
  vendors,
  vendorTypes,
  costModels,
  servicePartners,
  isLoading,
  onEdit,
  getStatusBadge,
  getTrainingBadge,
  getDocumentsBadge,
  onShowTraining,
  onShowDocuments,
}: VendorTableProps) => {
  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Memoize lookups to avoid recalculations
  const vendorTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    vendorTypes.forEach(vt => {
      const key = String(vt.vendorTypeId ?? '');
      const value = vt.nameType || String(vt.vendorTypeId);
      map.set(key, value);
    });
    return map;
  }, [vendorTypes]);

  const costModelMap = useMemo(() => {
    const map = new Map<string, string>();
    costModels.forEach(cm => {
      const key = String(cm.costModelId);
      const value = cm.name || String(cm.costModelId);
      map.set(key, value);
    });
    return map;
  }, [costModels]);

  const servicePartnerMap = useMemo(() => {
    const map = new Map<number, string>();
    servicePartners.forEach(sp => {
      map.set(sp.servicePartnerId, sp.partnerName);
    });
    return map;
  }, [servicePartners]);

  // Function to handle sorting
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // If it's a new field, start with ascending
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Function to sort vendors
  const sortedVendors = useMemo(() => {
    if (!sortField) return vendors;

    return [...vendors].sort((a, b) => {
      let aValue: string | number | Date | null | undefined;
      let bValue: string | number | Date | null | undefined;

      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'vendorType':
          aValue = vendorTypeMap.get(String(a.vendorType)) || a.vendorType || '';
          bValue = vendorTypeMap.get(String(b.vendorType)) || b.vendorType || '';
          break;
        case 'paymentModel':
          aValue = costModelMap.get(String(a.paymentModel || '')) || a.paymentModel || '';
          bValue = costModelMap.get(String(b.paymentModel || '')) || b.paymentModel || '';
          break;
        case 'status':
          // Sort by status: Active > Inactive > others
          const aStatus = a.status || (a.finishDate && new Date(a.finishDate) <= new Date() ? 'Inactive' : 'Active');
          const bStatus = b.status || (b.finishDate && new Date(b.finishDate) <= new Date() ? 'Inactive' : 'Active');
          aValue = aStatus === 'Active' ? 0 : aStatus === 'Inactive' ? 1 : 2;
          bValue = bStatus === 'Active' ? 0 : bStatus === 'Inactive' ? 1 : 2;
          break;
        case 'startDate':
          aValue = a.startDate ? new Date(a.startDate).getTime() : 0;
          bValue = b.startDate ? new Date(b.startDate).getTime() : 0;
          break;
        case 'training':
          // Ordenar por status de treinamento: Complete > Incomplete > Expired > Expiring Soon
          const aTrainingComplete = a.cargoTraining && a.dangerousGoodsTraining && a.manualHandlingTraining;
          const bTrainingComplete = b.cargoTraining && b.dangerousGoodsTraining && b.manualHandlingTraining;
          
          // Se ambos completos ou ambos incompletos, valor igual
          if (aTrainingComplete === bTrainingComplete) {
            aValue = aTrainingComplete ? 0 : 1;
            bValue = bTrainingComplete ? 0 : 1;
          } else {
            // Complete vem antes de Incomplete
            aValue = aTrainingComplete ? 0 : 1;
            bValue = bTrainingComplete ? 0 : 1;
          }
          break;
        case 'documents':
          // Ordenar por status de documentos: Verified > Pending
          const aDocsVerified = !!(a.criminalRecordDate && a.dvlaCheckDate);
          const bDocsVerified = !!(b.criminalRecordDate && b.dvlaCheckDate);
          aValue = aDocsVerified ? 0 : 1;
          bValue = bDocsVerified ? 0 : 1;
          break;
        default:
          return 0;
      }

      // Tratar valores nulos/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Comparar valores
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: 'base' });
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [vendors, sortField, sortDirection, vendorTypeMap, costModelMap]);

  // Memoizar linhas da tabela
  const tableRows = useMemo(() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={8} className={vendorStyles.tableLoadingCell}>
            <div className={vendorStyles.tableLoadingSpinner}>
              <div className={vendorStyles.tableLoadingIcon} role="status" aria-label="Loading">
                <span className="sr-only">Loading...</span>
              </div>
              <span>Loading vendors...</span>
            </div>
          </td>
        </tr>
      );
    }
    
    if (sortedVendors.length === 0) {
      return (
        <tr>
          <td colSpan={8} className={vendorStyles.tableEmptyCell}>
            No vendors match the current filters.
          </td>
        </tr>
      );
    }
    
    return sortedVendors.map((vendor, index) => {
      const statusBadge = getStatusBadge(vendor);
      const trainingBadge = getTrainingBadge(vendor);
      const documentsBadge = getDocumentsBadge(vendor);
      
      return (
        <tr 
          key={`${vendor.id}-${index}`}
          className={`${vendorStyles.tableRow} ${
            index % 2 === 0 ? vendorStyles.tableRowEven : vendorStyles.tableRowOdd
          } ${vendorStyles.tableRowHover}`}
        >
          <td className={vendorStyles.tableCell}>
            <div className={vendorStyles.tableCellName}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <strong className={vendorStyles.tableCellNameText}>{vendor.firstName} {vendor.lastName}</strong>
                {vendor.servicePartnerId != null && (() => {
                  const vendorSpId = typeof vendor.servicePartnerId === 'string'
                    ? parseInt(vendor.servicePartnerId, 10)
                    : vendor.servicePartnerId;
                  const partnerName = !Number.isNaN(vendorSpId) ? servicePartnerMap.get(vendorSpId) ?? null : null;
                  return <ServicePartnerBadge partnerName={partnerName} />;
                })()}
              </div>
              <small className={vendorStyles.tableCellEmail}>{vendor.email || 'N/A'}</small>
            </div>
          </td>
          <td className={`${vendorStyles.tableCell} ${vendorStyles.tableCellCenter}`}>
            {vendor.vendorType ? (vendorTypeMap.get(String(vendor.vendorType)) || vendor.vendorType) : '-'}
          </td>
          <td className={`${vendorStyles.tableCell} ${vendorStyles.tableCellCenter}`}>
            {vendor.paymentModel 
              ? (costModelMap.get(String(vendor.paymentModel)) || vendor.paymentModel)
              : '-'
            }
          </td>
          <td className={`${vendorStyles.tableCell} ${vendorStyles.tableCellCenter}`}>
            {statusBadge}
          </td>
          <td className={`${vendorStyles.tableCell} ${vendorStyles.tableCellCenter}`}>
            {vendor.startDate ? formatDateOnly(vendor.startDate) : '-'}
          </td>
          <td className={`${vendorStyles.tableCell} ${vendorStyles.tableCellCenter}`}>
            <button
              type="button"
              className={vendorStyles.tableActionButton}
              onClick={() => onShowTraining(vendor)}
            >
              {trainingBadge}
            </button>
          </td>
          <td className={`${vendorStyles.tableCell} ${vendorStyles.tableCellCenter}`}>
            <button
              type="button"
              className={vendorStyles.tableActionButton}
              onClick={() => onShowDocuments(vendor)}
            >
              {documentsBadge}
            </button>
          </td>
          <td className={`${vendorStyles.tableCell} ${vendorStyles.tableCellCenter}`}>
            <div className={vendorStyles.tableActionsContainer}>
              <button 
                className={vendorStyles.tableActionEdit}
                data-id={vendor.id} 
                title="Edit"
                onClick={() => onEdit(vendor)}
                aria-label="Edit vendor"
              >
                <i className="bi bi-pencil-fill"></i>
              </button>
            </div>
          </td>
        </tr>
      );
    });
  }, [sortedVendors, isLoading, vendorTypeMap, costModelMap, servicePartnerMap, getStatusBadge, getTrainingBadge, getDocumentsBadge, onEdit, onShowTraining, onShowDocuments]);

  // Componente para cabeçalho ordenável
  const SortableHeader = ({ field, children, align = 'center' }: { field: SortField; children: React.ReactNode; align?: 'left' | 'center' }) => {
    const isActive = sortField === field;

    return (
      <th
        className={`${vendorStyles.tableHeader} ${vendorStyles.tableHeaderSortable} ${align === 'center' ? vendorStyles.tableHeaderCenter : vendorStyles.tableHeaderLeft}`}
        onClick={() => handleSort(field)}
        title={`Click to sort by ${children}`}
      >
        <div className={`${vendorStyles.tableHeaderContent} ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
          <span>{children}</span>
          {isActive && (
            sortDirection === 'asc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className={vendorStyles.tableWrapper}>
      <table className={vendorStyles.table}>
        <thead>
          <tr>
            <SortableHeader field="name" align="left">Name</SortableHeader>
            <SortableHeader field="vendorType">Vendor Type</SortableHeader>
            <SortableHeader field="paymentModel">Payment Model</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="startDate">Start Date</SortableHeader>
            <SortableHeader field="training">Training</SortableHeader>
            <SortableHeader field="documents">Documents</SortableHeader>
            <th className={`${vendorStyles.tableHeader} ${vendorStyles.tableHeaderCenter}`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody id="vendorsTableBody">
          {tableRows}
        </tbody>
      </table>
    </div>
  );
};

VendorTableComponent.displayName = 'VendorTable';

// Comparação customizada para evitar re-renderizações desnecessárias
const areEqual = (prevProps: VendorTableProps, nextProps: VendorTableProps) => {
  // Comparar arrays de vendors por IDs
  if (prevProps.vendors.length !== nextProps.vendors.length) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  
  const prevIds = prevProps.vendors.map(v => v.id).sort().join(',');
  const nextIds = nextProps.vendors.map(v => v.id).sort().join(',');
  if (prevIds !== nextIds) return false;
  
  // Comparar vendorTypes, costModels e servicePartners
  if (prevProps.vendorTypes.length !== nextProps.vendorTypes.length) return false;
  if (prevProps.costModels.length !== nextProps.costModels.length) return false;
  if (prevProps.servicePartners.length !== nextProps.servicePartners.length) return false;

  return true;
};

const VendorTable = memo(VendorTableComponent, areEqual);

export default VendorTable;


