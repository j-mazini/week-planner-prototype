import { redirect } from "next/navigation";

/** The monthly dashboard replaces the historical, randomly generated prototype. */
export default function PerformancePage() {
  redirect("/current-performance");
}
