declare module 'bootstrap' {
  export class Modal {
    constructor(element: HTMLElement, options?: unknown);
    static getInstance(element: HTMLElement): Modal | null;
    static getOrCreateInstance(element: HTMLElement, options?: unknown): Modal;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }

  export interface Bootstrap {
    Modal: typeof Modal;
  }
}

declare module 'bootstrap/dist/js/bootstrap.bundle.min.js' {
  // This module loads Bootstrap and sets window.bootstrap
  // No exports needed, it's a side-effect module
}

declare global {
  interface Window {
    bootstrap: import('bootstrap').Bootstrap;
  }
}

