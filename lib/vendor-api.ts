import { VENDOR_PAGE_DATA_FIXTURE } from "./mocks/vendor-fixtures";
import { mapVendorPageDataDtoToModel } from "@/app/(private)/vendor/utils/vendorMappers";
import type { VendorModel, VendorPageDataModel } from "@/app/(private)/vendor/types";

const MOCK_DELAY_MS = 400;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves the local fixture — this prototype has no backend or database. */
export async function fetchVendorPageData(): Promise<VendorPageDataModel> {
  await wait(MOCK_DELAY_MS);
  return mapVendorPageDataDtoToModel(VENDOR_PAGE_DATA_FIXTURE);
}

let nextId = 1000;

/** In-memory only — nothing persists past a page refresh (no backend, no database). */
export async function saveVendor(data: Partial<VendorModel>): Promise<VendorModel> {
  await wait(300);
  return { ...(data as VendorModel), id: data.id ?? nextId++ };
}
