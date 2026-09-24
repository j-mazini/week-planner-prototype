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

      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        new (win.bootstrap!).Modal(modal);
      });

      const collapses = document.querySelectorAll('.collapse');
      collapses.forEach(collapse => {
        new (win.bootstrap!).Collapse(collapse);
      });
    };

    loadScripts();

    return () => {
      // Cleanup se necessário
    };
  }, []);
};

