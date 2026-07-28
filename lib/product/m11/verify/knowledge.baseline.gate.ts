/**
 * Product M11 — Knowledge Platform Baseline Freeze Release Gate
 * MODULE: Knowledge Platform Baseline Freeze (M11-P8)
 * BASE: enterprise-product-knowledge-lifecycle-v1
 * Isolated — does not mutate knowledge modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
  isProductKnowledgeFreezeLockIntact,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE,
  PRODUCT_KNOWLEDGE_BASELINE_ID,
  PRODUCT_KNOWLEDGE_FREEZE_LOCK,
} from "../baseline/freeze/freeze.lock";
import {
  isProductKnowledgeImmutableManifestIntact,
  PRODUCT_KNOWLEDGE_IMMUTABLE_MANIFEST,
} from "../baseline/freeze/immutable.manifest";
import {
  isProductKnowledgeRollbackSnapshotIntact,
  PRODUCT_KNOWLEDGE_ROLLBACK_SNAPSHOT,
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

export const PRODUCT_KNOWLEDGE_BASELINE_SIGNOFF_VERSION =
  "product-knowledge-baseline-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

export function checkProductKnowledgeBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_KNOWLEDGE_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "KNWBL-ID",
      "knowledge-freeze",
      "Product knowledge baseline ID locked",
      PRODUCT_KNOWLEDGE_BASELINE_ID ===
        "enterprise-product-knowledge-baseline-v1" &&
        ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID ===
          PRODUCT_KNOWLEDGE_BASELINE_ID &&
        PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE ===
          "enterprise-product-knowledge-lifecycle-v1",
      `id=${PRODUCT_KNOWLEDGE_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "KNWBL-CHAIN",
      "knowledge-freeze",
      "Foundation→Lifecycle chain intact",
      isProductKnowledgeFreezeLockIntact(lock) &&
        lock.phases.foundation.id ===
          "enterprise-product-knowledge-foundation-v1" &&
        lock.phases.lifecycle.id ===
          "enterprise-product-knowledge-lifecycle-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "KNWBL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "KNWBL-ARTIFACTS",
      "knowledge-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.components.length === 8 &&
        isProductKnowledgeImmutableManifestIntact(
          PRODUCT_KNOWLEDGE_IMMUTABLE_MANIFEST,
        ) &&
        isProductKnowledgeRollbackSnapshotIntact(
          PRODUCT_KNOWLEDGE_ROLLBACK_SNAPSHOT,
        ),
      `checksum=${PRODUCT_KNOWLEDGE_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "KNWBL-SCOPE",
      "scope",
      "No DB / vector / RAG / embedding / external provider / new knowledge capability",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.runtimeBaseline ===
          "enterprise-product-ai-runtime-baseline-v1",
      "knowledge-baseline-declaration-only freeze",
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
      `product-knowledge-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductKnowledgeBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductKnowledgeBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product knowledge baseline release gate failed: ${gate.summary}`,
    );
  }
}
