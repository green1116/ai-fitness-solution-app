/**
 * E08-P5 — Ecosystem Intelligence types
 * Intelligence layer above E08 Cross Enterprise Workflow
 */

import type { WorkflowExecutionResult } from "../workflow/workflow.types";
import {
  E08_INTELLIGENCE_BASE,
  E08_INTELLIGENCE_FREEZE_VERSION,
  E08_INTELLIGENCE_ID,
  E08_INTELLIGENCE_VERSION,
  INTELLIGENCE_INSTANCE_PHASES,
  INTELLIGENCE_KINDS,
} from "./intelligence.constants";

export type IntelligenceKind = (typeof INTELLIGENCE_KINDS)[number];
export type IntelligenceInstancePhase =
  (typeof INTELLIGENCE_INSTANCE_PHASES)[number];

export type IntelligenceSignal = {
  field: string;
  value: unknown;
  reason: string;
  readOnly: true;
};

export type IntelligenceDefinition = {
  id: string;
  kind: IntelligenceKind;
  name: string;
  description: string;
  /** Bound E08 cross-enterprise workflow id */
  workflowId: string;
  /** Input signals applied when analysis needs reinforcement */
  signals: IntelligenceSignal[];
  /** Score (0-100) at or above which analysis is healthy */
  targetScore: number;
  optional: boolean;
  readOnly: true;
};

export type IntelligenceAnalysis = {
  workflowId: string;
  score: number;
  completedSteps: number;
  stepCount: number;
  exchangedListings: string[];
  status: WorkflowExecutionResult["status"] | "none";
  findings: string[];
  needsInsight: boolean;
  readOnly: true;
};

export type EcosystemInsight = {
  kind: IntelligenceKind;
  headline: string;
  summary: string;
  recommendations: string[];
  confidence: number;
  readOnly: true;
};

export type IntelligenceRunResult = {
  success: boolean;
  intelligenceId: string;
  kind: IntelligenceKind;
  workflowId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  analysis: IntelligenceAnalysis;
  insight: EcosystemInsight;
  appliedSignals: IntelligenceSignal[];
  workflow?: WorkflowExecutionResult;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type IntelligenceRegistryManifest = {
  intelligenceId: typeof E08_INTELLIGENCE_ID;
  version: typeof E08_INTELLIGENCE_VERSION;
  freezeVersion: typeof E08_INTELLIGENCE_FREEZE_VERSION;
  base: typeof E08_INTELLIGENCE_BASE;
  definitionCount: number;
  kinds: IntelligenceKind[];
  definitions: IntelligenceDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
