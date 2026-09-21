import type { RouteStatus } from "../types";

const DISC_STYLE: Record<RouteStatus, { bg: string; ring?: string }> = {
  ok: { bg: "radial-gradient(circle at 30% 30%, rgb(129,138,82) 0%, rgb(109,119,54) 37%, rgb(89,101,27) 74%)" },
  warning: { bg: "radial-gradient(circle at 30% 30%, rgb(129,138,82) 0%, rgb(109,119,54) 37%, rgb(89,101,27) 74%)" },
  error: { bg: "var(--red)" },
  conflict: { bg: "var(--notch)", ring: "var(--olive-code)" },
  open: { bg: "radial-gradient(circle at 30% 30%, rgb(241,248,144) 0%, rgb(229,240,108) 37%, rgb(217,232,72) 74%)", ring: "rgba(90,100,16,.35)" },
};

function Glyph({ status }: { status: RouteStatus }) {
  if (status === "ok") {
    return (
      <svg width="11" height="11" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 10.5l4.2 4.2L17 5" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "warning") {
    return (
      <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 2L19 18H1z" fill="var(--orange)" />
        <path d="M10 7.5v5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="10" cy="15" r=".9" fill="#fff" />
      </svg>
    );
  }
  if (status === "error" || status === "conflict") {
    return <span className="gl" style={{ color: status === "error" ? "#fff" : "var(--olive-code)" }}>!</span>;
  }
  return <span className="gl" style={{ color: "var(--ink-strong)" }}>+</span>;
}

export default function StatusDisc({ status }: { status: RouteStatus }) {
  const style = DISC_STYLE[status];
  const boxShadow = style.ring ? `0 0 0 1px ${style.ring}, var(--sh-disc)` : "var(--sh-disc)";
  return (
    <span className="disc" style={{ background: style.bg, boxShadow }}>
      <Glyph status={status} />
      {(status === "ok" || status === "warning") && <span className="spec" />}
    </span>
  );
}
