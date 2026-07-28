/**
 * Product M15 — Evolution Optimization Engine Release Gate
 * MODULE: Enterprise Evolution Optimization (M15-P5)
 * BASE: enterprise-product-evolution-learning-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_LEARNING_ID } from "../learning-runtime/learning.constants";
import {
  EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS,
  EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES,
  EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES,
  EVOLUTION_OPTIMIZATION_EVALUATION_MODES,
  EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS,
  EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES,
  EVOLUTION_OPTIMIZATION_READINESS_VERDICTS,
  PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_TAG,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_OPTIMIZATION_ID,
  PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
} from "../optimization-runtime/optimization.constants";
import {
  assertEvolutionOptimizationReadinessReady,
  buildEvolutionOptimizationManifest,
  clearEvolutionOptimizationLayer,
  evaluateEvolutionOptimizationReadiness,
} from "../optimization-runtime/optimization.manifest";
import {
  getEvolutionOptimizationMetadata,
  isEvolutionOptimizationMetadataIntact,
  validateEvolutionOptimizationProposal,
} from "../optimization-runtime/optimization.metadata";
import {
  registerEvolutionOptimizationProposal,
  updateEvolutionOptimizationProposalStatus,
} from "../optimization-runtime/optimization.registry";
import {
  registerEvolutionOptimizationCapability,
  updateEvolutionOptimizationCapabilityStatus,
} from "../optimization-runtime/capability.registry";
import { registerEvolutionOptimizationGovernancePolicy } from "../optimization-runtime/governance.policy";
import { evaluateEvolutionOptimizationEvaluationContract } from "../optimization-runtime/evaluation.contract";

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

export const PRODUCT_EVOLUTION_OPTIMIZATION_SIGNOFF_VERSION =
  "product-evolution-optimization-signoff-1" as const;

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
  clearEvolutionOptimizationLayer();
}

export function checkProductEvolutionOptimizationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getEvolutionOptimizationMetadata();

  checks.push(
    check(
      "EVOPT-CONSTANTS",
      "optimization",
      "Product evolution optimization version constants",
      PRODUCT_EVOLUTION_OPTIMIZATION_ID ===
        "enterprise-product-evolution-optimization-v1" &&
        PRODUCT_EVOLUTION_OPTIMIZATION_VERSION ===
          "product-evolution-optimization-1" &&
        PRODUCT_EVOLUTION_OPTIMIZATION_BASE === PRODUCT_EVOLUTION_LEARNING_ID &&
        PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION ===
          "product-evolution-optimization-freeze-1" &&
        PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_TAG ===
          "product-evolution-optimization-freeze-1" &&
        EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS.length === 6 &&
        EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES.length === 4 &&
        EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS.length === 6 &&
        EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES.length === 4 &&
        EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES.length === 4 &&
        EVOLUTION_OPTIMIZATION_EVALUATION_MODES.length === 3 &&
        EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS.length === 4 &&
        EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        EVOLUTION_OPTIMIZATION_READINESS_VERDICTS.length === 3 &&
        isEvolutionOptimizationMetadataIntact(metadata),
      `id=${PRODUCT_EVOLUTION_OPTIMIZATION_ID} base=${PRODUCT_EVOLUTION_OPTIMIZATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVOPT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVOPT-UPSTREAM",
      "compatibility",
      "Depends on Evolution learning chain",
      PRODUCT_EVOLUTION_OPTIMIZATION_BASE ===
        "enterprise-product-evolution-learning-v1" &&
        PRODUCT_EVOLUTION_LEARNING_ID ===
          "enterprise-product-evolution-learning-v1",
      `learning=${PRODUCT_EVOLUTION_LEARNING_ID}`,
    ),
  );

  try {
    cleanup();

    const proposal = registerEvolutionOptimizationProposal({
      id: "evopt.gate.prop",
      proposalKey: "DOMAIN_COST_PROPOSAL",
      kind: "COST",
      scope: "DOMAIN",
      title: "Domain cost optimization proposal",
      summary: "Declared cost optimization proposal for domain evaluation",
      learningRef: PRODUCT_EVOLUTION_LEARNING_ID,
    });
    const active = updateEvolutionOptimizationProposalStatus({
      proposalId: proposal.id,
      status: "ACTIVE",
    });
    const validation = validateEvolutionOptimizationProposal(active);
    const capability = registerEvolutionOptimizationCapability({
      id: "evopt.gate.cap",
      proposalId: proposal.id,
      capabilityKey: "SCORE_DOMAIN_COST",
      kind: "SCORE",
      summary: "Declared score capability for domain cost proposals",
    });
    const declared = updateEvolutionOptimizationCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const policy = registerEvolutionOptimizationGovernancePolicy({
      id: "evopt.gate.gov",
      policyKey: "COST_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Cost proposal access control",
      proposalKeyRef: proposal.proposalKey,
      ruleRef: "EVOPT_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateEvolutionOptimizationEvaluationContract({
      id: "evopt.gate.ev",
      contractKey: "COST_DOMAIN_LOOKUP",
      query: {
        queryKey: "DOMAIN_COST_Q",
        mode: "DECLARED",
        kind: "COST",
        capabilityKind: "SCORE",
        scope: "DOMAIN",
        proposalKeys: [proposal.proposalKey],
      },
    });
    const manifest = buildEvolutionOptimizationManifest();
    const readiness = evaluateEvolutionOptimizationReadiness();

    const ok =
      proposal.proposalKey === "DOMAIN_COST_PROPOSAL" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.proposalKeyRef === "DOMAIN_COST_PROPOSAL" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertEvolutionOptimizationReadinessReady(readiness);
      checks.push(
        check(
          "EVOPT-STACK",
          "evolution-optimization",
          "Proposal / capability / governance / evaluation / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EVOPT-STACK",
          "evolution-optimization",
          "Proposal / capability / governance / evaluation / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product evolution optimization not ready",
        ),
      );
    }

    checks.push(
      check(
        "EVOPT-SCOPE",
        "scope",
        "No DB / execution / deployment / automation / tool runtime",
        ok &&
          metadata.declarationOnly === true &&
          metadata.excludes.includes("execution-runtime") &&
          metadata.excludes.includes("deployment-runtime") &&
          metadata.excludes.includes("automation-runtime"),
        "evolution-optimization-proposal-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product evolution optimization probe failed";
    checks.push(
      check(
        "EVOPT-STACK",
        "evolution-optimization",
        "Proposal / capability / governance / evaluation / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "EVOPT-SCOPE",
        "scope",
        "No DB / execution / deployment / automation / tool runtime",
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
      `product-evolution-optimization-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductEvolutionOptimizationReleaseGatePass(
  gate: ReleaseGateResult = checkProductEvolutionOptimizationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product evolution optimization release gate failed: ${gate.summary}`,
    );
  }
}
