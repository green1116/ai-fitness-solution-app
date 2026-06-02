import type { FederationActivationResult } from "./continuity-types";
import type { FederationDomainLifecycleState } from "./continuity-types";

export function coordinateFederationActivation(input: {
  deploymentId: string;
  domainLifecycle: FederationDomainLifecycleState[];
}): FederationActivationResult {
  const activatedDomains = input.domainLifecycle
    .filter((d) => d.activated)
    .map((d) => d.domainId);
  const deactivatedDomains = input.domainLifecycle
    .filter((d) => !d.activated)
    .map((d) => d.domainId);

  let activationMode: FederationActivationResult["activationMode"] = "full";
  if (deactivatedDomains.length > 0 && activatedDomains.length > 0) activationMode = "partial";
  else if (activatedDomains.length === 0) activationMode = "restricted";

  return {
    activationId: `federation-activation-${input.deploymentId}`,
    activatedDomains,
    deactivatedDomains,
    activationMode,
  };
}
