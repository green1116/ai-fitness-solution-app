/**
 * PI-8.5 — Product Closure Verification / Hardening gate.
 * Consolidates PI-8.1…PI-8.4 and asserts cross-layer hardening invariants.
 */
import fs from "node:fs";
import path from "node:path";

import {
  CLOSURE_BASELINE_ID,
  CLOSURE_FOUNDATION_ID,
} from "../foundation/closure.constants";
import {
  CLOSURE_DOMAIN_IDS,
  CLOSURE_LAYER_IDS,
} from "../foundation/layer-refs";
import { CLOSURE_PACKAGE_IDS } from "../foundation/package-refs";
import {
  CLOSURE_EVIDENCE_EXPOSURE_BINDINGS,
  CLOSURE_EXPOSURE_SIGNAL_IDS,
} from "../exposure/evidence-exposure-bindings";
import { CLOSURE_EXPOSURE_LAYER_ID } from "../exposure/exposure.constants";
import { resolveClosureExposurePlan } from "../exposure/closure-exposure-plan";
import { CLOSURE_PACKAGE_EXPOSURE } from "../exposure/package-exposure";
import {
  CLOSURE_BASELINE_REF,
  CLOSURE_EXPOSURE_REF,
  CLOSURE_FOUNDATION_REF,
  CLOSURE_FREEZE_REF,
  CLOSURE_HARDENING_BASELINE,
  CLOSURE_HARDENING_EVIDENCE_SCRIPTS,
  CLOSURE_HARDENING_GATE,
  CLOSURE_HARDENING_ID,
  CLOSURE_HARDENING_INVARIANT_IDS,
  CLOSURE_HARDENING_MODULES,
  CLOSURE_HARDENING_PACKAGES,
  CLOSURE_ROUTING_REF,
  CLOSURE_RUNTIME_REF,
  IMPLEMENTATION_BASELINE_REF,
  PI7_FREEZE_REF,
} from "../hardening/closure.hardening";
import {
  CLOSURE_PACKAGE_CHAIN,
  CLOSURE_PACKAGE_DEPENDENCY_ROUTES,
} from "../routing/dependency-routing";
import { resolveClosureRoutePlan } from "../routing/closure-route-plan";
import { CLOSURE_PACKAGE_LAYER_ROUTES } from "../routing/package-layer-routing";
import { CLOSURE_ROUTING_LAYER_ID } from "../routing/routing.constants";
import { resolveClosureRuntimePlan } from "../runtime/closure-runtime-plan";
import { CLOSURE_LAYER_RUNTIME_BINDINGS } from "../runtime/layer-runtime-bindings";
import { CLOSURE_PACKAGE_RUNTIME_BINDINGS } from "../runtime/package-runtime-bindings";
import { CLOSURE_RUNTIME_ID } from "../runtime/runtime.constants";
import { runClosureExposureGate } from "./closure.exposure.gate";
import { runClosureFoundationGate } from "./closure.foundation.gate";
import { runClosureRoutingGate } from "./closure.routing.gate";
import { runClosureRuntimeGate } from "./closure.runtime.gate";

