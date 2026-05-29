import type { GovernanceSimulation, GovernanceSimulationScenario } from "./intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { FederationRuntimeResult } from "../federation/federation-types";

const ALL_SCENARIOS: GovernanceSimulationScenario[] = [
  "policy_change",
  "node_loss",
  "consensus_degradation",
  "propagation_failure",
  "recovery_escalation",
];

function simulateScenario(
  scenario: GovernanceSimulationScenario,
  baseHealth: number,
  baseRisk: string,
): GovernanceSimulation {
  let delta = 0;
  let impact = "";
  switch (scenario) {
    case "policy_change":
      delta = -5;
      impact = "Policy change may temporarily reduce propagation sync rate";
      break;
    case "node_loss":
      delta = -20;
      impact = "Node loss degrades topology and fanout coverage";
      break;
    case "consensus_degradation":
      delta = -18;
      impact = "Consensus degradation increases quorum failure risk";
      break;
    case "propagation_failure":
      delta = -15;
      impact = "Propagation failure isolates policy bundles across domains";
      break;
    case "recovery_escalation":
      delta = -10;
      impact = "Recovery escalation indicates ongoing stabilization need";
      break;
  }
  const projectedHealthScore = Math.max(0, Math.min(100, baseHealth + delta));
  const projectedRisk =
    projectedHealthScore < 40 ? "critical" : projectedHealthScore < 60 ? "high" : projectedHealthScore < 75 ? "medium" : "low";

  return {
    simulationId: `sim-${scenario}`,
    scenario,
    projectedHealthScore,
    projectedRisk,
    impactSummary: impact,
  };
}

export function runGovernanceSimulations(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  federation: FederationRuntimeResult;
  focusScenario?: GovernanceSimulationScenario;
}): GovernanceSimulation[] {
  const baseHealth = input.observability.health.healthScore;
  const baseRisk = input.observability.risk.overallRisk;
  const scenarios = input.focusScenario ? [input.focusScenario] : ALL_SCENARIOS;
  return scenarios.map((scenario) => simulateScenario(scenario, baseHealth, baseRisk));
}
