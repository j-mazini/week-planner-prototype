import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Closes the sidebar whenever any modal state is open.
 * Accepts multiple states (boolean, null or undefined) and closes the sidebar
 * on both desktop and mobile.
 */
export function useCloseSidebarOnModal(...openStates: Array<boolean | null | undefined>) {
  const { setOpen, setOpenMobile } = useSidebar();

  useEffect(() => {
    const shouldCloseSidebar = openStates.some(Boolean);
    if (!shouldCloseSidebar) return;

    setOpen(false);
    setOpenMobile(false);
    // `openStates` is a variadic rest parameter, so a new array is created on every
    // call/render. Spreading its primitive values into the deps array below (instead of
    // the array reference, or `openStates` itself) is intentional: it lets this effect
    // re-run only when one of the individual boolean values actually changes, not on
    // every render. ESLint cannot statically verify a spread element and falls back to
    // suggesting `openStates` as a dependency, but adding the array reference would
    // defeat the purpose and re-run this effect (closing the sidebar) on every render.
  }, [setOpen, setOpenMobile, ...openStates]);
}

