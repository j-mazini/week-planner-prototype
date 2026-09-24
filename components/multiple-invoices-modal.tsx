"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { SearchableCombobox, type ComboboxItem } from "@/app/(private)/week-planner/components/Common/SearchableCombobox";
import { useServicePartnerById } from "@/hooks/useServicePartnerById";
import { parseServicePartnerId } from "@/lib/service-partner-utils";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ChevronLeft, ChevronRight, User, Calendar, FileWarning, ChevronDown } from "lucide-react";
import { getUserIdFromToken, hasAuthSession, getBearerAuthHeader } from "@/lib/auth"
import { formatVendorId } from "@/lib/utils";
import { guardedFetch } from "@/lib/in-flight-guard";

interface MultipleInvoicesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoicesCreated?: () => void;
  initialYear?: number;
  /** Quando true, permite aprovar/criar invoice mesmo com is_spms = false */
  skipSpmsValidation?: boolean;
  /** Quando definido, restringe os couriers disponíveis aos userIds do Service Partner selecionado */
  allowedUserIds?: Set<number>;
  /** Service Partner ID herdado do filtro da page (reaproveitado para filtrar couriers). */
  selectedServicePartnerId?: string;
}

interface User {
  userId: number;
  userCode: string | null;
  userName: string;
  userLastName: string;
}

interface InvoiceDetail {
  date: string;
  route: string;
  amount: number;
  vat: number | null;
  vatPercentage: number | null;
  description: string;
  operationId: number;
  isSpms: boolean | null;
}

interface GroupedDetail {
  date: string;
  routes: { description: string; amount: number; operationId: number; isSpms: boolean | null }[];
  totalAmount: number;
  vat: number | null;
  vatPercentage: number | null;
  hasUnverifiedRoutes?: boolean;
}

interface VendorData {
  vendorId: number;
  name: string;
  vendorCode: string | null;
  vendorStreet: string;
  vendorCity: string;
  vendorPostalCode: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorVatNumber: string | null;
  servicePartnerId?: number | null;
}

interface UserData {
  userId: number;
  name: string;
  lastName: string;
  email: string;
  phone: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
}

interface CompanyData {
  companyId: number;
  companyName: string;
  companyStreet: string;
  companyCity: string;
  companyPostalCode: string;
  companyPhone: string | null;
  companyEmail: string;
  companyVatNumber: string;
}

interface InvoiceData {
  referenceMonth: number;
  referenceYear: number;
  invoiceNumber: string;
  description: string;
  dueDate: string;
  paymentTerms: string;
  totalStops: number;
  totalVat: number;
  totalOtherDeductions: number;
  totalLiquidationDamageDeductions: number;
  totalPrePaymentDeductions: number;
  totalFixDamageDeductions: number;
  totalTrafficPenaltyDeductions: number;
  totalOperationsManagement: number;
  totalDetails: number;
  totalDeductions: number;
  subTotal: number;
  total: number;
  referenceDate: string;
  company: CompanyData;
  vendor: VendorData;
  user: UserData;
  details: {
    operationId: number;
    date: string;
    description: string;
    stops: number;
    rate: number;
    routeSort: number;
    adhocSort: number;
    extra: number;
    vatPercentage: number;
    totalRate: number;
    total: number;
    isSpms: boolean | null;
  }[];
}

interface InvoicePreview {
  userId: number;
  userName: string;
  userLastName: string;
  userCode: string | null;
  invoiceNumber: string;
  details: GroupedDetail[];
  totalAmount: number;
  totalVat: number;
  grandTotal: number;
  approved: boolean;
  vendorData?: VendorData;
  userData?: UserData;
  companyData?: CompanyData;
  invoiceData?: InvoiceData;
  hasInvoiceData?: boolean;
  excludedCount?: number;
}

interface BulkInvoiceResponse {
  total: number;
  successful: number;
  failed: number;
  createdInvoiceIds: number[];
  results: {
    invoiceNumber: string;
    invoiceId: number;
    userId: number;
    success: boolean;
  }[];
}

const currentYear = new Date().getFullYear();
// Generate years array (current year and 2 years back)
const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

const months: { value: string; label: string; full: string }[] = [
  { value: "1", label: "Jan", full: "January" },
  { value: "2", label: "Feb", full: "February" },
  { value: "3", label: "Mar", full: "March" },
  { value: "4", label: "Apr", full: "April" },
  { value: "5", label: "May", full: "May" },
  { value: "6", label: "Jun", full: "June" },
  { value: "7", label: "Jul", full: "July" },
  { value: "8", label: "Aug", full: "August" },
  { value: "9", label: "Sep", full: "September" },
  { value: "10", label: "Oct", full: "October" },
  { value: "11", label: "Nov", full: "November" },
  { value: "12", label: "Dec", full: "December" },
];

// Function to generate invoice number from name and date
const generateInvoiceNumber = (
  firstName: string,
  lastName: string,
  month: string,
  year: number
): string => {
  // Get initials from first and last name
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();

  // Format: YYYYMMDD-XX (year, month, day, initials)
  const monthPadded = month.padStart(2, '0');
  const dayPadded = '01'; // Using first day of the month as default
  return `${year}${monthPadded}${dayPadded}-${firstInitial}${lastInitial}`;
};

