"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import NavbarWrapper from "@/components/navbar-wrapper";
import { useAuth } from "@/hooks/useAuth";
import { isAllowedForUserType2, isAllowedForUserType3 } from "@/lib/route-permissions";
import { BUSINESS_RULES } from "@/src/constants/businessRules";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isSupervisor = user?.userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR || user?.roles?.includes("supervisor");
  const isDriver = user?.userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER || user?.roles?.includes("driver");
  const supervisorBlocked = Boolean(isSupervisor && pathname && !isAllowedForUserType3(pathname));
  const driverBlocked = Boolean(isDriver && pathname && !isAllowedForUserType2(pathname));
  useEffect(() => {
    if (supervisorBlocked) router.replace("/week-planner");
    if (driverBlocked) router.replace("/daily-performance-insight");
  }, [router, supervisorBlocked, driverBlocked]);
  if (loading || supervisorBlocked || driverBlocked) return <div className="app-global-page" />;
  const needsShell = ["/daily", "/op-management"].includes(pathname);
  return <div className="app-global-page" key={user?.id ?? "anonymous"}>{needsShell ? <NavbarWrapper>{children}</NavbarWrapper> : children}</div>;
}
