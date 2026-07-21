/**
 * Launch P5 — Support Readiness Model
 * Integrates security readiness, commercial SLA, customer lifecycle, admin audit
 */

import { listAdminAuditEntries } from "../../product/e12/admin/admin.audit";
import { getSlaAgreement } from "../../product/e12/commercial/commercial.sla";
import { getCustomerActivation } from "../onboarding/onboarding.activation";
import { evaluateSecurityReadiness } from "../security/security.readiness";
import { computeSupportResponseMetrics } from "./support.metrics";
import { listSupportPolicies } from "./support.policy";
import {
  getSupportSlaProfile,
  setSupportSlaProfileStatus,
} from "./support.profile";
import { getSupportTier } from "./support.tier";
import type {
  SupportReadinessCheck,
  SupportReadinessResult,
} from "./support.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): SupportReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateSupportReadiness(
  supportSlaProfileId: string,
): SupportReadinessResult {
  const profile = getSupportSlaProfile(supportSlaProfileId.trim());
  if (!profile) {
    return {
      supportSlaProfileId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "SP-PROFILE",
          "profile",
          "Support SLA profile exists",
          false,
          `profile not found: ${supportSlaProfileId}`,
        ),
      ],
      summary: "support readiness not ready: profile missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: SupportReadinessCheck[] = [];

  if (profile.securityProfileId) {
    const security = evaluateSecurityReadiness(profile.securityProfileId);
    checks.push(
      check(
        "SP-SECURITY",
        "security",
        "Security readiness READY",
        security.verdict === "READY",
        security.summary,
      ),
    );
  } else {
    checks.push(
      check(
        "SP-SECURITY",
        "security",
        "Security profile bound",
        false,
        "security profile not bound",
      ),
    );
  }

  if (profile.commercialSlaId) {
    const sla = getSlaAgreement(profile.commercialSlaId);
    checks.push(
      check(
        "SP-COMMERCIAL-SLA",
        "commercial",
        "Commercial SLA ACTIVE",
        sla !== undefined && sla.status === "ACTIVE",
        sla
          ? `sla=${sla.id} tier=${sla.tier} status=${sla.status}`
          : `sla not found: ${profile.commercialSlaId}`,
      ),
    );
  } else {
    checks.push(
      check(
        "SP-COMMERCIAL-SLA",
        "commercial",
        "Commercial SLA bound",
        false,
        "commercial sla not bound",
      ),
    );
  }

  if (profile.onboardingProfileId) {
    const activation = getCustomerActivation(profile.onboardingProfileId);
    checks.push(
      check(
        "SP-LIFECYCLE",
        "lifecycle",
        "Customer lifecycle ACTIVE",
        activation !== undefined && activation.state === "ACTIVE",
        activation
          ? `state=${activation.state}`
          : "customer activation missing",
      ),
    );
  } else {
    checks.push(
      check(
        "SP-LIFECYCLE",
        "lifecycle",
        "Customer lifecycle linked",
        false,
        "onboarding profile not bound",
      ),
    );
  }

  const audits = listAdminAuditEntries({
    productId: profile.productId,
    productTenantId: profile.productTenantId,
  });
  const auditFallback =
    audits.length > 0
      ? audits
      : listAdminAuditEntries({ productId: profile.productId });
  checks.push(
    check(
      "SP-AUDIT",
      "audit",
      "Admin audit trail present",
      auditFallback.length >= 1,
      `audits=${auditFallback.length}`,
    ),
  );

  const tierOk =
    !!profile.supportTierId && !!getSupportTier(profile.supportTierId);
  checks.push(
    check(
      "SP-TIER",
      "tier",
      "Support tier bound",
      tierOk,
      profile.supportTierId
        ? `tier=${profile.supportTierId}`
        : "support tier missing",
    ),
  );

  const policies = listSupportPolicies({
    supportSlaProfileId: profile.id,
  });
  checks.push(
    check(
      "SP-POLICY",
      "policy",
      "Support policies present",
      policies.length >= 1,
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "SP-STATUS",
      "profile",
      "Support SLA profile ACTIVE",
      profile.status === "ACTIVE",
      `status=${profile.status}`,
    ),
  );

  // Metrics computable (no throw)
  try {
    const metrics = computeSupportResponseMetrics(profile.id);
    checks.push(
      check(
        "SP-METRICS",
        "metrics",
        "Response metrics available",
        true,
        `incidents=${metrics.incidentCount} compliance=${metrics.slaComplianceRate ?? "n/a"}`,
      ),
    );
  } catch (error) {
    checks.push(
      check(
        "SP-METRICS",
        "metrics",
        "Response metrics available",
        false,
        error instanceof Error ? error.message : "metrics failed",
      ),
    );
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  if (verdict === "READY" && profile.status !== "ACTIVE") {
    setSupportSlaProfileStatus(profile.id, "ACTIVE");
  }

  return {
    supportSlaProfileId: profile.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `support-readiness verdict=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    evaluatedAt: nowIso(),
  };
}

export function assertSupportReadinessReady(
  result: SupportReadinessResult,
): asserts result is SupportReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`support not ready: ${result.summary}`);
  }
}
