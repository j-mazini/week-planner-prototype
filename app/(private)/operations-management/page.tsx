"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NavbarWrapper from "@/components/navbar-wrapper";
import { ModernPageHeader, type Metric } from "@/components/modern-page-header";
import { Reveal } from '@/components/ui/reveal';
import { ButtonWithRipple } from '@/components/ui/button-with-ripple';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/animations/page-animation';
import './OperationsManagement.css';
import {
    fetchOperationsPaginated,
    createOperation,
    updateOperation,
    deleteOperation,
    fetchOperationTypes,
    OperationManagementListDTO,
    OperationManagementCreateDTO,
    OperationManagementUpdateDTO,
    OperationStatusDTO,
    VendorTypeDTO
} from '@/lib/operations-management-api';
import { removeToken } from "@/lib/auth";
import { fetchVendors, Vendor } from '@/lib/vendors';
import { fetchRoutes, Route } from '@/lib/api/routes';
import { fetchVehicles, Vehicle } from '@/lib/vehicles';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import VrnPlate from '@/components/vrn-plate';
import { deleteWeekPlanner, fetchAllWeekPlannersForDate } from '@/app/(private)/week-planner/services/apiService';

// --- Master Lists for Form (will be loaded from backend) ---
const MASTER_VENDOR_TYPES = [
    'Core route Vendor',
    'SPARE',
    'Ad-Hoc Bicycle',
    'Out an back',
    'Trainee',
    'Other'
];

// Table headers
const TABLE_HEADERS = ['Date', 'Route', 'Name', 'Payment Mode', 'Rate', 'Sort', 'AD-HOC Sort', 'Extras', 'Notes', 'Vehicle', 'Vendor type', 'Status'];

// Interface para dados do frontend (formato da tabela)
interface FrontendOperationRecord {
    operationId?: number;
    Date: string;
    Route: string;
    Name: string;
    'Payment Mode': string;
    Rate: number | string;
    Sort: number | string;
    'AD-HOC Sort': number | string;
    Extras: number | string;
    Notes: string;
    Vehicle: string;
    'Vendor type': string;
    Status: string;
    costModelId?: number;
    [key: string]: string | number | undefined; // Index signature to allow dynamic access
}

// Helper function to normalize date (remove timezone, keep only YYYY-MM-DD)
const normalizeDate = (dateString: string): string => {
    if (!dateString) return '';
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    // If it contains timezone info, extract only the date part
    const datePart = dateString.split('T')[0];
    return datePart || dateString;
};

// Function to map backend data to frontend format
const mapBackendToFrontend = (
    backend: OperationManagementListDTO,
    vendors: Vendor[],
    routes: Route[],
    vehicles: Vehicle[]
): FrontendOperationRecord => {
    const vendor = vendors.find(d => d.userId === backend.userId);
    const route = routes.find(r => r.routeId === backend.routeId);
    const vehicle = vehicles.find(v => v.vehicleId === backend.vehicleId);

    // Map Vendor type from vendor object
    const vendorType = vendor?.vendorTypeDescription || '';

    // Map Payment Mode (Cost Model Name) from backend if available, or try to derive it
    // OperationManagementDetailDTO has costModelName. If not available, we use a fallback label.
    // Ensure we handle null from vendor data
    const costModelIdValue = backend.costModelId || vendor?.costModelId;
    const costModelId = costModelIdValue === null ? undefined : costModelIdValue;
    let paymentMode = 'Other';

    // Best effort mapping of costModelId to label if costModelName is not in the DTO
    if (costModelId === 1) paymentMode = 'DAF';
    else if (costModelId === 2) paymentMode = 'DR';
    else if (costModelId === 3) paymentMode = 'FSR';
    else if (costModelId === 4) paymentMode = 'VSR';
    else if (costModelId === 7) paymentMode = 'Hourly';

    return {
        operationId: backend.operationId,
        Date: normalizeDate(backend.date),
        Route: route?.routeName || '',
        Name: vendor?.fullName || '',
        'Payment Mode': paymentMode,
        Rate: backend.rate || '',
        Sort: backend.routeSort || '',
        'AD-HOC Sort': backend.adhocSort || '',
        Extras: backend.extra || '',
        Notes: backend.note || '',
        Vehicle: vehicle?.registrationPlates || 'NOVEHICLE',
        'Vendor type': vendorType,
        Status: backend.status === 'ACTIVE' ? 'Working' : 'Off',
        costModelId: costModelId
    };
};

