"use client";

import { useEffect, useMemo, useState } from "react";
import { OPTIONS } from "../../constants";
import { useWeekPlannerActions } from "../../hooks/useWeekPlannerActions";
import type { DayColumnModel } from "../../types";
import {
  DaySelectorField,
  DateField,
  DepotPickerField,
  FieldRow,
  ReadonlyField,
  SegmentedField,
  SelectField,
  TextField,
  TextareaField,
} from "./fields";
import PlannerModal from "./PlannerModal";

export type ModalKind =
  | "registerDayOff"
  | "addAssignment"
  | "editAssignment"
  | "exportDay"
  | "exportWeek"
  | "addNote"
  | "managementSupport"
  | "addAdhoc"
  | "addTeamLeader"
  | "addFlexRoute"
  | "generateWeekResult"
  | null;

function RegisterDayOffModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (title: string) => void }) {
  const [singleDay, setSingleDay] = useState(true);
  return (
    <PlannerModal
      title="Register Day Off"
      narrow
      primaryLabel="SAVE"
      description={"Register a day off for a vendor. Choose a single\nday or a period."}
      onCancel={onClose}
      onSubmit={() => onSubmit("Register Day Off")}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SelectField label="Vendor" placeholder="Select a vendor" options={OPTIONS.vendor} />
        <SegmentedField options={["Single Day", "Period"]} onChange={(index) => setSingleDay(index === 0)} />
        <FieldRow>
          <DateField label="Start Date" defaultValue="2024-07-13" />
          <DateField label="End Date" defaultValue="2024-07-13" disabled={singleDay} />
        </FieldRow>
        <TextField label="Reason" placeholder="Reason for the day off" />
        <TextareaField label="Notes" placeholder="WRITE ANY NOTES" tall />
      </div>
    </PlannerModal>
  );
}

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

interface PlannerModalHostProps {
  openModal: ModalKind;
  contextRoute: string;
  contextDate: string;
  days: DayColumnModel[];
  onClose: () => void;
}

