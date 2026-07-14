/**
 * E03-P3 — Tool Result
 */

import type { ToolOutput, ToolResultStatus } from "./tool.types";

export type ToolExecutionResult = {
  success: boolean;
  status: ToolResultStatus;
  toolId: string;
  requestId: string;
  output: ToolOutput;
  traceId: string;
  duration: number;
  errorMessage?: string;
  readOnly: true;
};

export function buildToolExecutionResult(input: {
  success: boolean;
  status: ToolResultStatus;
  toolId: string;
  requestId: string;
  output?: ToolOutput;
  traceId: string;
  duration: number;
  errorMessage?: string;
}): ToolExecutionResult {
  return {
    success: input.success,
    status: input.status,
    toolId: input.toolId,
    requestId: input.requestId,
    output: Object.freeze({ ...(input.output ?? {}) }),
    traceId: input.traceId,
    duration: Math.max(0, Math.round(input.duration)),
    errorMessage: input.errorMessage,
    readOnly: true,
  };
}

export function assertToolExecutionResultPass(
  result: ToolExecutionResult,
): asserts result is ToolExecutionResult & {
  success: true;
  status: "result";
} {
  if (!result.success || result.status !== "result") {
    throw new Error(
      `E03 tool execution failed: status=${result.status} error=${result.errorMessage ?? "unknown"}`,
    );
  }
}
