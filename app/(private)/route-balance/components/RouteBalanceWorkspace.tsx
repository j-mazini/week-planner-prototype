"use client";

import { useState } from "react";
import NavbarWrapper from "../../components/NavbarWrapper";
import BoardLoading from "../../components/BoardLoading";
import ActionButton from "../../components/ActionButton";
import KpiCard from "./KpiCard";
import RouteCard from "./RouteCard";
import AddFlexRouteModal from "./modals/AddFlexRouteModal";
import AddPostcodeModal from "./modals/AddPostcodeModal";
import AllStopsModal from "./modals/AllStopsModal";
import ImportModal from "./modals/ImportModal";
import ShipmentDetailsModal from "./modals/ShipmentDetailsModal";
import SpecialDeliveriesModal from "./modals/SpecialDeliveriesModal";
import ToastProvider, { useToast } from "./Toast";
import { useRouteBalanceActions } from "../hooks/useRouteBalanceActions";
import { useRouteBalanceBoard } from "../hooks/useRouteBalanceBoard";
import "../styles.css";
import "../motion.css";
import type { RouteCardModel } from "../types";

type ModalState =
  | { kind: "addFlexRoute" }
  | { kind: "addPostcode" }
  | { kind: "import" }
  | { kind: "shipmentDetails"; route: RouteCardModel }
  | { kind: "allStops"; route: RouteCardModel }
  | { kind: "specialDeliveries"; route: RouteCardModel }
  | null;

