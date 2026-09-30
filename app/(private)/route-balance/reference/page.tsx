"use client";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/geist/500.css";
import { useEffect, useMemo, useState } from "react";
import NavbarWrapper from "../../components/NavbarWrapper";
import { FigmaScreen } from "./components/FigmaScreen";
import { ROUTE_BALANCE_MANIFEST } from "./manifest";
import "./fonts.css";
import "./styles.css";

const GROUPS = ["Desktop", "Mobile", "Referências"] as const;

function readHashSlug(): string {
  if (typeof window === "undefined") return ROUTE_BALANCE_MANIFEST[0].slug;
  const slug = window.location.hash.slice(1);
  return ROUTE_BALANCE_MANIFEST.some((s) => s.slug === slug) ? slug : ROUTE_BALANCE_MANIFEST[0].slug;
}

function RouteBalanceViewer() {
  const [slug, setSlug] = useState(ROUTE_BALANCE_MANIFEST[0].slug);
  const [query, setQuery] = useState("");
  const [fit, setFit] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(1440);

  useEffect(() => {
    setSlug(readHashSlug());
    setViewportWidth(window.innerWidth);
    const onHashChange = () => setSlug(readHashSlug());
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const screen = useMemo(() => ROUTE_BALANCE_MANIFEST.find((s) => s.slug === slug) ?? ROUTE_BALANCE_MANIFEST[0], [slug]);
  const index = ROUTE_BALANCE_MANIFEST.indexOf(screen);
  const available = viewportWidth - (menuOpen ? 288 : 0) - 48;
  const scale = !fit ? 1 : Math.min(1, Math.max(200, available) / screen.width);

  function go(offset: number) {
    const next = ROUTE_BALANCE_MANIFEST[(index + offset + ROUTE_BALANCE_MANIFEST.length) % ROUTE_BALANCE_MANIFEST.length];
    window.location.hash = next.slug;
  }

  return (
    <div className="rb-shell">
      <header className="viewer-header">
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Hide index" : "Show index"}>
          ☰
        </button>
        <div>
          <strong>ROUTE BALANCE</strong>
          <small>FIGMA EXPORT · {ROUTE_BALANCE_MANIFEST.length} SCREENS</small>
        </div>
        <span className="header-count">
          {String(index + 1).padStart(2, "0")} / {ROUTE_BALANCE_MANIFEST.length}
        </span>
        <button type="button" onClick={() => go(-1)} aria-label="Previous screen">
          ←
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next screen">
          →
        </button>
      </header>

      <div className="rb-body">
        {menuOpen && (
          <aside className="screen-index">
            <input aria-label="Search screens" placeholder="Search screen or ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
            {GROUPS.map((group) => (
              <section key={group}>
                <h2>{group}</h2>
                {ROUTE_BALANCE_MANIFEST.filter((s) => s.group === group && `${s.name} ${s.id}`.toLowerCase().includes(query.toLowerCase())).map((s) => (
                  <a
                    href={`#${s.slug}`}
                    className={s.slug === screen.slug ? "active" : ""}
                    key={s.slug}
                    aria-current={s.slug === screen.slug ? "page" : undefined}
                  >
                    <span>{s.name}</span>
                    <small>
                      {s.width} × {s.height} · {s.id}
                    </small>
                  </a>
                ))}
              </section>
            ))}
          </aside>
        )}

        <main className="viewer-main">
          <div className="screen-toolbar">
            <div>
              <h1>{screen.name}</h1>
              <p>
                {screen.figmaName} · {screen.width} × {screen.height}
              </p>
            </div>
            <div className="toolbar-actions">
              <button type="button" onClick={() => setFit(!fit)} aria-pressed={fit}>
                {fit ? "Fit" : "100%"} · {Math.round(scale * 100)}%
              </button>
              <a href={`https://www.figma.com/design/4emNFZL0KFWcXlYce6B7L5/Route-Balance?node-id=${screen.slug}`} target="_blank" rel="noreferrer">
                Figma ↗
              </a>
            </div>
          </div>
          <div className="canvas-scroller">
            <div className="canvas-size" style={{ width: screen.width * scale, height: screen.height * scale }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: screen.width, height: screen.height }}>
                <FigmaScreen screenId={screen.slug} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RouteBalancePage() {
  return (
    <NavbarWrapper>
      <RouteBalanceViewer />
    </NavbarWrapper>
  );
}
