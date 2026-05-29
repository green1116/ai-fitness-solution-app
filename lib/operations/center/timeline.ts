import type { OperationsTimeline, OperationsTimelineEntry } from "./types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../recovery/types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export function buildOperationsTimeline(input: {
  deploymentId: string;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): OperationsTimeline {
  const entries: OperationsTimelineEntry[] = [];

  for (const event of input.execution.audit.trace.events) {
    entries.push({
      entryId: `timeline-execution-${event.event}-${entries.length}`,
      domain: "execution",
      event: event.event,
      detail: event.detail,
      timestamp: event.timestamp,
    });
  }

  for (const record of input.change.audit.records) {
    entries.push({
      entryId: `timeline-change-${record.recordId}`,
      domain: "change",
      event: "change-record",
      detail: `${record.planId}:${record.status}`,
      timestamp: record.timestamp,
    });
  }

  for (const timeline of input.incident.tracking.timelines) {
    for (const entry of timeline.entries) {
      entries.push({
        entryId: `timeline-incident-${entry.entryId}`,
        domain: "incident",
        event: entry.phase,
        detail: entry.detail,
        timestamp: entry.timestamp,
      });
    }
  }

  for (const timeline of input.recovery.tracking.timelines) {
    for (const entry of timeline.entries) {
      entries.push({
        entryId: `timeline-recovery-${entry.entryId}`,
        domain: "recovery",
        event: entry.phase,
        detail: entry.detail,
        timestamp: entry.timestamp,
      });
    }
  }

  entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return {
    timelineId: `operations-timeline-${input.deploymentId}`,
    entries,
  };
}
