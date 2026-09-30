import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ROUTE_BALANCE_BOARD } from "@/lib/mocks/route-balance-fixtures";
import { useRouteBalanceBoard } from "../hooks/useRouteBalanceBoard";
import RouteBalancePage from "../operational/page";

vi.mock("next/navigation", () => ({ usePathname: () => "/route-balance" }));
vi.mock("../hooks/useRouteBalanceBoard");
vi.mock("../hooks/useRouteBalanceActions", () => ({ useRouteBalanceActions: () => ({ runAction: vi.fn(async () => undefined), runImport: vi.fn() }) }));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
  vi.mocked(useRouteBalanceBoard).mockReturnValue({ data: ROUTE_BALANCE_BOARD, isLoading: false, isError: false } as ReturnType<typeof useRouteBalanceBoard>);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("integrated Route Balance", () => {
  it("switches modes, preserves review drafts and saves validation for the session", () => {
    render(<RouteBalancePage />);
    expect(screen.getByRole("button", { name: "Operations" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Rebalance" }));
    expect(screen.getAllByRole("table")).toHaveLength(8);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    const save = screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    const validate = screen.getByRole("button", { name: "Validate ROUTE A-01" });
    const initial = validate.getAttribute("aria-pressed");
    fireEvent.click(validate);
    expect(validate.getAttribute("aria-pressed")).not.toBe(initial);
    expect(save.disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Operations" }));
    expect(screen.getAllByRole("progressbar")).toHaveLength(8);
    expect(screen.queryAllByRole("table")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Rebalance" }));
    expect(screen.getByRole("button", { name: "Validate ROUTE A-01" }).getAttribute("aria-pressed")).not.toBe(initial);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText(/Validation saved for this session only/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Validate ROUTE A-01" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(screen.getByRole("button", { name: "Validate ROUTE A-01" }).getAttribute("aria-pressed")).not.toBe(initial);
  });

  it("preserves search and period between modes and keeps postcode entry separate", () => {
    render(<RouteBalancePage />);
    fireEvent.click(screen.getByRole("button", { name: "PM" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search routes" }), { target: { value: "A-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Rebalance" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "PM" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Add Post Code" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Rebalance" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("uses one shared navigation and filters real route components", () => {
    render(<RouteBalancePage />);
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Route Balance" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Week Planner" }).getAttribute("href")).toBe("/week-planner");
    expect(screen.getAllByRole("article")).toHaveLength(8);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search routes" }), { target: { value: "A-01" } });
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("expands route contents without swapping to a fixed-width canvas", () => {
    render(<RouteBalancePage />);
    expect(screen.queryAllByRole("table")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Expand Routes" }));
    expect(screen.getAllByRole("table")).toHaveLength(8);
    fireEvent.click(screen.getByRole("button", { name: "Collapse Routes" }));
    expect(screen.queryAllByRole("table")).toHaveLength(0);
    expect(document.querySelector(".figma-layer")).toBeNull();
  });

  it("opens a shared dialog, traps focus, closes on Escape and restores focus", () => {
    render(<RouteBalancePage />);
    const trigger = screen.getByRole("button", { name: "+ Add New Flex Route" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Add New Flex Route" })).toBeTruthy();
    const close = screen.getByRole("button", { name: "Close" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Save Route" }));
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });

  it("uses the same loading component as Week Planner", () => {
    vi.mocked(useRouteBalanceBoard).mockReturnValue({ data: undefined, isLoading: true, isError: false } as ReturnType<typeof useRouteBalanceBoard>);
    render(<RouteBalancePage />);
    expect(screen.getByText("Loading board…")).toBeTruthy();
    expect(screen.getByRole("navigation")).toBeTruthy();
  });
});
