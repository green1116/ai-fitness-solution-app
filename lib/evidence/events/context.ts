import type { ExternalEvidenceRuntimeInput } from "../types";
import type { RuntimeOrchestrationFlags } from "./types";
import type { RuntimeEventCorrelation } from "./correlation";

/**
 * 编排会话上下文（随 pipeline 逐步填充，供 handler 读取）
 */
export type RuntimeOrchestrationContext = {
  correlation: RuntimeEventCorrelation;
  input: ExternalEvidenceRuntimeInput;
  flags: RuntimeOrchestrationFlags;
  runId: string;
  ranAt: string;
  /** 可变引用，pipeline 各阶段写入 */
  snapshot: RuntimeOrchestrationSnapshot;
};

export type RuntimeOrchestrationSnapshot = {
  ocrDocumentCount?: number;
  ocrBlockCount?: number;
  coverageRuntime?: import("../types").EvidenceCoverageRuntimeResult;
  tenderValidation?: import("../types").TenderValidationRuntimeResult;
  tenderAudit?: import("../types").TenderAuditResult;
  tenderGovernance?: import("../types").TenderGovernanceResult;
  executiveOversight?: import("../types").ExecutiveTenderResult;
  executiveApprovalGate?: import("../types").ExecutiveApprovalGateRuntimeResult;
  executiveReleaseSurface?: import("../types").ExecutiveReleaseSurfaceRuntimeResult;
  runtimePolicy?: import("../types").RuntimePolicyEngineResult;
  runtimeStateMachine?: import("../types").RuntimeStateMachineRuntimeResult;
  registryRecordIds?: string[];
};

export function createOrchestrationContext(input: {
  correlation: RuntimeEventCorrelation;
  runtimeInput: ExternalEvidenceRuntimeInput;
  runId: string;
  ranAt: string;
}): RuntimeOrchestrationContext {
  return {
    correlation: input.correlation,
    input: input.runtimeInput,
    runId: input.runId,
    ranAt: input.ranAt,
    flags: {
      releaseBlocked: false,
      releaseEnabled: false,
      executiveReviewUnlocked: false,
      manifestRequested: false,
      governanceEscalated: false,
    },
    snapshot: {},
  };
}