export type ClosureHardeningCheck = Readonly<{
  id: string;
  source: "PI-8.1" | "PI-8.2" | "PI-8.3" | "PI-8.4" | "PI-8.5" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ClosureHardeningReport = Readonly<{
  layer: "PI-8.5";
  hardeningId: typeof CLOSURE_HARDENING_ID;
  gateId: typeof CLOSURE_HARDENING_GATE;
  baselineId: typeof CLOSURE_BASELINE_REF;
  freezeId: typeof CLOSURE_FREEZE_REF;
  passed: boolean;
  hardened: boolean;
  checks: readonly ClosureHardeningCheck[];
  summary: Readonly<{
    packages: number;
    invariants: number;
    domains: number;
    layers: number;
    signals: number;
    foundationPassed: boolean;
    routingPassed: boolean;
    runtimePassed: boolean;
    exposurePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ClosureHardeningCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ClosureHardeningCheck {
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

export function runClosureHardeningGate(
  rootDir?: string,
): ClosureHardeningReport {
  const root = resolveRoot(rootDir);
  const checks: ClosureHardeningCheck[] = [];

  const foundation = runClosureFoundationGate(root);
  const routing = runClosureRoutingGate(root);
  const runtime = runClosureRuntimeGate(root);
  const exposure = runClosureExposureGate(root);

  checks.push(
    check(
      "CHARDEN-PI-8.1",
      "PI-8.1",
      "Foundation intact",
      foundation.passed &&
        foundation.foundationId === CLOSURE_FOUNDATION_ID &&
        CLOSURE_FOUNDATION_REF === CLOSURE_FOUNDATION_ID &&
        foundation.summary.packages === CLOSURE_HARDENING_BASELINE.packages &&
        foundation.summary.layers === CLOSURE_HARDENING_BASELINE.layers,
      `packages=${foundation.summary.packages} layers=${foundation.summary.layers}`,
    ),
  );

  checks.push(
    check(
      "CHARDEN-PI-8.2",
      "PI-8.2",
      "Routing intact",
      routing.passed &&
        routing.layerId === CLOSURE_ROUTING_LAYER_ID &&
        CLOSURE_ROUTING_REF === CLOSURE_ROUTING_LAYER_ID &&
        routing.summary.layerRoutes ===
          CLOSURE_HARDENING_BASELINE.layerRoutes &&
        routing.summary.dependencyRoutes ===
          CLOSURE_HARDENING_BASELINE.dependencyRoutes,
      `layerRoutes=${routing.summary.layerRoutes} deps=${routing.summary.dependencyRoutes}`,
    ),
  );

  checks.push(
    check(
      "CHARDEN-PI-8.3",
      "PI-8.3",
      "Runtime intact",
      runtime.passed &&
        runtime.runtimeId === CLOSURE_RUNTIME_ID &&
        CLOSURE_RUNTIME_REF === CLOSURE_RUNTIME_ID &&
        runtime.summary.layerAdapters ===
          CLOSURE_HARDENING_BASELINE.layerAdapters &&
        runtime.summary.packageBindings ===
          CLOSURE_HARDENING_BASELINE.packageBindings,
      `adapters=${runtime.summary.layerAdapters} packages=${runtime.summary.packageBindings}`,
    ),
  );

  checks.push(
    check(
      "CHARDEN-PI-8.4",
      "PI-8.4",
      "Exposure intact",
      exposure.passed &&
        exposure.layerId === CLOSURE_EXPOSURE_LAYER_ID &&
        CLOSURE_EXPOSURE_REF === CLOSURE_EXPOSURE_LAYER_ID &&
        exposure.summary.exposures === CLOSURE_HARDENING_BASELINE.exposures &&
        exposure.summary.signals === CLOSURE_HARDENING_BASELINE.signals,
      `exposures=${exposure.summary.exposures} signals=${exposure.summary.signals}`,
    ),
  );

  checks.push(
    check(
      "CHARDEN-IDS",
      "PD-7",
      "Hardening / baseline / freeze IDs locked",
      CLOSURE_HARDENING_ID === "product-closure-hardening-v1" &&
        CLOSURE_HARDENING_GATE === "product-closure-hardening-gate" &&
        CLOSURE_BASELINE_REF === "product-closure-baseline-v1" &&
        CLOSURE_BASELINE_ID === CLOSURE_BASELINE_REF &&
        CLOSURE_FREEZE_REF === "product-closure-freeze-1" &&
        IMPLEMENTATION_BASELINE_REF ===
          "product-implementation-baseline-v1" &&
        PI7_FREEZE_REF === "pi-7-product-implementation-v1" &&
        CLOSURE_HARDENING_PACKAGES.length === 4,
      `${CLOSURE_HARDENING_ID} / ${CLOSURE_BASELINE_REF} / ${CLOSURE_FREEZE_REF}`,
    ),
  );

  const missingScripts = CLOSURE_HARDENING_EVIDENCE_SCRIPTS.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  const missingModules = CLOSURE_HARDENING_MODULES.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "CHARDEN-EVIDENCE",
      "PI-8.5",
      "Hardening evidence scripts and closure modules present",
      missingScripts.length === 0 && missingModules.length === 0,
      missingScripts.length || missingModules.length
        ? `missingScripts=${missingScripts.join(",")} missingModules=${missingModules.join(",")}`
        : `scripts=${CLOSURE_HARDENING_EVIDENCE_SCRIPTS.length} modules=${CLOSURE_HARDENING_MODULES.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "CHARDEN-NO-NEW",
      "PI-8.5",
      "No new Domain / architecture",
      forbidden.length === 0 &&
        CLOSURE_DOMAIN_IDS.length === CLOSURE_HARDENING_BASELINE.domains &&
        CLOSURE_PACKAGE_IDS.length === CLOSURE_HARDENING_BASELINE.packages &&
        CLOSURE_LAYER_IDS.length === CLOSURE_HARDENING_BASELINE.layers &&
        CLOSURE_EXPOSURE_SIGNAL_IDS.length ===
          CLOSURE_HARDENING_BASELINE.signals &&
        !fs.existsSync(path.join(root, "lib/closure/engines")) &&
        !fs.existsSync(path.join(root, "lib/closure/new-architecture")),
      forbidden.length
        ? forbidden.join(",")
        : `domains=${CLOSURE_DOMAIN_IDS.length} packages=${CLOSURE_PACKAGE_IDS.length} signals=${CLOSURE_EXPOSURE_SIGNAL_IDS.length}`,
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
      "CHARDEN-NO-COUPLE",
      "PI-8.5",
      "No cross-layer coupling across closure tree",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi8Files.length}`,
    ),
  );

  const crossLayerOk =
    CLOSURE_PACKAGE_LAYER_ROUTES.length ===
      CLOSURE_HARDENING_BASELINE.layerRoutes &&
    CLOSURE_PACKAGE_DEPENDENCY_ROUTES.length ===
      CLOSURE_HARDENING_BASELINE.dependencyRoutes &&
    CLOSURE_LAYER_RUNTIME_BINDINGS.length ===
      CLOSURE_HARDENING_BASELINE.layerAdapters &&
    CLOSURE_PACKAGE_RUNTIME_BINDINGS.length ===
      CLOSURE_HARDENING_BASELINE.packageBindings &&
    CLOSURE_PACKAGE_EXPOSURE.length === CLOSURE_HARDENING_BASELINE.exposures &&
    CLOSURE_EVIDENCE_EXPOSURE_BINDINGS.length ===
      CLOSURE_HARDENING_BASELINE.signals &&
    CLOSURE_PACKAGE_CHAIN.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6→PI-7" &&
    CLOSURE_PACKAGE_IDS.every((packageId) => {
      try {
        const route = resolveClosureRoutePlan(packageId, "M13");
        const rt = resolveClosureRuntimePlan(packageId, "M13");
        const exp = resolveClosureExposurePlan(packageId, "M13");
        return (
          route.matchesFoundation &&
          rt.matchesRouting &&
          exp.matchesRuntime &&
          exp.packageId === packageId
        );
      } catch {
        return false;
      }
    });

  checks.push(
    check(
      "CHARDEN-CROSS",
      "PI-8.5",
      "Cross-layer Foundation / Routing / Runtime / Exposure inventory locked",
      crossLayerOk,
      `packages=${CLOSURE_PACKAGE_IDS.length} layers=${CLOSURE_LAYER_IDS.length} signals=${CLOSURE_EXPOSURE_SIGNAL_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "CHARDEN-INVARIANTS",
      "PI-8.5",
      "Hardening invariant catalogue complete",
      CLOSURE_HARDENING_INVARIANT_IDS.length === 8 &&
        CLOSURE_HARDENING_INVARIANT_IDS.includes("INV-FOUNDATION") &&
        CLOSURE_HARDENING_INVARIANT_IDS.includes("INV-EXPOSURE") &&
        CLOSURE_HARDENING_INVARIANT_IDS.includes("INV-NO-COUPLE"),
      CLOSURE_HARDENING_INVARIANT_IDS.join(","),
    ),
  );

  const childGatesPass =
    foundation.passed &&
    routing.passed &&
    runtime.passed &&
    exposure.passed;
  checks.push(
    check(
      "CHARDEN-GATES",
      "PI-8.5",
      "Hardening gates pass (PI-8.1…PI-8.4 nested)",
      childGatesPass,
      `foundation=${foundation.passed} routing=${routing.passed} runtime=${runtime.passed} exposure=${exposure.passed}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-8.5",
    hardeningId: CLOSURE_HARDENING_ID,
    gateId: CLOSURE_HARDENING_GATE,
    baselineId: CLOSURE_BASELINE_REF,
    freezeId: CLOSURE_FREEZE_REF,
    passed,
    hardened: passed,
    checks,
    summary: {
      packages: CLOSURE_HARDENING_PACKAGES.length,
      invariants: CLOSURE_HARDENING_INVARIANT_IDS.length,
      domains: CLOSURE_DOMAIN_IDS.length,
      layers: CLOSURE_LAYER_IDS.length,
      signals: CLOSURE_EXPOSURE_SIGNAL_IDS.length,
      foundationPassed: foundation.passed,
      routingPassed: routing.passed,
      runtimePassed: runtime.passed,
      exposurePassed: exposure.passed,
    },
  };
}

export function assertClosureHardeningGate(
  report: ClosureHardeningReport = runClosureHardeningGate(),
): ClosureHardeningReport {
  if (!report.passed || !report.hardened) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-8.5 Closure hardening gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
