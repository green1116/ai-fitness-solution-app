/**
 * V62 P2 — Execution log store (traceable + reversible)
 */

import type { ExecutionAction, ExecutionLogEntry, ExecutionResult } from "./execution.types";

declare global {
  // eslint-disable-next-line no-var
  var __executionLog: ExecutionLogEntry[] | undefined;
  // eslint-disable-next-line no-var
  var __reversibleActions: Map<string, ExecutionAction> | undefined;
}

function getLog(): ExecutionLogEntry[] {
  globalThis.__executionLog ||= [];
  return globalThis.__executionLog;
}

function getReversibleStore(): Map<string, ExecutionAction> {
  globalThis.__reversibleActions ||= new Map();
  return globalThis.__reversibleActions;
}

export function logExecution(
  action: ExecutionAction,
  result: ExecutionResult,
): ExecutionLogEntry {
  const entry: ExecutionLogEntry = {
    id: `log-${action.id}`,
    traceId: result.traceId,
    organizationId: action.organizationId,
    action,
    result,
    createdAt: new Date().toISOString(),
  };

  getLog().push(entry);
  if (getLog().length > 500) getLog().shift();

  if (result.reversible && result.status === "executed") {
    getReversibleStore().set(action.id, action);
  }

  return entry;
}

export function getExecutionLogs(organizationId?: string, limit = 50): ExecutionLogEntry[] {
  const logs = getLog();
  const filtered = organizationId
    ? logs.filter((l) => l.organizationId === organizationId)
    : logs;
  return filtered.slice(-limit);
}

export function getReversibleAction(actionId: string): ExecutionAction | undefined {
  return getReversibleStore().get(actionId);
}

export function clearReversibleAction(actionId: string): void {
  getReversibleStore().delete(actionId);
}

export function clearExecutionStoreForTests(): void {
  globalThis.__executionLog = [];
  globalThis.__reversibleActions = new Map();
}
