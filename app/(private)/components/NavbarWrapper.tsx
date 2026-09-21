import type { ReactNode } from "react";

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "#1a1a1e",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          fontSize: 12,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span>LogixSphere — stub navbar (protótipo isolado)</span>
      </div>
      {children}
    </div>
  );
}
