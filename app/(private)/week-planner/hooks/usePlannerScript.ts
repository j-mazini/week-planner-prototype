"use client";

import { useEffect } from 'react';

interface BootstrapWindow extends Window {
  bootstrap?: {
    Tooltip: new (el: Element) => unknown;
    Modal: new (el: Element) => unknown;
    Collapse: new (el: Element) => unknown;
  };
}

export const usePlannerScript = () => {
  useEffect(() => {
    const loadScripts = async () => {
      const win = window as BootstrapWindow;
      if (typeof window !== 'undefined' && !win.bootstrap) {
        await import('bootstrap/dist/js/bootstrap.bundle.min.js');
      }

      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      Array.from(tooltipTriggerList).forEach(tooltipTriggerEl => {
        new (win.bootstrap!).Tooltip(tooltipTriggerEl);
      });

      document.querySelectorAll('.modal').forEach(modal => {
        new (win.bootstrap!).Modal(modal);
      });

      document.querySelectorAll('.collapse').forEach(collapse => {
        new (win.bootstrap!).Collapse(collapse);
      });
    };

    loadScripts();

    return () => {
      // Cleanup if needed
    };
  }, []);
};

