/**
 * PI-7.5 — Product Implementation Verification / Hardening gate.
 * Consolidates PI-7.1…PI-7.4 and asserts cross-layer hardening invariants.
 */
import fs from "node:fs";
import path from "node:path";

import {
  IMPLEMENTATION_BASELINE_ID,
  IMPLEMENTATION_FOUNDATION_ID,
} from "../foundation/implementation.constants";
import {
  IMPLEMENTATION_DOMAIN_IDS,
  IMPLEMENTATION_LAYER_IDS,
} from "../foundation/layer-refs";
import { IMPLEMENTATION_PACKAGE_IDS } from "../foundation/package-refs";
import {
  EVIDENCE_EXPOSURE_BINDINGS,
  IMPLEMENTATION_EXPOSURE_SIGNAL_IDS,
} from "../exposure/evidence-exposure-bindings";
import { IMPLEMENTATION_EXPOSURE_LAYER_ID } from "../exposure/exposure.constants";
import { resolveImplementationExposurePlan } from "../exposure/implementation-exposure-plan";
import { PACKAGE_EXPOSURE } from "../exposure/package-exposure";
import {
  DELIVERY_READINESS_REF,
  IMPLEMENTATION_BASELINE_REF,
  IMPLEMENTATION_EXPOSURE_REF,
  IMPLEMENTATION_FOUNDATION_REF,
  IMPLEMENTATION_FREEZE_REF,
  IMPLEMENTATION_HARDENING_BASELINE,
  IMPLEMENTATION_HARDENING_EVIDENCE_SCRIPTS,
  IMPLEMENTATION_HARDENING_GATE,
  IMPLEMENTATION_HARDENING_ID,
  IMPLEMENTATION_HARDENING_INVARIANT_IDS,
  IMPLEMENTATION_HARDENING_MODULES,
  IMPLEMENTATION_HARDENING_PACKAGES,
  IMPLEMENTATION_ROUTING_REF,
  IMPLEMENTATION_RUNTIME_REF,
  PI6_FREEZE_REF,
} from "../hardening/implementation.hardening";
import {
  IMPLEMENTATION_PACKAGE_CHAIN,
  PACKAGE_DEPENDENCY_ROUTES,
} from "../routing/dependency-routing";
import { resolveImplementationRoutePlan } from "../routing/implementation-route-plan";
import { PACKAGE_LAYER_ROUTES } from "../routing/package-layer-routing";
import { IMPLEMENTATION_ROUTING_LAYER_ID } from "../routing/routing.constants";
import { resolveImplementationRuntimePlan } from "../runtime/implementation-runtime-plan";
import { LAYER_RUNTIME_BINDINGS } from "../runtime/layer-runtime-bindings";
import { PACKAGE_RUNTIME_BINDINGS } from "../runtime/package-runtime-bindings";
import { IMPLEMENTATION_RUNTIME_ID } from "../runtime/runtime.constants";
import { runImplementationExposureGate } from "./implementation.exposure.gate";
import { runImplementationFoundationGate } from "./implementation.foundation.gate";
import { runImplementationRoutingGate } from "./implementation.routing.gate";
import { runImplementationRuntimeGate } from "./implementation.runtime.gate";

