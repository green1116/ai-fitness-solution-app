/**
 * Product API Governance — Release Gate
 * MODULE: API Governance (M07-P6)
 * BASE: enterprise-product-api-portal-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../../api-gateway/management/management.constants";
import { PRODUCT_API_PORTAL_ID } from "../../api-portal/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../../api-sdk/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import {
  assertApiGovernanceReadinessReady,
  clearApiGovernanceLayer,
  createApiGovernanceManager,
  getApiGovernanceRegistryManifest,
} from "../api-governance.manager";
import {
  GOVERNANCE_COMPLIANCE_VERDICTS,
  GOVERNANCE_MANAGER_STATUSES,
  GOVERNANCE_POLICY_KINDS,
  GOVERNANCE_POLICY_STATUSES,
  GOVERNANCE_READINESS_VERDICTS,
  GOVERNANCE_REVIEW_VERDICTS,
  GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_API_GOVERNANCE_BASE,
  PRODUCT_API_GOVERNANCE_FREEZE_TAG,
  PRODUCT_API_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_API_GOVERNANCE_ID,
  PRODUCT_API_GOVERNANCE_VERSION,
} from "../management/management.constants";

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

export const PRODUCT_API_GOVERNANCE_SIGNOFF_VERSION =
  "product-api-governance-signoff-1" as const;

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
  clearApiGovernanceLayer();
}

export function checkProductApiGovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "GOV-CONSTANTS",
      "management",
      "Product API governance version constants",
      PRODUCT_API_GOVERNANCE_ID ===
        "enterprise-product-api-governance-v1" &&
        PRODUCT_API_GOVERNANCE_VERSION === "product-api-governance-1" &&
        PRODUCT_API_GOVERNANCE_BASE === PRODUCT_API_PORTAL_ID &&
        PRODUCT_API_GOVERNANCE_FREEZE_VERSION ===
          "product-api-governance-freeze-1" &&
        PRODUCT_API_GOVERNANCE_FREEZE_TAG ===
          "product-api-governance-freeze-1" &&
        GOVERNANCE_POLICY_KINDS.length === 4 &&
        GOVERNANCE_POLICY_STATUSES.length === 3 &&
        GOVERNANCE_STANDARD_LEVELS.length === 3 &&
        GOVERNANCE_REVIEW_VERDICTS.length === 3 &&
        GOVERNANCE_COMPLIANCE_VERDICTS.length === 3 &&
        GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        GOVERNANCE_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_API_GOVERNANCE_ID} base=${PRODUCT_API_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "GOV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "GOV-UPSTREAM",
      "compatibility",
      "Depends on api-portal chain (sdk / gateway / authn / foundation / auth-baseline)",
      PRODUCT_API_GOVERNANCE_BASE ===
        "enterprise-product-api-portal-v1" &&
        PRODUCT_API_PORTAL_ID === "enterprise-product-api-portal-v1" &&
        PRODUCT_API_SDK_ID === "enterprise-product-api-sdk-v1" &&
        PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1" &&
        PRODUCT_API_AUTHENTICATION_ID ===
          "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `portal=${PRODUCT_API_PORTAL_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createApiGovernanceManager({
      managerId: "prod-apigov-gate",
    });
    mgr.initialize();
    mgr.start();

    const policy = mgr.registerPolicy({
      id: "apigov.gate.pol",
      policyKey: "NTF_NAMING",
      kind: "NAMING",
      title: "Notification API Naming Policy",
      portalKeyRef: "NTF_DEV_PORTAL",
    });
    const standard = mgr.registerStandard({
      id: "apigov.gate.std",
      policyId: policy.id,
      standardKey: "RESOURCE_PLURAL",
      level: "REQUIRED",
      ruleRef: "API_NAMING_RESOURCE_PLURAL_V1",
    });
    const review = mgr.recordReview({
      id: "apigov.gate.rev",
      policyId: policy.id,
      standardId: standard.id,
      reviewKey: "NTF_SEND_REVIEW",
      subjectRef: "NOTIFICATIONS_V1",
      verdict: "APPROVED",
    });
    const compliance = mgr.recordCompliance({
      id: "apigov.gate.cmp",
      policyId: policy.id,
      reviewId: review.id,
      complianceKey: "NTF_SEND_CMP",
      verdict: "COMPLIANT",
    });
    const release = mgr.createReleaseManifest({
      id: "apigov.gate.rel",
      policyId: policy.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getApiGovernanceRegistryManifest();

    const ok =
      policy.policyKey === "NTF_NAMING" &&
      standard.level === "REQUIRED" &&
      review.verdict === "APPROVED" &&
      compliance.verdict === "COMPLIANT" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.governanceId === PRODUCT_API_GOVERNANCE_ID &&
      registry.base === PRODUCT_API_GOVERNANCE_BASE &&
      registry.policyCount >= 1 &&
      registry.standardCount >= 1 &&
      registry.reviewCount >= 1 &&
      registry.complianceCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertApiGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "GOV-STACK",
          "governance",
          "Policy / standard / review / compliance / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "GOV-STACK",
          "governance",
          "Policy / standard / review / compliance / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product api governance not ready",
        ),
      );
    }

    checks.push(
      check(
        "GOV-SCOPE",
        "scope",
        "No runtime / provider / business-logic surface",
        ok,
        "governance-definition-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product api governance probe failed";
    checks.push(
      check(
        "GOV-STACK",
        "governance",
        "Policy / standard / review / compliance / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "GOV-SCOPE",
        "scope",
        "No runtime / provider / business-logic surface",
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
      `product-api-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductApiGovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkProductApiGovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product API governance release gate failed: ${gate.summary}`,
    );
  }
}
