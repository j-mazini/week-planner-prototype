"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ModernPageHeader } from "@/components/modern-page-header";
import { getFullNameFromToken } from "@/lib/auth";
import { formatCurrentDate } from "../utils";

export function SpDashboardHeader() {
  const [userName, setUserName] = useState<string>("");
  const currentDate = useMemo(() => formatCurrentDate(), []);

  useEffect(() => {
    const name = getFullNameFromToken();
    if (name) setUserName(name);
  }, []);

  return (
    <div className="mb-4">
      <ModernPageHeader
        title={`Welcome${userName ? `, ${userName}` : ""} to LogixSphere`}
        subtitle={currentDate}
        metrics={[]}
        gradientFrom="slate-900"
        gradientTo="blue-600"
        showUserCard={false}
      />
    </div>
  );
}
