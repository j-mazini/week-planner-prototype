"use client";

import { useEffect, useState } from "react";
import { FigmaScreen } from "../reference/components/FigmaScreen";
import manifest from "../reference/original-manifest.json";
import "../reference/fonts.css";
import styles from "../exact.module.css";

const DEFAULT_SCREEN = "198-6865";

export default function RouteBalancePage() {
  const [screenId, setScreenId] = useState(DEFAULT_SCREEN);
  useEffect(() => {
    const syncScreen = () => {
      const slug = window.location.hash.slice(1);
      setScreenId(manifest.some((screen) => screen.slug === slug) ? slug : DEFAULT_SCREEN);
    };
    syncScreen();
    window.addEventListener("hashchange", syncScreen);
    return () => window.removeEventListener("hashchange", syncScreen);
  }, []);

  const screen = manifest.find((item) => item.slug === screenId)!;
  return (
    <main className={styles.page} aria-label={screen.name}>
      <div className={styles.canvas} style={{ width: screen.width, minHeight: screen.height }}>
        <FigmaScreen screenId={screenId} />
      </div>
    </main>
  );
}
