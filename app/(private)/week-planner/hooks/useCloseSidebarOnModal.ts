import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Closes the sidebar whenever any modal state is open.
 * Accepts multiple states (boolean, null or undefined) and closes the sidebar
 * on both desktop and mobile.
 */
export function useCloseSidebarOnModal(...openStates: Array<boolean | null | undefined>) {
  const { setOpen, setOpenMobile } = useSidebar();

  const shouldCloseSidebar = openStates.some(Boolean);
  useEffect(() => {
    if (!shouldCloseSidebar) return;
    setOpen(false);
    setOpenMobile(false);
  }, [setOpen, setOpenMobile, shouldCloseSidebar]);
}
