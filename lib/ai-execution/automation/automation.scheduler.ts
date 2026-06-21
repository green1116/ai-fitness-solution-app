/**
 * V62 P2 — Automation scheduler (queued execution)
 */

import type { ExecutionAction } from "../core/execution.types";

declare global {
  // eslint-disable-next-line no-var
  var __executionQueue: ExecutionAction[] | undefined;
}

function getQueue(): ExecutionAction[] {
  globalThis.__executionQueue ||= [];
  return globalThis.__executionQueue;
}

export function scheduleExecution(action: ExecutionAction): void {
  getQueue().push(action);
  if (getQueue().length > 200) getQueue().shift();
}

export function scheduleExecutions(actions: ExecutionAction[]): void {
  for (const a of actions) scheduleExecution(a);
}

export function drainScheduledExecutions(organizationId?: string): ExecutionAction[] {
  const queue = getQueue();
  const drained = organizationId
    ? queue.filter((a) => a.organizationId === organizationId)
    : [...queue];
  globalThis.__executionQueue = organizationId
    ? queue.filter((a) => a.organizationId !== organizationId)
    : [];
  return drained;
}

export function peekScheduledExecutions(limit = 20): ExecutionAction[] {
  return getQueue().slice(-limit);
}

export function clearSchedulerForTests(): void {
  globalThis.__executionQueue = [];
}
