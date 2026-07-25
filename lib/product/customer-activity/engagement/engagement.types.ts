/**
 * Product Customer Activity — Engagement types
 */

import type { ENGAGEMENT_LEVELS } from "../activity/activity.constants";

export type EngagementLevel = (typeof ENGAGEMENT_LEVELS)[number];
export type EngagementMetadata = Record<string, unknown>;

export type CustomerActivityEngagement = {
  id: string;
  customerId: string;
  level: EngagementLevel;
  score: number;
  detail: string;
  metadata: EngagementMetadata;
  scoredAt: string;
};

export type ScoreEngagementInput = {
  id?: string;
  customerId: string;
  level: EngagementLevel;
  score: number;
  metadata?: EngagementMetadata;
};
