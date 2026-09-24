"use client";

// Bootstrap is bundled once in app/layout.tsx, before the application styles.
// Keep this compatibility component inert so legacy pages cannot override them.
export function BootstrapLoader() {
  return null;
}
