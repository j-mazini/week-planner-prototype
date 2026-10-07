"use client";

import { ReactNode } from "react";
import { GradientDotsBackground } from "@/components/gradient-dots-background";
import { WelcomeHeader } from "@/components/ui/welcome-header";
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrameWidth } from "./DgpPageFrame";

const widthClass: Record<DgpPageFrameWidth, string> = {
  narrow: 'max-w-content-narrow',
  standard: 'max-w-content-standard',
  wide: 'max-w-content-wide',
  ultra: 'max-w-content-ultra',
  full: 'max-w-none',
};

interface StandardPageLayoutProps {
  children: ReactNode;
  showWelcomeHeader?: boolean;
  bottomPadding?: string;
  width?: DgpPageFrameWidth;
}

export function StandardPageLayout({
  children,
  showWelcomeHeader = false,
  bottomPadding = "pb-[70px]",
  width = "narrow",
}: StandardPageLayoutProps) {
  return (
    <NavbarWrapper>
      <GradientDotsBackground className="relative min-h-screen z-[1] pointer-events-auto overflow-x-hidden w-full">
      <div className={`max-w-full min-h-screen ${bottomPadding}`}>
        {/* Safe area no topo */}
        <div
          className="md:hidden"
          style={{
            height: "env(safe-area-inset-top, 0px)",
            minHeight: "env(safe-area-inset-top, 0px)",
          }}
        />

        {showWelcomeHeader && (
          <div className="hidden md:block">
            <WelcomeHeader />
          </div>
        )}

        <main
          className={`page-stagger mx-auto w-full ${widthClass[width]} min-w-0 px-[clamp(0.75rem,4vw,1rem)] sm:px-6 lg:px-10 pt-4 sm:pt-8 lg:pt-9 pb-12 lg:pb-14 relative z-[1]`}
        >
          {children}
        </main>

        {/* Safe area no rodapé */}
        <div
          className="md:hidden"
          style={{
            height: "env(safe-area-inset-bottom, 0px)",
            minHeight: "env(safe-area-inset-bottom, 0px)",
          }}
        />
      </div>
      </GradientDotsBackground>
    </NavbarWrapper>
  );
}
