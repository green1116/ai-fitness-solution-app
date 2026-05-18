/**
 * V3.4-E13 Runtime Correlation Intelligence — 类型契约
 */

import type { TenderAuditResult } from "./audit";
import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { TenderDecisionResult } from "./decision";
import type { ExecutiveApprovalGateRuntimeResult } from "./executiveGate";
import type { ExecutiveOversightPackage, ExecutiveTenderResult } from "./executive";
import type {
  ExecutiveReleaseSurface,
  ExecutiveReleaseSurfaceRuntimeResult,
} from "./executiveReleaseSurface";
import type { TenderGovernanceResult } from "./governance";
import type { EvidenceLinkingRuntimeResult } from "./linking";
import type { OcrDocumentResult } from "./ocr";
import type { ExternalEvidenceRuntimeSuccess } from "./runtime";
import type { TenderValidationRuntimeResult } from "./validation";

export const RUNTIME_CORRELATION_INTELLIGENCE_VERSION = "3.4-e13" as const;

export type RuntimeNodeType =
  | "coverage"
  | "validation"
  | "audit"
  | "governance"
  | "ocr"
  | "executive"
  | "gate"
  | "release";

export type RuntimeCorrelationImpact = "low" | "moderate" | "high" | "critical";

export type RuntimeCorrelationEdge = {
  source: RuntimeNodeType;
  target: RuntimeNodeType;
  reason: string;
  impact: RuntimeCorrelationImpact;
  deterministic: true;
};

export type RuntimeCorrelationResult = {
  edges: RuntimeCorrelationEdge[];
  affectedRuntimeCount: number;
  criticalPaths: string[];
  correlationWarnings: string[];
};

export type RuntimeCorrelationDebugOutput = {
  summary: string;
  dependencyGraph: string;
  criticalPaths: string;
};

export type RuntimeCorrelationPackage = RuntimeCorrelationResult & {
  version: typeof RUNTIME_CORRELATION_INTELLIGENCE_VERSION;
  debug: RuntimeCorrelationDebugOutput;
};

/** buildRuntimeCorrelation 输入（与 visualization 输入对齐） */
export type BuildRuntimeCorrelationInput = {
  runId?: string;
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

export function runtimeCorrelationInputFromSuccess(
  result: ExternalEvidenceRuntimeSuccess,
): BuildRuntimeCorrelationInput {
  return {
    runId: result.runId,
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

export type RuntimeCorrelationIntelligenceRuntimeInput = BuildRuntimeCorrelationInput & {
  runId: string;
  extensions?: RuntimeCorrelationExtensionHooks;
};

export type RuntimeCorrelationExtensionHooks = {
  enableAiCausalInference?: boolean;
  enableSemanticCorrelation?: boolean;
  enableVectorCorrelationRuntime?: boolean;
  providerId?: string;
};

export type RuntimeCorrelationIntelligenceContract = {
  version: typeof RUNTIME_CORRELATION_INTELLIGENCE_VERSION;
  pipeline: readonly [
    "collect_runtime_state",
    "build_dependency_edges",
    "resolve_critical_paths",
    "correlation_warnings",
    "debug",
  ];
};

export const RUNTIME_CORRELATION_INTELLIGENCE_CONTRACT: RuntimeCorrelationIntelligenceContract =
  {
    version: RUNTIME_CORRELATION_INTELLIGENCE_VERSION,
    pipeline: [
      "collect_runtime_state",
      "build_dependency_edges",
      "resolve_critical_paths",
      "correlation_warnings",
      "debug",
    ],
  };

export type CorrelationAuditEventKind =
  | "collect_runtime_state"
  | "build_dependency_edges"
  | "resolve_critical_paths"
  | "correlation_warnings"
  | "debug";

export type CorrelationAuditEvent = {
  eventId: string;
  runId: string;
  kind: CorrelationAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type CorrelationTrace = {
  version: typeof RUNTIME_CORRELATION_INTELLIGENCE_VERSION;
  runId: string;
  events: CorrelationAuditEvent[];
};

export type RuntimeCorrelationIntelligenceResult = RuntimeCorrelationPackage & {
  runId: string;
  ranAt: string;
  durationMs: number;
  trace: CorrelationTrace;
};
