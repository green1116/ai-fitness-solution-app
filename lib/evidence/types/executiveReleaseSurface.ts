/**
 * V3.4-E11 Executive Release Surface Runtime — 类型契约
 */

import type {
  ExecutiveApprovalGatePackage,
  ExecutiveApprovalGateRuntimeResult,
  ExecutiveGateReason,
} from "./executiveGate";
import type {
  ExecutiveOversightPackage,
  ExecutiveOversightResult,
  ExecutiveRecommendation,
} from "./executive";

export const EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION = "3.4-e11" as const;

export type ExecutiveReleaseSurfaceStatus = "approved" | "conditional" | "blocked";

export type ExecutiveReleaseDecision =
  | "release"
  | "conditional-release"
  | "block-release";

export type ExecutiveReleaseSurface = {
  status: ExecutiveReleaseSurfaceStatus;
  decision: ExecutiveReleaseDecision;
  releasable: boolean;
  executiveScore: number;
  gateStatus: "approved" | "conditional" | "blocked";
  gateReasons: string[];
  blockReasons?: string[];
  labels: string[];
  /** E9 高管监管建议（暴露到交付层） */
  executiveRecommendation?: ExecutiveRecommendation;
  /** E10 投标包释放裁决 */
  tenderReleaseDecision?: string;
  conditionalRelease?: boolean;
};

/** ZIP / JSON 结构化 Release Manifest */
export type ExecutiveReleaseManifest = {
  version: typeof EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION;
  generatedAt: string;
  surface: ExecutiveReleaseSurface;
  lines: string[];
};

export type ExecutiveReleaseSurfaceDebugOutput = {
  summary: string;
  deliveryLayer: string;
  downloadLayer: string;
  manifestPreview: string;
};

export type ExecutiveReleaseSurfacePackage = ExecutiveReleaseSurface & {
  version: typeof EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION;
  manifest: ExecutiveReleaseManifest;
  debug: ExecutiveReleaseSurfaceDebugOutput;
};

export type BuildExecutiveReleaseSurfaceInput = {
  executiveApprovalGate:
    | ExecutiveApprovalGateRuntimeResult
    | ExecutiveApprovalGatePackage;
  executiveOversight?: ExecutiveOversightResult | ExecutiveOversightPackage;
  runId?: string;
  documentId?: string;
};

export type ExecutiveReleaseSurfaceRuntimeInput = BuildExecutiveReleaseSurfaceInput & {
  runId: string;
  documentId: string;
  extensions?: ExecutiveReleaseSurfaceExtensionHooks;
};

export type ExecutiveReleaseSurfaceExtensionHooks = {
  enableAiReleaseSurface?: boolean;
  enableSemanticReleaseManifest?: boolean;
  enableVectorReleaseSurface?: boolean;
  providerId?: string;
};

export type ExecutiveReleaseSurfaceRuntimeContract = {
  version: typeof EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION;
  pipeline: readonly [
    "map_gate",
    "build_labels",
    "build_manifest",
    "surface_adapters",
    "debug",
  ];
};

export const EXECUTIVE_RELEASE_SURFACE_RUNTIME_CONTRACT: ExecutiveReleaseSurfaceRuntimeContract =
  {
    version: EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION,
    pipeline: [
      "map_gate",
      "build_labels",
      "build_manifest",
      "surface_adapters",
      "debug",
    ],
  };

export type ExecutiveSurfaceAuditEventKind =
  | "map_gate"
  | "build_labels"
  | "build_manifest"
  | "surface_adapters"
  | "debug";

export type ExecutiveSurfaceAuditEvent = {
  eventId: string;
  runId: string;
  kind: ExecutiveSurfaceAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type ExecutiveSurfaceTrace = {
  version: typeof EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION;
  runId: string;
  events: ExecutiveSurfaceAuditEvent[];
};

export type ExecutiveDeliveryEnvelope = {
  releaseSurface: ExecutiveReleaseSurface;
  releaseManifest: ExecutiveReleaseManifest;
  pdfKeywords: string[];
  downloadHeaders: Record<string, string>;
  releasable: boolean;
  blocked: boolean;
  conditional: boolean;
};

export type ExecutiveReleaseSurfaceRuntimeResult = ExecutiveReleaseSurfacePackage & {
  runId: string;
  ranAt: string;
  durationMs: number;
  documentId: string;
  trace: ExecutiveSurfaceTrace;
  delivery: ExecutiveDeliveryEnvelope;
};

export const EXECUTIVE_GATE_REASON_LABELS: Record<ExecutiveGateReason, string> = {
  "critical-compliance-risk": "Critical compliance risk",
  "missing-critical-evidence": "Missing critical evidence",
  "weak-ocr-traceability": "Weak OCR traceability",
  "governance-failed": "Governance failed",
  "audit-failed": "Audit failed",
  "validation-unresolved": "Validation unresolved",
};
