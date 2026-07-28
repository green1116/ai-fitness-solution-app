/**
 * Product M14 — Enterprise Intelligence Foundation Release Gate
 * MODULE: Enterprise Intelligence Foundation (M14-P1)
 * BASE: enterprise-product-os-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_OS_BASELINE_ID } from "../../m13/baseline/freeze/freeze.lock";
import {
  INTELLIGENCE_ANALYSIS_MODES,
  INTELLIGENCE_CAPABILITY_KINDS,
  INTELLIGENCE_CAPABILITY_STATUSES,
  INTELLIGENCE_DOMAIN_SCOPES,
  INTELLIGENCE_GOVERNANCE_POLICY_KINDS,
  INTELLIGENCE_GOVERNANCE_POLICY_STATUSES,
  INTELLIGENCE_LENS_KINDS,
  INTELLIGENCE_LENS_STATUSES,
  INTELLIGENCE_READINESS_VERDICTS,
  PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
  PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_FOUNDATION_ID,
  PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
  PRODUCT_INTELLIGENCE_FREEZE_TAG,
} from "../foundation/intelligence.constants";
import {
  assertIntelligenceFoundationReadinessReady,
  buildIntelligenceFoundationManifest,
  clearIntelligenceFoundationLayer,
  evaluateIntelligenceFoundationReadiness,
} from "../foundation/intelligence.manifest";
import {
  getIntelligenceFoundationMetadata,
  isIntelligenceFoundationMetadataIntact,
  validateIntelligenceLens,
} from "../foundation/intelligence.metadata";
import {
  registerIntelligenceLens,
  updateIntelligenceLensStatus,
} from "../foundation/intelligence.registry";
import {
  registerIntelligenceCapability,
  updateIntelligenceCapabilityStatus,
} from "../foundation/capability.registry";
import { registerIntelligenceGovernancePolicy } from "../foundation/governance.policy";
import { evaluateIntelligenceAnalysisContract } from "../foundation/analysis.contract";

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

export const PRODUCT_INTELLIGENCE_FOUNDATION_SIGNOFF_VERSION =
  "product-intelligence-foundation-signoff-1" as const;

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
  clearIntelligenceFoundationLayer();
}

export function checkProductIntelligenceFoundationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getIntelligenceFoundationMetadata();

  checks.push(
    check(
      "INT-CONSTANTS",
      "foundation",
      "Product intelligence foundation version constants",
      PRODUCT_INTELLIGENCE_FOUNDATION_ID ===
        "enterprise-product-intelligence-foundation-v1" &&
        PRODUCT_INTELLIGENCE_FOUNDATION_VERSION ===
          "product-intelligence-1" &&
        PRODUCT_INTELLIGENCE_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_OS_BASELINE_ID &&
        PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION ===
          "product-intelligence-foundation-freeze-1" &&
        PRODUCT_INTELLIGENCE_FREEZE_TAG ===
          "product-intelligence-foundation-freeze-1" &&
        INTELLIGENCE_LENS_KINDS.length === 6 &&
        INTELLIGENCE_LENS_STATUSES.length === 4 &&
        INTELLIGENCE_CAPABILITY_KINDS.length === 6 &&
        INTELLIGENCE_CAPABILITY_STATUSES.length === 4 &&
        INTELLIGENCE_DOMAIN_SCOPES.length === 4 &&
        INTELLIGENCE_ANALYSIS_MODES.length === 3 &&
        INTELLIGENCE_GOVERNANCE_POLICY_KINDS.length === 4 &&
        INTELLIGENCE_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        INTELLIGENCE_READINESS_VERDICTS.length === 3 &&
        isIntelligenceFoundationMetadataIntact(metadata),
      `id=${PRODUCT_INTELLIGENCE_FOUNDATION_ID} base=${PRODUCT_INTELLIGENCE_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "INT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "INT-UPSTREAM",
      "compatibility",
      "Depends on OS baseline",
      PRODUCT_INTELLIGENCE_FOUNDATION_BASE ===
        "enterprise-product-os-baseline-v1" &&
        ENTERPRISE_PRODUCT_OS_BASELINE_ID ===
          "enterprise-product-os-baseline-v1",
      `osBaseline=${ENTERPRISE_PRODUCT_OS_BASELINE_ID}`,
    ),
  );

  try {
    cleanup();

    const lens = registerIntelligenceLens({
      id: "int.gate.lens",
      lensKey: "EXECUTIVE_DECISION_SUPPORT",
      kind: "DECISION",
      scope: "DOMAIN",
      title: "Executive decision support lens",
      summary: "Declared decision lens for executive analysis",
      osBaselineRef: ENTERPRISE_PRODUCT_OS_BASELINE_ID,
    });
    const active = updateIntelligenceLensStatus({
      lensId: lens.id,
      status: "ACTIVE",
    });
    const validation = validateIntelligenceLens(active);
    const capability = registerIntelligenceCapability({
      id: "int.gate.cap",
      lensId: lens.id,
      capabilityKey: "DECIDE_DOMAIN_CYCLE",
      kind: "DECIDE",
      summary: "Declared decision capability for domain cycles",
    });
    const declared = updateIntelligenceCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const policy = registerIntelligenceGovernancePolicy({
      id: "int.gate.gov",
      policyKey: "DECISION_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Decision lens access control",
      lensKeyRef: lens.lensKey,
      ruleRef: "INT_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateIntelligenceAnalysisContract({
      id: "int.gate.an",
      contractKey: "DECISION_DOMAIN_LOOKUP",
      query: {
        queryKey: "DOMAIN_DECISION_Q",
        mode: "DECLARED",
        kind: "DECISION",
        capabilityKind: "DECIDE",
        scope: "DOMAIN",
        lensKeys: [lens.lensKey],
      },
    });
    const manifest = buildIntelligenceFoundationManifest();
    const readiness = evaluateIntelligenceFoundationReadiness();

    const ok =
      lens.lensKey === "EXECUTIVE_DECISION_SUPPORT" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.lensKeyRef === "EXECUTIVE_DECISION_SUPPORT" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertIntelligenceFoundationReadinessReady(readiness);
      checks.push(
        check(
          "INT-STACK",
          "intelligence-foundation",
          "Lens / capability / governance / analysis / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "INT-STACK",
          "intelligence-foundation",
          "Lens / capability / governance / analysis / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product intelligence foundation not ready",
        ),
      );
    }

    checks.push(
      check(
        "INT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "intelligence-foundation-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product intelligence foundation probe failed";
    checks.push(
      check(
        "INT-STACK",
        "intelligence-foundation",
        "Lens / capability / governance / analysis / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "INT-SCOPE",
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
      `product-intelligence-foundation-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIntelligenceFoundationReleaseGatePass(
  gate: ReleaseGateResult = checkProductIntelligenceFoundationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product intelligence foundation release gate failed: ${gate.summary}`,
    );
  }
}
