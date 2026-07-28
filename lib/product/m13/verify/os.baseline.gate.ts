/**
 * Product M13 — Enterprise Operating System Baseline Freeze Release Gate
 * MODULE: Enterprise Operating System Baseline Freeze (M13-P8)
 * BASE: enterprise-product-os-lifecycle-v1
 * Isolated — does not mutate OS modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_OS_BASELINE_ID,
  isProductOsFreezeLockIntact,
  PRODUCT_OS_BASELINE_FREEZE_BASE,
  PRODUCT_OS_BASELINE_ID,
  PRODUCT_OS_FREEZE_LOCK,
} from "../baseline/freeze/freeze.lock";
import {
  isProductOsImmutableManifestIntact,
  PRODUCT_OS_IMMUTABLE_MANIFEST,
} from "../baseline/freeze/immutable.manifest";
import {
  isProductOsRollbackSnapshotIntact,
  PRODUCT_OS_ROLLBACK_SNAPSHOT,
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

export const PRODUCT_OS_BASELINE_SIGNOFF_VERSION =
  "product-os-baseline-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

export function checkProductOsBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_OS_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "OSBL-ID",
      "os-freeze",
      "Product OS baseline ID locked",
      PRODUCT_OS_BASELINE_ID === "enterprise-product-os-baseline-v1" &&
        ENTERPRISE_PRODUCT_OS_BASELINE_ID === PRODUCT_OS_BASELINE_ID &&
        PRODUCT_OS_BASELINE_FREEZE_BASE ===
          "enterprise-product-os-lifecycle-v1",
      `id=${PRODUCT_OS_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "OSBL-CHAIN",
      "os-freeze",
      "Foundation→Lifecycle chain intact",
      isProductOsFreezeLockIntact(lock) &&
        lock.phases.foundation.id === "enterprise-product-os-foundation-v1" &&
        lock.phases.lifecycle.id === "enterprise-product-os-lifecycle-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "OSBL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OSBL-ARTIFACTS",
      "os-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.components.length === 8 &&
        isProductOsImmutableManifestIntact(PRODUCT_OS_IMMUTABLE_MANIFEST) &&
        isProductOsRollbackSnapshotIntact(PRODUCT_OS_ROLLBACK_SNAPSHOT),
      `checksum=${PRODUCT_OS_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "OSBL-SCOPE",
      "scope",
      "No DB / vector / RAG / embedding / OS execution / new OS capability",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.agentBaseline === "enterprise-product-agent-baseline-v1",
      "os-baseline-declaration-only freeze",
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
      `product-os-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOsBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductOsBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product OS baseline release gate failed: ${gate.summary}`,
    );
  }
}
