"use client";

import React from "react";
import dynamic from "next/dynamic";
import NavbarWrapper from "@/components/navbar-wrapper";

const DailyGamePlanContent = dynamic(
  () => import("./DailyGamePlanContent"),
  {
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50/90">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-600">Loading Daily Game Plan...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function DailyGamePlan() {
  return (
    <NavbarWrapper>
      <DailyGamePlanContent />
    </NavbarWrapper>
  );
}
