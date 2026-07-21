/**
 * E11-P4 — Workload Priority helpers
 */

import { WORKLOAD_PRIORITIES } from "./governance.constants";
import { listAllocations } from "./governance.allocation";
import type { WorkloadPriority } from "./governance.types";

const RANK: Record<WorkloadPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

export function priorityRank(priority: WorkloadPriority): number {
  return RANK[priority];
}

export function comparePriority(a: WorkloadPriority, b: WorkloadPriority): number {
  return RANK[a] - RANK[b];
}

export function assertWorkloadPriority(
  priority: string,
): asserts priority is WorkloadPriority {
  if (!(WORKLOAD_PRIORITIES as readonly string[]).includes(priority)) {
    throw new Error(`invalid workload priority: ${priority}`);
  }
}

/** Count ACTIVE allocations by priority. */
export function countActiveByPriority(): Record<WorkloadPriority, number> {
  const counts: Record<WorkloadPriority, number> = {
    LOW: 0,
    NORMAL: 0,
    HIGH: 0,
    CRITICAL: 0,
  };
  for (const a of listAllocations({ status: "ACTIVE" })) {
    counts[a.priority] += 1;
  }
  return counts;
}

/**
 * Whether incoming priority may preempt / bypass soft throttle relative to current load.
 * CRITICAL and HIGH may proceed under SOFT throttle; LOW/NORMAL may be throttled.
 */
export function priorityBypassesSoftThrottle(
  priority: WorkloadPriority,
): boolean {
  return priority === "CRITICAL" || priority === "HIGH";
}
