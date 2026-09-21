"use client";

import { useEffect, useState } from "react";
import { OPTIONS } from "../../constants";
import { useWeekPlannerActions } from "../../hooks/useWeekPlannerActions";
import { useToast } from "../Toast";
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

const FULL_WEEK_DAYS = [
  { code: "mon", label: "Mon", date: "13/07", count: 50, weekend: false },
  { code: "tue", label: "Tue", date: "14/07", count: 56, weekend: false },
  { code: "wed", label: "Wed", date: "15/07", count: 56, weekend: false },
  { code: "thu", label: "Thu", date: "16/07", count: 56, weekend: false },
  { code: "fri", label: "Fri", date: "17/07", count: 56, weekend: false },
  { code: "sat", label: "Sat", date: "18/07", count: 3, weekend: true },
  { code: "sun", label: "Sun", date: "19/07", count: 0, weekend: true },
];
const FULL_WEEK_LABEL = "Full Week (13/07 to 19/07)";

interface PlannerModalHostProps {
  openModal: ModalKind;
  contextRoute: string;
  contextDate: string;
  onClose: () => void;
}

export default function PlannerModalHost({ openModal, contextRoute, contextDate, onClose }: PlannerModalHostProps) {
  const { runAction, runGenerateWeek } = useWeekPlannerActions();
  const { showToast } = useToast();
  const [generated, setGenerated] = useState<Awaited<ReturnType<typeof runGenerateWeek>> | null>(null);

  useEffect(() => {
    if (openModal === "generateWeekResult" && !generated) {
      runGenerateWeek().then(setGenerated);
    }
  }, [openModal, generated, runGenerateWeek]);

  if (!openModal) return null;

  async function submit(title: string) {
    await runAction(title);
    onClose();
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
    return (
      <PlannerModal
        title="Register Day Off"
        narrow
        primaryLabel="SAVE"
        description={"Register a day off for a vendor. Choose a single\nday or a period."}
        onCancel={onClose}
        onSubmit={() => submit("Register Day Off")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SelectField label="Vendor" placeholder="Select a vendor" options={OPTIONS.vendor} />
          <SegmentedField options={["Single Day", "Period"]} />
          <DateField label="Start Date" defaultValue="2024-07-13" />
          <DateField label="End Date" defaultValue="2024-07-13" />
          <TextField label="Reason" placeholder="Reason for the day off" />
          <TextareaField label="Notes" placeholder="WRITE ANY NOTES" tall />
        </div>
      </PlannerModal>
    );
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
          <DaySelectorField fullWeekLabel={FULL_WEEK_LABEL} days={FULL_WEEK_DAYS} />
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
          <DaySelectorField fullWeekLabel={FULL_WEEK_LABEL} days={FULL_WEEK_DAYS} />
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
            <p>Week: <b>13/07/2024 to 17/07/2024</b></p>
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
          <DaySelectorField fullWeekLabel={FULL_WEEK_LABEL} days={FULL_WEEK_DAYS} />
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
          <DaySelectorField fullWeekLabel="Select all available weekdays (from tomorrow)" days={FULL_WEEK_DAYS} />
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
          <DaySelectorField fullWeekLabel={FULL_WEEK_LABEL} days={FULL_WEEK_DAYS} />
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
          <DaySelectorField fullWeekLabel="Select all available weekdays (from tomorrow)" days={FULL_WEEK_DAYS} />
          <TextareaField label="Notes (optional)" placeholder="WRITE ANY NOTES" />
        </FieldRow>
      </PlannerModal>
    );
  }

  return null;
}
