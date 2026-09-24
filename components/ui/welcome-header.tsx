"use client";

import { useEffect, useState } from "react";
import { getFullNameFromToken } from "@/lib/auth";

interface WelcomeHeaderProps {
  className?: string;
}

export function WelcomeHeader({ className = "" }: WelcomeHeaderProps) {
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const name = getFullNameFromToken();
    setFullName(name);
  }, []);

  if (!fullName) {
    return null;
  }

  return (
    <div className={`mb-4 ${className}`}>
      <p className="text-sm text-base text-gray-600">
        Welcome
      </p>
    </div>
  );
} 