// Function to map frontend data to backend format
const mapFrontendToBackend = (
    frontend: FrontendOperationRecord,
    vendors: Vendor[],
    routes: Route[],
    vehicles: Vehicle[]
): OperationManagementCreateDTO | OperationManagementUpdateDTO => {
    const vendor = vendors.find(d => d.fullName === frontend.Name);
    const route = routes.find(r => r.routeName === frontend.Route);
    const vehicle = vehicles.find(v => v.registrationPlates === frontend.Vehicle || (frontend.Vehicle === 'NOVEHICLE' && !v));

    return {
        date: frontend.Date,
        rate: typeof frontend.Rate === 'number' ? frontend.Rate : parseFloat(String(frontend.Rate)) || 0,
        dailyServiceCharge: 0, // TODO: Add field to form if necessary
        extra: typeof frontend.Extras === 'number' ? frontend.Extras : parseFloat(String(frontend.Extras)) || 0,
        status: frontend.Status === 'Working' ? 'ACTIVE' : 'INACTIVE',
        routeId: route?.routeId || 0,
        adhocSort: typeof frontend['AD-HOC Sort'] === 'number' ? frontend['AD-HOC Sort'] : parseFloat(String(frontend['AD-HOC Sort'])) || 0,
        routeSort: typeof frontend.Sort === 'number' ? frontend.Sort : parseFloat(String(frontend.Sort)) || 0,
        userId: vendor?.userId || 0,
        vehicleId: vehicle?.vehicleId,
        note: frontend.Notes || undefined,
        costModelId: frontend.costModelId || (vendor?.costModelId ?? undefined)
    };
};

