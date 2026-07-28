/**
 * Product M11 — Knowledge Lifecycle Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_KNOWLEDGE_GOVERNANCE_ID } from "../governance/governance.constants";
import {
  clearKnowledgeLifecycleBindings,
  listKnowledgeLifecycleBindings,
} from "./binding.registry";
import {
  PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
  PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
} from "./lifecycle.constants";
import { getKnowledgeLifecycleMetadata } from "./lifecycle.metadata";
import type {
  KnowledgeLifecycleManifest,
  KnowledgeLifecycleReadinessCheck,
  KnowledgeLifecycleReadinessResult,
} from "./lifecycle.types";
import {
  clearKnowledgeLifecyclePlans,
  listKnowledgeLifecyclePlans,
} from "./plan.registry";
import {
  clearKnowledgeLifecycleTransitions,
  listKnowledgeLifecycleTransitions,
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
): KnowledgeLifecycleReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearKnowledgeLifecycleLayer(): void {
  clearKnowledgeLifecycleBindings();
  clearKnowledgeLifecycleTransitions();
  clearKnowledgeLifecyclePlans();
}

export function buildKnowledgeLifecycleManifest(): KnowledgeLifecycleManifest {
  const plans = listKnowledgeLifecyclePlans();
  const transitions = listKnowledgeLifecycleTransitions();
  const bindings = listKnowledgeLifecycleBindings();
  const metadata = getKnowledgeLifecycleMetadata();

  const payload = {
    lifecycleRuntimeId: PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
    version: PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
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
    lifecycleRuntimeId: PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
    version: PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
    planCount: plans.length,
    transitionCount: transitions.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateKnowledgeLifecycleReadiness(): KnowledgeLifecycleReadinessResult {
  const checks: KnowledgeLifecycleReadinessCheck[] = [];
  const metadata = getKnowledgeLifecycleMetadata();
  const plans = listKnowledgeLifecyclePlans();
  const transitions = listKnowledgeLifecycleTransitions();
  const bindings = listKnowledgeLifecycleBindings();
  const manifest = buildKnowledgeLifecycleManifest();

  checks.push(
    check(
      "KNWLCS-BASE",
      "lifecycle",
      "knowledge governance base aligned",
      PRODUCT_KNOWLEDGE_LIFECYCLE_BASE === PRODUCT_KNOWLEDGE_GOVERNANCE_ID &&
        PRODUCT_KNOWLEDGE_GOVERNANCE_ID ===
          "enterprise-product-knowledge-governance-v1",
      `base=${PRODUCT_KNOWLEDGE_LIFECYCLE_BASE}`,
    ),
  );

  checks.push(
    check(
      "KNWLCS-META",
      "metadata",
      "Knowledge lifecycle metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "KNWLCS-PLAN",
      "plan",
      "Active lifecycle plans present",
      plans.some((p) => p.status === "ACTIVE"),
      `plans=${plans.length}`,
    ),
  );

  checks.push(
    check(
      "KNWLCS-TRN",
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
      "KNWLCS-BIND",
      "binding",
      "Bound lifecycle transitions present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "KNWLCS-MAN",
      "manifest",
      "Knowledge lifecycle manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.lifecycleRuntimeId === PRODUCT_KNOWLEDGE_LIFECYCLE_ID &&
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
    summary: `product-knowledge-lifecycle readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertKnowledgeLifecycleReadinessReady(
  result: KnowledgeLifecycleReadinessResult,
): asserts result is KnowledgeLifecycleReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product knowledge lifecycle not ready: ${result.summary}`,
    );
  }
}
