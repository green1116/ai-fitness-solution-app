/**
 * Product P9 — Satisfaction types
 */

import type { SATISFACTION_LEVELS } from "../customer-health/health.constants";

export type SatisfactionLevel = (typeof SATISFACTION_LEVELS)[number];
export type SatisfactionMetadata = Record<string, unknown>;

export type SatisfactionScore = {
  id: string;
  healthId: string;
  level: SatisfactionLevel;
  csat: number;
  nps: number;
  detail: string;
  metadata: SatisfactionMetadata;
  measuredAt: string;
};

export type CreateSatisfactionInput = {
  id?: string;
  healthId: string;
  csat: number;
  nps: number;
  metadata?: SatisfactionMetadata;
};
