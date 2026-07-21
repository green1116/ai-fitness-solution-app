/**
 * E11-P4 — Governance Metrics
 */

import { listAllocations } from "./governance.allocation";
import { getAdmissionCounters } from "./governance.admission";
import { totalUtilization } from "./governance.capacity";
import { countActiveByPriority } from "./governance.priority";
import { listResources } from "./governance.resource";
import type { GovernanceMetrics } from "./governance.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function captureGovernanceMetrics(): GovernanceMetrics {
  const resources = listResources();
  let totalCapacity = 0;
  let totalAllocated = 0;
  for (const r of resources) {
    totalCapacity += r.capacity;
    totalAllocated += r.allocated;
  }

  const allocations = listAllocations();
  const activeAllocations = allocations.filter((a) => a.status === "ACTIVE")
    .length;
  const deniedAllocations = allocations.filter((a) => a.status === "DENIED")
    .length;
  const counters = getAdmissionCounters();

  return {
    resourceCount: resources.length,
    totalCapacity,
    totalAllocated,
    activeAllocations,
    deniedAllocations,
    admittedCount: counters.admittedCount,
    rejectedCount: counters.rejectedCount,
    throttledCount: counters.throttledCount,
    averageUtilization: totalUtilization(),
    byPriority: countActiveByPriority(),
    snappedAt: nowIso(),
  };
}