function RouteBalanceBoard() {
  const { data: board, isLoading, isError } = useRouteBalanceBoard();
  const { runAction, runImport } = useRouteBalanceActions();
  const { showToast } = useToast();

  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"operations" | "rebalance">("operations");
  const [rebalanceExpanded, setRebalanceExpanded] = useState(true);
  const [validations, setValidations] = useState<Record<string, boolean>>({});
  const [savedValidations, setSavedValidations] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<ModalState>(null);

  function closeModal() {
    setModal(null);
  }

  function fireAction(label: string) {
    runAction(label).catch(() => undefined);
  }

  if (isError) {
    return (
      <div className="route-balance-page">
        <div className="rbf-wrap">
          <div className="rbf-empty">Could not load the board (prototype fetch failure).</div>
        </div>
      </div>
    );
  }

  if (isLoading || !board) return <BoardLoading />;

  const filteredRoutes = board.routes.filter((r) => r.code.toLowerCase().includes(search.toLowerCase()) || r.driverName.toLowerCase().includes(search.toLowerCase()));
  const isRebalance = mode === "rebalance";
  const routesExpanded = isRebalance ? rebalanceExpanded : expanded;
  const isValidated = (route: RouteCardModel) => validations[route.id] ?? savedValidations[route.id] ?? (route.status === "validated");
  const validatedCount = board.routes.filter(isValidated).length;
  const hasChanges = board.routes.some((route) => isValidated(route) !== (savedValidations[route.id] ?? (route.status === "validated")));

  function saveRebalance() {
    setSavedValidations({ ...savedValidations, ...validations });
    setValidations({});
    showToast("Validation saved for this session only — no routes were redistributed or sent.");
  }

  if (modal?.kind === "import") {
    return <div className="route-balance-page"><ImportModal onCancel={closeModal} runImport={runImport} onFinish={() => {
      closeModal();
      showToast("As informações forram carregadas com sucesso", { variant: "import" });
    }} /></div>;
  }

  return (
    <div className={`route-balance-page${routesExpanded ? " rb-expanded" : ""}`} data-mode={mode}>
      <div className="rbf-wrap">
        <div className="rbf-header">
          <div className="rbf-headleft">
            <h1 className="disp">ROUTE BALANCE</h1>
            <p>Operational route management</p>
          </div>
          <div className="rbf-controls">
            <input type="search" aria-label="Search routes" className="rbf-search" placeholder="Search routes..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="rbf-ampm">
              <button type="button" aria-pressed={period === "AM"} onClick={() => setPeriod("AM")}>
                AM
              </button>
              <button type="button" aria-pressed={period === "PM"} onClick={() => setPeriod("PM")}>
                PM
              </button>
            </div>
          </div>
        </div>

        <div className="rbf-actions" style={{ marginTop: 16 }}>
          <ActionButton type="button" className="rbf-btn ghost rbf-mode" aria-pressed={isRebalance} onClick={() => setMode("rebalance")}>
            Rebalance
          </ActionButton>
          <ActionButton type="button" className="rbf-btn ghost rbf-mode" aria-pressed={!isRebalance} onClick={() => setMode("operations")}>
            Operations
          </ActionButton>
          <ActionButton type="button" className="rbf-btn ghost" onClick={() => setModal({ kind: "import" })}>
            Import
          </ActionButton>
          <ActionButton type="button" className="rbf-btn primary" onClick={() => setModal({ kind: "addFlexRoute" })}>
            + Add New Flex Route
          </ActionButton>
          {isRebalance ? <ActionButton className="rbf-btn" disabled={!hasChanges} onClick={saveRebalance}>Save</ActionButton> : <ActionButton type="button" className="rbf-btn" onClick={() => fireAction("Send to Drivers")}>
            Send to Drivers
          </ActionButton>}
        </div>

        {isRebalance ? <section className="rbf-mode-summary" aria-label="Rebalance review">
          <div><strong>REBALANCE</strong><p>Review each route before saving. Demo mode: validation is kept for this session only.</p></div>
          <span role="status">{validatedCount} / {board.routes.length} validated{hasChanges ? " · Unsaved changes" : ""}</span>
          <ActionButton className="rbf-btn ghost" disabled={!hasChanges} onClick={() => setValidations({})}>Discard changes</ActionButton>
        </section> : <div className="rbf-kpis">
          {board.kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>}

        <div className="rbf-toprow">
          <h2 className="disp">Routes</h2>
          <div className="rbf-route-tools">
            <ActionButton className="rbf-toggle" onClick={() => setModal({ kind: "addPostcode" })}>Add Post Code</ActionButton>
            <button type="button" className="rbf-toggle" aria-expanded={routesExpanded} aria-controls="route-balance-grid" onClick={() => isRebalance ? setRebalanceExpanded(!rebalanceExpanded) : setExpanded(!expanded)}>
              {routesExpanded ? "Collapse Routes" : "Expand Routes"}
            </button>
          </div>
        </div>

        {filteredRoutes.length === 0 ? (
          <div className="rbf-empty">No routes match &quot;{search}&quot;.</div>
        ) : (
          <div className="rbf-grid" id="route-balance-grid">
            {filteredRoutes.map((route, index) => (
              <RouteCard
                key={route.id}
                route={savedValidations[route.id] === undefined ? route : { ...route, status: savedValidations[route.id] ? "validated" : route.status === "validated" ? "pending" : route.status }}
                expanded={routesExpanded}
                period={period}
                featured={!routesExpanded && !isRebalance && index === 0}
                rebalancing={isRebalance}
                validated={isValidated(route)}
                onToggleValidation={() => setValidations((current) => ({ ...current, [route.id]: !isValidated(route) }))}
                onSeeDetails={(r) => setModal({ kind: "shipmentDetails", route: r })}
                onSeeAllStops={(r) => setModal({ kind: "allStops", route: r })}
                onSeeSpecialDeliveries={(r) => setModal({ kind: "specialDeliveries", route: r })}
              />
            ))}
          </div>
        )}

        <footer style={{ marginTop: 32, textAlign: "right", fontSize: 10, color: "var(--rbf-ink-faint)" }}>© 2026 LOGIX / SPHERE OPERATIONAL SYSTEMS</footer>
      </div>

      {modal?.kind === "addFlexRoute" && (
        <AddFlexRouteModal
          onCancel={closeModal}
          onSave={() => {
            closeModal();
            fireAction("Add New Flex Route");
          }}
        />
      )}
      {modal?.kind === "addPostcode" && (
        <AddPostcodeModal
          areas={board.postcodeAreas}
          onCancel={closeModal}
          onAdd={(count) => {
            closeModal();
            showToast(`${count} postcode(s) added (prototype, nothing was saved).`);
          }}
        />
      )}
      {modal?.kind === "shipmentDetails" && board.routeDetailsById[modal.route.id] && (
        <ShipmentDetailsModal detail={board.routeDetailsById[modal.route.id]} onClose={closeModal} />
      )}
      {modal?.kind === "allStops" && board.routeDetailsById[modal.route.id] && (
        <AllStopsModal detail={board.routeDetailsById[modal.route.id]} onClose={closeModal} />
      )}
      {modal?.kind === "specialDeliveries" && <SpecialDeliveriesModal route={modal.route} onClose={closeModal} />}
    </div>
  );
}

export default function RouteBalancePage() {
  return (
    <NavbarWrapper>
      <ToastProvider>
        <RouteBalanceBoard />
      </ToastProvider>
    </NavbarWrapper>
  );
}
