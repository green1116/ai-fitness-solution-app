/**
 * PI-7.2 — Product Implementation package routing verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { IMPLEMENTATION_FOUNDATION_ID } from "../foundation/implementation.constants";
import {
  IMPLEMENTATION_DOMAIN_IDS,
  IMPLEMENTATION_LAYER_IDS,
} from "../foundation/layer-refs";
import { IMPLEMENTATION_PACKAGE_IDS } from "../foundation/package-refs";
import {
  IMPLEMENTATION_PACKAGE_CHAIN,
  PACKAGE_DEPENDENCY_ROUTES,
  packageDependencyMatchesFoundation,
} from "../routing/dependency-routing";
import { resolveImplementationRoutePlan } from "../routing/implementation-route-plan";
import {
  PACKAGE_LAYER_ROUTES,
  packageLayerRouteMatchesFoundation,
} from "../routing/package-layer-routing";
import {
  IMPLEMENTATION_BASELINE_REF,
  IMPLEMENTATION_FOUNDATION_REF,
  IMPLEMENTATION_ROUTING_GATE,
  IMPLEMENTATION_ROUTING_LAYER_ID,
} from "../routing/routing.constants";
import { runImplementationFoundationGate } from "./implementation.foundation.gate";

export type ImplementationRoutingCheck = Readonly<{
  id: string;
  source: "PI-7.1" | "PI-7.2" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ImplementationRoutingReport = Readonly<{
  layer: "PI-7.2";
  layerId: typeof IMPLEMENTATION_ROUTING_LAYER_ID;
  gateId: typeof IMPLEMENTATION_ROUTING_GATE;
  passed: boolean;
  checks: readonly ImplementationRoutingCheck[];
  summary: Readonly<{
    packages: number;
    layerRoutes: number;
    dependencyRoutes: number;
    foundationPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ImplementationRoutingCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ImplementationRoutingCheck {
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

export function runImplementationRoutingGate(
  rootDir?: string,
): ImplementationRoutingReport {
  const root = resolveRoot(rootDir);
  const checks: ImplementationRoutingCheck[] = [];

  const foundation = runImplementationFoundationGate(root);
  checks.push(
    check(
      "IMPR-FOUNDATION",
      "PI-7.1",
      "PI-7.1 implementation foundation intact for package routing",
      foundation.passed &&
        foundation.foundationId === IMPLEMENTATION_FOUNDATION_ID &&
        IMPLEMENTATION_FOUNDATION_REF === IMPLEMENTATION_FOUNDATION_ID &&
        IMPLEMENTATION_BASELINE_REF === "product-implementation-baseline-v1",
      `packages=${foundation.summary.packages} layers=${foundation.summary.layers}`,
    ),
  );

  checks.push(
    check(
      "IMPR-IDS",
      "PI-7.2",
      "Implementation routing layer IDs locked; closed package set",
      IMPLEMENTATION_ROUTING_LAYER_ID ===
        "product-implementation-routing-v1" &&
        IMPLEMENTATION_ROUTING_GATE ===
          "product-implementation-routing-gate" &&
        PACKAGE_LAYER_ROUTES.length === IMPLEMENTATION_PACKAGE_IDS.length &&
        PACKAGE_DEPENDENCY_ROUTES.length ===
          IMPLEMENTATION_PACKAGE_IDS.length &&
        IMPLEMENTATION_PACKAGE_CHAIN.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6",
      `layer=${IMPLEMENTATION_ROUTING_LAYER_ID} packages=${PACKAGE_LAYER_ROUTES.length}`,
    ),
  );

  const matchFoundation = IMPLEMENTATION_PACKAGE_IDS.every((packageId) => {
    try {
      const plan = resolveImplementationRoutePlan(packageId, "M13");
      return (
        plan.matchesFoundation &&
        plan.reusesExistingLayers &&
        plan.layerId === IMPLEMENTATION_ROUTING_LAYER_ID &&
        plan.packageId === packageId
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "IMPR-MATCH",
      "PI-7.2",
      "Package routing matches foundation",
      matchFoundation &&
        PACKAGE_LAYER_ROUTES.every((r) =>
          packageLayerRouteMatchesFoundation(r),
        ) &&
        PACKAGE_DEPENDENCY_ROUTES.every((r) =>
          packageDependencyMatchesFoundation(r),
        ),
      `packages=${IMPLEMENTATION_PACKAGE_IDS.length}`,
    ),
  );

  const layersReuse = PACKAGE_LAYER_ROUTES.every(
    (r) =>
      (IMPLEMENTATION_LAYER_IDS as readonly string[]).includes(
        r.primaryLayerId,
      ) &&
      r.supportingLayerIds.every((id) =>
        (IMPLEMENTATION_LAYER_IDS as readonly string[]).includes(id),
      ),
  );
  checks.push(
    check(
      "IMPR-LAYERS",
      "PI-7.2",
      "Existing layers reused",
      layersReuse,
      `routes=${PACKAGE_LAYER_ROUTES.length} layers=${IMPLEMENTATION_LAYER_IDS.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  const pi6 = resolveImplementationRoutePlan("PI-6", "M12");
  checks.push(
    check(
      "IMPR-NO-NEW-DOMAIN",
      "PI-7.2",
      "No new Domain",
      forbidden.length === 0 &&
        pi6.domains.join(",") === "M11,M12,M13,M14,M15" &&
        IMPLEMENTATION_DOMAIN_IDS.length === 5,
      forbidden.length
        ? forbidden.join(",")
        : `domains=${IMPLEMENTATION_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "IMPR-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      IMPLEMENTATION_BASELINE_REF === "product-implementation-baseline-v1" &&
        IMPLEMENTATION_PACKAGE_CHAIN.length === 5 &&
        !fs.existsSync(path.join(root, "lib/implementation/engines")) &&
        !fs.existsSync(path.join(root, "lib/implementation/new-architecture")),
      "baseline locked; PI-2…PI-6 chain closed",
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
      "IMPR-NO-COUPLE",
      "PI-7.2",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi7Files.length}`,
    ),
  );

  const pi2 = resolveImplementationRoutePlan("PI-2", "M11");
  const pi5 = resolveImplementationRoutePlan("PI-5", "M14");
  checks.push(
    check(
      "IMPR-SPOT",
      "PD-7",
      "Golden package routes bind layers and dependency chain",
      pi2.primaryLayerId === "FRONTEND" &&
        pi5.primaryLayerId === "INTEGRATION" &&
        pi6.primaryLayerId === "DELIVERY" &&
        pi6.dependency.upstreamPackageIds.length === 4 &&
        pi6.layerIds.includes("INTEGRATION") &&
        pi2.chain.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6",
      `pi2=${pi2.primaryLayerId} pi5=${pi5.primaryLayerId} pi6=${pi6.primaryLayerId} chain=${pi2.chain.join("→")}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-7.2",
    layerId: IMPLEMENTATION_ROUTING_LAYER_ID,
    gateId: IMPLEMENTATION_ROUTING_GATE,
    passed,
    checks,
    summary: {
      packages: IMPLEMENTATION_PACKAGE_IDS.length,
      layerRoutes: PACKAGE_LAYER_ROUTES.length,
      dependencyRoutes: PACKAGE_DEPENDENCY_ROUTES.length,
      foundationPassed: foundation.passed,
    },
  };
}

export function assertImplementationRoutingGate(
  report: ImplementationRoutingReport = runImplementationRoutingGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Implementation routing gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
