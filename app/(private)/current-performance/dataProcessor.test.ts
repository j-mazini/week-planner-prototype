import { describe, expect, it } from "vitest";
import { processMonthData, type DailyOverview, type MonthOverview } from "./dataProcessor";

const operation = (totalStops: number): DailyOverview => ({
  operationId: 1, routeId: 1, routeName: "L001", amountTotal: "200", totalStops,
  totalPaidStops: totalStops, totalUnpaidStops: 0, departTime: null, arriveTime: null,
  workedHours: 8, breakMinutes: 30, extra: 0, adhocSort: 0, routeSort: 0, rate: 200,
  operationCostModel: 2, costModelName: "DR", status: "Completed", dateName: "Tuesday",
  percentageOnTime: 94, sporh: 12.5,
});

function day(stops: number[]) {
  const data: MonthOverview = {
    currentMonth: { name: "September", daysWorked: 1, totalAmount: "200", averagePerDay: "200" },
    dailyEarnings: [{ date: "2026-09-01", dateName: "Tuesday", amount: "200", dailySpr: 1.98,
      dailySporH: 12.5, dailyTwPercentage: 94, operations: stops.map(operation) }],
  };
  return processMonthData(data, 2026, 8, new Date(2026, 8, 24), () => "", () => "").find(d => d.day === 1);
}

describe("monthly stop counts", () => {
  it("sums stops across operations while preserving the backend SPR metric", () => {
    expect(day([100, 25])).toMatchObject({ stops: 125, spr: 1.98, sporH: "12.5", tw: "94.0%" });
  });
  it("shows zero stops as a count instead of a ratio or missing value", () => {
    expect(day([0])).toMatchObject({ stops: 0, spr: 1.98 });
  });
});
