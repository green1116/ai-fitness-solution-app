/**
 * PI-6.4 — Delivery readiness verification gate.
 * Consolidates PI-6.1…PI-6.3 and asserts cross-layer verification invariants.
 */
import fs from "node:fs";
import path from "node:path";

import {
  DELIVERY_BASELINE_REF as FOUNDATION_BASELINE_REF,
  DELIVERY_FOUNDATION_ID,
  DELIVERY_FREEZE_REF as FOUNDATION_FREEZE_REF,
  DELIVERY_READINESS_ID,
} from "../foundation/delivery.constants";
import {
  DELIVERY_ENVIRONMENT_IDS,
  DELIVERY_GOLDEN_PATH_IDS,
} from "../foundation/environments";
import {
  DELIVERY_DOMAIN_IDS,
  DELIVERY_LAYER_IDS,
} from "../foundation/layer-refs";
import { DELIVERY_READINESS_CONCERN_IDS } from "../foundation/readiness-concerns";
import { CONCERN_EXPOSURE } from "../exposure/concern-exposure";
import { resolveDeliveryExposurePlan } from "../exposure/delivery-exposure-plan";
import { DELIVERY_EXPOSURE_LAYER_ID } from "../exposure/exposure.constants";
import {
  DELIVERY_EXPOSURE_SIGNAL_IDS,
  SIGNAL_EXPOSURE_BINDINGS,
} from "../exposure/signal-exposure-bindings";
import { CONCERN_RUNTIME_BINDINGS } from "../runtime/concern-runtime-bindings";
import { resolveDeliveryRuntimePlan } from "../runtime/delivery-runtime-plan";
import { ENVIRONMENT_RUNTIME_BINDINGS } from "../runtime/environment-runtime-bindings";
import { LAYER_RUNTIME_BINDINGS } from "../runtime/layer-runtime-bindings";
import { DELIVERY_RUNTIME_ID } from "../runtime/runtime.constants";
import {
  DELIVERY_BASELINE_REF,
  DELIVERY_EXPOSURE_REF,
  DELIVERY_FOUNDATION_REF,
  DELIVERY_FREEZE_REF,
  DELIVERY_RUNTIME_REF,
  DELIVERY_VERIFICATION_BASELINE,
  DELIVERY_VERIFICATION_EVIDENCE_SCRIPTS,
  DELIVERY_VERIFICATION_GATE,
  DELIVERY_VERIFICATION_ID,
  DELIVERY_VERIFICATION_INVARIANT_IDS,
  DELIVERY_VERIFICATION_MODULES,
  DELIVERY_VERIFICATION_PACKAGES,
} from "../verification/delivery.verification";
import { runDeliveryExposureGate } from "./delivery.exposure.gate";
import { runDeliveryFoundationGate } from "./delivery.foundation.gate";
import { runDeliveryRuntimeGate } from "./delivery.runtime.gate";

