import type { EvidenceStageResult } from "../runtime/types";
import type { NormalizedEvidencePayload } from "../adapters/types";
import type { EvidenceTraceEvent, EvidenceTraceLog } from "./types";

let traceSeq = 0;

function nextId(prefix: string) {
  traceSeq += 1;
  return `${prefix}-${traceSeq}`;
}

export function createTraceEvent(
  partial: Omit<EvidenceTraceEvent, "id" | "at"> & { at?: string },
): EvidenceTraceEvent {
  return {
    id: nextId("evt"),
    at: partial.at ?? new Date().toISOString(),
    ...partial,
  };
}

export function tracePayloadIngested(
  payload: NormalizedEvidencePayload,
  evidenceId: string,
): EvidenceTraceEvent {
  return createTraceEvent({
    kind: "payload_ingested",
    stageId: "ingest",
    message: `ingested ${payload.sourceKind}:${payload.sourceId}`,
    refs: {
      evidenceId,
      sourceKind: payload.sourceKind,
      sourceId: payload.sourceId,
      trace: payload.trace,
    },
  });
}

export function buildEvidenceTraceLog(
  events: EvidenceTraceEvent[],
  stages: EvidenceStageResult[],
): EvidenceTraceLog {
  const payloadsIngested = events.filter((e) => e.kind === "payload_ingested").length;
  const linksProposed = events.filter((e) => e.kind === "link_proposed").length;
  const linksApplied = events.filter((e) => e.kind === "link_applied").length;

  return {
    version: "2.8",
    events,
    summary: {
      eventCount: events.length,
      stageCount: stages.length,
      payloadsIngested,
      linksProposed,
      linksApplied,
    },
  };
}

export function resetTraceSequence() {
  traceSeq = 0;
}
