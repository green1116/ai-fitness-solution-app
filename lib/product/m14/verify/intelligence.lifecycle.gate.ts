/**
 * Product M14 — Intelligence Lifecycle Release Gate
 * MODULE: Intelligence Lifecycle (M14-P7)
 * BASE: enterprise-product-intelligence-governance-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_GOVERNANCE_ID } from "../governance/governance.constants";
import { bindIntelligenceLifecycleTransition } from "../lifecycle-runtime/binding.registry";
import {
  INTELLIGENCE_LIFECYCLE_BINDING_STATUSES,
  INTELLIGENCE_LIFECYCLE_PLAN_KINDS,
  INTELLIGENCE_LIFECYCLE_PLAN_STATUSES,
  INTELLIGENCE_LIFECYCLE_READINESS_VERDICTS,
  INTELLIGENCE_LIFECYCLE_STATES,
  INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES,
  INTELLIGENCE_LIFECYCLE_TRIGGERS,
  PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
  PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
  PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
} from "../lifecycle-runtime/lifecycle.constants";
import {
  assertIntelligenceLifecycleReadinessReady,
  buildIntelligenceLifecycleManifest,
  clearIntelligenceLifecycleLayer,
  evaluateIntelligenceLifecycleReadiness,
} from "../lifecycle-runtime/lifecycle.manifest";
import {
  getIntelligenceLifecycleMetadata,
  isIntelligenceLifecycleMetadataIntact,
} from "../lifecycle-runtime/lifecycle.metadata";
import {
  registerIntelligenceLifecyclePlan,
  updateIntelligenceLifecyclePlanStatus,
} from "../lifecycle-runtime/plan.registry";
import {
  registerIntelligenceLifecycleTransition,
  updateIntelligenceLifecycleTransitionStatus,
} from "../lifecycle-runtime/transition.registry";

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

export const PRODUCT_INTELLIGENCE_LIFECYCLE_SIGNOFF_VERSION =
  "product-intelligence-lifecycle-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearIntelligenceLifecycleLayer();
}

export function checkProductIntelligenceLifecycleReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getIntelligenceLifecycleMetadata();

  checks.push(
    check(
      "INTLCS-CONSTANTS",
      "lifecycle-runtime",
      "Product Intelligence lifecycle version constants",
      PRODUCT_INTELLIGENCE_LIFECYCLE_ID ===
        "enterprise-product-intelligence-lifecycle-v1" &&
        PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION ===
          "product-intelligence-lifecycle-1" &&
        PRODUCT_INTELLIGENCE_LIFECYCLE_BASE ===
          PRODUCT_INTELLIGENCE_GOVERNANCE_ID &&
        PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION ===
          "product-intelligence-lifecycle-freeze-1" &&
        PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_TAG ===
          "product-intelligence-lifecycle-freeze-1" &&
        INTELLIGENCE_LIFECYCLE_PLAN_KINDS.length === 4 &&
        INTELLIGENCE_LIFECYCLE_PLAN_STATUSES.length === 4 &&
        INTELLIGENCE_LIFECYCLE_STATES.length === 4 &&
        INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES.length === 4 &&
        INTELLIGENCE_LIFECYCLE_TRIGGERS.length === 4 &&
        INTELLIGENCE_LIFECYCLE_BINDING_STATUSES.length === 3 &&
        INTELLIGENCE_LIFECYCLE_READINESS_VERDICTS.length === 3 &&
        isIntelligenceLifecycleMetadataIntact(metadata),
      `id=${PRODUCT_INTELLIGENCE_LIFECYCLE_ID} base=${PRODUCT_INTELLIGENCE_LIFECYCLE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "INTLCS-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "INTLCS-UPSTREAM",
      "governance",
      "Depends on Intelligence governance chain",
      PRODUCT_INTELLIGENCE_LIFECYCLE_BASE ===
        "enterprise-product-intelligence-governance-v1" &&
        PRODUCT_INTELLIGENCE_GOVERNANCE_ID ===
          "enterprise-product-intelligence-governance-v1",
      `governance=${PRODUCT_INTELLIGENCE_GOVERNANCE_ID}`,
    ),
  );

  try {
    cleanup();

    const plan = registerIntelligenceLifecyclePlan({
      id: "intlcs.gate.plan",
      planKey: "EXECUTIVE_INTELLIGENCE_LIFECYCLE",
      kind: "DOMAIN",
      title: "Executive intelligence lifecycle plan",
      summary: "Declared lifecycle plan for governance-aware transitions",
    });
    const active = updateIntelligenceLifecyclePlanStatus({
      planId: plan.id,
      status: "ACTIVE",
    });
    const transition = registerIntelligenceLifecycleTransition({
      id: "intlcs.gate.trn",
      planId: plan.id,
      transitionKey: "ACTIVE_TO_DEPRECATED",
      sequence: 1,
      fromState: "ACTIVE",
      toState: "DEPRECATED",
      trigger: "GOVERNANCE",
      standardKeyRef: "EXECUTIVE_FREEZE_STANDARD",
      retentionDays: 365,
      summary: "Soft-ref transition gated by governance standard",
    });
    const declared = updateIntelligenceLifecycleTransitionStatus({
      transitionId: transition.id,
      status: "DECLARED",
    });
    const binding = bindIntelligenceLifecycleTransition({
      id: "intlcs.gate.bind",
      planId: plan.id,
      transitionId: transition.id,
      bindingKey: "TRN_TO_MATRIX_REVIEW",
      reviewKeyRef: "MATRIX_APPROVAL",
      supportPolicyRef: "INT_LCS_SUP_DOMAIN",
    });
    const manifest = buildIntelligenceLifecycleManifest();
    const readiness = evaluateIntelligenceLifecycleReadiness();

    const ok =
      plan.planKey === "EXECUTIVE_INTELLIGENCE_LIFECYCLE" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.fromState === "ACTIVE" &&
      declared.toState === "DEPRECATED" &&
      declared.standardKeyRef === "EXECUTIVE_FREEZE_STANDARD" &&
      binding.status === "BOUND" &&
      binding.reviewKeyRef === "MATRIX_APPROVAL" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertIntelligenceLifecycleReadinessReady(readiness);
      checks.push(
        check(
          "INTLCS-STACK",
          "intelligence-lifecycle",
          "Plan / transition / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "INTLCS-STACK",
          "intelligence-lifecycle",
          "Plan / transition / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product intelligence lifecycle not ready",
        ),
      );
    }

    checks.push(
      check(
        "INTLCS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "intelligence-lifecycle-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product intelligence lifecycle probe failed";
    checks.push(
      check(
        "INTLCS-STACK",
        "intelligence-lifecycle",
        "Plan / transition / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "INTLCS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-intelligence-lifecycle-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIntelligenceLifecycleReleaseGatePass(
  gate: ReleaseGateResult = checkProductIntelligenceLifecycleReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product Intelligence lifecycle release gate failed: ${gate.summary}`,
    );
  }
}
