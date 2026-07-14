/**
 * E03-P3 — Tool Execution Runtime types
 */

import {
  E03_TOOL_RUNTIME_FREEZE_VERSION,
  E03_TOOL_RUNTIME_ID,
  E03_TOOL_RUNTIME_VERSION,
  TOOL_EXECUTION_PHASES,
  TOOL_KINDS,
  TOOL_PERMISSION_LEVELS,
  TOOL_RESULT_STATUSES,
} from "./tool.constants";
import type { AgentRole } from "../core/agent.types";

export type ToolKind = (typeof TOOL_KINDS)[number];
export type ToolPermissionLevel = (typeof TOOL_PERMISSION_LEVELS)[number];
export type ToolExecutionPhase = (typeof TOOL_EXECUTION_PHASES)[number];
export type ToolResultStatus = (typeof TOOL_RESULT_STATUSES)[number];

export type ToolInput = Readonly<Record<string, unknown>>;
export type ToolOutput = Readonly<Record<string, unknown>>;
export type ToolMetadata = Readonly<Record<string, string>>;

export type ToolCaller = {
  agentId: string;
  role: AgentRole;
  taskId?: string;
  executionId?: string;
};

export type ToolRequest = {
  requestId: string;
  toolId: string;
  caller: ToolCaller;
  input: ToolInput;
  metadata: ToolMetadata;
  createdAt: string;
  readOnly: true;
};

export type ToolRuntimeIdentity = {
  runtimeId: typeof E03_TOOL_RUNTIME_ID;
  version: typeof E03_TOOL_RUNTIME_VERSION;
  freezeVersion: typeof E03_TOOL_RUNTIME_FREEZE_VERSION;
};
