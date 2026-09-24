import type {
  FixDamageDeduction,
  TrafficPenaltyDeduction,
  PrePaymentDeduction,
  LiquidationDamageDeduction,
  OtherDeduction
} from '@/lib/deductions-api';
import type { DisplayDeduction } from './types';
import { DATE_OF_INCIDENT_FIELD_BY_CATEGORY, VENDOR_FIELD_BY_CATEGORY } from './constants';
import { Vendor } from '@/lib/vendors';

// Helper function to format date to yyyy-mm-dd without timezone conversion
export const formatDateToString = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  let dateObj: Date;
  if (typeof date === 'string') {
    // If it's already a string in yyyy-mm-dd format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise parse it as a date
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';

  // Format to yyyy-mm-dd using local timezone
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to parse backend UTC dates (ISO format with Z) to yyyy-mm-dd
// Handles timezone-aware date strings from the backend (e.g., "2026-06-01T00:00:00.000Z")
export const parseBackendDateToString = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  let dateObj: Date;
  if (typeof date === 'string') {
    // If it's already a string in yyyy-mm-dd format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise parse it as a date
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';

  // For UTC dates (ISO format with Z), use UTC methods to avoid timezone shifts
  // This prevents issues like 2026-06-01T00:00:00Z becoming 2026-05-31 in positive timezones
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayString = () => {
  const today = new Date();
  return formatDateToString(today);
};

// Helper function to generate reference number with existing deductions
export const generateReferenceNumber = (
  category: string,
  vendorName: string,
  existingDeductions: DisplayDeduction[]
): string => {
  // Map category to prefix
  const prefixMap: Record<string, string> = {
    'Repairs & Damages': 'RPD',
    'Pre-Payments': 'PRP',
    'Liquidation Damages': 'LQD',
    'Traffic Penalties': 'TRP',
    'Other': 'OTH'
  };

  const prefix = prefixMap[category] || 'OTH';

  // Extract initials: first letter of first name + full last name(s)
  const nameParts = vendorName.trim().split(/\s+/).filter(part => part.length > 0);
  let initials = '';
  if (nameParts.length > 0) {
    const firstName = nameParts[0];
    // Get all parts after the first name (all last names)
    const lastNames = nameParts.length > 1 ? nameParts.slice(1).join('') : '';
    initials = (firstName.charAt(0).toUpperCase() + lastNames.toUpperCase()).replace(/\s/g, '');
  } else {
    initials = vendorName.toUpperCase().replace(/\s/g, '');
  }
  // Keep only alphanumeric chars to avoid mismatches with punctuation/accents/symbols.
  initials = initials.replace(/[^A-Z0-9]/g, '');

  // Format date as dd-mm-yy
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  const dateStr = `${day}${month}${year}`;

  // Find the highest sequence number for this prefix/date.
  // NOTE: We intentionally do NOT require the same initials when scanning
  // existing refs, because legacy refs may have different initials rules.
  // This avoids generating duplicate "-001" when a record already exists.
  const todayPrefix = `${prefix}-${initials}-${dateStr}`;
  const refRegex = new RegExp(`^${prefix}-[^-]+-${dateStr}-(\\d+)$`, 'i');

  const matchingRefs = existingDeductions
    .flatMap((d) => {
      const candidates: string[] = [];
      if (typeof d.id === 'string') candidates.push(d.id);
      const ref = (d as { referenceNumber?: unknown }).referenceNumber;
      if (typeof ref === 'string') candidates.push(ref);
      return candidates;
    })
    .map((ref) => ref.trim())
    .map((ref) => {
      const match = refRegex.exec(ref);
      return match ? Number.parseInt(match[1], 10) : NaN;
    })
    .filter((n) => !Number.isNaN(n));

  const maxSeq = matchingRefs.length > 0 ? Math.max(...matchingRefs) : 0;
  const nextSeq = String(maxSeq + 1).padStart(3, '0');

  return `${todayPrefix}-${nextSeq}`;
};

export const formatCurrency = (value: number | string | null | undefined) => {
  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value ?? 0;
  const number = Number.parseFloat(String(numValue));
  if (Number.isNaN(number)) {
    return '£0.00';
  }
  return `£${number.toFixed(2)}`;
};

export const formatMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

// Helper to safely get string value from form data
export const getStringValue = (value: string | number | boolean | undefined): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

// Helper to get value for input fields (always returns string)
export const getInputValue = (value: string | number | boolean | undefined): string => {
  return getStringValue(value);
};

export const getReviewBaseInfo = (formData: Record<string, unknown>, selectedCategory: string) => {
  const dateField = DATE_OF_INCIDENT_FIELD_BY_CATEGORY[selectedCategory] || '';
  const vendorField = VENDOR_FIELD_BY_CATEGORY[selectedCategory] || '';

  return {
    incidentDate: (dateField && formData[dateField]) || 'N/A',
    vendor: (vendorField && formData[vendorField]) || 'N/A',
    type: formData.type || 'N/A'
  };
};

// Helper function to transform backend deduction to frontend display format
export const transformDeductionToDisplay = (
  deduction: FixDamageDeduction | TrafficPenaltyDeduction | PrePaymentDeduction | LiquidationDamageDeduction | OtherDeduction,
  type: string,
  usersMap: Map<number, string>,
  vendorList: Vendor[]
): DisplayDeduction => {
  const userId = 'userId' in deduction ? deduction.userId : 0;
  let courierName = 'Unknown Vendor';
  if (userId) {
    // Use Map lookup first (O(1)) - more efficient than find (O(n))
    courierName = usersMap.get(userId) || 'Unknown Vendor';

    // Only fallback to find if not in map (should rarely happen)
    if (courierName === 'Unknown Vendor') {
      // Use for loop for better performance than find
      for (let i = 0; i < vendorList.length; i++) {
        if (vendorList[i].userId === userId) {
          courierName = vendorList[i].fullName;
          break;
        }
      }
      if (courierName === 'Unknown Vendor') {
        courierName = `Vendor ID: ${userId}`;
      }
    }
  }

  let dateOfIncident = '';
  let amount = 0;

  // For all deduction types, preserve the original calendar date from the backend
  // without timezone shifts by preferring the raw "YYYY-MM-DD" portion when we
  // receive an ISO string.
  if (type === 'Repairs & Damages') {
    const d = deduction as FixDamageDeduction;
    if (typeof d.incidentDate === 'string') {
      const str = d.incidentDate;
      dateOfIncident = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
    } else {
      dateOfIncident = formatDateToString(d.incidentDate);
    }
    amount = d.totalRepairCost;
  } else if (type === 'Traffic Penalties') {
    const d = deduction as TrafficPenaltyDeduction;
    // Use payment/entry date for list filtering (month query is based on deduction month),
    // falling back to pcnDate when needed.
    const trafficDate = d.paymentDate || d.entryDate || d.pcnDate;
    if (typeof trafficDate === 'string') {
      const str = trafficDate;
      dateOfIncident = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
    } else {
      dateOfIncident = formatDateToString(trafficDate);
    }
    amount = d.amount;
  } else if (type === 'Pre-Payments') {
    const d = deduction as PrePaymentDeduction;
    if (typeof d.entryDate === 'string') {
      const str = d.entryDate;
      dateOfIncident = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
    } else {
      dateOfIncident = formatDateToString(d.entryDate);
    }
    amount = d.totalAmount;
  } else if (type === 'Liquidation Damages') {
    const d = deduction as LiquidationDamageDeduction;
    if (typeof d.liquidationDate === 'string') {
      const str = d.liquidationDate;
      dateOfIncident = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
    } else {
      dateOfIncident = formatDateToString(d.liquidationDate);
    }
    amount = d.amount;
  } else if (type === 'Other') {
    const d = deduction as OtherDeduction;
    if (typeof d.incidentDate === 'string') {
      const str = d.incidentDate;
      dateOfIncident = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
    } else {
      dateOfIncident = formatDateToString(d.incidentDate);
    }
    amount = d.totalAmount;
  }

  const backendType = type === 'Repairs & Damages' ? 'fix-damage' :
    type === 'Traffic Penalties' ? 'traffic-penalty' :
      type === 'Pre-Payments' ? 'pre-payment' :
        type === 'Liquidation Damages' ? 'liquidation-damage' : 'other';

  // Get backend ID based on type
  const backendId =
    (deduction as FixDamageDeduction).fixDamageId ||
    (deduction as TrafficPenaltyDeduction).trafficPenaltyId ||
    (deduction as PrePaymentDeduction).prePaymentId ||
    (deduction as LiquidationDamageDeduction).liquidationDamageId ||
    (deduction as OtherDeduction).otherDeductionId ||
    0;

  // Status logic: if invoiceId exists in the object, then Paid, otherwise Pending
  const invoiceId = 'invoiceId' in deduction ? (deduction as { invoiceId?: number }).invoiceId : undefined;
  const status: 'Paid' | 'Pending' | 'Disputed' = invoiceId ? 'Paid' : 'Pending';

  return {
    id: deduction.referenceNumber,
    dateOfIncident,
    courierName,
    type,
    amount,
    status,
    backendId,
    backendType,
    userId
  };
};
