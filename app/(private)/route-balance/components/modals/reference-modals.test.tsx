import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ROUTE_BALANCE_BOARD, ROUTE_BALANCE_IMPORT_PREVIEW } from "@/lib/mocks/route-balance-fixtures";
import AddFlexRouteModal from "./AddFlexRouteModal";
import AddPostcodeModal from "./AddPostcodeModal";
import ShipmentDetailsModal from "./ShipmentDetailsModal";
import AllStopsModal from "./AllStopsModal";
import SpecialDeliveriesModal from "./SpecialDeliveriesModal";
import ImportModal from "./ImportModal";

afterEach(cleanup);

describe("Route Balance reference modals", () => {
  it("renders the three fields from the flex-route export, without the extra free-text field", () => {
    render(<AddFlexRouteModal onCancel={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getAllByRole("combobox")).toHaveLength(3);
    expect(screen.getByRole("combobox", { name: "ROUTE_NAME" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "ASSIGNED_DRIVER" })).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByRole("dialog").classList.contains("rbm-form")).toBe(true);
  });

  it("supports closed, expanded, selected-chip and removal states for postcodes", () => {
    const onAdd = vi.fn(), onCancel = vi.fn();
    render(<AddPostcodeModal areas={ROUTE_BALANCE_BOARD.postcodeAreas} onAdd={onAdd} onCancel={onCancel} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Select postcodes" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "ALL_POSTCODES" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "ME15 2AB" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "ME15 4AB" }));
    fireEvent.keyDown(screen.getByRole("checkbox", { name: "ME15 4AB" }), { key: "Escape" });
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.queryByRole("checkbox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Remove ME15 2AB" }));
    fireEvent.click(screen.getByRole("button", { name: "ADD" }));
    expect(onAdd).toHaveBeenCalledWith(1);
  });

  it("clears stale postcode choices when changing area", () => {
    const onAdd = vi.fn();
    render(<AddPostcodeModal areas={ROUTE_BALANCE_BOARD.postcodeAreas} onAdd={onAdd} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByRole("combobox", { name: "AREA" }), { target: { value: "ME1" } });
    fireEvent.click(screen.getByRole("button", { name: "ADD" }));
    expect(onAdd).toHaveBeenCalledWith(4);
  });

  it("uses the reference shipment grid and all five breakdown columns", () => {
    const detail = Object.values(ROUTE_BALANCE_BOARD.routeDetailsById)[0];
    render(<ShipmentDetailsModal detail={detail} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog").classList.contains("rbm-shipment")).toBe(true);
    expect(screen.getByText("VEHICLE")).toBeTruthy();
    expect(screen.getByText("SPECIAL INDICATORS")).toBeTruthy();
    expect(within(screen.getByRole("table")).getAllByRole("columnheader")).toHaveLength(5);
    expect(screen.getByText("TOTAL", { exact: true })).toBeTruthy();
  });

  it("uses the wide reference table for stops and supports sorting", () => {
    render(<AllStopsModal detail={Object.values(ROUTE_BALANCE_BOARD.routeDetailsById)[0]} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog").classList.contains("rbm-wide")).toBe(true);
    fireEvent.change(screen.getByRole("combobox", { name: "Sort stops" }), { target: { value: "postcode" } });
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
  });

  it("keeps the exact special-deliveries title and three-column table", () => {
    render(<SpecialDeliveriesModal route={ROUTE_BALANCE_BOARD.routes[0]} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: "Special Deliveries" })).toBeTruthy();
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
  });

  it("renders import as a workspace, processes the selected file, then returns to balance", async () => {
    const runImport = vi.fn(async () => ROUTE_BALANCE_IMPORT_PREVIEW), onFinish = vi.fn();
    render(<ImportModal onCancel={vi.fn()} onFinish={onFinish} runImport={runImport} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect((screen.getByRole("button", { name: "PROCESS" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("DISCO Excel file"), { target: { files: [new File(["data"], "routes.xlsx")] } });
    fireEvent.click(screen.getByRole("button", { name: "PROCESS" }));
    await screen.findByRole("button", { name: "GO TO BALANCE" });
    expect(screen.getAllByRole("table")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "GO TO BALANCE" }));
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("handles invalid files and processing errors without leaving the flow stuck", async () => {
    const runImport = vi.fn(async () => { throw new Error("offline"); });
    render(<ImportModal onCancel={vi.fn()} onFinish={vi.fn()} runImport={runImport} />);
    const input = screen.getByLabelText("DISCO Excel file");
    fireEvent.change(input, { target: { files: [new File(["data"], "routes.txt")] } });
    expect(screen.getByRole("alert").textContent).toContain(".xlsx");
    fireEvent.change(input, { target: { files: [new File(["data"], "routes.xlsx")] } });
    fireEvent.click(screen.getByRole("button", { name: "PROCESS" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("try again"));
    expect((screen.getByRole("button", { name: "PROCESS" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
