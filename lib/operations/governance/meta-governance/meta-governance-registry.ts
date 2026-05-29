import type {
  GovernanceEvolutionAction,
  GovernanceMechanismLifecyclePhase,
} from "./meta-governance-types";

export function evolutionActionFromScores(input: {
  score: number;
  effectiveness: "high" | "medium" | "low" | "ineffective";
  trend: "improving" | "stable" | "declining";
  tuningPressure: boolean;
  loopClosed: boolean;
  approvalBlocked: boolean;
}): GovernanceEvolutionAction {
  if (input.approvalBlocked && input.score < 55) return "freeze";
  if (input.effectiveness === "ineffective" || input.score < 25) return "retire";
  if (input.effectiveness === "low" && input.trend === "declining") return "deprecate";
  if (input.score >= 85 && input.effectiveness === "high") return "standardize";
  if (input.score >= 70 && input.trend === "improving") return "retain";
  if (input.tuningPressure || input.effectiveness === "low") return "upgrade";
  if (!input.loopClosed && input.score < 50) return "merge";
  return "retain";
}

export function lifecyclePhaseFromAction(
  action: GovernanceEvolutionAction,
): GovernanceMechanismLifecyclePhase {
  if (action === "standardize") return "standardization-candidate";
  if (action === "freeze") return "freeze-candidate";
  if (action === "retire" || action === "deprecate") return "retirement-candidate";
  return "active";
}

export function priorityFromAction(
  action: GovernanceEvolutionAction,
): "low" | "medium" | "high" | "critical" {
  if (action === "retire" || action === "deprecate") return "critical";
  if (action === "freeze" || action === "upgrade") return "high";
  if (action === "merge" || action === "standardize") return "medium";
  return "low";
}

export const MERGE_CANDIDATE_PAIRS: [string, string][] = [
  ["policy-propagation", "lifecycle-continuity"],
  ["observability", "intelligence"],
  ["federation", "consensus"],
];
