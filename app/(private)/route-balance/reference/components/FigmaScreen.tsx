"use client";

import { memo, useEffect, useState, type CSSProperties } from "react";

/**
 * Generic renderer for a Figma-exported screen: reads a JSON layer tree
 * (fetched from /route-balance/screens/<slug>.json) and draws it with plain
 * absolutely-positioned divs, mirroring the original Figma layout. Ported
 * from the standalone "route-balance-react" export — only the asset base
 * path changed (Vite's import.meta.env.BASE_URL → a fixed public path,
 * since this now lives inside the Next.js app instead of its own Vite app).
 */

type Color = { r: number; g: number; b: number; a?: number };
type Paint = {
  type: string;
  visible?: boolean;
  opacity?: number;
  color?: Color;
  gradientStops?: { color: Color; position: number }[];
  gradientTransform?: number[][];
};
type TextStyle = {
  fontName?: { family: string; style: string };
  fontSize?: number;
  fontWeight?: number;
  fills?: Paint[];
  lineHeight?: { unit: string; value?: number };
  letterSpacing?: { unit: string; value: number };
  textDecoration?: string;
};
type Style = TextStyle & {
  width?: number;
  height?: number;
  relativeTransform?: number[][];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeTopWeight?: number;
  strokeRightWeight?: number;
  strokeBottomWeight?: number;
  strokeLeftWeight?: number;
  cornerRadius?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
  opacity?: number;
  isMask?: boolean;
  clipsContent?: boolean;
  overflowDirection?: string;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  textCase?: string;
  segments?: (TextStyle & { characters: string })[];
  effects?: { type: string; visible?: boolean; radius: number; color: Color; offset: { x: number; y: number }; spread?: number }[];
};
type Layer = { i: string; n: string; t: string; s: number; text?: string; asset?: string; assetBounds?: number[]; renderHidden?: boolean; dashed?: boolean; c?: Layer[] };
export type ScreenData = { root: Layer; styles: Style[] };

const cache = new Map<string, Promise<ScreenData>>();
const base = "/route-balance/";

export function loadScreen(id: string): Promise<ScreenData> {
  if (!cache.has(id)) {
    cache.set(
      id,
      fetch(`${base}screens/${id}.json`)
        .then((r) => {
          if (!r.ok) throw new Error("Could not load the screen.");
          return r.json();
        })
        .catch((e) => {
          cache.delete(id);
          throw e;
        }),
    );
  }
  return cache.get(id)!;
}

