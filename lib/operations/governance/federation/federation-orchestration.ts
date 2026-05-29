import type { GovernanceOrchestrationRuntimeResult } from "../orchestration.types";
import type { FederationDomain, FederationOrchestrationPlan } from "./federation-types";

export function buildFederationOrchestrationPlan(input: {
  deploymentId: string;
  orchestration: GovernanceOrchestrationRuntimeResult;
  sourceDomain: FederationDomain;
  targetDomains: FederationDomain[];
}): FederationOrchestrationPlan {
  const coordinated = [input.sourceDomain.domainId, ...input.targetDomains.map((d) => d.domainId)];
  const steps = [
    "cross-domain-policy-validation",
    ...input.orchestration.plan.steps.map((s) => `federated-${s.action}`),
    "distributed-governance-coordination",
    "response-aggregation",
  ];
  return {
    planId: `fed-orch-${input.deploymentId}`,
    coordinatedDomains: coordinated,
    steps,
    crossRuntime: coordinated.length > 1,
  };
}
