import type { FixDamageDeduction, TrafficPenaltyDeduction, PrePaymentDeduction, LiquidationDamageDeduction, OtherDeduction, FixDamageInstallment, PrePaymentInstallment, OtherInstallment } from '@/lib/deductions-api';
import type { DisplayDeduction } from './types';
import { formatDateToString } from './utils';
import { Vendor } from '@/lib/vendors';

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
    if (usersMap.has(userId)) {
      courierName = usersMap.get(userId)!;
    } else {
      // Fallback: buscar diretamente na lista de vendors
      const vendor = vendorList.find(d => d.userId === userId);
      if (vendor) {
        courierName = vendor.fullName;
      } else {
        console.warn(`vendor not found for userId: ${userId}`);
        courierName = `vendor ID: ${userId}`;
      }
    }
  }

  let dateOfIncident = '';
  let amount = 0;
  let invoiceId: number | undefined;

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
    amount = d.amountChargedVendor;
    invoiceId = undefined;
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
    invoiceId = d.invoiceId;
  } else if (type === 'Pre-Payments') {
    const d = deduction as PrePaymentDeduction;
    if (typeof d.entryDate === 'string') {
      const str = d.entryDate;
      dateOfIncident = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
    } else {
      dateOfIncident = formatDateToString(d.entryDate);
    }
    amount = d.amount;
    invoiceId = undefined;
  } else if (type === 'Liquidation Damages') {
    const d = deduction as LiquidationDamageDeduction;
    if (typeof d.liquidationDate === 'string') {
      const str = d.liquidationDate;
      dateOfIncident = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
    } else {
      dateOfIncident = formatDateToString(d.liquidationDate);
    }
    amount = d.amount;
    invoiceId = d.invoiceId;
  } else if (type === 'Other') {
    const d = deduction as OtherDeduction;
    if (typeof d.incidentDate === 'string') {
      const str = d.incidentDate;
      dateOfIncident = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
    } else {
      dateOfIncident = formatDateToString(d.incidentDate);
    }
    amount = d.totalAmount;
    invoiceId = undefined;
  }

  const id = 'referenceNumber' in deduction ? deduction.referenceNumber :
    (deduction as FixDamageDeduction).fixDamageId?.toString() ||
    (deduction as TrafficPenaltyDeduction).trafficPenaltyId?.toString() ||
    (deduction as PrePaymentDeduction).prePaymentId?.toString() ||
    (deduction as LiquidationDamageDeduction).liquidationDamageId?.toString() ||
    (deduction as OtherDeduction).otherDeductionId?.toString() ||
    `DD-${Math.random().toString(36).substr(2, 9)}`;

  const backendId = (deduction as FixDamageDeduction).fixDamageId ||
    (deduction as TrafficPenaltyDeduction).trafficPenaltyId ||
    (deduction as PrePaymentDeduction).prePaymentId ||
    (deduction as LiquidationDamageDeduction).liquidationDamageId ||
    (deduction as OtherDeduction).otherDeductionId ||
    0;

  const backendType: DisplayDeduction['backendType'] = type === 'Repairs & Damages' ? 'fix-damage' :
    type === 'Traffic Penalties' ? 'traffic-penalty' :
      type === 'Pre-Payments' ? 'pre-payment' :
        type === 'Liquidation Damages' ? 'liquidation-damage' : 'other';

  // Status logic: if invoiceId exists, then Paid, otherwise Pending
  const status: 'Paid' | 'Pending' | 'Disputed' = invoiceId ? 'Paid' : 'Pending';

  return {
    id,
    dateOfIncident,
    courierName,
    type,
    amount,
    status,
    backendId,
    backendType,
    ...deduction
  };
};

// Helper function to transform installment to DisplayDeduction
export const transformInstallmentToDisplay = (
  installment: FixDamageInstallment | PrePaymentInstallment | OtherInstallment,
  type: string,
  usersMap: Map<number, string>,
  vendorList: Vendor[]
): DisplayDeduction | null => {
  // Use userId directly from installment
  const userId = installment.userId || 0;
  let courierName = 'Unknown Vendor';

  if (userId > 0) {
    // Use the userId from the installment
    if (usersMap.has(userId)) {
      courierName = usersMap.get(userId)!;
    } else {
      const vendor = vendorList.find(d => d.userId === userId);
      if (vendor) {
        courierName = vendor.fullName;
      } else {
        console.warn(`Vendor not found for userId: ${userId}`);
        courierName = `Vendor ID: ${userId}`;
      }
    }
  }

  // Preserve the original calendar date from the backend without timezone shifts.
  // If we receive an ISO string (e.g. "2025-12-31T00:00:00.000Z"), we take only
  // the date portion so that "2025-12-31" is not converted to "2025-12-30"
  // when rendered in a different timezone.
  let installmentDate: string;
  if (typeof installment.installmentDate === 'string') {
    const str = installment.installmentDate;
    installmentDate = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
  } else {
    installmentDate = formatDateToString(installment.installmentDate);
  }

  const amount = parseFloat(installment.installmentValue) || 0;
  const status: 'Paid' | 'Pending' | 'Disputed' = installment.invoiceId ? 'Paid' : 'Pending';

  // Get backend ID from installment
  const backendId = 'fixDamageId' in installment ? installment.fixDamageId :
    'prePaymentId' in installment ? installment.prePaymentId :
      'otherDeductionId' in installment ? installment.otherDeductionId : 0;

  return {
    id: installment.referenceNumber,
    dateOfIncident: installmentDate,
    courierName,
    type,
    amount,
    status,
    backendId,
    backendType: type === 'Repairs & Damages' ? 'fix-damage' :
      type === 'Pre-Payments' ? 'pre-payment' : 'other',
    userId,
    isInstallment: true,
    installmentId: 'fixDamageInstallmentsId' in installment ? installment.fixDamageInstallmentsId :
      'prePaymentInstallmentsId' in installment ? installment.prePaymentInstallmentsId :
        'otherInstallmentsId' in installment ? installment.otherInstallmentsId : 0,
  };
};





