/**
 * Product M15 — Enterprise Evolution Baseline Freeze Release Gate
 * MODULE: Enterprise Evolution Baseline Freeze (M15-P8)
 * BASE: enterprise-product-evolution-governance-v1
 * Isolated — does not mutate Evolution modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID,
  isProductEvolutionFreezeLockIntact,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE,
  PRODUCT_EVOLUTION_BASELINE_ID,
  PRODUCT_EVOLUTION_FREEZE_LOCK,
} from "../baseline/freeze/freeze.lock";
import {
  isProductEvolutionImmutableManifestIntact,
  PRODUCT_EVOLUTION_IMMUTABLE_MANIFEST,
} from "../baseline/freeze/immutable.manifest";
import {
  isProductEvolutionRollbackSnapshotIntact,
  PRODUCT_EVOLUTION_ROLLBACK_SNAPSHOT,
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

export const PRODUCT_EVOLUTION_BASELINE_SIGNOFF_VERSION =
  "product-evolution-baseline-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

export function checkProductEvolutionBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_EVOLUTION_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "EVOBL-ID",
      "evolution-freeze",
      "Product Evolution baseline ID locked",
      PRODUCT_EVOLUTION_BASELINE_ID ===
        "enterprise-product-evolution-baseline-v1" &&
        ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID ===
          PRODUCT_EVOLUTION_BASELINE_ID &&
        PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE ===
          "enterprise-product-evolution-governance-v1",
      `id=${PRODUCT_EVOLUTION_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "EVOBL-CHAIN",
      "evolution-freeze",
      "Foundation→Governance chain intact",
      isProductEvolutionFreezeLockIntact(lock) &&
        lock.phases.foundation.id ===
          "enterprise-product-evolution-foundation-v1" &&
        lock.phases.governance.id ===
          "enterprise-product-evolution-governance-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "EVOBL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVOBL-ARTIFACTS",
      "evolution-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.components.length === 8 &&
        isProductEvolutionImmutableManifestIntact(
          PRODUCT_EVOLUTION_IMMUTABLE_MANIFEST,
        ) &&
        isProductEvolutionRollbackSnapshotIntact(
          PRODUCT_EVOLUTION_ROLLBACK_SNAPSHOT,
        ),
      `checksum=${PRODUCT_EVOLUTION_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "EVOBL-SCOPE",
      "scope",
      "No DB / deployment / execution / new evolution capability",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.intelligenceBaseline ===
          "enterprise-product-intelligence-baseline-v1",
      "evolution-baseline-declaration-only freeze",
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
      `product-evolution-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductEvolutionBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductEvolutionBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product Evolution baseline release gate failed: ${gate.summary}`,
    );
  }
}
