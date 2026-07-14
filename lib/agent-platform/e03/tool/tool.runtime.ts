/**
 * E03-P3 — Tool Runtime facade (clean API surface)
 */

import {
  E03_TOOL_RUNTIME_BASE,
  E03_TOOL_RUNTIME_FREEZE_VERSION,
  E03_TOOL_RUNTIME_ID,
  E03_TOOL_RUNTIME_VERSION,
} from "./tool.constants";
import type { ToolContract } from "./tool.contract";
import {
  createToolRequest,
  executeTool,
  executeToolOrThrow,
  type ToolExecuteBundle,
} from "./tool.executor";
import {
  buildToolRegistryManifest,
  getToolById,
  TOOL_CATALOG,
} from "./tool.registry";
import type { ToolCaller, ToolInput, ToolMetadata, ToolRuntimeIdentity } from "./tool.types";

export type ToolRuntimeRunInput = {
  toolId: string;
  caller: ToolCaller;
  input?: ToolInput;
  metadata?: ToolMetadata;
  requestId?: string;
};

export type ToolRuntimeRunResult = ToolExecuteBundle & {
  identity: ToolRuntimeIdentity;
  summary: string;
};

export function getToolRuntimeIdentity(): ToolRuntimeIdentity {
  return {
    runtimeId: E03_TOOL_RUNTIME_ID,
    version: E03_TOOL_RUNTIME_VERSION,
    freezeVersion: E03_TOOL_RUNTIME_FREEZE_VERSION,
  };
}

export function listRegisteredTools(): ToolContract[] {
  return [...TOOL_CATALOG];
}

export function runTool(input: ToolRuntimeRunInput): ToolRuntimeRunResult {
  const contract = getToolById(input.toolId);
  if (!contract) {
    throw new Error(`Unknown tool: ${input.toolId}`);
  }

  const request = createToolRequest({
    toolId: input.toolId,
    caller: input.caller,
    input: input.input,
    metadata: input.metadata,
    requestId: input.requestId,
  });

  const bundle = executeTool(contract, request);
  const identity = getToolRuntimeIdentity();

  return {
    ...bundle,
    identity,
    summary: [
      `e03-tool-runtime ready=${bundle.result.success}`,
      `runtime=${identity.runtimeId}`,
      `base=${E03_TOOL_RUNTIME_BASE}`,
      `tool=${input.toolId}`,
      `status=${bundle.result.status}`,
      `phase=${bundle.phase.phase}`,
      `trace=${bundle.trace.traceId}`,
    ].join(" "),
  };
}

export function runToolOrThrow(
  input: ToolRuntimeRunInput,
): ToolRuntimeRunResult & {
  result: ToolExecuteBundle["result"] & { success: true; status: "result" };
} {
  const contract = getToolById(input.toolId);
  if (!contract) {
    throw new Error(`Unknown tool: ${input.toolId}`);
  }

  const request = createToolRequest({
    toolId: input.toolId,
    caller: input.caller,
    input: input.input,
    metadata: input.metadata,
    requestId: input.requestId,
  });

  const bundle = executeToolOrThrow(contract, request);
  const identity = getToolRuntimeIdentity();

  return {
    ...bundle,
    identity,
    summary: [
      `e03-tool-runtime ready=true`,
      `runtime=${identity.runtimeId}`,
      `tool=${input.toolId}`,
      `status=result`,
    ].join(" "),
  };
}

export function buildToolRuntimeBootstrap() {
  const registry = buildToolRegistryManifest();
  const identity = getToolRuntimeIdentity();
  return {
    identity,
    base: E03_TOOL_RUNTIME_BASE,
    registry,
    ready: registry.catalogComplete,
    summary: [
      `tool-runtime-bootstrap ready=${registry.catalogComplete}`,
      `tools=${registry.toolCount}`,
      `runtime=${identity.runtimeId}`,
      `base=${E03_TOOL_RUNTIME_BASE}`,
    ].join(" "),
  };
}

// Clean re-exports for consumers
export {
  assertToolContract,
  validateToolInput,
} from "./tool.contract";
export {
  assertToolPermission,
  evaluateToolPermission,
} from "./tool.permission";
export {
  assertToolExecutionResultPass,
  buildToolExecutionResult,
} from "./tool.result";
export {
  appendToolTraceEvent,
  createToolRuntimeTrace,
} from "./tool.trace";
export {
  advanceToolPhase,
  canAdvanceToolPhase,
  createPendingToolPhaseState,
  createToolRequest,
  executeTool,
  executeToolOrThrow,
} from "./tool.executor";
export {
  buildToolRegistryManifest,
  getToolById,
  listToolsByKind,
  TOOL_CATALOG,
} from "./tool.registry";
export {
  E03_TOOL_RUNTIME_BASE,
  E03_TOOL_RUNTIME_FREEZE_VERSION,
  E03_TOOL_RUNTIME_ID,
  E03_TOOL_RUNTIME_VERSION,
  TOOL_EXECUTION_PHASES,
  TOOL_KINDS,
  TOOL_PERMISSION_LEVELS,
  TOOL_RESULT_STATUSES,
} from "./tool.constants";
