/**
 * Product M14 — Intelligence Lifecycle Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_INTELLIGENCE_GOVERNANCE_ID } from "../governance/governance.constants";
import {
  clearIntelligenceLifecycleBindings,
  listIntelligenceLifecycleBindings,
} from "./binding.registry";
import {
  PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
  PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
  PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
} from "./lifecycle.constants";
import { getIntelligenceLifecycleMetadata } from "./lifecycle.metadata";
import type {
  IntelligenceLifecycleManifest,
  IntelligenceLifecycleReadinessCheck,
  IntelligenceLifecycleReadinessResult,
} from "./lifecycle.types";
import {
  clearIntelligenceLifecyclePlans,
  listIntelligenceLifecyclePlans,
} from "./plan.registry";
import {
  clearIntelligenceLifecycleTransitions,
  listIntelligenceLifecycleTransitions,
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
): IntelligenceLifecycleReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearIntelligenceLifecycleLayer(): void {
  clearIntelligenceLifecycleBindings();
  clearIntelligenceLifecycleTransitions();
  clearIntelligenceLifecyclePlans();
}

export function buildIntelligenceLifecycleManifest(): IntelligenceLifecycleManifest {
  const plans = listIntelligenceLifecyclePlans();
  const transitions = listIntelligenceLifecycleTransitions();
  const bindings = listIntelligenceLifecycleBindings();
  const metadata = getIntelligenceLifecycleMetadata();

  const payload = {
    lifecycleRuntimeId: PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
    version: PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
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
    lifecycleRuntimeId: PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
    version: PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
    planCount: plans.length,
    transitionCount: transitions.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateIntelligenceLifecycleReadiness(): IntelligenceLifecycleReadinessResult {
  const checks: IntelligenceLifecycleReadinessCheck[] = [];
  const metadata = getIntelligenceLifecycleMetadata();
  const plans = listIntelligenceLifecyclePlans();
  const transitions = listIntelligenceLifecycleTransitions();
  const bindings = listIntelligenceLifecycleBindings();
  const manifest = buildIntelligenceLifecycleManifest();

  checks.push(
    check(
      "INTLCS-BASE",
      "lifecycle",
      "intelligence governance base aligned",
      PRODUCT_INTELLIGENCE_LIFECYCLE_BASE ===
        PRODUCT_INTELLIGENCE_GOVERNANCE_ID &&
        PRODUCT_INTELLIGENCE_GOVERNANCE_ID ===
          "enterprise-product-intelligence-governance-v1",
      `base=${PRODUCT_INTELLIGENCE_LIFECYCLE_BASE}`,
    ),
  );

  checks.push(
    check(
      "INTLCS-META",
      "metadata",
      "Intelligence lifecycle metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "INTLCS-PLAN",
      "plan",
      "Active lifecycle plans present",
      plans.some((p) => p.status === "ACTIVE"),
      `plans=${plans.length}`,
    ),
  );

  checks.push(
    check(
      "INTLCS-TRN",
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
      "INTLCS-BIND",
      "binding",
      "Bound lifecycle transitions present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "INTLCS-MAN",
      "manifest",
      "Intelligence lifecycle manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.lifecycleRuntimeId === PRODUCT_INTELLIGENCE_LIFECYCLE_ID &&
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
    summary: `product-intelligence-lifecycle readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIntelligenceLifecycleReadinessReady(
  result: IntelligenceLifecycleReadinessResult,
): asserts result is IntelligenceLifecycleReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product intelligence lifecycle not ready: ${result.summary}`,
    );
  }
}
