export const CUSTOMER_SUCCESS_VERSION = "v8.6-customer-success-1" as const;

export type CustomerHealthStatus = "healthy" | "attention" | "at-risk" | "critical";

export interface CustomerHealth {
  healthId: string;
  customerId: string;
  status: CustomerHealthStatus;
  score: number;
  summary: string;
}

export interface AdoptionMetrics {
  metricsId: string;
  workspaceUtilization: number;
  activeUsers: number;
  generatedPlans: number;
  generatedBudgets: number;
  proposalExports: number;
  tenderExports: number;
  summary: string;
}

export interface EngagementProfile {
  profileId: string;
  loginFrequency: number;
  featureUsage: number;
  projectActivity: number;
  deliveryParticipation: number;
  summary: string;
}

export interface RenewalProfile {
  profileId: string;
  renewalProbability: number;
  expansionOpportunity: number;
  riskIndicators: string[];
  recommendations: string[];
  summary: string;
}

export interface SuccessScore {
  scoreId: string;
  overallScore: number;
  healthScore: number;
  adoptionScore: number;
  engagementScore: number;
  renewalScore: number;
}

export interface SuccessSummary {
  summaryId: string;
  version: typeof CUSTOMER_SUCCESS_VERSION;
  customerId: string;
  healthStatus: CustomerHealthStatus;
  successScore: SuccessScore;
  summary: string;
}

export interface CustomerSuccessResponse {
  version: typeof CUSTOMER_SUCCESS_VERSION;
  health: CustomerHealth;
  adoption: AdoptionMetrics;
  engagement: EngagementProfile;
  renewal: RenewalProfile;
  summary: SuccessSummary;
}
