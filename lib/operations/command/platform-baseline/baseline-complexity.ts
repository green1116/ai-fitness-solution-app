import type {
  CommandCapabilityClassification,
  CommandCapabilityDependencyGraph,
  CommandCapabilityInventoryEntry,
  CommandComplexityReport,
} from "./baseline-types";
import type { GatedBridgeOrchestratorResult } from "../gated-orchestrator/types";
import type { HITLBridgeCoordinationRuntimeResult } from "../hitl-bridge/types";
import { computeCommandDependencyDepth } from "./baseline-dependency";

export function buildCommandComplexityReport(input: {
  deploymentId: string;
  inventory: CommandCapabilityInventoryEntry[];
  classifications: CommandCapabilityClassification[];
  dependencyGraph: CommandCapabilityDependencyGraph;
  coordination: HITLBridgeCoordinationRuntimeResult;
  orchestrator: GatedBridgeOrchestratorResult;
}): CommandComplexityReport {
  const capabilityCount = input.inventory.length;
  const tierCount = input.classifications.length;
  const dependencyDepth = computeCommandDependencyDepth(input.dependencyGraph);
  const gateAdmitted = input.coordination.admittedIntentIds.length;
  const gateBlocked = input.coordination.blockedIntentIds.length;
  const orchestrationModes = 4;

  const complexityScore = Math.round(
    dependencyDepth * 10 + tierCount * 5 + gateBlocked * 2 + input.orchestrator.orchestrator.plan.steps.length * 0.5,
  );

  let verdict: CommandComplexityReport["verdict"] = "baseline-acceptable";
  if (complexityScore >= 60 || gateBlocked > gateAdmitted) verdict = "baseline-excessive";
  else if (complexityScore >= 35 || input.orchestrator.status === "partial") verdict = "baseline-elevated";

  const findings: string[] = [
    `capabilities=${capabilityCount}`,
    `tiers=${tierCount}`,
    `dependencyDepth=${dependencyDepth}`,
    `gateAdmitted=${gateAdmitted}`,
    `gateBlocked=${gateBlocked}`,
    `orchestrator=${input.orchestrator.orchestrator.mode}`,
  ];

  return {
    reportId: `command-complexity-report-${input.deploymentId}`,
    capabilityCount,
    tierCount,
    dependencyDepth,
    gateAdmitted,
    gateBlocked,
    orchestrationModes,
    complexityScore,
    verdict,
    findings,
  };
}
