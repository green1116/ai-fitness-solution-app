/**
 * Product M09 — AI Governance Release Gate
 * MODULE: AI Governance (M09-P6)
 * BASE: enterprise-product-ai-orchestration-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { recordAiGovernanceCompliance } from "../governance/compliance.registry";
import {
  AI_GOVERNANCE_COMPLIANCE_VERDICTS,
  AI_GOVERNANCE_POLICY_KINDS,
  AI_GOVERNANCE_POLICY_STATUSES,
  AI_GOVERNANCE_READINESS_VERDICTS,
  AI_GOVERNANCE_REVIEW_VERDICTS,
  AI_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_AI_GOVERNANCE_BASE,
  PRODUCT_AI_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_GOVERNANCE_ID,
  PRODUCT_AI_GOVERNANCE_VERSION,
} from "../governance/governance.constants";
import {
  assertAiGovernanceReadinessReady,
  buildAiGovernanceManifest,
  clearAiGovernanceLayer,
  evaluateAiGovernanceReadiness,
} from "../governance/governance.manifest";
import {
  getAiGovernanceMetadata,
  isAiGovernanceMetadataIntact,
} from "../governance/governance.metadata";
import { registerAiGovernancePolicy } from "../governance/policy.registry";
import { recordAiGovernanceReview } from "../governance/review.registry";
import { registerAiGovernanceStandard } from "../governance/standard.registry";
import { PRODUCT_AI_ORCHESTRATION_ID } from "../orchestration/orchestration.constants";

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

export const PRODUCT_AI_GOVERNANCE_SIGNOFF_VERSION =
  "product-ai-governance-signoff-1" as const;

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
  clearAiGovernanceLayer();
}

export function checkProductAiGovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiGovernanceMetadata();

  checks.push(
    check(
      "AIGOV-CONSTANTS",
      "governance",
      "Product AI governance version constants",
      PRODUCT_AI_GOVERNANCE_ID === "enterprise-product-ai-governance-v1" &&
        PRODUCT_AI_GOVERNANCE_VERSION === "product-ai-governance-1" &&
        PRODUCT_AI_GOVERNANCE_BASE === PRODUCT_AI_ORCHESTRATION_ID &&
        PRODUCT_AI_GOVERNANCE_FREEZE_VERSION ===
          "product-ai-governance-freeze-1" &&
        PRODUCT_AI_GOVERNANCE_FREEZE_TAG ===
          "product-ai-governance-freeze-1" &&
        AI_GOVERNANCE_POLICY_KINDS.length === 4 &&
        AI_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        AI_GOVERNANCE_STANDARD_LEVELS.length === 3 &&
        AI_GOVERNANCE_REVIEW_VERDICTS.length === 3 &&
        AI_GOVERNANCE_COMPLIANCE_VERDICTS.length === 3 &&
        AI_GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        isAiGovernanceMetadataIntact(metadata),
      `id=${PRODUCT_AI_GOVERNANCE_ID} base=${PRODUCT_AI_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AIGOV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIGOV-UPSTREAM",
      "compatibility",
      "Depends on AI orchestration chain",
      PRODUCT_AI_GOVERNANCE_BASE ===
        "enterprise-product-ai-orchestration-v1" &&
        PRODUCT_AI_ORCHESTRATION_ID ===
          "enterprise-product-ai-orchestration-v1",
      `orchestration=${PRODUCT_AI_ORCHESTRATION_ID}`,
    ),
  );

  try {
    cleanup();

    const policy = registerAiGovernancePolicy({
      id: "aigov.gate.pol",
      policyKey: "ORCH_SCOPE_GOV",
      kind: "ORCHESTRATION_SCOPE",
      title: "Orchestration scope governance",
      orchestrationKeyRef: "DOMAIN_COACH_ORCH",
    });
    const standard = registerAiGovernanceStandard({
      id: "aigov.gate.std",
      policyId: policy.id,
      standardKey: "ORCH_ROUTE_REFS_REQUIRED",
      level: "REQUIRED",
      ruleRef: "AI_RULE_ORCH_ROUTE_REFS",
    });
    const review = recordAiGovernanceReview({
      id: "aigov.gate.rev",
      policyId: policy.id,
      standardId: standard.id,
      reviewKey: "DOMAIN_COACH_ORCH_REVIEW",
      subjectRef: "DOMAIN_COACH_ORCH",
      verdict: "APPROVED",
    });
    const compliance = recordAiGovernanceCompliance({
      id: "aigov.gate.cmp",
      policyId: policy.id,
      reviewId: review.id,
      complianceKey: "DOMAIN_COACH_ORCH_COMPLIANT",
      verdict: "COMPLIANT",
    });
    const manifest = buildAiGovernanceManifest();
    const readiness = evaluateAiGovernanceReadiness();

    const ok =
      policy.policyKey === "ORCH_SCOPE_GOV" &&
      policy.status === "ACTIVE" &&
      policy.orchestrationKeyRef === "DOMAIN_COACH_ORCH" &&
      standard.level === "REQUIRED" &&
      review.verdict === "APPROVED" &&
      compliance.verdict === "COMPLIANT" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "AIGOV-STACK",
          "governance",
          "Policy / standard / review / compliance / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AIGOV-STACK",
          "governance",
          "Policy / standard / review / compliance / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai governance not ready",
        ),
      );
    }

    checks.push(
      check(
        "AIGOV-SCOPE",
        "scope",
        "No provider / model / workflow / orchestration / agent / tool-calling runtime",
        ok && metadata.declarationOnly === true,
        "ai-governance-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai governance probe failed";
    checks.push(
      check(
        "AIGOV-STACK",
        "governance",
        "Policy / standard / review / compliance / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AIGOV-SCOPE",
        "scope",
        "No provider / model / workflow / orchestration / agent / tool-calling runtime",
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
      `product-ai-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiGovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiGovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI governance release gate failed: ${gate.summary}`,
    );
  }
}
