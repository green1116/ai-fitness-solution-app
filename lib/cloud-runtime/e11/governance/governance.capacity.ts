/**
 * E11-P4 — Capacity Tracking
 */

import { listResources, getResource } from "./governance.resource";
import type { CapacitySnapshot, GovernanceResourceType } from "./governance.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function captureCapacity(resourceId: string): CapacitySnapshot {
  const resource = getResource(resourceId);
  if (!resource) throw new Error(`governance resource not found: ${resourceId}`);
  const available = resource.capacity - resource.allocated;
  const utilization =
    resource.capacity === 0 ? 0 : resource.allocated / resource.capacity;
  return {
    resourceId: resource.id,
    type: resource.type,
    capacity: resource.capacity,
    allocated: resource.allocated,
    available,
    utilization,
    snappedAt: nowIso(),
  };
}

export function captureAllCapacities(filter?: {
  type?: GovernanceResourceType;
}): CapacitySnapshot[] {
  return listResources({ type: filter?.type }).map((r) =>
    captureCapacity(r.id),
  );
}

export function totalUtilization(): number {
  const list = listResources();
  if (list.length === 0) return 0;
  let cap = 0;
  let alloc = 0;
  for (const r of list) {
    cap += r.capacity;
    alloc += r.allocated;
  }
  return cap === 0 ? 0 : alloc / cap;
}
