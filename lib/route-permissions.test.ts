import { describe, expect, it } from "vitest";

import {
  BUSINESS_RULES,
} from "@/src/constants/businessRules";
import {
  MY_PERFORMANCE_ROUTES,
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
      canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/week-planner")
    ).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/vendor")).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/vehicles")).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/home")).toBe(false);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/invoices")).toBe(false);
    expect(
      canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/daily-financial-insights")
    ).toBe(false);
  });

  it("shares personal driver pages with admins and supervisors", () => {
    for (const role of [BUSINESS_RULES.USER_TYPE.ADMIN, BUSINESS_RULES.USER_TYPE.SUPERVISOR, BUSINESS_RULES.USER_TYPE.DRIVER]) {
      for (const path of MY_PERFORMANCE_ROUTES) {
        expect(canAccessPath(role, path)).toBe(true);
        expect(canAccessPath(role, `${path}/details`)).toBe(true);
      }
    }
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/requests-admin")).toBe(false);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/vendor-performance")).toBe(false);
  });

  it("lets admins and supervisors reach the operations route balance", () => {
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.ADMIN, "/route-balance")).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/route-balance")).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.DRIVER, "/route-balance")).toBe(false);
  });

  it("lets admins and supervisors reach the clearing desk", () => {
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.ADMIN, "/clearing-desk")).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/clearing-desk")).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.DRIVER, "/clearing-desk")).toBe(false);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SERVICE_PARTNER, "/clearing-desk")).toBe(false);
  });

  it("keeps the personal route balance distinct from the operations one", () => {
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.DRIVER, "/driver-route-balance")).toBe(true);
    expect(canAccessPath(BUSINESS_RULES.USER_TYPE.SUPERVISOR, "/driver-route-balance")).toBe(true);
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
      canSeeSidebar: true,
      canSeeFinancial: false,
      canSeeVendorRequests: false,
    });
  });
});
