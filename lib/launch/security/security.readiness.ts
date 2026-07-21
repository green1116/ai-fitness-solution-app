/**
 * Launch P4 — Security Readiness Model
 * Integrates platform baseline, admin permission, API access, audit trail
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { evaluateDeploymentReadiness } from "../launch.readiness";
import { listAccessReviews } from "./security.access";
import { listAuditValidations } from "./security.audit";
import { listComplianceChecklists } from "./security.compliance";
import { getSecurityProfile, setSecurityProfileStatus } from "./security.profile";
import type {
  SecurityReadinessCheck,
  SecurityReadinessResult,
} from "./security.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): SecurityReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateSecurityReadiness(
  securityProfileId: string,
): SecurityReadinessResult {
  const profile = getSecurityProfile(securityProfileId.trim());
  if (!profile) {
    return {
      securityProfileId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "SR-PROFILE",
          "profile",
          "Security profile exists",
          false,
          `profile not found: ${securityProfileId}`,
        ),
      ],
      summary: "security readiness not ready: profile missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: SecurityReadinessCheck[] = [];

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "SR-PLATFORM",
      "platform",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  const launchReadiness = evaluateDeploymentReadiness(
    profile.productionProfileId,
  );
  checks.push(
    check(
      "SR-LAUNCH",
      "launch",
      "Production launch readiness READY",
      launchReadiness.verdict === "READY",
      launchReadiness.summary,
    ),
  );

  checks.push(
    check(
      "SR-ORG",
      "admin",
      "Organization bound",
      !!profile.organizationId,
      profile.organizationId
        ? `organization=${profile.organizationId}`
        : "organization missing",
    ),
  );

  const reviews = listAccessReviews({ securityProfileId: profile.id });
  const accessOk =
    reviews.length >= 1 && reviews.some((r) => r.passed && r.status === "PASSED");
  checks.push(
    check(
      "SR-ACCESS",
      "access",
      "Access review passed",
      accessOk,
      `reviews=${reviews.length} passed=${accessOk}`,
    ),
  );

  const checklists = listComplianceChecklists({
    securityProfileId: profile.id,
  });
  const complianceOk =
    checklists.length >= 1 && checklists.every((c) => c.complete);
  checks.push(
    check(
      "SR-COMPLIANCE",
      "compliance",
      "Compliance checklist complete",
      complianceOk,
      `checklists=${checklists.length} complete=${complianceOk}`,
    ),
  );

  const audits = listAuditValidations({ securityProfileId: profile.id });
  const auditOk =
    audits.length >= 1 && audits.some((a) => a.status === "VALID");
  checks.push(
    check(
      "SR-AUDIT",
      "audit",
      "Audit validation VALID",
      auditOk,
      `validations=${audits.length} valid=${auditOk}`,
    ),
  );

  checks.push(
    check(
      "SR-STATUS",
      "profile",
      "Security profile not BLOCKED",
      profile.status !== "BLOCKED" && profile.status !== "ARCHIVED",
      `status=${profile.status}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  if (verdict === "READY" && profile.status !== "APPROVED") {
    setSecurityProfileStatus(profile.id, "APPROVED");
  } else if (verdict === "BLOCKED" && profile.status !== "BLOCKED") {
    setSecurityProfileStatus(profile.id, "BLOCKED");
  }

  return {
    securityProfileId: profile.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `security-readiness verdict=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    evaluatedAt: nowIso(),
  };
}

export function assertSecurityReadinessReady(
  result: SecurityReadinessResult,
): asserts result is SecurityReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`security not ready: ${result.summary}`);
  }
}
