import { AUTONOMOUS_COMMAND_PLATFORM_VERSION } from "../types";
import { COMMAND_EXECUTION_BRIDGE_VERSION } from "../bridge/types";
import { HUMAN_IN_THE_LOOP_COMMAND_VERSION } from "../hitl/types";
import { HITL_BRIDGE_COORDINATION_VERSION } from "../hitl-bridge/types";
import { COMMAND_PLATFORM_API_VERSION } from "../api/types";
import { GATED_BRIDGE_ORCHESTRATOR_VERSION } from "../gated-orchestrator/types";
import type {
  CommandCapabilityInventoryEntry,
  CommandCapabilityVersionSnapshot,
  CommandPlatformBaselineRuntimeInput,
} from "./baseline-types";
import { COMMAND_PLATFORM_CAPABILITY_CATALOG } from "./baseline-registry";

export function buildCommandCapabilityInventory(
  input: CommandPlatformBaselineRuntimeInput,
): CommandCapabilityInventoryEntry[] {
  const versionById = new Map(
    input.capabilities.map((entry) => [entry.capabilityId, entry]),
  );

  return COMMAND_PLATFORM_CAPABILITY_CATALOG.map((catalog) => {
    const snapshot = versionById.get(catalog.capabilityId);
    const version = snapshot?.version ?? "missing";
    const present = Boolean(snapshot?.version);

    return {
      entryId: `command-capability-inventory-${catalog.capabilityId}-${input.deploymentId}`,
      capabilityId: catalog.capabilityId,
      releaseTag: catalog.releaseTag,
      label: catalog.label,
      tier: catalog.tier,
      capabilityClass: catalog.capabilityClass,
      version,
      present,
      frozen: present,
    };
  });
}

export function collectCommandCapabilityVersions(input: {
  commandVersion: string;
  bridgeVersion: string;
  hitlVersion: string;
  coordinationVersion: string;
  apiVersion: string;
  orchestratorVersion: string;
}): CommandCapabilityVersionSnapshot[] {
  return [
    { capabilityId: "command-foundation", version: input.commandVersion },
    { capabilityId: "command-execution-bridge", version: input.bridgeVersion },
    { capabilityId: "command-hitl-control", version: input.hitlVersion },
    { capabilityId: "command-hitl-bridge", version: input.coordinationVersion },
    { capabilityId: "command-platform-api", version: input.apiVersion },
    { capabilityId: "command-gated-orchestrator", version: input.orchestratorVersion },
  ];
}

export function collectCommandCapabilityVersionsFromRuntimes(): CommandCapabilityVersionSnapshot[] {
  return collectCommandCapabilityVersions({
    commandVersion: AUTONOMOUS_COMMAND_PLATFORM_VERSION,
    bridgeVersion: COMMAND_EXECUTION_BRIDGE_VERSION,
    hitlVersion: HUMAN_IN_THE_LOOP_COMMAND_VERSION,
    coordinationVersion: HITL_BRIDGE_COORDINATION_VERSION,
    apiVersion: COMMAND_PLATFORM_API_VERSION,
    orchestratorVersion: GATED_BRIDGE_ORCHESTRATOR_VERSION,
  });
}
