"use client";

import { useState } from "react";
import NavbarWrapper from "../components/NavbarWrapper";
import ToastProvider from "./components/Toast";
import "./styles.css";
import AdhocSection from "./components/AdhocSection";
import DayGrid from "./components/DayGrid";
import DepotTabs from "./components/DepotTabs";
import PlannerModalHost, { type ModalKind } from "./components/modals/modalConfigs";
import TeamLeaderTrack from "./components/TeamLeaderTrack";
import WeekPickerButton from "./components/WeekPickerButton";
import { DEFAULT_DEPOT_ID, HEADER_ACTIONS, WEEK_OPTIONS } from "./constants";
import { useWeekPlannerBoard } from "./hooks/useWeekPlannerBoard";
import { useToast } from "./components/Toast";
import type { RouteCardModel, WeekOption } from "./types";

function WeekPlannerBoard() {
  const [depot, setDepot] = useState<string>(DEFAULT_DEPOT_ID);
  const [week, setWeek] = useState<WeekOption>(WEEK_OPTIONS.find((w) => w.state === "current")!);
  const [leaderIndex, setLeaderIndex] = useState(0);
  const [showWeekend, setShowWeekend] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>("2024-07-16");
  const [modal, setModal] = useState<ModalKind>(null);
  const [ctxRoute, setCtxRoute] = useState("MD7C");
  const [ctxDate, setCtxDate] = useState("13/07/2024");

  const { data: board, isLoading, isError } = useWeekPlannerBoard(depot, week.id);
  const { showToast } = useToast();

  if (isError) {
    return (
      <div className="week-planner-page">
        <div className="wrap">Could not load the board (prototype fetch failure).</div>
      </div>
    );
  }

  if (isLoading || !board) {
    return (
      <div className="week-planner-page">
        <div className="wrap">Loading board…</div>
      </div>
    );
  }

  const visibleDays = showWeekend ? board.days : board.days.filter((d) => !d.isWeekend);
  const selectedDay = board.days.find((d) => d.date === selectedDate) ?? null;

  function openRouteModal(route: RouteCardModel) {
    setCtxRoute(route.code);
    setCtxDate(formatDate(selectedDay?.date ?? board!.days[0].date));
    setModal("editAssignment");
  }

  function openAddInDay(date: string) {
    setCtxDate(formatDate(date));
    setModal("addAssignment");
  }

  return (
    <div className="week-planner-page">
      <div className="wrap">
        <div className="topbar">
          <h1 className="title disp">WEEK PLANNER</h1>
          <span className="demo-tag">Prototype · sample data</span>
        </div>

        <div className="header">
          <WeekPickerButton week={week} onPick={setWeek} />
          <div className="actions">
            {HEADER_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="tbtn"
                onClick={() => {
                  if (action.id === "save") {
                    showToast("Week saved (prototype — nothing was persisted).");
                    return;
                  }
                  if (action.id === "generateWeek") {
                    setModal("generateWeekResult");
                    return;
                  }
                  setModal(action.id as ModalKind);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="controls">
          <DepotTabs selected={depot} onSelect={setDepot} />
          <label className="wkend">
            <input type="checkbox" checked={showWeekend} onChange={(e) => setShowWeekend(e.target.checked)} />
            SHOW WEEKEND
          </label>
        </div>

        <div className="addrow">
          <button type="button" className="addbtn" onClick={() => setModal("addFlexRoute")}>
            <span className="plus">+</span><span className="lbl">ADD NEW FLEXROUTE</span>
          </button>
          <button type="button" className="addbtn" onClick={() => setModal("addTeamLeader")}>
            <span className="plus">+</span><span className="lbl">TEAM LEADERS</span>
          </button>
        </div>

        <div className="cols">
          <div className="board">
            <TeamLeaderTrack selectedIndex={leaderIndex} onSelect={setLeaderIndex} />
            <DayGrid
              days={visibleDays}
              variant="main"
              selectedDate={selectedDate}
              onSelectDay={setSelectedDate}
              onAddInDay={openAddInDay}
              onOpenRoute={openRouteModal}
            />
            <AdhocSection days={visibleDays} onAddAdhoc={() => setModal("addAdhoc")} onOpenRoute={openRouteModal} />
          </div>

        </div>

        <footer className="pg">© 2026 LOGIX / SPHERE OPERATIONAL SYSTEMS</footer>
      </div>

      <PlannerModalHost openModal={modal} contextRoute={ctxRoute} contextDate={ctxDate} days={board.days} onClose={() => setModal(null)} />
    </div>
  );
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function WeekPlannerPage() {
  return (
    <NavbarWrapper title="WEEK PLANNER" active="week-planner">
      <ToastProvider>
        <WeekPlannerBoard />
      </ToastProvider>
    </NavbarWrapper>
  );
}
