/**
 * Commercialization P6 — Customer value / health / score types
 */

import type { HEALTH_BANDS } from "../kpi/kpi.constants";

export type HealthBand = (typeof HEALTH_BANDS)[number];

export type CustomerValueProfile = {
  id: string;
  accountRef: string;
  lifetimeValue: number;
  expansionPotential: number;
  currency: string;
  detail: string;
  createdAt: string;
};

export type CaptureCustomerValueInput = {
  id?: string;
  accountRef: string;
  lifetimeValue: number;
  expansionPotential?: number;
  currency?: string;
};

export type CustomerHealthProfile = {
  id: string;
  accountRef: string;
  band: HealthBand;
  engagementScore: number;
  supportLoad: number;
  detail: string;
  assessedAt: string;
};

export type AssessCustomerHealthInput = {
  id?: string;
  accountRef: string;
  engagementScore: number;
  supportLoad?: number;
};

export type CustomerScoreCard = {
  id: string;
  accountRef: string;
  valueScore: number;
  healthScore: number;
  compositeScore: number;
  band: HealthBand;
  detail: string;
  scoredAt: string;
};

export type ScoreCustomerInput = {
  id?: string;
  accountRef: string;
};
