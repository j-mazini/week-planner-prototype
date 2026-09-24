/** Feedback while an optional dialog's code is downloaded on first use. */
export function ModalLoading() {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/20" role="status" aria-live="polite">
      <div className="rounded-lg border border-border bg-background px-6 py-4 text-sm text-foreground shadow-lg">
        Loading…
      </div>
    </div>
  );
}
