/**
 * V3.4-E12 Executive Runtime Visualization — 类型契约
 */

import type { TenderAuditResult } from "./audit";
import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { TenderDecisionResult } from "./decision";
import type {
  ExecutiveApprovalGateRuntimeResult,
  ExecutiveGateReason,
} from "./executiveGate";
import type { ExecutiveOversightPackage, ExecutiveTenderResult } from "./executive";
import type {
  ExecutiveDeliveryEnvelope,
  ExecutiveReleaseSurface,
  ExecutiveReleaseSurfaceRuntimeResult,
} from "./executiveReleaseSurface";
import type { TenderGovernanceResult } from "./governance";
import type { EvidenceLinkingRuntimeResult } from "./linking";
import type { OcrDocumentResult } from "./ocr";
import type { ExternalEvidenceRuntimeSuccess } from "./runtime";
import type { TenderValidationRuntimeResult } from "./validation";

export const EXECUTIVE_RUNTIME_VISUALIZATION_VERSION = "3.4-e12" as const;

export type RuntimeVisualizationStatus = "healthy" | "warning" | "critical";

export type RuntimeVisualizationMetric = {
  label: string;
  score: number;
  status: RuntimeVisualizationStatus;
};

export type RuntimeVisualizationPanel = {
  executiveScore: number;
  executiveGate: "approved" | "conditional" | "blocked";
  releaseDecision: "release" | "conditional-release" | "block-release";
  metrics: RuntimeVisualizationMetric[];
  findings: string[];
  recommendations: string[];
  releasable: boolean;
};

export type RuntimePipelineStageId =
  | "evidence"
  | "ocr"
  | "coverage"
  | "validation"
  | "audit"
  | "decision"
  | "governance"
  | "executive_oversight"
  | "executive_gate"
  | "release_surface";

export type RuntimePipelineStage = {
  id: RuntimePipelineStageId;
  label: string;
  status: RuntimeVisualizationStatus;
  summary: string;
};

export type RuntimeVisualizationDashboard = RuntimeVisualizationPanel & {
  version: typeof EXECUTIVE_RUNTIME_VISUALIZATION_VERSION;
  runId?: string;
  ranAt?: string;
  pipeline: RuntimePipelineStage[];
  conditionalReleaseReasons: string[];
  blockReasons: string[];
};

export type RuntimeVisualizationDebugOutput = {
  summary: string;
  metricsTable: string;
  pipelineTrace: string;
};

export type RuntimeVisualizationPackage = RuntimeVisualizationDashboard & {
  debug: RuntimeVisualizationDebugOutput;
};

export type BuildRuntimeVisualizationInput = {
  runId?: string;
  ranAt?: string;
  coverageRuntime?: EvidenceCoverageRuntimeResult;
  tenderValidation?: TenderValidationRuntimeResult;
  tenderAudit?: TenderAuditResult;
  tenderDecision?: TenderDecisionResult;
  tenderGovernance?: TenderGovernanceResult;
  executiveOversight?: ExecutiveTenderResult | ExecutiveOversightPackage;
  executiveApprovalGate?: ExecutiveApprovalGateRuntimeResult;
  executiveReleaseSurface?: ExecutiveReleaseSurfaceRuntimeResult | ExecutiveReleaseSurface;
  linking?: EvidenceLinkingRuntimeResult;
  ocrDocuments?: OcrDocumentResult[];
};

export function runtimeVisualizationInputFromSuccess(
  result: ExternalEvidenceRuntimeSuccess,
): BuildRuntimeVisualizationInput {
  return {
    runId: result.runId,
    ranAt: result.ranAt,
    coverageRuntime: result.coverageRuntime,
    tenderValidation: result.tenderValidation,
    tenderAudit: result.tenderAudit,
    tenderDecision: result.tenderDecision,
    tenderGovernance: result.tenderGovernance,
    executiveOversight: result.executiveOversight,
    executiveApprovalGate: result.executiveApprovalGate,
    executiveReleaseSurface: result.executiveReleaseSurface,
    linking: result.linking,
    ocrDocuments: result.ocrDocuments,
  };
}

export type ExecutiveRuntimeVisualizationRuntimeInput = BuildRuntimeVisualizationInput & {
  runId: string;
  extensions?: RuntimeVisualizationExtensionHooks;
};

export type RuntimeVisualizationExtensionHooks = {
  enableAiVisualization?: boolean;
  enableSemanticDashboard?: boolean;
  providerId?: string;
};

export type ExecutiveRuntimeVisualizationContract = {
  version: typeof EXECUTIVE_RUNTIME_VISUALIZATION_VERSION;
  pipeline: readonly [
    "collect_runtime",
    "build_metrics",
    "build_panel",
    "build_pipeline_stages",
    "debug",
  ];
};

export const EXECUTIVE_RUNTIME_VISUALIZATION_CONTRACT: ExecutiveRuntimeVisualizationContract =
  {
    version: EXECUTIVE_RUNTIME_VISUALIZATION_VERSION,
    pipeline: [
      "collect_runtime",
      "build_metrics",
      "build_panel",
      "build_pipeline_stages",
      "debug",
    ],
  };

export type VisualizationAuditEventKind =
  | "collect_runtime"
  | "build_metrics"
  | "build_panel"
  | "build_pipeline_stages"
  | "debug";

export type VisualizationAuditEvent = {
  eventId: string;
  runId: string;
  kind: VisualizationAuditEventKind;
  message: string;
  at: string;
};

export type VisualizationTrace = {
  version: typeof EXECUTIVE_RUNTIME_VISUALIZATION_VERSION;
  runId: string;
  events: VisualizationAuditEvent[];
};

export type ExecutiveRuntimeVisualizationResult = RuntimeVisualizationPackage & {
  runId: string;
  ranAt: string;
  durationMs: number;
  trace: VisualizationTrace;
  delivery: ExecutiveDeliveryEnvelope;
};

/** 供 result page / dashboard 消费的 JSON 契约 */
export type TenderOperatingDashboardPayload = {
  ok: true;
  visualization: RuntimeVisualizationDashboard;
  meta: {
    runId: string;
    version: typeof EXECUTIVE_RUNTIME_VISUALIZATION_VERSION;
  };
};

export type ExecutiveGateReasonLabel = ExecutiveGateReason;
