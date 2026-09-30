import { redirect } from "next/navigation";

/** Keep existing bookmarks pointing to the implemented financial dashboard. */
export default function FinancialPerformancePage() {
  redirect("/daily-financial-insights");
}
