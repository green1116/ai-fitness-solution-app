/**
 * Product M12 — Agent Lifecycle Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AGENT_GOVERNANCE_ID } from "../governance/governance.constants";
import {
  clearAgentLifecycleBindings,
  listAgentLifecycleBindings,
} from "./binding.registry";
import {
  PRODUCT_AGENT_LIFECYCLE_BASE,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_AGENT_LIFECYCLE_ID,
  PRODUCT_AGENT_LIFECYCLE_VERSION,
} from "./lifecycle.constants";
import { getAgentLifecycleMetadata } from "./lifecycle.metadata";
import type {
  AgentLifecycleManifest,
  AgentLifecycleReadinessCheck,
  AgentLifecycleReadinessResult,
} from "./lifecycle.types";
import {
  clearAgentLifecyclePlans,
  listAgentLifecyclePlans,
} from "./plan.registry";
import {
  clearAgentLifecycleTransitions,
  listAgentLifecycleTransitions,
} from "./transition.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AgentLifecycleReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAgentLifecycleLayer(): void {
  clearAgentLifecycleBindings();
  clearAgentLifecycleTransitions();
  clearAgentLifecyclePlans();
}

export function buildAgentLifecycleManifest(): AgentLifecycleManifest {
  const plans = listAgentLifecyclePlans();
  const transitions = listAgentLifecycleTransitions();
  const bindings = listAgentLifecycleBindings();
  const metadata = getAgentLifecycleMetadata();

  const payload = {
    lifecycleRuntimeId: PRODUCT_AGENT_LIFECYCLE_ID,
    version: PRODUCT_AGENT_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_AGENT_LIFECYCLE_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    plans: plans.map((p) => ({
      planKey: p.planKey,
      kind: p.kind,
      status: p.status,
    })),
    transitions: transitions.map((t) => ({
      transitionKey: t.transitionKey,
      sequence: t.sequence,
      status: t.status,
      fromState: t.fromState,
      toState: t.toState,
      trigger: t.trigger,
      standardKeyRef: t.standardKeyRef,
      retentionDays: t.retentionDays,
      planId: t.planId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      reviewKeyRef: b.reviewKeyRef,
      supportPolicyRef: b.supportPolicyRef,
      status: b.status,
      planId: b.planId,
    })),
  };

  return {
    lifecycleRuntimeId: PRODUCT_AGENT_LIFECYCLE_ID,
    version: PRODUCT_AGENT_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_AGENT_LIFECYCLE_BASE,
    planCount: plans.length,
    transitionCount: transitions.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAgentLifecycleReadiness(): AgentLifecycleReadinessResult {
  const checks: AgentLifecycleReadinessCheck[] = [];
  const metadata = getAgentLifecycleMetadata();
  const plans = listAgentLifecyclePlans();
  const transitions = listAgentLifecycleTransitions();
  const bindings = listAgentLifecycleBindings();
  const manifest = buildAgentLifecycleManifest();

  checks.push(
    check(
      "AGTLCS-BASE",
      "lifecycle",
      "agent governance base aligned",
      PRODUCT_AGENT_LIFECYCLE_BASE === PRODUCT_AGENT_GOVERNANCE_ID &&
        PRODUCT_AGENT_GOVERNANCE_ID ===
          "enterprise-product-agent-governance-v1",
      `base=${PRODUCT_AGENT_LIFECYCLE_BASE}`,
    ),
  );

  checks.push(
    check(
      "AGTLCS-META",
      "metadata",
      "Agent lifecycle metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AGTLCS-PLAN",
      "plan",
      "Active lifecycle plans present",
      plans.some((p) => p.status === "ACTIVE"),
      `plans=${plans.length}`,
    ),
  );

  checks.push(
    check(
      "AGTLCS-TRN",
      "transition",
      "Declared lifecycle transitions with soft standard refs",
      transitions.some(
        (t) => t.status === "DECLARED" && t.standardKeyRef.length > 0,
      ),
      `transitions=${transitions.length}`,
    ),
  );

  checks.push(
    check(
      "AGTLCS-BIND",
      "binding",
      "Bound lifecycle transitions present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "AGTLCS-MAN",
      "manifest",
      "Agent lifecycle manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.lifecycleRuntimeId === PRODUCT_AGENT_LIFECYCLE_ID &&
        manifest.planCount >= 1 &&
        manifest.transitionCount >= 1 &&
        manifest.bindingCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-agent-lifecycle readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAgentLifecycleReadinessReady(
  result: AgentLifecycleReadinessResult,
): asserts result is AgentLifecycleReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(`product agent lifecycle not ready: ${result.summary}`);
  }
}
