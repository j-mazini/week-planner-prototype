import type { DayColumnModel, RouteCardModel } from "../types";
import DayGrid from "./DayGrid";

interface AdhocSectionProps {
  days: DayColumnModel[];
  onAddAdhoc: () => void;
  onOpenRoute: (route: RouteCardModel) => void;
}

export default function AdhocSection({ days, onAddAdhoc, onOpenRoute }: AdhocSectionProps) {
  return (
    <>
      <div className="sechead">
        <h2 className="disp">ADHOC</h2>
        <button type="button" className="addbtn" onClick={onAddAdhoc}>
          <span className="plus">+</span>
          <span className="lbl">ADD ADHOC</span>
        </button>
      </div>
      <DayGrid
        days={days}
        variant="adhoc"
        selectedDate={null}
        onSelectDay={() => undefined}
        onAddInDay={onAddAdhoc}
        onOpenRoute={onOpenRoute}
      />
    </>
  );
}
