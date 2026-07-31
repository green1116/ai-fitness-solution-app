/**
 * PI-6.3 — Delivery readiness exposure verification gate.
 */
import fs from "node:fs";
import path from "node:path";

import { DELIVERY_LAYER_IDS } from "../foundation/layer-refs";
import { DELIVERY_READINESS_CONCERN_IDS } from "../foundation/readiness-concerns";
import { DELIVERY_RUNTIME_ID } from "../runtime/runtime.constants";
import { CONCERN_EXPOSURE } from "../exposure/concern-exposure";
import { resolveDeliveryExposurePlan } from "../exposure/delivery-exposure-plan";
import {
  DELIVERY_EXPOSURE_GATE,
  DELIVERY_EXPOSURE_LAYER_ID,
  DELIVERY_FOUNDATION_REF,
  DELIVERY_READINESS_REF,
  DELIVERY_RUNTIME_REF,
} from "../exposure/exposure.constants";
import {
  DELIVERY_EXPOSURE_SIGNAL_IDS,
  SIGNAL_EXPOSURE_BINDINGS,
} from "../exposure/signal-exposure-bindings";
import { DELIVERY_FOUNDATION_ID } from "../foundation/delivery.constants";
import { runDeliveryRuntimeGate } from "./delivery.runtime.gate";

