import type {
  RuntimeEventDispatchRecord,
  RuntimeEventOrchestrationResult,
} from "../types";
import {
  ESCALATION_EVENTS,
  EVENT_PHASE_MAP,
  FAILURE_EVENTS,
  LIFECYCLE_PHASE_ORDER,
} from "./constants";
import type { EventTimelineIntelligence, TimelineStep } from "./types";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function dedupeRecords(
  records: RuntimeEventDispatchRecord[],
): RuntimeEventDispatchRecord[] {
  const seen = new Set<string>();
  const out: RuntimeEventDispatchRecord[] = [];
  for (const r of records) {
    if (seen.has(r.eventId)) continue;
    seen.add(r.eventId);
    out.push(r);
  }
  return out.sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

export function buildEventTimelineIntelligence(
  orchestration: RuntimeEventOrchestrationResult,
): EventTimelineIntelligence {
  const unique = dedupeRecords(orchestration.records);
  let prevTs: number | null = null;
  const orderedSteps: TimelineStep[] = unique.map((r) => {
    const ts = new Date(r.timestamp).getTime();
    const durationSincePreviousMs =
      prevTs === null ? null : Math.max(0, ts - prevTs);
    prevTs = ts;
    const phase = EVENT_PHASE_MAP[r.eventType];
    return {
      eventId: r.eventId,
      eventType: r.eventType,
      timestamp: r.timestamp,
      phase,
      durationSincePreviousMs,
      durationLabel:
        durationSincePreviousMs === null
          ? null
          : formatDuration(durationSincePreviousMs),
      failed: FAILURE_EVENTS.has(r.eventType),
      escalated: ESCALATION_EVENTS.has(r.eventType),
    };
  });

  const failureNodes = orderedSteps.filter((s) => s.failed);
  const escalationChain = orderedSteps.filter((s) => s.escalated);

  const totalDurationMs =
    orderedSteps.length >= 2
      ? new Date(orderedSteps[orderedSteps.length - 1]!.timestamp).getTime() -
        new Date(orderedSteps[0]!.timestamp).getTime()
      : 0;

  const phaseDurations: Partial<Record<string, number>> = {};
  for (const phase of LIFECYCLE_PHASE_ORDER) {
    const steps = orderedSteps.filter((s) => s.phase === phase);
    if (steps.length < 2) continue;
    const first = new Date(steps[0]!.timestamp).getTime();
    const last = new Date(steps[steps.length - 1]!.timestamp).getTime();
    phaseDurations[phase] = Math.max(0, last - first);
  }

  return {
    traceId: orchestration.traceId,
    correlationId: orchestration.correlationId,
    orderedSteps,
    totalDurationMs,
    failureNodes,
    escalationChain,
    phaseDurations,
  };
}
