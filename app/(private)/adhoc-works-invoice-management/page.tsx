"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrame, MobilePageShell } from "@/app/(private)/components";
import { ModernPageHeader } from "@/components/modern-page-header";
import { useServicePartners } from "@/hooks/useServicePartners";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableHeader as TableHeaderCell } from "@/components/table-header";
import { Button } from "@/components/ui/button";
import {
  getAdhocWorks,
  exportAdhocWorks,
  type AdhocWorksDTO,
} from "@/lib/adhoc-works-api";
import { exportAdhocWorksToPDF } from "./utils/pdfExport";
import "./adhoc-table.css";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format date string yyyy-MM-dd as "dd MMM yyyy" without timezone shift (parse as local date). */
function formatDateOnly(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const part = String(dateStr).trim().split("T")[0];
    const [y, m, d] = part.split("-").map(Number);
    if (!y || !m || !d) return "—";
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return "—";
    return format(date, "dd MMM yyyy", { locale: enUS });
  } catch {
    return "—";
  }
}

/** Parse a date string in YYYY-MM-DD format to a Date object using local timezone */
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return new Date(dateStr);
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/** Get the start of the week (Monday) for a given date */
function getWeekStart(date: Date | string): Date {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Get the end of the week (Sunday) for a given date */
function getWeekEnd(date: Date | string): Date {
  const monday = getWeekStart(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/** Format date to dd/mm format */
function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/** Format date to YYYY-MM-DD format */
function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


type AccessStatus = "pending" | "allowed" | "denied";

export default function AdhocWorksInvoiceManagementPage() {
  const router = useRouter();
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("pending");
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateISO(new Date()));
  const [data, setData] = useState<AdhocWorksDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("routeName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [mobileSearch, setMobileSearch] = useState("");
  const [selectedServicePartnerId, setSelectedServicePartnerId] = useState('');
  const { servicePartners } = useServicePartners();

  const { user, isLoading: authLoading } = useAuth();

  // Apenas Admin (1) e Supervisor (3) podem aceder. Só renderizamos o conteúdo após confirmar.
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAccessStatus("denied");
      return;
    }

    if (user.roles.includes("admin") || user.roles.includes("supervisor")) {
      setAccessStatus("allowed");
    } else {
      setAccessStatus("denied");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (accessStatus === "denied") {
      router.replace("/home");
    }
  }, [accessStatus, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = getWeekEnd(selectedDate);
      const initialDate = formatDateISO(weekStart);
      const endDate = formatDateISO(weekEnd);

      const spId = selectedServicePartnerId !== '' ? Number(selectedServicePartnerId) : undefined;
      const list = await getAdhocWorks({ initialDate, endDate, servicePartnerId: spId });
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load adhoc works");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedServicePartnerId]);

  useEffect(() => {
    if (accessStatus === "allowed") {
      fetchData();
    }
  }, [accessStatus, fetchData]);

  const handleExport = useCallback(
    async (format: "xlsx" | "pdf" = "xlsx") => {
      setExporting(true);
      try {
        const weekStart = getWeekStart(selectedDate);
        const weekEnd = getWeekEnd(selectedDate);

        if (format === "pdf") {
          // Use frontend PDF export following system standard
          const blob = await exportAdhocWorksToPDF(data, weekStart, weekEnd);
          const filename = `adhoc-works-${formatDateShort(weekStart)}-${formatDateShort(weekEnd)}-${weekStart.getFullYear()}.pdf`;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          // Use backend export for XLSX
          const initialDate = formatDateISO(weekStart);
          const endDate = formatDateISO(weekEnd);
          const { blob, filename } = await exportAdhocWorks({
            initialDate,
            endDate,
            format,
            servicePartnerId: selectedServicePartnerId ? Number(selectedServicePartnerId) : undefined,
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to export adhoc works"
        );
      } finally {
        setExporting(false);
      }
    },
    [selectedDate, data, selectedServicePartnerId]
  );

  const handleSort = useCallback((field: string) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDirection("asc");
      return field;
    });
  }, []);

  const getSortValue = useCallback((row: AdhocWorksDTO, field: string) => {
    switch (field) {
      case "date":
        return row.operation?.date ?? "";
      case "fullName":
        return row.fullName ?? "";
      case "depot":
        return row.operation?.depot ?? "";
      case "routeName":
        return row.operation?.routeName ?? "";
      case "adhocName":
        return row.adhocService?.adhocName ?? "";
      case "adhocCategory":
        return row.adhocCategory?.name ?? "";
      case "adhocReceivedPayment":
        return row.adhocService?.adhocReceivedPayment ?? 0;
      case "adhocVendorPayment":
        return row.adhocService?.adhocVendorPayment ?? 0;
      default:
        return "";
    }
  }, []);

  const spFilteredData = data;

  const sortedData = useMemo(() => {
    if (spFilteredData.length === 0) return spFilteredData;
    const sorted = [...spFilteredData].sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);
      const aNum = typeof aVal === "number" ? aVal : 0;
      const bNum = typeof bVal === "number" ? bVal : 0;
      const aStr = String(aVal ?? "").toLowerCase().trim();
      const bStr = String(bVal ?? "").toLowerCase().trim();
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }
      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [spFilteredData, sortField, sortDirection, getSortValue]);

  const totals = useMemo(() => {
    const totalReceived = spFilteredData.reduce(
      (s, r) => s + (r.adhocService.adhocReceivedPayment ?? 0),
      0
    );
    const totalVendor = spFilteredData.reduce(
      (s, r) => s + (r.adhocService.adhocVendorPayment ?? 0),
      0
    );
    return { totalReceived, totalVendor };
  }, [spFilteredData]);

  const subtitle = useMemo(() => {
    const weekStart = getWeekStart(selectedDate);
    const weekEnd = getWeekEnd(selectedDate);
    return `${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)} ${weekStart.getFullYear()}`;
  }, [selectedDate]);

  const filteredDataForMobile = useMemo(() => {
    if (!mobileSearch.trim()) return sortedData;
    const q = mobileSearch.toLowerCase().trim();
    return sortedData.filter((row) => {
      const fullName = (row.fullName || "").toLowerCase();
      const depot = (row.operation?.depot ?? "").toLowerCase();
      const route = (row.operation?.routeName ?? "").toLowerCase();
      const adhoc = (row.adhocService?.adhocName ?? "").toLowerCase();
      const adhocCategory = (row.adhocCategory?.name ?? "").toLowerCase();
      return fullName.includes(q) || depot.includes(q) || route.includes(q) || adhoc.includes(q) || adhocCategory.includes(q);
    });
  }, [sortedData, mobileSearch]);

  // Week navigation handlers
  const handlePrevWeek = () => {
    const currentDate = parseLocalDate(selectedDate);
    currentDate.setDate(currentDate.getDate() - 7);
    setSelectedDate(formatDateISO(currentDate));
  };

  const handleNextWeek = () => {
    const currentDate = parseLocalDate(selectedDate);
    currentDate.setDate(currentDate.getDate() + 7);
    setSelectedDate(formatDateISO(currentDate));
  };

  const handleTodayWeek = () => {
    setSelectedDate(formatDateISO(new Date()));
  };

  // Month and year selection for week mode
  const currentDateObj = useMemo(() => parseLocalDate(selectedDate), [selectedDate]);
  const monthsForWeek = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2000, i, 1), "MMMM", { locale: enUS }),
  }));

  const currentYearForWeek = currentDateObj.getFullYear();
  const yearsForWeek = Array.from({ length: 10 }, (_, i) => currentYearForWeek - 5 + i);

  const handleMonthChangeWeek = (monthIndex: number) => {
    const newDate = new Date(currentDateObj);
    newDate.setMonth(monthIndex);
    setSelectedDate(formatDateISO(newDate));
  };

  const handleYearChangeWeek = (year: number) => {
    const newDate = new Date(currentDateObj);
    newDate.setFullYear(year);
    setSelectedDate(formatDateISO(newDate));
  };

  // Enquanto verifica acesso ou após negar, não mostrar conteúdo (evita tela em branco ou flash)
  if (accessStatus === "pending" || accessStatus === "denied") {
    return (
      <NavbarWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-600">Checking permissions…</p>
          </div>
        </div>
      </NavbarWrapper>
    );
  }

  return (
    <NavbarWrapper>
      <div className="w-full min-w-0">
        <DgpPageFrame
          width="ultra"
          containerClassName="mx-auto w-full px-0"
          className="font-sans text-slate-800 text-sm"
        >
          <div id="main-content" className="flex-grow flex flex-col min-w-0 relative">
            <div className="hidden md:block">
              <main className="pt-6 space-y-4">
                <div className="mb-4">
                  <ModernPageHeader
                    title=" Management"
                    subtitle={subtitle}
                    gradientFrom="slate-900"
                    gradientTo="indigo-600"
                  />
                </div>

                <div
                  className="
                  bg-gradient-to-br from-white to-gray-50
                  rounded-xl px-6 py-3
                  shadow-md mb-6 border border-gray-200
                  flex flex-wrap items-center justify-between gap-3
                "
                >
                  {/* Week Selector */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrevWeek}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        title="Previous Week"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <select
                        className="border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={currentDateObj.getMonth()}
                        onChange={(e) => handleMonthChangeWeek(Number(e.target.value))}
                      >
                        {monthsForWeek.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>

                      <select
                        className="border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm min-w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={currentDateObj.getFullYear()}
                        onChange={(e) => handleYearChangeWeek(Number(e.target.value))}
                      >
                        {yearsForWeek.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleNextWeek}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        title="Next Week"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleTodayWeek}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-1"
                        title="Today"
                      >
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Today</span>
                      </button>

                      <span className="text-sm font-medium text-slate-700 ml-2">
                        {subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex items-center gap-2 ml-auto">
                    {servicePartners.length > 0 && (
                      <select
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-44"
                        value={selectedServicePartnerId}
                        onChange={(e) => setSelectedServicePartnerId(e.target.value)}
                      >
                        <option value="">All Service Partners</option>
                        {servicePartners.map((sp) => (
                          <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                            {sp.partnerName}
                          </option>
                        ))}
                      </select>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleExport("xlsx")}
                      disabled={exporting || data.length === 0}
                    >
                      {exporting ? "Exporting…" : "Export XLSX"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("pdf")}
                      disabled={exporting || data.length === 0}
                    >
                      Export PDF
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <div
                  className="
                  border border-gray-200 rounded-xl
                  shadow-md bg-white
                  overflow-hidden
                "
                >
                  <div className="overflow-x-auto">
                    <Table className="adhoc-works-table">
                      <TableHeader>
                        <tr>
                          <TableHeaderCell
                            variant="standard"
                            sortable
                            sortDirection={sortField === "date" ? sortDirection : null}
                            onClick={() => handleSort("date")}
                          >
                            Date
                          </TableHeaderCell>
                          <TableHeaderCell
                            variant="standard"
                            sortable
                            sortDirection={sortField === "fullName" ? sortDirection : null}
                            onClick={() => handleSort("fullName")}
                          >
                            Vendor
                          </TableHeaderCell>
                          <TableHeaderCell
                            variant="standard"
                            sortable
                            sortDirection={sortField === "depot" ? sortDirection : null}
                            onClick={() => handleSort("depot")}
                          >
                            Depot
                          </TableHeaderCell>
                          <TableHeaderCell
                            variant="standard"
                            sortable
                            sortDirection={sortField === "routeName" ? sortDirection : null}
                            onClick={() => handleSort("routeName")}
                          >
                            Route
                          </TableHeaderCell>
                          <TableHeaderCell
                            variant="standard"
                            sortable
                            sortDirection={sortField === "adhocName" ? sortDirection : null}
                            onClick={() => handleSort("adhocName")}
                          >
                            Adhoc service
                          </TableHeaderCell>
                          <TableHeaderCell
                            variant="standard"
                            sortable
                            sortDirection={sortField === "adhocCategory" ? sortDirection : null}
                            onClick={() => handleSort("adhocCategory")}
                          >
                            Adhoc category
                          </TableHeaderCell>
                          <TableHeaderCell
                            variant="standard"
                            sortable
                            sortDirection={sortField === "adhocReceivedPayment" ? sortDirection : null}
                            onClick={() => handleSort("adhocReceivedPayment")}
                          >
                            Adhoc received payment
                          </TableHeaderCell>
                          <TableHeaderCell
                            variant="standard"
                            sortable
                            sortDirection={sortField === "adhocVendorPayment" ? sortDirection : null}
                            onClick={() => handleSort("adhocVendorPayment")}
                          >
                            Vendor payment
                          </TableHeaderCell>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-slate-500"
                            >
                              Loading…
                            </TableCell>
                          </TableRow>
                        ) : data.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-slate-500"
                            >
                              No adhoc works for the selected period.
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedData.map((row, index) => (
                            <TableRow
                              key={`${row.operation.operationId}-${row.adhocService.adhocServiceId}-${index}`}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <TableCell className="whitespace-nowrap text-muted-foreground">
                                {formatDateOnly(row.operation?.date)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap font-medium">
                                {row.fullName || "—"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {row.operation?.depot ?? "—"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {row.operation?.routeName ?? "—"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {row.adhocService?.adhocName ?? "—"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-muted-foreground">
                                {row.adhocCategory?.name ?? "—"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap font-medium">
                                {formatCurrency(
                                  row.adhocService?.adhocReceivedPayment
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap font-medium">
                                {formatCurrency(
                                  row.adhocService?.adhocVendorPayment
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      {data.length > 0 && (
                        <TableFooter>
                          <TableRow className="bg-muted/50 font-semibold">
                            <TableCell colSpan={6} className="text-right" />
                            <TableCell className="whitespace-nowrap">
                              {formatCurrency(totals.totalReceived)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatCurrency(totals.totalVendor)}
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      )}
                    </Table>
                  </div>
                </div>
              </main>
            </div>

            <MobilePageShell
              title=" Management"
              subtitle={subtitle}
              searchPlaceholder="Pesquisar motorista, depot, rota, serviço..."
              searchValue={mobileSearch}
              onSearchChange={setMobileSearch}
            >
              {servicePartners.length > 0 && (
                <div className="flex justify-start px-1 pb-2">
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56"
                    value={selectedServicePartnerId}
                    onChange={(e) => setSelectedServicePartnerId(e.target.value)}
                  >
                    <option value="">All Service Partners</option>
                    {servicePartners.map((sp) => (
                      <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                        {sp.partnerName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <div className="border border-gray-200 rounded-xl shadow-md bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="adhoc-works-table">
                    <TableHeader>
                      <tr>
                        <TableHeaderCell variant="standard">Date</TableHeaderCell>
                        <TableHeaderCell variant="standard">Vendor</TableHeaderCell>
                        <TableHeaderCell variant="standard">Depot</TableHeaderCell>
                        <TableHeaderCell variant="standard">Route</TableHeaderCell>
                        <TableHeaderCell variant="standard">Adhoc</TableHeaderCell>
                        <TableHeaderCell variant="standard">Received</TableHeaderCell>
                        <TableHeaderCell variant="standard">Vendor</TableHeaderCell>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            Loading…
                          </TableCell>
                        </TableRow>
                      ) : filteredDataForMobile.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            {mobileSearch.trim() ? "Nenhum resultado para a pesquisa." : "No adhoc works for the selected period."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDataForMobile.map((row, index) => (
                          <TableRow
                            key={`${row.operation.operationId}-${row.adhocService.adhocServiceId}-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                              {formatDateOnly(row.operation?.date)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-medium text-xs">
                              {row.fullName || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs">{row.operation?.depot ?? "—"}</TableCell>
                            <TableCell className="whitespace-nowrap text-xs">{row.operation?.routeName ?? "—"}</TableCell>
                            <TableCell className="whitespace-nowrap text-xs">{row.adhocService?.adhocName ?? "—"}</TableCell>
                            <TableCell className="whitespace-nowrap text-xs font-medium">
                              {formatCurrency(row.adhocService?.adhocReceivedPayment)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs font-medium">
                              {formatCurrency(row.adhocService?.adhocVendorPayment)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    {filteredDataForMobile.length > 0 && (
                      <TableFooter>
                        <TableRow className="bg-muted/50 font-semibold text-xs">
                          <TableCell colSpan={5} className="text-right" />
                          <TableCell>{formatCurrency(filteredDataForMobile.reduce((s, r) => s + (r.adhocService?.adhocReceivedPayment ?? 0), 0))}</TableCell>
                          <TableCell>{formatCurrency(filteredDataForMobile.reduce((s, r) => s + (r.adhocService?.adhocVendorPayment ?? 0), 0))}</TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                </div>
              </div>
            </MobilePageShell>
          </div>
        </DgpPageFrame>
      </div>
    </NavbarWrapper>
  );
}


