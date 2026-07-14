/**
 * E03-P3 — Tool Execution Runtime constants
 * BASE: enterprise-e03-p2-agent-runtime-kernel-v1
 */

export const E03_TOOL_RUNTIME_ID =
  "enterprise-e03-p3-tool-execution-runtime-v1" as const;

export const E03_TOOL_RUNTIME_VERSION = "e03-tool-runtime-1" as const;
export const E03_TOOL_RUNTIME_FREEZE_VERSION =
  "e03-tool-runtime-freeze-1" as const;

export const E03_TOOL_RUNTIME_BASE =
  "enterprise-e03-p2-agent-runtime-kernel-v1" as const;

export const TOOL_KINDS = [
  "utility",
  "inspect",
  "transform",
  "validate",
] as const;

export const TOOL_PERMISSION_LEVELS = [
  "public",
  "agent",
  "coordinator",
  "denied",
] as const;

export const TOOL_EXECUTION_PHASES = [
  "PENDING",
  "AUTHORIZED",
  "RUNNING",
  "COMPLETED",
  "RESULT",
] as const;

export const TOOL_RESULT_STATUSES = [
  "pending",
  "authorized",
  "running",
  "completed",
  "result",
  "denied",
  "failed",
] as const;
