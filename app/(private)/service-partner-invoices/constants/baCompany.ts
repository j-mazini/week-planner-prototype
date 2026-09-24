/**
 * BA Express company identity used by the "cabeçalho da BA" (BA header).
 *
 * Mirrors the values rendered into PDF exports by `createPDFWithHeader`
 * (`lib/pdf-utils.ts`). Kept here as a single source for the on-screen header so
 * the screen and the PDF stay consistent.
 */
export const BA_COMPANY = {
  name: "BA EXPRESS LIMITED",
  shortCode: "BA",
  address: "20 The Laurels",
  email: "info@baexpress.co.uk",
  vat: "VAT: GB238595859",
} as const;
