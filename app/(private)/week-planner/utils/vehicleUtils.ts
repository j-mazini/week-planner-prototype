import type { WeekPlannerRecord } from '../contexts/PlannerContext';

/**
 * Helper function to extract registration plate from assignment (prioritize raw data)
 * Returns the plate string or empty string if not found
 */
export const getRegistrationPlateFromAssignment = (assignment: WeekPlannerRecord): string => {
  const raw = assignment.raw as Record<string, unknown> | undefined;
  
  const isOffPlaceholder = (v: unknown) =>
    typeof v === "string" && v.trim().toUpperCase() === "OFF";

  // Look for plate from raw data first
  if (raw?.vehicle && typeof raw.vehicle === 'object') {
    const vehicleObj = raw.vehicle as Record<string, unknown>;
    const plate = String(
      vehicleObj.vehicleRegistration_plate ||
      vehicleObj.vehicleDefaultRegistrationPlate ||
      vehicleObj.registration_plate ||
      vehicleObj.registration_plates ||
      ''
    );
    if (plate && !isOffPlaceholder(plate)) return plate;
  }
  
  // Check raw data directly
  const rawPlate = String(
    raw?.registration_plate ||
    raw?.vehicleRegistration_plate ||
    raw?.vehicleDefaultRegistrationPlate ||
    raw?.registration_plates ||
    ''
  );
  if (rawPlate && !isOffPlaceholder(rawPlate)) return rawPlate;
  
  // Fall back to normalized values
  if (assignment.registrationPlate && !isOffPlaceholder(assignment.registrationPlate)) return assignment.registrationPlate;
  return '';
};

/**
 * Helper function to extract vehicle from assignment (prioritize raw data)
 * Returns format: "PLACA (MODEL)" or "PLACA" if no model
 */
export const getVehicleFromAssignment = (assignment: WeekPlannerRecord): string => {
  const raw = assignment.raw as Record<string, unknown> | undefined;
  
  const isOffPlaceholder = (v: unknown) =>
    typeof v === "string" && v.trim().toUpperCase() === "OFF";

  // OFF/day-off não deve mostrar placa/veículo; a API pode retornar "OFF" como placeholder.
  const isDayOff =
    assignment.isDayOff === "true" ||
    raw?.isDayOff === true ||
    String(raw?.isDayOff ?? raw?.isDayOff ?? "").toLowerCase() === "true" ||
    String(assignment.route ?? "").trim().toUpperCase() === "OFF" ||
    String(raw?.route ?? "").trim().toUpperCase() === "OFF" ||
    String(raw?.routeName ?? "").trim().toUpperCase() === "OFF";
  if (isDayOff) return "NOVEHICLE";

  let registrationPlate = '';
  let vehicleModel = '';
  
  // Look for plate and model from raw data first
  if (raw?.vehicle && typeof raw.vehicle === 'object') {
    const vehicleObj = raw.vehicle as Record<string, unknown>;
    registrationPlate = String(
      vehicleObj.vehicleRegistration_plate ||
      vehicleObj.vehicleDefaultRegistrationPlate ||
      vehicleObj.registration_plate ||
      vehicleObj.registration_plates ||
      ''
    );
    vehicleModel = String(
      vehicleObj.vehicleModel ||
      vehicleObj.vehicleDefaultModel ||
      ''
    );
  }
  
  // If not found in raw data, fall back to normalized values
  if (!registrationPlate) {
    registrationPlate = assignment.registrationPlate || '';
  }
  if (!vehicleModel) {
    vehicleModel = assignment.vehicle || '';
  }
  
  // If backend uses "OFF" as a placeholder for "no vehicle", treat it as missing.
  if (isOffPlaceholder(registrationPlate)) registrationPlate = '';

  // If there's no plate, use 'NOVEHICLE' as default
  if (!registrationPlate) {
    return 'NOVEHICLE';
  }
  
  // Format as "PLATE (MODEL)" or just "PLATE" when model is missing
  if (vehicleModel) {
    return `${registrationPlate} (${vehicleModel})`;
  }
  
  return registrationPlate;
};



