/**
 * Product M14 — Enterprise Intelligence Baseline Freeze Release Gate
 * MODULE: Enterprise Intelligence Baseline Freeze (M14-P8)
 * BASE: enterprise-product-intelligence-lifecycle-v1
 * Isolated — does not mutate Intelligence modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
  isProductIntelligenceFreezeLockIntact,
  PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE,
  PRODUCT_INTELLIGENCE_BASELINE_ID,
  PRODUCT_INTELLIGENCE_FREEZE_LOCK,
} from "../baseline/freeze/freeze.lock";
import {
  isProductIntelligenceImmutableManifestIntact,
  PRODUCT_INTELLIGENCE_IMMUTABLE_MANIFEST,
} from "../baseline/freeze/immutable.manifest";
import {
  isProductIntelligenceRollbackSnapshotIntact,
  PRODUCT_INTELLIGENCE_ROLLBACK_SNAPSHOT,
} from "../baseline/freeze/rollback.snapshot";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_INTELLIGENCE_BASELINE_SIGNOFF_VERSION =
  "product-intelligence-baseline-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

export function checkProductIntelligenceBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_INTELLIGENCE_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "INTBL-ID",
      "intelligence-freeze",
      "Product Intelligence baseline ID locked",
      PRODUCT_INTELLIGENCE_BASELINE_ID ===
        "enterprise-product-intelligence-baseline-v1" &&
        ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID ===
          PRODUCT_INTELLIGENCE_BASELINE_ID &&
        PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE ===
          "enterprise-product-intelligence-lifecycle-v1",
      `id=${PRODUCT_INTELLIGENCE_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "INTBL-CHAIN",
      "intelligence-freeze",
      "Foundation→Lifecycle chain intact",
      isProductIntelligenceFreezeLockIntact(lock) &&
        lock.phases.foundation.id ===
          "enterprise-product-intelligence-foundation-v1" &&
        lock.phases.lifecycle.id ===
          "enterprise-product-intelligence-lifecycle-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "INTBL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "INTBL-ARTIFACTS",
      "intelligence-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.components.length === 8 &&
        isProductIntelligenceImmutableManifestIntact(
          PRODUCT_INTELLIGENCE_IMMUTABLE_MANIFEST,
        ) &&
        isProductIntelligenceRollbackSnapshotIntact(
          PRODUCT_INTELLIGENCE_ROLLBACK_SNAPSHOT,
        ),
      `checksum=${PRODUCT_INTELLIGENCE_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "INTBL-SCOPE",
      "scope",
      "No DB / vector / RAG / embedding / intelligence execution / new intelligence capability",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.osBaseline === "enterprise-product-os-baseline-v1",
      "intelligence-baseline-declaration-only freeze",
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-intelligence-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIntelligenceBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductIntelligenceBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product Intelligence baseline release gate failed: ${gate.summary}`,
    );
  }
}
