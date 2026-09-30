import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import NavbarWrapper from "./NavbarWrapper";

const storageKey = "week-planner.sidebar-collapsed";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("sidebar navigation", () => {
  it("collapses, persists across remounts, and expands again", () => {
    const first = render(<NavbarWrapper>Planner</NavbarWrapper>);
    fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
    expect(screen.getByRole("button", { name: "Expand navigation" }).getAttribute("aria-expanded")).toBe("false");
    expect(localStorage.getItem(storageKey)).toBe("true");
    first.unmount();
    render(<NavbarWrapper>Planner</NavbarWrapper>);
    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));
    expect(screen.getByRole("button", { name: "Collapse navigation" }).getAttribute("aria-expanded")).toBe("true");
    expect(localStorage.getItem(storageKey)).toBe("false");
  });

  it("starts compact on a small screen but allows manual expansion", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    render(<NavbarWrapper>Planner</NavbarWrapper>);
    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));
    expect(document.querySelector(".app-shell")?.classList.contains("is-expanded")).toBe(true);
  });

  it("honors an expanded preference on a small screen", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    localStorage.setItem(storageKey, "false");
    render(<NavbarWrapper>Planner</NavbarWrapper>);
    expect(screen.getByRole("button", { name: "Collapse navigation" })).toBeTruthy();
  });

  it("still toggles when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
    render(<NavbarWrapper>Planner</NavbarWrapper>);
    fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
    expect(screen.getByRole("button", { name: "Expand navigation" })).toBeTruthy();
  });
});
