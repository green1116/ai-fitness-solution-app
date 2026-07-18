/**
 * E07-P6 — Workforce Learning Loop types
 * Learning layer above E07 Human-AI Collaboration
 */

import type { CollaborationExecutionResult } from "../collaboration/collaboration.types";
import {
  E07_LEARNING_BASE,
  E07_LEARNING_FREEZE_VERSION,
  E07_LEARNING_LOOP_ID,
  E07_LEARNING_VERSION,
  LEARNING_KINDS,
  LEARNING_LOOP_PHASES,
} from "./learning.constants";

export type LearningKind = (typeof LEARNING_KINDS)[number];
export type LearningLoopPhase = (typeof LEARNING_LOOP_PHASES)[number];

export type LearningAdjustment = {
  field: string;
  value: unknown;
  reason: string;
  readOnly: true;
};

export type LearningDefinition = {
  id: string;
  kind: LearningKind;
  name: string;
  description: string;
  /** Bound E07 collaboration id */
  collaborationId: string;
  /** Input adjustments applied during the UPDATE phase */
  adjustments: LearningAdjustment[];
  /** Score (0-100) at or above which no improvement is required */
  targetScore: number;
  optional: boolean;
  readOnly: true;
};

export type LearningEvaluation = {
  collaborationId: string;
  score: number;
  completedSteps: number;
  stepCount: number;
  humanDecision?: string;
  status: CollaborationExecutionResult["status"] | "none";
  findings: string[];
  needsImprovement: boolean;
  readOnly: true;
};

export type LearningMeasurement = {
  baselineScore: number;
  updatedScore: number;
  delta: number;
  improved: boolean;
  reachedTarget: boolean;
  verdict: string;
  readOnly: true;
};

export type LearningLoopResult = {
  success: boolean;
  loopId: typeof E07_LEARNING_LOOP_ID;
  learningId: string;
  kind: LearningKind;
  collaborationId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  baseline: LearningEvaluation;
  appliedAdjustments: LearningAdjustment[];
  updated: LearningEvaluation;
  measurement: LearningMeasurement;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type LearningRegistryManifest = {
  loopId: typeof E07_LEARNING_LOOP_ID;
  version: typeof E07_LEARNING_VERSION;
  freezeVersion: typeof E07_LEARNING_FREEZE_VERSION;
  base: typeof E07_LEARNING_BASE;
  learningCount: number;
  kinds: LearningKind[];
  learnings: LearningDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