// Function to group details by date (keep individual routes but group by date)
const groupDetailsByDate = (details: InvoiceDetail[]): GroupedDetail[] => {
  const grouped = new Map<string, GroupedDetail>();

  details.forEach(detail => {
    const existing = grouped.get(detail.date);

    if (existing) {
      // If date already exists, add route and sum amounts
      existing.routes.push({
        description: detail.description,
        amount: detail.amount,
        operationId: detail.operationId,
        isSpms: detail.isSpms
      });
      existing.totalAmount += detail.amount;
      if (detail.vat !== null && existing.vat !== null) {
        existing.vat += detail.vat;
      }
    } else {
      // New date entry
      grouped.set(detail.date, {
        date: detail.date,
        routes: [{
          description: detail.description,
          amount: detail.amount,
          operationId: detail.operationId,
          isSpms: detail.isSpms
        }],
        totalAmount: detail.amount,
        vat: detail.vat,
        vatPercentage: detail.vatPercentage
      });
    }
  });

  // After grouping, mark if any route in the group is not SPMS-validated
  // (null/undefined should be treated as unverified too)
  const result = Array.from(grouped.values()).map(group => ({
    ...group,
    hasUnverifiedRoutes: group.routes.some(route => route.isSpms !== true)
  }));

  return result.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export default function MultipleInvoicesModal({
  open,
  onOpenChange,
  onInvoicesCreated,
  initialYear,
  skipSpmsValidation = false,
  allowedUserIds,
  selectedServicePartnerId = '',
}: MultipleInvoicesModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(initialYear || currentYear);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoicePreviews, setInvoicePreviews] = useState<InvoicePreview[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [monthStats, setMonthStats] = useState<Record<string, { generated: number; total: number }>>({});
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const monthDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const [monthDropdownPosition, setMonthDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const yearItems = useMemo<ComboboxItem[]>(() => {
    return years.map((y) => ({
      value: y.toString(),
      label: y.toString(),
    }));
  }, []);

  // Fetch available months + invoice stats for % display (same as New Invoice modal)
  useEffect(() => {
    if (open) {
      const fetchMonthsAndStats = async () => {
        if (!hasAuthSession()) return;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        setAvailableMonths([currentMonth.toString()]);
        setIsLoadingMonths(true);

        try {
          const monthsToCheck: { month: number; year: number }[] = [];
          if (selectedYear === currentYear) {
            for (let m = currentMonth; m >= 1; m--) {
              monthsToCheck.push({ month: m, year: selectedYear });
            }
          } else if (selectedYear < currentYear) {
            for (let m = 12; m >= 1; m--) {
              monthsToCheck.push({ month: m, year: selectedYear });
            }
          } else {
            monthsToCheck.push({ month: currentMonth, year: selectedYear });
          }

          const adminUserId = getUserIdFromToken() ?? 1;

          const fetchConfig = {
            headers: {
              "Content-Type": "application/json",
              ...getBearerAuthHeader(),
              "Cache-Control": "no-cache, no-store",
            },
            cache: "no-store" as RequestCache,
          };

          const stats: Record<string, { generated: number; total: number }> = {};
          const monthsWithVendorsSet = new Set<string>([currentMonth.toString()]);

          await Promise.all(
            monthsToCheck.map(async ({ month, year }) => {
              try {
                const [withoutRes, invoicesRes] = await Promise.all([
                  guardedFetch(
                    `${getApiBaseUrl()}/bff/users/by-company/1/without-invoice?month=${month}&year=${year}`,
                    fetchConfig
                  ),
                  guardedFetch(
                    `${getApiBaseUrl()}/bff/invoices?month=${month}&year=${year}&userId=${adminUserId}`,
                    fetchConfig
                  ),
                ]);

                let withoutCount = 0;
                if (withoutRes.ok) {
                  const data = await withoutRes.json();
                  withoutCount = data.users && Array.isArray(data.users) ? data.users.length : 0;
                }

                let generated = 0;
                if (invoicesRes.ok) {
                  const data = await invoicesRes.json();
                  const list = Array.isArray(data) ? data : data?.invoices ?? data?.data ?? [];
                  generated = Array.isArray(list) ? list.length : 0;
                }

                const total = generated + withoutCount;
                stats[`${year}-${month}`] = { generated, total };

                if (
                  withoutCount > 0 ||
                  (selectedYear === currentYear && month === currentMonth)
                ) {
                  monthsWithVendorsSet.add(month.toString());
                }
              } catch (error) {
                console.error(`Error checking month ${month}:`, error);
              }
            })
          );

          if (
            selectedYear === currentYear &&
            !monthsWithVendorsSet.has(currentMonth.toString())
          ) {
            monthsWithVendorsSet.add(currentMonth.toString());
          }

          setMonthStats(stats);
          setAvailableMonths(Array.from(monthsWithVendorsSet));
        } catch (error) {
          console.error("Error fetching months:", error);
          const now2 = new Date();
          setAvailableMonths([(now2.getMonth() + 1).toString()]);
        } finally {
          setIsLoadingMonths(false);
        }
      };

      fetchMonthsAndStats();
    }
  }, [open, selectedYear]);

  // Calculate month dropdown position when it opens
  useEffect(() => {
    if (isMonthDropdownOpen && monthDropdownButtonRef.current) {
      const updatePosition = () => {
        if (monthDropdownButtonRef.current) {
          const rect = monthDropdownButtonRef.current.getBoundingClientRect();
          setMonthDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();

      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      const modalContent = document.querySelector('[role="dialog"]');
      if (modalContent) {
        modalContent.addEventListener('scroll', handleScroll, true);
      }

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
        if (modalContent) {
          modalContent.removeEventListener('scroll', handleScroll, true);
        }
      };
    } else {
      setMonthDropdownPosition(null);
    }
  }, [isMonthDropdownOpen]);

  // Close dropdowns when modal closes
  useEffect(() => {
    if (!open) {
      setIsMonthDropdownOpen(false);
      setMonthDropdownPosition(null);
    }
  }, [open]);

  // Keep selected month valid when available months change
  useEffect(() => {
    if (selectedMonth && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth("");
    }
  }, [selectedMonth, availableMonths]);

  // Update selectedYear when initialYear prop changes
  useEffect(() => {
    if (initialYear && initialYear !== selectedYear) {
      setSelectedYear(initialYear);
      setSelectedMonth(""); // Reset month when year changes
    }
  }, [initialYear, selectedYear]);

  const fetchInvoiceDataForAllUsers = useCallback(async (usersList: User[]) => {
    try {
      // Check if there are any users to process
      if (!usersList || usersList.length === 0) {
        setError("No invoices found");
        return;
      }

      // Extract all userIds from the users list
      const userIds = usersList.map(user => user.userId);

      // Make bulk request to get data for all users at once
      const url = `${getApiBaseUrl()}/bff/invoices/bulk-create-data?month=${selectedMonth}&year=${selectedYear}`;

      const response = await guardedFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getBearerAuthHeader(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        cache: "no-store",
        body: JSON.stringify(userIds),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);

        // Handle specific error cases
        if (response.status === 400) {
          setError("No invoices found");
          return;
        }

        throw new Error(`Failed to fetch bulk invoice data: ${response.status} ${response.statusText}`);
      }

      const bulkData = await response.json();

      // Transform bulk data to individual invoice previews
      const previews: InvoicePreview[] = [];
      const processedUserIds = new Set<number>();
      const fallbackUserIds = new Set<number>();

      // API returns an object with results array
      // Each result has userId, success, and data
      if (bulkData.results && Array.isArray(bulkData.results)) {
        for (const result of bulkData.results) {
          // Skip failed results
          if (!result.success || !result.data) {
            console.warn(`Skipping failed result for userId ${result.userId}`);
            fallbackUserIds.add(result.userId);
            continue;
          }

          // Find the corresponding user info
          const user = usersList.find(u => u.userId === result.userId);
          if (!user) {
            console.warn(`User not found for userId ${result.userId}`);
            continue;
          }
          const invoiceData = result.data;

          // If bulk returns no route details, force fallback to single create-data request
          // to ensure we can populate with per-user data when available.
          const detailsCount = Array.isArray(invoiceData.details) ? invoiceData.details.length : 0;
          if (detailsCount === 0) {
            console.warn(`Bulk returned empty details for userId ${result.userId}. Running fallback request.`);
            fallbackUserIds.add(result.userId);
            continue;
          }

          processedUserIds.add(user.userId);

          // Clean invoiceNumber by removing "null" if present
          let cleanInvoiceNumber = invoiceData.invoiceNumber;
          if (typeof cleanInvoiceNumber === 'string' && cleanInvoiceNumber.includes("null")) {
            cleanInvoiceNumber = cleanInvoiceNumber.replace("null", "");
          }

          // Check if invoice has VAT (use invoiceData.totalVat to determine)
          const hasVat = invoiceData.totalVat > 0;

          // Transform details to simplified format with VAT calculation
          const details: InvoiceDetail[] = (invoiceData.details || []).map((detail: {
            date: string;
            description: string;
            total: number | string;
            vatPercentage: number | null;
            operationId: number;
            isSpms: boolean | null;
          }) => {
            // Extract route name from description (remove "ROUTE COST ID: " prefix)
            let routeName = detail.description || `Operation ${detail.operationId}`;
            if (routeName.includes("ROUTE COST ID: ")) {
              routeName = routeName.replace("ROUTE COST ID: ", "");
            }

            return {
              date: detail.date,
              route: routeName,
              description: routeName,
              amount: typeof detail.total === 'string' ? parseFloat(detail.total) : (detail.total || 0),
              vat: hasVat ? (typeof detail.total === 'string' ? parseFloat(detail.total) : detail.total) * 0.20 : null,
              vatPercentage: hasVat ? 20 : null,
              operationId: detail.operationId || 0,
              isSpms: detail.isSpms
            };
          });

          // SPMS ON: show all items (block at approval if any item is not SPMS-validated)
          // SPMS OFF: show all items and allow creating the invoice
          const filteredDetails = details;
          const excludedCount = 0;

          // Group details by date
          const groupedDetails = groupDetailsByDate(filteredDetails);

          // Calculate totals
          const totalAmount = groupedDetails.reduce((sum, d) => sum + d.totalAmount, 0);
          const totalVat = groupedDetails.reduce((sum, d) => sum + (d.vat || 0), 0);
          const grandTotal = totalAmount + totalVat;

          // Generate invoice number
          const invoiceNumber = generateInvoiceNumber(
            user.userName,
            user.userLastName,
            selectedMonth,
            selectedYear
          );

          previews.push({
            userId: user.userId,
            userName: user.userName,
            userLastName: user.userLastName,
            userCode: user.userCode,
            invoiceNumber,
            details: groupedDetails,
            totalAmount,
            totalVat,
            grandTotal,
            approved: false,
            hasInvoiceData: true,
            excludedCount,
            // Store additional data from API for display
            vendorData: invoiceData.vendor,
            userData: invoiceData.user,
            companyData: invoiceData.company,
            invoiceData: invoiceData,
          });
        }
      }

      // Fallback for users not returned by bulk endpoint or returned with empty data.
      const missingUsers = usersList.filter(
        (user) => !processedUserIds.has(user.userId) || fallbackUserIds.has(user.userId)
      );
      if (missingUsers.length > 0) {
        console.warn(`Bulk endpoint returned incomplete data for ${missingUsers.length} user(s). Running fallback requests.`);
        const fallbackResults = await Promise.allSettled(
          missingUsers.map(async (user) => {
            const fallbackResponse = await guardedFetch(
              `${getApiBaseUrl()}/bff/invoices/create-data?userId=${user.userId}&month=${selectedMonth}&year=${selectedYear}`,
              {
                headers: {
                  ...getBearerAuthHeader(),
                  "Cache-Control": "no-cache, no-store, must-revalidate",
                  "Pragma": "no-cache",
                  "Expires": "0",
                },
                cache: "no-store",
              }
            );

            if (!fallbackResponse.ok) return null;
            const data = await fallbackResponse.json();
            return { user, data };
          })
        );

        for (const result of fallbackResults) {
          if (result.status !== "fulfilled" || !result.value?.data) continue;
          const { user, data: invoiceData } = result.value;

          const hasVat = invoiceData.totalVat > 0;
          const details: InvoiceDetail[] = (invoiceData.details || []).map((detail: {
            date: string;
            description: string;
            total: number | string;
            vatPercentage: number | null;
            operationId: number;
            isSpms: boolean | null;
          }) => {
            let routeName = detail.description || `Operation ${detail.operationId}`;
            if (routeName.includes("ROUTE COST ID: ")) {
              routeName = routeName.replace("ROUTE COST ID: ", "");
            }

            return {
              date: detail.date,
              route: routeName,
              description: routeName,
              amount: typeof detail.total === 'string' ? parseFloat(detail.total) : (detail.total || 0),
              vat: hasVat ? (typeof detail.total === 'string' ? parseFloat(detail.total) : detail.total) * 0.20 : null,
              vatPercentage: hasVat ? 20 : null,
              operationId: detail.operationId || 0,
              isSpms: detail.isSpms
            };
          });

          // SPMS ON: show all items (block at approval if any item is not SPMS-validated)
          // SPMS OFF: show all items and allow creating the invoice
          const filteredFallbackDetails = details;
          const fallbackExcludedCount = 0;

          const groupedDetails = groupDetailsByDate(filteredFallbackDetails);
          const totalAmount = groupedDetails.reduce((sum, d) => sum + d.totalAmount, 0);
          const totalVat = groupedDetails.reduce((sum, d) => sum + (d.vat || 0), 0);
          const grandTotal = totalAmount + totalVat;
          const invoiceNumber = generateInvoiceNumber(
            user.userName,
            user.userLastName,
            selectedMonth,
            selectedYear
          );

          previews.push({
            userId: user.userId,
            userName: user.userName,
            userLastName: user.userLastName,
            userCode: user.userCode,
            invoiceNumber,
            details: groupedDetails,
            totalAmount,
            totalVat,
            grandTotal,
            approved: false,
            hasInvoiceData: true,
            excludedCount: fallbackExcludedCount,
            vendorData: invoiceData.vendor,
            userData: invoiceData.user,
            companyData: invoiceData.company,
            invoiceData,
          });
        }
      }

      // If some users still have no preview, create placeholder items so they are visible in the flow.
      const previewUserIds = new Set(previews.map(preview => preview.userId));
      const usersWithoutPreview = usersList.filter(user => !previewUserIds.has(user.userId));
      for (const user of usersWithoutPreview) {
        previews.push({
          userId: user.userId,
          userName: user.userName,
          userLastName: user.userLastName,
          userCode: user.userCode,
          invoiceNumber: generateInvoiceNumber(
            user.userName,
            user.userLastName,
            selectedMonth,
            selectedYear
          ),
          details: [],
          totalAmount: 0,
          totalVat: 0,
          grandTotal: 0,
          approved: false,
          hasInvoiceData: false,
        });
      }

      previews.sort((a, b) => {
        const nameA = `${a.userName} ${a.userLastName}`.toLowerCase();
        const nameB = `${b.userName} ${b.userLastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setInvoicePreviews(previews);
      if (previews.length > 0) {
        setCurrentStep(0);
      } else {
        setError("No users with available data for invoices found.");
      }
    } catch (error) {
      console.error("Error fetching bulk invoice data:", error);
      setError(error instanceof Error ? error.message : "Failed to load invoice data. Please try again.");
    }
  }, [selectedMonth, selectedYear]);

  const fetchUsersWithoutInvoice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const spParam = selectedServicePartnerId ? `&servicePartnerId=${selectedServicePartnerId}` : '';
      const url = `${getApiBaseUrl()}/bff/users/by-company/1/without-invoice?month=${selectedMonth}&year=${selectedYear}${spParam}`;

      const response = await guardedFetch(url, {
        headers: {
          ...getBearerAuthHeader(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.users || !Array.isArray(data.users)) {
        throw new Error('Invalid response format from server');
      }

      let transformedUsers = data.users.map((user: {
        userId: number;
        userCode: string | null;
        userName: string;
        userLastName: string;
      }) => ({
        userId: user.userId,
        userCode: user.userCode,
        userName: user.userName,
        userLastName: user.userLastName
      }));

      if (allowedUserIds) {
        transformedUsers = transformedUsers.filter((u: User) => allowedUserIds.has(u.userId));
      }

      // Sort by name and last name
      transformedUsers.sort((a: User, b: User) => {
        const nameA = `${a.userName} ${a.userLastName}`.toLowerCase();
        const nameB = `${b.userName} ${b.userLastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      // Fetch invoice data for all users
      await fetchInvoiceDataForAllUsers(transformedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error instanceof Error ? error.message : "Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, fetchInvoiceDataForAllUsers, allowedUserIds, selectedServicePartnerId]);

  useEffect(() => {
    if (open && selectedMonth && availableMonths.includes(selectedMonth)) {
      fetchUsersWithoutInvoice();
    }
  }, [open, selectedMonth, availableMonths, fetchUsersWithoutInvoice]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      // Format as DD/MM/YYYY using UTC to avoid local-timezone day rollback
      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };


  const hasNoEligibleDetails = (invoicePreview: InvoicePreview) => {
    if (invoicePreview.hasInvoiceData !== true) return false;
    if (!skipSpmsValidation) {
      // SPMS ON: ineligible if any route lacks SPMS validation
      return Array.isArray(invoicePreview.details) &&
        invoicePreview.details.some(d => d.hasUnverifiedRoutes === true);
    }
    // SPMS OFF: all items are eligible; do not block creation
    return false;
  };

  const hasUsableInvoiceData = (invoicePreview: InvoicePreview) => {
    if (invoicePreview.hasInvoiceData === false) return false;
    const hasDetails = Array.isArray(invoicePreview.details) && invoicePreview.details.length > 0;
    const hasDeductions = (invoicePreview.invoiceData?.totalDeductions || 0) > 0;
    const hasAmounts = invoicePreview.totalAmount > 0 || invoicePreview.totalVat > 0 || invoicePreview.grandTotal > 0;
    return hasDetails || hasDeductions || hasAmounts;
  };

  const getValidationMessage = (invoicePreview: InvoicePreview) => {
    if (!hasUsableInvoiceData(invoicePreview)) {
      return "Cannot approve invoice: no invoice data available for this user in the selected month.";
    }
    if (hasNoEligibleDetails(invoicePreview)) {
      return "Cannot approve invoice: no eligible operations for the current SPMS configuration.";
    }
    return null;
  };

  const getSpmsInfoMessage = (invoicePreview: InvoicePreview) => {
    // Only show info banner when SPMS is OFF and some items were excluded
    if (!skipSpmsValidation) return null;
    const excluded = invoicePreview.excludedCount ?? 0;
    if (excluded === 0) return null;
    return `${excluded} item(s) excluded — SPMS validation OFF: all operations are included.`;
  };

  const handleApprove = () => {
    if (currentStep < invoicePreviews.length) {
      const updatedPreviews = [...invoicePreviews];
      updatedPreviews[currentStep].approved = true;
      setInvoicePreviews(updatedPreviews);
    }
  };

  const handleUnapprove = () => {
    if (currentStep < invoicePreviews.length) {
      const updatedPreviews = [...invoicePreviews];
      updatedPreviews[currentStep].approved = false;
      setInvoicePreviews(updatedPreviews);
    }
  };

  const handleNext = () => {
    if (currentStep < invoicePreviews.length - 1) {
      setCurrentStep(currentStep + 1);
      // Scroll to top of modal
      if (dialogContentRef.current) {
        dialogContentRef.current.scrollTop = 0;
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll to top of modal
      if (dialogContentRef.current) {
        dialogContentRef.current.scrollTop = 0;
      }
    }
  };

  const handleCreateInvoices = async () => {
    setIsCreating(true);
    setError(null);

    const approvedInvoices = invoicePreviews.filter(inv => inv.approved);

    if (approvedInvoices.length === 0) {
      setError("Please approve at least one invoice before creating.");
      setIsCreating(false);
      return;
    }

    try {
      // Reuse the invoice data already fetched (and fallback-recovered) during the preview
      // step instead of re-querying bulk-create-data here. That endpoint can return empty
      // `details` for some users, and re-fetching raw here would silently drop their details
      // from the final payload even though the preview showed them correctly.
      const invoicesToCreate = approvedInvoices
        .filter((preview) => preview.invoiceData)
        .map((preview) => {
          const invoiceData = preview.invoiceData!;

          // Calculate correct values
          const subtotal = invoiceData.details?.reduce((sum, detail) => {
            const total = typeof detail.total === 'number' ? detail.total : parseFloat(detail.total);
            return sum + (total || 0);
          }, 0) || 0;

          const hasVat = invoiceData.totalVat > 0;
          const vat = hasVat ? subtotal * 0.20 : 0;
          const invoiceTotal = subtotal + vat;

          // Generate correct invoice number (YYYYMMDD-XX format)
          const userName = invoiceData.user?.name || invoiceData.vendor?.name || '';
          const userLastName = invoiceData.user?.lastName || '';
          const userId = invoiceData.user?.userId || invoiceData.vendor?.vendorId || 0;
          const firstInitial = userName.charAt(0).toUpperCase();
          const lastInitial = userLastName.charAt(0).toUpperCase();
          const monthPadded = selectedMonth.padStart(2, '0');
          const dayPadded = '01'; // First day of month
          const invoiceNumber = `${selectedYear}${monthPadded}${dayPadded}-${firstInitial}${lastInitial}`;

          // Generate correct description
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const monthIndex = parseInt(selectedMonth) - 1;
          const monthName = monthNames[monthIndex];
          const description = `Monthly delivery services for ${monthName} ${selectedYear}`;

          // Generate vendor code using utility function
          const vendorCode = formatVendorId(userName, userLastName, userId);

          // Ensure referenceDate is valid - use last day of selected month if not available
          let referenceDate = invoiceData.referenceDate;
          if (!referenceDate || referenceDate === 'null' || referenceDate === '') {
            const year = selectedYear;
            const month = parseInt(selectedMonth);
            // Get last day of the month
            const lastDay = new Date(year, month, 0).getDate();
            const monthPadded = selectedMonth.padStart(2, '0');
            const dayPadded = lastDay.toString().padStart(2, '0');
            referenceDate = `${year}-${monthPadded}-${dayPadded}`;
          }

          // Calculate correct invoiceDate and dueDate
          const year = selectedYear;
          const month = parseInt(selectedMonth);

          // Invoice Date: last day of selected month
          const lastDay = new Date(year, month, 0).getDate();
          const invoiceDate = `${year}-${selectedMonth.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

          // Due Date: day 15 of next month
          const nextMonth = month === 12 ? 1 : month + 1;
          const nextYear = month === 12 ? year + 1 : year;
          const dueDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-15`;

          // Calculate balance due
          const balanceDue = invoiceTotal - (invoiceData.totalDeductions || 0);

          // Build invoice payload matching the single invoice structure
          const invoicePayload: Record<string, unknown> = {
            // Basic invoice information
            invoiceNumber,
            description,
            invoiceDate: invoiceDate,
            dueDate: dueDate,
            paymentTerms: invoiceData.paymentTerms || "",
            referenceMonth: parseInt(selectedMonth),
            referenceYear: selectedYear,
            referenceDate: referenceDate,

            // Financial fields
            totalStops: invoiceData.totalStops || 0,
            totalVat: vat,
            totalOtherDeductions: invoiceData.totalOtherDeductions || 0,
            totalLiquidationDamageDeductions: invoiceData.totalLiquidationDamageDeductions || 0,
            totalPrePaymentDeductions: invoiceData.totalPrePaymentDeductions || 0,
            totalFixDamageDeductions: invoiceData.totalFixDamageDeductions || 0,
            totalTrafficPenaltyDeductions: invoiceData.totalTrafficPenaltyDeductions || 0,
            totalOperationsManagement: invoiceData.totalOperationsManagement || 0,
            totalDetails: invoiceTotal, // Invoice Total (Subtotal + VAT)
            totalDeductions: invoiceData.totalDeductions || 0,
            subTotal: subtotal,
            total: balanceDue, // Balance Due = Invoice Total - Deductions

            userId: Number(userId),

            // Company information
            company: invoiceData.company ? {
              companyName: invoiceData.company.companyName || "",
              companyStreet: invoiceData.company.companyStreet || "",
              companyCity: invoiceData.company.companyCity || "",
              companyPostalCode: invoiceData.company.companyPostalCode || "",
              companyPhone: invoiceData.company.companyPhone || "",
              companyEmail: invoiceData.company.companyEmail || "",
              companyVatNumber: invoiceData.company.companyVatNumber || ""
            } : undefined,

            // Vendor information
            vendor: invoiceData.vendor ? {
              vendorId: invoiceData.vendor.vendorId,
              name: invoiceData.vendor.name || "",
              vendorCode: vendorCode || invoiceData.vendor.vendorCode || "",
              vendorStreet: invoiceData.vendor.vendorStreet || "",
              vendorCity: invoiceData.vendor.vendorCity || "",
              vendorPostalCode: invoiceData.vendor.vendorPostalCode || "",
              vendorPhone: invoiceData.vendor.vendorPhone || "",
              vendorEmail: invoiceData.vendor.vendorEmail || "",
              vendorVatNumber: invoiceData.vendor.vendorVatNumber || "",
              servicePartnerId: invoiceData.vendor.servicePartnerId ?? null,
            } : undefined,

            // Details processed
            details: (invoiceData.details || []).map((detail: {
              invoiceDetailId?: number;
              operationId: number;
              date: string;
              description: string;
              stops: number;
              rate: number | string;
              total: number | string;
              routeSort: number | string;
              adhocSort: number | string;
              extra: number | string;
              vatPercentage: number;
              totalRate: number;
            }) => ({
              invoiceDetailId: detail.invoiceDetailId,
              operationId: detail.operationId || 0,
              date: detail.date || new Date().toISOString(),
              description: detail.description || `Operation ${detail.operationId}`,
              stops: detail.stops || 0,
              rate: typeof detail.rate === 'string' ? parseFloat(detail.rate) : (detail.rate || 0),
              total: typeof detail.total === 'string' ? parseFloat(detail.total) : (detail.total || 0),
              routeSort: typeof detail.routeSort === 'string' ? parseFloat(detail.routeSort) : (detail.routeSort || 0),
              adhocSort: typeof detail.adhocSort === 'string' ? parseFloat(detail.adhocSort) : (detail.adhocSort || 0),
              extra: typeof detail.extra === 'string' ? parseFloat(detail.extra) : (detail.extra || 0),
              vatPercentage: detail.vatPercentage,
              totalRate: detail.totalRate
            }))
          };

          // Remove undefined values
          Object.keys(invoicePayload).forEach(key => {
            if (invoicePayload[key] === undefined) {
              delete invoicePayload[key];
            }
          });

          return invoicePayload;
        }) || [];

      if (invoicesToCreate.length === 0) {
        throw new Error("No valid invoice data found for creation.");
      }

      // Create invoices in bulk
      const createResponse = await guardedFetch(
        `${getApiBaseUrl()}/bff/invoices/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getBearerAuthHeader(),
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
          cache: "no-store",
          body: JSON.stringify({ invoices: invoicesToCreate }),
        }
      );

      if (!createResponse.ok) {
        let errorMessage = `Failed to create bulk invoices: ${createResponse.status} ${createResponse.statusText}`;
        try {
          const errorData = await createResponse.json();
          console.error('Error response from API:', errorData);
          errorMessage = errorData.message || errorData.error || errorData.details || errorMessage;

          // If there are validation errors, include them
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage += `\nValidation errors: ${errorData.errors.join(', ')}`;
          }
        } catch (_parseError) {
          // If we can't parse the error response, try to get text
          try {
            const errorText = await createResponse.text();
            console.error('Error response text:', errorText);
            if (errorText) {
              errorMessage += `\n${errorText}`;
            }
          } catch (_textError) {
            console.error('Could not parse error response');
          }
        }
        throw new Error(errorMessage);
      }

      const result: BulkInvoiceResponse = await createResponse.json();

      // Show success result
      if (result.successful > 0) {
        if (onInvoicesCreated) {
          onInvoicesCreated();
        }
        handleClose();
      }

      // Show any failures
      if (result.failed > 0) {
        setError(`Created ${result.successful} invoice(s) successfully, but ${result.failed} failed.`);
      }

    } catch (error) {
      console.error("Error creating invoices:", error);
      setError(error instanceof Error ? error.message : "Failed to create invoices. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSelectedMonth("");
    setInvoicePreviews([]);
    setCurrentStep(0);
    setError(null);
    onOpenChange(false);
  };

  const currentInvoice = invoicePreviews[currentStep];
  const approvedCount = invoicePreviews.filter(inv => inv.approved).length;

  const spId = useMemo(() => {
    if (!currentInvoice) return null;
    return parseServicePartnerId(currentInvoice.vendorData?.servicePartnerId);
  }, [currentInvoice]);

  const { servicePartner } = useServicePartnerById(spId);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        [data-radix-dialog-content][data-state="open"] {
          animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        [data-radix-dialog-content][data-state="closed"] {
          animation: modalSlideOut 0.2s cubic-bezier(0.4, 0, 1, 1) !important;
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes modalSlideOut {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.96);
          }
        }
      `}} />
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          ref={dialogContentRef}
          className="w-[95vw] max-w-4xl max-h-[98vh] lg:max-h-[98vh] overflow-y-auto p-2 sm:p-6"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              New Multiple Invoices
            </DialogTitle>
          </DialogHeader>

          {invoicePreviews.length === 0 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Month & Year
                </label>

                {/* Year and Month selection - aligned */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  {/* Year Select */}
                   <div className="w-full sm:w-auto">
                    <label className="text-xs text-muted-foreground mb-1 block">Year</label>
                    <SearchableCombobox
                      items={yearItems}
                      value={selectedYear.toString()}
                      onValueChange={(val) => {
                        setSelectedYear(Number(val));
                        setSelectedMonth("");
                      }}
                      placeholder="Year"
                      searchPlaceholder="Search year..."
                      title="Years"
                      className="w-full sm:w-32"
                    />
                  </div>

                  {/* Month Select */}
                  <div className="flex-1 w-full">
                    <label className="text-xs text-muted-foreground mb-1 block">Month</label>
                    <div className="relative">
                      <button
                        ref={monthDropdownButtonRef}
                        type="button"
                        onClick={() => !isLoadingMonths && availableMonths.length > 0 && setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                        disabled={isLoadingMonths || availableMonths.length === 0}
                        className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="line-clamp-1 text-left">
                          {isLoadingMonths ? (
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading months...
                            </span>
                          ) : availableMonths.length === 0 ? (
                            <span className="text-muted-foreground">No months available</span>
                          ) : selectedMonth ? (
                            (() => {
                              const selectedMonthData = months.find(m => m.value === selectedMonth);
                              const isCurrentMonth = parseInt(selectedMonth) === new Date().getMonth() + 1 && selectedYear === currentYear;
                              return selectedMonthData
                                ? `${selectedMonthData.full}${isCurrentMonth ? ' (Current)' : ''}`
                                : "Select a Month";
                            })()
                          ) : (
                            <span className="text-muted-foreground">Select a Month</span>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-200 ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isMonthDropdownOpen && monthDropdownPosition && typeof window !== 'undefined' && createPortal(
                        <>
                          <div
                            className="fixed inset-0 z-[9999] bg-transparent"
                            onClick={(e) => {
                              if (e.target === e.currentTarget) {
                                setIsMonthDropdownOpen(false);
                              }
                            }}
                            onWheel={(_e) => {
                              // Allow scroll to pass through to modal
                            }}
                            style={{
                              pointerEvents: 'auto',
                              touchAction: 'pan-y pan-x'
                            }}
                          />
                          <div
                            className="fixed z-[10000] rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
                            style={{
                              top: `${monthDropdownPosition.top}px`,
                              left: `${monthDropdownPosition.left}px`,
                              width: `${monthDropdownPosition.width}px`,
                              maxHeight: '300px',
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              pointerEvents: 'auto'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            onWheel={(e) => {
                              e.stopPropagation();
                            }}
                            onTouchMove={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <div className="p-1">
                              {isLoadingMonths ? (
                                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Loading months...
                                </div>
                              ) : availableMonths.length === 0 ? (
                                <div className="px-2 py-1.5 text-sm text-gray-500">
                                  No months available for invoice generation
                                </div>
                              ) : (
                                months
                                  .filter((month) => availableMonths.includes(month.value))
                                  .map((month) => {
                                    const isSelected = selectedMonth === month.value;
                                    const isCurrentMonth = parseInt(month.value) === new Date().getMonth() + 1 && selectedYear === currentYear;
                                    const stat = monthStats[`${selectedYear}-${parseInt(month.value)}`];
                                    const pct =
                                      stat && stat.total > 0
                                        ? Math.round((stat.generated / stat.total) * 100)
                                        : null;
                                    const statusColor =
                                      stat?.total === 0
                                        ? "bg-gray-400 text-white"
                                        : pct !== null && pct >= 100
                                          ? "bg-green-500 text-white"
                                          : pct !== null && pct >= 50
                                            ? "bg-blue-500 text-white"
                                            : pct !== null
                                              ? "bg-red-500 text-white"
                                              : isCurrentMonth
                                                ? "bg-green-500 text-white"
                                                : "bg-blue-500 text-white";
                                    return (
                                      <div
                                        key={month.value}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setSelectedMonth(month.value);
                                          setIsMonthDropdownOpen(false);
                                          setMonthDropdownPosition(null);
                                        }}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        onMouseUp={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${isSelected
                                          ? "bg-accent text-accent-foreground font-medium"
                                          : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                          }`}
                                        role="option"
                                        aria-selected={isSelected}
                                      >
                                        <div className="flex items-center gap-2 w-full">
                                          <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${statusColor}`}
                                            title={
                                              stat ? `${stat.generated}/${stat.total} invoices (${pct}%)` : undefined
                                            }
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium">
                                              {month.full} {selectedYear}
                                            </div>
                                            {isCurrentMonth && (
                                              <div className="text-xs text-gray-500">
                                                Current month
                                              </div>
                                            )}
                                          </div>
                                          {isSelected && (
                                            <div className="flex-shrink-0">
                                              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                              )}
                            </div>
                          </div>
                        </>,
                        document.body
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading users...</span>
                </div>
              )}
            </div>
          )}

          {!isLoading && invoicePreviews.length > 0 && currentInvoice && (
            <div className="space-y-3 px-2 sm:px-3 py-2">
              {/* Header Section */}
              <div className="bg-white p-2 sm:p-3 rounded-lg border">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex items-start gap-2 w-full sm:w-auto">
                    {/* Company/Service Partner Logo */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-base sm:text-xl font-bold">
                        {servicePartner
                          ? (servicePartner.partnerName?.substring(0, 2) || 'SP').toUpperCase()
                          : 'BA'
                        }
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-base sm:text-lg font-bold text-blue-900 mb-1">
                        {servicePartner
                          ? servicePartner.partnerName
                          : (currentInvoice.companyData?.companyName || "BA EXPRESS LIMITED")
                        }
                      </h1>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
                        {servicePartner ? (
                          <>
                            <span>{servicePartner.address || 'N/A'}</span>
                            <span>{servicePartner.phone || 'N/A'}</span>
                          </>
                        ) : (
                          <>
                            <span>{currentInvoice.companyData?.companyStreet || "20 THE LAURELS, LONGFIELD, DA3 7HH"}</span>
                            <span>{currentInvoice.companyData?.companyEmail || "info@baexpress.co.uk"}</span>
                            <span>VAT: {currentInvoice.companyData?.companyVatNumber || "GB238595859"}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2">
                      <p className="text-[10px] sm:text-xs font-bold text-blue-900 uppercase">SELF BILLING INVOICE</p>
                      <p className="text-blue-900 font-bold text-xs sm:text-sm">#{currentInvoice.invoiceNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor and Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Vendor Details */}
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                      <User className="text-white w-3 h-3" />
                    </div>
                    <h3 className="font-semibold text-blue-900 text-sm">Vendor Details</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div className="flex gap-1 items-baseline">
                      <span className="text-gray-500 text-[10px]">Name:</span>
                      <span className="font-bold text-blue-900 text-xs">{currentInvoice.vendorData?.name || currentInvoice.userName} {currentInvoice.userLastName}</span>
                    </div>
                    <div className="flex gap-1 items-baseline">
                      <span className="text-gray-500 text-[10px]">Vendor ID:</span>
                      <span className="font-bold text-blue-900 text-xs">{currentInvoice.userName && currentInvoice.userLastName ? formatVendorId(currentInvoice.userName, currentInvoice.userLastName, currentInvoice.userId) : currentInvoice.userCode || "N/A"}</span>
                    </div>
                    {currentInvoice.vendorData?.vendorStreet && currentInvoice.vendorData.vendorStreet.trim() && (
                      <div className="flex gap-1 items-baseline">
                        <span className="text-gray-500 text-[10px]">Street:</span>
                        <span className="text-gray-600 text-xs">{currentInvoice.vendorData.vendorStreet}</span>
                      </div>
                    )}
                    {currentInvoice.vendorData?.vendorCity && currentInvoice.vendorData?.vendorPostalCode &&
                      currentInvoice.vendorData.vendorCity.trim() && currentInvoice.vendorData.vendorPostalCode.trim() && (
                        <div className="flex gap-1 items-baseline">
                          <span className="text-gray-500 text-[10px]">City:</span>
                          <span className="text-gray-600 text-xs">{currentInvoice.vendorData.vendorCity}, {currentInvoice.vendorData.vendorPostalCode}</span>
                        </div>
                      )}
                    <div className="flex gap-1 items-baseline">
                      <span className="text-gray-500 text-[10px]">Email:</span>
                      <span className="text-blue-600 underline text-xs">{currentInvoice.vendorData?.vendorEmail || currentInvoice.userData?.email || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                      <Calendar className="text-white w-3 h-3" />
                    </div>
                    <h3 className="font-semibold text-blue-900 text-sm">Invoice Details</h3>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex gap-1 items-baseline">
                        <span className="text-gray-500 text-[10px]">Invoice Date:</span>
                        <span className="font-bold text-blue-900 text-xs">
                          {(() => {
                            // Calculate last day of selected month
                            const year = selectedYear;
                            const month = parseInt(selectedMonth);
                            const lastDay = new Date(year, month, 0).getDate();
                            const lastDayDate = new Date(year, month - 1, lastDay);
                            return formatDate(lastDayDate.toISOString());
                          })()}
                        </span>
                      </div>
                      <div className="flex gap-1 items-baseline">
                        <span className="text-gray-500 text-[10px]">Due Date:</span>
                        <span className="font-bold text-blue-900 text-xs">
                          {(() => {
                            // Calculate day 15 of next month
                            const year = selectedYear;
                            const month = parseInt(selectedMonth);
                            const nextMonth = month === 12 ? 1 : month + 1;
                            const nextYear = month === 12 ? year + 1 : year;
                            const dueDate = new Date(nextYear, nextMonth - 1, 15);
                            return formatDate(dueDate.toISOString());
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex gap-1 items-baseline">
                        <span className="text-gray-500 text-[10px]">Payment Terms:</span>
                        <span className="font-bold text-blue-900 text-xs">{currentInvoice.invoiceData?.paymentTerms || "NET 15"}</span>
                      </div>
                      <div className="flex gap-1 items-baseline">
                        <span className="text-gray-500 text-[10px]">Total Stops:</span>
                        <span className="font-bold text-blue-900 text-xs">{currentInvoice.invoiceData?.totalStops || currentInvoice.details.reduce((sum, d) => sum + d.routes.length, 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto pb-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-900 text-white border-0">
                        <TableHead className="text-white font-semibold px-1 sm:px-2 py-1 text-[10px] sm:text-xs w-1/4 text-center">DATE</TableHead>
                        <TableHead className="text-white font-semibold px-1 sm:px-2 py-1 text-[10px] sm:text-xs w-1/3 text-center">ROUTE</TableHead>
                        <TableHead className="text-white font-semibold px-1 sm:px-2 py-1 text-[10px] sm:text-xs w-1/6 text-center">VAT</TableHead>
                        <TableHead className="text-white font-semibold px-1 sm:px-2 py-1 text-[10px] sm:text-xs w-1/4 text-right">AMOUNT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentInvoice.details.map((detail, detailIndex) => {
                        const hasUnverifiedRoutes = detail.hasUnverifiedRoutes === true || detail.routes.some((route) => route.isSpms !== true);
                        const rowClassName = hasUnverifiedRoutes
                          ? "border-0 bg-orange-50 hover:bg-orange-100"
                          : "border-0 bg-white hover:bg-gray-50";
                        const cellClassName = hasUnverifiedRoutes ? "text-orange-700" : "text-gray-600";

                        return (
                          <TableRow key={`${detailIndex}`} className={rowClassName}>
                            <TableCell className={`px-1 sm:px-2 py-0.5 sm:py-1 w-1/4 text-[10px] sm:text-xs border-0 text-center ${cellClassName}`}>{formatDate(detail.date)}</TableCell>
                            <TableCell className={`px-1 sm:px-2 py-0.5 sm:py-1 w-1/3 text-[10px] sm:text-xs border-0 text-center ${cellClassName}`}>{detail.routes.map(r => r.description.replace('ROUTE COST ID: ', '')).join(', ')}</TableCell>
                            <TableCell className={`px-1 sm:px-2 py-0.5 sm:py-1 w-1/6 text-[10px] sm:text-xs border-0 text-center ${cellClassName}`}>{detail.vatPercentage ? `${detail.vatPercentage}%` : 'no vat'}</TableCell>
                            <TableCell className={`text-right px-1 sm:px-2 py-0.5 sm:py-1 w-1/4 text-[10px] sm:text-xs border-0 ${cellClassName}`}>{formatCurrency(detail.totalAmount)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary, Deductions, and Balance */}
              <div className="flex flex-col items-end space-y-2">
                {/* Invoice Total and Total Deductions side by side */}
                <div className="flex flex-row gap-4 w-full max-w-2xl">
                  {/* Invoice Summary - Left */}
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg flex-1">
                    <div className="space-y-1 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice Subtotal:</span>
                        <span className="font-bold text-blue-900">{formatCurrency(currentInvoice.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">VAT:</span>
                        <span className="font-bold text-blue-900">{formatCurrency(currentInvoice.totalVat)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-900 text-lg border-t pt-2">
                        <span>Invoice Total:</span>
                        <span>{formatCurrency(currentInvoice.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions - Right - Only show if there are any deductions */}
                  {(currentInvoice.invoiceData?.totalDeductions || 0) > 0 && (
                    <div className="bg-red-50 p-2 sm:p-3 rounded-lg flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shrink-0">
                          <FileWarning className="text-white w-3 h-3" />
                        </div>
                        <h3 className="font-bold text-red-900 text-sm">Deductions</h3>
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        {/* Traffic Penalty */}
                        {(currentInvoice.invoiceData?.totalTrafficPenaltyDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Traffic Penalties:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(currentInvoice.invoiceData?.totalTrafficPenaltyDeductions || 0)}</span>
                          </div>
                        )}

                        {/* Pre-payments */}
                        {(currentInvoice.invoiceData?.totalPrePaymentDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pre-Payments:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(currentInvoice.invoiceData?.totalPrePaymentDeductions || 0)}</span>
                          </div>
                        )}

                        {/* Other */}
                        {(currentInvoice.invoiceData?.totalOtherDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Others:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(currentInvoice.invoiceData?.totalOtherDeductions || 0)}</span>
                          </div>
                        )}

                        {/* Liquid */}
                        {(currentInvoice.invoiceData?.totalLiquidationDamageDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Liquidation Damages:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(currentInvoice.invoiceData?.totalLiquidationDamageDeductions || 0)}</span>
                          </div>
                        )}

                        {/* Repairs */}
                        {(currentInvoice.invoiceData?.totalFixDamageDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Repair Damages:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(currentInvoice.invoiceData?.totalFixDamageDeductions || 0)}</span>
                          </div>
                        )}

                        {/* Total Deductions */}
                        <div className="flex justify-between font-bold text-red-900 text-lg border-t pt-2 pb-1">
                          <span>Total Deductions:</span>
                          <span>-{formatCurrency(currentInvoice.invoiceData?.totalDeductions || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Balance Due */}
                <div className="bg-blue-900 p-2 sm:p-3 rounded-lg w-full max-w-sm text-white">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs sm:text-base font-bold whitespace-nowrap">Balance Due:</span>
                    <span className="text-lg sm:text-2xl font-bold">
                      {formatCurrency(currentInvoice.grandTotal - (currentInvoice.invoiceData?.totalDeductions || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* SPMS Info Banner */}
              {getSpmsInfoMessage(currentInvoice) && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                  {getSpmsInfoMessage(currentInvoice)}
                </div>
              )}

              {/* Validation Message */}
              {getValidationMessage(currentInvoice) && (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded">
                  {getValidationMessage(currentInvoice)}
                </div>
              )}

              {/* Approval Status */}
              <div className="bg-card text-card-foreground flex gap-6 rounded-xl border p-4 shadow-smflex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">
                    {currentInvoice.userName} {currentInvoice.userLastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Invoice Number: {currentInvoice.invoiceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${currentInvoice.approved
                    ? 'bg-green-100 text-green-800'
                    : !hasUsableInvoiceData(currentInvoice) || hasNoEligibleDetails(currentInvoice)
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {currentInvoice.approved
                      ? '✓ Approved'
                      : !hasUsableInvoiceData(currentInvoice) || hasNoEligibleDetails(currentInvoice)
                        ? 'No Eligible Data'
                        : 'Pending Approval'}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Navigation and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground mx-1 sm:mx-2">
                    Invoice {currentStep + 1} of {invoicePreviews.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentStep === invoicePreviews.length - 1}
                    size="sm"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                  </Button>
                </div>

                <div className="flex gap-2 items-center">
                  <span className="text-sm text-muted-foreground">
                    {approvedCount} of {invoicePreviews.length} approved
                  </span>
                  {!currentInvoice.approved ? (
                    <Button
                      onClick={handleApprove}
                      variant="default"
                      disabled={!hasUsableInvoiceData(currentInvoice) || hasNoEligibleDetails(currentInvoice)}
                    >
                      Approve Invoice
                    </Button>
                  ) : (
                    <Button
                      onClick={handleUnapprove}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Unapprove
                    </Button>
                  )}
                  <Button
                    onClick={handleCreateInvoices}
                    disabled={isCreating || approvedCount === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      `Create ${approvedCount} Invoice${approvedCount > 1 ? 's' : ''}`
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
