// Central place to lazy-load heavy optional dependencies.
// Goal: keep baseline memory/bundle size lower by loading these only when needed.

import type jsPDF from "jspdf";

let xlsxPromise: Promise<typeof import("xlsx")> | null = null;

export async function loadXlsx(): Promise<typeof import("xlsx")> {
  if (!xlsxPromise) {
    xlsxPromise = import("xlsx");
  }
  return xlsxPromise;
}

// `jspdf` is a CommonJS `export =` module in @types, so runtime ESM/CJS interop can vary.
// We normalize it to a constructor-like function/class that can be instantiated with `new`.
export type JsPDFConstructor = new (...args: unknown[]) => jsPDF;

let jsPdfCtorPromise: Promise<JsPDFConstructor> | null = null;

export async function loadJsPDF(): Promise<JsPDFConstructor> {
  if (!jsPdfCtorPromise) {
    jsPdfCtorPromise = import("jspdf").then((m) => {
      const ctor = (m && (m.default ?? m)) as unknown as JsPDFConstructor;
      return ctor;
    });
  }
  return jsPdfCtorPromise;
}


