import type { DIFFERENTIATION_BIDDER_BRANDS, PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";

export const COMPETITIVE_ADVANTAGE_RUNTIME_VERSION = "v19.2-competitive-advantage-1" as const;

export interface AdvantageMatrix {
  brandAdvantage: string[];
  serviceAdvantage: string[];
  deliveryAdvantage: string[];
  supportAdvantage: string[];
}

export interface CompetitiveAdvantageSnapshot {
  snapshotId: string;
  bidderBrand: (typeof DIFFERENTIATION_BIDDER_BRANDS)[number];
  matrix: AdvantageMatrix;
  advantageScore: number;
}

export interface CompetitiveAdvantageRuntimePayload {
  version: typeof COMPETITIVE_ADVANTAGE_RUNTIME_VERSION;
  differentiationVersion: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  snapshot: CompetitiveAdvantageSnapshot;
  advantageScore: number;
  summary: string;
}
