export function PrivateRouteLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
        color: "#6b7280",
      }}
    >
      Loading…
    </div>
  );
}

export function TableLoadingSkeleton() {
  return (
    <div style={{ display: "grid", gap: 8, padding: "16px 0" }} aria-label="Loading table">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} style={{ height: 40, borderRadius: 8, background: "#e5e7eb" }} />
      ))}
    </div>
  );
}

export default PrivateRouteLoading;
