/**
 * Design tokens for the Service Partner Invoice document.
 *
 * Mirrors the reference layout (`baexpress_service_partner_invoice_modern.pdf`):
 * a navy "paper" document with light-blue stat cards, a navy per-partner header
 * bar, a light-blue subtotal strip and a navy grand-total bar.
 *
 * Colors are exposed in two shapes:
 *  - `INVOICE_HEX`  → hex strings for inline styles / on-screen rendering.
 *  - `INVOICE_RGB`  → `[r, g, b]` tuples for jsPDF (`setFillColor`, etc.).
 */

/** Hex colors used by the on-screen invoice document. */
export const INVOICE_HEX = {
  /** Primary brand navy — top band, partner header, grand-total bar. */
  navy: "#122C5E",
  /** Action blue — month pill, accents. */
  blue: "#1C50D9",
  /** Light-blue surface — stat cards, table header, subtotal strip. */
  surface: "#F2F7FF",
  /** Slightly deeper light-blue border for surfaces. */
  surfaceBorder: "#DCE7FB",
  /** Positive amount accent (Total Amount). */
  green: "#1F9D6B",
  /** Deduction amount accent. */
  red: "#B91C1C",
  /** Page background behind the paper. */
  page: "#F4F8FD",
  white: "#FFFFFF",
} as const;

/** RGB tuples for jsPDF rendering, kept in sync with {@link INVOICE_HEX}. */
export const INVOICE_RGB = {
  navy: [18, 44, 94] as [number, number, number],
  blue: [28, 80, 217] as [number, number, number],
  surface: [242, 247, 255] as [number, number, number],
  surfaceBorder: [220, 231, 251] as [number, number, number],
  green: [31, 157, 107] as [number, number, number],
  red: [185, 28, 28] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  textGray: [100, 100, 100] as [number, number, number],
  textDark: [40, 40, 40] as [number, number, number],
} as const;
