/**
 * Product P11 — Feature types
 */

import type { FEATURE_FLAGS } from "../release/release.constants";

export type FeatureFlag = (typeof FEATURE_FLAGS)[number];
export type FeatureMetadata = Record<string, unknown>;

export type ReleaseFeature = {
  id: string;
  releaseId: string;
  code: string;
  name: string;
  flag: FeatureFlag;
  detail: string;
  metadata: FeatureMetadata;
  createdAt: string;
};

export type RegisterFeatureInput = {
  id?: string;
  releaseId: string;
  code: string;
  name: string;
  flag?: FeatureFlag;
  metadata?: FeatureMetadata;
};

export type UpdateFeatureFlagInput = {
  featureId: string;
  flag: FeatureFlag;
};
