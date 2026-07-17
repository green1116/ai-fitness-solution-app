/**
 * E06-P6 — Enterprise Digital Twin types
 * Digital twin layer above E06 Self Optimization Loop
 */

import type { OptimizationKind } from "../optimization/optimization.types";
import {
  E06_TWIN_BASE,
  E06_TWIN_FREEZE_VERSION,
  E06_TWIN_ID,
  E06_TWIN_VERSION,
  TWIN_DOMAINS,
  TWIN_RUN_PHASES,
  TWIN_STATE_HEALTH,
} from "./twin.constants";

export type TwinDomain = (typeof TWIN_DOMAINS)[number];
export type TwinStateHealth = (typeof TWIN_STATE_HEALTH)[number];
export type TwinRunPhase = (typeof TWIN_RUN_PHASES)[number];

export type TwinStateSignal = {
  field: string;
  value: number;
  /** Weight applied when scoring the signal into twin health */
  weight: number;
  readOnly: true;
};

export type TwinDefinition = {
  id: string;
  name: string;
  domain: TwinDomain;
  description: string;
  /** Bound E06 optimization id used to drive the twin */
  optimizationId: string;
  signals: TwinStateSignal[];
  /** Score (0-100) at or above which the twin state is stable */
  stableThreshold: number;
  optional: boolean;
  readOnly: true;
};

export type TwinStateModel = {
  twinId: string;
  domain: TwinDomain;
  health: TwinStateHealth;
  score: number;
  signalCount: number;
  signals: TwinStateSignal[];
  narrative: string;
  readOnly: true;
};

export type TwinProjection = {
  twinId: string;
  baselineScore: number;
  projectedScore: number;
  delta: number;
  projectedHealth: TwinStateHealth;
  converged: boolean;
  verdict: string;
  readOnly: true;
};

export type TwinSimulationResult = {
  success: boolean;
  twinId: typeof E06_TWIN_ID | string;
  name: string;
  domain: TwinDomain;
  optimizationId: string;
  optimizationKind: OptimizationKind;
  instanceId: string;
  taskId: string;
  traceId: string;
  model: TwinStateModel;
  projection: TwinProjection;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type TwinRegistryManifest = {
  twinId: typeof E06_TWIN_ID;
  version: typeof E06_TWIN_VERSION;
  freezeVersion: typeof E06_TWIN_FREEZE_VERSION;
  base: typeof E06_TWIN_BASE;
  twinCount: number;
  domains: TwinDomain[];
  twins: TwinDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
