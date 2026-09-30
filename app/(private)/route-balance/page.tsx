"use client";

import { useEffect, useState } from "react";
import { FigmaScreen } from "./reference/components/FigmaScreen";
import manifest from "./reference/original-manifest.json";
import "./reference/fonts.css";
import styles from "./exact.module.css";

const DEFAULT_SCREEN = "198-6865";

export default function RouteBalancePage() {
  const [requestedScreen, setRequestedScreen] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(1281);

  useEffect(() => {
    const syncScreen = () => {
      const slug = window.location.hash.slice(1);
      setRequestedScreen(manifest.some((screen) => screen.slug === slug) ? slug : null);
    };
    const syncViewport = () => setViewportWidth(window.innerWidth);
    syncScreen();
    syncViewport();
    window.addEventListener("hashchange", syncScreen);
    window.addEventListener("resize", syncViewport);
    return () => {
      window.removeEventListener("hashchange", syncScreen);
      window.removeEventListener("resize", syncViewport);
    };
  }, []);

  const screenId = requestedScreen ?? (viewportWidth <= 900 ? "322-14616" : DEFAULT_SCREEN);
  const screen = manifest.find((item) => item.slug === screenId)!;
  const scale = Math.min(1, viewportWidth / screen.width);

  return (
    <main className={styles.page} aria-label={screen.name}>
      <div className={styles.canvas} style={{ width: screen.width * scale, height: screen.height * scale }}>
        <div className={styles.canvasInner} style={{ width: screen.width, height: screen.height, transform: `scale(${scale})` }}>
          <FigmaScreen screenId={screenId} />
        </div>
      </div>
    </main>
  );
}
