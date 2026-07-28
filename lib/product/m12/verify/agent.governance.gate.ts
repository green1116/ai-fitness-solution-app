/**
 * Product M12 — Agent Governance Release Gate
 * MODULE: Agent Governance (M12-P6)
 * BASE: enterprise-product-agent-compatibility-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AGENT_COMPATIBILITY_ID } from "../compatibility-runtime/compatibility.constants";
import { bindAgentGovernanceReview } from "../governance/binding.registry";
import {
  AGENT_GOVERNANCE_APPROVALS,
  AGENT_GOVERNANCE_BINDING_STATUSES,
  AGENT_GOVERNANCE_READINESS_VERDICTS,
  AGENT_GOVERNANCE_REVIEW_STATUSES,
  AGENT_GOVERNANCE_RISK_LEVELS,
  AGENT_GOVERNANCE_STANDARD_KINDS,
  AGENT_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_AGENT_GOVERNANCE_BASE,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AGENT_GOVERNANCE_ID,
  PRODUCT_AGENT_GOVERNANCE_VERSION,
} from "../governance/governance.constants";
import {
  assertAgentGovernanceReadinessReady,
  buildAgentGovernanceManifest,
  clearAgentGovernanceLayer,
  evaluateAgentGovernanceReadiness,
} from "../governance/governance.manifest";
import {
  getAgentGovernanceMetadata,
  isAgentGovernanceMetadataIntact,
} from "../governance/governance.metadata";
import {
  registerAgentGovernanceReview,
  updateAgentGovernanceReviewStatus,
} from "../governance/review.registry";
import {
  registerAgentGovernanceStandard,
  updateAgentGovernanceStandardStatus,
} from "../governance/standard.registry";

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

export const PRODUCT_AGENT_GOVERNANCE_SIGNOFF_VERSION =
  "product-agent-governance-signoff-1" as const;

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
  clearAgentGovernanceLayer();
}

export function checkProductAgentGovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAgentGovernanceMetadata();

  checks.push(
    check(
      "AGTGOV-CONSTANTS",
      "governance",
      "Product agent governance version constants",
      PRODUCT_AGENT_GOVERNANCE_ID ===
        "enterprise-product-agent-governance-v1" &&
        PRODUCT_AGENT_GOVERNANCE_VERSION === "product-agent-governance-1" &&
        PRODUCT_AGENT_GOVERNANCE_BASE === PRODUCT_AGENT_COMPATIBILITY_ID &&
        PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION ===
          "product-agent-governance-freeze-1" &&
        PRODUCT_AGENT_GOVERNANCE_FREEZE_TAG ===
          "product-agent-governance-freeze-1" &&
        AGENT_GOVERNANCE_STANDARD_KINDS.length === 4 &&
        AGENT_GOVERNANCE_STANDARD_STATUSES.length === 4 &&
        AGENT_GOVERNANCE_REVIEW_STATUSES.length === 4 &&
        AGENT_GOVERNANCE_APPROVALS.length === 4 &&
        AGENT_GOVERNANCE_RISK_LEVELS.length === 4 &&
        AGENT_GOVERNANCE_BINDING_STATUSES.length === 3 &&
        AGENT_GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        isAgentGovernanceMetadataIntact(metadata),
      `id=${PRODUCT_AGENT_GOVERNANCE_ID} base=${PRODUCT_AGENT_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AGTGOV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AGTGOV-UPSTREAM",
      "compatibility",
      "Depends on agent compatibility chain",
      PRODUCT_AGENT_GOVERNANCE_BASE ===
        "enterprise-product-agent-compatibility-v1" &&
        PRODUCT_AGENT_COMPATIBILITY_ID ===
          "enterprise-product-agent-compatibility-v1",
      `compatibility=${PRODUCT_AGENT_COMPATIBILITY_ID}`,
    ),
  );

  try {
    cleanup();

    const standard = registerAgentGovernanceStandard({
      id: "agtgov.gate.std",
      standardKey: "DOMAIN_FREEZE_STANDARD",
      kind: "FREEZE",
      title: "Domain freeze agent governance standard",
      summary: "Declared standard for compatibility-aware freeze review",
    });
    const active = updateAgentGovernanceStandardStatus({
      standardId: standard.id,
      status: "ACTIVE",
    });
    const review = registerAgentGovernanceReview({
      id: "agtgov.gate.rev",
      standardId: standard.id,
      reviewKey: "MATRIX_APPROVAL",
      sequence: 1,
      approval: "REQUIRED",
      riskLevel: "HIGH",
      matrixKeyRef: "DOMAIN_LAYER_MATRIX",
      summary: "Soft-ref review against compatibility matrix",
    });
    const declared = updateAgentGovernanceReviewStatus({
      reviewId: review.id,
      status: "DECLARED",
    });
    const binding = bindAgentGovernanceReview({
      id: "agtgov.gate.bind",
      standardId: standard.id,
      reviewId: review.id,
      bindingKey: "REVIEW_TO_FREEZE_GATE",
      freezeGateRef: "AGT_GOV_FRZ_DOMAIN",
      pairKeyRef: "DEP_TO_POLICY",
    });
    const manifest = buildAgentGovernanceManifest();
    const readiness = evaluateAgentGovernanceReadiness();

    const ok =
      standard.standardKey === "DOMAIN_FREEZE_STANDARD" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.matrixKeyRef === "DOMAIN_LAYER_MATRIX" &&
      declared.approval === "REQUIRED" &&
      binding.status === "BOUND" &&
      binding.pairKeyRef === "DEP_TO_POLICY" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAgentGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "AGTGOV-STACK",
          "agent-governance",
          "Standard / review / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AGTGOV-STACK",
          "agent-governance",
          "Standard / review / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product agent governance not ready",
        ),
      );
    }

    checks.push(
      check(
        "AGTGOV-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "agent-governance-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product agent governance probe failed";
    checks.push(
      check(
        "AGTGOV-STACK",
        "agent-governance",
        "Standard / review / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AGTGOV-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
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
      `product-agent-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAgentGovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkProductAgentGovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product agent governance release gate failed: ${gate.summary}`,
    );
  }
}
