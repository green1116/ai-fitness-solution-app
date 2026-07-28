/**
 * Product M11 — Knowledge Lifecycle Release Gate
 * MODULE: Knowledge Lifecycle (M11-P7)
 * BASE: enterprise-product-knowledge-governance-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_GOVERNANCE_ID } from "../governance/governance.constants";
import { bindKnowledgeLifecycleTransition } from "../lifecycle-runtime/binding.registry";
import {
  KNOWLEDGE_LIFECYCLE_BINDING_STATUSES,
  KNOWLEDGE_LIFECYCLE_PLAN_KINDS,
  KNOWLEDGE_LIFECYCLE_PLAN_STATUSES,
  KNOWLEDGE_LIFECYCLE_READINESS_VERDICTS,
  KNOWLEDGE_LIFECYCLE_STATES,
  KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES,
  KNOWLEDGE_LIFECYCLE_TRIGGERS,
  PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
  PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
} from "../lifecycle-runtime/lifecycle.constants";
import {
  assertKnowledgeLifecycleReadinessReady,
  buildKnowledgeLifecycleManifest,
  clearKnowledgeLifecycleLayer,
  evaluateKnowledgeLifecycleReadiness,
} from "../lifecycle-runtime/lifecycle.manifest";
import {
  getKnowledgeLifecycleMetadata,
  isKnowledgeLifecycleMetadataIntact,
} from "../lifecycle-runtime/lifecycle.metadata";
import {
  registerKnowledgeLifecyclePlan,
  updateKnowledgeLifecyclePlanStatus,
} from "../lifecycle-runtime/plan.registry";
import {
  registerKnowledgeLifecycleTransition,
  updateKnowledgeLifecycleTransitionStatus,
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

export const PRODUCT_KNOWLEDGE_LIFECYCLE_SIGNOFF_VERSION =
  "product-knowledge-lifecycle-signoff-1" as const;

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
  clearKnowledgeLifecycleLayer();
}

export function checkProductKnowledgeLifecycleReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getKnowledgeLifecycleMetadata();

  checks.push(
    check(
      "KNWLCS-CONSTANTS",
      "lifecycle-runtime",
      "Product knowledge lifecycle version constants",
      PRODUCT_KNOWLEDGE_LIFECYCLE_ID ===
        "enterprise-product-knowledge-lifecycle-v1" &&
        PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION ===
          "product-knowledge-lifecycle-1" &&
        PRODUCT_KNOWLEDGE_LIFECYCLE_BASE === PRODUCT_KNOWLEDGE_GOVERNANCE_ID &&
        PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION ===
          "product-knowledge-lifecycle-freeze-1" &&
        PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_TAG ===
          "product-knowledge-lifecycle-freeze-1" &&
        KNOWLEDGE_LIFECYCLE_PLAN_KINDS.length === 4 &&
        KNOWLEDGE_LIFECYCLE_PLAN_STATUSES.length === 4 &&
        KNOWLEDGE_LIFECYCLE_STATES.length === 4 &&
        KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES.length === 4 &&
        KNOWLEDGE_LIFECYCLE_TRIGGERS.length === 4 &&
        KNOWLEDGE_LIFECYCLE_BINDING_STATUSES.length === 3 &&
        KNOWLEDGE_LIFECYCLE_READINESS_VERDICTS.length === 3 &&
        isKnowledgeLifecycleMetadataIntact(metadata),
      `id=${PRODUCT_KNOWLEDGE_LIFECYCLE_ID} base=${PRODUCT_KNOWLEDGE_LIFECYCLE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "KNWLCS-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "KNWLCS-UPSTREAM",
      "compatibility",
      "Depends on knowledge governance chain",
      PRODUCT_KNOWLEDGE_LIFECYCLE_BASE ===
        "enterprise-product-knowledge-governance-v1" &&
        PRODUCT_KNOWLEDGE_GOVERNANCE_ID ===
          "enterprise-product-knowledge-governance-v1",
      `governance=${PRODUCT_KNOWLEDGE_GOVERNANCE_ID}`,
    ),
  );

  try {
    cleanup();

    const plan = registerKnowledgeLifecyclePlan({
      id: "knwlcs.gate.plan",
      planKey: "DOMAIN_ENTITY_LIFECYCLE",
      kind: "DOMAIN",
      title: "Domain entity lifecycle plan",
      summary: "Declared lifecycle plan for governance-aware transitions",
    });
    const active = updateKnowledgeLifecyclePlanStatus({
      planId: plan.id,
      status: "ACTIVE",
    });
    const transition = registerKnowledgeLifecycleTransition({
      id: "knwlcs.gate.trn",
      planId: plan.id,
      transitionKey: "ACTIVE_TO_DEPRECATED",
      sequence: 1,
      fromState: "ACTIVE",
      toState: "DEPRECATED",
      trigger: "GOVERNANCE",
      standardKeyRef: "DOMAIN_FREEZE_STANDARD",
      retentionDays: 365,
      summary: "Soft-ref transition gated by governance standard",
    });
    const declared = updateKnowledgeLifecycleTransitionStatus({
      transitionId: transition.id,
      status: "DECLARED",
    });
    const binding = bindKnowledgeLifecycleTransition({
      id: "knwlcs.gate.bind",
      planId: plan.id,
      transitionId: transition.id,
      bindingKey: "TRN_TO_MATRIX_REVIEW",
      reviewKeyRef: "MATRIX_APPROVAL",
      supportPolicyRef: "KNW_LCS_SUP_DOMAIN",
    });
    const manifest = buildKnowledgeLifecycleManifest();
    const readiness = evaluateKnowledgeLifecycleReadiness();

    const ok =
      plan.planKey === "DOMAIN_ENTITY_LIFECYCLE" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.fromState === "ACTIVE" &&
      declared.toState === "DEPRECATED" &&
      declared.standardKeyRef === "DOMAIN_FREEZE_STANDARD" &&
      binding.status === "BOUND" &&
      binding.reviewKeyRef === "MATRIX_APPROVAL" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertKnowledgeLifecycleReadinessReady(readiness);
      checks.push(
        check(
          "KNWLCS-STACK",
          "knowledge-lifecycle",
          "Plan / transition / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "KNWLCS-STACK",
          "knowledge-lifecycle",
          "Plan / transition / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product knowledge lifecycle not ready",
        ),
      );
    }

    checks.push(
      check(
        "KNWLCS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
        ok && metadata.declarationOnly === true,
        "knowledge-lifecycle-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product knowledge lifecycle probe failed";
    checks.push(
      check(
        "KNWLCS-STACK",
        "knowledge-lifecycle",
        "Plan / transition / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "KNWLCS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
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
      `product-knowledge-lifecycle-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductKnowledgeLifecycleReleaseGatePass(
  gate: ReleaseGateResult = checkProductKnowledgeLifecycleReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product knowledge lifecycle release gate failed: ${gate.summary}`,
    );
  }
}
