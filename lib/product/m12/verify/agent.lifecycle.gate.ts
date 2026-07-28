/**
 * Product M12 — Agent Lifecycle Release Gate
 * MODULE: Agent Lifecycle (M12-P7)
 * BASE: enterprise-product-agent-governance-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AGENT_GOVERNANCE_ID } from "../governance/governance.constants";
import { bindAgentLifecycleTransition } from "../lifecycle-runtime/binding.registry";
import {
  AGENT_LIFECYCLE_BINDING_STATUSES,
  AGENT_LIFECYCLE_PLAN_KINDS,
  AGENT_LIFECYCLE_PLAN_STATUSES,
  AGENT_LIFECYCLE_READINESS_VERDICTS,
  AGENT_LIFECYCLE_STATES,
  AGENT_LIFECYCLE_TRANSITION_STATUSES,
  AGENT_LIFECYCLE_TRIGGERS,
  PRODUCT_AGENT_LIFECYCLE_BASE,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_TAG,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_AGENT_LIFECYCLE_ID,
  PRODUCT_AGENT_LIFECYCLE_VERSION,
} from "../lifecycle-runtime/lifecycle.constants";
import {
  assertAgentLifecycleReadinessReady,
  buildAgentLifecycleManifest,
  clearAgentLifecycleLayer,
  evaluateAgentLifecycleReadiness,
} from "../lifecycle-runtime/lifecycle.manifest";
import {
  getAgentLifecycleMetadata,
  isAgentLifecycleMetadataIntact,
} from "../lifecycle-runtime/lifecycle.metadata";
import {
  registerAgentLifecyclePlan,
  updateAgentLifecyclePlanStatus,
} from "../lifecycle-runtime/plan.registry";
import {
  registerAgentLifecycleTransition,
  updateAgentLifecycleTransitionStatus,
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

export const PRODUCT_AGENT_LIFECYCLE_SIGNOFF_VERSION =
  "product-agent-lifecycle-signoff-1" as const;

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
  clearAgentLifecycleLayer();
}

export function checkProductAgentLifecycleReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAgentLifecycleMetadata();

  checks.push(
    check(
      "AGTLCS-CONSTANTS",
      "lifecycle-runtime",
      "Product agent lifecycle version constants",
      PRODUCT_AGENT_LIFECYCLE_ID === "enterprise-product-agent-lifecycle-v1" &&
        PRODUCT_AGENT_LIFECYCLE_VERSION === "product-agent-lifecycle-1" &&
        PRODUCT_AGENT_LIFECYCLE_BASE === PRODUCT_AGENT_GOVERNANCE_ID &&
        PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION ===
          "product-agent-lifecycle-freeze-1" &&
        PRODUCT_AGENT_LIFECYCLE_FREEZE_TAG ===
          "product-agent-lifecycle-freeze-1" &&
        AGENT_LIFECYCLE_PLAN_KINDS.length === 4 &&
        AGENT_LIFECYCLE_PLAN_STATUSES.length === 4 &&
        AGENT_LIFECYCLE_STATES.length === 4 &&
        AGENT_LIFECYCLE_TRANSITION_STATUSES.length === 4 &&
        AGENT_LIFECYCLE_TRIGGERS.length === 4 &&
        AGENT_LIFECYCLE_BINDING_STATUSES.length === 3 &&
        AGENT_LIFECYCLE_READINESS_VERDICTS.length === 3 &&
        isAgentLifecycleMetadataIntact(metadata),
      `id=${PRODUCT_AGENT_LIFECYCLE_ID} base=${PRODUCT_AGENT_LIFECYCLE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AGTLCS-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AGTLCS-UPSTREAM",
      "compatibility",
      "Depends on agent governance chain",
      PRODUCT_AGENT_LIFECYCLE_BASE ===
        "enterprise-product-agent-governance-v1" &&
        PRODUCT_AGENT_GOVERNANCE_ID ===
          "enterprise-product-agent-governance-v1",
      `governance=${PRODUCT_AGENT_GOVERNANCE_ID}`,
    ),
  );

  try {
    cleanup();

    const plan = registerAgentLifecyclePlan({
      id: "agtlcs.gate.plan",
      planKey: "DOMAIN_AGENT_LIFECYCLE",
      kind: "DOMAIN",
      title: "Domain agent lifecycle plan",
      summary: "Declared lifecycle plan for governance-aware transitions",
    });
    const active = updateAgentLifecyclePlanStatus({
      planId: plan.id,
      status: "ACTIVE",
    });
    const transition = registerAgentLifecycleTransition({
      id: "agtlcs.gate.trn",
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
    const declared = updateAgentLifecycleTransitionStatus({
      transitionId: transition.id,
      status: "DECLARED",
    });
    const binding = bindAgentLifecycleTransition({
      id: "agtlcs.gate.bind",
      planId: plan.id,
      transitionId: transition.id,
      bindingKey: "TRN_TO_MATRIX_REVIEW",
      reviewKeyRef: "MATRIX_APPROVAL",
      supportPolicyRef: "AGT_LCS_SUP_DOMAIN",
    });
    const manifest = buildAgentLifecycleManifest();
    const readiness = evaluateAgentLifecycleReadiness();

    const ok =
      plan.planKey === "DOMAIN_AGENT_LIFECYCLE" &&
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
      assertAgentLifecycleReadinessReady(readiness);
      checks.push(
        check(
          "AGTLCS-STACK",
          "agent-lifecycle",
          "Plan / transition / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AGTLCS-STACK",
          "agent-lifecycle",
          "Plan / transition / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product agent lifecycle not ready",
        ),
      );
    }

    checks.push(
      check(
        "AGTLCS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "agent-lifecycle-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product agent lifecycle probe failed";
    checks.push(
      check(
        "AGTLCS-STACK",
        "agent-lifecycle",
        "Plan / transition / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AGTLCS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
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
      `product-agent-lifecycle-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAgentLifecycleReleaseGatePass(
  gate: ReleaseGateResult = checkProductAgentLifecycleReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product agent lifecycle release gate failed: ${gate.summary}`,
    );
  }
}
