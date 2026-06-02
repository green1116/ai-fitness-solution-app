/**
 * V3.4-E17 Runtime Event Intelligence — 类型契约
 */

import type { RuntimeEventType } from "../types";

export const RUNTIME_EVENT_INTELLIGENCE_VERSION = "3.4-e17" as const;

export type IntelligenceSeverity = "low" | "medium" | "high" | "critical";

export type ConfidenceLevel = "low" | "medium" | "high";

export type TimelinePhase =
  | "ocr"
  | "coverage"
  | "validation"
  | "audit"
  | "governance"
  | "executive"
  | "release"
  | "state";

export type TimelineStep = {
  eventId: string;
  eventType: RuntimeEventType;
  timestamp: string;
  phase: TimelinePhase;
  durationSincePreviousMs: number | null;
  durationLabel: string | null;
  failed: boolean;
  escalated: boolean;
  reason?: string;
  source?: string;
};

export type EventTimelineIntelligence = {
  traceId: string;
  correlationId: string;
  orderedSteps: TimelineStep[];
  totalDurationMs: number;
  failureNodes: TimelineStep[];
  escalationChain: TimelineStep[];
  phaseDurations: Partial<Record<TimelinePhase, number>>;
};

export type CorrelationRelationship =
  | "causal"
  | "co-occur"
  | "upstream"
  | "downstream";

export type EventCorrelationEdge = {
  from: RuntimeEventType;
  to: RuntimeEventType;
  count: number;
  weight: number;
  relationship: CorrelationRelationship;
  reason: string;
};

export type EventCorrelationGroup = {
  events: RuntimeEventType[];
  reason: string;
  strength: number;
};

export type EventCorrelationIntelligence = {
  edges: EventCorrelationEdge[];
  relatedGroups: EventCorrelationGroup[];
  upstreamMap: Partial<Record<RuntimeEventType, RuntimeEventType[]>>;
  downstreamMap: Partial<Record<RuntimeEventType, RuntimeEventType[]>>;
};

export type RuntimeRiskDimension = {
  score: number;
  severity: IntelligenceSeverity;
  accumulated: number;
  signals: string[];
};

export type RuntimeRiskIntelligence = {
  overallScore: number;
  severity: IntelligenceSeverity;
  dimensions: {
    validation: RuntimeRiskDimension;
    governance: RuntimeRiskDimension;
    release: RuntimeRiskDimension;
    audit: RuntimeRiskDimension;
    executive: RuntimeRiskDimension;
  };
  instabilityDetected: boolean;
  escalationPredicted: boolean;
  repeatedFailures: Array<{ eventType: RuntimeEventType; count: number }>;
};

export type GovernanceHotspot = {
  id: string;
  kind:
    | "escalation"
    | "policy-rejection"
    | "release-freeze"
    | "executive-intervention";
  density: number;
  eventTypes: RuntimeEventType[];
  summary: string;
};

export type GovernanceHotspotIntelligence = {
  hotspots: GovernanceHotspot[];
  escalationDensity: number;
  bottleneckPhase: TimelinePhase | null;
  summary: string;
};

export type ReleaseStabilityIntelligence = {
  health: ConfidenceLevel;
  confidence: number;
  stabilityScore: number;
  blockCount: number;
  enableCount: number;
  fragileStages: TimelinePhase[];
  frequentBlockSources: string[];
  summary: string;
};

export type RuntimeHealthLabels = {
  runtimeHealth: string;
  governanceStability: string;
  releaseConfidence: string;
  auditIntegrity: string;
  executiveReadiness: string;
};

export type RuntimeHealthIntelligence = {
  healthScore: number;
  governanceStability: ConfidenceLevel;
  releaseConfidence: ConfidenceLevel;
  auditIntegrity: ConfidenceLevel;
  executiveReadiness: "blocked" | "conditional" | "ready";
  labels: RuntimeHealthLabels;
};

export type RuntimeEventAnomaly = {
  code: string;
  message: string;
  severity: IntelligenceSeverity;
  relatedEventTypes?: RuntimeEventType[];
};

export type RuntimeEventIntelligenceResult = {
  version: typeof RUNTIME_EVENT_INTELLIGENCE_VERSION;
  traceId: string;
  correlationId: string;
  timeline: EventTimelineIntelligence;
  correlation: EventCorrelationIntelligence;
  risk: RuntimeRiskIntelligence;
  governanceHotspots: GovernanceHotspotIntelligence;
  releaseStability: ReleaseStabilityIntelligence;
  health: RuntimeHealthIntelligence;
  anomalies: RuntimeEventAnomaly[];
  debug: { summary: string };
};

export type BuildRuntimeEventIntelligenceInput = {
  orchestration: import("../types").RuntimeEventOrchestrationResult;
  /** 可选：历史 intelligence 快照，用于跨 run 风险累积 */
  priorSnapshots?: Array<{
    validationRisk?: number;
    governanceRisk?: number;
    validationFailures?: number;
  }>;
  /** 可选 runtime 快照，增强 evidence-gap 等解释 */
  runtimeSnapshot?: {
    validationOutcome?: string;
    auditGovernanceStatus?: string;
    governancePosture?: string;
    policyBlocked?: boolean;
    stateReleasable?: boolean;
  };
};
