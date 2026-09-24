import { FailedData } from './utils';

export interface Metrics {
  spr: number;
  spor: string;
  afd: string;
  departed: string;
  arrived: string;
  breakLabel: string;
  twPercent: number;
  twClass: "success" | "warning" | "danger" | "";
  arrivedDanger: boolean;
  failed: FailedData;
  note: string;
}

export const calculateMetrics = (activeDayNumber: number): Metrics => {
  if (activeDayNumber === -1) {
    return {
      spr: 0,
      spor: "0.00",
      afd: "0%",
      departed: "--:--",
      arrived: "--:--",
      breakLabel: "0 Min",
      twPercent: 0,
      twClass: "",
      arrivedDanger: false,
      failed: { NR: 0, FP: 0, BA: 0, NH: 0, SHP: 0, CM: 0 },
      note: "No data for this month.",
    };
  }

  const day = activeDayNumber;
  const spr = 50 + (day % 10);
  const spor = (7 + (day % 5) / 10).toFixed(2);
  const afd = `${5 + (day % 4)}%`;

  const departed = `0${8 + (day % 2)}:${(50 + (day % 10)).toString().padStart(2, "0")}`;
  const arrived = `${16 + (day % 2)}:${(30 + (day % 29)).toString().padStart(2, "0")}`;
  const breakLabel = `${(day % 3) * 15} Min`;

  const [depHours, depMinutes] = departed.split(":").map(Number);
  const [arrHours, arrMinutes] = arrived.split(":").map(Number);
  const startDate = new Date(0, 0, 0, depHours, depMinutes);
  const endDate = new Date(0, 0, 0, arrHours, arrMinutes);
  let diffMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
  if (diffMinutes < 0) diffMinutes += 24 * 60;
  const plannedWorkMinutes = 8 * 60;
  const efficiencyPercentage = Math.round((diffMinutes / plannedWorkMinutes) * 100);

  let twClass: "success" | "warning" | "danger" | "" = "";
  if (efficiencyPercentage >= 90 && efficiencyPercentage <= 100) twClass = "success";
  else if (efficiencyPercentage >= 80 && efficiencyPercentage < 90) twClass = "warning";
  else if (efficiencyPercentage >= 70 && efficiencyPercentage < 80) twClass = "danger";

  const failed: FailedData = {
    NR: day % 3,
    FP: (day + 1) % 4,
    BA: (day + 2) % 3,
    NH: day % 2,
    SHP: day % 4,
    CM: (day + 3) % 5 === 0 ? 1 : 0,
  };

  let note = "No notes for this day.";
  if (day % 7 === 0) note = "Delayed departure from depot due to package organization.";
  else if (day % 5 === 0)
    note = "Heavy traffic on the main route. Alternative route recommended for the next few days.";
  else if (day % 3 === 0) note = "Vehicle returned early after successfully completing all deliveries.";

  return {
    spr,
    spor,
    afd,
    departed,
    arrived,
    breakLabel,
    twPercent: efficiencyPercentage,
    twClass,
    arrivedDanger: arrHours < 17,
    failed,
    note,
  };
};

