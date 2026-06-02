import type { AutonomousCommandRuntimeResult } from "../types";
import type { BridgeAdmissionDecision, BridgeGate, BridgeGateState } from "./types";

export function buildBridgeGate(input: {
  deploymentId: string;
  command: AutonomousCommandRuntimeResult;
  admissionDecisions: BridgeAdmissionDecision[];
}): BridgeGate {
  const admittedIntentIds = input.admissionDecisions
    .filter((d) => d.outcome === "admit")
    .map((d) => d.intentId);

  const blockedIntentIds = input.admissionDecisions
    .filter((d) => d.outcome === "block")
    .map((d) => d.intentId);

  let state: BridgeGateState = "closed";
  if (admittedIntentIds.length === input.command.intents.length && admittedIntentIds.length > 0) {
    state = "open";
  } else if (admittedIntentIds.length > 0) {
    state = "partial";
  } else if (input.command.intents.length === 0) {
    state = "closed";
  }

  const openDomains = new Set<string>();
  for (const intent of input.command.intents) {
    if (!admittedIntentIds.includes(intent.intentId)) continue;
    if (intent.domain === "cross-domain" || intent.domain === "platform") {
      openDomains.add("execution");
      openDomains.add("change");
    } else {
      openDomains.add(intent.domain);
    }
  }

  return {
    gateId: `bridge-gate-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    state,
    admittedIntentIds,
    blockedIntentIds,
    openDomains: [...openDomains],
    summary: `state=${state} admitted=${admittedIntentIds.length} blocked=${blockedIntentIds.length}`,
  };
}
