import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RouteBalancePage from "./exact/page";

vi.mock("./reference/components/FigmaScreen", () => ({
  FigmaScreen: ({ screenId }: { screenId: string }) => <div data-testid="export-screen">{screenId}</div>,
}));

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("exact Route Balance import", () => {
  it("opens the original overview at its native dimensions without a second sidebar", () => {
    const { container } = render(<RouteBalancePage />);
    expect(screen.getByTestId("export-screen").textContent).toBe("198-6865");
    expect(screen.getByTestId("export-screen").parentElement?.style.width).toBe("1281px");
    expect(container.querySelector(".app-sidebar")).toBeNull();
  });

  it("selects the supplied mobile screen via its original identifier", () => {
    window.history.replaceState(null, "", "/route-balance#322-14616");
    render(<RouteBalancePage />);
    expect(screen.getByTestId("export-screen").textContent).toBe("322-14616");
    expect(screen.getByTestId("export-screen").parentElement?.style.width).toBe("390px");
    window.history.replaceState(null, "", "/route-balance#invalid");
    fireEvent(window, new Event("hashchange"));
    expect(screen.getByTestId("export-screen").textContent).toBe("198-6865");
  });
});
