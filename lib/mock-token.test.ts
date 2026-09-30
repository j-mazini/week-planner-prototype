// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mockToken } from "./mock-api";
import { decodeJwtPayload } from "./auth";

describe("the offline token", () => {
  it("decodes like a real one, so signing in logs no errors", () => {
    expect(() => decodeJwtPayload(mockToken)).not.toThrow();
  });

  it("carries the tenant fields the login flow reads off the token", () => {
    const payload = decodeJwtPayload(mockToken);
    expect(payload.companyId).toBe(1);
    expect(payload.userId).toBe(101);
    expect(payload.userTypeId).toBe(1);
    expect(payload.servicePartnerId).toBeNull();
  });
});
