/**
 * Validation functions for deductions
 * Replicates validation logic from mb-integration validators
 */

import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/** Limite da coluna `description`/`detail` nas tabelas de deductions no backend. */
export const DEDUCTION_DESCRIPTION_MAX_LENGTH = 500;

function toValidationResult(result: z.SafeParseReturnType<unknown, unknown>): ValidationResult {
  if (result.success) {
    return { isValid: true, errors: [] };
  }
  return {
    isValid: false,
    errors: result.error.issues.map((issue) => ({
      field: String(issue.path[0] ?? ''),
      message: issue.message,
    })),
  };
}

const requiredString = (label: string) =>
  z.string({ required_error: `${label} is required` }).trim().min(1, `${label} is required`);

const positiveAmount = (label: string) =>
  z.preprocess(
    (v) => (v === undefined || v === null || v === '' ? undefined : Number.parseFloat(String(v))),
    z.unknown()
  ).superRefine((v, ctx) => {
    const n = typeof v === 'number' ? v : NaN;
    if (Number.isNaN(n) || n <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} is required and must be greater than 0` });
    }
  });

const requiredId = (label: string) =>
  z.number().optional().superRefine((v, ctx) => {
    if (!v) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} is required` });
    }
  });

const requiredDateLike = (label: string) =>
  z.union([z.string(), z.date(), z.undefined()]).superRefine((v, ctx) => {
    if (v === undefined || v === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} is required` });
      return;
    }
    const date = typeof v === 'string' ? new Date(v) : v;
    if (isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} has an invalid format` });
    }
  });

const optionalDateLike = (label: string) =>
  z.union([z.string(), z.date(), z.undefined()]).superRefine((v, ctx) => {
    if (v === undefined || v === '') return;
    const date = typeof v === 'string' ? new Date(v) : v;
    if (isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} has an invalid format` });
    }
  });

const descriptionField = z
  .string()
  .max(DEDUCTION_DESCRIPTION_MAX_LENGTH, `description must be at most ${DEDUCTION_DESCRIPTION_MAX_LENGTH} characters`)
  .optional();

const detailField = z
  .string()
  .max(DEDUCTION_DESCRIPTION_MAX_LENGTH, `detail must be at most ${DEDUCTION_DESCRIPTION_MAX_LENGTH} characters`)
  .optional();

const requiredDescriptionField = z
  .string({ required_error: 'Description is required' })
  .trim()
  .min(1, 'Description is required')
  .max(DEDUCTION_DESCRIPTION_MAX_LENGTH, `description must be at most ${DEDUCTION_DESCRIPTION_MAX_LENGTH} characters`);

/**
 * Validates Fix Damage Deduction data
 * Based on fixDamageDeductionsValidateInsert.ts
 */
const fixDamageDeductionSchema = z.object({
  referenceNumber: requiredString('Reference number'),
  incidentDate: requiredDateLike('Incident date'),
  repairCost: positiveAmount('Repair cost'),
  totalRepairCost: positiveAmount('Total repair cost'),
  amountChargedVendor: positiveAmount('Amount charged to vendor'),
  userId: requiredId('Vendor'),
  vehicleId: requiredId('Vehicle'),
  entryDate: requiredDateLike('Entry date'),
  description: descriptionField,
});

export function validateFixDamageDeduction(data: {
  referenceNumber?: string;
  incidentDate?: string | Date;
  repairCost?: number | string;
  totalRepairCost?: number | string;
  amountChargedVendor?: number | string;
  userId?: number;
  vehicleId?: number;
  entryDate?: string | Date;
  description?: string;
}): ValidationResult {
  return toValidationResult(fixDamageDeductionSchema.safeParse(data));
}

/**
 * Validates Other Deduction data
 * Based on otherDeductionsValidateInsert.ts
 */
const otherDeductionSchema = z.object({
  referenceNumber: requiredString('Reference number'),
  incidentDate: requiredDateLike('Incident date'),
  totalAmount: positiveAmount('Total amount'),
  userId: requiredId('Vendor'),
  entryDate: requiredDateLike('Entry date'),
  description: descriptionField,
  detail: detailField,
});

export function validateOtherDeduction(data: {
  referenceNumber?: string;
  incidentDate?: string | Date;
  totalAmount?: number | string;
  userId?: number;
  entryDate?: string | Date;
  description?: string;
  detail?: string;
}): ValidationResult {
  return toValidationResult(otherDeductionSchema.safeParse(data));
}

/**
 * Validates Pre-Payment Deduction data
 * Based on prePaymentDeductionsValidateInsert.ts
 */
const prePaymentDeductionSchema = z.object({
  referenceNumber: requiredString('Reference number'),
  amount: positiveAmount('Amount'),
  totalAmount: positiveAmount('Total amount'),
  userId: requiredId('Vendor'),
  entryDate: requiredDateLike('Entry date'),
  initialPaymentDate: optionalDateLike('Initial payment date'),
  description: descriptionField,
});

export function validatePrePaymentDeduction(data: {
  referenceNumber?: string;
  amount?: number | string;
  totalAmount?: number | string;
  userId?: number;
  entryDate?: string | Date;
  initialPaymentDate?: string | Date;
  description?: string;
}): ValidationResult {
  return toValidationResult(prePaymentDeductionSchema.safeParse(data));
}

/**
 * Validates Liquidation Damage Deduction data
 */
const liquidationDamageDeductionSchema = z.object({
  description: requiredDescriptionField,
});

export function validateLiquidationDamageDeduction(data: {
  description?: string;
}): ValidationResult {
  return toValidationResult(liquidationDamageDeductionSchema.safeParse(data));
}

/**
 * Validates Traffic Penalty Deduction data
 */
const trafficPenaltyDeductionSchema = z.object({
  description: descriptionField,
});

export function validateTrafficPenaltyDeduction(data: {
  description?: string;
}): ValidationResult {
  return toValidationResult(trafficPenaltyDeductionSchema.safeParse(data));
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '';
  }

  return errors.map(err => `${err.field}: ${err.message}`).join('\n');
}
