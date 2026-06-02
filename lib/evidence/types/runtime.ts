/**
 * V3.4-E1 External Evidence Runtime Contract
 */

import type {
  AttachmentFile,
  CoverageRecord,
  CoverageSummary,
  EvidenceRegistryState,
  OcrExtraction,
  RequirementAnchor,
  SemanticClassification,
} from "./evidence";
import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { TenderAuditResult } from "./audit";
import type { TenderDecisionResult } from "./decision";
import type { ExecutiveTenderResult } from "./executive";
import type { ExecutiveApprovalGateRuntimeResult } from "./executiveGate";
import type { ExecutiveReleaseSurfaceRuntimeResult } from "./executiveReleaseSurface";
import type { ExecutiveRuntimeVisualizationResult } from "./runtimeVisualization";
import type { RuntimeCorrelationIntelligenceResult } from "./runtimeCorrelation";
import type { RuntimePolicyEngineResult } from "./runtimePolicy";
import type { RuntimeStateMachineRuntimeResult } from "./runtimeStateMachine";
import type { TenderGovernanceResult } from "./governance";
import type { TenderValidationRuntimeResult } from "./validation";
import type { EvidenceLinkingRuntimeResult } from "./linking";
import type { OcrDocumentResult } from "./ocr";
import type { RequirementItem } from "./requirement";

export const EVIDENCE_RUNTIME_VERSION = "3.4-e1" as const;

export type EvidenceRuntimeVersion = typeof EVIDENCE_RUNTIME_VERSION;

export type EvidenceRuntimePhaseId =
  | "attachment"
  | "ocr"
  | "semantic"
  | "linker"
  | "registry"
  | "coverage";

export type EvidenceRuntimePhaseStatus = "completed" | "skipped" | "failed";

export type EvidenceRuntimePhaseResult = {
  phaseId: EvidenceRuntimePhaseId;
  status: EvidenceRuntimePhaseStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  message: string;
  error?: string;
  metrics?: Record<string, number | string | boolean>;
};

export type EvidenceAuditEventKind =
  | "phase_start"
  | "phase_end"
  | "artifact"
  | "warning"
  | "error";

