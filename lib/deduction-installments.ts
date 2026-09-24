/**
 * Utility functions for calculating installments from deductions
 * based on schedule_terms (aggregated rule logic)
 * Replicates the logic from mb-integration validators
 */

/**
 * Returns the last calendar day of the month for the given date.
 */
function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface InstallmentPreview {
  installmentNumber: number;
  date: string; // ISO date string
  amount: number;
  totalAmount: number;
  referenceNumber?: string; // Reference number for this installment
}

/**
 * Parses schedule_terms string to extract number of installments
 * Supports formats like: "3x", "3 months", "3", "3 instalments", etc.
 * Returns null if schedule_terms is empty/null (will use default $200 max logic)
 */
export function parseScheduleTerms(scheduleTerms: string | null | undefined): number | null {
  if (!scheduleTerms || !scheduleTerms.trim()) {
    return null; // null means use default $200 max logic
  }

  // Remove extra whitespace and convert to lowercase
  const cleaned = scheduleTerms.trim().toLowerCase();

  // Try to extract number from various formats
  // Match patterns like: "3x", "3 months", "3 instalments", "3", etc.
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    if (num > 0 && num <= 120) { // Reasonable limit: max 120 installments
      return num;
    }
  }

  return null;
}

/**
 * Validates inputs for installment calculation
 */
export function validateInstallmentInputs(
  totalAmount: number,
  referenceNumber: string,
  entryDate: Date | string
): boolean {
  if (!totalAmount || totalAmount <= 0) {
    return false;
  }

  if (!referenceNumber || referenceNumber.trim() === '') {
    return false;
  }

  const date = typeof entryDate === 'string'
    ? new Date(entryDate.length === 10 ? entryDate + 'T00:00:00' : entryDate)
    : entryDate;
  if (!date || isNaN(date.getTime())) {
    return false;
  }

  return true;
}

/**
 * Calculates installments based on schedule_terms and total amount
 * Replicates the logic from mb-integration installmentLogicHelper
 * 
 * Rules:
 * - If schedule_terms is null/empty: max $200 per installment (except last one gets remainder)
 * - If schedule_terms has value: divide equally without $200 limit
 * - First installment on day 30 of current month (or next month if entry date > day 30)
 * - For fix damage deductions (RPD-*): first installment in current month, others in following months
 * - Reference numbers increment for subsequent installments
 * 
 * @param totalAmount - Total amount to be divided into installments
 * @param scheduleTerms - Schedule terms string (e.g., "3x", "3 months") or null/empty
 * @param referenceNumber - Base reference number for the deduction
 * @param entryDate - Entry date for the deduction
 * @param holidays - Optional list of bank holidays strings (YYYY-MM-DD)
 * @returns Array of installment previews or null if invalid
 */
