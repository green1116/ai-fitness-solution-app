import type { EvidenceAdapterResult } from "../bridge/buildEvidenceFromPipeline";
import type { EvidenceTraceLog } from "../trace/types";

/** V2.8 分阶段执行标识 */
export type EvidenceStageId =
  | "collect"
  | "ingest"
  | "link"
  | "evaluate"
  | "decide";

export type EvidenceGateAction = "allow" | "warn" | "block";

export type EvidenceStageStatus = "ok" | "skipped" | "warn";

export type EvidenceStageResult = {
  stageId: EvidenceStageId;
  status: EvidenceStageStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  message: string;
  metrics?: Record<string, number | string | boolean>;
};

export type EvidenceDecisionPolicy = Partial<{
  blockOnUnsupportedCount: number;
  blockOnRiskyCount: number;
  blockOnMandatoryUnsupportedCount: number;
  warnOnPartiallyEvidencedRatio: number;
  warnOnUnsupportedRatio: number;
}>;

export type EvidenceDecisionResult = {
  action: EvidenceGateAction;
  passed: boolean;
  title: string;
  message: string;
  reasons: string[];
  suggestedNextSteps: string[];
  meta: {
    totalRequirements: number;
    fullyEvidencedCount: number;
    partiallyEvidencedCount: number;
    unsupportedCount: number;
    riskyCount: number;
    mandatoryUnsupportedCount: number;
    documentsCount: number;
    linksCount: number;
    coverageRatio: number;
  };
};

/** V2.8 Runtime 完整输出 */
export type EvidenceRuntimeResult = {
  evidence: EvidenceAdapterResult;
  trace: EvidenceTraceLog;
  decision: EvidenceDecisionResult;
  stages: EvidenceStageResult[];
  ranAt: string;
};
