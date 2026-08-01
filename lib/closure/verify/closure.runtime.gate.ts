/**
 * PI-8.3 — Product Closure runtime verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { CLOSURE_FOUNDATION_ID } from "../foundation/closure.constants";
import {
  CLOSURE_DOMAIN_IDS,
  CLOSURE_LAYER_IDS,
} from "../foundation/layer-refs";
import { CLOSURE_PACKAGE_IDS } from "../foundation/package-refs";
import { CLOSURE_ROUTING_LAYER_ID } from "../routing/routing.constants";
import { resolveClosureRuntimePlan } from "../runtime/closure-runtime-plan";
import {
  CLOSURE_LAYER_RUNTIME_BINDINGS,
  closureLayerAdapterMatchesFoundation,
} from "../runtime/layer-runtime-bindings";
import {
  CLOSURE_PACKAGE_RUNTIME_BINDINGS,
  closurePackageRuntimeMatchesFoundation,
} from "../runtime/package-runtime-bindings";
import {
  CLOSURE_FOUNDATION_REF,
  CLOSURE_ROUTING_REF,
  CLOSURE_RUNTIME_GATE,
  CLOSURE_RUNTIME_ID,
} from "../runtime/runtime.constants";
import { runClosureRoutingGate } from "./closure.routing.gate";

export type ClosureRuntimeCheck = Readonly<{
  id: string;
  source: "PI-8.1" | "PI-8.2" | "PI-8.3" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ClosureRuntimeReport = Readonly<{
  layer: "PI-8.3";
  runtimeId: typeof CLOSURE_RUNTIME_ID;
  gateId: typeof CLOSURE_RUNTIME_GATE;
  passed: boolean;
  checks: readonly ClosureRuntimeCheck[];
  summary: Readonly<{
    layerAdapters: number;
    packageBindings: number;
    packages: number;
    routingPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ClosureRuntimeCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ClosureRuntimeCheck {
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

export function runClosureRuntimeGate(
  rootDir?: string,
): ClosureRuntimeReport {
  const root = resolveRoot(rootDir);
  const checks: ClosureRuntimeCheck[] = [];

  const routing = runClosureRoutingGate(root);
  checks.push(
    check(
      "CLRT-ROUTING",
      "PI-8.2",
      "PI-8.2 closure routing intact for runtime",
      routing.passed &&
        routing.layerId === CLOSURE_ROUTING_LAYER_ID &&
        CLOSURE_ROUTING_REF === CLOSURE_ROUTING_LAYER_ID &&
        CLOSURE_FOUNDATION_REF === CLOSURE_FOUNDATION_ID,
      `packages=${routing.summary.packages} layerRoutes=${routing.summary.layerRoutes}`,
    ),
  );

  checks.push(
    check(
      "CLRT-IDS",
      "PI-8.3",
      "Closure runtime IDs locked; closed binding sets",
      CLOSURE_RUNTIME_ID === "product-closure-runtime-v1" &&
        CLOSURE_RUNTIME_GATE === "product-closure-runtime-gate" &&
        CLOSURE_LAYER_RUNTIME_BINDINGS.length === CLOSURE_LAYER_IDS.length &&
        CLOSURE_PACKAGE_RUNTIME_BINDINGS.length ===
          CLOSURE_PACKAGE_IDS.length,
      `runtime=${CLOSURE_RUNTIME_ID} layers=${CLOSURE_LAYER_RUNTIME_BINDINGS.length} packages=${CLOSURE_PACKAGE_RUNTIME_BINDINGS.length}`,
    ),
  );

  const matchRouting = CLOSURE_PACKAGE_IDS.every((packageId) => {
    try {
      const plan = resolveClosureRuntimePlan(packageId, "M13");
      return (
        plan.matchesRouting &&
        plan.reusesExistingLayers &&
        plan.reusesExistingDomains &&
        plan.runtimeId === CLOSURE_RUNTIME_ID &&
        plan.packageId === packageId
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "CLRT-MATCH",
      "PI-8.3",
      "Runtime bindings match closure routing",
      matchRouting &&
        CLOSURE_LAYER_RUNTIME_BINDINGS.every((a) =>
          closureLayerAdapterMatchesFoundation(a),
        ) &&
        CLOSURE_PACKAGE_RUNTIME_BINDINGS.every((b) =>
          closurePackageRuntimeMatchesFoundation(b),
        ),
      `packages=${CLOSURE_PACKAGE_IDS.length}`,
    ),
  );

  const layersExist = CLOSURE_LAYER_RUNTIME_BINDINGS.every((adapter) =>
    fs.existsSync(path.join(root, adapter.modulePath)),
  );
  checks.push(
    check(
      "CLRT-LAYERS",
      "PI-8.3",
      "Existing layers reused",
      layersExist &&
        CLOSURE_LAYER_RUNTIME_BINDINGS.every((a) =>
          (CLOSURE_LAYER_IDS as readonly string[]).includes(a.layerId),
        ),
      layersExist
        ? `adapters=${CLOSURE_LAYER_RUNTIME_BINDINGS.length}`
        : "missing layer paths",
    ),
  );

  const pi7 = resolveClosureRuntimePlan("PI-7", "M12");
  checks.push(
    check(
      "CLRT-DOMAINS",
      "PI-8.3",
      "Existing domains reused",
      pi7.reusesExistingDomains &&
        pi7.route.domains.join(",") === "M11,M12,M13,M14,M15" &&
        CLOSURE_DOMAIN_IDS.length === 5,
      `domains=${CLOSURE_DOMAIN_IDS.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "CLRT-NO-NEW-DOMAIN",
      "PI-8.3",
      "No new Domain",
      forbidden.length === 0 && CLOSURE_DOMAIN_IDS.length === 5,
      forbidden.length
        ? forbidden.join(",")
        : `domains=${CLOSURE_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "CLRT-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      CLOSURE_ROUTING_REF === "product-closure-routing-v1" &&
        pi7.route.chain.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6→PI-7" &&
        !fs.existsSync(path.join(root, "lib/closure/engines")) &&
        !fs.existsSync(path.join(root, "lib/closure/new-architecture")),
      "routing + chain locked; no parallel architecture tree",
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
      "CLRT-NO-COUPLE",
      "PI-8.3",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi8Files.length}`,
    ),
  );

  const pi2 = resolveClosureRuntimePlan("PI-2", "M11");
  const pi6 = resolveClosureRuntimePlan("PI-6", "M14");
  checks.push(
    check(
      "CLRT-SPOT",
      "PD-7",
      "Golden runtime plans bind package modes and primary adapters",
      pi2.mode === "present" &&
        pi2.primaryAdapter.layerId === "FRONTEND" &&
        pi6.mode === "ready" &&
        pi6.primaryAdapter.layerId === "DELIVERY" &&
        pi7.mode === "close" &&
        pi7.primaryAdapter.layerId === "IMPLEMENTATION" &&
        pi7.adapters.length === 7,
      `pi2=${pi2.mode}/${pi2.primaryAdapter.adapterId} pi6=${pi6.mode}/${pi6.primaryAdapter.adapterId} pi7=${pi7.mode}/adapters=${pi7.adapters.length}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-8.3",
    runtimeId: CLOSURE_RUNTIME_ID,
    gateId: CLOSURE_RUNTIME_GATE,
    passed,
    checks,
    summary: {
      layerAdapters: CLOSURE_LAYER_RUNTIME_BINDINGS.length,
      packageBindings: CLOSURE_PACKAGE_RUNTIME_BINDINGS.length,
      packages: CLOSURE_PACKAGE_IDS.length,
      routingPassed: routing.passed,
    },
  };
}

export function assertClosureRuntimeGate(
  report: ClosureRuntimeReport = runClosureRuntimeGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Closure runtime gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
