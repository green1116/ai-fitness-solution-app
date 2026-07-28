/**
 * Product M13 — OS Lifecycle Release Gate
 * MODULE: OS Lifecycle (M13-P7)
 * BASE: enterprise-product-os-governance-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_OS_GOVERNANCE_ID } from "../governance/governance.constants";
import { bindOsLifecycleTransition } from "../lifecycle-runtime/binding.registry";
import {
  OS_LIFECYCLE_BINDING_STATUSES,
  OS_LIFECYCLE_PLAN_KINDS,
  OS_LIFECYCLE_PLAN_STATUSES,
  OS_LIFECYCLE_READINESS_VERDICTS,
  OS_LIFECYCLE_STATES,
  OS_LIFECYCLE_TRANSITION_STATUSES,
  OS_LIFECYCLE_TRIGGERS,
  PRODUCT_OS_LIFECYCLE_BASE,
  PRODUCT_OS_LIFECYCLE_FREEZE_TAG,
  PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_OS_LIFECYCLE_ID,
  PRODUCT_OS_LIFECYCLE_VERSION,
} from "../lifecycle-runtime/lifecycle.constants";
import {
  assertOsLifecycleReadinessReady,
  buildOsLifecycleManifest,
  clearOsLifecycleLayer,
  evaluateOsLifecycleReadiness,
} from "../lifecycle-runtime/lifecycle.manifest";
import {
  getOsLifecycleMetadata,
  isOsLifecycleMetadataIntact,
} from "../lifecycle-runtime/lifecycle.metadata";
import {
  registerOsLifecyclePlan,
  updateOsLifecyclePlanStatus,
} from "../lifecycle-runtime/plan.registry";
import {
  registerOsLifecycleTransition,
  updateOsLifecycleTransitionStatus,
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

export const PRODUCT_OS_LIFECYCLE_SIGNOFF_VERSION =
  "product-os-lifecycle-signoff-1" as const;

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
  clearOsLifecycleLayer();
}

export function checkProductOsLifecycleReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getOsLifecycleMetadata();

  checks.push(
    check(
      "OSLCS-CONSTANTS",
      "lifecycle-runtime",
      "Product OS lifecycle version constants",
      PRODUCT_OS_LIFECYCLE_ID === "enterprise-product-os-lifecycle-v1" &&
        PRODUCT_OS_LIFECYCLE_VERSION === "product-os-lifecycle-1" &&
        PRODUCT_OS_LIFECYCLE_BASE === PRODUCT_OS_GOVERNANCE_ID &&
        PRODUCT_OS_LIFECYCLE_FREEZE_VERSION ===
          "product-os-lifecycle-freeze-1" &&
        PRODUCT_OS_LIFECYCLE_FREEZE_TAG === "product-os-lifecycle-freeze-1" &&
        OS_LIFECYCLE_PLAN_KINDS.length === 4 &&
        OS_LIFECYCLE_PLAN_STATUSES.length === 4 &&
        OS_LIFECYCLE_STATES.length === 4 &&
        OS_LIFECYCLE_TRANSITION_STATUSES.length === 4 &&
        OS_LIFECYCLE_TRIGGERS.length === 4 &&
        OS_LIFECYCLE_BINDING_STATUSES.length === 3 &&
        OS_LIFECYCLE_READINESS_VERDICTS.length === 3 &&
        isOsLifecycleMetadataIntact(metadata),
      `id=${PRODUCT_OS_LIFECYCLE_ID} base=${PRODUCT_OS_LIFECYCLE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OSLCS-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OSLCS-UPSTREAM",
      "compatibility",
      "Depends on OS governance chain",
      PRODUCT_OS_LIFECYCLE_BASE === "enterprise-product-os-governance-v1" &&
        PRODUCT_OS_GOVERNANCE_ID === "enterprise-product-os-governance-v1",
      `governance=${PRODUCT_OS_GOVERNANCE_ID}`,
    ),
  );

  try {
    cleanup();

    const plan = registerOsLifecyclePlan({
      id: "oslcs.gate.plan",
      planKey: "DOMAIN_OS_LIFECYCLE",
      kind: "DOMAIN",
      title: "Domain OS lifecycle plan",
      summary: "Declared lifecycle plan for governance-aware transitions",
    });
    const active = updateOsLifecyclePlanStatus({
      planId: plan.id,
      status: "ACTIVE",
    });
    const transition = registerOsLifecycleTransition({
      id: "oslcs.gate.trn",
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
    const declared = updateOsLifecycleTransitionStatus({
      transitionId: transition.id,
      status: "DECLARED",
    });
    const binding = bindOsLifecycleTransition({
      id: "oslcs.gate.bind",
      planId: plan.id,
      transitionId: transition.id,
      bindingKey: "TRN_TO_MATRIX_REVIEW",
      reviewKeyRef: "MATRIX_APPROVAL",
      supportPolicyRef: "OS_LCS_SUP_DOMAIN",
    });
    const manifest = buildOsLifecycleManifest();
    const readiness = evaluateOsLifecycleReadiness();

    const ok =
      plan.planKey === "DOMAIN_OS_LIFECYCLE" &&
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
      assertOsLifecycleReadinessReady(readiness);
      checks.push(
        check(
          "OSLCS-STACK",
          "os-lifecycle",
          "Plan / transition / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OSLCS-STACK",
          "os-lifecycle",
          "Plan / transition / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product os lifecycle not ready",
        ),
      );
    }

    checks.push(
      check(
        "OSLCS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "os-lifecycle-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product os lifecycle probe failed";
    checks.push(
      check(
        "OSLCS-STACK",
        "os-lifecycle",
        "Plan / transition / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "OSLCS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
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
      `product-os-lifecycle-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOsLifecycleReleaseGatePass(
  gate: ReleaseGateResult = checkProductOsLifecycleReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product OS lifecycle release gate failed: ${gate.summary}`,
    );
  }
}
