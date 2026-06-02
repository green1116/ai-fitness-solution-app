import type { EvidenceStageId } from "../runtime/types";
import type { EvidenceSourceKind } from "../adapters/types";

export type EvidenceTraceEventKind =
  | "stage_start"
  | "stage_end"
  | "payload_ingested"
  | "link_proposed"
  | "link_applied"
  | "coverage_evaluated"
  | "decision_emitted";

export type EvidenceTraceEvent = {
  id: string;
  kind: EvidenceTraceEventKind;
  stageId?: EvidenceStageId;
  at: string;
  message: string;
  refs?: {
    requirementId?: string;
    evidenceId?: string;
    sourceKind?: EvidenceSourceKind;
    sourceId?: string;
    trace?: string;
  };
  metrics?: Record<string, number | string | boolean>;
};

export type EvidenceTraceLog = {
  version: "2.8";
  events: EvidenceTraceEvent[];
  summary: {
    eventCount: number;
    stageCount: number;
    payloadsIngested: number;
    linksProposed: number;
    linksApplied: number;
  };
};
