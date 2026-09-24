"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Componente de botão para abrir a sidebar em telas menores que 720px
 * Deve ser posicionado acima do componente Daily Game Plan Status
 */
export function MobileSidebarButton() {
  const { toggleSidebar } = useSidebar();
  const [isSmallScreen, setIsSmallScreen] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 720;
    }
    return false;
  });

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 720);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Só renderizar em telas menores que 720px
  if (!isSmallScreen) {
    return null;
  }

  return (
    <button
      onClick={toggleSidebar}
      className="
        w-full
        flex items-center justify-center gap-2
        px-4 py-3
        bg-gradient-to-r from-indigo-500 to-purple-500
        hover:from-indigo-600 hover:to-purple-600
        text-white
        font-semibold
        rounded-lg
        shadow-lg
        transition-all duration-300
        hover:shadow-xl
        active:scale-[0.98]
        mb-4
      "
      aria-label="Abrir menu de navegação"
    >
      <Menu className="w-5 h-5" />
      <span className="text-sm sm:text-base">Abrir Menu</span>
    </button>
  );
}

