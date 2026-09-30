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

  export class Tooltip {
    constructor(element: HTMLElement, options?: unknown);
    static getInstance(element: HTMLElement): Tooltip | null;
    static getOrCreateInstance(element: HTMLElement, options?: unknown): Tooltip;
    dispose(): void;
  }

  export class Collapse {
    constructor(element: HTMLElement, options?: { toggle?: boolean });
    static getInstance(element: HTMLElement): Collapse | null;
    static getOrCreateInstance(element: HTMLElement, options?: { toggle?: boolean }): Collapse;
    dispose(): void;
  }

  export interface Bootstrap {
    Modal: typeof Modal;
  }
}

declare module 'bootstrap/dist/js/bootstrap.bundle.min.js' {
  export { Modal, Tooltip, Collapse } from 'bootstrap';
}

declare global {
  interface Window {
    bootstrap: import('bootstrap').Bootstrap;
  }
}

