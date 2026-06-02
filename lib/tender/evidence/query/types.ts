import type { EvidenceAdapterResult } from "../bridge/buildEvidenceFromPipeline";
import type {
  EvidenceDecisionPolicy,
  EvidenceDecisionResult,
  EvidenceStageResult,
} from "../runtime/types";
import type { EvidenceTraceLog } from "../trace/types";
import type {
  EvidenceCoverageStatus,
  EvidenceDocument,
  EvidenceRegistry,
  EvidenceType,
  RequirementCoverageResult,
  RequirementEvidenceLink,
  TenderEvidenceMatrixRow,
} from "../types";

export type EvidenceApiAction = "build" | "query" | "runtime";

/** POST /api/tender/evidence 请求体 */
export type EvidenceApiRequest = {
  action?: EvidenceApiAction;

  /** build：从招标文本构建完整 evidence 包 */
  rawText?: string;
  sourceName?: string;
  graph?: import("@/lib/tender/semantic/types").TenderSemanticGraph;
  compliance?: import("@/lib/tender/compliance/types").TechnicalCompliancePackage;
  skuResult?: import("@/lib/tender/sku/skuTypes").SKUIntelligenceResult;
  responses?: import("@/lib/tender/response/types").TenderResponsePackage;

  /** build 选项：自动跑子 pipeline（当仅提供 rawText/graph 时） */
  options?: {
    runCompliance?: boolean;
    runSku?: boolean;
    runResponses?: boolean;
  };

  /** query：在已有 registry 上查询（可与 build 联用） */
  registry?: EvidenceRegistry;
  matrix?: TenderEvidenceMatrixRow[];
  coverage?: RequirementCoverageResult[];

  /** 查询过滤 */
  filters?: EvidenceQueryFilters;

  /** V2.8 runtime 决策策略 */
  runtimePolicy?: EvidenceDecisionPolicy;
  forceAllow?: boolean;
};

export type EvidenceQueryFilters = {
  requirementId?: string;
  requirementIds?: string[];
  evidenceId?: string;
  evidenceType?: EvidenceType;
  skuId?: string;
  coverageStatus?: EvidenceCoverageStatus;
  /** matrix 行：按 requirement 文本模糊匹配 */
  requirementTextIncludes?: string;
};

export type RequirementEvidenceBundle = {
  requirementId: string;
  documents: EvidenceDocument[];
  links: RequirementEvidenceLink[];
  coverage?: RequirementCoverageResult;
  matrixRow?: TenderEvidenceMatrixRow;
};

export type EvidenceQueryResult = {
  documents: EvidenceDocument[];
  links: RequirementEvidenceLink[];
  matrixRows: TenderEvidenceMatrixRow[];
  coverage: RequirementCoverageResult[];
  byRequirement: RequirementEvidenceBundle[];
  summary: {
    documentCount: number;
    linkCount: number;
    matrixRowCount: number;
    fullyEvidenced: number;
    partiallyEvidenced: number;
    unsupported: number;
    risky: number;
  };
};

export type EvidenceRuntimePayload = {
  trace: EvidenceTraceLog;
  decision: EvidenceDecisionResult;
  stages: EvidenceStageResult[];
  ranAt: string;
};

export type EvidenceApiResponse = {
  ok: true;
  action: EvidenceApiAction;
  sourceName?: string | null;
  evidence?: EvidenceAdapterResult;
  query: EvidenceQueryResult;
  runtime?: EvidenceRuntimePayload;
};

export type EvidenceRuntimeApiResponse = EvidenceApiResponse & {
  action: "runtime";
  runtime: EvidenceRuntimePayload;
};

export type EvidenceApiErrorResponse = {
  ok: false;
  code: string;
  message: string;
};
