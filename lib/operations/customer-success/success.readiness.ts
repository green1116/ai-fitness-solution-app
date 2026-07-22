/**
 * Post-Launch P2 — Customer Success Readiness
 * Integrates commercial lifecycle, tenant, SLA, onboarding
 */

import { getCustomerLifecycleStage } from "../../product/e12/commercial/commercial.customer";
import { getOrganization } from "../../product/e12/admin/admin.organization";
import { getProductTenant } from "../../product/e12/tenant/tenant.product";
import { getCustomerActivation } from "../../launch/onboarding/onboarding.activation";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { OPERATIONS_PRODUCTION_FOUNDATION_ID } from "../production/production.constants";
import { getLatestAdoption } from "./success.adoption";
import { OPERATIONS_CUSTOMER_SUCCESS_BASE } from "./success.constants";
import { getCustomerHealthProfile } from "./success.health";
import { listLifecycleOperations } from "./success.lifecycle";
import { computeEngagementMetrics } from "./success.metrics";
import { listSuccessWorkflows } from "./success.workflow";
import type {
  CustomerSuccessReadinessCheck,
  CustomerSuccessReadinessResult,
} from "./success.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): CustomerSuccessReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateCustomerSuccessReadiness(
  customerHealthProfileId: string,
): CustomerSuccessReadinessResult {
  const profile = getCustomerHealthProfile(customerHealthProfileId.trim());
  if (!profile) {
    return {
      customerHealthProfileId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "CS-HEALTH",
          "health",
          "Customer health profile exists",
          false,
          `profile not found: ${customerHealthProfileId}`,
        ),
      ],
      summary: "customer success readiness not ready: profile missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: CustomerSuccessReadinessCheck[] = [];

  checks.push(
    check(
      "CS-BASE",
      "operations",
      "P1 production foundation baseline aligned",
      OPERATIONS_CUSTOMER_SUCCESS_BASE === OPERATIONS_PRODUCTION_FOUNDATION_ID,
      `base=${OPERATIONS_CUSTOMER_SUCCESS_BASE}`,
    ),
  );

  const tenant = getProductTenant(profile.productTenantId);
  checks.push(
    check(
      "CS-TENANT",
      "tenant",
      "Product tenant active",
      !!tenant &&
        tenant.productId === profile.productId &&
        tenant.status === "ACTIVE",
      tenant
        ? `tenant=${tenant.id} status=${tenant.status}`
        : "tenant missing",
    ),
  );

  const org = getOrganization(profile.organizationId);
  checks.push(
    check(
      "CS-ORG",
      "commercial",
      "Organization active",
      !!org &&
        org.productId === profile.productId &&
        org.status === "ACTIVE",
      org ? `org=${org.id} status=${org.status}` : "organization missing",
    ),
  );

  const lifecycleStage = getCustomerLifecycleStage(
    profile.organizationId,
    profile.productId,
  );
  checks.push(
    check(
      "CS-LIFECYCLE",
      "commercial",
      "Customer lifecycle onboarding or active",
      lifecycleStage === "ONBOARDING" || lifecycleStage === "ACTIVE",
      `stage=${lifecycleStage ?? "none"}`,
    ),
  );

  if (profile.supportSlaProfileId) {
    const sla = getSupportSlaProfile(profile.supportSlaProfileId);
    checks.push(
      check(
        "CS-SLA",
        "support",
        "Support SLA profile active",
        !!sla &&
          sla.productId === profile.productId &&
          sla.status === "ACTIVE",
        sla ? `sla=${sla.id} status=${sla.status}` : "sla missing",
      ),
    );
  } else {
    checks.push(
      check(
        "CS-SLA",
        "support",
        "Support SLA profile bound",
        false,
        "supportSlaProfileId missing",
      ),
    );
  }

  const adoption = getLatestAdoption(profile.id);
  checks.push(
    check(
      "CS-ADOPTION",
      "adoption",
      "Adoption tracked",
      !!adoption &&
        (adoption.stage === "ADOPTING" ||
          adoption.stage === "ADOPTED" ||
          adoption.stage === "EXPANDING"),
      adoption ? `stage=${adoption.stage}` : "adoption missing",
    ),
  );

  const workflows = listSuccessWorkflows({
    customerHealthProfileId: profile.id,
  });
  checks.push(
    check(
      "CS-WORKFLOW",
      "workflow",
      "Success workflow complete",
      workflows.some((w) => w.complete && !w.failed),
      `workflows=${workflows.length}`,
    ),
  );

  const lifecycleOps = listLifecycleOperations({
    customerHealthProfileId: profile.id,
  });
  checks.push(
    check(
      "CS-LIFECYCLE-OPS",
      "lifecycle",
      "Lifecycle operation recorded",
      lifecycleOps.length > 0,
      `ops=${lifecycleOps.length}`,
    ),
  );

  if (profile.onboardingProfileId) {
    const activation = getCustomerActivation(profile.onboardingProfileId);
    checks.push(
      check(
        "CS-ACTIVATION",
        "onboarding",
        "Customer activation active",
        activation?.state === "ACTIVE",
        activation ? `state=${activation.state}` : "activation missing",
      ),
    );
  }

  checks.push(
    check(
      "CS-HEALTH-SCORE",
      "health",
      "Health score acceptable",
      profile.score >= 50 &&
        (profile.health === "HEALTHY" ||
          profile.health === "STABLE" ||
          profile.health === "AT_RISK"),
      `health=${profile.health} score=${profile.score}`,
    ),
  );

  const metrics = computeEngagementMetrics(profile.id);
  checks.push(
    check(
      "CS-ENGAGEMENT",
      "metrics",
      "Engagement score acceptable",
      metrics.engagementScore >= 55,
      `engagement=${metrics.engagementScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    customerHealthProfileId: profile.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `customer success readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertCustomerSuccessReadinessReady(
  result: CustomerSuccessReadinessResult,
): asserts result is CustomerSuccessReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`customer success not ready: ${result.summary}`);
  }
}
