/**
 * PI-8.2 — Product Closure routing verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { CLOSURE_FOUNDATION_ID } from "../foundation/closure.constants";
import {
  CLOSURE_DOMAIN_IDS,
  CLOSURE_LAYER_IDS,
} from "../foundation/layer-refs";
import { CLOSURE_PACKAGE_IDS } from "../foundation/package-refs";
import { resolveClosureRoutePlan } from "../routing/closure-route-plan";
import {
  CLOSURE_PACKAGE_CHAIN,
  CLOSURE_PACKAGE_DEPENDENCY_ROUTES,
  closurePackageDependencyMatchesFoundation,
} from "../routing/dependency-routing";
import {
  CLOSURE_PACKAGE_LAYER_ROUTES,
  closurePackageLayerRouteMatchesFoundation,
} from "../routing/package-layer-routing";
import {
  CLOSURE_BASELINE_REF,
  CLOSURE_FOUNDATION_REF,
  CLOSURE_ROUTING_GATE,
  CLOSURE_ROUTING_LAYER_ID,
} from "../routing/routing.constants";
import { runClosureFoundationGate } from "./closure.foundation.gate";

export type ClosureRoutingCheck = Readonly<{
  id: string;
  source: "PI-8.1" | "PI-8.2" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ClosureRoutingReport = Readonly<{
  layer: "PI-8.2";
  layerId: typeof CLOSURE_ROUTING_LAYER_ID;
  gateId: typeof CLOSURE_ROUTING_GATE;
  passed: boolean;
  checks: readonly ClosureRoutingCheck[];
  summary: Readonly<{
    packages: number;
    layerRoutes: number;
    dependencyRoutes: number;
    foundationPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ClosureRoutingCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ClosureRoutingCheck {
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

export function runClosureRoutingGate(
  rootDir?: string,
): ClosureRoutingReport {
  const root = resolveRoot(rootDir);
  const checks: ClosureRoutingCheck[] = [];

  const foundation = runClosureFoundationGate(root);
  checks.push(
    check(
      "CLSR-FOUNDATION",
      "PI-8.1",
      "PI-8.1 closure foundation intact for package routing",
      foundation.passed &&
        foundation.foundationId === CLOSURE_FOUNDATION_ID &&
        CLOSURE_FOUNDATION_REF === CLOSURE_FOUNDATION_ID &&
        CLOSURE_BASELINE_REF === "product-closure-baseline-v1",
      `packages=${foundation.summary.packages} layers=${foundation.summary.layers}`,
    ),
  );

  checks.push(
    check(
      "CLSR-IDS",
      "PI-8.2",
      "Closure routing layer IDs locked; closed package set",
      CLOSURE_ROUTING_LAYER_ID === "product-closure-routing-v1" &&
        CLOSURE_ROUTING_GATE === "product-closure-routing-gate" &&
        CLOSURE_PACKAGE_LAYER_ROUTES.length === CLOSURE_PACKAGE_IDS.length &&
        CLOSURE_PACKAGE_DEPENDENCY_ROUTES.length ===
          CLOSURE_PACKAGE_IDS.length &&
        CLOSURE_PACKAGE_CHAIN.join("→") ===
          "PI-2→PI-3→PI-4→PI-5→PI-6→PI-7",
      `layer=${CLOSURE_ROUTING_LAYER_ID} packages=${CLOSURE_PACKAGE_LAYER_ROUTES.length}`,
    ),
  );

  const matchFoundation = CLOSURE_PACKAGE_IDS.every((packageId) => {
    try {
      const plan = resolveClosureRoutePlan(packageId, "M13");
      return (
        plan.matchesFoundation &&
        plan.reusesExistingLayers &&
        plan.reusesExistingDomains &&
        plan.layerId === CLOSURE_ROUTING_LAYER_ID &&
        plan.packageId === packageId
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "CLSR-MATCH",
      "PI-8.2",
      "Routing matches closure foundation",
      matchFoundation &&
        CLOSURE_PACKAGE_LAYER_ROUTES.every((r) =>
          closurePackageLayerRouteMatchesFoundation(r),
        ) &&
        CLOSURE_PACKAGE_DEPENDENCY_ROUTES.every((r) =>
          closurePackageDependencyMatchesFoundation(r),
        ),
      `packages=${CLOSURE_PACKAGE_IDS.length}`,
    ),
  );

  const layersReuse = CLOSURE_PACKAGE_LAYER_ROUTES.every(
    (r) =>
      (CLOSURE_LAYER_IDS as readonly string[]).includes(r.primaryLayerId) &&
      r.supportingLayerIds.every((id) =>
        (CLOSURE_LAYER_IDS as readonly string[]).includes(id),
      ),
  );
  checks.push(
    check(
      "CLSR-LAYERS",
      "PI-8.2",
      "Existing layers reused",
      layersReuse,
      `routes=${CLOSURE_PACKAGE_LAYER_ROUTES.length} layers=${CLOSURE_LAYER_IDS.length}`,
    ),
  );

  const pi7 = resolveClosureRoutePlan("PI-7", "M12");
  checks.push(
    check(
      "CLSR-DOMAINS",
      "PI-8.2",
      "Existing domains reused",
      pi7.reusesExistingDomains &&
        pi7.domains.join(",") === "M11,M12,M13,M14,M15" &&
        CLOSURE_DOMAIN_IDS.length === 5,
      `domains=${CLOSURE_DOMAIN_IDS.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "CLSR-NO-NEW-DOMAIN",
      "PI-8.2",
      "No new Domain",
      forbidden.length === 0 && CLOSURE_DOMAIN_IDS.length === 5,
      forbidden.length
        ? forbidden.join(",")
        : `domains=${CLOSURE_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "CLSR-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      CLOSURE_BASELINE_REF === "product-closure-baseline-v1" &&
        CLOSURE_PACKAGE_CHAIN.length === 6 &&
        !fs.existsSync(path.join(root, "lib/closure/engines")) &&
        !fs.existsSync(path.join(root, "lib/closure/new-architecture")),
      "baseline locked; PI-2…PI-7 chain closed",
    ),
  );

  const pi8Dirs = [
    path.join(root, "lib/closure/foundation"),
    path.join(root, "lib/closure/routing"),
    path.join(root, "lib/closure/runtime"),
    path.join(root, "lib/closure/exposure"),
    path.join(root, "lib/closure/hardening"),
    path.join(root, "lib/closure/verify"),
  ];
  const pi8Files = pi8Dirs.flatMap((d) => listTsFiles(d));
  const coupleHits = pi8Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery|implementation)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery|implementation)/.test(
      text,
    );
  });
  checks.push(
    check(
      "CLSR-NO-COUPLE",
      "PI-8.2",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi8Files.length}`,
    ),
  );

  const pi2 = resolveClosureRoutePlan("PI-2", "M11");
  const pi6 = resolveClosureRoutePlan("PI-6", "M14");
  checks.push(
    check(
      "CLSR-SPOT",
      "PD-7",
      "Golden closure routes bind layers and dependency chain",
      pi2.primaryLayerId === "FRONTEND" &&
        pi6.primaryLayerId === "DELIVERY" &&
        pi7.primaryLayerId === "IMPLEMENTATION" &&
        pi7.dependency.upstreamPackageIds.length === 5 &&
        pi7.layerIds.includes("DELIVERY") &&
        pi2.chain.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6→PI-7",
      `pi2=${pi2.primaryLayerId} pi6=${pi6.primaryLayerId} pi7=${pi7.primaryLayerId} chain=${pi2.chain.join("→")}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-8.2",
    layerId: CLOSURE_ROUTING_LAYER_ID,
    gateId: CLOSURE_ROUTING_GATE,
    passed,
    checks,
    summary: {
      packages: CLOSURE_PACKAGE_IDS.length,
      layerRoutes: CLOSURE_PACKAGE_LAYER_ROUTES.length,
      dependencyRoutes: CLOSURE_PACKAGE_DEPENDENCY_ROUTES.length,
      foundationPassed: foundation.passed,
    },
  };
}

export function assertClosureRoutingGate(
  report: ClosureRoutingReport = runClosureRoutingGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Closure routing gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
