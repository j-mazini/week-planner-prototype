import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes various date formats (ISO, space-separated, Date object) to YYYY-MM-DD.
 */
export function normalizeDate(date: unknown): string {
    if (!date) return "";
    if (date instanceof Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
    }
    if (typeof date === "string") {
    const input = date.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

    // ISO-like values
    if (input.includes("T")) {
      const isoDate = input.split("T")[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
    }

    // RFC/JS date strings (e.g. "Mon May 06 2026 00:00:00 GMT...")
    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, "0");
      const dd = String(parsed.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    // Space separated fallback
    const firstToken = input.split(" ")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(firstToken)) return firstToken;

    return input;
    }
    return String(date);
}

/**
 * Formats a vendor ID by combining user initials with padded user ID
 * @param firstName - User's first name
 * @param lastName - User's last name  
 * @param userId - User's ID number
 * @returns Formatted vendor ID (e.g., "CP001", "AS012", "JS123")
 */
export function formatVendorId(firstName: string, lastName: string, userId: number | string): string {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  const userIdStr = userId.toString();
  
  // Pad userId with zeros based on length
  let paddedUserId;
  if (userIdStr.length === 1) {
    paddedUserId = `00${userIdStr}`;      // 1 → 001
  } else if (userIdStr.length === 2) {
    paddedUserId = `0${userIdStr}`;       // 12 → 012
  } else {
    paddedUserId = userIdStr;             // 123 → 123
  }
  
  return `${firstInitial}${lastInitial}${paddedUserId}`;
}