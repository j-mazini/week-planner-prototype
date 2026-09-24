"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import NavbarWrapper from "@/components/navbar-wrapper";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { getUserTypeFromToken, hasAuthSession, getBearerAuthHeader } from "@/lib/auth"
import { Input } from "@/components/ui/input";
import { useDateStore } from "@/lib/date-store";
import { formatDate, formatCurrency, formatValue, getCostModelName } from './utils';
import { TodayDateLine } from '@/app/(private)/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import './table.css';
import '../styles/table.css';
import { TableLoadingSkeleton } from '@/components/ui/table-loading-skeleton';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { guardedFetch } from "@/lib/in-flight-guard";

interface Operation {
  operationId: number;
  operationDate: string;
  note: string | null;
  rate: string | null;
  daily_service_charge: string | null;
  status: string;
  routeSort: string | null;
  adhocSort: string | null;
  extra: string | null;
  operationCostModel: number | null;
  userId: number;
  vehicleId: number;
  routeId: number;
  routeName: string;
  depositId: number;
  depositName: string;
  serviceTypeId: number;
  serviceName: string;
  courierName: string;
  vrn: string;
  percentageOtTwDl: string;
  earlyDl: number | null;
  lateDl: number | null;
  otDl: number | null;
  totalStops: number | string;
  total: number;
  totalPaidStops: number;
  sporh: string;
  breakMinutes: string | null;
  totalWorkHours: string;
  totalAfd: string;
  totalPu: string;
  totalOk: string;
  totalHn: string;
  totalNr: string;
  totalFp: string;
  totalRd: string;
  totalBa: string;
  totalNh: string;
  totalCm: string;
  departTime: string | null;
  arriveTime: string | null;
  calculatedWorkHours: string;
  costModel?: {
    costModelId: number;
    minStops: number;
    maxStops: number;
    fixedPrice: number;
    pricePerStop: number;
    costModelName: string;
  }[];
  isSpms: boolean | null;
}

interface ServiceType {
  serviceTypeId: number;
  serviceName: string;
}

