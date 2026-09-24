"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useEffect, useRef, useMemo } from "react";
import { SearchableSelect, type SelectItem } from "@/components/ui/searchable-select";
import { useServicePartnerById } from "@/hooks/useServicePartnerById";
import { parseServicePartnerId } from "@/lib/service-partner-utils";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, Loader2, User as UserIcon, Calendar, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserIdFromToken, hasAuthSession, getBearerAuthHeader } from "@/lib/auth"
import { formatVendorId } from "@/lib/utils";
import "./new-invoice-modal.css";
import { guardedFetch } from "@/lib/in-flight-guard";

interface NewInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated?: () => void;
  /** Quando true, permite criar invoice mesmo com is_spms = false */
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
  invoiceDetailId?: number;
  operationId?: number;
  date: string;
  description: string;
  stops: number;
  rate: number | string;
  routeSort: number | string;
  adhocSort: number | string;
  extra: number | string;
  vatPercentage?: string;
  totalRate?: string;
  total: number | string;
  isSpms: boolean | null;
}

interface ExistingInvoice {
  invoiceId: number;
  invoiceNumber: string;
  userCode: string;
  courier: string;
  invoiceCreatedOn: string;
  totalPayment: number;
  referenceDate: string;
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
  company: {
    companyId: number;
    companyName: string;
    companyStreet: string;
    companyCity: string;
    companyPostalCode: string;
    companyPhone: string | null;
    companyEmail: string;
    companyVatNumber: string;
  };
  vendor: {
    vendorId: number;
    name: string;
    vendorCode: string;
    vendorStreet: string;
    vendorCity: string;
    vendorPostalCode: string;
    vendorPhone: string;
    vendorEmail: string;
    vendorVatNumber: string | null;
    servicePartnerId?: number | null;
  };
  user?: UserData;
  details: InvoiceDetail[];
  servicePartnerId?: number | null;
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

export default function NewInvoiceModal({
  open,
  onOpenChange,
  onInvoiceCreated,
  skipSpmsValidation = false,
  allowedUserIds,
  selectedServicePartnerId = '',
}: NewInvoiceModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedCourier, setSelectedCourier] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [monthStats, setMonthStats] = useState<Record<string, { generated: number; total: number }>>({});
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const monthDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const [, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [monthDropdownPosition, setMonthDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  const spId = useMemo(() => {
    const id = invoiceData?.vendor?.servicePartnerId || invoiceData?.servicePartnerId;
    return parseServicePartnerId(id);
  }, [invoiceData?.vendor?.servicePartnerId, invoiceData?.servicePartnerId]);

  const { servicePartner } = useServicePartnerById(spId);

  const yearItems = useMemo<SelectItem[]>(() => {
    return years.map((y) => ({
      value: y.toString(),
      label: y.toString(),
    }));
  }, []);

  const courierItems = useMemo<SelectItem[]>(() => {
    return users.map((u) => ({
      value: u.userId.toString(),
      label: `${u.userName} ${u.userLastName}`,
    }));
  }, [users]);

  // Fetch available months + invoice stats for % display
  useEffect(() => {
    if (open) {
      const fetchAvailableMonthsAndStats = async () => {
        if (!hasAuthSession()) return;
        setIsLoadingMonths(true);
        try {
          const currentDate = new Date();
          const localCurrentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1; // 1-12

          const monthsToCheck: number[] = [];
          if (selectedYear === localCurrentYear) {
            monthsToCheck.push(currentMonth);
            for (let month = currentMonth - 1; month >= 1; month--) {
              monthsToCheck.push(month);
            }
          } else if (selectedYear < localCurrentYear) {
            for (let month = 12; month >= 1; month--) {
              monthsToCheck.push(month);
            }
          } else {
            monthsToCheck.push(currentMonth);
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
          const monthsWithVendors: string[] = [];

          await Promise.all(
            monthsToCheck.map(async (month) => {
              try {
                const withoutUrl = `${getApiBaseUrl()}/bff/users/by-company/1/without-invoice?month=${month}&year=${selectedYear}`;
                const [withoutRes, invoicesRes] = await Promise.all([
                  guardedFetch(withoutUrl, fetchConfig),
                  guardedFetch(
                    `${getApiBaseUrl()}/bff/invoices?month=${month}&year=${selectedYear}&userId=${adminUserId}`,
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
                stats[`${selectedYear}-${month}`] = { generated, total };

                if (withoutCount > 0 || (selectedYear === currentYear && month === currentMonth)) {
                  monthsWithVendors.push(month.toString());
                }
              } catch (err) {
                console.error(`Error checking month ${month}:`, err);
              }
            })
          );

          if (selectedYear === localCurrentYear && !monthsWithVendors.includes(currentMonth.toString())) {
            monthsWithVendors.unshift(currentMonth.toString());
          }

          setMonthStats(stats);
          setAvailableMonths(monthsWithVendors);
        } catch (err) {
          console.error("Error fetching available months:", err);
          const currentDate = new Date();
          const localCurrentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          if (selectedYear === localCurrentYear) {
            setAvailableMonths([currentMonth.toString()]);
          } else {
            setAvailableMonths([]);
          }
        } finally {
          setIsLoadingMonths(false);
        }
      };

      fetchAvailableMonthsAndStats().catch(console.error);
    }
  }, [open, selectedYear]);

  useEffect(() => {
    if (open && selectedMonth) {
      const fetchUsers = async () => {
        if (!hasAuthSession()) return;
        setIsLoadingUsers(true);
        try {
          const spParam = selectedServicePartnerId ? `&servicePartnerId=${selectedServicePartnerId}` : '';
          const url = `${getApiBaseUrl()}/bff/users/by-company/1/without-invoice?month=${selectedMonth}&year=${selectedYear}${spParam}`;

          const response = await guardedFetch(url, {
            headers: {
              ...getBearerAuthHeader(),
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            cache: "no-store",
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message || `Failed to fetch users: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();

          if (!data.users || !Array.isArray(data.users)) {
            throw new Error("Invalid response format from server");
          }

          const transformedUsers: User[] = data.users.map(
            (user: { userId: number; userCode: string | null; userName: string; userLastName: string }) => ({
              userId: user.userId,
              userCode: user.userCode,
              userName: user.userName,
              userLastName: user.userLastName,
            })
          );

          // Keep every user returned by /without-invoice so service partners/vendors are not hidden.
          let usersWithData: User[] = transformedUsers;

          if (allowedUserIds) {
            usersWithData = usersWithData.filter((u: User) => allowedUserIds.has(u.userId));
          }

          setUsers(usersWithData);
          setSelectedCourier("");
        } catch (err) {
          console.error("Error fetching users:", err);
          setError(err instanceof Error ? err.message : "Failed to load users. Please try again.");
        } finally {
          setIsLoadingUsers(false);
        }
      };

      fetchUsers().catch(console.error);
    }
  }, [open, selectedMonth, selectedYear, selectedServicePartnerId, allowedUserIds]);

  // Auto-select a valid month when opening/changing year so the modal can pre-load users/create-data.
  useEffect(() => {
    if (!open || isLoadingMonths || availableMonths.length === 0) return;

    const currentMonth = String(new Date().getMonth() + 1);
    const preferredMonth =
      selectedYear === currentYear && availableMonths.includes(currentMonth)
        ? currentMonth
        : availableMonths[0];

    if (!selectedMonth || !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(preferredMonth);
    }
  }, [open, isLoadingMonths, availableMonths, selectedMonth, selectedYear]);

  const handleSeeInvoice = async () => {
    if (!selectedMonth || !selectedCourier) return;

    setIsLoading(true);
    setError(null);
    try {
      // Check for an existing invoice for this user in the selected reference month/year.
      // Scoped by month+year because the BFF requires those params and the duplicate
      // comparison below only matches against the same period anyway.
      const checkQs = new URLSearchParams({
        month: selectedMonth,
        year: String(selectedYear),
      });
      const checkResponse = await guardedFetch(
        `${getApiBaseUrl()}/bff/invoices?${checkQs.toString()}`,
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

      if (checkResponse.ok) {
        const existingInvoices = await checkResponse.json();

        // Ensure existingInvoices is an array
        if (!Array.isArray(existingInvoices)) {
          console.warn('Unexpected response format from invoices API');
        }

        // Find the selected user's name to match with existing invoices
        const selectedUser = users.find(u => u.userId.toString() === selectedCourier);
        const selectedUserFullName = selectedUser
          ? `${selectedUser.userName} ${selectedUser.userLastName}`
          : '';

        // Check if there's already an invoice for this user with the same reference month/year
        const duplicateInvoice = Array.isArray(existingInvoices) && existingInvoices.find((invoice: ExistingInvoice) => {
          if (invoice.courier !== selectedUserFullName) return false;

          // Parse the reference date to get month and year
          if (invoice.referenceDate) {
            const refDate = new Date(invoice.referenceDate);
            // Use UTC methods to avoid timezone issues
            const refMonth = refDate.getUTCMonth() + 1; // JavaScript months are 0-indexed
            const refYear = refDate.getUTCFullYear();

            // Compare with selected month and year
            return refMonth === parseInt(selectedMonth) && refYear === selectedYear;
          }

          return false;
        });

        if (duplicateInvoice) {
          const monthName = months.find(m => m.value === selectedMonth)?.label;
          setError(`Invoice already exists for ${selectedUserFullName} with reference month ${monthName} ${selectedYear}. Invoice #${duplicateInvoice.invoiceNumber}. Cannot create duplicate invoice.`);
          setIsLoading(false);
          return;
        }
      }

      // If no duplicate found, proceed with creating the invoice
      const response = await guardedFetch(
        `${getApiBaseUrl()}/bff/invoices/create-data?userId=${selectedCourier}&month=${selectedMonth}&year=${selectedYear}`,
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

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const data = await response.json();

      // Clean invoiceNumber by removing "null" if present
      if (data.invoiceNumber && typeof data.invoiceNumber === 'string' && data.invoiceNumber.includes("null")) {
        data.invoiceNumber = data.invoiceNumber.replace("null", "");
      }

      // Ensure referenceDate is available
      if (!data.referenceDate) {
        console.warn("Reference date not available in invoice preview");
      }

      // "Sem dados" apenas quando não há detalhes e todos os totais relevantes são zero.
      if (!hasInvoicePayloadData(data)) {
        setInvoiceData(null);
        setError("No data is available for generating an invoice for this user");
        return;
      }

      setInvoiceData(data);
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError("Failed to create invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const hasInvoicePayloadData = (data?: InvoiceData | null) => {
    if (!data) return false;

    const hasDetails = Array.isArray(data.details) && data.details.length > 0;
    const hasNonZeroTotals =
      (data.subTotal ?? 0) !== 0 ||
      (data.total ?? 0) !== 0 ||
      (data.totalDeductions ?? 0) !== 0 ||
      (data.totalDetails ?? 0) !== 0 ||
      (data.totalOperationsManagement ?? 0) !== 0;

    return hasDetails || hasNonZeroTotals;
  };

  const getFilteredDetails = () => {
    if (!invoiceData?.details) return [];
    // SPMS ON: show all items (validation blocks creation if any item is not SPMS-validated)
    // SPMS OFF: show all items and allow creating the invoice
    return invoiceData.details;
  };

  // Calculate sum of individual detail totals for verification
  const getSumOfDetailTotals = () => {
    const details = getFilteredDetails();
    if (details.length === 0) return 0;
    return details.reduce((sum, detail) => {
      const total = typeof detail.total === 'string' ? parseFloat(detail.total) : detail.total;
      return sum + (total || 0);
    }, 0);
  };

  // Calculate subtotal (Total Details BEFORE deductions)
  const calculateSubtotal = () => {
    // Use sum of individual detail totals to ensure it's BEFORE deductions
    return getSumOfDetailTotals();
  };

  // Calculate VAT correctly (20% of total routes BEFORE deductions)
  const calculateVat = () => {
    const hasVat = invoiceData?.totalVat && invoiceData.totalVat > 0;
    if (!hasVat) return 0;

    // Use sum of individual detail totals to ensure it's BEFORE deductions
    const totalRoutes = getSumOfDetailTotals();
    return totalRoutes * 0.20; // 20% VAT
  };

  // Calculate invoice total (Subtotal + VAT)
  const calculateInvoiceTotal = () => {
    const subtotal = calculateSubtotal();
    const vat = calculateVat();
    return subtotal + vat;
  };

  // Format VAT for display in table
  const formatVatDisplay = () => {
    const hasVat = invoiceData?.totalVat && invoiceData.totalVat > 0;
    return hasVat ? '20%' : 'no vat';
  };

  // Format Vendor ID using utility function
  const getFormattedVendorId = () => {
    if (invoiceData?.user) {
      return formatVendorId(invoiceData.user.name, invoiceData.user.lastName, invoiceData.user.userId);
    }
    // Fallback to vendorCode if user data not available
    return invoiceData?.vendor.vendorCode || 'N/A';
  };

  // Generate invoice number in YYYYMMDD-XX format
  const generateInvoiceNumber = () => {
    if (!selectedMonth || !invoiceData) return 'N/A';

    const userName = invoiceData.user?.name || invoiceData.vendor?.name || '';
    const userLastName = invoiceData.user?.lastName || '';
    const firstInitial = userName.charAt(0).toUpperCase();
    const lastInitial = userLastName.charAt(0).toUpperCase();
    const monthPadded = selectedMonth.padStart(2, '0');
    const dayPadded = '01';

    return `${selectedYear}${monthPadded}${dayPadded}-${firstInitial}${lastInitial}`;
  };

  // Generate correct description based on selected month and year
  const generateDescription = () => {
    if (!selectedMonth) return "";

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthIndex = parseInt(selectedMonth) - 1;
    const monthName = monthNames[monthIndex];

    return `Monthly delivery services for ${monthName} ${selectedYear}`;
  };

  // Calculate Balance Due (Invoice Total - Deductions)
  const calculateBalanceDue = () => {
    const invoiceTotal = calculateInvoiceTotal();
    const deductions = invoiceData?.totalDeductions || 0;
    return invoiceTotal - deductions;
  };

  const getExcludedCount = () => {
    if (!invoiceData?.details || !skipSpmsValidation) return 0;
    return 0;
  };

  const getSpmsInfoMessage = () => {
    // Only show info banner when SPMS is OFF and some items were excluded
    const excluded = getExcludedCount();
    if (excluded === 0) return null;
    return `${excluded} item(s) excluded — SPMS validation OFF: only non-SPMS operations are included.`;
  };

  const getSpmsBlockingMessage = () => {
    if (!invoiceData?.details) return null;
    if (!skipSpmsValidation) {
      // SPMS ON: block if any item lacks SPMS validation
      const hasIneligible = invoiceData.details.some(d => d.isSpms !== true);
      if (hasIneligible) return "Cannot create invoice: no eligible operations for the current SPMS configuration.";
    }
    return null;
  };

  // Group invoice details by date
  const groupDetailsByDate = () => {
    const details = getFilteredDetails();
    if (details.length === 0) return [];

    const grouped = new Map<string, {
      date: string;
      routes: string[];
      total: number;
      hasUnverified: boolean;
    }>();

    details.forEach((detail) => {
      const dateKey = detail.date;
      const routeName = detail.description.replace('ROUTE COST ID: ', '');
      const total = typeof detail.total === 'string' ? parseFloat(detail.total) : detail.total;

      if (grouped.has(dateKey)) {
        const existing = grouped.get(dateKey)!;
        existing.routes.push(routeName);
        existing.total += total;
        existing.hasUnverified = existing.hasUnverified || detail.isSpms !== true;
      } else {
        grouped.set(dateKey, {
          date: dateKey,
          routes: [routeName],
          total: total,
          hasUnverified: detail.isSpms !== true
        });
      }
    });

    return Array.from(grouped.values());
  };

  const handleClose = () => {
    setInvoiceData(null);
    setSelectedYear(currentYear);
    setSelectedMonth(String(new Date().getMonth() + 1));
    setSelectedCourier("");
    setError(null);
    setIsDropdownOpen(false);
    onOpenChange(false);
  };

  // Close dropdown when modal closes
  useEffect(() => {
    if (!open) {
      setIsDropdownOpen(false);
      setIsMonthDropdownOpen(false);
      setDropdownPosition(null);
      setMonthDropdownPosition(null);
    }
  }, [open]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isDropdownOpen && dropdownButtonRef.current) {
      const updatePosition = () => {
        if (dropdownButtonRef.current) {
          const rect = dropdownButtonRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();

      // Update position on scroll or resize
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      // Listen to scroll on all scrollable containers
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      // Also listen to scroll on the modal content
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
      setDropdownPosition(null);
    }
  }, [isDropdownOpen]);

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

      // Update position on scroll or resize
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      // Listen to scroll on all scrollable containers
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      // Also listen to scroll on the modal content
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

  const handleCreateInvoice = async () => {
    if (!invoiceData) return;

    const spmsBlockingMessage = getSpmsBlockingMessage();
    if (spmsBlockingMessage) {
      setError(spmsBlockingMessage);
      return;
    }

    // Block only when payload has neither details nor monetary data.
    if (!hasInvoicePayloadData(invoiceData)) {
      setError("Cannot create invoice with zero total, subtotal and no deductions");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Extrair o userId correto do usuário selecionado
      const userId = selectedCourier;
      const companyId = invoiceData.company?.companyId;

      // Verificar se userId e companyId estão presentes
      if (!userId || !companyId) {
        throw new Error("User ID or Company ID is missing");
      }

      // Generate correct invoice number (YYYYMMDD-XX format)
      const userName = invoiceData.user?.name || invoiceData.vendor?.name || '';
      const userLastName = invoiceData.user?.lastName || '';
      const firstInitial = userName.charAt(0).toUpperCase();
      const lastInitial = userLastName.charAt(0).toUpperCase();
      const monthPadded = selectedMonth.padStart(2, '0');
      const dayPadded = '01'; // First day of month
      const invoiceNumber = `${selectedYear}${monthPadded}${dayPadded}-${firstInitial}${lastInitial}`;

      // Generate vendor code using utility function
      const vendorCode = formatVendorId(userName, userLastName, userId);

      // Define referenceDate: if there is no date from the deduction, use the last day of the selected month/year
      let referenceDate = invoiceData.referenceDate;
      if (!referenceDate || referenceDate === 'null' || referenceDate === '') {
        const year = selectedYear;
        const month = parseInt(selectedMonth);
        // Get last day of the month
        const lastDay = new Date(year, month, 0).getDate();
        const monthPaddedRef = selectedMonth.toString().padStart(2, '0');
        const dayPaddedRef = lastDay.toString().padStart(2, '0');
        referenceDate = `${year}-${monthPaddedRef}-${dayPaddedRef}`;
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

      // Usar o userId correto do usuário selecionado, não do vendor
      const completePayload = {
        // Informações básicas da fatura
        invoiceNumber,
        description: generateDescription(), // Use generated description with selected month
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        paymentTerms: invoiceData.paymentTerms || "",
        referenceMonth: parseInt(selectedMonth),
        referenceYear: selectedYear,
        referenceDate: referenceDate,

        // Campos financeiros
        totalStops: invoiceData.totalStops || 0,
        totalVat: calculateVat(),
        totalOtherDeductions: invoiceData.totalOtherDeductions || 0,
        totalLiquidationDamageDeductions: invoiceData.totalLiquidationDamageDeductions || 0,
        totalPrePaymentDeductions: invoiceData.totalPrePaymentDeductions || 0,
        totalFixDamageDeductions: invoiceData.totalFixDamageDeductions || 0,
        totalTrafficPenaltyDeductions: invoiceData.totalTrafficPenaltyDeductions || 0,
        totalOperationsManagement: invoiceData.totalOperationsManagement || 0,
        totalDetails: calculateInvoiceTotal(), // Invoice Total (Subtotal + VAT)
        totalDeductions: invoiceData.totalDeductions || 0,
        // Use calculated values instead of API values
        subTotal: calculateSubtotal(),
        total: calculateBalanceDue(), // Balance Due = Invoice Total - Deductions

        // Usar o userId correto do usuário selecionado, não do vendor
        userId: Number(userId), // Garantir que seja um número
        companyId: companyId,

        // Informações da empresa
        company: {
          companyId: companyId,
          companyName: invoiceData.company.companyName || "",
          companyStreet: invoiceData.company.companyStreet || "",
          companyCity: invoiceData.company.companyCity || "",
          companyPostalCode: invoiceData.company.companyPostalCode || "",
          companyPhone: invoiceData.company.companyPhone || "",
          companyEmail: invoiceData.company.companyEmail || "",
          companyVatNumber: invoiceData.company.companyVatNumber || ""
        },

        // Informações do fornecedor
        vendor: {
          vendorId: invoiceData.vendor.vendorId,
          name: invoiceData.vendor.name || "",
          vendorCode: vendorCode, // Use generated vendor code
          vendorStreet: invoiceData.vendor.vendorStreet || "",
          vendorCity: invoiceData.vendor.vendorCity || "",
          vendorPostalCode: invoiceData.vendor.vendorPostalCode || "",
          vendorPhone: invoiceData.vendor.vendorPhone || "",
          vendorEmail: invoiceData.vendor.vendorEmail || "",
          vendorVatNumber: invoiceData.vendor.vendorVatNumber || "",
          servicePartnerId: invoiceData.vendor.servicePartnerId ?? null,
        },

        // Detalhes processados
        details: (invoiceData.details || []).map(detail => ({
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

      const response = await guardedFetch(
        `${getApiBaseUrl()}/bff/invoices`,
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
          body: JSON.stringify(completePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.message || errorData.error || "Failed to create invoice");
      }

      // Notificar sobre sucesso
      if (onInvoiceCreated) {
        onInvoiceCreated();
      }

      // Fechar o modal
      handleClose();
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(err instanceof Error ? err.message : "Failed to create invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className={
            invoiceData ? "w-[95vw] max-w-4xl max-h-[98vh] lg:max-h-[98vh] overflow-y-auto overflow-x-hidden p-2 sm:p-6" : "sm:max-w-md overflow-x-hidden"
          }
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          style={invoiceData ? {
            maxHeight: '98vh',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column'
          } : undefined}
        >
          <DialogHeader>
            <DialogTitle>
              {invoiceData ? "Invoice Preview" : "New Invoice"}
            </DialogTitle>
          </DialogHeader>

          {!invoiceData && (
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
                    <SearchableSelect
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
                            onWheel={() => {
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
                                  .filter(month => availableMonths.includes(month.value))
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
                                              {month.full}
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

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Courier
                </label>
                <SearchableSelect
                  items={courierItems}
                  value={selectedCourier}
                  onValueChange={setSelectedCourier}
                  disabled={isLoadingUsers || users.length === 0}
                  placeholder={isLoadingUsers ? "Loading users..." : users.length === 0 ? "No users available" : "Select a Courier"}
                  searchPlaceholder="Search courier by name or ID..."
                  title="Couriers"
                />
              </div>

              <Button
                onClick={handleSeeInvoice}
                disabled={!selectedMonth || !selectedCourier || isLoading}
                className="w-full"
              >
                {isLoading ? "Loading..." : "See Invoice"}
              </Button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Creating invoice...</span>
            </div>
          )}

          {!isLoading && invoiceData && (
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
                          : invoiceData.company.companyName
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
                            <span>{invoiceData.company.companyStreet}</span>
                            <span>{invoiceData.company.companyEmail}</span>
                            <span>VAT: {invoiceData.company.companyVatNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2">
                      <p className="text-[10px] sm:text-xs font-bold text-blue-900 uppercase">SELF BILLING INVOICE</p>
                      <p className="text-blue-900 font-bold text-xs sm:text-sm">#{generateInvoiceNumber()}</p>
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
                      <UserIcon className="text-white w-3 h-3" />
                    </div>
                    <h3 className="font-semibold text-blue-900 text-sm">Vendor Details</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div className="flex gap-1 items-baseline">
                      <span className="text-gray-500 text-[10px]">Name:</span>
                      <span className="font-bold text-blue-900 text-xs">
                        {invoiceData.user ? `${invoiceData.user.name} ${invoiceData.user.lastName}` : invoiceData.vendor.name}
                      </span>
                    </div>
                    <div className="flex gap-1 items-baseline">
                      <span className="text-gray-500 text-[10px]">Vendor ID:</span>
                      <span className="font-bold text-blue-900 text-xs">{getFormattedVendorId()}</span>
                    </div>
                    {/* Street - prioritize user data, fallback to vendor */}
                    {(invoiceData.user?.street || invoiceData.vendor.vendorStreet) && (invoiceData.user?.street?.trim() || invoiceData.vendor.vendorStreet?.trim()) && (
                      <div className="flex gap-1 items-baseline">
                        <span className="text-gray-500 text-[10px]">Street:</span>
                        <span className="text-gray-600 text-xs">{invoiceData.user?.street || invoiceData.vendor.vendorStreet}</span>
                      </div>
                    )}
                    {/* City and Postal Code - prioritize user data, fallback to vendor */}
                    {((invoiceData.user?.city && invoiceData.user?.postalCode) || (invoiceData.vendor.vendorCity && invoiceData.vendor.vendorPostalCode)) &&
                      ((invoiceData.user?.city?.trim() && invoiceData.user?.postalCode?.trim()) || (invoiceData.vendor.vendorCity?.trim() && invoiceData.vendor.vendorPostalCode?.trim())) && (
                        <div className="flex gap-1 items-baseline">
                          <span className="text-gray-500 text-[10px]">City:</span>
                          <span className="text-gray-600 text-xs">
                            {invoiceData.user?.city || invoiceData.vendor.vendorCity}, {invoiceData.user?.postalCode || invoiceData.vendor.vendorPostalCode}
                          </span>
                        </div>
                      )}
                    <div className="flex gap-1 items-baseline">
                      <span className="text-gray-500 text-[10px]">Email:</span>
                      <span className="text-blue-600 underline text-xs">{invoiceData.user?.email || invoiceData.vendor.vendorEmail}</span>
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
                        <span className="font-bold text-blue-900 text-xs">{invoiceData.paymentTerms}</span>
                      </div>
                      <div className="flex gap-1 items-baseline">
                        <span className="text-gray-500 text-[10px]">Total Stops:</span>
                        <span className="font-bold text-blue-900 text-xs">{invoiceData.totalStops}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SPMS OFF: info banner when items were excluded */}
              {getSpmsInfoMessage() && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                  {getSpmsInfoMessage()}
                </div>
              )}
              {/* SPMS blocking message */}
              {getSpmsBlockingMessage() && (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded">
                  {getSpmsBlockingMessage()}
                </div>
              )}

              {/* Line Items Table */}
              {getFilteredDetails().length > 0 && (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="overflow-x-hidden pb-2">
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
                        {groupDetailsByDate().map((groupedDetail, index) => (
                          <TableRow
                            key={`detail-${groupedDetail.date}-${index}`}
                            className={`border-0 ${groupedDetail.hasUnverified ? 'bg-orange-50 hover:bg-orange-100' : 'bg-white hover:bg-gray-50'}`}
                          >
                            <TableCell className={`px-1 sm:px-2 py-0.5 sm:py-1 w-1/4 text-[10px] sm:text-xs border-0 text-center ${groupedDetail.hasUnverified ? 'text-orange-800 font-semibold' : 'text-gray-600'}`}>
                              {formatDate(groupedDetail.date)}
                            </TableCell>
                            <TableCell className={`px-1 sm:px-2 py-0.5 sm:py-1 w-1/3 text-[10px] sm:text-xs border-0 text-center ${groupedDetail.hasUnverified ? 'text-orange-800 font-semibold' : 'text-gray-600'}`}>
                              {groupedDetail.routes.join(', ')}
                            </TableCell>
                            <TableCell className={`px-1 sm:px-2 py-0.5 sm:py-1 w-1/6 text-[10px] sm:text-xs border-0 text-center ${groupedDetail.hasUnverified ? 'text-orange-800 font-semibold' : 'text-gray-600'}`}>
                              {formatVatDisplay()}
                            </TableCell>
                            <TableCell className={`text-right px-1 sm:px-2 py-0.5 sm:py-1 w-1/4 text-[10px] sm:text-xs border-0 ${groupedDetail.hasUnverified ? 'text-orange-800 font-semibold' : 'text-gray-600'}`}>
                              {formatCurrency(groupedDetail.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Summary, Deductions, and Balance */}
              <div className="flex flex-col items-end space-y-2">
                {/* Invoice Total and Total Deductions side by side */}
                <div className="flex flex-row gap-4 w-full max-w-2xl">
                  {/* Invoice Summary - Left */}
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg flex-1">
                    <div className="space-y-1 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice Subtotal:</span>
                        <span className="font-bold text-blue-900">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">VAT:</span>
                        <span className="font-bold text-blue-900">{formatCurrency(calculateVat())}</span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-900 text-lg border-t pt-2">
                        <span>Invoice Total:</span>
                        <span>{formatCurrency(calculateInvoiceTotal())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions - Right - Only show if there are any deductions */}
                  {(invoiceData.totalDeductions || 0) > 0 && (
                    <div className="bg-red-50 p-2 sm:p-3 rounded-lg flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shrink-0">
                          <FileWarning className="text-white w-3 h-3" />
                        </div>
                        <h3 className="font-bold text-red-900 text-sm">Deductions</h3>
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        {/* Traffic Penalty */}
                        {(invoiceData.totalTrafficPenaltyDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Traffic Penalties:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(invoiceData.totalTrafficPenaltyDeductions)}</span>
                          </div>
                        )}

                        {/* Pre-payments */}
                        {(invoiceData.totalPrePaymentDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pre-Payments:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(invoiceData.totalPrePaymentDeductions)}</span>
                          </div>
                        )}

                        {/* Other */}
                        {(invoiceData.totalOtherDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Others:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(invoiceData.totalOtherDeductions)}</span>
                          </div>
                        )}

                        {/* Liquid */}
                        {(invoiceData.totalLiquidationDamageDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Liquidation Damages:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(invoiceData.totalLiquidationDamageDeductions)}</span>
                          </div>
                        )}

                        {/* Repairs */}
                        {(invoiceData.totalFixDamageDeductions || 0) !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Repair Damages:</span>
                            <span className="font-bold text-red-900">-{formatCurrency(invoiceData.totalFixDamageDeductions)}</span>
                          </div>
                        )}

                        {/* Total Deductions */}
                        <div className="flex justify-between font-bold text-red-900 text-lg border-t pt-2 pb-1">
                          <span>Total Deductions:</span>
                          <span>-{formatCurrency(invoiceData.totalDeductions)}</span>
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
                      {formatCurrency(calculateBalanceDue())}
                    </span>
                  </div>
                </div>
              </div>


              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleCreateInvoice}
                  disabled={isLoading || !hasInvoicePayloadData(invoiceData) || !!getSpmsBlockingMessage()}
                  variant="default"
                  className="disabled:opacity-50 disabled:bg-primary/60 disabled:text-white disabled:cursor-not-allowed disabled:pointer-events-none min-w-[140px] hover:bg-primary/90 transition-all"
                  style={{
                    imageRendering: 'auto',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    transform: 'none',
                    scale: '1',
                    zoom: '1'
                  }}
                >
                  {isLoading ? "Creating..." : "Create Invoice"}
                </Button>
                <Button onClick={handleClose} className="min-w-[140px] hover:bg-primary/90 transition-all">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
