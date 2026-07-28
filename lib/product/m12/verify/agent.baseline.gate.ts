/**
 * Product M12 — AI Agent Platform Baseline Freeze Release Gate
 * MODULE: AI Agent Platform Baseline Freeze (M12-P8)
 * BASE: enterprise-product-agent-lifecycle-v1
 * Isolated — does not mutate agent modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
  isProductAgentFreezeLockIntact,
  PRODUCT_AGENT_BASELINE_FREEZE_BASE,
  PRODUCT_AGENT_BASELINE_ID,
  PRODUCT_AGENT_FREEZE_LOCK,
} from "../baseline/freeze/freeze.lock";
import {
  isProductAgentImmutableManifestIntact,
  PRODUCT_AGENT_IMMUTABLE_MANIFEST,
} from "../baseline/freeze/immutable.manifest";
import {
  isProductAgentRollbackSnapshotIntact,
  PRODUCT_AGENT_ROLLBACK_SNAPSHOT,
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

export const PRODUCT_AGENT_BASELINE_SIGNOFF_VERSION =
  "product-agent-baseline-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

export function checkProductAgentBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_AGENT_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "AGTBL-ID",
      "agent-freeze",
      "Product agent baseline ID locked",
      PRODUCT_AGENT_BASELINE_ID === "enterprise-product-agent-baseline-v1" &&
        ENTERPRISE_PRODUCT_AGENT_BASELINE_ID === PRODUCT_AGENT_BASELINE_ID &&
        PRODUCT_AGENT_BASELINE_FREEZE_BASE ===
          "enterprise-product-agent-lifecycle-v1",
      `id=${PRODUCT_AGENT_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "AGTBL-CHAIN",
      "agent-freeze",
      "Foundation→Lifecycle chain intact",
      isProductAgentFreezeLockIntact(lock) &&
        lock.phases.foundation.id ===
          "enterprise-product-agent-foundation-v1" &&
        lock.phases.lifecycle.id === "enterprise-product-agent-lifecycle-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "AGTBL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AGTBL-ARTIFACTS",
      "agent-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.components.length === 8 &&
        isProductAgentImmutableManifestIntact(
          PRODUCT_AGENT_IMMUTABLE_MANIFEST,
        ) &&
        isProductAgentRollbackSnapshotIntact(PRODUCT_AGENT_ROLLBACK_SNAPSHOT),
      `checksum=${PRODUCT_AGENT_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "AGTBL-SCOPE",
      "scope",
      "No DB / vector / RAG / embedding / agent execution / new agent capability",
      lock.readOnly === true &&
        lock.noNewCapability === true &&
        lock.knowledgeBaseline ===
          "enterprise-product-knowledge-baseline-v1",
      "agent-baseline-declaration-only freeze",
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
      `product-agent-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAgentBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductAgentBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product agent baseline release gate failed: ${gate.summary}`,
    );
  }
}
