/**
 * PI-7.4 — Product Implementation exposure verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { IMPLEMENTATION_FOUNDATION_ID } from "../foundation/implementation.constants";
import { IMPLEMENTATION_LAYER_IDS } from "../foundation/layer-refs";
import { IMPLEMENTATION_PACKAGE_IDS } from "../foundation/package-refs";
import {
  EVIDENCE_EXPOSURE_BINDINGS,
  IMPLEMENTATION_EXPOSURE_SIGNAL_IDS,
} from "../exposure/evidence-exposure-bindings";
import {
  IMPLEMENTATION_EXPOSURE_GATE,
  IMPLEMENTATION_EXPOSURE_LAYER_ID,
  IMPLEMENTATION_FOUNDATION_REF,
  IMPLEMENTATION_ROUTING_REF,
  IMPLEMENTATION_RUNTIME_REF,
} from "../exposure/exposure.constants";
import { resolveImplementationExposurePlan } from "../exposure/implementation-exposure-plan";
import { PACKAGE_EXPOSURE } from "../exposure/package-exposure";
import { IMPLEMENTATION_RUNTIME_ID } from "../runtime/runtime.constants";
import { runImplementationRuntimeGate } from "./implementation.runtime.gate";

export type ImplementationExposureCheck = Readonly<{
  id: string;
  source: "PI-7.1" | "PI-7.2" | "PI-7.3" | "PI-7.4" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ImplementationExposureReport = Readonly<{
  layer: "PI-7.4";
  layerId: typeof IMPLEMENTATION_EXPOSURE_LAYER_ID;
  gateId: typeof IMPLEMENTATION_EXPOSURE_GATE;
  passed: boolean;
  checks: readonly ImplementationExposureCheck[];
  summary: Readonly<{
    exposures: number;
    signals: number;
    packages: number;
    runtimePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ImplementationExposureCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ImplementationExposureCheck {
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

export function runImplementationExposureGate(
  rootDir?: string,
): ImplementationExposureReport {
  const root = resolveRoot(rootDir);
  const checks: ImplementationExposureCheck[] = [];

  const runtime = runImplementationRuntimeGate(root);
  checks.push(
    check(
      "IMPE-RUNTIME",
      "PI-7.3",
      "PI-7.3 implementation runtime intact for exposure",
      runtime.passed &&
        runtime.runtimeId === IMPLEMENTATION_RUNTIME_ID &&
        IMPLEMENTATION_RUNTIME_REF === IMPLEMENTATION_RUNTIME_ID &&
        IMPLEMENTATION_FOUNDATION_REF === IMPLEMENTATION_FOUNDATION_ID &&
        IMPLEMENTATION_ROUTING_REF === "product-implementation-routing-v1",
      `layers=${runtime.summary.layerAdapters} packages=${runtime.summary.packageBindings}`,
    ),
  );

  checks.push(
    check(
      "IMPE-IDS",
      "PI-7.4",
      "Implementation exposure layer IDs locked; closed signal set",
      IMPLEMENTATION_EXPOSURE_LAYER_ID ===
        "product-implementation-exposure-v1" &&
        IMPLEMENTATION_EXPOSURE_GATE ===
          "product-implementation-exposure-gate" &&
        IMPLEMENTATION_EXPOSURE_SIGNAL_IDS.length === 7 &&
        EVIDENCE_EXPOSURE_BINDINGS.length === 7 &&
        PACKAGE_EXPOSURE.length === IMPLEMENTATION_PACKAGE_IDS.length,
      `layer=${IMPLEMENTATION_EXPOSURE_LAYER_ID} signals=${IMPLEMENTATION_EXPOSURE_SIGNAL_IDS.length}`,
    ),
  );

  const matchRuntime = IMPLEMENTATION_PACKAGE_IDS.every((packageId) => {
    try {
      const plan = resolveImplementationExposurePlan(packageId, "M13");
      return (
        plan.matchesRuntime &&
        plan.reusesExistingLayers &&
        plan.runtimeId === IMPLEMENTATION_RUNTIME_ID &&
        plan.packageId === packageId &&
        plan.adapters.length === plan.runtime.adapters.length
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "IMPE-MATCH",
      "PI-7.4",
      "Exposure bindings match runtime",
      matchRuntime,
      `packages=${IMPLEMENTATION_PACKAGE_IDS.length}`,
    ),
  );

  const layersReuse = EVIDENCE_EXPOSURE_BINDINGS.every((s) =>
    s.layerIds.every((id) =>
      (IMPLEMENTATION_LAYER_IDS as readonly string[]).includes(id),
    ),
  );
  const packageLayersReuse = PACKAGE_EXPOSURE.every((p) =>
    (IMPLEMENTATION_LAYER_IDS as readonly string[]).includes(p.primaryLayerId),
  );
  checks.push(
    check(
      "IMPE-LAYERS",
      "PI-7.4",
      "Existing layers reused",
      layersReuse && packageLayersReuse,
      `signals=${EVIDENCE_EXPOSURE_BINDINGS.length} exposures=${PACKAGE_EXPOSURE.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  const pi6 = resolveImplementationExposurePlan("PI-6", "M12");
  checks.push(
    check(
      "IMPE-NO-NEW-DOMAIN",
      "PI-7.4",
      "No new Domain",
      forbidden.length === 0 &&
        pi6.runtime.route.domains.join(",") === "M11,M12,M13,M14,M15",
      forbidden.length ? forbidden.join(",") : "domains=5",
    ),
  );

  checks.push(
    check(
      "IMPE-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      IMPLEMENTATION_EXPOSURE_SIGNAL_IDS.join(",") ===
        "SIG-PI-2,SIG-PI-3,SIG-PI-4,SIG-PI-5,SIG-PI-6,SIG-CHAIN,SIG-BASELINE" &&
        pi6.runtime.route.chain.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6" &&
        !fs.existsSync(path.join(root, "lib/implementation/engines")) &&
        !fs.existsSync(path.join(root, "lib/implementation/new-architecture")),
      "signals locked; chain intact",
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
      "IMPE-NO-COUPLE",
      "PI-7.4",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi7Files.length}`,
    ),
  );

  const pi2 = resolveImplementationExposurePlan("PI-2", "M11");
  const pi5 = resolveImplementationExposurePlan("PI-5", "M14");
  checks.push(
    check(
      "IMPE-SPOT",
      "PD-7",
      "Golden exposure plans surface freeze evidence and chain",
      pi2.modes.includes("freeze-cite") &&
        pi2.signals.some((s) => s.signalId === "SIG-PI-2") &&
        pi5.modes.includes("chain-summary") &&
        pi5.signals.some((s) => s.signalId === "SIG-CHAIN") &&
        pi6.modes.includes("evidence-surface") &&
        pi6.signals.some((s) => s.signalId === "SIG-PI-6") &&
        pi6.primaryDomain === "M12",
      `pi2=${pi2.signals.map((s) => s.signalId).join(",")} pi5=${pi5.modes.join("+")} pi6=${pi6.signals.map((s) => s.signalId).join(",")}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-7.4",
    layerId: IMPLEMENTATION_EXPOSURE_LAYER_ID,
    gateId: IMPLEMENTATION_EXPOSURE_GATE,
    passed,
    checks,
    summary: {
      exposures: PACKAGE_EXPOSURE.length,
      signals: EVIDENCE_EXPOSURE_BINDINGS.length,
      packages: IMPLEMENTATION_PACKAGE_IDS.length,
      runtimePassed: runtime.passed,
    },
  };
}

export function assertImplementationExposureGate(
  report: ImplementationExposureReport = runImplementationExposureGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Implementation exposure gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
