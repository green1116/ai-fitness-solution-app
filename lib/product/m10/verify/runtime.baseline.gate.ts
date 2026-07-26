/**
 * Product M10 — AI Runtime Governance Freeze Release Gate
 * MODULE: Runtime Governance Freeze (M10-P8)
 * BASE: enterprise-product-ai-runtime-audit-v1
 * Isolated — does not mutate runtime modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
  isProductAiRuntimeFreezeLockIntact,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE,
  PRODUCT_AI_RUNTIME_BASELINE_ID,
  PRODUCT_AI_RUNTIME_FREEZE_LOCK,
} from "../baseline/freeze/freeze.lock";
import {
  isProductAiRuntimeImmutableManifestIntact,
  PRODUCT_AI_RUNTIME_IMMUTABLE_MANIFEST,
} from "../baseline/freeze/immutable.manifest";
import {
  isProductAiRuntimeRollbackSnapshotIntact,
  PRODUCT_AI_RUNTIME_ROLLBACK_SNAPSHOT,
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

export const PRODUCT_AI_RUNTIME_BASELINE_SIGNOFF_VERSION =
  "product-ai-runtime-baseline-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

export function checkProductAiRuntimeBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_AI_RUNTIME_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "AIRBL-ID",
      "ai-runtime-freeze",
      "Product AI runtime baseline ID locked",
      PRODUCT_AI_RUNTIME_BASELINE_ID ===
        "enterprise-product-ai-runtime-baseline-v1" &&
        ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID ===
          PRODUCT_AI_RUNTIME_BASELINE_ID &&
        PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE ===
          "enterprise-product-ai-runtime-audit-v1",
      `id=${PRODUCT_AI_RUNTIME_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "AIRBL-CHAIN",
      "ai-runtime-freeze",
      "Foundation→Audit chain intact",
      isProductAiRuntimeFreezeLockIntact(lock) &&
        lock.phases.foundation.id ===
          "enterprise-product-ai-runtime-foundation-v1" &&
        lock.phases.runtimeAudit.id ===
          "enterprise-product-ai-runtime-audit-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "AIRBL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIRBL-ARTIFACTS",
      "ai-runtime-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.components.length === 8 &&
        isProductAiRuntimeImmutableManifestIntact(
          PRODUCT_AI_RUNTIME_IMMUTABLE_MANIFEST,
        ) &&
        isProductAiRuntimeRollbackSnapshotIntact(
          PRODUCT_AI_RUNTIME_ROLLBACK_SNAPSHOT,
        ),
      `checksum=${PRODUCT_AI_RUNTIME_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "AIRBL-SCOPE",
      "scope",
      "No allocation / provider / model / queue / scheduler / monitoring / new runtime capability",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.aiBaseline === "enterprise-product-ai-baseline-v1",
      "ai-runtime-baseline-declaration-only freeze",
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
      `product-ai-runtime-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiRuntimeBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiRuntimeBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI runtime baseline release gate failed: ${gate.summary}`,
    );
  }
}
