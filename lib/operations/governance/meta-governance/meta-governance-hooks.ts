import type { GovernanceMetaGovernanceHookEvent } from "./meta-governance-types";

export function runGovernanceMetaGovernanceHooks(input: {
  inventoryCount: number;
  decisionCount: number;
  overComplex: boolean;
}): GovernanceMetaGovernanceHookEvent[] {
  return [
    { phase: "beforeMechanismInventory", payload: "scanning-governance-mechanisms" },
    { phase: "afterMechanismInventory", payload: `entries=${input.inventoryCount}` },
    { phase: "beforeEvolutionAssessment", payload: "assessing-evolution-vectors" },
    {
      phase: "afterEvolutionAssessment",
      payload: `overComplex=${input.overComplex}`,
    },
    { phase: "beforeEvolutionDecisions", payload: "deriving-evolution-decisions" },
    { phase: "afterEvolutionDecisions", payload: `decisions=${input.decisionCount}` },
  ];
}