// --- Reusable Table Component (for Review Modals) ---
const ReviewTable = ({ data, title }: { data: FrontendOperationRecord[], title: string }) => (
    <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-3">{title} ({data.length})</h3>
        {data.length === 0 ? (
            <p className="text-slate-500">No records.</p>
        ) : (
            <div className="max-h-[60vh] overflow-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                    <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                        <tr>
                            {TABLE_HEADERS.map((header) => (
                                <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item, index) => (
                            <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                {TABLE_HEADERS.map(header => (
                                    <td key={header} className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                                        {header === 'Notes' ? (
                                            item[header] && item[header].trim() !== '' ? (
                                                <span className="notes-icon">
                                                    <span className="notes-tooltip">{item[header]}</span>
                                                </span>
                                            ) : '-'
                                        ) : header === 'Vehicle' ? (
                                            (item[header] && String(item[header]).toUpperCase() !== 'NOVEHICLE') ? (
                                                <VrnPlate vrn={item[header]} size="sm" showBadge={false} />
                                            ) : (
                                                item[header] || '-'
                                            )
                                        ) : (
                                            item[header] || '-'
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

// --- Validation Error Component ---
const ValidationError = ({ errors }: { errors: string[] }) => {
    if (errors.length === 0) return null;
    return (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-lg">
            <h4 className="font-bold mb-2">Validation Errors Found:</h4>
            <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                ))}
            </ul>
        </div>
    );
};

export default function OperationsManagement() {
    const router = useRouter();
    // Estado para dados do backend
    const [operationsData, setOperationsData] = useState<FrontendOperationRecord[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMasterLoading, setIsMasterLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dynamic lists from backend
    const [_availableStatuses, setAvailableStatuses] = useState<OperationStatusDTO[]>([]);
    const [availableVendorTypes, setAvailableVendorTypes] = useState<VendorTypeDTO[]>([]);

    // Selected date (default: today)
    const [selectedDate, setSelectedDate] = useState(() => {
        return format(new Date(), 'yyyy-MM-dd');
    });

    // States for backend pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 15
    });

    // Estados de Filtro/UI
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterVendorType, setFilterVendorType] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'Date', direction: 'desc' });

    // Estados de Modais
    const [showModal, setShowModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPendingListModal, _setShowPendingListModal] = useState(false);
    const [showPendingReviewModal, _setShowPendingReviewModal] = useState(false);

    // Operations History (Daily Reports)
    const [operationsHistory, setOperationsHistory] = useState<Array<{ date: string; data: FrontendOperationRecord[] }>>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);

    // --- Estado para animação de sucesso ---
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { guard } = useSubmitGuard();
    const [confettiPieces, setConfettiPieces] = useState<Array<{ left: number; delay: number; duration: number; color: string; opacity: number }>>([]);

    // Validation States
    const [mainValidationErrors, setMainValidationErrors] = useState<string[]>([]);

    // Form State (Add/Edit)
    const [formData, setFormData] = useState<FrontendOperationRecord>({
        Date: new Date().toISOString().split('T')[0],
        Route: '',
        Name: '',
        'Payment Mode': '',
        Rate: '',
        Sort: '',
        'AD-HOC Sort': '',
        Extras: '',
        Notes: '',
        Vehicle: '',
        'Vendor type': '',
        Status: 'Working'
    });

    // Carregar dados iniciais (vendors, routes, vehicles)
    useEffect(() => {
        const loadInitialData = async () => {
            setIsMasterLoading(true);
            try {
                const [vendorsData, routesData, vehiclesData, operationTypes] = await Promise.all([
                    fetchVendors(),
                    fetchRoutes(),
                    fetchVehicles(),
                    fetchOperationTypes()
                ]);

                setVendors(vendorsData);
                setRoutes(routesData);
                setVehicles(vehiclesData);
                setAvailableStatuses(operationTypes.statuses || []);
                setAvailableVendorTypes(operationTypes.vendorTypes || []);
            } catch (err) {
                console.error('Error loading initial data:', err);
                const message = err instanceof Error ? err.message : "Failed to load initial data";
                setError(message);
                setLoading(false);

                // If auth-related, clear token and redirect to login
                if (
                    typeof message === "string" &&
                    (message.includes("Authentication token not found") ||
                        message.includes("Invalid token") ||
                        message.includes("401") ||
                        message.includes("403"))
                ) {
                    removeToken();
                    router.push("/?callbackUrl=/operations-management");
                }
            } finally {
                setIsMasterLoading(false);
            }
        };

        loadInitialData();
    }, [router]);

    // Function to fetch data from backend
    const fetchData = useCallback(async () => {
        // Se ainda está carregando dados master, aguarda mas não bloqueia a renderização
        if (isMasterLoading) {
            // Retorna sem fazer nada, o useEffect vai tentar novamente quando isMasterLoading mudar
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch operations for selected date
            const operationsResponse = await fetchOperationsPaginated({
                date: selectedDate,
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                search: searchTerm || undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                vendorType: filterVendorType !== 'all' ? filterVendorType : undefined
            });

            // Mapear dados do backend para o formato do frontend
            const mappedData = operationsResponse.data.map(op =>
                mapBackendToFrontend(op, vendors, routes, vehicles)
            );

            setOperationsData(mappedData);
            setPagination(operationsResponse.pagination);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, pagination.currentPage, pagination.itemsPerPage, searchTerm, filterStatus, filterVendorType, vendors, routes, vehicles, isMasterLoading]);

    // Carregar dados quando o componente monta ou quando os filtros mudam
    // Nota: fetchData já inclui isMasterLoading nas suas dependências e retorna cedo se ainda estiver carregando
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reveal animations and ripple effects are now handled by Reveal and ButtonWithRipple components

    // --- Function to return to current day ---
    const handleReturnToToday = () => {
        setFormData(prev => ({
            ...prev,
            Date: new Date().toISOString().split('T')[0]
        }));
    };

    // Form Functions
    const resetForm = () => {
        setFormData({
            Date: new Date().toISOString().split('T')[0],
            Route: '',
            Name: '',
            'Payment Mode': '',
            Rate: '',
            Sort: '',
            'AD-HOC Sort': '',
            Extras: '',
            Notes: '',
            Vehicle: '',
            'Vendor type': '',
            Status: 'Working',
            costModelId: undefined
        });
        setEditingIndex(null);
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            
            // If we are changing the vendor name, also update metadata
            if (field === 'Name') {
                const vendor = vendors.find(d => d.fullName === value);
                if (vendor) {
                    newData.costModelId = vendor.costModelId || undefined;
                    newData['Vendor type'] = vendor.vendorTypeDescription || '';
                    
                    // Derive Payment Mode from costModelId
                    let paymentMode = 'Other';
                    const cmId = vendor.costModelId;
                    if (cmId === 1) paymentMode = 'DAF';
                    else if (cmId === 2) paymentMode = 'DR';
                    else if (cmId === 3) paymentMode = 'FSR';
                    else if (cmId === 4) paymentMode = 'VSR';
                    else if (cmId === 7) paymentMode = 'Hourly';
                    
                    newData['Payment Mode'] = paymentMode;
                }
            }
            
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const backendData = mapFrontendToBackend(formData, vendors, routes, vehicles);

            if (editingIndex !== null && formData.operationId) {
                // Update existing operation
                await updateOperation(formData.operationId, backendData as OperationManagementUpdateDTO);
            } else {
                // Create new operation
                await createOperation(backendData as OperationManagementCreateDTO);
            }

            setShowModal(false);
            resetForm();
            // Recarregar dados
            await fetchData();
        } catch (err) {
            console.error('Error saving operation:', err);
            alert(err instanceof Error ? err.message : 'Failed to save operation');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Table Functions
    const handleEdit = (index: number) => {
        const item = operationsData[index];
        if (!item) return;

        setFormData(item);
        setEditingIndex(index);
        setShowModal(true);
    };

    const handleDelete = async (index: number) => {
        const item = operationsData[index];
        if (!item || !item.operationId) return;

        if (confirm("Are you sure you want to PERMANENTLY delete this record? This cannot be undone.")) {
            try {
                // Delete the operation
                await deleteOperation(item.operationId);

                // Buscar e deletar week-planner relacionado
                try {
                    const weekPlanners = await fetchAllWeekPlannersForDate(item.Date);
                    const relatedWeekPlanners = weekPlanners.filter(
                        wp => wp.operationId === item.operationId
                    );

                    // Delete all related week-planners
                    for (const weekPlanner of relatedWeekPlanners) {
                        try {
                            await deleteWeekPlanner(weekPlanner.weekPlannerId);
                        } catch (wpErr) {
                            console.error(`Error deleting week planner ${weekPlanner.weekPlannerId}:`, wpErr);
                            // Continue even if there is an error deleting a week-planner
                        }
                    }
                } catch (wpErr) {
                    console.error('Error fetching/deleting related week planners:', wpErr);
                    // Continue even if there is an error fetching/deleting week-planners
                }

                // Recarregar dados
                await fetchData();
            } catch (err) {
                console.error('Error deleting operation:', err);
                alert(err instanceof Error ? err.message : 'Failed to delete operation');
            }
        }
    };

    // Filtros (Dropdowns) - usar dados do backend
    const uniqueStatuses = useMemo(() => {
        const statuses = [...new Set(operationsData.map(item => item.Status).filter(Boolean))];
        return statuses;
    }, [operationsData]);

    const uniqueVendorTypes = useMemo(() => {
        // Favor dynamic types from backend if available
        if (availableVendorTypes.length > 0) {
            return availableVendorTypes.map(t => t.label);
        }
        const types = [...new Set(operationsData.map(item => item['Vendor type']).filter(Boolean))];
        return types;
    }, [operationsData, availableVendorTypes]);

    // Header Metrics calculation
    const metrics: Metric[] = useMemo(() => {
        const workingCount = operationsData.filter(op => op.Status === 'Working').length;
        // In the backend, 'Pending' might be 'PENDING' or similar. 
        // For now we check if any record has a status that isn't 'Working' or 'Off'
        const pendingCount = operationsData.filter(op => op.Status !== 'Working' && op.Status !== 'Off').length;
        const totalCount = pagination.totalItems;

        return [
            { label: 'Working', value: workingCount, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
            { label: 'Pending', value: pendingCount, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: 'Total', value: totalCount, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> }
        ];
    }, [operationsData, pagination.totalItems]);

    // Sort data (client-side sorting for already paginated data)
    const sortedData = useMemo(() => {
        const sortableData = [...operationsData];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof FrontendOperationRecord] || '';
                const bValue = b[sortConfig.key as keyof FrontendOperationRecord] || '';
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableData;
    }, [operationsData, sortConfig]);

    // Use already paginated data from backend
    const paginatedData = sortedData;

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    // Export CSV
    const handleExportCSV = () => {
        const dataToExport = sortedData;
        const csvHeader = TABLE_HEADERS.join(',') + '\n';
        const csvRows = dataToExport.map(row => {
            return TABLE_HEADERS.map(header => {
                let cell = row[header] ? String(row[header]) : '';
                cell = cell.replace(/"/g, '""');
                return `"${cell}"`;
            }).join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'operations_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Validation Logic (reusable)
    const runValidations = (dataToValidate: FrontendOperationRecord[]) => {
        const errors: string[] = [];

        // 1. Check Duplicates
        const vehicleMap = new Map<string, string>();
        const workingData = dataToValidate.filter(item => item.Status === 'Working');

        for (const item of workingData) {
            const vehicle = item.Vehicle;
            if (vehicle && String(vehicle).toUpperCase() !== "NOVEHICLE") {
                if (vehicleMap.has(vehicle)) {
                    errors.push(`Duplicate Vehicle: "${vehicle}" is assigned to ${item.Name} and ${vehicleMap.get(vehicle)}.`);
                } else {
                    vehicleMap.set(vehicle, item.Name);
                }
            }
        }

        // 2. Check Missing Vendors (opcional - pode ser removido se não necessário)
        // const reportVendors = new Set(dataToValidate.map(item => item.Name));
        // for (const vendor of vendors) {
        //     if (!reportVendors.has(vendor.fullName)) {
        //         errors.push(`Missing Vendor: "${vendor.fullName}" is not in the report.`);
        //     }
        // }

        return errors;
    };

    // --- Funções de Submissão ---

    // Para o dia principal
    const handleOpenMainReviewModal = () => {
        const errors = runValidations(operationsData);
        setMainValidationErrors(errors);
        setShowReviewModal(true);
    };

    const handleMainSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // As operações já estão salvas no banco de dados através das operações CRUD
            // O histórico é apenas para visualização local das datas consultadas
            const dateKey = selectedDate;
            setOperationsHistory(prev => {
                const others = prev.filter(entry => entry.date !== dateKey);
                const updated = [{ date: dateKey, data: operationsData }, ...others];
                updated.sort((a, b) => b.date.localeCompare(a.date));
                return updated;
            });

            setShowReviewModal(false);

            // Prepare new confetti pieces and show celebration
            const generatePieces = (count: number) => {
                const colors = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
                return Array.from({ length: count }).map(() => ({
                    left: Math.random() * 100,
                    delay: Math.random() * 0.25,
                    duration: 0.9 + Math.random() * 0.9,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    opacity: 0.8 + Math.random() * 0.2,
                }));
            };
            setConfettiPieces(generatePieces(60));
            setShowSuccessAnimation(true);

            setTimeout(() => {
                setShowSuccessAnimation(false);
                setIsSubmitting(false);
            }, 1500);
        } catch (err) {
            console.error('Error submitting:', err);
            setIsSubmitting(false);
        }
    };

    return (
        <NavbarWrapper>
            <motion.div
                className="min-h-screen ops-container ops-management-page"
                style={{ background: 'transparent' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-[1600px] mx-auto px-4 md:px-6 pt-6 pb-6 space-y-4 md:space-y-6">
                    {/* Header */}
                    <FadeIn delay={0.1}>
                        <ModernPageHeader
                            title="Daily Operations Management"
                            subtitle={`Date: ${format(new Date(selectedDate), 'dd MMM yyyy')}`}
                            metrics={metrics}
                            actions={
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="date"
                                            id="date-selector"
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                                            }}
                                            className="w-full sm:w-auto px-4 py-2 border border-border/60 bg-background/50 rounded-lg text-xs font-medium text-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring/30"
                                        />
                                    </div>
                                    <button
                                        onClick={handleExportCSV}
                                        className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/50 px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/30 active:scale-[0.99]"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Export
                                    </button>
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            setShowModal(true);
                                        }}
                                        className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-ring/30 active:scale-[0.99]"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Record
                                    </button>
                                </div>
                            }
                            gradientFrom="slate-900"
                            gradientTo="blue-600"
                        />
                    </FadeIn>

                    {/* Filter Block */}
                    <div className="mb-1 p-2 bg-white rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 reveal" data-animate="fade-in-up">

                        <div className="md:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">
                                Search (Name, Route, Vehicle)
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Type to search..."
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="filterStatus" className="block text-sm font-medium text-slate-700 mb-1">
                                Status
                            </label>
                            <select
                                id="filterStatus"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All</option>
                                {uniqueStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="filterVendorType" className="block text-sm font-medium text-slate-700 mb-1">
                                Vendor Type
                            </label>
                            <select
                                id="filterVendorType"
                                value={filterVendorType}
                                onChange={(e) => setFilterVendorType(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All</option>
                                {uniqueVendorTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>


                    {/* Error Message */}
                    {error && (
                        <div className="mb-1 p-2 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg">
                            <p className="font-bold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Main Table */}
                    <Reveal className="reveal" data-animate="fade-in-up">
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            {(loading || isMasterLoading) && (
                                <div className="p-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="mt-2 text-slate-600">Loading operations...</p>
                                </div>
                            )}
                            {!(loading || isMasterLoading) && (
                                <div className="overflow-x-auto">
                                    <table className="w-full ops-table optimized-table-hover">
                                        <thead className="bg-slate-100 border-b border-slate-200">
                                            <tr>
                                                {TABLE_HEADERS.map((header) => (
                                                    <th
                                                        key={header}
                                                        onClick={() => handleSort(header)}
                                                        className={`px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition`}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {header}
                                                            {sortConfig.key === header && (
                                                                <span className="text-blue-600">
                                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {!(loading || isMasterLoading) && paginatedData.map((item, index) => (
                                                <tr
                                                    key={`${item.Name}-${index}-${item.Date}`}
                                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition`}
                                                >
                                                    {TABLE_HEADERS.map(header => (
                                                        <td key={header} className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                                                            {header === 'Notes' ? (
                                                                item[header] && item[header].trim() !== '' ? (
                                                                    <span className="notes-icon">
                                                                        <span className="notes-tooltip">{item[header]}</span>
                                                                    </span>
                                                                ) : '-'
                                                            ) : header === 'Vehicle' ? (
                                                                (item[header] && String(item[header]).toUpperCase() !== 'NOVEHICLE') ? (
                                                                    <VrnPlate vrn={item[header]} size="sm" showBadge={false} />
                                                                ) : (
                                                                    item[header] || '-'
                                                                )
                                                            ) : (
                                                                item[header] || '-'
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEdit(index)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Delete"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {paginatedData.length === 0 && !error && (
                                        <div className="p-6 text-center text-slate-600">
                                            No operations found for the selected date/filters.
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Pagination Controls */}
                            {!(loading || isMasterLoading) && (
                                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-t border-slate-200">
                                    <span className="text-sm text-slate-600">
                                        Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
                                    </span>
                                    <div className="flex gap-2">
                                        <ButtonWithRipple
                                            onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                                            disabled={pagination.currentPage === 1 || loading || isMasterLoading}
                                            className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 disabled:opacity-50"
                                        >
                                            Previous
                                        </ButtonWithRipple>
                                        <button
                                            onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                                            disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0 || loading || isMasterLoading}
                                            className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Reveal>

                    {/* Review Button (Main) */}
                    <Reveal className="reveal" data-animate="fade-in-up">
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={handleOpenMainReviewModal}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 text-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Review and Submit (Current Day)
                            </button>
                        </div>
                    </Reveal>

                </div>

                {/* --- Modal Add/Edit (Com Select Boxes) --- */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop-animate">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content-animate">
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {editingIndex !== null ? 'Edit Record' : 'Add New Record'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={guard(handleSubmit)} className="p-6">
                                {/* --- Botão "Return to Today" --- */}
                                {editingIndex !== null && (
                                    <div className="mb-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleReturnToToday}
                                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Return to Today&apos;s Date
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TABLE_HEADERS.map(key => (
                                        <div key={key}>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                {key} {key === 'Date' || key === 'Name' ? '*' : ''}
                                            </label>

                                            {/* --- Lógica de Select Box --- */}

                                            {key === 'Status' ? (
                                                <select
                                                    required
                                                    value={String(formData[key] || '')}
                                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="Working">Working</option>
                                                    <option value="Off">Off</option>
                                                </select>
                                            ) : key === 'Name' ? (
                                                <select
                                                    required
                                                    value={String(formData[key] || '')}
                                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select a vendor</option>
                                                    {[...vendors]
                                                        .sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? '', undefined, { sensitivity: 'base' }))
                                                        .map((vendor) => (
                                                            <option key={vendor.userId} value={vendor.fullName}>{vendor.fullName}</option>
                                                        ))}
                                                </select>
                                            ) : key === 'Vendor type' ? (
                                                <select
                                                    value={String(formData[key] || '')}
                                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select a type</option>
                                                    {availableVendorTypes.length > 0 ? (
                                                        availableVendorTypes.map(type => (
                                                            <option key={type.value} value={type.label}>{type.label}</option>
                                                        ))
                                                    ) : (
                                                        MASTER_VENDOR_TYPES.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))
                                                    )}
                                                </select>
                                            ) : key === 'Payment Mode' ? (
                                                <select
                                                    value={String(formData[key] || '')}
                                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select a mode</option>
                                                    {['DAF', 'DR', 'FSR', 'VSR', 'Hourly', 'Other'].map(mode => (
                                                        <option key={mode} value={mode}>{mode}</option>
                                                    ))}
                                                </select>
                                            ) : key === 'Route' ? (
                                                <select
                                                    value={String(formData[key] || '')}
                                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select a route</option>
                                                    {routes.map(route => (
                                                        <option key={route.routeId} value={route.routeName || ''}>{route.routeName}</option>
                                                    ))}
                                                </select>
                                            ) : key === 'Vehicle' ? (
                                                <select
                                                    value={String(formData[key] || '')}
                                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select a vehicle</option>
                                                    <option value="NOVEHICLE">NOVEHICLE</option>
                                                    {vehicles.map(vehicle => (
                                                        <option key={vehicle.vehicleId} value={vehicle.registrationPlates || ''}>{vehicle.registrationPlates}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={key === 'Date' ? 'date' : key === 'Rate' || key === 'Sort' || key === 'AD-HOC Sort' || key === 'Extras' ? 'number' : 'text'}
                                                    required={key === 'Date'}
                                                    value={String(formData[key] || '')}
                                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <Button type="submit" pending={isSubmitting}>
                                        {editingIndex !== null ? 'Update Record' : 'Add Record'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {/* Review Modal (Main) */}
                {showReviewModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop-animate">
                        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto modal-content-animate">

                            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-800">
                                    Review and Submit (Current Day)
                                </h2>
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6">
                                <ValidationError errors={mainValidationErrors} />
                                <p className="text-slate-700 mb-6">
                                    Please review the data. Only the active records below will be submitted.
                                </p>
                                <ReviewTable
                                    data={operationsData}
                                    title="Active Records to be Saved"
                                />
                            </div>

                            <div className="sticky bottom-0 z-10 flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleMainSubmit}
                                    disabled={mainValidationErrors.length > 0 || isSubmitting}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting && <span className="spinner" />}
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending List Modal (disabled) */}
                {false && showPendingListModal && (<div />)}

                {/* Review Modal (PENDING) disabled */}
                {false && showPendingReviewModal && (<div />)}

                {/* Operations History Modal (Daily Reports) */}
                {showHistoryModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop-animate">
                        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto modal-content-animate">
                            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-800">Previous Operations</h2>
                                <button onClick={() => setShowHistoryModal(false)} className="text-slate-500 hover:text-slate-700">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    {operationsHistory.length === 0 ? (
                                        <p className="text-slate-500">No historical reports saved yet.</p>
                                    ) : (
                                        <ul className="divide-y divide-slate-200">
                                            {operationsHistory.map((day, idx: number) => (
                                                <li key={day.date} className="flex items-center justify-between py-3 reveal" data-animate="fade-in-up">
                                                    <div>
                                                        <p className="text-slate-900 font-medium">{day.date}</p>
                                                        <p className="text-slate-600 text-sm">{day.data.length} records</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium border ${selectedHistoryIndex === idx ? 'bg-slate-200 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'} border-slate-300`}
                                                            onClick={() => setSelectedHistoryIndex(idx)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 rounded-lg text-sm font-medium border bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                                                            onClick={async () => {
                                                                // Carregar dados do backend para esta data
                                                                setSelectedDate(day.date);
                                                                setShowHistoryModal(false);
                                                                await fetchData();
                                                            }}
                                                        >
                                                            Load from Database
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {selectedHistoryIndex !== null && operationsHistory[selectedHistoryIndex] && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-3">Report for {operationsHistory[selectedHistoryIndex].date}</h3>
                                        <p className="text-sm text-slate-600 mb-4">
                                            Click on the date selector above to view this date&apos;s operations from the database.
                                        </p>
                                        <ReviewTable data={operationsHistory[selectedHistoryIndex].data} title={`Records for ${operationsHistory[selectedHistoryIndex].date}`} />
                                    </div>
                                )}
                            </div>

                            <div className="sticky bottom-0 z-10 flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => setShowHistoryModal(false)}
                                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Modal de Animação de Sucesso --- */}
                {showSuccessAnimation && (
                    <div className="success-animation-modal">
                        <div className="celebration-overlay">
                            <div className="celebration-confetti">
                                {confettiPieces.map((p, i) => (
                                    <span
                                        key={i}
                                        className="confetti-piece"
                                        style={{
                                            left: p.left + 'vw',
                                            top: '-10px',
                                            backgroundColor: p.color,
                                            opacity: p.opacity,
                                            animationDuration: `${p.duration}s, ${p.duration}s`,
                                            animationDelay: `${p.delay}s, ${p.delay}s`
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="celebration-badge">
                                <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </NavbarWrapper>
    );
}
