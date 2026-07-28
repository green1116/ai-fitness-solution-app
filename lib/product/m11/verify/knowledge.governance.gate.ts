/**
 * Product M11 — Knowledge Governance Release Gate
 * MODULE: Knowledge Governance (M11-P6)
 * BASE: enterprise-product-knowledge-compatibility-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_COMPATIBILITY_ID } from "../compatibility-runtime/compatibility.constants";
import { bindKnowledgeGovernanceReview } from "../governance/binding.registry";
import {
  KNOWLEDGE_GOVERNANCE_APPROVALS,
  KNOWLEDGE_GOVERNANCE_BINDING_STATUSES,
  KNOWLEDGE_GOVERNANCE_READINESS_VERDICTS,
  KNOWLEDGE_GOVERNANCE_REVIEW_STATUSES,
  KNOWLEDGE_GOVERNANCE_RISK_LEVELS,
  KNOWLEDGE_GOVERNANCE_STANDARD_KINDS,
  KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
  PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
} from "../governance/governance.constants";
import {
  assertKnowledgeGovernanceReadinessReady,
  buildKnowledgeGovernanceManifest,
  clearKnowledgeGovernanceLayer,
  evaluateKnowledgeGovernanceReadiness,
} from "../governance/governance.manifest";
import {
  getKnowledgeGovernanceMetadata,
  isKnowledgeGovernanceMetadataIntact,
} from "../governance/governance.metadata";
import {
  registerKnowledgeGovernanceReview,
  updateKnowledgeGovernanceReviewStatus,
} from "../governance/review.registry";
import {
  registerKnowledgeGovernanceStandard,
  updateKnowledgeGovernanceStandardStatus,
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

export const PRODUCT_KNOWLEDGE_GOVERNANCE_SIGNOFF_VERSION =
  "product-knowledge-governance-signoff-1" as const;

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
  clearKnowledgeGovernanceLayer();
}

export function checkProductKnowledgeGovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getKnowledgeGovernanceMetadata();

  checks.push(
    check(
      "KNWGOV-CONSTANTS",
      "governance",
      "Product knowledge governance version constants",
      PRODUCT_KNOWLEDGE_GOVERNANCE_ID ===
        "enterprise-product-knowledge-governance-v1" &&
        PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION ===
          "product-knowledge-governance-1" &&
        PRODUCT_KNOWLEDGE_GOVERNANCE_BASE ===
          PRODUCT_KNOWLEDGE_COMPATIBILITY_ID &&
        PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION ===
          "product-knowledge-governance-freeze-1" &&
        PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_TAG ===
          "product-knowledge-governance-freeze-1" &&
        KNOWLEDGE_GOVERNANCE_STANDARD_KINDS.length === 4 &&
        KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES.length === 4 &&
        KNOWLEDGE_GOVERNANCE_REVIEW_STATUSES.length === 4 &&
        KNOWLEDGE_GOVERNANCE_APPROVALS.length === 4 &&
        KNOWLEDGE_GOVERNANCE_RISK_LEVELS.length === 4 &&
        KNOWLEDGE_GOVERNANCE_BINDING_STATUSES.length === 3 &&
        KNOWLEDGE_GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        isKnowledgeGovernanceMetadataIntact(metadata),
      `id=${PRODUCT_KNOWLEDGE_GOVERNANCE_ID} base=${PRODUCT_KNOWLEDGE_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "KNWGOV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "KNWGOV-UPSTREAM",
      "compatibility",
      "Depends on knowledge compatibility chain",
      PRODUCT_KNOWLEDGE_GOVERNANCE_BASE ===
        "enterprise-product-knowledge-compatibility-v1" &&
        PRODUCT_KNOWLEDGE_COMPATIBILITY_ID ===
          "enterprise-product-knowledge-compatibility-v1",
      `compatibility=${PRODUCT_KNOWLEDGE_COMPATIBILITY_ID}`,
    ),
  );

  try {
    cleanup();

    const standard = registerKnowledgeGovernanceStandard({
      id: "knwgov.gate.std",
      standardKey: "DOMAIN_FREEZE_STANDARD",
      kind: "FREEZE",
      title: "Domain freeze governance standard",
      summary: "Declared standard for compatibility-aware freeze review",
    });
    const active = updateKnowledgeGovernanceStandardStatus({
      standardId: standard.id,
      status: "ACTIVE",
    });
    const review = registerKnowledgeGovernanceReview({
      id: "knwgov.gate.rev",
      standardId: standard.id,
      reviewKey: "MATRIX_APPROVAL",
      sequence: 1,
      approval: "REQUIRED",
      riskLevel: "HIGH",
      matrixKeyRef: "DOMAIN_LAYER_MATRIX",
      summary: "Soft-ref review against compatibility matrix",
    });
    const declared = updateKnowledgeGovernanceReviewStatus({
      reviewId: review.id,
      status: "DECLARED",
    });
    const binding = bindKnowledgeGovernanceReview({
      id: "knwgov.gate.bind",
      standardId: standard.id,
      reviewId: review.id,
      bindingKey: "REVIEW_TO_FREEZE_GATE",
      freezeGateRef: "KNW_GOV_FRZ_DOMAIN",
      pairKeyRef: "DEP_TO_POLICY",
    });
    const manifest = buildKnowledgeGovernanceManifest();
    const readiness = evaluateKnowledgeGovernanceReadiness();

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
      assertKnowledgeGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "KNWGOV-STACK",
          "knowledge-governance",
          "Standard / review / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "KNWGOV-STACK",
          "knowledge-governance",
          "Standard / review / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product knowledge governance not ready",
        ),
      );
    }

    checks.push(
      check(
        "KNWGOV-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
        ok && metadata.declarationOnly === true,
        "knowledge-governance-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product knowledge governance probe failed";
    checks.push(
      check(
        "KNWGOV-STACK",
        "knowledge-governance",
        "Standard / review / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "KNWGOV-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
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
      `product-knowledge-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductKnowledgeGovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkProductKnowledgeGovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product knowledge governance release gate failed: ${gate.summary}`,
    );
  }
}
