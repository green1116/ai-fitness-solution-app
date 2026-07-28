/**
 * Product M13 — OS Governance Release Gate
 * MODULE: OS Governance (M13-P6)
 * BASE: enterprise-product-os-compatibility-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_OS_COMPATIBILITY_ID } from "../compatibility-runtime/compatibility.constants";
import { bindOsGovernanceReview } from "../governance/binding.registry";
import {
  OS_GOVERNANCE_APPROVALS,
  OS_GOVERNANCE_BINDING_STATUSES,
  OS_GOVERNANCE_READINESS_VERDICTS,
  OS_GOVERNANCE_REVIEW_STATUSES,
  OS_GOVERNANCE_RISK_LEVELS,
  OS_GOVERNANCE_STANDARD_KINDS,
  OS_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_OS_GOVERNANCE_BASE,
  PRODUCT_OS_GOVERNANCE_FREEZE_TAG,
  PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_OS_GOVERNANCE_ID,
  PRODUCT_OS_GOVERNANCE_VERSION,
} from "../governance/governance.constants";
import {
  assertOsGovernanceReadinessReady,
  buildOsGovernanceManifest,
  clearOsGovernanceLayer,
  evaluateOsGovernanceReadiness,
} from "../governance/governance.manifest";
import {
  getOsGovernanceMetadata,
  isOsGovernanceMetadataIntact,
} from "../governance/governance.metadata";
import {
  registerOsGovernanceReview,
  updateOsGovernanceReviewStatus,
} from "../governance/review.registry";
import {
  registerOsGovernanceStandard,
  updateOsGovernanceStandardStatus,
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

export const PRODUCT_OS_GOVERNANCE_SIGNOFF_VERSION =
  "product-os-governance-signoff-1" as const;

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
  clearOsGovernanceLayer();
}

export function checkProductOsGovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getOsGovernanceMetadata();

  checks.push(
    check(
      "OSGOV-CONSTANTS",
      "governance",
      "Product OS governance version constants",
      PRODUCT_OS_GOVERNANCE_ID === "enterprise-product-os-governance-v1" &&
        PRODUCT_OS_GOVERNANCE_VERSION === "product-os-governance-1" &&
        PRODUCT_OS_GOVERNANCE_BASE === PRODUCT_OS_COMPATIBILITY_ID &&
        PRODUCT_OS_GOVERNANCE_FREEZE_VERSION ===
          "product-os-governance-freeze-1" &&
        PRODUCT_OS_GOVERNANCE_FREEZE_TAG ===
          "product-os-governance-freeze-1" &&
        OS_GOVERNANCE_STANDARD_KINDS.length === 4 &&
        OS_GOVERNANCE_STANDARD_STATUSES.length === 4 &&
        OS_GOVERNANCE_REVIEW_STATUSES.length === 4 &&
        OS_GOVERNANCE_APPROVALS.length === 4 &&
        OS_GOVERNANCE_RISK_LEVELS.length === 4 &&
        OS_GOVERNANCE_BINDING_STATUSES.length === 3 &&
        OS_GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        isOsGovernanceMetadataIntact(metadata),
      `id=${PRODUCT_OS_GOVERNANCE_ID} base=${PRODUCT_OS_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OSGOV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OSGOV-UPSTREAM",
      "compatibility",
      "Depends on OS compatibility chain",
      PRODUCT_OS_GOVERNANCE_BASE ===
        "enterprise-product-os-compatibility-v1" &&
        PRODUCT_OS_COMPATIBILITY_ID ===
          "enterprise-product-os-compatibility-v1",
      `compatibility=${PRODUCT_OS_COMPATIBILITY_ID}`,
    ),
  );

  try {
    cleanup();

    const standard = registerOsGovernanceStandard({
      id: "osgov.gate.std",
      standardKey: "DOMAIN_FREEZE_STANDARD",
      kind: "FREEZE",
      title: "Domain freeze OS governance standard",
      summary: "Declared standard for compatibility-aware freeze review",
    });
    const active = updateOsGovernanceStandardStatus({
      standardId: standard.id,
      status: "ACTIVE",
    });
    const review = registerOsGovernanceReview({
      id: "osgov.gate.rev",
      standardId: standard.id,
      reviewKey: "MATRIX_APPROVAL",
      sequence: 1,
      approval: "REQUIRED",
      riskLevel: "HIGH",
      matrixKeyRef: "DOMAIN_LAYER_MATRIX",
      summary: "Soft-ref review against compatibility matrix",
    });
    const declared = updateOsGovernanceReviewStatus({
      reviewId: review.id,
      status: "DECLARED",
    });
    const binding = bindOsGovernanceReview({
      id: "osgov.gate.bind",
      standardId: standard.id,
      reviewId: review.id,
      bindingKey: "REVIEW_TO_FREEZE_GATE",
      freezeGateRef: "OS_GOV_FRZ_DOMAIN",
      pairKeyRef: "DEP_TO_POLICY",
    });
    const manifest = buildOsGovernanceManifest();
    const readiness = evaluateOsGovernanceReadiness();

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
      assertOsGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "OSGOV-STACK",
          "os-governance",
          "Standard / review / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OSGOV-STACK",
          "os-governance",
          "Standard / review / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product os governance not ready",
        ),
      );
    }

    checks.push(
      check(
        "OSGOV-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "os-governance-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product os governance probe failed";
    checks.push(
      check(
        "OSGOV-STACK",
        "os-governance",
        "Standard / review / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "OSGOV-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
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
      `product-os-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOsGovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkProductOsGovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product OS governance release gate failed: ${gate.summary}`,
    );
  }
}
