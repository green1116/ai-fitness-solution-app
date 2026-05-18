import type { AttachmentInput, ExtractedAttachment, AttachmentLinkResult } from "@/lib/tender/attachment-evidence/types";
import type { EvidenceAdapterResult } from "@/lib/tender/evidence/bridge/buildEvidenceFromPipeline";
import type { EvidencePipelineSnapshot } from "@/lib/tender/evidence/bridge/pipelineTypes";
import type { EvidenceRuntimeResult } from "@/lib/tender/evidence/runtime/types";
import type { EvidenceRegistry } from "@/lib/tender/evidence/types";
import type { NormalizedEvidencePayload } from "@/lib/tender/evidence/adapters/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

/** V3.4 External Evidence Intelligence 流水线阶段 */
export type EvidenceIntelligencePhaseId =
  | "attachment"
  | "ocr"
  | "classification"
  | "linking"
  | "registry"
  | "coverage";

export type EvidenceIntelligencePhaseStatus =
  | "completed"
  | "skipped"
  | "failed";

export type EvidenceIntelligencePhaseResult = {
  phaseId: EvidenceIntelligencePhaseId;
  runtime: "attachment" | "ocr" | "classification" | "linking" | "registry" | "coverage";
  status: EvidenceIntelligencePhaseStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  message: string;
  error?: string;
  metrics?: Record<string, number | string | boolean>;
};

export type OcrRuntimePage = {
  attachmentId: string;
  fileName: string;
  page: number;
  charCount: number;
  excerpt: string;
};

export type OcrRuntimeResult = {
  attachmentCount: number;
  totalChars: number;
  methods: Record<string, number>;
  pages: OcrRuntimePage[];
  extractions: ExtractedAttachment[];
};

export type AttachmentRuntimeResult = {
  normalized: AttachmentInput[];
  count: number;
};

export type ClassificationRuntimeResult = {
  classified: ExtractedAttachment[];
  byType: Partial<Record<string, number>>;
};

export type LinkingRuntimeResult = {
  extractions: ExtractedAttachment[];
  links: AttachmentLinkResult[];
  linkedAttachmentCount: number;
};

export type RegistryRuntimeResult = {
  registry: EvidenceRegistry;
  payloads: NormalizedEvidencePayload[];
  documentsAdded: number;
  linksAdded: number;
  mergedInternal: boolean;
};

export type CoverageRuntimeResult = {
  evidence: EvidenceAdapterResult;
  runtime: EvidenceRuntimeResult;
};

export type ExternalEvidenceIntelligenceInput = {
  attachments: AttachmentInput[];
  graph?: TenderSemanticGraph;
  snapshot?: EvidencePipelineSnapshot;
  registry?: EvidenceRegistry;
  minLinkScore?: number;
  /** 是否与内部 pipeline（V2.6）证据合并 */
  mergeInternalEvidence?: boolean;
  evidencePolicy?: import("@/lib/tender/evidence/runtime/types").EvidenceDecisionPolicy;
};

export type ExternalEvidenceIntelligenceResult = {
  ok: true;
  version: "3.4";
  runId: string;
  ranAt: string;
  durationMs: number;
  phases: EvidenceIntelligencePhaseResult[];
  attachment: AttachmentRuntimeResult;
  ocr: OcrRuntimeResult;
  classification: ClassificationRuntimeResult;
  linking: LinkingRuntimeResult;
  registry: RegistryRuntimeResult;
  coverage: CoverageRuntimeResult;
  warnings: string[];
};

export type ExternalEvidenceIntelligenceError = {
  ok: false;
  runId: string;
  code: string;
  message: string;
  failedPhase?: EvidenceIntelligencePhaseId;
  phases: EvidenceIntelligencePhaseResult[];
};
