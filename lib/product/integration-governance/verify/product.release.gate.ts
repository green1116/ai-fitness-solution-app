/**
 * Product Integration Governance — Release Gate
 * MODULE: Integration Governance (M08-P6)
 * BASE: enterprise-product-marketplace-surface-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_MARKETPLACE_SURFACE_ID } from "../../marketplace-surface/management/management.constants";
import {
  assertIntegrationGovernanceReadinessReady,
  clearIntegrationGovernanceLayer,
  createIntegrationGovernanceManager,
  getIntegrationGovernanceRegistryManifest,
} from "../integration-governance.manager";
import {
  INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS,
  INTEGRATION_GOVERNANCE_MANAGER_STATUSES,
  INTEGRATION_GOVERNANCE_POLICY_KINDS,
  INTEGRATION_GOVERNANCE_POLICY_STATUSES,
  INTEGRATION_GOVERNANCE_READINESS_VERDICTS,
  INTEGRATION_GOVERNANCE_REVIEW_VERDICTS,
  INTEGRATION_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_INTEGRATION_GOVERNANCE_BASE,
  PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_TAG,
  PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTEGRATION_GOVERNANCE_ID,
  PRODUCT_INTEGRATION_GOVERNANCE_VERSION,
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

export const PRODUCT_INTEGRATION_GOVERNANCE_SIGNOFF_VERSION =
  "product-integration-governance-signoff-1" as const;

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
  clearIntegrationGovernanceLayer();
}

export function checkProductIntegrationGovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "IGOV-CONSTANTS",
      "management",
      "Product integration governance version constants",
      PRODUCT_INTEGRATION_GOVERNANCE_ID ===
        "enterprise-product-integration-governance-v1" &&
        PRODUCT_INTEGRATION_GOVERNANCE_VERSION ===
          "product-integration-governance-1" &&
        PRODUCT_INTEGRATION_GOVERNANCE_BASE ===
          PRODUCT_MARKETPLACE_SURFACE_ID &&
        PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION ===
          "product-integration-governance-freeze-1" &&
        PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_TAG ===
          "product-integration-governance-freeze-1" &&
        INTEGRATION_GOVERNANCE_POLICY_KINDS.length === 4 &&
        INTEGRATION_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        INTEGRATION_GOVERNANCE_STANDARD_LEVELS.length === 3 &&
        INTEGRATION_GOVERNANCE_REVIEW_VERDICTS.length === 3 &&
        INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS.length === 3 &&
        INTEGRATION_GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        INTEGRATION_GOVERNANCE_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_INTEGRATION_GOVERNANCE_ID} base=${PRODUCT_INTEGRATION_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "IGOV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "IGOV-UPSTREAM",
      "compatibility",
      "Depends on marketplace surface chain",
      PRODUCT_INTEGRATION_GOVERNANCE_BASE ===
        "enterprise-product-marketplace-surface-v1" &&
        PRODUCT_MARKETPLACE_SURFACE_ID ===
          "enterprise-product-marketplace-surface-v1",
      `surface=${PRODUCT_MARKETPLACE_SURFACE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createIntegrationGovernanceManager({
      managerId: "prod-igov-gate",
    });
    mgr.initialize();
    mgr.start();

    const policy = mgr.registerPolicy({
      id: "igov.gate.pol",
      policyKey: "SURFACE_LISTING_GOV",
      kind: "SURFACE_LISTING",
      title: "Surface listing governance",
      catalogKeyRef: "MAIN_STOREFRONT",
    });
    const standard = mgr.registerStandard({
      id: "igov.gate.std",
      policyId: policy.id,
      standardKey: "LISTING_APP_REF_REQUIRED",
      level: "REQUIRED",
      ruleRef: "INT_RULE_APP_KEY_REF",
    });
    const review = mgr.recordReview({
      id: "igov.gate.rev",
      policyId: policy.id,
      standardId: standard.id,
      reviewKey: "ACME_COACH_REVIEW",
      subjectRef: "ACME_COACHING",
      verdict: "APPROVED",
    });
    const compliance = mgr.recordCompliance({
      id: "igov.gate.cmp",
      policyId: policy.id,
      reviewId: review.id,
      complianceKey: "ACME_COACH_COMPLIANT",
      verdict: "COMPLIANT",
    });
    const release = mgr.createReleaseManifest({
      id: "igov.gate.rel",
      policyId: policy.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getIntegrationGovernanceRegistryManifest();

    const ok =
      policy.policyKey === "SURFACE_LISTING_GOV" &&
      policy.status === "ACTIVE" &&
      policy.catalogKeyRef === "MAIN_STOREFRONT" &&
      standard.level === "REQUIRED" &&
      review.verdict === "APPROVED" &&
      compliance.verdict === "COMPLIANT" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.governanceId === PRODUCT_INTEGRATION_GOVERNANCE_ID &&
      registry.base === PRODUCT_INTEGRATION_GOVERNANCE_BASE &&
      registry.policyCount >= 1 &&
      registry.standardCount >= 1 &&
      registry.reviewCount >= 1 &&
      registry.complianceCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertIntegrationGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "IGOV-STACK",
          "integration-governance",
          "Policy / standard / review / compliance / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "IGOV-STACK",
          "integration-governance",
          "Policy / standard / review / compliance / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product integration governance not ready",
        ),
      );
    }

    checks.push(
      check(
        "IGOV-SCOPE",
        "scope",
        "No connector-runtime / app-runtime / installation / provider-SDK / business-execution",
        ok,
        "integration-governance-declaration-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product integration governance probe failed";
    checks.push(
      check(
        "IGOV-STACK",
        "integration-governance",
        "Policy / standard / review / compliance / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "IGOV-SCOPE",
        "scope",
        "No connector-runtime / app-runtime / installation / provider-SDK / business-execution",
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
      `product-integration-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIntegrationGovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkProductIntegrationGovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product integration governance release gate failed: ${gate.summary}`,
    );
  }
}
