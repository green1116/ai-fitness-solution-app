import type { GovernanceLifecycleArchive, GovernanceLifecycleSnapshot } from "./lifecycle.types";

export function buildLifecycleArchive(input: {
  archived: boolean;
  observedAt: string;
  reason: string;
}): GovernanceLifecycleArchive {
  return {
    archiveId: `archive-${Date.now()}`,
    archived: input.archived,
    archivedAt: input.archived ? input.observedAt : null,
    reason: input.reason,
  };
}

export function buildLifecycleSnapshot(input: {
  status: GovernanceLifecycleSnapshot["status"];
  queueSize: number;
  timelineSize: number;
  capturedAt: string;
}): GovernanceLifecycleSnapshot {
  return {
    snapshotId: `snapshot-${Date.now()}`,
    status: input.status,
    queueSize: input.queueSize,
    timelineSize: input.timelineSize,
    capturedAt: input.capturedAt,
  };
}