export default function PlannerModalHost({ openModal, contextRoute, contextDate, days, onClose }: PlannerModalHostProps) {
  const { runAction, runGenerateWeek } = useWeekPlannerActions();
  const [generated, setGenerated] = useState<Awaited<ReturnType<typeof runGenerateWeek>> | null>(null);

  const fullWeekDays = useMemo(
    () =>
      days.map((day) => ({
        code: day.name.slice(0, 3).toLowerCase(),
        label: day.name.slice(0, 1).toUpperCase() + day.name.slice(1, 3).toLowerCase(),
        date: formatShortDate(day.date),
        count: day.assignmentCount,
        weekend: day.isWeekend,
      })),
    [days],
  );

  const fullWeekLabel = useMemo(() => {
    if (days.length === 0) return "Full Week";
    const first = days[0];
    const last = days[days.length - 1];
    return `Full Week (${formatShortDate(first.date)} to ${formatShortDate(last.date)})`;
  }, [days]);

  const weekRangeLabel = useMemo(() => {
    if (days.length === 0) return "";
    const weekdays = days.filter((d) => !d.isWeekend);
    const first = weekdays[0] ?? days[0];
    const last = weekdays[weekdays.length - 1] ?? days[days.length - 1];
    return `${first.date.split("-").reverse().join("/")} to ${last.date.split("-").reverse().join("/")}`;
  }, [days]);

  useEffect(() => {
    if (openModal !== "generateWeekResult" || generated) return;
    let cancelled = false;
    runGenerateWeek().then((result) => {
      if (!cancelled) setGenerated(result);
    });
    return () => {
      cancelled = true;
    };
  }, [openModal, generated, runGenerateWeek]);

  if (!openModal) return null;

  async function submit(title: string) {
    try {
      await runAction(title);
      onClose();
    } catch {
      // keep the modal open on a failed mock action rather than crash-closing
    }
  }

  if (openModal === "generateWeekResult") {
    if (!generated) {
      return null; // loading — the effect above is fetching
    }
    return (
      <PlannerModal title="Default Schedule Created" narrow primaryLabel="SAVE" onCancel={onClose} onSubmit={() => { setGenerated(null); onClose(); }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p className="result">
            Successfully created <span className="count">{generated.totalCreated}</span> default schedule assignments.
          </p>
          <div className="breakdown">
            <span>Management &amp; Support created first: {generated.managementCreated}.</span>
            <span>Primary assignments: {generated.primaryCreated},</span>
            <span>Secondary pass (filling empty routes): {generated.secondaryCreated}.</span>
            <span>
              Assignments created for {generated.vendorCount} vendor(s) across {generated.dayCount} day(s) (weekdays only) of the week.
            </span>
          </div>
        </div>
      </PlannerModal>
    );
  }

  if (openModal === "registerDayOff") {
    return <RegisterDayOffModal onClose={onClose} onSubmit={submit} />;
  }

  if (openModal === "addAssignment" || openModal === "editAssignment") {
    const title = openModal === "addAssignment" ? "Add Assignment" : "Edit Assigment";
    return (
      <PlannerModal
        title={title}
        primaryLabel="ADD"
        description={openModal === "addAssignment" ? "Associate an Admin or Team Leader vendor to Management and Support - Management and Support." : undefined}
        onCancel={onClose}
        onSubmit={() => submit(title)}
      >
        <FieldRow>
          <ReadonlyField label="Route" value={contextRoute} />
          <ReadonlyField label="Date" value={contextDate} />
          <SelectField label="Vendor" placeholder="Select a function" options={OPTIONS.vendor} />
          <SelectField label="Vehice" placeholder="Select a mananger" options={OPTIONS.vehicle} />
          <SelectField label="Sort" placeholder="YES" options={["YES", "NO"]} />
          <span />
          <DaySelectorField fullWeekLabel={fullWeekLabel} days={fullWeekDays} />
          <TextareaField label="Notes (optional)" placeholder="WRITE ANY NOTES" />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "exportDay") {
    return (
      <PlannerModal title="Export Day Schedule" primaryLabel="EXPORT" description="Select one or more days and depots to export." onCancel={onClose} onSubmit={() => submit("Export Day Schedule")}>
        <FieldRow>
          <DepotPickerField />
          <DaySelectorField fullWeekLabel={fullWeekLabel} days={fullWeekDays} />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "exportWeek") {
    return (
      <PlannerModal
        title="Export WEEK Schedule"
        narrow
        primaryLabel="EXPORT"
        description={"Select one or more depots to export. One PDF will\nbe generated per depot."}
        onCancel={onClose}
        onSubmit={() => submit("Export WEEK Schedule")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DepotPickerField />
          <div className="chkrow">
            <span className="box" data-on="0" />
            <span>Include weekends (Sat &amp; Sun)</span>
          </div>
          <div className="callout">
            <p>Week: <b>{weekRangeLabel}</b></p>
            <p>Will generate <b>4 PDFs</b>: LCY, MSE, LSE, BASP</p>
          </div>
        </div>
      </PlannerModal>
    );
  }

  if (openModal === "addNote") {
    return (
      <PlannerModal title="Add Note" narrow primaryLabel="SAVE" onCancel={onClose} onSubmit={() => submit("Add Note")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SelectField label="Vendor" placeholder="Select a vendor" options={OPTIONS.vendor} />
          <DateField label="Date" defaultValue="2024-07-13" />
          <TextareaField label="Notes" placeholder="my note" tall />
        </div>
      </PlannerModal>
    );
  }

  if (openModal === "managementSupport") {
    return (
      <PlannerModal
        title="Associate Management and Support"
        primaryLabel="ADD"
        description="Associate an Admin or Team Leader vendor to Management and Support - Management and Support."
        onCancel={onClose}
        onSubmit={() => submit("Associate Management and Support")}
      >
        <FieldRow>
          <SelectField label="Function" placeholder="Select a function" options={OPTIONS.fn} />
          <SelectField label="Mananger" placeholder="Select a mananger" options={OPTIONS.manager} />
          <DaySelectorField fullWeekLabel={fullWeekLabel} days={fullWeekDays} />
          <TextareaField label="Notes (optional)" placeholder="WRITE ANY NOTES" />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "addAdhoc") {
    return (
      <PlannerModal title="Add ADHOC Service" primaryLabel="CREATE SERVICE" description="Create a new ad-hoc service for this depot." onCancel={onClose} onSubmit={() => submit("Add ADHOC Service")}>
        <FieldRow>
          <SelectField label="Vendor" placeholder="Select a vendor" options={OPTIONS.vendor} />
          <SelectField label="Adhoc Service" placeholder="Select an adhoc service" options={OPTIONS.adhoc} />
          <ReadonlyField label="Adhoc sort" value="40" />
          <span />
          <DaySelectorField fullWeekLabel="Select all available weekdays (from tomorrow)" days={fullWeekDays} />
          <TextareaField label="Notes (optional)" placeholder="WRITE ANY NOTES" />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "addTeamLeader") {
    return (
      <PlannerModal
        title="Add Team Leader"
        primaryLabel="EXPORT"
        description="Associate an Admin or Team Leader vendor to Management and Support - Management and Support."
        onCancel={onClose}
        onSubmit={() => submit("Add Team Leader")}
      >
        <FieldRow>
          <SelectField label="Function" placeholder="Ops Manager" options={OPTIONS.fn} />
          <SelectField label="Select the mananger" placeholder="Leandro Dias" options={OPTIONS.manager} />
          <ReadonlyField label="Deposit" value="BOAP" />
          <span />
          <DaySelectorField fullWeekLabel={fullWeekLabel} days={fullWeekDays} />
        </FieldRow>
      </PlannerModal>
    );
  }

  if (openModal === "addFlexRoute") {
    return (
      <PlannerModal title="Add New Flex Route" primaryLabel="ADD" description="Choose a flex route, date, and vendor to add an item to the week planner." onCancel={onClose} onSubmit={() => submit("Add New Flex Route")}>
        <FieldRow>
          <SelectField label="Flex route" placeholder="Select flex route" options={OPTIONS.flex} />
          <SelectField label="Vendor" placeholder="Select a vendor" options={OPTIONS.vendor} />
          <SelectField label="Vehicle" placeholder="Select a vehicle" options={OPTIONS.vehicle} />
          <SelectField label="Sort" placeholder="Yes" options={["Yes", "No"]} />
          <DaySelectorField fullWeekLabel="Select all available weekdays (from tomorrow)" days={fullWeekDays} />
          <TextareaField label="Notes (optional)" placeholder="WRITE ANY NOTES" />
        </FieldRow>
      </PlannerModal>
    );
  }

  return null;
}
