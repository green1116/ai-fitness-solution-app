import type {
  DeliveryIssueSeverity,
  DeliveryIssueStatus,
  DeliveryRiskCategory,
  DeliveryRiskLevel,
  ProjectDeliveryIntelligenceMode,
} from "../shared/constants";

export type {
  DeliveryIssueSeverity,
  DeliveryIssueStatus,
  DeliveryRiskCategory,
  DeliveryRiskLevel,
};

export interface DeliveryRiskRecord {
  riskId: string;
  projectId: string;
  riskLevel: DeliveryRiskLevel;
  riskCategory: DeliveryRiskCategory;
  reasonCodes: string[];
  riskScore: number;
}

export interface DeliveryIssueRecord {
  issueId: string;
  projectId: string;
  riskId: string;
  severity: DeliveryIssueSeverity;
  status: DeliveryIssueStatus;
  riskScore: number;
}

export interface DeliveryRiskRegistry {
  registryId: string;
  records: DeliveryRiskRecord[];
  count: number;
  highRiskCount: number;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface DeliveryIssueRegistry {
  registryId: string;
  records: DeliveryIssueRecord[];
  count: number;
  openIssueCount: number;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface ProjectRiskIssueSummary {
  projectId: string;
  riskCount: number;
  issueCount: number;
  highRiskCount: number;
  openIssueCount: number;
  maxRiskScore: number;
}

export interface RiskIssueContext {
  contextId: string;
  summaries: ProjectRiskIssueSummary[];
  risks: DeliveryRiskRecord[];
  issues: DeliveryIssueRecord[];
  summary: string;
  highRiskCount: number;
  openIssueCount: number;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface RiskIssueLayerValidation {
  valid: boolean;
  riskCount: number;
  issueCount: number;
  highRiskCount: number;
  openIssueCount: number;
  summary: string;
}