export type DeliveryExposureCheck = Readonly<{
  id: string;
  source: "PI-6.1" | "PI-6.2" | "PI-6.3" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type DeliveryExposureReport = Readonly<{
  layer: "PI-6.3";
  layerId: typeof DELIVERY_EXPOSURE_LAYER_ID;
  gateId: typeof DELIVERY_EXPOSURE_GATE;
  passed: boolean;
  checks: readonly DeliveryExposureCheck[];
  summary: Readonly<{
    exposures: number;
    signals: number;
    concerns: number;
    runtimePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: DeliveryExposureCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): DeliveryExposureCheck {
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

export function runDeliveryExposureGate(
  rootDir?: string,
): DeliveryExposureReport {
  const root = resolveRoot(rootDir);
  const checks: DeliveryExposureCheck[] = [];

  const runtime = runDeliveryRuntimeGate(root);
  checks.push(
    check(
      "DELE-RUNTIME",
      "PI-6.2",
      "PI-6.2 delivery runtime intact for exposure",
      runtime.passed &&
        runtime.runtimeId === DELIVERY_RUNTIME_ID &&
        DELIVERY_RUNTIME_REF === DELIVERY_RUNTIME_ID &&
        DELIVERY_FOUNDATION_REF === DELIVERY_FOUNDATION_ID &&
        DELIVERY_READINESS_REF ===
          "product-delivery-readiness-baseline-v1",
      `layers=${runtime.summary.layerAdapters} concerns=${runtime.summary.concernBindings}`,
    ),
  );

  checks.push(
    check(
      "DELE-IDS",
      "PI-6.3",
      "Delivery exposure layer IDs locked; closed signal set",
      DELIVERY_EXPOSURE_LAYER_ID === "product-delivery-exposure-v1" &&
        DELIVERY_EXPOSURE_GATE === "product-delivery-exposure-gate" &&
        DELIVERY_EXPOSURE_SIGNAL_IDS.length === 8 &&
        SIGNAL_EXPOSURE_BINDINGS.length === 8 &&
        CONCERN_EXPOSURE.length === DELIVERY_READINESS_CONCERN_IDS.length,
      `layer=${DELIVERY_EXPOSURE_LAYER_ID} signals=${DELIVERY_EXPOSURE_SIGNAL_IDS.length}`,
    ),
  );

  const matchRuntime = DELIVERY_READINESS_CONCERN_IDS.every((concernId) => {
    try {
      const plan = resolveDeliveryExposurePlan(concernId, "M13");
      return (
        plan.matchesRuntime &&
        plan.reusesExistingLayers &&
        plan.runtimeId === DELIVERY_RUNTIME_ID &&
        plan.concernId === concernId &&
        plan.adapters.length === plan.runtime.adapters.length
      );
    } catch {
      return false;
    }
  });
  checks.push(
    check(
      "DELE-MATCH",
      "PI-6.3",
      "Exposure matches runtime bindings",
      matchRuntime,
      `concerns=${DELIVERY_READINESS_CONCERN_IDS.length}`,
    ),
  );

  const layersReuse = SIGNAL_EXPOSURE_BINDINGS.every((s) =>
    s.layerIds.every((id) =>
      (DELIVERY_LAYER_IDS as readonly string[]).includes(id),
    ),
  );
  const concernLayersReuse = CONCERN_EXPOSURE.every((c) =>
    (DELIVERY_LAYER_IDS as readonly string[]).includes(c.primaryLayerId),
  );
  checks.push(
    check(
      "DELE-LAYERS",
      "PI-6.3",
      "Existing layers reused",
      layersReuse && concernLayersReuse,
      `signals=${SIGNAL_EXPOSURE_BINDINGS.length} exposures=${CONCERN_EXPOSURE.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  const pilot = resolveDeliveryExposurePlan("PILOT", "M12");
  checks.push(
    check(
      "DELE-NO-NEW-DOMAIN",
      "PI-6.3",
      "No new Domain",
      forbidden.length === 0 &&
        pilot.runtime.domains.join(",") === "M11,M12,M13,M14,M15",
      forbidden.length ? forbidden.join(",") : "domains=5",
    ),
  );

  checks.push(
    check(
      "DELE-NO-NEW-ARCH",
      "PD-7",
      "No new architecture",
      DELIVERY_READINESS_REF === "product-delivery-readiness-baseline-v1" &&
        DELIVERY_EXPOSURE_SIGNAL_IDS.join(",") ===
          "SIG-RELEASE,SIG-DEPLOY,SIG-OPS,SIG-CUSTOMER,SIG-DOCS,SIG-PILOT,SIG-SIGNOFF,SIG-BASELINE" &&
        !fs.existsSync(path.join(root, "lib/delivery/engines")) &&
        !fs.existsSync(path.join(root, "lib/delivery/new-architecture")),
      "signals locked; readiness-baseline intact",
    ),
  );

  const pi6Dirs = [
    path.join(root, "lib/delivery/foundation"),
    path.join(root, "lib/delivery/runtime"),
    path.join(root, "lib/delivery/exposure"),
    path.join(root, "lib/delivery/verification"),
    path.join(root, "lib/delivery/hardening"),
    path.join(root, "lib/delivery/verify"),
  ];
  const pi6Files = pi6Dirs.flatMap((d) => listTsFiles(d));
  const coupleHits = pi6Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration)|from\s+["'][^"']*lib\/(frontend|backend|data|integration)/.test(
      text,
    );
  });
  checks.push(
    check(
      "DELE-NO-COUPLE",
      "PI-6.3",
      "No cross-layer coupling",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi6Files.length}`,
    ),
  );

  const release = resolveDeliveryExposurePlan("RELEASE", "M11");
  const signoff = resolveDeliveryExposurePlan("SIGN_OFF", "M15");
  checks.push(
    check(
      "DELE-SPOT",
      "PD-7",
      "Golden exposure plans surface signals and modes",
      release.modes.includes("verdict-surface") &&
        release.signals.some((s) => s.signalId === "SIG-RELEASE") &&
        pilot.modes.includes("pilot-result") &&
        pilot.runtime.goldenPaths.length === 5 &&
        signoff.modes.includes("signoff-record") &&
        signoff.signals.some((s) => s.signalId === "SIG-SIGNOFF"),
      `release=${release.modes.join("+")} pilotGps=${pilot.runtime.goldenPaths.length} signoff=${signoff.signals.map((s) => s.signalId).join(",")}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-6.3",
    layerId: DELIVERY_EXPOSURE_LAYER_ID,
    gateId: DELIVERY_EXPOSURE_GATE,
    passed,
    checks,
    summary: {
      exposures: CONCERN_EXPOSURE.length,
      signals: SIGNAL_EXPOSURE_BINDINGS.length,
      concerns: DELIVERY_READINESS_CONCERN_IDS.length,
      runtimePassed: runtime.passed,
    },
  };
}

export function assertDeliveryExposureGate(
  report: DeliveryExposureReport = runDeliveryExposureGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Delivery exposure gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
