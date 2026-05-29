import type { FederationLifecyclePhase, FederationRetirementArchivalResult } from "./continuity-types";

export function coordinateFederationRetirementArchival(input: {
  deploymentId: string;
  globalPhase: FederationLifecyclePhase;
  domainLifecycle: { domainId: string; phase: FederationLifecyclePhase }[];
}): FederationRetirementArchivalResult {
  let retiredDomains = input.domainLifecycle
    .filter((d) => d.phase === "retiring")
    .map((d) => d.domainId);
  let archivedDomains = input.domainLifecycle
    .filter((d) => d.phase === "archived")
    .map((d) => d.domainId);

  if (input.globalPhase === "archived" && archivedDomains.length === 0) {
    archivedDomains = input.domainLifecycle.map((d) => d.domainId);
  }
  if (input.globalPhase === "retiring" && retiredDomains.length === 0) {
    retiredDomains = input.domainLifecycle
      .filter((d) => d.phase === "degraded" || d.phase === "frozen")
      .map((d) => d.domainId);
  }

  return {
    retirementId: `federation-retirement-${input.deploymentId}`,
    retiredDomains,
    archivedDomains,
    archivalComplete: input.globalPhase === "archived" || archivedDomains.length > 0,
  };
}
