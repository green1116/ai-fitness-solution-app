/**
 * PI-6.5 — Delivery readiness hardening gate.
 * Consolidates PI-6.1…PI-6.4 and asserts cross-layer hardening invariants.
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
import {
  DELIVERY_BASELINE_REF,
  DELIVERY_EXPOSURE_REF,
  DELIVERY_FOUNDATION_REF,
  DELIVERY_FREEZE_REF,
  DELIVERY_HARDENING_BASELINE,
  DELIVERY_HARDENING_EVIDENCE_SCRIPTS,
  DELIVERY_HARDENING_GATE,
  DELIVERY_HARDENING_ID,
  DELIVERY_HARDENING_INVARIANT_IDS,
  DELIVERY_HARDENING_MODULES,
  DELIVERY_HARDENING_PACKAGES,
  DELIVERY_RUNTIME_REF,
  DELIVERY_VERIFICATION_REF,
} from "../hardening/delivery.hardening";
import { CONCERN_RUNTIME_BINDINGS } from "../runtime/concern-runtime-bindings";
import { resolveDeliveryRuntimePlan } from "../runtime/delivery-runtime-plan";
import { ENVIRONMENT_RUNTIME_BINDINGS } from "../runtime/environment-runtime-bindings";
import { LAYER_RUNTIME_BINDINGS } from "../runtime/layer-runtime-bindings";
import { DELIVERY_RUNTIME_ID } from "../runtime/runtime.constants";
import {
  DELIVERY_VERIFICATION_ID,
  DELIVERY_VERIFICATION_INVARIANT_IDS,
  DELIVERY_VERIFICATION_PACKAGES,
} from "../verification/delivery.verification";
import { runDeliveryExposureGate } from "./delivery.exposure.gate";
import { runDeliveryFoundationGate } from "./delivery.foundation.gate";
import { runDeliveryRuntimeGate } from "./delivery.runtime.gate";
import { runDeliveryVerificationGate } from "./delivery.verification.gate";

export type DeliveryHardeningCheck = Readonly<{
  id: string;
  source: "PI-6.1" | "PI-6.2" | "PI-6.3" | "PI-6.4" | "PI-6.5" | "PD-7";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type DeliveryHardeningReport = Readonly<{
  layer: "PI-6.5";
  hardeningId: typeof DELIVERY_HARDENING_ID;
  gateId: typeof DELIVERY_HARDENING_GATE;
  baselineId: typeof DELIVERY_BASELINE_REF;
  freezeId: typeof DELIVERY_FREEZE_REF;
  passed: boolean;
  hardened: boolean;
  checks: readonly DeliveryHardeningCheck[];
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
    verificationPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: DeliveryHardeningCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): DeliveryHardeningCheck {
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

export function runDeliveryHardeningGate(
  rootDir?: string,
): DeliveryHardeningReport {
  const root = resolveRoot(rootDir);
  const checks: DeliveryHardeningCheck[] = [];

  const foundation = runDeliveryFoundationGate(root);
  const runtime = runDeliveryRuntimeGate(root);
  const exposure = runDeliveryExposureGate(root);
  const verification = runDeliveryVerificationGate(root);

  checks.push(
    check(
      "DHARDEN-PI-6.1",
      "PI-6.1",
      "Foundation intact",
      foundation.passed &&
        foundation.foundationId === DELIVERY_FOUNDATION_ID &&
        DELIVERY_FOUNDATION_REF === DELIVERY_FOUNDATION_ID &&
        foundation.summary.readinessConcerns ===
          DELIVERY_HARDENING_BASELINE.readinessConcerns &&
        foundation.summary.layers === DELIVERY_HARDENING_BASELINE.layers,
      `concerns=${foundation.summary.readinessConcerns} layers=${foundation.summary.layers}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-PI-6.2",
      "PI-6.2",
      "Runtime intact",
      runtime.passed &&
        runtime.runtimeId === DELIVERY_RUNTIME_ID &&
        DELIVERY_RUNTIME_REF === DELIVERY_RUNTIME_ID &&
        runtime.summary.layerAdapters ===
          DELIVERY_HARDENING_BASELINE.layerAdapters &&
        runtime.summary.concernBindings ===
          DELIVERY_HARDENING_BASELINE.concernBindings,
      `adapters=${runtime.summary.layerAdapters} concerns=${runtime.summary.concernBindings}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-PI-6.3",
      "PI-6.3",
      "Exposure intact",
      exposure.passed &&
        exposure.layerId === DELIVERY_EXPOSURE_LAYER_ID &&
        DELIVERY_EXPOSURE_REF === DELIVERY_EXPOSURE_LAYER_ID &&
        exposure.summary.signals === DELIVERY_HARDENING_BASELINE.signals &&
        exposure.summary.exposures ===
          DELIVERY_HARDENING_BASELINE.concernExposures,
      `exposures=${exposure.summary.exposures} signals=${exposure.summary.signals}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-PI-6.4",
      "PI-6.4",
      "Verification intact",
      verification.passed &&
        verification.verified &&
        verification.verificationId === DELIVERY_VERIFICATION_ID &&
        DELIVERY_VERIFICATION_REF === DELIVERY_VERIFICATION_ID &&
        verification.summary.packages ===
          DELIVERY_HARDENING_BASELINE.verificationPackages &&
        verification.summary.invariants ===
          DELIVERY_HARDENING_BASELINE.verificationInvariants &&
        DELIVERY_VERIFICATION_PACKAGES.length ===
          DELIVERY_HARDENING_BASELINE.verificationPackages &&
        DELIVERY_VERIFICATION_INVARIANT_IDS.length ===
          DELIVERY_HARDENING_BASELINE.verificationInvariants,
      `packages=${verification.summary.packages} invariants=${verification.summary.invariants}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-IDS",
      "PD-7",
      "Hardening / baseline / freeze IDs locked",
      DELIVERY_HARDENING_ID === "product-delivery-hardening-v1" &&
        DELIVERY_HARDENING_GATE === "product-delivery-hardening-gate" &&
        DELIVERY_BASELINE_REF === "product-delivery-readiness-baseline-v1" &&
        FOUNDATION_BASELINE_REF === DELIVERY_BASELINE_REF &&
        DELIVERY_READINESS_ID === DELIVERY_BASELINE_REF &&
        DELIVERY_FREEZE_REF === "product-delivery-freeze-1" &&
        FOUNDATION_FREEZE_REF === DELIVERY_FREEZE_REF &&
        DELIVERY_HARDENING_PACKAGES.length === 4,
      `${DELIVERY_HARDENING_ID} / ${DELIVERY_BASELINE_REF} / ${DELIVERY_FREEZE_REF}`,
    ),
  );

  const missingScripts = DELIVERY_HARDENING_EVIDENCE_SCRIPTS.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  const missingModules = DELIVERY_HARDENING_MODULES.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  checks.push(
    check(
      "DHARDEN-EVIDENCE",
      "PI-6.5",
      "Hardening evidence scripts and delivery modules present",
      missingScripts.length === 0 && missingModules.length === 0,
      missingScripts.length || missingModules.length
        ? `missingScripts=${missingScripts.join(",")} missingModules=${missingModules.join(",")}`
        : `scripts=${DELIVERY_HARDENING_EVIDENCE_SCRIPTS.length} modules=${DELIVERY_HARDENING_MODULES.length}`,
    ),
  );

  const forbidden = ["lib/product/m16", "lib/product/m17", "lib/domains"].filter(
    (p) => fs.existsSync(path.join(root, p)),
  );
  checks.push(
    check(
      "DHARDEN-NO-NEW",
      "PI-6.5",
      "No new Domain / architecture",
      forbidden.length === 0 &&
        DELIVERY_DOMAIN_IDS.length === DELIVERY_HARDENING_BASELINE.domains &&
        DELIVERY_READINESS_CONCERN_IDS.length ===
          DELIVERY_HARDENING_BASELINE.readinessConcerns &&
        DELIVERY_LAYER_IDS.length === DELIVERY_HARDENING_BASELINE.layers &&
        DELIVERY_EXPOSURE_SIGNAL_IDS.length ===
          DELIVERY_HARDENING_BASELINE.signals &&
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
      "DHARDEN-NO-COUPLE",
      "PI-6.5",
      "No cross-layer coupling across delivery tree",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${pi6Files.length}`,
    ),
  );

  const crossLayerOk =
    DELIVERY_ENVIRONMENT_IDS.length ===
      DELIVERY_HARDENING_BASELINE.environments &&
    DELIVERY_GOLDEN_PATH_IDS.length ===
      DELIVERY_HARDENING_BASELINE.goldenPaths &&
    LAYER_RUNTIME_BINDINGS.length ===
      DELIVERY_HARDENING_BASELINE.layerAdapters &&
    CONCERN_RUNTIME_BINDINGS.length ===
      DELIVERY_HARDENING_BASELINE.concernBindings &&
    ENVIRONMENT_RUNTIME_BINDINGS.length ===
      DELIVERY_HARDENING_BASELINE.environmentBindings &&
    CONCERN_EXPOSURE.length ===
      DELIVERY_HARDENING_BASELINE.concernExposures &&
    SIGNAL_EXPOSURE_BINDINGS.length === DELIVERY_HARDENING_BASELINE.signals &&
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
      "DHARDEN-CROSS",
      "PI-6.5",
      "Cross-layer Foundation / Runtime / Exposure / Verification inventory locked",
      crossLayerOk && verification.passed,
      `concerns=${DELIVERY_READINESS_CONCERN_IDS.length} layers=${DELIVERY_LAYER_IDS.length} signals=${DELIVERY_EXPOSURE_SIGNAL_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "DHARDEN-INVARIANTS",
      "PI-6.5",
      "Hardening invariant catalogue complete",
      DELIVERY_HARDENING_INVARIANT_IDS.length === 8 &&
        DELIVERY_HARDENING_INVARIANT_IDS.includes("INV-FOUNDATION") &&
        DELIVERY_HARDENING_INVARIANT_IDS.includes("INV-VERIFICATION") &&
        DELIVERY_HARDENING_INVARIANT_IDS.includes("INV-NO-COUPLE"),
      DELIVERY_HARDENING_INVARIANT_IDS.join(","),
    ),
  );

  const childGatesPass =
    foundation.passed &&
    runtime.passed &&
    exposure.passed &&
    verification.passed &&
    verification.verified;
  checks.push(
    check(
      "DHARDEN-GATES",
      "PI-6.5",
      "Hardening gates pass (PI-6.1…PI-6.4 nested)",
      childGatesPass,
      `foundation=${foundation.passed} runtime=${runtime.passed} exposure=${exposure.passed} verification=${verification.passed}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PI-6.5",
    hardeningId: DELIVERY_HARDENING_ID,
    gateId: DELIVERY_HARDENING_GATE,
    baselineId: DELIVERY_BASELINE_REF,
    freezeId: DELIVERY_FREEZE_REF,
    passed,
    hardened: passed,
    checks,
    summary: {
      packages: DELIVERY_HARDENING_PACKAGES.length,
      invariants: DELIVERY_HARDENING_INVARIANT_IDS.length,
      domains: DELIVERY_DOMAIN_IDS.length,
      concerns: DELIVERY_READINESS_CONCERN_IDS.length,
      layers: DELIVERY_LAYER_IDS.length,
      signals: DELIVERY_EXPOSURE_SIGNAL_IDS.length,
      foundationPassed: foundation.passed,
      runtimePassed: runtime.passed,
      exposurePassed: exposure.passed,
      verificationPassed: verification.passed,
    },
  };
}

export function assertDeliveryHardeningGate(
  report: DeliveryHardeningReport = runDeliveryHardeningGate(),
): DeliveryHardeningReport {
  if (!report.passed || !report.hardened) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `PI-6.5 Delivery hardening gate failed:\n${failed
        .map((c) => `- ${c.id}: ${c.evidence}`)
        .join("\n")}`,
    );
  }
  return report;
}