export type ImplementationHardeningCheck = Readonly<{
  id: string;
  source: "PI-7.1" | "PI-7.2" | "PI-7.3" | "PI-7.4" | "PI-7.5" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ImplementationHardeningReport = Readonly<{
  layer: "PI-7.5";
  hardeningId: typeof IMPLEMENTATION_HARDENING_ID;
  gateId: typeof IMPLEMENTATION_HARDENING_GATE;
  baselineId: typeof IMPLEMENTATION_BASELINE_REF;
  freezeId: typeof IMPLEMENTATION_FREEZE_REF;
  passed: boolean;
  hardened: boolean;
  checks: readonly ImplementationHardeningCheck[];
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
  source: ImplementationHardeningCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ImplementationHardeningCheck {
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

export function runImplementationHardeningGate(
  rootDir?: string,
): ImplementationHardeningReport {
  const root = resolveRoot(rootDir);
  const checks: ImplementationHardeningCheck[] = [];

  const foundation = runImplementationFoundationGate(root);
  const routing = runImplementationRoutingGate(root);
  const runtime = runImplementationRuntimeGate(root);
  const exposure = runImplementationExposureGate(root);

  checks.push(
    check(
      "IHARDEN-PI-7.1",
      "PI-7.1",
      "Foundation intact",
      foundation.passed &&
        foundation.foundationId === IMPLEMENTATION_FOUNDATION_ID &&
        IMPLEMENTATION_FOUNDATION_REF === IMPLEMENTATION_FOUNDATION_ID &&
        foundation.summary.packages ===
          IMPLEMENTATION_HARDENING_BASELINE.packages &&
        foundation.summary.layers === IMPLEMENTATION_HARDENING_BASELINE.layers,
      `packages=${foundation.summary.packages} layers=${foundation.summary.layers}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-PI-7.2",
      "PI-7.2",
      "Routing intact",
      routing.passed &&
        routing.layerId === IMPLEMENTATION_ROUTING_LAYER_ID &&
        IMPLEMENTATION_ROUTING_REF === IMPLEMENTATION_ROUTING_LAYER_ID &&
        routing.summary.layerRoutes ===
          IMPLEMENTATION_HARDENING_BASELINE.layerRoutes &&
        routing.summary.dependencyRoutes ===
          IMPLEMENTATION_HARDENING_BASELINE.dependencyRoutes,
      `layerRoutes=${routing.summary.layerRoutes} deps=${routing.summary.dependencyRoutes}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-PI-7.3",
      "PI-7.3",
      "Runtime intact",
      runtime.passed &&
        runtime.runtimeId === IMPLEMENTATION_RUNTIME_ID &&
        IMPLEMENTATION_RUNTIME_REF === IMPLEMENTATION_RUNTIME_ID &&
        runtime.summary.layerAdapters ===
          IMPLEMENTATION_HARDENING_BASELINE.layerAdapters &&
        runtime.summary.packageBindings ===
          IMPLEMENTATION_HARDENING_BASELINE.packageBindings,
      `adapters=${runtime.summary.layerAdapters} packages=${runtime.summary.packageBindings}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-PI-7.4",
      "PI-7.4",
      "Exposure intact",
      exposure.passed &&
        exposure.layerId === IMPLEMENTATION_EXPOSURE_LAYER_ID &&
        IMPLEMENTATION_EXPOSURE_REF === IMPLEMENTATION_EXPOSURE_LAYER_ID &&
        exposure.summary.exposures ===
          IMPLEMENTATION_HARDENING_BASELINE.exposures &&
        exposure.summary.signals === IMPLEMENTATION_HARDENING_BASELINE.signals,
      `exposures=${exposure.summary.exposures} signals=${exposure.summary.signals}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-IDS",
      "PD-7",
      "Hardening / baseline / freeze IDs locked",
      IMPLEMENTATION_HARDENING_ID ===
        "product-implementation-hardening-v1" &&
        IMPLEMENTATION_HARDENING_GATE ===
          "product-implementation-hardening-gate" &&
        IMPLEMENTATION_BASELINE_REF === "product-implementation-baseline-v1" &&
        IMPLEMENTATION_BASELINE_ID === IMPLEMENTATION_BASELINE_REF &&
        IMPLEMENTATION_FREEZE_REF === "product-implementation-freeze-1" &&
        DELIVERY_READINESS_REF ===
          "product-delivery-readiness-baseline-v1" &&
        PI6_FREEZE_REF === "pi-6-delivery-readiness-v1" &&
        IMPLEMENTATION_HARDENING_PACKAGES.length === 4,
      `${IMPLEMENTATION_HARDENING_ID} / ${IMPLEMENTATION_BASELINE_REF} / ${IMPLEMENTATION_FREEZE_REF}`,
    ),
  );

  const missingScripts = IMPLEMENTATION_HARDENING_EVIDENCE_SCRIPTS.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  const missingModules = IMPLEMENTATION_HARDENING_MODULES.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "IHARDEN-EVIDENCE",
      "PI-7.5",
      "Hardening evidence scripts and implementation modules present",
      missingScripts.length === 0 && missingModules.length === 0,
      missingScripts.length || missingModules.length
        ? `missingScripts=${missingScripts.join(",")} missingModules=${missingModules.join(",")}`
        : `scripts=${IMPLEMENTATION_HARDENING_EVIDENCE_SCRIPTS.length} modules=${IMPLEMENTATION_HARDENING_MODULES.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "IHARDEN-NO-NEW",
      "PI-7.5",
      "No new Domain / architecture",
      forbidden.length === 0 &&
        IMPLEMENTATION_DOMAIN_IDS.length ===
          IMPLEMENTATION_HARDENING_BASELINE.domains &&
        IMPLEMENTATION_PACKAGE_IDS.length ===
          IMPLEMENTATION_HARDENING_BASELINE.packages &&
        IMPLEMENTATION_LAYER_IDS.length ===
          IMPLEMENTATION_HARDENING_BASELINE.layers &&
        IMPLEMENTATION_EXPOSURE_SIGNAL_IDS.length ===
          IMPLEMENTATION_HARDENING_BASELINE.signals &&
        !fs.existsSync(path.join(root, "lib/implementation/engines")) &&
        !fs.existsSync(path.join(root, "lib/implementation/new-architecture")),
      forbidden.length
        ? forbidden.join(",")
        : `domains=${IMPLEMENTATION_DOMAIN_IDS.length} packages=${IMPLEMENTATION_PACKAGE_IDS.length} signals=${IMPLEMENTATION_EXPOSURE_SIGNAL_IDS.length}`,
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
      "IHARDEN-NO-COUPLE",
      "PI-7.5",
      "No cross-layer coupling across implementation tree",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi7Files.length}`,
    ),
  );

  const crossLayerOk =
    PACKAGE_LAYER_ROUTES.length ===
      IMPLEMENTATION_HARDENING_BASELINE.layerRoutes &&
    PACKAGE_DEPENDENCY_ROUTES.length ===
      IMPLEMENTATION_HARDENING_BASELINE.dependencyRoutes &&
    LAYER_RUNTIME_BINDINGS.length ===
      IMPLEMENTATION_HARDENING_BASELINE.layerAdapters &&
    PACKAGE_RUNTIME_BINDINGS.length ===
      IMPLEMENTATION_HARDENING_BASELINE.packageBindings &&
    PACKAGE_EXPOSURE.length === IMPLEMENTATION_HARDENING_BASELINE.exposures &&
    EVIDENCE_EXPOSURE_BINDINGS.length ===
      IMPLEMENTATION_HARDENING_BASELINE.signals &&
    IMPLEMENTATION_PACKAGE_CHAIN.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6" &&
    IMPLEMENTATION_PACKAGE_IDS.every((packageId) => {
      try {
        const route = resolveImplementationRoutePlan(packageId, "M13");
        const rt = resolveImplementationRuntimePlan(packageId, "M13");
        const exp = resolveImplementationExposurePlan(packageId, "M13");
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
      "IHARDEN-CROSS",
      "PI-7.5",
      "Cross-layer Foundation / Routing / Runtime / Exposure inventory locked",
      crossLayerOk,
      `packages=${IMPLEMENTATION_PACKAGE_IDS.length} layers=${IMPLEMENTATION_LAYER_IDS.length} signals=${IMPLEMENTATION_EXPOSURE_SIGNAL_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "IHARDEN-INVARIANTS",
      "PI-7.5",
      "Hardening invariant catalogue complete",
      IMPLEMENTATION_HARDENING_INVARIANT_IDS.length === 8 &&
        IMPLEMENTATION_HARDENING_INVARIANT_IDS.includes("INV-FOUNDATION") &&
        IMPLEMENTATION_HARDENING_INVARIANT_IDS.includes("INV-EXPOSURE") &&
        IMPLEMENTATION_HARDENING_INVARIANT_IDS.includes("INV-NO-COUPLE"),
      IMPLEMENTATION_HARDENING_INVARIANT_IDS.join(","),
    ),
  );

  const childGatesPass =
    foundation.passed &&
    routing.passed &&
    runtime.passed &&
    exposure.passed;
  checks.push(
    check(
      "IHARDEN-GATES",
      "PI-7.5",
      "Hardening gates pass (PI-7.1…PI-7.4 nested)",
      childGatesPass,
      `foundation=${foundation.passed} routing=${routing.passed} runtime=${runtime.passed} exposure=${exposure.passed}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-7.5",
    hardeningId: IMPLEMENTATION_HARDENING_ID,
    gateId: IMPLEMENTATION_HARDENING_GATE,
    baselineId: IMPLEMENTATION_BASELINE_REF,
    freezeId: IMPLEMENTATION_FREEZE_REF,
    passed,
    hardened: passed,
    checks,
    summary: {
      packages: IMPLEMENTATION_HARDENING_PACKAGES.length,
      invariants: IMPLEMENTATION_HARDENING_INVARIANT_IDS.length,
      domains: IMPLEMENTATION_DOMAIN_IDS.length,
      layers: IMPLEMENTATION_LAYER_IDS.length,
      signals: IMPLEMENTATION_EXPOSURE_SIGNAL_IDS.length,
      foundationPassed: foundation.passed,
      routingPassed: routing.passed,
      runtimePassed: runtime.passed,
      exposurePassed: exposure.passed,
    },
  };
}

export function assertImplementationHardeningGate(
  report: ImplementationHardeningReport = runImplementationHardeningGate(),
): ImplementationHardeningReport {
  if (!report.passed || !report.hardened) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-7.5 Implementation hardening gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
