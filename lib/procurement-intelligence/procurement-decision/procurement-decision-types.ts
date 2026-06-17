import type { PI_CANONICAL_ID } from "../shared/constants";
import type { ProcurementLevel, ProcurementMatchRecord } from "../shared/types";

export type ProcurementDecisionLevel = ProcurementLevel;

export interface ProcurementDecisionRecord {
  requirementId: string;
  decisionId: string;
  supplierId: string;
  productId: string;
  procurementLevel: ProcurementDecisionLevel;
  totalScore: number;
  rationale: string[];
}

export interface ProcurementRankedCandidate {
  rank: number;
  requirementId: string;
  decisionId: string;
  supplierId: string;
  productId: string;
  matchScore: number;
  capabilityFitScore: number;
  decisionFitScore: number;
  brandFitScore: number;
  totalScore: number;
  mode: typeof PI_CANONICAL_ID;
}

export interface ProcurementRankingResult {
  rankingId: string;
  requirementId: string;
  candidates: ProcurementRankedCandidate[];
  optimalSupplierId: string;
  alternativeSupplierIds: string[];
  mode: typeof PI_CANONICAL_ID;
}

export interface ProcurementSimulationResult {
  simulationId: string;
  requirementId: string;
  supplierId: string;
  productId: string;
  baselineSupplierId: string;
  supplierDelta: number;
  decisionDelta: number;
  confidenceDelta: number;
  mode: typeof PI_CANONICAL_ID;
}

export interface ProcurementRecommendationResult {
  requirementId: string;
  decisionId: string;
  optimalSupplierId: string;
  optimalProductId: string;
  backupSupplierIds: string[];
  backupProductIds: string[];
  procurementLevel: ProcurementDecisionLevel;
  recommendationReason: string[];
  mode: typeof PI_CANONICAL_ID;
}

export interface ProcurementDecisionValidation {
  valid: boolean;
  rankingReady: boolean;
  simulationReady: boolean;
  recommendationReady: boolean;
  decisionEngineReady: boolean;
  decisionCount: number;
  preferredCount: number;
  acceptableCount: number;
  fallbackCount: number;
  deferCount: number;
  summary: string;
}

export type { ProcurementMatchRecord };
