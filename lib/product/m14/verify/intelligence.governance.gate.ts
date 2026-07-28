/**
 * Product M14 — Intelligence Governance Release Gate
 * MODULE: Enterprise Intelligence Governance (M14-P6)
 * BASE: enterprise-product-intelligence-compatibility-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_COMPATIBILITY_ID } from "../compatibility-runtime/compatibility.constants";
import { bindIntelligenceGovernanceReview } from "../governance/binding.registry";
import {
  INTELLIGENCE_GOVERNANCE_APPROVALS,
  INTELLIGENCE_GOVERNANCE_BINDING_STATUSES,
  INTELLIGENCE_GOVERNANCE_READINESS_VERDICTS,
  INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES,
  INTELLIGENCE_GOVERNANCE_RISK_LEVELS,
  INTELLIGENCE_GOVERNANCE_STANDARD_KINDS,
  INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
  PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
  PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
} from "../governance/governance.constants";
import {
  assertIntelligenceGovernanceReadinessReady,
  buildIntelligenceGovernanceManifest,
  clearIntelligenceGovernanceLayer,
  evaluateIntelligenceGovernanceReadiness,
} from "../governance/governance.manifest";
import {
  getIntelligenceGovernanceMetadata,
  isIntelligenceGovernanceMetadataIntact,
} from "../governance/governance.metadata";
import {
  registerIntelligenceGovernanceReview,
  updateIntelligenceGovernanceReviewStatus,
} from "../governance/review.registry";
import {
  registerIntelligenceGovernanceStandard,
  updateIntelligenceGovernanceStandardStatus,
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

export const PRODUCT_INTELLIGENCE_GOVERNANCE_SIGNOFF_VERSION =
  "product-intelligence-governance-signoff-1" as const;

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
  clearIntelligenceGovernanceLayer();
}

export function checkProductIntelligenceGovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getIntelligenceGovernanceMetadata();

  checks.push(
    check(
      "INTGOV-CONSTANTS",
      "governance",
      "Product intelligence governance version constants",
      PRODUCT_INTELLIGENCE_GOVERNANCE_ID ===
        "enterprise-product-intelligence-governance-v1" &&
        PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION ===
          "product-intelligence-governance-1" &&
        PRODUCT_INTELLIGENCE_GOVERNANCE_BASE ===
          PRODUCT_INTELLIGENCE_COMPATIBILITY_ID &&
        PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION ===
          "product-intelligence-governance-freeze-1" &&
        PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_TAG ===
          "product-intelligence-governance-freeze-1" &&
        INTELLIGENCE_GOVERNANCE_STANDARD_KINDS.length === 4 &&
        INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES.length === 4 &&
        INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES.length === 4 &&
        INTELLIGENCE_GOVERNANCE_APPROVALS.length === 4 &&
        INTELLIGENCE_GOVERNANCE_RISK_LEVELS.length === 4 &&
        INTELLIGENCE_GOVERNANCE_BINDING_STATUSES.length === 3 &&
        INTELLIGENCE_GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        isIntelligenceGovernanceMetadataIntact(metadata),
      `id=${PRODUCT_INTELLIGENCE_GOVERNANCE_ID} base=${PRODUCT_INTELLIGENCE_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "INTGOV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "INTGOV-UPSTREAM",
      "compatibility",
      "Depends on intelligence compatibility chain",
      PRODUCT_INTELLIGENCE_GOVERNANCE_BASE ===
        "enterprise-product-intelligence-compatibility-v1" &&
        PRODUCT_INTELLIGENCE_COMPATIBILITY_ID ===
          "enterprise-product-intelligence-compatibility-v1",
      `compatibility=${PRODUCT_INTELLIGENCE_COMPATIBILITY_ID}`,
    ),
  );

  try {
    cleanup();

    const standard = registerIntelligenceGovernanceStandard({
      id: "intgov.gate.std",
      standardKey: "EXECUTIVE_FREEZE_STANDARD",
      kind: "FREEZE",
      title: "Executive intelligence governance standard",
      summary: "Declared standard for compatibility-aware freeze review",
    });
    const active = updateIntelligenceGovernanceStandardStatus({
      standardId: standard.id,
      status: "ACTIVE",
    });
    const review = registerIntelligenceGovernanceReview({
      id: "intgov.gate.rev",
      standardId: standard.id,
      reviewKey: "MATRIX_APPROVAL",
      sequence: 1,
      approval: "REQUIRED",
      riskLevel: "HIGH",
      matrixKeyRef: "EXECUTIVE_LAYER_MATRIX",
      summary: "Soft-ref review against compatibility matrix",
    });
    const declared = updateIntelligenceGovernanceReviewStatus({
      reviewId: review.id,
      status: "DECLARED",
    });
    const binding = bindIntelligenceGovernanceReview({
      id: "intgov.gate.bind",
      standardId: standard.id,
      reviewId: review.id,
      bindingKey: "REVIEW_TO_FREEZE_GATE",
      freezeGateRef: "INT_GOV_FRZ_EXECUTIVE",
      pairKeyRef: "DEP_TO_POLICY",
    });
    const manifest = buildIntelligenceGovernanceManifest();
    const readiness = evaluateIntelligenceGovernanceReadiness();

    const ok =
      standard.standardKey === "EXECUTIVE_FREEZE_STANDARD" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.matrixKeyRef === "EXECUTIVE_LAYER_MATRIX" &&
      declared.approval === "REQUIRED" &&
      binding.status === "BOUND" &&
      binding.pairKeyRef === "DEP_TO_POLICY" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertIntelligenceGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "INTGOV-STACK",
          "intelligence-governance",
          "Standard / review / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "INTGOV-STACK",
          "intelligence-governance",
          "Standard / review / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product intelligence governance not ready",
        ),
      );
    }

    checks.push(
      check(
        "INTGOV-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "intelligence-governance-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product intelligence governance probe failed";
    checks.push(
      check(
        "INTGOV-STACK",
        "intelligence-governance",
        "Standard / review / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "INTGOV-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
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
      `product-intelligence-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIntelligenceGovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkProductIntelligenceGovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product intelligence governance release gate failed: ${gate.summary}`,
    );
  }
}
