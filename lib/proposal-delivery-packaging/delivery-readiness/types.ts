import type { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";

export const DELIVERY_READINESS_RUNTIME_VERSION = "v19.5-delivery-readiness-1" as const;

export interface DeliveryReadinessAssessment {
  assessmentId: string;
  proposalLabel: string;
  bidderBrand: string;
  completeness: number;
  explainability: number;
  budgetAlignment: number;
  equipmentAlignment: number;
  bidderAlignment: number;
  roiAlignment: number;
  deliveryReadinessScore: number;
}

export interface DeliveryReadinessRuntimePayload {
  version: typeof DELIVERY_READINESS_RUNTIME_VERSION;
  packagingVersion: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  assessments: DeliveryReadinessAssessment[];
  averageDeliveryReadinessScore: number;
  summary: string;
}
