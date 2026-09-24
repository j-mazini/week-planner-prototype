import type { WeekPlannerRecord, WeekPlannerTypes } from '../contexts/PlannerContext';

/**
 * Run validations on week planner records
 */
export const runValidations = (
  dataToValidate: WeekPlannerRecord[],
  weekPlannerTypes: WeekPlannerTypes
): string[] => {
  const errors: string[] = [];
  const registrationPlateMap = new Map<string, string>();
  const workingWeekPlanners = dataToValidate.filter(
    (item) => item.status?.toLowerCase() === "working",
  );

  workingWeekPlanners.forEach((item) => {
    const registrationPlate = item.registrationPlate?.trim();
    if (registrationPlate && registrationPlate.toUpperCase() !== "NOVEHICLE") {
      if (registrationPlateMap.has(registrationPlate)) {
        errors.push(
          `Duplicate Registration Plate: "${registrationPlate}" is assigned to ${item.name} and ${registrationPlateMap.get(
            registrationPlate,
          )}.`,
        );
      } else {
        registrationPlateMap.set(registrationPlate, item.name);
      }
    }
  });

  // Only validate against vendor list if we have it from the API
  if (weekPlannerTypes.vendors && weekPlannerTypes.vendors.length > 0) {
    const reportVendors = new Set(dataToValidate.map((item) => item.name));
    weekPlannerTypes.vendors.forEach((vendor) => {
      const vendorName = typeof vendor === "string" 
        ? vendor 
        : (vendor as { value?: string; label?: string; name?: string }).name 
        || (vendor as { value?: string; label?: string; name?: string }).label 
        || String(vendor);
      if (!reportVendors.has(vendorName)) {
        errors.push(`Missing Vendor: "${vendorName}" is not in the report.`);
      }
    });
  }

  return errors;
};

