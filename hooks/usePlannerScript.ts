"use client";

import { useEffect } from 'react';

/** Initialize legacy planner widgets once and release owned instances on unmount. */
export const usePlannerScript = () => {
  useEffect(() => {
    let cancelled = false;
    const instances: { dispose(): void }[] = [];
    const loadScripts = async () => {
      const bootstrap = await import('bootstrap/dist/js/bootstrap.bundle.min.js');
      if (cancelled) return;

      document.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]').forEach(element => {
        if (!bootstrap.Tooltip.getInstance(element)) instances.push(new bootstrap.Tooltip(element));
      });
      document.querySelectorAll<HTMLElement>('.modal').forEach(element => {
        if (!bootstrap.Modal.getInstance(element)) instances.push(new bootstrap.Modal(element));
      });
      document.querySelectorAll<HTMLElement>('.collapse').forEach(element => {
        if (!bootstrap.Collapse.getInstance(element)) {
          instances.push(new bootstrap.Collapse(element, { toggle: false }));
        }
      });
    };

    void loadScripts().catch(error => console.error('Failed to initialize planner widgets:', error));
    return () => {
      cancelled = true;
      instances.forEach(instance => instance.dispose());
    };
  }, []);
};
