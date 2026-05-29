import {
  GOVERNANCE_META_GOVERNANCE_RUNTIME_VERSION,
  type GovernanceMetaGovernanceRuntimeInput,
  type GovernanceMetaGovernanceRuntimeResult,
  type MetaGovernanceStatus,
} from "./meta-governance-types";
import { buildGovernanceMechanismInventory } from "./meta-governance-inventory";
import { assessGovernanceComplexity } from "./meta-governance-complexity";
import { assessGovernanceEvolution } from "./meta-governance-assessment";
import { deriveGovernanceEvolutionDecisions } from "./meta-governance-evolution";
import { buildGovernanceStandardizationPlan } from "./meta-governance-standardization";
import { computeGovernanceMetaGovernanceScore } from "./meta-governance-score";
import { buildGovernanceMetaGovernanceLineageGraph } from "./meta-governance-lineage";
import { buildGovernanceMetaGovernanceAuditRecords } from "./meta-governance-audit";
import { runGovernanceMetaGovernanceHooks } from "./meta-governance-hooks";

export function buildGovernanceMetaGovernanceRuntime(
  input: GovernanceMetaGovernanceRuntimeInput,
): GovernanceMetaGovernanceRuntimeResult {
  const inventory = buildGovernanceMechanismInventory(input);
  const complexity = assessGovernanceComplexity({
    deploymentId: input.deploymentId,
    inventory,
    selfOptimization: input.selfOptimization,
  });
  const assessment = assessGovernanceEvolution({
    deploymentId: input.deploymentId,
    inventory,
    complexity,
  });
  const decisions = deriveGovernanceEvolutionDecisions({
    deploymentId: input.deploymentId,
    inventory,
    assessment,
    selfOptimization: input.selfOptimization,
    autonomous: input.autonomous,
  });
  const standardization = buildGovernanceStandardizationPlan({
    deploymentId: input.deploymentId,
    assessment,
    decisions,
  });
  const metaScore = computeGovernanceMetaGovernanceScore({
    deploymentId: input.deploymentId,
    assessment,
    decisions,
    complexity,
  });

  const lineage = buildGovernanceMetaGovernanceLineageGraph({
    deploymentId: input.deploymentId,
    inventory,
    assessment,
    decisions,
    complexity,
    standardization,
    metaScore,
  });

  const metaGovernanceId = `governance-meta-governance-${input.deploymentId}`;
  const federationId = input.selfOptimization.feedback.federationId;
  const audit = buildGovernanceMetaGovernanceAuditRecords({
    metaGovernanceId,
    federationId,
    decisionCount: decisions.length,
    overComplex: assessment.overComplex,
    metaScore,
  });
  const hooks = runGovernanceMetaGovernanceHooks({
    inventoryCount: inventory.length,
    decisionCount: decisions.length,
    overComplex: assessment.overComplex,
  });

  let status: MetaGovernanceStatus = "stabilizing";
  const freezeCount = decisions.filter((d) => d.action === "freeze").length;
  const mergeCount = decisions.filter((d) => d.action === "merge").length;
  const retireCount = decisions.filter((d) => d.action === "retire" || d.action === "deprecate").length;

  if (freezeCount >= 2) status = "frozen";
  else if (mergeCount >= 2 || assessment.overComplex) status = "consolidating";
  else if (retireCount > 0 || decisions.some((d) => d.action === "upgrade")) status = "evolving";

  const traceId = `governance-meta-governance-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_META_GOVERNANCE_RUNTIME_VERSION,
    registry: { metaGovernanceId, evolutionCycle: 1 },
    inventory,
    assessment,
    decisions,
    complexity,
    standardization,
    metaScore,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `meta-governance-summary-${Date.now()}`,
      text: `meta=${metaGovernanceId} inventory=${inventory.length} overComplex=${assessment.overComplex} decisions=${decisions.length} freeze=${freezeCount} standardize=${decisions.filter((d) => d.action === "standardize").length} composite=${metaScore.compositeScore} status=${status}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_META_GOVERNANCE_RUNTIME_VERSION };
