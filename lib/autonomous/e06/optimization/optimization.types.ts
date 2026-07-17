/**
 * E06-P5 — Self Optimization Loop types
 * Self optimization layer above E06 Enterprise Control Plane
 */

import type { ControlHealthStatus } from "../control/control.types";
import {
  E06_OPTIMIZATION_BASE,
  E06_OPTIMIZATION_FREEZE_VERSION,
  E06_OPTIMIZATION_LOOP_ID,
  E06_OPTIMIZATION_VERSION,
  OPTIMIZATION_KINDS,
  OPTIMIZATION_LOOP_PHASES,
} from "./optimization.constants";

export type OptimizationKind = (typeof OPTIMIZATION_KINDS)[number];
export type OptimizationLoopPhase =
  (typeof OPTIMIZATION_LOOP_PHASES)[number];

export type OptimizationKnob = {
  field: string;
  value: unknown;
  reason: string;
  readOnly: true;
};

export type OptimizationDefinition = {
  id: string;
  kind: OptimizationKind;
  name: string;
  description: string;
  /** Bound E06 control id */
  controlId: string;
  /** Input adjustments applied during the APPLY phase */
  knobs: OptimizationKnob[];
  /** Score (0-100) at or above which no optimization is required */
  targetScore: number;
  optional: boolean;
  readOnly: true;
};

export type OptimizationEvaluation = {
  planId: string;
  healthStatus: ControlHealthStatus;
  score: number;
  completedSteps: number;
  stepCount: number;
  findings: string[];
  needsOptimization: boolean;
  readOnly: true;
};

export type OptimizationMeasurement = {
  baselineScore: number;
  optimizedScore: number;
  delta: number;
  improved: boolean;
  reachedTarget: boolean;
  verdict: string;
  readOnly: true;
};

export type OptimizationLoopResult = {
  success: boolean;
  loopId: typeof E06_OPTIMIZATION_LOOP_ID;
  optimizationId: string;
  kind: OptimizationKind;
  controlId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  baseline: OptimizationEvaluation;
  appliedKnobs: OptimizationKnob[];
  optimized: OptimizationEvaluation;
  measurement: OptimizationMeasurement;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type OptimizationRegistryManifest = {
  loopId: typeof E06_OPTIMIZATION_LOOP_ID;
  version: typeof E06_OPTIMIZATION_VERSION;
  freezeVersion: typeof E06_OPTIMIZATION_FREEZE_VERSION;
  base: typeof E06_OPTIMIZATION_BASE;
  optimizationCount: number;
  kinds: OptimizationKind[];
  optimizations: OptimizationDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
