/**
 * PI-3.4 — API Surface / Exposure verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { API_FAMILY_OWNERSHIP } from "../foundation/api-ownership";
import { BACKEND_COMMAND_OWNERSHIP } from "../foundation/command-ownership";
import {
  DOMAIN_OWNERSHIP,
  FORBIDDEN_DOMAIN_PATHS,
} from "../foundation/domain-ownership";
import { SERVICE_RUNTIME_SURFACES } from "../runtime/runtime-bindings";
import {
  RUNTIME_SURFACE_IDS,
  type RuntimeSurfaceId,
} from "../runtime/runtime-surfaces";
import {
  API_FAMILY_CATALOGUE,
  API_FAMILY_IDS,
  API_SURFACE_GATE_ID,
  API_SURFACE_LAYER_ID,
  classifyApiFamily,
} from "../api/api-families";
import {
  API_BINDING_SOURCE_ID,
  API_SURFACE_BINDINGS,
  requiresHttpExposure,
} from "../api/api-surface-bindings";
import { resolveApiExposurePlan } from "../api/api-exposure-plan";
import { runBackendRuntimeGate } from "./backend.runtime.gate";

export type ApiGateCheck = Readonly<{
  id: string;
  source: "PI-3.1" | "PI-3.2" | "PI-3.3" | "PI-3.4" | "PD-5.3";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ApiGateReport = Readonly<{
  layer: "PI-3.4";
  layerId: typeof API_SURFACE_LAYER_ID;
  gateId: typeof API_SURFACE_GATE_ID;
  passed: boolean;
  checks: readonly ApiGateCheck[];
  summary: Readonly<{
    families: number;
    bindings: number;
    httpBindings: number;
    runtimePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ApiGateCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ApiGateCheck {
  return {
    id,
    source,
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function resolveRoot(rootDir?: string): string {
  return rootDir ? path.resolve(rootDir) : path.resolve(__dirname, "../../..");
}

function listTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsFiles(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

export function runBackendApiSurfaceGate(
  rootDir?: string,
): ApiGateReport {
  const root = resolveRoot(rootDir);
  const checks: ApiGateCheck[] = [];

  const runtime = runBackendRuntimeGate(root);
  checks.push(
    check(
      "API-RUNTIME",
      "PI-3.3",
      "PI-3.3 runtime bindings intact for API exposure",
      runtime.passed,
      `ports=${runtime.summary.domainPorts} adapters=${runtime.summary.adapters}`,
    ),
  );

  checks.push(
    check(
      "API-FAMILIES",
      "PD-5.3",
      "Closed API family catalogue (existing families only)",
      API_FAMILY_IDS.length === 11 &&
        API_FAMILY_CATALOGUE.length === 11 &&
        API_SURFACE_LAYER_ID === "product-backend-api-architecture-v1" &&
        API_SURFACE_GATE_ID === "product-backend-api-architecture-gate" &&
        API_FAMILY_CATALOGUE.every((f) =>
          DOMAIN_OWNERSHIP.some((d) => d.id === f.ownerDomain),
        ),
      `families=${API_FAMILY_IDS.length} source=${API_BINDING_SOURCE_ID}`,
    ),
  );

  const kindCounts = {
    api: 0,
    apiNav: 0,
    nearest: 0,
    nav: 0,
    pref: 0,
  };
  for (const row of API_SURFACE_BINDINGS) {
    if (row.bindingKind === "API") kindCounts.api += 1;
    else if (row.bindingKind === "API+NAV") kindCounts.apiNav += 1;
    else if (row.bindingKind === "NEAREST") kindCounts.nearest += 1;
    else if (row.bindingKind === "NAV") kindCounts.nav += 1;
    else if (row.bindingKind === "PREF") kindCounts.pref += 1;
  }
  const kindSum =
    kindCounts.api +
    kindCounts.apiNav +
    kindCounts.nearest +
    kindCounts.nav +
    kindCounts.pref;
  const commandIdsMatch =
    BACKEND_COMMAND_OWNERSHIP.every((cmd) =>
      API_SURFACE_BINDINGS.some(
        (b) => b.actionId === cmd.actionId && b.command === cmd.command,
      ),
    ) &&
    new Set(API_SURFACE_BINDINGS.map((b) => b.actionId)).size ===
      API_SURFACE_BINDINGS.length;

  checks.push(
    check(
      "API-BINDINGS",
      "PI-3.4",
      "All Commands have exactly one existing API surface binding",
      API_SURFACE_BINDINGS.length === BACKEND_COMMAND_OWNERSHIP.length &&
        API_SURFACE_BINDINGS.length === 47 &&
        kindSum === 47 &&
        kindCounts.pref === 1 &&
        kindCounts.nav >= 9 &&
        kindCounts.nearest >= 7 &&
        kindCounts.api + kindCounts.apiNav >= 28 &&
        commandIdsMatch,
      `bindings=${API_SURFACE_BINDINGS.length} api=${kindCounts.api} apiNav=${kindCounts.apiNav} nearest=${kindCounts.nearest} nav=${kindCounts.nav} pref=${kindCounts.pref}`,
    ),
  );

  const routeFilesOk = API_SURFACE_BINDINGS.every((row) => {
    if (!requiresHttpExposure(row.bindingKind)) {
      return row.routes.length === 0 && row.families.length === 0;
    }
    if (row.routes.length === 0) return false;
    return row.routes.every((route) => {
      const plan = resolveApiExposurePlan(row.actionId);
      const resolved = plan.routes.find((r) => r.route === route);
      if (!resolved || !resolved.familyId) return false;
      if (!row.families.includes(resolved.familyId)) return false;
      return fs.existsSync(path.join(root, resolved.appPath));
    });
  });
  checks.push(
    check(
      "API-ROUTES",
      "PI-3.4",
      "HTTP bindings resolve to existing /api route files",
      routeFilesOk,
      `httpRows=${API_SURFACE_BINDINGS.filter((r) => requiresHttpExposure(r.bindingKind)).length}`,
    ),
  );

  const surfaceAlign = API_SURFACE_BINDINGS.every((row) => {
    if (row.surfaces.length === 0) {
      return row.bindingKind === "NAV";
    }
    return row.surfaces.every((surface) =>
      (RUNTIME_SURFACE_IDS as readonly string[]).includes(surface),
    );
  });

  const runtimeMatch = BACKEND_COMMAND_OWNERSHIP.every((cmd) => {
    try {
      const plan = resolveApiExposurePlan(cmd.actionId);
      if (plan.serviceId !== plan.runtime.serviceId) return false;

      if (cmd.executionKind === "NavPref") {
        return (
          !plan.requiresHttp &&
          !plan.runtime.requiresRuntimeAdapter &&
          plan.routes.length === 0 &&
          plan.routeAdapters.length === 0
        );
      }

      if (!plan.requiresHttp || plan.primaryRoute === null) return false;
      if (plan.families.length === 0) return false;

      const serviceSurfaces = SERVICE_RUNTIME_SURFACES[
        plan.serviceId
      ] as readonly RuntimeSurfaceId[];
      const overlap = plan.surfaces.some((s) => serviceSurfaces.includes(s));
      if (plan.surfaces.length > 0 && !overlap) return false;

      // Preferred v80 routes must align with PI-3.3 runtime adapters.
      for (const route of plan.routes) {
        for (const adapterId of route.adapterIds) {
          if (!adapterId.startsWith("RT-V80-")) continue;
          const adapter = plan.routeAdapters.find(
            (a) => a.adapterId === adapterId,
          );
          if (!adapter) return false;
          const sharesSurface = adapter.surfaces.some((s) =>
            plan.surfaces.includes(s),
          );
          if (!sharesSurface) return false;
          const reachable =
            plan.runtime.adapters.some((a) => a.adapterId === adapterId) ||
            adapter.surfaces.some((s) => serviceSurfaces.includes(s));
          if (!reachable) return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  });

  checks.push(
    check(
      "API-RUNTIME-MATCH",
      "PI-3.4",
      "API surface matches backend runtime bindings",
      surfaceAlign && runtimeMatch,
      `surfaces=${RUNTIME_SURFACE_IDS.length} actions=${BACKEND_COMMAND_OWNERSHIP.length}`,
    ),
  );

  const foundationFamiliesOk = API_FAMILY_OWNERSHIP.every((row) => {
    const family = classifyApiFamily(row.family);
    return family !== null && (API_FAMILY_IDS as readonly string[]).includes(family);
  });
  checks.push(
    check(
      "API-NO-NEW-FAM",
      "PI-3.4",
      "No new Domain / API families",
      foundationFamiliesOk &&
        FORBIDDEN_DOMAIN_PATHS.every(
          (p) => !fs.existsSync(path.join(root, p)),
        ) &&
        API_FAMILY_CATALOGUE.every((f) => f.prefix.startsWith("/api/")),
      `pi31Families=${API_FAMILY_OWNERSHIP.length} closed=${API_FAMILY_IDS.length}`,
    ),
  );

  const apiFiles = listTsFiles(path.join(root, "lib/backend/api"));
  const feHits = apiFiles.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/frontend|from\s+["'][^"']*lib\/frontend/.test(
      text,
    );
  });
  checks.push(
    check(
      "API-NO-FE",
      "PI-3.4",
      "No frontend coupling in API surface layer",
      feHits.length === 0,
      feHits.length
        ? feHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${apiFiles.length}`,
    ),
  );

  // Spot-check golden exposures
  const signIn = resolveApiExposurePlan("ACT-01-01");
  const upload = resolveApiExposurePlan("ACT-03-01");
  const agent = resolveApiExposurePlan("ACT-04-04");
  const nav = resolveApiExposurePlan("ACT-01-03");
  const gov = resolveApiExposurePlan("ACT-09-06");
  checks.push(
    check(
      "API-SPOT",
      "PI-3.4",
      "Golden exposure plans bind preferred existing families",
      signIn.families[0] === "FAM-AUTH" &&
        signIn.primaryRoute?.normalizedPath === "/api/auth/otp/request" &&
        upload.families.includes("FAM-V80") &&
        upload.routeAdapters.some((a) => a.adapterId === "RT-V80-TENDER") &&
        upload.runtime.adapters.some((a) => a.adapterId === "RT-V80-TENDER") &&
        agent.routeAdapters.some((a) => a.adapterId === "RT-V80-AUTOPILOT") &&
        !nav.requiresHttp &&
        nav.routes.length === 0 &&
        gov.families.includes("FAM-OPS") &&
        gov.routeAdapters.some((a) => a.adapterId === "RT-V80-OPS"),
      `signIn=${signIn.families.join(",")} upload=${upload.primaryRoute?.normalizedPath} agent=${agent.serviceId} gov=${gov.primaryRoute?.normalizedPath}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-3.4",
    layerId: API_SURFACE_LAYER_ID,
    gateId: API_SURFACE_GATE_ID,
    passed,
    checks,
    summary: {
      families: API_FAMILY_IDS.length,
      bindings: API_SURFACE_BINDINGS.length,
      httpBindings: API_SURFACE_BINDINGS.filter((r) =>
        requiresHttpExposure(r.bindingKind),
      ).length,
      runtimePassed: runtime.passed,
    },
  };
}

export function assertBackendApiSurfaceGate(
  report: ApiGateReport = runBackendApiSurfaceGate(),
): ApiGateReport {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-3.4 API surface gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
