import type {
  FederationContinuityHandoff,
  FederationLifecycleHookEvent,
  FederationLifecyclePhase,
  FederationRetirementArchivalResult,
} from "./continuity-types";

export function runFederationLifecycleHooks(input: {
  sourceDomainId: string;
  phase: FederationLifecyclePhase;
  handoff: FederationContinuityHandoff;
  retirement: FederationRetirementArchivalResult;
}): FederationLifecycleHookEvent[] {
  const events: FederationLifecycleHookEvent[] = [
    {
      phase: "beforeLifecycleTransition",
      domainId: input.sourceDomainId,
      payload: `targetPhase=${input.phase}`,
    },
    {
      phase: "afterLifecycleTransition",
      domainId: input.sourceDomainId,
      payload: `phase=${input.phase}`,
    },
  ];

  if (input.handoff.continuityPreserved) {
    events.push({
      phase: "beforeContinuityHandoff",
      domainId: input.handoff.sourceDomainId,
      payload: `target=${input.handoff.targetDomainId}`,
    });
    events.push({
      phase: "afterContinuityHandoff",
      domainId: input.handoff.targetDomainId,
      payload: input.handoff.handoffReason,
    });
  }

  if (input.retirement.retiredDomains.length > 0 || input.retirement.archivalComplete) {
    events.push({
      phase: "beforeFederationRetirement",
      domainId: input.sourceDomainId,
      payload: `retired=${input.retirement.retiredDomains.length}`,
    });
    events.push({
      phase: "afterFederationRetirement",
      domainId: input.sourceDomainId,
      payload: `archived=${input.retirement.archivedDomains.length}`,
    });
  }

  return events;
}
