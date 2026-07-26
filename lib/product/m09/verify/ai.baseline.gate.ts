/**
 * Product M09 — AI Governance Freeze Release Gate
 * MODULE: AI Governance Freeze (M09-P8)
 * BASE: enterprise-product-ai-audit-v1
 * Isolated — does not mutate AI modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_AI_BASELINE_ID,
  isProductAiFreezeLockIntact,
  PRODUCT_AI_BASELINE_FREEZE_BASE,
  PRODUCT_AI_BASELINE_ID,
  PRODUCT_AI_FREEZE_LOCK,
} from "../baseline/freeze/freeze.lock";
import {
  isProductAiImmutableManifestIntact,
  PRODUCT_AI_IMMUTABLE_MANIFEST,
} from "../baseline/freeze/immutable.manifest";
import {
  isProductAiRollbackSnapshotIntact,
  PRODUCT_AI_ROLLBACK_SNAPSHOT,
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

export const PRODUCT_AI_BASELINE_SIGNOFF_VERSION =
  "product-ai-baseline-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

export function checkProductAiBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_AI_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "AIBL-ID",
      "ai-freeze",
      "Product AI baseline ID locked",
      PRODUCT_AI_BASELINE_ID === "enterprise-product-ai-baseline-v1" &&
        ENTERPRISE_PRODUCT_AI_BASELINE_ID === PRODUCT_AI_BASELINE_ID &&
        PRODUCT_AI_BASELINE_FREEZE_BASE === "enterprise-product-ai-audit-v1",
      `id=${PRODUCT_AI_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "AIBL-CHAIN",
      "ai-freeze",
      "Foundation→Audit chain intact",
      isProductAiFreezeLockIntact(lock) &&
        lock.phases.foundation.id ===
          "enterprise-product-ai-foundation-v1" &&
        lock.phases.audit.id === "enterprise-product-ai-audit-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "AIBL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIBL-ARTIFACTS",
      "ai-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.components.length === 8 &&
        isProductAiImmutableManifestIntact(PRODUCT_AI_IMMUTABLE_MANIFEST) &&
        isProductAiRollbackSnapshotIntact(PRODUCT_AI_ROLLBACK_SNAPSHOT),
      `checksum=${PRODUCT_AI_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "AIBL-SCOPE",
      "scope",
      "No provider / model / workflow / orchestration / agent / tool runtime / new AI capability",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.marketplaceBaseline ===
          "enterprise-product-marketplace-baseline-v1",
      "ai-baseline-declaration-only freeze",
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
      `product-ai-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI baseline release gate failed: ${gate.summary}`,
    );
  }
}
