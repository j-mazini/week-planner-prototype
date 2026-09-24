import { NextResponse } from "next/server";

/**
 * Health check padronizado (liveness) — GET /health na porta 3000.
 *
 * Contrato compartilhado entre os 3 apps (BE 3001, FE 3000, INT 3005):
 *   { status, service, version, sha, uptimeSeconds, timestamp }
 *
 * Barato e sem dependências externas — chamado pelo CD a cada deploy e pelo
 * smoke test do CI. `force-dynamic` + `runtime nodejs` garantem que a rota seja
 * compilada como handler dinâmico no build standalone (não pré-renderizada).
 *
 * IMPORTANTE: precisa estar em `isPublicRoute` no middleware.ts, senão o gate
 * de auth redireciona /health para o login (307).
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SERVICE = "logix-sphere-frontend-nextjs";

function resolveVersion(): string {
  return (
    process.env.APP_VERSION ?? process.env.npm_package_version ?? "unknown"
  );
}

function resolveSha(): string {
  return process.env.RELEASE_SHA ?? process.env.GIT_SHA ?? "unknown";
}

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: SERVICE,
    version: resolveVersion(),
    sha: resolveSha(),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