export type DeliveryVerificationCheck = Readonly<{
  id: string;
  source: "PI-6.1" | "PI-6.2" | "PI-6.3" | "PI-6.4" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type DeliveryVerificationReport = Readonly<{
  layer: "PI-6.4";
  verificationId: typeof DELIVERY_VERIFICATION_ID;
  gateId: typeof DELIVERY_VERIFICATION_GATE;
  baselineId: typeof DELIVERY_BASELINE_REF;
  freezeId: typeof DELIVERY_FREEZE_REF;
  passed: boolean;
  verified: boolean;
  checks: readonly DeliveryVerificationCheck[];
  summary: Readonly<{
    packages: number;
    invariants: number;
    domains: number;
    concerns: number;
    layers: number;
    signals: number;
    foundationPassed: boolean;
    runtimePassed: boolean;
    exposurePassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: DeliveryVerificationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): DeliveryVerificationCheck {
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

export function runDeliveryVerificationGate(
  rootDir?: string,
): DeliveryVerificationReport {
  const root = resolveRoot(rootDir);
  const checks: DeliveryVerificationCheck[] = [];

  const foundation = runDeliveryFoundationGate(root);
  const runtime = runDeliveryRuntimeGate(root);
  const exposure = runDeliveryExposureGate(root);

  checks.push(
    check(
      "DVER-PI-6.1",
      "PI-6.1",
      "Foundation intact",
      foundation.passed &&
        foundation.foundationId === DELIVERY_FOUNDATION_ID &&
        DELIVERY_FOUNDATION_REF === DELIVERY_FOUNDATION_ID &&
        foundation.summary.readinessConcerns ===
          DELIVERY_VERIFICATION_BASELINE.readinessConcerns &&
        foundation.summary.layers === DELIVERY_VERIFICATION_BASELINE.layers,
      `concerns=${foundation.summary.readinessConcerns} layers=${foundation.summary.layers}`,
    ),
  );

  checks.push(
    check(
      "DVER-PI-6.2",
      "PI-6.2",
      "Runtime intact",
      runtime.passed &&
        runtime.runtimeId === DELIVERY_RUNTIME_ID &&
        DELIVERY_RUNTIME_REF === DELIVERY_RUNTIME_ID &&
        runtime.summary.layerAdapters ===
          DELIVERY_VERIFICATION_BASELINE.layerAdapters &&
        runtime.summary.concernBindings ===
          DELIVERY_VERIFICATION_BASELINE.concernBindings,
      `adapters=${runtime.summary.layerAdapters} concerns=${runtime.summary.concernBindings}`,
    ),
  );

  checks.push(
    check(
      "DVER-PI-6.3",
      "PI-6.3",
      "Exposure intact",
      exposure.passed &&
        exposure.layerId === DELIVERY_EXPOSURE_LAYER_ID &&
        DELIVERY_EXPOSURE_REF === DELIVERY_EXPOSURE_LAYER_ID &&
        exposure.summary.signals === DELIVERY_VERIFICATION_BASELINE.signals &&
        exposure.summary.exposures ===
          DELIVERY_VERIFICATION_BASELINE.concernExposures,
      `exposures=${exposure.summary.exposures} signals=${exposure.summary.signals}`,
    ),
  );

  checks.push(
    check(
      "DVER-IDS",
      "PD-7",
      "Verification / baseline / freeze IDs locked",
      DELIVERY_VERIFICATION_ID === "product-delivery-verification-v1" &&
        DELIVERY_VERIFICATION_GATE === "product-delivery-verification-gate" &&
        DELIVERY_BASELINE_REF === "product-delivery-readiness-baseline-v1" &&
        FOUNDATION_BASELINE_REF === DELIVERY_BASELINE_REF &&
        DELIVERY_READINESS_ID === DELIVERY_BASELINE_REF &&
        DELIVERY_FREEZE_REF === "product-delivery-freeze-1" &&
        FOUNDATION_FREEZE_REF === DELIVERY_FREEZE_REF &&
        DELIVERY_VERIFICATION_PACKAGES.length === 3,
      `${DELIVERY_VERIFICATION_ID} / ${DELIVERY_BASELINE_REF} / ${DELIVERY_FREEZE_REF}`,
    ),
  );

  const missingScripts = DELIVERY_VERIFICATION_EVIDENCE_SCRIPTS.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  const missingModules = DELIVERY_VERIFICATION_MODULES.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "DVER-EVIDENCE",
      "PI-6.4",
      "Verification evidence scripts and delivery modules present",
      missingScripts.length === 0 && missingModules.length === 0,
      missingScripts.length || missingModules.length
        ? `missingScripts=${missingScripts.join(",")} missingModules=${missingModules.join(",")}`
        : `scripts=${DELIVERY_VERIFICATION_EVIDENCE_SCRIPTS.length} modules=${DELIVERY_VERIFICATION_MODULES.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "DVER-NO-NEW",
      "PI-6.4",
      "No new Domain / architecture",
      forbidden.length === 0 &&
        DELIVERY_DOMAIN_IDS.length ===
          DELIVERY_VERIFICATION_BASELINE.domains &&
        DELIVERY_READINESS_CONCERN_IDS.length ===
          DELIVERY_VERIFICATION_BASELINE.readinessConcerns &&
        DELIVERY_LAYER_IDS.length === DELIVERY_VERIFICATION_BASELINE.layers &&
        DELIVERY_EXPOSURE_SIGNAL_IDS.length ===
          DELIVERY_VERIFICATION_BASELINE.signals &&
        !fs.existsSync(path.join(root, "lib/delivery/engines")) &&
        !fs.existsSync(path.join(root, "lib/delivery/new-architecture")),
      forbidden.length
        ? forbidden.join(",")
        : `domains=${DELIVERY_DOMAIN_IDS.length} concerns=${DELIVERY_READINESS_CONCERN_IDS.length} signals=${DELIVERY_EXPOSURE_SIGNAL_IDS.length}`,
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
      "DVER-NO-COUPLE",
      "PI-6.4",
      "No cross-layer coupling across delivery tree",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi6Files.length}`,
    ),
  );

  const crossLayerOk =
    DELIVERY_ENVIRONMENT_IDS.length ===
      DELIVERY_VERIFICATION_BASELINE.environments &&
    DELIVERY_GOLDEN_PATH_IDS.length ===
      DELIVERY_VERIFICATION_BASELINE.goldenPaths &&
    LAYER_RUNTIME_BINDINGS.length ===
      DELIVERY_VERIFICATION_BASELINE.layerAdapters &&
    CONCERN_RUNTIME_BINDINGS.length ===
      DELIVERY_VERIFICATION_BASELINE.concernBindings &&
    ENVIRONMENT_RUNTIME_BINDINGS.length ===
      DELIVERY_VERIFICATION_BASELINE.environmentBindings &&
    CONCERN_EXPOSURE.length ===
      DELIVERY_VERIFICATION_BASELINE.concernExposures &&
    SIGNAL_EXPOSURE_BINDINGS.length ===
      DELIVERY_VERIFICATION_BASELINE.signals &&
    DELIVERY_READINESS_CONCERN_IDS.every((concernId) => {
      try {
        const rt = resolveDeliveryRuntimePlan(concernId, "M13");
        const exp = resolveDeliveryExposurePlan(concernId, "M13");
        return (
          rt.matchesFoundation &&
          exp.matchesRuntime &&
          exp.concernId === concernId
        );
      } catch {
        return false;
      }
    });

  checks.push(
    check(
      "DVER-CROSS",
      "PI-6.4",
      "Cross-layer Foundation / Runtime / Exposure inventory locked",
      crossLayerOk,
      `concerns=${DELIVERY_READINESS_CONCERN_IDS.length} layers=${DELIVERY_LAYER_IDS.length} signals=${DELIVERY_EXPOSURE_SIGNAL_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "DVER-INVARIANTS",
      "PI-6.4",
      "Verification invariant catalogue complete",
      DELIVERY_VERIFICATION_INVARIANT_IDS.length === 8 &&
        DELIVERY_VERIFICATION_INVARIANT_IDS.includes("INV-FOUNDATION") &&
        DELIVERY_VERIFICATION_INVARIANT_IDS.includes("INV-EXPOSURE") &&
        DELIVERY_VERIFICATION_INVARIANT_IDS.includes("INV-GATES"),
      DELIVERY_VERIFICATION_INVARIANT_IDS.join(","),
    ),
  );

  const childGatesPass =
    foundation.passed && runtime.passed && exposure.passed;
  checks.push(
    check(
      "DVER-GATES",
      "PI-6.4",
      "Verification gates pass (PI-6.1…PI-6.3 nested)",
      childGatesPass,
      `foundation=${foundation.passed} runtime=${runtime.passed} exposure=${exposure.passed}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-6.4",
    verificationId: DELIVERY_VERIFICATION_ID,
    gateId: DELIVERY_VERIFICATION_GATE,
    baselineId: DELIVERY_BASELINE_REF,
    freezeId: DELIVERY_FREEZE_REF,
    passed,
    verified: passed,
    checks,
    summary: {
      packages: DELIVERY_VERIFICATION_PACKAGES.length,
      invariants: DELIVERY_VERIFICATION_INVARIANT_IDS.length,
      domains: DELIVERY_DOMAIN_IDS.length,
      concerns: DELIVERY_READINESS_CONCERN_IDS.length,
      layers: DELIVERY_LAYER_IDS.length,
      signals: DELIVERY_EXPOSURE_SIGNAL_IDS.length,
      foundationPassed: foundation.passed,
      runtimePassed: runtime.passed,
      exposurePassed: exposure.passed,
    },
  };
}

export function assertDeliveryVerificationGate(
  report: DeliveryVerificationReport = runDeliveryVerificationGate(),
): DeliveryVerificationReport {
  if (!report.passed || !report.verified) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-6.4 Delivery verification gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