export function calculateInstallments(
  totalAmount: number,
  scheduleTerms: string | null | undefined,
  referenceNumber: string,
  entryDate: string | Date,
  _holidays: string[] = []
): InstallmentPreview[] | null {
  // Validate inputs
  // Append T00:00:00 to force local time parsing and avoid UTC offset shifting the date
  const entry = typeof entryDate === 'string'
    ? new Date(entryDate.length === 10 ? entryDate + 'T00:00:00' : entryDate)
    : entryDate;
  if (!validateInstallmentInputs(totalAmount, referenceNumber, entry)) {
    return null;
  }

  const maxInstallmentValue = 200; // Max $200 per installment when schedule is null
  let numberOfInstallments: number;
  let installmentValue: number;
  let remainder: number;

  // Determine number of installments and value per installment
  const parsedSchedule = parseScheduleTerms(scheduleTerms);
  
  if (!parsedSchedule) {
    // Schedule null/empty: use default logic based on $200 max per installment
    if (totalAmount <= maxInstallmentValue) {
      // Small amounts: single installment with total amount
      numberOfInstallments = 1;
      installmentValue = totalAmount;
      remainder = 0;
    } else {
      // Larger amounts: calculate how many $200 installments are needed
      numberOfInstallments = Math.ceil(totalAmount / maxInstallmentValue);
      installmentValue = maxInstallmentValue;
      remainder = totalAmount - (installmentValue * (numberOfInstallments - 1));
    }
  } else {
    // Schedule has value: extract number and use as number of installments
    numberOfInstallments = parsedSchedule;
    
    // When schedule is not null, divide equally without $200 limit
    installmentValue = Math.floor(totalAmount / numberOfInstallments);
    remainder = totalAmount - (installmentValue * numberOfInstallments);
  }

  const installments: InstallmentPreview[] = [];

  // Rule: First installment should be on day 30 of current month
  // Check if it's fix damage deduction based on reference_number
  // Format expected: RPD-GSOUZA-130925-001 (contains "RPD" at start)
  const isFixDamageDeduction = referenceNumber.toUpperCase().startsWith('RPD-');
  
  // First installment is the last calendar day of the current month.
  // If entry date is already on the last day of the month, push to next month.
  const currentMonthLastDay = getLastDayOfMonth(entry);
  const firstInstallmentDate = entry.getDate() >= currentMonthLastDay.getDate()
    ? getLastDayOfMonth(new Date(entry.getFullYear(), entry.getMonth() + 1, 1))
    : currentMonthLastDay;

  // Generate installments
  for (let i = 0; i < numberOfInstallments; i++) {
    // Rule: First installment uses same reference_number, others increment
    let installmentReferenceNumber: string;
    if (i === 0) {
      // First installment: use same reference_number
      installmentReferenceNumber = referenceNumber;
    } else {
      // Other installments: increment the last number in reference_number
      const baseNumberMatch = referenceNumber.match(/(\d+)$/);
      if (baseNumberMatch) {
        const baseNumber = parseInt(baseNumberMatch[1]);
        const newNumber = baseNumber + i;
        const paddedNumber = newNumber.toString().length === 1 ? `00${newNumber}` : 
                            newNumber.toString().length === 2 ? `0${newNumber}` : 
                            newNumber.toString();
        installmentReferenceNumber = referenceNumber.replace(/\d+$/, paddedNumber);
      } else {
        // Fallback if can't extract number
        const installmentNumberString = (i + 1).toString().length === 1 ? `0${i + 1}` : `${i + 1}`;
        installmentReferenceNumber = `${referenceNumber}-${installmentNumberString}`;
      }
    }

    // Rule: Other installments should be on day 30 of following months
    // Create a new date based on firstInstallmentDate and increment months
    let installmentDate: Date;
    
    // For fix damage deductions, first installment is in current month, others in following months
    if (isFixDamageDeduction && i === 0) {
      // First installment: last calendar day of current month
      installmentDate = getLastDayOfMonth(entry);
    } else {
      // Other installments: increment based on index
      // Start from the first installment date's year and month, then add months
      const baseYear = firstInstallmentDate.getFullYear();
      const baseMonth = firstInstallmentDate.getMonth();
      
      // Create a new date for the target month (using day 1 to avoid date overflow issues)
      const targetMonth = baseMonth + i;
      installmentDate = new Date(baseYear, targetMonth, 1);
      
      // Use the last calendar day of the target month
      installmentDate = getLastDayOfMonth(installmentDate);
    }

    // Calculate installment value
    let currentInstallmentValue = installmentValue;
    if (i === numberOfInstallments - 1 && numberOfInstallments > 1) {
      // Last installment: different logic based on schedule_terms
      if (!parsedSchedule) {
        // Schedule null: last installment gets only remainder
        currentInstallmentValue = remainder;
      } else {
        // Schedule not null: last installment gets base value + remainder
        currentInstallmentValue = installmentValue + remainder;
      }
    } else if (i === numberOfInstallments - 1 && numberOfInstallments === 1) {
      // If only 1 installment, use total amount
      currentInstallmentValue = totalAmount;
    }

    // Format date as YYYY-MM-DD using local timezone (not UTC)
    const formattedDate = formatDateToString(installmentDate);

    installments.push({
      installmentNumber: i + 1,
      date: formattedDate, // YYYY-MM-DD format using local timezone, adjusted to business day
      amount: Math.round(currentInstallmentValue * 100) / 100, // Round to 2 decimal places
      totalAmount: totalAmount,
      referenceNumber: installmentReferenceNumber,
    });
  }

  return installments;
}

/**
 * Formats installment preview for display
 */
export function formatInstallmentPreview(installments: InstallmentPreview[]): string {
  if (!installments || installments.length === 0) {
    return 'No installments';
  }

  return installments.map(inst => {
    const date = new Date(inst.date);
    const formattedDate = date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    return `Installment ${inst.installmentNumber}: £${inst.amount.toFixed(2)} on ${formattedDate}`;
  }).join('\n');
}

