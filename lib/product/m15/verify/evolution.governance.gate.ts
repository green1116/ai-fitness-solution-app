/**
 * Product M15 — Evolution Governance Release Gate
 * MODULE: Enterprise Evolution Governance (M15-P7)
 * BASE: enterprise-product-evolution-capability-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_CAPABILITY_ID } from "../capability-runtime/capability.constants";
import {
  EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS,
  EVOLUTION_GOVERNANCE_CONTROL_POLICY_STATUSES,
  EVOLUTION_GOVERNANCE_DOMAIN_SCOPES,
  EVOLUTION_GOVERNANCE_FRAME_KINDS,
  EVOLUTION_GOVERNANCE_FRAME_STATUSES,
  EVOLUTION_GOVERNANCE_OVERSIGHT_MODES,
  EVOLUTION_GOVERNANCE_READINESS_VERDICTS,
  EVOLUTION_GOVERNANCE_REVIEW_KINDS,
  EVOLUTION_GOVERNANCE_REVIEW_STATUSES,
  PRODUCT_EVOLUTION_GOVERNANCE_BASE,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_TAG,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_GOVERNANCE_ID,
  PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
} from "../governance-runtime/governance.constants";
import {
  assertEvolutionGovernanceReadinessReady,
  buildEvolutionGovernanceManifest,
  clearEvolutionGovernanceRuntimeLayer,
  evaluateEvolutionGovernanceReadiness,
} from "../governance-runtime/governance.manifest";
import {
  getEvolutionGovernanceRuntimeMetadata,
  isEvolutionGovernanceRuntimeMetadataIntact,
  validateEvolutionGovernance,
} from "../governance-runtime/governance.metadata";
import {
  registerEvolutionGovernance,
  updateEvolutionGovernanceStatus,
} from "../governance-runtime/governance.registry";
import {
  registerEvolutionGovernanceReview,
  updateEvolutionGovernanceReviewStatus,
} from "../governance-runtime/review.registry";
import { registerEvolutionGovernanceControlPolicy } from "../governance-runtime/governance.policy";
import { evaluateEvolutionGovernanceOversightContract } from "../governance-runtime/oversight.contract";

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

export const PRODUCT_EVOLUTION_GOVERNANCE_SIGNOFF_VERSION =
  "product-evolution-governance-signoff-1" as const;

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
  clearEvolutionGovernanceRuntimeLayer();
}

export function checkProductEvolutionGovernanceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getEvolutionGovernanceRuntimeMetadata();

  checks.push(
    check(
      "EVOGOV-CONSTANTS",
      "governance",
      "Product evolution governance version constants",
      PRODUCT_EVOLUTION_GOVERNANCE_ID ===
        "enterprise-product-evolution-governance-v1" &&
        PRODUCT_EVOLUTION_GOVERNANCE_VERSION ===
          "product-evolution-governance-1" &&
        PRODUCT_EVOLUTION_GOVERNANCE_BASE === PRODUCT_EVOLUTION_CAPABILITY_ID &&
        PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION ===
          "product-evolution-governance-freeze-1" &&
        PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_TAG ===
          "product-evolution-governance-freeze-1" &&
        EVOLUTION_GOVERNANCE_FRAME_KINDS.length === 6 &&
        EVOLUTION_GOVERNANCE_FRAME_STATUSES.length === 4 &&
        EVOLUTION_GOVERNANCE_REVIEW_KINDS.length === 6 &&
        EVOLUTION_GOVERNANCE_REVIEW_STATUSES.length === 4 &&
        EVOLUTION_GOVERNANCE_DOMAIN_SCOPES.length === 4 &&
        EVOLUTION_GOVERNANCE_OVERSIGHT_MODES.length === 3 &&
        EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS.length === 4 &&
        EVOLUTION_GOVERNANCE_CONTROL_POLICY_STATUSES.length === 3 &&
        EVOLUTION_GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        isEvolutionGovernanceRuntimeMetadataIntact(metadata),
      `id=${PRODUCT_EVOLUTION_GOVERNANCE_ID} base=${PRODUCT_EVOLUTION_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVOGOV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVOGOV-UPSTREAM",
      "compatibility",
      "Depends on Evolution capability chain",
      PRODUCT_EVOLUTION_GOVERNANCE_BASE ===
        "enterprise-product-evolution-capability-v1" &&
        PRODUCT_EVOLUTION_CAPABILITY_ID ===
          "enterprise-product-evolution-capability-v1",
      `capability=${PRODUCT_EVOLUTION_CAPABILITY_ID}`,
    ),
  );

  try {
    cleanup();

    const governance = registerEvolutionGovernance({
      id: "evogov.gate.frame",
      governanceKey: "DOMAIN_OVERSIGHT_FRAME",
      kind: "OVERSIGHT",
      scope: "DOMAIN",
      title: "Domain oversight governance frame",
      summary: "Declared oversight governance for domain review",
      capabilityRef: PRODUCT_EVOLUTION_CAPABILITY_ID,
    });
    const active = updateEvolutionGovernanceStatus({
      governanceId: governance.id,
      status: "ACTIVE",
    });
    const validation = validateEvolutionGovernance(active);
    const review = registerEvolutionGovernanceReview({
      id: "evogov.gate.rev",
      governanceId: governance.id,
      reviewKey: "APPROVE_DOMAIN_OVERSIGHT",
      kind: "APPROVE",
      summary: "Declared approve review for domain oversight",
    });
    const declared = updateEvolutionGovernanceReviewStatus({
      reviewId: review.id,
      status: "DECLARED",
    });
    const policy = registerEvolutionGovernanceControlPolicy({
      id: "evogov.gate.ctl",
      policyKey: "OVERSIGHT_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Oversight governance access control",
      governanceKeyRef: governance.governanceKey,
      ruleRef: "EVOGOV_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateEvolutionGovernanceOversightContract({
      id: "evogov.gate.os",
      contractKey: "OVERSIGHT_DOMAIN_LOOKUP",
      query: {
        queryKey: "DOMAIN_OVERSIGHT_Q",
        mode: "DECLARED",
        kind: "OVERSIGHT",
        reviewKind: "APPROVE",
        scope: "DOMAIN",
        governanceKeys: [governance.governanceKey],
      },
    });
    const manifest = buildEvolutionGovernanceManifest();
    const readiness = evaluateEvolutionGovernanceReadiness();

    const ok =
      governance.governanceKey === "DOMAIN_OVERSIGHT_FRAME" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.governanceKeyRef === "DOMAIN_OVERSIGHT_FRAME" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertEvolutionGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "EVOGOV-STACK",
          "evolution-governance",
          "Governance / review / control policy / oversight / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EVOGOV-STACK",
          "evolution-governance",
          "Governance / review / control policy / oversight / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product evolution governance not ready",
        ),
      );
    }

    checks.push(
      check(
        "EVOGOV-SCOPE",
        "scope",
        "No DB / deployment / execution / capability upgrade / tool runtime",
        ok &&
          metadata.declarationOnly === true &&
          metadata.excludes.includes("deployment-runtime") &&
          metadata.excludes.includes("execution-runtime") &&
          metadata.excludes.includes("capability-upgrade"),
        "evolution-governance-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product evolution governance probe failed";
    checks.push(
      check(
        "EVOGOV-STACK",
        "evolution-governance",
        "Governance / review / control policy / oversight / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "EVOGOV-SCOPE",
        "scope",
        "No DB / deployment / execution / capability upgrade / tool runtime",
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
      `product-evolution-governance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductEvolutionGovernanceReleaseGatePass(
  gate: ReleaseGateResult = checkProductEvolutionGovernanceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product evolution governance release gate failed: ${gate.summary}`,
    );
  }
}
