import type { GovernanceEvolutionDecision } from "./meta-governance-types";
import type { GovernanceEvolutionAssessment } from "./meta-governance-types";
import type { GovernanceMechanismInventoryEntry } from "./meta-governance-types";
import type { GovernanceSelfOptimizationRuntimeResult } from "../self-optimization/optimization-types";
import type { GovernanceAutonomousRuntimeResult } from "../autonomous/autonomous-types";
import {
  evolutionActionFromScores,
  lifecyclePhaseFromAction,
  MERGE_CANDIDATE_PAIRS,
  priorityFromAction,
} from "./meta-governance-registry";

export function deriveGovernanceEvolutionDecisions(input: {
  deploymentId: string;
  inventory: GovernanceMechanismInventoryEntry[];
  assessment: GovernanceEvolutionAssessment;
  selfOptimization: GovernanceSelfOptimizationRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
}): GovernanceEvolutionDecision[] {
  const approvalBlocked = input.autonomous.approval.status === "blocked";
  const loopClosed = input.selfOptimization.loopClosed;
  const mechanismByModule = new Map(
    input.selfOptimization.mechanisms.map((m) => [m.module, m]),
  );
  const moduleOpt = new Map(
    input.selfOptimization.modules.map((m) => [m.moduleName, m]),
  );

  const decisions: GovernanceEvolutionDecision[] = input.inventory.map((entry) => {
    const mechanism = mechanismByModule.get(entry.module);
    const effectiveness = mechanism?.effectiveness ?? "medium";
    const trend = mechanism?.trend ?? "stable";
    const tuningPressure = moduleOpt.get(entry.module)?.shouldOptimize ?? false;

    let action = evolutionActionFromScores({
      score: entry.effectivenessScore,
      effectiveness,
      trend,
      tuningPressure,
      loopClosed,
      approvalBlocked,
    });

    let mergeTarget: string | undefined;
    if (action === "merge") {
      const pair = MERGE_CANDIDATE_PAIRS.find(([a, b]) => a === entry.module || b === entry.module);
      if (pair) {
        mergeTarget = pair[0] === entry.module ? pair[1] : pair[0];
      } else {
        action = "upgrade";
      }
    }

    if (
      input.assessment.standardizationReady.includes(entry.module) &&
      action === "retain"
    ) {
      action = "standardize";
    }

    if (input.assessment.overComplex && entry.complexityIndex >= 70 && action === "retain") {
      action = "upgrade";
    }

    const lifecyclePhase = lifecyclePhaseFromAction(action);

    return {
      decisionId: `evolution-${entry.module}-${input.deploymentId}`,
      mechanismId: entry.mechanismId,
      module: entry.module,
      action,
      lifecyclePhase,
      priority: priorityFromAction(action),
      reason: `${effectiveness}/${trend} score=${entry.effectivenessScore} complex=${entry.complexityIndex}`,
      mergeTarget,
    };
  });

  return decisions;
}
