import type { RouteStatus } from "../types";

// Fills measured off the design frames. `ok` and `warning` previously shared one
// olive gradient — byte for byte — which made a warning indistinguishable from a
// healthy route apart from the 12px glyph inside it.
const DISC_STYLE: Record<RouteStatus, { bg: string; ring?: string }> = {
  ok: { bg: "var(--olive)" },
  warning: { bg: "var(--disc-warn)" },
  error: { bg: "var(--red)" },
  conflict: { bg: "var(--red)" },
  open: { bg: "radial-gradient(circle at 30% 30%, rgb(241,248,144) 0%, rgb(229,240,108) 37%, rgb(217,232,72) 74%)", ring: "rgba(90,100,16,.35)" },
};

function Glyph({ status }: { status: RouteStatus }) {
  if (status === "ok") {
    return (
      <svg width="11" height="11" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 10.5l4.2 4.2L17 5" fill="none" stroke="var(--lime)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "warning") {
    return (
      <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 2L19 18H1z" fill="#fff" />
        <path d="M10 7.5v5" stroke="var(--disc-warn)" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="10" cy="15" r=".9" fill="var(--disc-warn)" />
      </svg>
    );
  }
  if (status === "error" || status === "conflict") {
    return <span className="gl" style={{ color: "#fff" }}>!</span>;
  }
  return <span className="gl" style={{ color: "var(--ink-strong)" }}>+</span>;
}

export default function StatusDisc({ status }: { status: RouteStatus }) {
  const style = DISC_STYLE[status];
  const boxShadow = style.ring ? `0 0 0 1px ${style.ring}, var(--sh-disc)` : "var(--sh-disc)";
  return (
    // The design's discs are flat — no specular highlight on any state.
    <span className="disc" style={{ background: style.bg, boxShadow }}>
      <Glyph status={status} />
    </span>
  );
}
