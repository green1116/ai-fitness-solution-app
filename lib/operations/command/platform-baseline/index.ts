export * from "./baseline-types";
export * from "./baseline-registry";
export * from "./baseline-inventory";
export * from "./baseline-classification";
export * from "./baseline-dependency";
export * from "./baseline-complexity";
export * from "./baseline-report";
export * from "./baseline-release";
export * from "./baseline-lineage";
export * from "./baseline-audit";
export * from "./baseline-hooks";
export * from "./baseline-runtime";
export * from "./baseline-endpoint";

import { buildCommandPlatformStack } from "../api/stack";
import { buildGatedBridgeOrchestrator } from "../gated-orchestrator";
import {
  V4A5_COMMAND_PLATFORM_VERSION,
  type CommandPlatformBaselineRuntimeInput,
  type CommandPlatformBaselineRuntimeResult,
} from "./baseline-types";
import {
  buildCommandPlatformBaselineRuntime,
  COMMAND_PLATFORM_BASELINE_VERSION,
} from "./baseline-runtime";
import {
  collectCommandCapabilityVersions,
  collectCommandCapabilityVersionsFromRuntimes,
} from "./baseline-inventory";

export function buildCommandPlatformBaselineFromStack(input: {
  deploymentId: string;
}): CommandPlatformBaselineRuntimeResult {
  const stack = buildCommandPlatformStack(input.deploymentId);
  const orchestrator = buildGatedBridgeOrchestrator({
    deploymentId: input.deploymentId,
    stack,
    mode: "orchestration-only",
  });

  const capabilities = collectCommandCapabilityVersions({
    commandVersion: stack.command.version,
    bridgeVersion: stack.bridge.version,
    hitlVersion: stack.hitl.version,
    coordinationVersion: stack.coordination.version,
    apiVersion: "v4-a5-a4-command-platform-api-1",
    orchestratorVersion: orchestrator.version,
  });

  const baselineInput: CommandPlatformBaselineRuntimeInput = {
    deploymentId: input.deploymentId,
    platformVersion: V4A5_COMMAND_PLATFORM_VERSION,
    capabilities,
    coordination: stack.coordination,
    orchestrator,
  };

  return buildCommandPlatformBaselineRuntime(baselineInput);
}

export {
  buildCommandPlatformBaselineRuntime,
  COMMAND_PLATFORM_BASELINE_VERSION,
  collectCommandCapabilityVersions,
  collectCommandCapabilityVersionsFromRuntimes,
};
