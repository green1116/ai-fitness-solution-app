/**
 * PI-7.3 — Product Implementation runtime verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import {
  IMPLEMENTATION_DOMAIN_IDS,
  IMPLEMENTATION_LAYER_IDS,
} from "../foundation/layer-refs";
import { IMPLEMENTATION_PACKAGE_IDS } from "../foundation/package-refs";
import { IMPLEMENTATION_ROUTING_LAYER_ID } from "../routing/routing.constants";
import { resolveImplementationRuntimePlan } from "../runtime/implementation-runtime-plan";
import {
  LAYER_RUNTIME_BINDINGS,
  layerAdapterMatchesFoundation,
} from "../runtime/layer-runtime-bindings";
import {
  PACKAGE_RUNTIME_BINDINGS,
  packageRuntimeMatchesFoundation,
} from "../runtime/package-runtime-bindings";
import {
  IMPLEMENTATION_FOUNDATION_REF,
  IMPLEMENTATION_ROUTING_REF,
  IMPLEMENTATION_RUNTIME_GATE,
  IMPLEMENTATION_RUNTIME_ID,
} from "../runtime/runtime.constants";
import { IMPLEMENTATION_FOUNDATION_ID } from "../foundation/implementation.constants";
import { runImplementationRoutingGate } from "./implementation.routing.gate";

export type ImplementationRuntimeCheck = Readonly<{
  id: string;
  source: "PI-7.1" | "PI-7.2" | "PI-7.3" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ImplementationRuntimeReport = Readonly<{
  layer: "PI-7.3";
  runtimeId: typeof IMPLEMENTATION_RUNTIME_ID;
  gateId: typeof IMPLEMENTATION_RUNTIME_GATE;
  passed: boolean;
  checks: readonly ImplementationRuntimeCheck[];
  summary: Readonly<{
    layerAdapters: number;
    packageBindings: number;
    packages: number;
    routingPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ImplementationRuntimeCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ImplementationRuntimeCheck {
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

export function runImplementationRuntimeGate(
  rootDir?: string,
): ImplementationRuntimeReport {
  const root = resolveRoot(rootDir);
  const checks: ImplementationRuntimeCheck[] = [];

  const routing = runImplementationRoutingGate(root);
  checks.push(
    check(
      "IMRT-ROUTING",
      "PI-7.2",
      "PI-7.2 package routing intact for implementation runtime",
      routing.passed &&
        routing.layerId === IMPLEMENTATION_ROUTING_LAYER_ID &&
        IMPLEMENTATION_ROUTING_REF === IMPLEMENTATION_ROUTING_LAYER_ID &&
        IMPLEMENTATION_FOUNDATION_REF === IMPLEMENTATION_FOUNDATION_ID,
      `packages=${routing.summary.packages} layerRoutes=${routing.summary.layerRoutes}`,
    ),
  );

  checks.push(
    check(
      "IMRT-IDS",
      "PI-7.3",
      "Implementation runtime IDs locked; closed binding sets",
      IMPLEMENTATION_RUNTIME_ID === "product-implementation-runtime-v1" &&
        IMPLEMENTATION_RUNTIME_GATE ===
          "product-implementation-runtime-gate" &&
        LAYER_RUNTIME_BINDINGS.length === IMPLEMENTATION_LAYER_IDS.length &&
        PACKAGE_RUNTIME_BINDINGS.length === IMPLEMENTATION_PACKAGE_IDS.length,
      `runtime=${IMPLEMENTATION_RUNTIME_ID} layers=${LAYER_RUNTIME_BINDINGS.length} packages=${PACKAGE_RUNTIME_BINDINGS.length}`,
    ),
  );

  const matchRouting = IMPLEMENTATION_PACKAGE_IDS.every((packageId) => {
    try {
      const plan = resolveImplementationRuntimePlan(packageId, "M13");
      return (
        plan.matchesRouting &&
        plan.reusesExistingLayers &&
        plan.runtimeId === IMPLEMENTATION_RUNTIME_ID &&
        plan.packageId === packageId
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "IMRT-MATCH",
      "PI-7.3",
      "Runtime bindings match package routing",
      matchRouting &&
        LAYER_RUNTIME_BINDINGS.every((a) => layerAdapterMatchesFoundation(a)) &&
        PACKAGE_RUNTIME_BINDINGS.every((b) =>
          packageRuntimeMatchesFoundation(b),
        ),
      `packages=${IMPLEMENTATION_PACKAGE_IDS.length}`,
    ),
  );

  const layersExist = LAYER_RUNTIME_BINDINGS.every((adapter) =>
    fs.existsSync(path.join(root, adapter.modulePath)),
  );
  checks.push(
    check(
      "IMRT-LAYERS",
      "PI-7.3",
      "Existing layers reused",
      layersExist &&
        LAYER_RUNTIME_BINDINGS.every((a) =>
          (IMPLEMENTATION_LAYER_IDS as readonly string[]).includes(a.layerId),
        ),
      layersExist
        ? `adapters=${LAYER_RUNTIME_BINDINGS.length}`
        : "missing layer paths",
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  const pi6 = resolveImplementationRuntimePlan("PI-6", "M12");
  checks.push(
    check(
      "IMRT-NO-NEW-DOMAIN",
      "PI-7.3",
      "No new Domain",
      forbidden.length === 0 &&
        pi6.route.domains.join(",") === "M11,M12,M13,M14,M15" &&
        IMPLEMENTATION_DOMAIN_IDS.length === 5,
      forbidden.length
        ? forbidden.join(",")
        : `domains=${IMPLEMENTATION_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "IMRT-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      IMPLEMENTATION_ROUTING_REF === "product-implementation-routing-v1" &&
        pi6.route.chain.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6" &&
        !fs.existsSync(path.join(root, "lib/implementation/engines")) &&
        !fs.existsSync(path.join(root, "lib/implementation/new-architecture")),
      "routing + chain locked; no parallel architecture tree",
    ),
  );

  const pi7Dirs = [
    path.join(root, "lib/implementation/foundation"),
    path.join(root, "lib/implementation/routing"),
    path.join(root, "lib/implementation/runtime"),
    path.join(root, "lib/implementation/exposure"),
    path.join(root, "lib/implementation/hardening"),
    path.join(root, "lib/implementation/verify"),
  ];
  const pi7Files = pi7Dirs.flatMap((d) => listTsFiles(d));
  const coupleHits = pi7Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery)/.test(
      text,
    );
  });
  checks.push(
    check(
      "IMRT-NO-COUPLE",
      "PI-7.3",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi7Files.length}`,
    ),
  );

  const pi2 = resolveImplementationRuntimePlan("PI-2", "M11");
  const pi5 = resolveImplementationRuntimePlan("PI-5", "M14");
  checks.push(
    check(
      "IMRT-SPOT",
      "PD-7",
      "Golden runtime plans bind package modes and primary adapters",
      pi2.mode === "present" &&
        pi2.primaryAdapter.layerId === "FRONTEND" &&
        pi5.mode === "integrate" &&
        pi5.primaryAdapter.layerId === "INTEGRATION" &&
        pi6.mode === "ready" &&
        pi6.primaryAdapter.layerId === "DELIVERY" &&
        pi6.adapters.length === 6,
      `pi2=${pi2.mode}/${pi2.primaryAdapter.adapterId} pi5=${pi5.mode}/${pi5.primaryAdapter.adapterId} pi6=${pi6.mode}/adapters=${pi6.adapters.length}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-7.3",
    runtimeId: IMPLEMENTATION_RUNTIME_ID,
    gateId: IMPLEMENTATION_RUNTIME_GATE,
    passed,
    checks,
    summary: {
      layerAdapters: LAYER_RUNTIME_BINDINGS.length,
      packageBindings: PACKAGE_RUNTIME_BINDINGS.length,
      packages: IMPLEMENTATION_PACKAGE_IDS.length,
      routingPassed: routing.passed,
    },
  };
}

export function assertImplementationRuntimeGate(
  report: ImplementationRuntimeReport = runImplementationRuntimeGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Implementation runtime gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
