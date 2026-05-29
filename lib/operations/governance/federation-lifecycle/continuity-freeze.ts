import type { FederationFreezeThawResult } from "./continuity-types";
import type { PolicyPropagationRuntimeResult } from "../federation-policy/propagation-types";

export function coordinateFederationFreezeThaw(input: {
  deploymentId: string;
  policyPropagation: PolicyPropagationRuntimeResult;
  domainLifecycle: { domainId: string; phase: string }[];
}): FederationFreezeThawResult {
  const frozenDomains = [
    ...input.policyPropagation.freeze.frozenDomains,
    ...input.domainLifecycle.filter((d) => d.phase === "frozen").map((d) => d.domainId),
  ].filter((id, i, arr) => arr.indexOf(id) === i);

  const thawedDomains = input.domainLifecycle
    .filter((d) => d.phase === "active" || d.phase === "recovering")
    .map((d) => d.domainId)
    .filter((id) => !frozenDomains.includes(id));

  const thawEligible =
    input.policyPropagation.status !== "frozen" &&
    frozenDomains.length > 0 &&
    thawedDomains.length > 0;

  return {
    continuityId: `federation-freeze-thaw-${input.deploymentId}`,
    frozenDomains,
    thawedDomains,
    thawEligible,
  };
}
