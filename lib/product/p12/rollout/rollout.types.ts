/**
 * Product P12 — Rollout types
 */

import type { ROLLOUT_STRATEGIES } from "../launch/launch.constants";

export type RolloutStrategy = (typeof ROLLOUT_STRATEGIES)[number];
export type RolloutMetadata = Record<string, unknown>;

export type LaunchRollout = {
  id: string;
  launchId: string;
  strategy: RolloutStrategy;
  percent: number;
  cohorts: string[];
  detail: string;
  metadata: RolloutMetadata;
  startedAt: string;
  completedAt?: string;
};

export type StartRolloutInput = {
  id?: string;
  launchId: string;
  strategy: RolloutStrategy;
  percent?: number;
  cohorts?: string[];
  metadata?: RolloutMetadata;
};

export type AdvanceRolloutInput = {
  rolloutId: string;
  percent: number;
  complete?: boolean;
};
