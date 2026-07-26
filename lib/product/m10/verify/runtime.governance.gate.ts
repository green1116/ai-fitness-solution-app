/**
 * Product M10 — AI Runtime Governance Release Gate
 * MODULE: Runtime Governance (M10-P6)
 * BASE: enterprise-product-ai-resource-manager-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AI_RESOURCE_MANAGER_ID } from "../resource-manager/resource.constants";
import { recordAiRuntimeGovernanceCompliance } from "../runtime-governance/compliance.registry";
import {
  AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS,
  AI_RUNTIME_GOVERNANCE_POLICY_KINDS,
  AI_RUNTIME_GOVERNANCE_POLICY_STATUSES,
  AI_RUNTIME_GOVERNANCE_READINESS_VERDICTS,
  AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS,
  AI_RUNTIME_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
  PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
} from "../runtime-governance/governance.constants";
import {
  assertAiRuntimeGovernanceReadinessReady,
  buildAiRuntimeGovernanceManifest,
  clearAiRuntimeGovernanceLayer,
  evaluateAiRuntimeGovernanceReadiness,
} from "../runtime-governance/governance.manifest";
import {
  getAiRuntimeGovernanceMetadata,
  isAiRuntimeGovernanceMetadataIntact,
} from "../runtime-governance/governance.metadata";
import { registerAiRuntimeGovernancePolicy } from "../runtime-governance/policy.registry";
import { recordAiRuntimeGovernanceReview } from "../runtime-governance/review.registry";
import { registerAiRuntimeGovernanceStandard } from "../runtime-governance/standard.registry";

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

export const PRODUCT_AI_RUNTIME_GOVERNANCE_SIGNOFF_VERSION =
  "product-ai-runtime-governance-signoff-1" as const;

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
  clearAiRuntimeGovernanceLayer();
}

export function checkProductAiRuntimeGovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiRuntimeGovernanceMetadata();

  checks.push(
    check(
      "AIRTG-CONSTANTS",
      "runtime-governance",
      "Product AI runtime governance version constants",
      PRODUCT_AI_RUNTIME_GOVERNANCE_ID ===
        "enterprise-product-ai-runtime-governance-v1" &&
        PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION ===
          "product-ai-runtime-governance-1" &&
        PRODUCT_AI_RUNTIME_GOVERNANCE_BASE ===
          PRODUCT_AI_RESOURCE_MANAGER_ID &&
        PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION ===
          "product-ai-runtime-governance-freeze-1" &&
        PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_TAG ===
          "product-ai-runtime-governance-freeze-1" &&
        AI_RUNTIME_GOVERNANCE_POLICY_KINDS.length === 4 &&
        AI_RUNTIME_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        AI_RUNTIME_GOVERNANCE_STANDARD_LEVELS.length === 3 &&
        AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS.length === 3 &&
        AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS.length === 3 &&
        AI_RUNTIME_GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        isAiRuntimeGovernanceMetadataIntact(metadata),
      `id=${PRODUCT_AI_RUNTIME_GOVERNANCE_ID} base=${PRODUCT_AI_RUNTIME_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AIRTG-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIRTG-UPSTREAM",
      "compatibility",
      "Depends on AI resource manager chain",
      PRODUCT_AI_RUNTIME_GOVERNANCE_BASE ===
        "enterprise-product-ai-resource-manager-v1" &&
        PRODUCT_AI_RESOURCE_MANAGER_ID ===
          "enterprise-product-ai-resource-manager-v1",
      `resourceManager=${PRODUCT_AI_RESOURCE_MANAGER_ID}`,
    ),
  );

  try {
    cleanup();

    const policy = registerAiRuntimeGovernancePolicy({
      id: "airtg.gate.pol",
      policyKey: "RESOURCE_LIMIT_GOV",
      kind: "RESOURCE_LIMIT",
      title: "Resource limit governance",
      resourceKeyRef: "DOMAIN_CONCURRENCY",
    });
    const standard = registerAiRuntimeGovernanceStandard({
      id: "airtg.gate.std",
      policyId: policy.id,
      standardKey: "CONCURRENCY_CAP_REQUIRED",
      level: "REQUIRED",
      ruleRef: "RT_RULE_CONCURRENCY_CAP",
    });
    const review = recordAiRuntimeGovernanceReview({
      id: "airtg.gate.rev",
      policyId: policy.id,
      standardId: standard.id,
      reviewKey: "DOMAIN_CONCURRENCY_REVIEW",
      subjectRef: "DOMAIN_CONCURRENCY",
      verdict: "APPROVED",
    });
    const compliance = recordAiRuntimeGovernanceCompliance({
      id: "airtg.gate.cmp",
      policyId: policy.id,
      reviewId: review.id,
      complianceKey: "DOMAIN_CONCURRENCY_COMPLIANT",
      verdict: "COMPLIANT",
    });
    const manifest = buildAiRuntimeGovernanceManifest();
    const readiness = evaluateAiRuntimeGovernanceReadiness();

    const ok =
      policy.policyKey === "RESOURCE_LIMIT_GOV" &&
      policy.status === "ACTIVE" &&
      policy.resourceKeyRef === "DOMAIN_CONCURRENCY" &&
      standard.level === "REQUIRED" &&
      review.verdict === "APPROVED" &&
      compliance.verdict === "COMPLIANT" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiRuntimeGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "AIRTG-STACK",
          "runtime-governance",
          "Policy / standard / review / compliance / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AIRTG-STACK",
          "runtime-governance",
          "Policy / standard / review / compliance / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai runtime governance not ready",
        ),
      );
    }

    checks.push(
      check(
        "AIRTG-SCOPE",
        "scope",
        "No allocation / token / autoscaling / provider / model / queue / scheduler / monitoring",
        ok && metadata.declarationOnly === true,
        "ai-runtime-governance-definition-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai runtime governance probe failed";
    checks.push(
      check(
        "AIRTG-STACK",
        "runtime-governance",
        "Policy / standard / review / compliance / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AIRTG-SCOPE",
        "scope",
        "No allocation / token / autoscaling / provider / model / queue / scheduler / monitoring",
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
      `product-ai-runtime-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiRuntimeGovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiRuntimeGovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI runtime governance release gate failed: ${gate.summary}`,
    );
  }
}
