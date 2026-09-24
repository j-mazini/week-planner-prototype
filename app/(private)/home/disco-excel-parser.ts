/**
 * Parser de Excel DISCO (Route Data) – port da lógica de
 * logix-subsistem/scripts/import_excel_to_data.py
 * Converte linhas do Excel em estrutura para o bloco My deliveries (postcodes por rota).
 */

import type { DashboardDisco, DiscoDeliveryRow, DiscoLoopInfo, ParsedDiscoData } from "./disco-types";

function normaliseSubpostcode(val: unknown): string | null {
  const s = String(val ?? "")
    .trim()
    .replace(/\s/g, "");
  if (s.length <= 2) return s || null;
  return s.slice(0, -2);
}

function findCol(header: string[], names: string[]): number {
  for (let i = 0; i < header.length; i++) {
    const h = (header[i] ?? "").trim().toUpperCase();
    for (const n of names) {
      const nu = n.toUpperCase();
      if (nu.includes(h) || h.includes(nu)) return i;
    }
  }
  return -1;
}

function isFlagged(row: unknown[], col: number): boolean {
  if (col < 0 || col >= row.length) return false;
  const v = row[col];
  if (v == null) return false;
  const s = String(v).trim().toUpperCase();
  return ["1", "X", "Y", "YES", "TRUE", "S", "SIM"].includes(s);
}

/**
 * Converte linhas do Excel (primeira linha pode ser cabeçalho) em dados Disco.
 * Espera colunas: Route, SortWave/Cycle, opcional Loop, Depot, Subpostcode/Postcode, Address, Name/Receiver, Pre-12, ASR, DSR.
 */
export function parseDiscoFromRows(rows: unknown[][]): ParsedDiscoData {
  const out: ParsedDiscoData = {
    am: [],
    pm: [],
    byRoute: {},
    rawDeliveries: [],
  };
  if (!rows?.length) return out;

  let headerRowIdx = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = (rows[i] ?? []).map((c) => (c != null ? String(c).trim() : ""));
    if (!row.includes("Route")) continue;
    const hasSort =
      row.some((h) => (h || "").includes("SortWave") || (h || "").includes("Sort Wave")) ||
      row.some((h) => (h || "").includes("Cycle"));
    if (!hasSort) continue;
    const hasPostcode = row.some(
      (h) =>
        (h || "").includes("Postal Code") ||
        (h || "").includes("Postcode") ||
        (h || "").includes("Subpostcode")
    );
    headerRowIdx = i;
    if (hasPostcode) break;
  }

  const header = (rows[headerRowIdx] ?? []).map((c) => (c != null ? String(c).trim() : ""));
  const colRoute = header.indexOf("Route");
  if (colRoute < 0) return out;

  let colSort = -1;
  let colLoop = -1;
  let colDepot = -1;
  let colSubpostcode = -1;
  let colAddress = -1;
  let colRecipient = -1;
  for (let i = 0; i < header.length; i++) {
    const h = (header[i] ?? "").trim();
    if (h.includes("SortWave") || h.includes("Sort Wave")) colSort = i;
    if (h === "Loop" || h === "Cycle") colLoop = i;
    if (h === "Depot" || h.includes("PUD SVC") || h.includes("PUD Svc")) colDepot = i;
    if (
      h.includes("Subpostcode") ||
      h.includes("Sub Postcode") ||
      h.includes("Sub postcode")
    )
      colSubpostcode = i;
    if (colSubpostcode < 0 && (h === "Postcode" || h.includes("Post code") || h === "Postal Code"))
      colSubpostcode = i;
    if (h === "Address") colAddress = i;
    if (h === "Receiver" || (h === "Name" && colAddress < 0)) colRecipient = i;
    else if (h === "Name") colRecipient = i;
  }
  const colPre12 = findCol(header, ["Pre-12", "Pre 12", "Pre12"]);
  const colAsr = findCol(header, ["ASR", "Adult Signature", "Adult Signature Required"]);
  const colDsr = findCol(header, ["DSR", "Direct Signature", "Direct Signature Required"]);

  const amSet = new Set<string>();
  const pmSet = new Set<string>();

  for (let idx = headerRowIdx + 1; idx < rows.length; idx++) {
    const row = [...(rows[idx] ?? [])];
    const route = (row[colRoute] != null ? String(row[colRoute]) : "").trim();
    if (!route || route.toUpperCase() === "ROUTE") continue;

    const wave =
      colSort >= 0 && colSort < row.length
        ? String(row[colSort] ?? "").trim().toUpperCase()
        : "";
    const isAm = wave.includes("AM") || wave === "AM";
    const isPm = wave.includes("PM") || wave === "PM";
    if (isAm) amSet.add(route);
    if (isPm) pmSet.add(route);

    const loop =
      colLoop >= 0 && colLoop < row.length
        ? String(row[colLoop] ?? "").trim() || null
        : null;
    const depot =
      colDepot >= 0 && colDepot < row.length
        ? String(row[colDepot] ?? "").trim() || null
        : null;
    const subRaw =
      colSubpostcode >= 0 && colSubpostcode < row.length
        ? String(row[colSubpostcode] ?? "").trim()
        : null;
    const sub = subRaw ? normaliseSubpostcode(subRaw) : null;

    if (!out.byRoute[route]) {
      out.byRoute[route] = {
        sortWave: isAm ? "AM" : "PM",
        loop: null,
        depot: null,
        subpostcodes: [],
      };
    }
    if (loop) out.byRoute[route].loop = loop;
    if (depot) out.byRoute[route].depot = depot;
    if (sub && !out.byRoute[route].subpostcodes.includes(sub)) {
      out.byRoute[route].subpostcodes.push(sub);
    }

    const address =
      colAddress >= 0 && colAddress < row.length ? String(row[colAddress] ?? "").trim() : "";
    const recipient =
      colRecipient >= 0 && colRecipient < row.length ? String(row[colRecipient] ?? "").trim() : "";

    out.rawDeliveries.push({
      depot: depot ?? "",
      route,
      loop: loop ?? "",
      subpostcode: sub ?? (subRaw ?? "").trim() ?? "",
      address,
      recipient,
      pre12: isFlagged(row, colPre12),
      asr: isFlagged(row, colAsr),
      dsr: isFlagged(row, colDsr),
    });
  }

  for (const r of Object.keys(out.byRoute)) {
    out.byRoute[r].subpostcodes.sort();
  }
  out.am = [...amSet].sort();
  out.pm = [...pmSet].sort();
  return out;
}

