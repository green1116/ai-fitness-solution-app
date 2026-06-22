/**
 * V62 P2 — Priority resolver
 */

import type { ExecutionAction, ExecutionPriority } from "../core/execution.types";

const PRIORITY_RANK: Record<ExecutionPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export function prioritizeActions(actions: ExecutionAction[]): ExecutionAction[] {
  return [...actions].sort((a, b) => {
    const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rankDiff !== 0) return rankDiff;
    return a.id.localeCompare(b.id);
  });
}

export function pickTopPriority(actions: ExecutionAction[], limit = 5): ExecutionAction[] {
  return prioritizeActions(actions).slice(0, limit);
}
