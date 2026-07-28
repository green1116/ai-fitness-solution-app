/**
 * Product M13 — OS Lifecycle Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_OS_GOVERNANCE_ID } from "../governance/governance.constants";
import {
  clearOsLifecycleBindings,
  listOsLifecycleBindings,
} from "./binding.registry";
import {
  PRODUCT_OS_LIFECYCLE_BASE,
  PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_OS_LIFECYCLE_ID,
  PRODUCT_OS_LIFECYCLE_VERSION,
} from "./lifecycle.constants";
import { getOsLifecycleMetadata } from "./lifecycle.metadata";
import type {
  OsLifecycleManifest,
  OsLifecycleReadinessCheck,
  OsLifecycleReadinessResult,
} from "./lifecycle.types";
import { clearOsLifecyclePlans, listOsLifecyclePlans } from "./plan.registry";
import {
  clearOsLifecycleTransitions,
  listOsLifecycleTransitions,
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
): OsLifecycleReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearOsLifecycleLayer(): void {
  clearOsLifecycleBindings();
  clearOsLifecycleTransitions();
  clearOsLifecyclePlans();
}

export function buildOsLifecycleManifest(): OsLifecycleManifest {
  const plans = listOsLifecyclePlans();
  const transitions = listOsLifecycleTransitions();
  const bindings = listOsLifecycleBindings();
  const metadata = getOsLifecycleMetadata();

  const payload = {
    lifecycleRuntimeId: PRODUCT_OS_LIFECYCLE_ID,
    version: PRODUCT_OS_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_OS_LIFECYCLE_BASE,
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
    lifecycleRuntimeId: PRODUCT_OS_LIFECYCLE_ID,
    version: PRODUCT_OS_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_OS_LIFECYCLE_BASE,
    planCount: plans.length,
    transitionCount: transitions.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateOsLifecycleReadiness(): OsLifecycleReadinessResult {
  const checks: OsLifecycleReadinessCheck[] = [];
  const metadata = getOsLifecycleMetadata();
  const plans = listOsLifecyclePlans();
  const transitions = listOsLifecycleTransitions();
  const bindings = listOsLifecycleBindings();
  const manifest = buildOsLifecycleManifest();

  checks.push(
    check(
      "OSLCS-BASE",
      "lifecycle",
      "os governance base aligned",
      PRODUCT_OS_LIFECYCLE_BASE === PRODUCT_OS_GOVERNANCE_ID &&
        PRODUCT_OS_GOVERNANCE_ID === "enterprise-product-os-governance-v1",
      `base=${PRODUCT_OS_LIFECYCLE_BASE}`,
    ),
  );

  checks.push(
    check(
      "OSLCS-META",
      "metadata",
      "OS lifecycle metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "OSLCS-PLAN",
      "plan",
      "Active lifecycle plans present",
      plans.some((p) => p.status === "ACTIVE"),
      `plans=${plans.length}`,
    ),
  );

  checks.push(
    check(
      "OSLCS-TRN",
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
      "OSLCS-BIND",
      "binding",
      "Bound lifecycle transitions present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "OSLCS-MAN",
      "manifest",
      "OS lifecycle manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.lifecycleRuntimeId === PRODUCT_OS_LIFECYCLE_ID &&
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
    summary: `product-os-lifecycle readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOsLifecycleReadinessReady(
  result: OsLifecycleReadinessResult,
): asserts result is OsLifecycleReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product os lifecycle not ready: ${result.summary}`);
  }
}