export type EvidenceAuditEvent = {
  eventId: string;
  runId: string;
  phaseId: EvidenceRuntimePhaseId;
  kind: EvidenceAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type EvidenceRuntimeTrace = {
  version: EvidenceRuntimeVersion;
  runId: string;
  startedAt: string;
  finishedAt?: string;
  events: EvidenceAuditEvent[];
};

/** External Evidence Runtime 输入契约 */
export type ExternalEvidenceRuntimeInput = {
  attachments: Array<{
    buffer: Buffer;
    fileName: string;
    mimeType?: string;
    sourceType?: AttachmentFile["sourceType"];
    id?: string;
  }>;
  requirements?: RequirementAnchor[];
  /** V3.4-E3 结构化需求（优先于 requirements） */
  requirementItems?: RequirementItem[];
  minLinkScore?: number;
  existingRegistry?: EvidenceRegistryState;
  coveragePolicy?: import("./coverage").CoveragePolicy;
  validationPolicy?: import("./validation").ValidationPolicy;
  decisionPolicy?: import("./decision").DecisionPolicy;
  governancePolicy?: import("./governance").GovernancePolicy;
  executivePolicy?: import("./executive").ExecutivePolicy;
  executiveGatePolicy?: import("./executiveGate").ExecutiveGatePolicy;
  tenderDocument?: import("./validation").TenderDocumentRef;
  /** V3.4-E16 事件关联 */
  correlationId?: string;
  jobId?: string;
  planId?: string;
  tenderId?: string;
  /** 关闭事件编排（默认开启） */
  disableEventOrchestration?: boolean;
};

export type ExternalEvidenceRuntimeSuccess = {
  ok: true;
  version: EvidenceRuntimeVersion;
  runId: string;
  ranAt: string;
  durationMs: number;
  phases: EvidenceRuntimePhaseResult[];
  trace: EvidenceRuntimeTrace;
  attachments: AttachmentFile[];
  /** E1 兼容扁平提取 */
  ocr: OcrExtraction[];
  /** V3.4-E2 块级 OCR 文档 */
  ocrDocuments: OcrDocumentResult[];
  classifications: SemanticClassification[];
  registry: EvidenceRegistryState;
  coverage: CoverageRecord[];
  coverageSummary: CoverageSummary;
  /** V3.4-E3 需求↔证据关联运行时结果 */
  linking?: EvidenceLinkingRuntimeResult;
  /** V3.4-E4 覆盖与招标校验运行时结果 */
  coverageRuntime?: EvidenceCoverageRuntimeResult;
  /** V3.4-E5 投标文件校验运行时结果 */
  tenderValidation?: TenderValidationRuntimeResult;
  /** V3.4-E6 投标审计运行时结果 */
  tenderAudit?: TenderAuditResult;
  /** V3.4-E7 投标决策运行时结果 */
  tenderDecision?: TenderDecisionResult;
  /** V3.4-E8 投标治理运行时结果 */
  tenderGovernance?: TenderGovernanceResult;
  /** V3.4-E9 高管监管运行时结果 */
  executiveOversight?: ExecutiveTenderResult;
  /** V3.4-E10 高管放行门控运行时结果 */
  executiveApprovalGate?: ExecutiveApprovalGateRuntimeResult;
  /** V3.4-E11 高管释放面运行时结果（交付/下载/Manifest/PDF 元数据） */
  executiveReleaseSurface?: ExecutiveReleaseSurfaceRuntimeResult;
  /** V3.4-E12 高管运行时可视化（Operating Dashboard） */
  executiveRuntimeVisualization?: ExecutiveRuntimeVisualizationResult;
  /** V3.4-E13 跨 Runtime 关联智能（确定性依赖图） */
  runtimeCorrelation?: RuntimeCorrelationIntelligenceResult;
  /** V3.4-E14 企业治理 Policy Engine */
  runtimePolicy?: RuntimePolicyEngineResult;
  /** V3.4-E15 招标治理生命周期状态机 */
  runtimeStateMachine?: RuntimeStateMachineRuntimeResult;
  /** V3.4-E16 事件驱动编排轨迹 */
  runtimeEventOrchestration?: import("../events/types").RuntimeEventOrchestrationResult;
  /** V3.4-E17 事件智能分析（生命周期认知层） */
  runtimeEventIntelligence?: import("../events/intelligence/types").RuntimeEventIntelligenceResult;
  warnings: string[];
};

export type ExternalEvidenceRuntimeError = {
  ok: false;
  version: EvidenceRuntimeVersion;
  runId: string;
  code: string;
  message: string;
  failedPhase: EvidenceRuntimePhaseId;
  phases: EvidenceRuntimePhaseResult[];
  trace: EvidenceRuntimeTrace;
};

export type ExternalEvidenceRuntimeResult =
  | ExternalEvidenceRuntimeSuccess
  | ExternalEvidenceRuntimeError;

/** 各子运行时必须实现的阶段契约（供未来 OCR / Linker 等替换实现） */
export type EvidenceRuntimePhaseHandler<TIn, TOut> = {
  phaseId: EvidenceRuntimePhaseId;
  run: (input: TIn) => Promise<TOut> | TOut;
};

export type EvidenceRuntimeContract = {
  version: EvidenceRuntimeVersion;
  phases: EvidenceRuntimePhaseId[];
};

export const EXTERNAL_EVIDENCE_RUNTIME_CONTRACT: EvidenceRuntimeContract = {
  version: EVIDENCE_RUNTIME_VERSION,
  phases: ["attachment", "ocr", "semantic", "registry", "linker", "coverage"],
};
