import type { FederationLifecycleObservability } from "./observability-types";
import type { LifecycleContinuityRuntimeResult } from "../federation-lifecycle/continuity-types";

export function observeFederationLifecycle(input: {
  deploymentId: string;
  lifecycleContinuity: LifecycleContinuityRuntimeResult;
}): FederationLifecycleObservability {
  const domains = input.lifecycleContinuity.domainLifecycle;
  return {
    observabilityId: `lifecycle-observability-${input.deploymentId}`,
    activeDomains: domains.filter((d) => d.phase === "active").length,
    frozenDomains: domains.filter((d) => d.phase === "frozen").length,
    recoveringDomains: domains.filter((d) => d.phase === "recovering").length,
    retiringDomains: domains.filter((d) => d.phase === "retiring").length,
    archivedDomains: domains.filter((d) => d.phase === "archived").length,
  };
}
