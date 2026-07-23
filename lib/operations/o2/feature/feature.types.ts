/**
 * Operations O2 — Feature types
 */

import type { FEATURE_ADOPTION_LEVELS } from "../usage/usage.constants";

export type FeatureAdoptionLevel =
  (typeof FEATURE_ADOPTION_LEVELS)[number];
export type FeatureMetadata = Record<string, unknown>;

export type FeatureAdoption = {
  id: string;
  accountRef: string;
  featureKey: string;
  level: FeatureAdoptionLevel;
  activeUsers: number;
  detail: string;
  metadata: FeatureMetadata;
  recordedAt: string;
};

export type RecordFeatureAdoptionInput = {
  id?: string;
  accountRef: string;
  featureKey: string;
  level: FeatureAdoptionLevel;
  activeUsers: number;
  metadata?: FeatureMetadata;
};

export type FeatureMetrics = {
  id: string;
  accountRef: string;
  featureCount: number;
  powerCount: number;
  activeCount: number;
  adoptionRate: number;
  detail: string;
  computedAt: string;
};

export type ComputeFeatureMetricsInput = {
  id?: string;
  accountRef: string;
};
