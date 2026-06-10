import type { PROPOSAL_GENERATION_VERSION } from "../shared/types";

export const EXECUTIVE_SUMMARY_RUNTIME_VERSION = "v11.0-executive-summary-runtime-1" as const;

export interface ProjectOverview {
  overviewId: string;
  projectName: string;
  clientName: string;
  projectScope: string;
  deliveryWindow: string;
}

export interface BusinessObjective {
  objectiveId: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface ExpectedBenefit {
  benefitId: string;
  category: string;
  description: string;
  impact: string;
}

export interface SuccessMetric {
  metricId: string;
  name: string;
  target: string;
  measurement: string;
}

export interface ExecutiveSummaryRuntimePayload {
  version: typeof EXECUTIVE_SUMMARY_RUNTIME_VERSION;
  proposalVersion: typeof PROPOSAL_GENERATION_VERSION;
  projectOverview: ProjectOverview;
  businessObjectives: BusinessObjective[];
  expectedBenefits: ExpectedBenefit[];
  successMetrics: SuccessMetric[];
  summary: string;
}
