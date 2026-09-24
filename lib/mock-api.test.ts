import { describe, expect, it } from "vitest";
import { isMockApiRequest, mockPayload, mockResponse } from "./mock-api";
import { getApiBaseUrl } from "./apiBaseUrl";
import { apiClient } from "./api-client";

describe("offline API contracts", () => {
  it("preserves query options passed through the API client", async () => {
    expect(await apiClient("/bff/vehicles", { params: { page: 1, limit: 10 } })).toMatchObject({ data: expect.any(Array), pagination: { currentPage: 1, totalItems: 12 } });
  });
  it.each([
    "/bff/reports?date=2026-09-24", "/bff/reports/by-date-range",
    "/bff/deductions/101/09/2026", "/bff/day-overview/101/2026-09-24",
    "/bff/vehicles", "/bff/vehicle-types", "/bff/vendor-types", "/bff/user-types",
    "/bff/service-types", "/bff/operations", "/bff/management-team-functions",
    "/bff/invoices", "/bff/service-partner-invoices", "/bff/vendor",
  ])("returns a native collection for %s", (endpoint) => {
    expect(Array.isArray(mockPayload(endpoint))).toBe(true);
  });

  it.each([
    "/bff/vehicles?page=1&limit=10", "/bff/operations/paginated",
    "/bff/week-planners/without-operations/paginated",
    "/bff/reports/daily-operations-insights",
  ])("preserves pagination for %s", (endpoint) => {
    expect(mockPayload(endpoint)).toMatchObject({ data: expect.any(Array), pagination: { currentPage: 1, totalItems: 12 } });
  });

  it("resolves an absolute offline URL without a configured backend", () => {
    const url = new URL(`${getApiBaseUrl()}/bff/vehicles`);
    expect(url.hostname).toBe("mock.local");
    expect(isMockApiRequest(url.href)).toBe(true);
    expect(isMockApiRequest("/_next/static/chunk.js")).toBe(false);
    expect(isMockApiRequest("/route-balance/screens/example.json")).toBe(false);
  });

  it("returns a parseable mock response", async () => {
    const response = mockResponse("/bff/operations/paginated");
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Logix-Mock")).toBe("true");
    expect(await response.json()).toMatchObject({ data: expect.any(Array), pagination: { totalItems: 12 } });
  });
});