function buildLoopsFromRaw(raw: DiscoDeliveryRow[]): Record<string, DiscoLoopInfo> {
  const loops: Record<string, { totalDeliveries: number; routes: Record<string, number> }> = {};
  for (const r of raw ?? []) {
    const loopId = (r.loop ?? "").trim() || "—";
    const route = (r.route ?? "").trim();
    if (!loops[loopId]) {
      loops[loopId] = { totalDeliveries: 0, routes: {} };
    }
    loops[loopId].totalDeliveries += 1;
    if (route) {
      loops[loopId].routes[route] = (loops[loopId].routes[route] ?? 0) + 1;
    }
  }
  const result: Record<string, DiscoLoopInfo> = {};
  for (const [lid, data] of Object.entries(loops)) {
    result[lid] = {
      totalDeliveries: data.totalDeliveries,
      routes: Object.entries(data.routes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([route, deliveries]) => ({ route, deliveries })),
    };
  }
  return result;
}

/**
 * Converte o resultado de parseDiscoFromRows para o formato do dashboard (disco.json).
 */
export function discoToDashboardJson(discoData: ParsedDiscoData, sourceName = "upload"): DashboardDisco {
  const byRoute = discoData.byRoute ?? {};
  const raw = discoData.rawDeliveries ?? [];
  const loops = buildLoopsFromRaw(raw);

  const routes = [...new Set([...(discoData.am ?? []), ...(discoData.pm ?? [])])].sort();
  if (routes.length === 0) {
    routes.push(...Object.keys(byRoute).sort());
  }

  let depotSeen = "";
  let loopSeen = "";
  if (raw.length > 0) {
    depotSeen = raw.find((r) => r.depot)?.depot ?? "";
    const firstRouteInfo = byRoute[raw[0].route];
    loopSeen = (firstRouteInfo?.loop ?? raw[0].loop ?? "") || "";
  }
  for (const info of Object.values(byRoute)) {
    if (info.depot && !depotSeen) depotSeen = info.depot;
    if (info.loop && !loopSeen) loopSeen = info.loop;
  }

  return {
    source: sourceName,
    depot: depotSeen,
    loop: loopSeen,
    routes,
    am: discoData.am?.length ? discoData.am : undefined,
    pm: discoData.pm?.length ? discoData.pm : undefined,
    deliveries: raw,
    loops,
  };
}

/**
 * Lê um ficheiro Excel (File) e devolve a estrutura DashboardDisco.
 * Usar com input type="file" ou drag-and-drop.
 */
export async function parseDiscoExcelFile(file: File): Promise<DashboardDisco> {
  const XLSX = await import("xlsx");
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error("Nenhuma folha encontrada no Excel.");
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][];
  const parsed = parseDiscoFromRows(rows);
  return discoToDashboardJson(parsed, file.name);
}