export default function Page() {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useDateStore();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepositId, setSelectedDepositId] = useState<number>(0);
  const [selectedServiceTypeId, setSelectedServiceTypeId] =
    useState<number>(0);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Protection: Only allow `BUSINESS_RULES.USER_TYPE.ADMIN` (Admin)
  useEffect(() => {
    if (!hasAuthSession()) {
      router.push('/daily-performance-insight');
      return;
    }
    const userTypeId = getUserTypeFromToken();
    if (userTypeId === null) {
      router.push('/daily-performance-insight');
      return;
    }
    if (userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER) {
      router.push('/daily-performance-insight');
    } else if (userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR) {
      router.push('/daily-operations-reports');
    }
  }, [router]);

  // Helper function to format date in local timezone (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchServiceTypes = useCallback(async (depositId: number) => {
    setLoadingServiceTypes(true);
    try {
      const response = await guardedFetch(
        `${getApiBaseUrl()}/bff/service-types/by-deposit/${depositId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getBearerAuthHeader(),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setServiceTypes(data);

        // Reset service type selection to 0 when deposit changes
        setSelectedServiceTypeId(0);
      }
    } catch (error) {
      console.error("Error fetching service types:", error);
    } finally {
      setLoadingServiceTypes(false);
    }
  }, []);

  const fetchWithParams = useCallback(
    async (selectedDate: Date, params: URLSearchParams) => {
      setLoading(true);
      try {
        // Add metrics=revenue parameter to get cost model data
        params.set("metrics", "revenue");
        
        const response = await guardedFetch(
          `${getApiBaseUrl()}/bff/reports?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getBearerAuthHeader(),
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Sort operations by routeName alphabetically
          const sortedData = data.sort((a: Operation, b: Operation) => {
            const routeNameA = a.routeName || '';
            const routeNameB = b.routeName || '';
            return routeNameA.localeCompare(routeNameB);
          });
          setOperations(sortedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedDepositId > 0) {
      fetchServiceTypes(selectedDepositId);
    }
  }, [selectedDepositId, fetchServiceTypes]);

  useEffect(() => {
    // Iniciar loading imediatamente quando a página monta ou quando filtros mudam
    setLoading(true);
    
    if (selectedDate) {
      const urlSearchParams = new URLSearchParams();
      urlSearchParams.set("date", formatDateForAPI(selectedDate));
      urlSearchParams.set("depositId", selectedDepositId.toString());
      urlSearchParams.set("serviceTypeId", selectedServiceTypeId.toString());

      fetchWithParams(selectedDate, urlSearchParams);
    } else {
      // Se não houver data selecionada, ainda assim mostrar loading inicial
      setLoading(false);
    }
  }, [selectedServiceTypeId, selectedDate, selectedDepositId, fetchWithParams]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
    // The useEffect will handle fetching when date changes
  };

  const handleDepositChange = (depositId: number) => {
    setSelectedDepositId(depositId);
    // Always reset service type selection when any deposit is clicked
    setSelectedServiceTypeId(0);
  };

  const handleServiceTypeChange = (serviceTypeId: number) => {
    setSelectedServiceTypeId(serviceTypeId);
  };

  // Filter operations based on search term
  const filteredOperations = useMemo(() => {
    if (!searchTerm.trim()) return operations;
    const s = searchTerm.toLowerCase().trim();
    return operations.filter(op => 
      (op.routeName && op.routeName.toLowerCase().includes(s)) ||
      (op.courierName && op.courierName.toLowerCase().includes(s)) ||
      (op.vrn && op.vrn.toLowerCase().includes(s))
    );
  }, [operations, searchTerm]);

  // Calculate count of routes starting with D, L, M, F
  const getFilteredRouteCount = () => {
    return filteredOperations.filter(operation => {
      const firstChar = (operation.routeName || '').charAt(0).toUpperCase();
      return firstChar === 'D' || firstChar === 'L' || firstChar === 'M' || firstChar === 'F';
    }).length;
  };

  // Helper function to calculate base revenue for Paid Stops
  const getBaseRevenue = (operation: Operation) => {
    return operation.totalPaidStops || 0;
  };

  // Calculate totals
  const totals = useMemo(() => {
    let totalStops = 0;
    let totalPaidStops = 0;
    let totalRevenue = 0;

    filteredOperations.forEach((operation) => {
      const stops = typeof operation.totalStops === "string" ? parseInt(operation.totalStops) : operation.totalStops;
      totalStops += stops || 0;
      totalPaidStops += operation.totalPaidStops || 0;
      totalRevenue += operation.total || 0;
    });

    return { totalStops, totalPaidStops, totalRevenue };
  }, [filteredOperations]);

  // Status Select Component
  const StatusSelectCell = ({ operation }: { operation: Operation }) => {
    const currentStatus = operation.status || "Working";
    const normalizedStatus = currentStatus.toLowerCase() === "off" || 
                             currentStatus.toLowerCase() === "inactive" ? "OFF" : "Working";

    const onSelectChange = (value: string) => {
      handleStatusChange(operation.operationId, value);
    };

    return (
      <Select value={normalizedStatus} onValueChange={onSelectChange}>
        <SelectTrigger className="h-[28px] w-[90px] text-[0.85rem] px-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Working">Working</SelectItem>
          <SelectItem value="OFF">OFF</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  // Handle status change
  const handleStatusChange = useCallback(async (operationId: number, newStatus: string) => {
    // Update local state immediately for responsive UI
    setOperations(prevOperations => 
      prevOperations.map(op => 
        op.operationId === operationId 
          ? { ...op, status: newStatus }
          : op
      )
    );

    // Optionally: Call API to persist the change
    // Uncomment and adjust the endpoint if you have an API for updating operation status
    /*
    try {
      const response = await guardedFetch(
        `${getApiBaseUrl()}/bff/operations/${operationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getBearerAuthHeader(),
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        // Revert the change if API call fails
        setOperations(prevOperations => 
          prevOperations.map(op => 
            op.operationId === operationId 
              ? { ...op, status: op.status }
              : op
          )
        );
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert the change on error
      setOperations(prevOperations => 
        prevOperations.map(op => 
          op.operationId === operationId 
            ? { ...op, status: op.status }
            : op
        )
      );
    }
    */
  }, []);

  const handleDownload = async () => {
    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }

    try {
      if (!hasAuthSession()) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const urlParams = new URLSearchParams({
        date: formatDateForAPI(selectedDate),
        depositId: selectedDepositId.toString(),
        serviceTypeId: selectedServiceTypeId.toString(),
        metrics: "revenue",
        reportType: "financial",
      });

      const response = await guardedFetch(
        `${getApiBaseUrl()}/bff/reports/download?${urlParams.toString()}`,
        {
          method: "GET",
          headers: {
            ...getBearerAuthHeader(),
            Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      if (response.ok) {
        // Create blob with Excel MIME type
        const arrayBuffer = await response.arrayBuffer();
        
        if (arrayBuffer.byteLength === 0) {
          alert("No data available for download");
          return;
        }

        // Create blob with proper Excel MIME type for Office compatibility
        const blob = new Blob([arrayBuffer], { 
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `daily-financials-${formatDateForAPI(selectedDate)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up after a short delay to ensure download starts
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      } else {
        const errorText = await response.text();
        console.error("Download failed:", response.status, errorText);
        
        // Handle specific error cases
        if (response.status === 404) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message?.includes("No reports found")) {
              alert("No reports available for the selected date and filters. Please try a different date or adjust your filters.");
              return;
            }
          } catch {
            // errorText was not valid JSON; fall through to generic error handling below
          }
        }
        
        alert(`Download failed: ${response.status} - ${errorText || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(`Error downloading file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <NavbarWrapper>
      <div className="daily-financials-page pt-16 w-full max-w-content-wide mx-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Daily Financials</h1>
          <TodayDateLine className="mt-1 text-xs font-medium text-slate-500" />
        </div>
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 p-4">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <DatePicker date={selectedDate} setDate={handleDateChange} />
            <div className="relative w-full md:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <Input
                placeholder="Search route or courier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 w-full"
              />
            </div>
          </div>
          <Button
            onClick={handleDownload}
            disabled={!selectedDate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between">
          <div>
            <h1 className="p-4">Deposits</h1>
            <div className="flex flex-wrap gap-2 p-4">
              <Button
                variant={selectedDepositId === 0 ? "default" : "outline"}
                onClick={() => handleDepositChange(0)}
              >
                See All
              </Button>
              <Button
                variant={selectedDepositId === 1 ? "default" : "outline"}
                onClick={() => handleDepositChange(1)}
              >
                LCY
              </Button>
              <Button
                variant={selectedDepositId === 2 ? "default" : "outline"}
                onClick={() => handleDepositChange(2)}
              >
                MSE
              </Button>
              <Button
                variant={selectedDepositId === 3 ? "default" : "outline"}
                onClick={() => handleDepositChange(3)}
              >
                LSE
              </Button>
            </div>
          </div>

          {selectedDepositId > 0 && (
            <div>
              <h1 className="p-4">Loops</h1>
              <div className="flex flex-wrap gap-2 p-4">
                {loadingServiceTypes ? (
                  <div className="flex items-center justify-center p-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  serviceTypes.map((serviceType) => (
                    <Button
                      key={serviceType.serviceTypeId}
                      variant={
                        selectedServiceTypeId === serviceType.serviceTypeId
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleServiceTypeChange(serviceType.serviceTypeId)
                      }
                    >
                      {serviceType.serviceName}
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 w-full">
          {loading ? (
            <div className="table-container">
              <TableLoadingSkeleton rows={8} columns={12} showHeader={true} />
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table optimized-table-hover">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Route</th>
                      <th>Courier</th>
                      <th>Status</th>
                      <th>Stops</th>
                      <th>Cost Model</th>
                      <th>Paid Stops (£)</th>
                      <th>Route Sort</th>
                      <th>AdHoc Sort</th>
                      <th>Extra</th>
                      <th>Total (£)</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody id="data-table-body">
                    {filteredOperations.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center py-4 text-muted">
                          No records found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOperations.map((operation, index) => {
                            const totalRevenue = operation.total || 0;
                            const baseRevenue = getBaseRevenue(operation);
                        const totalStops = operation.totalStops;
                        const textColor = !operation.isSpms ? "text-orange-600" : "";

                        return (
                          <tr key={`${operation.operationId}-${index}`}>
                            <td>{formatDate(operation.operationDate)}</td>
                            <td><a href="#" onClick={e => e.preventDefault()}>{operation.routeName}</a></td>
                            <td>{operation.courierName}</td>
                            <td>
                              <StatusSelectCell operation={operation} />
                            </td>
                            <td className={textColor}>
                              {totalStops === 0 || totalStops === "0" ? "---" : formatValue(totalStops)}
                            </td>
                            <td>{getCostModelName(operation.operationCostModel)}</td>
                            <td>{formatCurrency(baseRevenue)}</td>
                            <td>{formatCurrency(operation.routeSort)}</td>
                            <td>{formatCurrency(operation.adhocSort)}</td>
                            <td>{formatCurrency(operation.extra)}</td>
                            <td>{formatCurrency(isNaN(totalRevenue) ? null : totalRevenue)}</td>
                            <td>{operation.note || "---"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredOperations.length > 0 && (
                <footer className="footer-totals-bar">
                  <div className="footer-info">
                    Showing {filteredOperations.length} records
                  </div>
                  <div className="footer-totals">
                    <div>
                      <span>Total Routes:</span>{getFilteredRouteCount()}
                    </div>
                    <div>
                      <span>Total Stops:</span>{totals.totalStops}
                    </div>
                    <div>
                      <span>Total Paid Stops:</span>{formatCurrency(totals.totalPaidStops)}
                    </div>
                    <div>
                      <span>Total Revenue:</span>{formatCurrency(totals.totalRevenue)}
                    </div>
                  </div>
                </footer>
              )}
            </>
          )}
        </div>
      </div>
    </NavbarWrapper>
  );
}

