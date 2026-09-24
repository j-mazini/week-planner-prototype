'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import './OperationsManagement.css';
import {
    fetchOperations,
    createOperation,
    updateOperation,
    deleteOperation,
    type OperationManagementListDTO
} from '@/lib/operations-management-api';
import { fetchVendors, type Vendor } from '@/lib/vendors';
import { fetchRoutes, type Route } from '@/lib/api/routes';
import { fetchVehicles, type Vehicle } from '@/lib/vehicles';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

const MASTER_VENDOR_TYPES = [
    'Core route Vendor',
    'SPARE',
    'Ad-Hoc Bicycle',
    'Out an back',
    'Trainee',
    'Other'
];

const MASTER_PAYMENT_MODES = [
    'DR',
    'AD-HOC',
    'Invoice',
    'Other'
];

// --- Dados Padrão ---
const DEFAULT_CURRENT_DAY_DATA = [
    { "Date": "2025-10-01", "Route": "BATR", "Name": "Julio Teixeira", "Payment Mode": "DR", "Rate": 60.0, "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "Training", "Vehicle": "NOVEHICLE", "Vendor type": "SPARE", "Status": "Working" },
    { "Date": "2025-10-01", "Route": "BATR", "Name": "Jorge Sousa", "Payment Mode": "DR", "Rate": 80.0, "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "Training", "Vehicle": "IVY", "Vendor type": "Ad-Hoc Bicycle", "Status": "Working" },
    { "Date": "2025-10-01", "Route": "", "Name": "Rodolfo Feitosa", "Payment Mode": "", "Rate": "", "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "", "Vehicle": "", "Vendor type": "", "Status": "Off" },
    { "Date": "2025-10-01", "Route": "", "Name": "Leonardo Barros", "Payment Mode": "", "Rate": "", "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "", "Vehicle": "", "Vendor type": "", "Status": "Off" },
    { "Date": "2025-10-01", "Route": "MD7A", "Name": "Joao Guimaraes", "Payment Mode": "DR", "Rate": 138.0, "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "", "Vehicle": "NOVEHICLE", "Vendor type": "Core route Vendor", "Status": "Working" },
    { "Date": "2025-10-01", "Route": "MD7B", "Name": "Silviu Stan", "Payment Mode": "DR", "Rate": 60.0, "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "", "Vehicle": "VAN-123", "Vendor type": "SPARE", "Status": "Working" },
    { "Date": "2025-10-01", "Route": "MD7C", "Name": "Georgian Turcu", "Payment Mode": "DR", "Rate": 60.0, "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "", "Vehicle": "VAN-124", "Vendor type": "SPARE", "Status": "Working" }
];

const DEFAULT_PENDING_DAYS_DATA = [
    {
        date: '2025-10-02',
        data: [
            { "Date": "2025-10-02", "Route": "MD1", "Name": "Julio Teixeira", "Payment Mode": "DR", "Rate": 120.0, "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "Test day", "Vehicle": "VAN-201", "Vendor type": "Core route Vendor", "Status": "Working" },
            { "Date": "2025-10-02", "Route": "MD2", "Name": "Jorge Sousa", "Payment Mode": "DR", "Rate": 120.0, "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "Test day", "Vehicle": "VAN-202", "Vendor type": "Core route Vendor", "Status": "Working" },
            { "Date": "2025-10-02", "Route": "MD3", "Name": "Rodolfo Feitosa", "Payment Mode": "DR", "Rate": 120.0, "Sort": "", "AD-HOC Sort": "", "Extras": "", "Notes": "Test day", "Vehicle": "VAN-203", "Vendor type": "Core route Vendor", "Status": "Working" },
        ]
    },
    {
        date: '2025-09-29',
        data: [
            { "Date": "2025-09-29", "Route": "R1", "Name": "Julio Teixeira", "Payment Mode": "DR", "Rate": 100.0, "Vehicle": "VAN-A", "Status": "Working" },
        ]
    }
];

const TABLE_HEADERS = ['Date', 'Route', 'Name', 'Payment Mode', 'Rate', 'Sort', 'AD-HOC Sort', 'Extras', 'Notes', 'Vehicle', 'Vendor type', 'Status'];

// --- Types ---
type OperationRecord = {
    operationId?: number; // ID da operação na API (opcional para compatibilidade)
    Date: string;
    Route: string;
    Name: string;
    'Payment Mode': string;
    Rate: string | number;
    Sort: string;
    'AD-HOC Sort': string;
    Extras: string;
    Notes: string;
    Vehicle: string;
    'Vendor type': string;
    Status: string;
    [key: string]: string | number | undefined;
};

// type PendingDay = {
//     date: string;
//     data: OperationRecord[];
// };

type HistoryEntry = {
    date: string;
    data: OperationRecord[];
};

// --- Funções de Mapeamento API <-> Frontend ---
const mapApiToFrontend = (
    apiOp: OperationManagementListDTO,
    vendorsMap: Map<number, Vendor>,
    routesMap: Map<number, Route>,
    vehiclesMap: Map<number, Vehicle>
): OperationRecord => {
    const vendor = vendorsMap.get(apiOp.userId);
    const route = routesMap.get(apiOp.routeId);
    const vehicle = apiOp.vehicleId ? vehiclesMap.get(apiOp.vehicleId) : null;

    // Mapear status: 'ACTIVE' ou valores similares -> 'Working', outros -> 'Off'
    const status = (apiOp.status?.toUpperCase() === 'ACTIVE' || apiOp.status === 'Working') ? 'Working' : 'Off';

    return {
        operationId: apiOp.operationId,
        Date: apiOp.date,
        Route: route?.routeName || '',
        Name: vendor?.fullName || '',
        'Payment Mode': 'DR', // Default, pode ser ajustado conforme necessário
        Rate: apiOp.rate || '',
        Sort: String(apiOp.routeSort || ''),
        'AD-HOC Sort': String(apiOp.adhocSort || ''),
        Extras: String(apiOp.extra || ''),
        Notes: apiOp.note || '',
        Vehicle: vehicle?.registrationPlates || 'NOVEHICLE',
        'Vendor type': '', // Não vem da API diretamente
        Status: status
    };
};

const mapFrontendToApi = (
    frontendOp: OperationRecord,
    vendorsMap: Map<string, Vendor>,
    routesMap: Map<string, Route>,
    vehiclesMap: Map<string, Vehicle>
): {
    date: string;
    rate: number;
    dailyServiceCharge: number;
    extra: number;
    status: string;
    routeId: number;
    adhocSort: number;
    routeSort: number;
    userId: number;
    vehicleId?: number;
    note?: string;
} => {
    const vendor = vendorsMap.get(frontendOp.Name);
    const route = routesMap.get(frontendOp.Route);
    const vehicle = vehiclesMap.get(frontendOp.Vehicle);

    // Validações: routeId e userId são obrigatórios
    if (!route?.routeId) {
        throw new Error('Route is required');
    }
    if (!vendor?.userId) {
        throw new Error('Vendor is required');
    }

    return {
        date: frontendOp.Date,
        rate: Number(frontendOp.Rate) || 0,
        dailyServiceCharge: 0, // Default - este campo não está disponível no frontend, pode ser ajustado no backend
        extra: Number(frontendOp.Extras) || 0,
        status: frontendOp.Status === 'Working' ? 'ACTIVE' : 'INACTIVE',
        routeId: route.routeId,
        adhocSort: Number(frontendOp['AD-HOC Sort']) || 0,
        routeSort: Number(frontendOp.Sort) || 0,
        userId: vendor.userId,
        vehicleId: vehicle?.vehicleId,
        note: frontendOp.Notes || undefined
    };
};

// --- Sub-Componentes ---
const ReviewTable = ({ data, title }: { data: OperationRecord[]; title: string }) => (
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
                                        {(item[header] as string | number) || '-'}
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

// --- Componente Principal ---
export default function OperationsManagement() {

    // --- Carregar dados do localStorage ---
    const [operationsData, setOperationsData] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_CURRENT_DAY_DATA;
        try {
            const storedData = localStorage.getItem('operationsData');
            return storedData ? JSON.parse(storedData) : DEFAULT_CURRENT_DAY_DATA;
        } catch (error) {
            console.error("Failed to read operationsData from localStorage", error);
            return DEFAULT_CURRENT_DAY_DATA;
        }
    });

    const [pendingDays] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_PENDING_DAYS_DATA;
        try {
            const stored = localStorage.getItem('pendingDays');
            return stored ? JSON.parse(stored) : DEFAULT_PENDING_DAYS_DATA;
        } catch (e) {
            console.error("Failed to read pendingDays from localStorage", e);
            return DEFAULT_PENDING_DAYS_DATA;
        }
    });

    // Histórico de Operações
    const [operationsHistory, setOperationsHistory] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem('operationsHistory');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to read operationsHistory from localStorage', e);
            return [];
        }
    });

    // --- Efeitos para salvar no localStorage ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('operationsData', JSON.stringify(operationsData));
        }
    }, [operationsData]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('pendingDays', JSON.stringify(pendingDays));
        }
    }, [pendingDays]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('operationsHistory', JSON.stringify(operationsHistory));
        }
    }, [operationsHistory]);

    // Estados de Filtro/UI
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterVendorType, setFilterVendorType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'Date', direction: 'desc' });

    // Estados de Modais
    const [showModal, setShowModal] = useState(false); // Add/Edit
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false); // Main Review

    // Estados de Modais (Pending) - Mantidos do código original
    const [showPendingListModal] = useState(false);
    const [showPendingReviewModal] = useState(false);

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);

    // --- Estado para animação de sucesso ---
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { guard } = useSubmitGuard();
    const [confettiPieces, setConfettiPieces] = useState<Array<{ left: number; delay: number; duration: number; color: string; opacity: number }>>([]);

    // Estados de Validação
    const [mainValidationErrors, setMainValidationErrors] = useState<string[]>([]);

    // Estados para integração com API
    const [useApi, setUseApi] = useState(true); // Flag para usar API ou localStorage
    const [, setIsLoadingApi] = useState(false);
    const [, setApiError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const itemsPerPage = 15;

    // Estado do Formulário (Add/Edit)
    const [formData, setFormData] = useState({
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

    // --- Carregar dados de referência (vendors, routes, vehicles) ---
    useEffect(() => {
        const loadReferenceData = async () => {
            try {
                const [vendorsData, routesData, vehiclesData] = await Promise.all([
                    fetchVendors(),
                    fetchRoutes(),
                    fetchVehicles()
                ]);
                setVendors(vendorsData);
                setRoutes(routesData);
                setVehicles(vehiclesData);
            } catch (error) {
                console.error('Error loading reference data:', error);
                setApiError('Failed to load reference data. Using local data.');
                setUseApi(false);
            }
        };

        if (useApi) {
            loadReferenceData();
        }
    }, [useApi]);

    // --- Carregar operações da API quando a data mudar ---
    const loadOperationsFromApi = useCallback(async (date: string) => {
        if (!useApi) return;

        setIsLoadingApi(true);
        setApiError(null);

        try {
            const apiOperations = await fetchOperations(date);

            // Criar maps para lookup rápido
            const vendorsMap = new Map(vendors.map(d => [d.userId, d]));
            const routesMap = new Map(routes.map(r => [r.routeId!, r]));
            const vehiclesMap = new Map(vehicles.map(v => [v.vehicleId!, v]));

            // Mapear operações da API para o formato do frontend
            const mappedOperations: OperationRecord[] = apiOperations.map(op => {
                return mapApiToFrontend(op, vendorsMap, routesMap, vehiclesMap);
            });

            setOperationsData(mappedOperations);
        } catch (error) {
            console.error('Error loading operations from API:', error);
            setApiError(error instanceof Error ? error.message : 'Failed to load operations');
            // Fallback para localStorage em caso de erro
            setUseApi(false);
        } finally {
            setIsLoadingApi(false);
        }
    }, [useApi, vendors, routes, vehicles]);

    // Carregar operações quando a data mudar
    useEffect(() => {
        if (useApi && selectedDate) {
            loadOperationsFromApi(selectedDate);
        }
    }, [selectedDate, useApi, loadOperationsFromApi]);

    // Reveal animations and ripple effects are now handled by Reveal and ButtonWithRipple components

    // --- Função para retornar ao dia atual ---
    const handleReturnToToday = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        setFormData(prev => ({
            ...prev,
            Date: today
        }));
        if (useApi) {
            setSelectedDate(today);
        }
    };

    // Funções do Formulário
    const resetForm = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
            Date: today,
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
        setEditingIndex(null);
        if (useApi) {
            setSelectedDate(today);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            // Se a data mudar e estiver usando API, atualizar selectedDate
            if (field === 'Date' && useApi) {
                setSelectedDate(value);
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (useApi) {
            try {
                setIsSubmitting(true);

                // Criar maps para lookup
                const vendorsMap = new Map(vendors.map(d => [d.fullName, d]));
                const routesMap = new Map(routes.map(r => [r.routeName!, r]));
                const vehiclesMap = new Map(vehicles.map(v => [v.registrationPlates!, v]));

                const apiData = mapFrontendToApi(formData, vendorsMap, routesMap, vehiclesMap);

                if (editingIndex !== null) {
                    // Atualizar operação existente
                    const item = paginatedData[editingIndex];
                    const actualIndex = operationsData.findIndex((op: OperationRecord) => op === item);
                    const currentOp = actualIndex !== -1 ? operationsData[actualIndex] : null;

                    if (currentOp?.operationId) {
                        await updateOperation(currentOp.operationId, apiData);
                        await loadOperationsFromApi(formData.Date);
                    } else {
                        alert('Could not find the operation to update.');
                    }
                } else {
                    // Criar nova operação
                    await createOperation(apiData);
                    await loadOperationsFromApi(formData.Date);
                }

                setShowModal(false);
                resetForm();
            } catch (error) {
                console.error('Error saving operation:', error);
                alert(`Error saving operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // Modo localStorage (comportamento original)
            if (editingIndex !== null) {
                const newData = [...operationsData];
                newData[editingIndex] = formData;
                setOperationsData(newData);
            } else {
                setOperationsData([formData, ...operationsData]);
            }
            setShowModal(false);
            resetForm();
        }
    };

    // Funções da Tabela
    const handleEdit = (index: number) => {
        const item = paginatedData[index];
        const actualIndex = operationsData.findIndex((op: OperationRecord) => op === item);
        if (actualIndex === -1) return;

        setFormData(operationsData[actualIndex]);
        setEditingIndex(actualIndex);
        setShowModal(true);
    };

    const handleDelete = async (index: number) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this record? This cannot be undone.")) {
            return;
        }

        if (useApi) {
            try {
                const item = paginatedData[index];
                const actualIndex = operationsData.findIndex((op: OperationRecord) => op === item);
                const currentOp = actualIndex !== -1 ? operationsData[actualIndex] : null;

                if (currentOp?.operationId) {
                    await deleteOperation(currentOp.operationId);
                    await loadOperationsFromApi(selectedDate);
                } else {
                    alert('Could not find the operation to delete.');
                }
            } catch (error) {
                console.error('Error deleting operation:', error);
                alert(`Error deleting operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } else {
            // Modo localStorage (comportamento original)
            const item = paginatedData[index];
            const actualIndex = operationsData.findIndex((op: OperationRecord) => op === item);
            if (actualIndex === -1) return;

            const newData = operationsData.filter((_: OperationRecord, i: number) => i !== actualIndex);
            setOperationsData(newData);
        }
    };

    // Filtros (Dropdowns)
    const uniqueStatuses = [...new Set(operationsData.map((item: OperationRecord) => item.Status).filter(Boolean))] as string[];
    const uniqueVendorTypes = [...new Set(operationsData.map((item: OperationRecord) => item['Vendor type']).filter(Boolean))] as string[];

    // Filter data
    const filteredData = useMemo(() => {
        return operationsData.filter((item: OperationRecord) => {
            const matchesSearch =
                (item.Name && item.Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.Route && item.Route.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.Vehicle && item.Vehicle.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = filterStatus === 'all' || item.Status === filterStatus;
            const matchesVendorType = filterVendorType === 'all' || item['Vendor type'] === filterVendorType;

            return matchesSearch && matchesStatus && matchesVendorType;
        });
    }, [searchTerm, filterStatus, filterVendorType, operationsData]);

    // Sort data
    const sortedData = useMemo(() => {
        const sortableData = [...filteredData];
        if (sortConfig.key) {
            sortableData.sort((a: OperationRecord, b: OperationRecord) => {
                const aValue = (a[sortConfig.key] as string) || '';
                const bValue = (b[sortConfig.key] as string) || '';
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableData;
    }, [filteredData, sortConfig]);

    // Paginação
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Export CSV
    const handleExportCSV = () => {
        const dataToExport = sortedData;
        const csvHeader = TABLE_HEADERS.join(',') + '\n';
        const csvRows = dataToExport.map(row => {
            return TABLE_HEADERS.map(header => {
                let cell = row[header] ? row[header].toString() : '';
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

    // Lógica de Validação
    const runValidations = (dataToValidate: OperationRecord[]) => {
        const errors: string[] = [];

        // 1. Check Duplicates
        const vehicleMap = new Map<string, string>();
        const workingData = dataToValidate.filter((item: OperationRecord) => item.Status === 'Working');

        for (const item of workingData) {
            const vehicle = item.Vehicle;
            if (vehicle && vehicle.toUpperCase() !== "NOVEHICLE") {
                if (vehicleMap.has(vehicle)) {
                    errors.push(`Duplicate Vehicle: "${vehicle}" is assigned to ${item.Name} and ${vehicleMap.get(vehicle)}.`);
                } else {
                    vehicleMap.set(vehicle, item.Name);
                }
            }
        }
        return errors;
    };

    // --- Funções de Submissão ---

    // Para o dia principal
    const handleOpenMainReviewModal = () => {
        const errors = runValidations(operationsData);
        setMainValidationErrors(errors);
        setShowReviewModal(true);
    };

    const handleMainSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Pequeno delay para feedback de "processando"
        setTimeout(() => {
            // Salvar no histórico diário
            const dateKey = (operationsData && operationsData[0] && operationsData[0].Date)
                ? operationsData[0].Date
                : new Date().toISOString().split('T')[0];

            setOperationsHistory((prev: HistoryEntry[]) => {
                const others = prev.filter((entry: HistoryEntry) => entry.date !== dateKey);
                const updated = [{ date: dateKey, data: operationsData }, ...others];
                updated.sort((a: HistoryEntry, b: HistoryEntry) => b.date.localeCompare(a.date));
                return updated;
            });

            setShowReviewModal(false);

            // Prepare new confetti pieces and show celebration
            const generatePieces = (count: number) => {
                const colors = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
                return Array.from({ length: count }).map(() => ({
                    left: Math.random() * 100, // vw
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
        }, 500);
    };

    return (
        <div className="ops-body-bg ops-container min-h-screen">
            <div className="max-w-[1600px] mx-auto p-6">
                {/* Header */}
                <div className="mb-8 flex flex-wrap gap-4 justify-between items-center reveal" data-animate="slide-down">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2 page-title">Daily Operations Management</h1>
                        <p className="text-slate-600">Route and vendor management system</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Record
                        </button>
                    </div>
                </div>

                {/* Filter Block */}
                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 reveal" data-animate="fade-in-up">

                    <div className="md:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
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
                        <label htmlFor="filterStatus" className="block text-sm font-medium text-slate-700 mb-2">
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
                        <label htmlFor="filterVendorType" className="block text-sm font-medium text-slate-700 mb-2">
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

                {/* Main Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden reveal" data-animate="fade-in-up">
                    <div className="overflow-x-auto">
                        <table className="w-full ops-table">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    {TABLE_HEADERS.map((header) => (
                                        <th
                                            key={header}
                                            onClick={() => handleSort(header)}
                                            className={`px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer`}
                                        >
                                            <div className="flex items-center gap-1">
                                                {header}
                                                {sortConfig.key === header && (
                                                    <span className="text-blue-600">
                                                        {sortConfig.direction === 'asc' ? '←' : '←'}
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
                                {paginatedData.map((item, index) => (
                                    <tr
                                        key={`${item.Name}-${item.Date}-${index}`}
                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                                    >
                                        {TABLE_HEADERS.map(header => (
                                            <td key={header} className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                                                {(item[header] as string | number) || '-'}
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
                    </div>
                    {/* Controles de Paginação */}
                    <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-t border-slate-200">
                        <span className="text-sm text-slate-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Botão de Revisão (Principal) */}
                <div className="flex justify-end mt-8 reveal gap-3" data-animate="fade-in-up">
                    {/* Botão para ver histórico */}
                    <button
                        onClick={() => setShowHistoryModal(true)}
                        className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        History
                    </button>

                    <button
                        onClick={handleOpenMainReviewModal}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 text-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Review and Submit
                    </button>
                </div>

            </div>

            {/* --- Modal Add/Edit --- */}
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
                                                value={formData[key as keyof typeof formData] as string}
                                                onChange={(e) => handleInputChange(key, e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="Working">Working</option>
                                                <option value="Off">Off</option>
                                            </select>
                                        ) : key === 'Name' ? (
                                            <select
                                                required
                                                value={formData[key as keyof typeof formData] as string}
                                                onChange={(e) => handleInputChange(key, e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select a vendor</option>
                                            </select>
                                        ) : key === 'Vendor type' ? (
                                            <select
                                                value={formData[key as keyof typeof formData] as string}
                                                onChange={(e) => handleInputChange(key, e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select a type</option>
                                                {MASTER_VENDOR_TYPES.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        ) : key === 'Payment Mode' ? (
                                            <select
                                                value={formData[key as keyof typeof formData] as string}
                                                onChange={(e) => handleInputChange(key, e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select a mode</option>
                                                {MASTER_PAYMENT_MODES.map(mode => (
                                                    <option key={mode} value={mode}>{mode}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            // --- Input Padrão ---
                                            <input
                                                type={key === 'Date' ? 'date' : key === 'Rate' ? 'number' : 'text'}
                                                required={key === 'Date'}
                                                value={formData[key as keyof typeof formData] as string}
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

            {/* Modal de Revisão (Principal) */}
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

            {/* Modais de Pendência (estrutura preservada, mas visualmente ocultos conforme lógica original) */}
            {showPendingListModal && (<div className="hidden" />)}
            {showPendingReviewModal && (<div className="hidden" />)}

            {/* Modal de Histórico de Operações */}
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
                                        {operationsHistory.map((day: HistoryEntry, idx: number) => (
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
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {selectedHistoryIndex !== null && operationsHistory[selectedHistoryIndex] && (
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-3">Report for {operationsHistory[selectedHistoryIndex].date}</h3>
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

        </div>
    );
}

