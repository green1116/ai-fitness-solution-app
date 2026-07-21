/**
 * E11-P2 — Execution Result
 */

import type {
  CloudMetadata,
  ExecutionResult,
  ExecutionResultStatus,
} from "./execution.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function buildExecutionResult(input: {
  taskId: string;
  runtimeId: string;
  contextId?: string;
  status: ExecutionResultStatus;
  output?: CloudMetadata;
  durationMs: number;
  error?: string;
}): ExecutionResult {
  return {
    taskId: input.taskId,
    runtimeId: input.runtimeId,
    contextId: input.contextId,
    status: input.status,
    output: { ...(input.output ?? {}) },
    durationMs: Math.max(0, input.durationMs),
    error: input.error,
    completedAt: nowIso(),
  };
}

const results = new Map<string, ExecutionResult>();

export function storeExecutionResult(result: ExecutionResult): ExecutionResult {
  const cloned: ExecutionResult = {
    ...result,
    output: { ...result.output },
  };
  results.set(result.taskId, cloned);
  return { ...cloned, output: { ...cloned.output } };
}

export function getExecutionResult(
  taskId: string,
): ExecutionResult | undefined {
  const result = results.get(taskId.trim());
  return result
    ? { ...result, output: { ...result.output } }
    : undefined;
}

export function listExecutionResults(filter?: {
  runtimeId?: string;
  status?: ExecutionResultStatus;
}): ExecutionResult[] {
  let list = [...results.values()];
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    list = list.filter((r) => r.runtimeId === rid);
  }
  if (filter?.status) {
    list = list.filter((r) => r.status === filter.status);
  }
  return list
    .slice()
    .sort((a, b) => a.taskId.localeCompare(b.taskId))
    .map((r) => ({ ...r, output: { ...r.output } }));
}

export function clearExecutionResults(): void {
  results.clear();
}
