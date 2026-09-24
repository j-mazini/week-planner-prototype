import { describe, expect, it } from "vitest";

import {
  BUSINESS_RULES,
} from "@/src/constants/businessRules";
import {
  canAccessPath,
  getBeamSidebarAccess,
  isPathAllowed,
} from "./route-permissions";

describe("route permissions", () => {
  it("matches exact paths and nested paths only", () => {
    expect(isPathAllowed("/requests", ["/requests"])).toBe(true);
    expect(isPathAllowed("/requests/history", ["/requests"])).toBe(true);
    expect(isPathAllowed("/requests-inbox", ["/requests"])).toBe(false);
  });

  it("allows drivers only on their whitelisted pages", () => {
    expect(
      canAccessPath(BUSINESS_RULES.USER_TYPE.DRIVER, "/requests")
    ).toBe(true);
    expect(
      canAccessPath(BUSINESS_RULES.USER_TYPE.DRIVER, "/vendor")
    ).toBe(false);
  });

  it("allows supervisors only on their whitelisted pages", () => {
    expect(
      canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/home")
    ).toBe(true);
    expect(
      canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/daily-financial-insights")
    ).toBe(false);
  });

  it("grants admins unrestricted private-route access", () => {
    expect(
      canAccessPath(BUSINESS_RULES.USER_TYPE.ADMIN, "/contract-management")
    ).toBe(true);
  });

  it("derives beam sidebar visibility from user type instead of string roles", () => {
    expect(
      getBeamSidebarAccess(BUSINESS_RULES.USER_TYPE.SUPERVISOR)
    ).toEqual({
      canSeeSidebar: true,
      canSeeFinancial: false,
      canSeeVendorRequests: false,
    });

    expect(
      getBeamSidebarAccess(BUSINESS_RULES.USER_TYPE.DRIVER)
    ).toEqual({
      canSeeSidebar: false,
      canSeeFinancial: false,
      canSeeVendorRequests: false,
    });
  });
});
