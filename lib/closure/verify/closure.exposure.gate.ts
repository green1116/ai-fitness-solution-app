/**
 * PI-8.4 — Product Closure exposure verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { CLOSURE_FOUNDATION_ID } from "../foundation/closure.constants";
import {
  CLOSURE_DOMAIN_IDS,
  CLOSURE_LAYER_IDS,
} from "../foundation/layer-refs";
import { CLOSURE_PACKAGE_IDS } from "../foundation/package-refs";
import {
  CLOSURE_EVIDENCE_EXPOSURE_BINDINGS,
  CLOSURE_EXPOSURE_SIGNAL_IDS,
} from "../exposure/evidence-exposure-bindings";
import {
  CLOSURE_EXPOSURE_GATE,
  CLOSURE_EXPOSURE_LAYER_ID,
  CLOSURE_FOUNDATION_REF,
  CLOSURE_ROUTING_REF,
  CLOSURE_RUNTIME_REF,
} from "../exposure/exposure.constants";
import { resolveClosureExposurePlan } from "../exposure/closure-exposure-plan";
import { CLOSURE_PACKAGE_EXPOSURE } from "../exposure/package-exposure";
import { CLOSURE_RUNTIME_ID } from "../runtime/runtime.constants";
import { runClosureRuntimeGate } from "./closure.runtime.gate";

export type ClosureExposureCheck = Readonly<{
  id: string;
  source: "PI-8.1" | "PI-8.2" | "PI-8.3" | "PI-8.4" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ClosureExposureReport = Readonly<{
  layer: "PI-8.4";
  layerId: typeof CLOSURE_EXPOSURE_LAYER_ID;
  gateId: typeof CLOSURE_EXPOSURE_GATE;
  passed: boolean;
  checks: readonly ClosureExposureCheck[];
  summary: Readonly<{
    exposures: number;
    signals: number;
    packages: number;
    runtimePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ClosureExposureCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ClosureExposureCheck {
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

export function runClosureExposureGate(
  rootDir?: string,
): ClosureExposureReport {
  const root = resolveRoot(rootDir);
  const checks: ClosureExposureCheck[] = [];

  const runtime = runClosureRuntimeGate(root);
  checks.push(
    check(
      "CLSE-RUNTIME",
      "PI-8.3",
      "PI-8.3 closure runtime intact for exposure",
      runtime.passed &&
        runtime.runtimeId === CLOSURE_RUNTIME_ID &&
        CLOSURE_RUNTIME_REF === CLOSURE_RUNTIME_ID &&
        CLOSURE_FOUNDATION_REF === CLOSURE_FOUNDATION_ID &&
        CLOSURE_ROUTING_REF === "product-closure-routing-v1",
      `layers=${runtime.summary.layerAdapters} packages=${runtime.summary.packageBindings}`,
    ),
  );

  checks.push(
    check(
      "CLSE-IDS",
      "PI-8.4",
      "Closure exposure layer IDs locked; closed signal set",
      CLOSURE_EXPOSURE_LAYER_ID === "product-closure-exposure-v1" &&
        CLOSURE_EXPOSURE_GATE === "product-closure-exposure-gate" &&
        CLOSURE_EXPOSURE_SIGNAL_IDS.length === 8 &&
        CLOSURE_EVIDENCE_EXPOSURE_BINDINGS.length === 8 &&
        CLOSURE_PACKAGE_EXPOSURE.length === CLOSURE_PACKAGE_IDS.length,
      `layer=${CLOSURE_EXPOSURE_LAYER_ID} signals=${CLOSURE_EXPOSURE_SIGNAL_IDS.length}`,
    ),
  );

  const matchRuntime = CLOSURE_PACKAGE_IDS.every((packageId) => {
    try {
      const plan = resolveClosureExposurePlan(packageId, "M13");
      return (
        plan.matchesRuntime &&
        plan.reusesExistingLayers &&
        plan.reusesExistingDomains &&
        plan.runtimeId === CLOSURE_RUNTIME_ID &&
        plan.packageId === packageId &&
        plan.adapters.length === plan.runtime.adapters.length
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "CLSE-MATCH",
      "PI-8.4",
      "Exposure bindings match runtime",
      matchRuntime,
      `packages=${CLOSURE_PACKAGE_IDS.length}`,
    ),
  );

  const layersReuse = CLOSURE_EVIDENCE_EXPOSURE_BINDINGS.every((s) =>
    s.layerIds.every((id) =>
      (CLOSURE_LAYER_IDS as readonly string[]).includes(id),
    ),
  );
  const packageLayersReuse = CLOSURE_PACKAGE_EXPOSURE.every((p) =>
    (CLOSURE_LAYER_IDS as readonly string[]).includes(p.primaryLayerId),
  );
  checks.push(
    check(
      "CLSE-LAYERS",
      "PI-8.4",
      "Existing layers reused",
      layersReuse && packageLayersReuse,
      `signals=${CLOSURE_EVIDENCE_EXPOSURE_BINDINGS.length} exposures=${CLOSURE_PACKAGE_EXPOSURE.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  const pi7 = resolveClosureExposurePlan("PI-7", "M12");
  checks.push(
    check(
      "CLSE-DOMAINS",
      "PI-8.4",
      "Existing domains reused",
      pi7.reusesExistingDomains &&
        pi7.runtime.route.domains.join(",") === "M11,M12,M13,M14,M15" &&
        CLOSURE_DOMAIN_IDS.length === 5,
      `domains=${CLOSURE_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "CLSE-NO-NEW-DOMAIN",
      "PI-8.4",
      "No new Domain",
      forbidden.length === 0 && CLOSURE_DOMAIN_IDS.length === 5,
      forbidden.length ? forbidden.join(",") : "domains=5",
    ),
  );

  checks.push(
    check(
      "CLSE-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      CLOSURE_EXPOSURE_SIGNAL_IDS.join(",") ===
        "SIG-PI-2,SIG-PI-3,SIG-PI-4,SIG-PI-5,SIG-PI-6,SIG-PI-7,SIG-CHAIN,SIG-BASELINE" &&
        pi7.runtime.route.chain.join("→") ===
          "PI-2→PI-3→PI-4→PI-5→PI-6→PI-7" &&
        !fs.existsSync(path.join(root, "lib/closure/engines")) &&
        !fs.existsSync(path.join(root, "lib/closure/new-architecture")),
      "signals locked; chain intact",
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
      "CLSE-NO-COUPLE",
      "PI-8.4",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi8Files.length}`,
    ),
  );

  const pi2 = resolveClosureExposurePlan("PI-2", "M11");
  const pi5 = resolveClosureExposurePlan("PI-5", "M14");
  const pi6 = resolveClosureExposurePlan("PI-6", "M14");
  checks.push(
    check(
      "CLSE-SPOT",
      "PD-7",
      "Golden exposure plans surface freeze evidence and chain",
      pi2.modes.includes("freeze-cite") &&
        pi2.signals.some((s) => s.signalId === "SIG-PI-2") &&
        pi5.modes.includes("chain-summary") &&
        pi5.signals.some((s) => s.signalId === "SIG-CHAIN") &&
        pi6.modes.includes("evidence-surface") &&
        pi6.signals.some((s) => s.signalId === "SIG-PI-6") &&
        pi7.modes.includes("freeze-cite") &&
        pi7.signals.some((s) => s.signalId === "SIG-PI-7") &&
        pi7.exposure.primaryLayerId === "IMPLEMENTATION" &&
        pi7.primaryDomain === "M12",
      `pi2=${pi2.signals.map((s) => s.signalId).join(",")} pi5=${pi5.modes.join("+")} pi7=${pi7.signals.map((s) => s.signalId).join(",")}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-8.4",
    layerId: CLOSURE_EXPOSURE_LAYER_ID,
    gateId: CLOSURE_EXPOSURE_GATE,
    passed,
    checks,
    summary: {
      exposures: CLOSURE_PACKAGE_EXPOSURE.length,
      signals: CLOSURE_EVIDENCE_EXPOSURE_BINDINGS.length,
      packages: CLOSURE_PACKAGE_IDS.length,
      runtimePassed: runtime.passed,
    },
  };
}

export function assertClosureExposureGate(
  report: ClosureExposureReport = runClosureExposureGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Closure exposure gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
