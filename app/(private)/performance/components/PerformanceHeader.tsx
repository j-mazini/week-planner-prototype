"use client";

import { memo } from "react";
import Image from "next/image";

export const PerformanceHeader = memo(function PerformanceHeader() {
  return (
    <header className="mb-2 flex justify-end items-center min-h-[58px]">
      <div className="flex items-center gap-2.5">
        <div className="text-right leading-tight">
          <div className="font-bold text-base text-[#2c3e50]">BA-Express</div>
          <div className="text-sm font-medium text-[#7f8c8d]">Monthly Performance</div>
        </div>
        <Image
          src="/ba-express-final-logo.png"
          alt="BA-Express Logo"
          width={50}
          height={50}
          className="w-[50px] h-[50px] rounded-[10px] object-cover"
          priority
        />
      </div>
    </header>
  );
});