function rgba(c: Color, opacity = 1) {
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${(c.a ?? 1) * opacity})`;
}

function paint(p: Paint, width = 1, height = 1): string {
  if (p.type === "SOLID" && p.color) return rgba(p.color, p.opacity ?? 1);
  const stops = (p.gradientStops ?? []).map((s) => `${rgba(s.color, p.opacity ?? 1)} ${s.position * 100}%`).join(",");
  const m = p.gradientTransform ?? [
    [1, 0, 0],
    [0, 1, 0],
  ];
  if (p.type === "GRADIENT_LINEAR") return `linear-gradient(${90 + (Math.atan2(m[0][1] * width, m[0][0] * height) * 180) / Math.PI}deg,${stops})`;
  if (p.type === "GRADIENT_RADIAL") {
    const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    if (!det) return `radial-gradient(${stops})`;
    const x = (m[1][1] * (0.5 - m[0][2]) - m[0][1] * (0.5 - m[1][2])) / det;
    const y = (-m[1][0] * (0.5 - m[0][2]) + m[0][0] * (0.5 - m[1][2])) / det;
    return `radial-gradient(ellipse ${Math.abs((0.5 * m[1][1]) / det) * 100}% ${Math.abs((0.5 * m[0][0]) / det) * 100}% at ${x * 100}% ${y * 100}%,${stops})`;
  }
  return "transparent";
}

function textCSS(s: TextStyle): CSSProperties {
  const fill = s.fills?.find((p) => p.visible !== false && p.type === "SOLID");
  return {
    fontFamily: s.fontName ? `"${s.fontName.family}", monospace` : undefined,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight ?? (s.fontName?.style.includes("Bold") ? 700 : 400),
    fontStyle: s.fontName?.style.includes("Italic") ? "italic" : undefined,
    color: fill ? paint(fill) : undefined,
    lineHeight: s.lineHeight?.unit === "PIXELS" ? `${s.lineHeight.value}px` : s.lineHeight?.unit === "PERCENT" ? `${s.lineHeight.value}%` : "normal",
    letterSpacing: s.letterSpacing?.unit === "PERCENT" ? `${s.letterSpacing.value / 100}em` : s.letterSpacing?.value,
    textDecoration: s.textDecoration === "UNDERLINE" ? "underline" : s.textDecoration === "STRIKETHROUGH" ? "line-through" : undefined,
  };
}

function layerCSS(n: Layer, s: Style, root: boolean): CSSProperties {
  const m = s.relativeTransform ?? [
    [1, 0, 0],
    [0, 1, 0],
  ];
  const css: CSSProperties = {
    position: root ? "relative" : "absolute",
    zIndex: 0,
    left: root ? 0 : m[0][2],
    top: root ? 0 : m[1][2],
    width: s.width ?? 0,
    height: s.height ?? 0,
    opacity: s.opacity,
    transformOrigin: "0 0",
    transform: m[0][0] !== 1 || m[1][1] !== 1 || m[0][1] || m[1][0] ? `matrix(${m[0][0]},${m[1][0]},${m[0][1]},${m[1][1]},0,0)` : undefined,
    borderRadius: n.t === "ELLIPSE" ? "50%" : `${s.topLeftRadius ?? s.cornerRadius ?? 0}px ${s.topRightRadius ?? s.cornerRadius ?? 0}px ${s.bottomRightRadius ?? s.cornerRadius ?? 0}px ${s.bottomLeftRadius ?? s.cornerRadius ?? 0}px`,
    overflow: s.clipsContent ? "hidden" : undefined,
  };
  if (n.t === "TEXT") {
    Object.assign(css, textCSS(s), {
      display: "flex",
      flexDirection: "column",
      justifyContent: s.textAlignVertical === "CENTER" ? "center" : s.textAlignVertical === "BOTTOM" ? "flex-end" : "flex-start",
      textAlign: (s.textAlignHorizontal ?? "LEFT").toLowerCase(),
      whiteSpace: (s.height ?? 0) <= (s.fontSize ?? 12) * 1.6 ? "pre" : "pre-wrap",
      overflowWrap: "normal",
      textTransform: s.textCase === "UPPER" ? "uppercase" : s.textCase === "LOWER" ? "lowercase" : s.textCase === "TITLE" ? "capitalize" : undefined,
    });
  } else if (!n.asset) {
    const fills = (s.fills ?? [])
      .filter((p) => p.visible !== false)
      .reverse()
      .map((p) => {
        const v = paint(p, s.width, s.height);
        return p.type === "SOLID" ? `linear-gradient(${v},${v})` : v;
      });
    if (fills.length) css.backgroundImage = fills.join(",");
  }
  if (!n.asset) {
    const shadows = (s.effects ?? [])
      .filter((e) => e.visible !== false && ["DROP_SHADOW", "INNER_SHADOW"].includes(e.type))
      .map((e) => `${e.type === "INNER_SHADOW" ? "inset " : ""}${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread ?? 0}px ${rgba(e.color)}`);
    if (shadows.length) css.boxShadow = shadows.join(",");
    const blur = s.effects?.find((e) => e.visible !== false && e.type === "BACKGROUND_BLUR");
    if (blur) css.backdropFilter = `blur(${blur.radius}px)`;
  }
  return css;
}

const FigmaLayer = memo(function FigmaLayer({ node: n, styles, root = false, mask }: { node: Layer; styles: Style[]; root?: boolean; mask?: Layer }) {
  const s = styles[n.s];
  if (s.isMask || n.renderHidden) return null;
  const stroke = s.strokes?.find((p) => p.visible !== false && p.color);
  const border: CSSProperties = stroke
    ? {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderStyle: n.dashed ? "dashed" : "solid",
        borderColor: paint(stroke),
        borderTopWidth: s.strokeTopWeight ?? ((s.strokeTopWeight || s.strokeRightWeight || s.strokeBottomWeight || s.strokeLeftWeight) ? 0 : s.strokeWeight ?? 0),
        borderRightWidth: s.strokeRightWeight ?? ((s.strokeTopWeight || s.strokeRightWeight || s.strokeBottomWeight || s.strokeLeftWeight) ? 0 : s.strokeWeight ?? 0),
        borderBottomWidth: s.strokeBottomWeight ?? ((s.strokeTopWeight || s.strokeRightWeight || s.strokeBottomWeight || s.strokeLeftWeight) ? 0 : s.strokeWeight ?? 0),
        borderLeftWidth: s.strokeLeftWeight ?? ((s.strokeTopWeight || s.strokeRightWeight || s.strokeBottomWeight || s.strokeLeftWeight) ? 0 : s.strokeWeight ?? 0),
        borderRadius: "inherit",
        zIndex: 1,
      }
    : {};
  return (
    <div
      className="figma-layer"
      data-node-id={n.i}
      data-layer-name={n.n}
      style={{
        ...layerCSS(n, s, root),
        ...(mask?.c?.[0]?.asset ? { maskImage: `url(${base}${mask.c[0].asset})`, maskSize: "100% 100%", maskRepeat: "no-repeat" } : {}),
      }}
    >
      {n.asset ? (
        <img
          src={`${base}${n.asset}`}
          alt=""
          draggable={false}
          style={n.assetBounds ? { position: "absolute", left: n.assetBounds[0], top: n.assetBounds[1], width: n.assetBounds[2], height: n.assetBounds[3] } : { display: "block", width: "100%", height: "100%" }}
        />
      ) : n.text !== undefined ? (
        <div style={{ flexShrink: 0, width: "calc(100% + 0.5px)" }}>{s.segments?.length ? s.segments.map((t, i) => <span key={i} style={textCSS(t)}>{t.characters}</span>) : n.text}</div>
      ) : (
        n.c?.map((c, i) => <FigmaLayer key={c.i} node={c} styles={styles} mask={i > 0 && styles[n.c![i - 1].s].isMask ? n.c![i - 1] : undefined} />)
      )}
      {!n.asset && stroke && <div aria-hidden="true" style={border} />}
    </div>
  );
});

export function FigmaScreen({ screenId, onLoad }: { screenId: string; onLoad?: (data: ScreenData) => void }) {
  const [data, setData] = useState<ScreenData>();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setData(undefined);
    setError("");
    loadScreen(screenId)
      .then((d) => {
        if (active) {
          setData(d);
          onLoad?.(d);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [screenId, onLoad]);
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p className="loading" role="status">Loading screen…</p>;
  return <FigmaLayer node={data.root} styles={data.styles} root />;
}
