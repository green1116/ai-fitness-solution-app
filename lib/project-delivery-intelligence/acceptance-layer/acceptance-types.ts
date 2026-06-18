import type {
  AcceptanceCheckStatus,
  AcceptanceCriteriaCategory,
  ProjectDeliveryIntelligenceMode,
  PDI_FREEZE_TAG,
} from "../shared/constants";
import type { MilestoneRegistry } from "../project-foundation/project-types";
import type { ProjectRegistry } from "../project-foundation/project-types";
import type { ExecutionContext } from "../execution-layer/execution-types";
import type { DeliveryIssueRegistry, DeliveryRiskRegistry } from "../risk-issue-layer/risk-issue-types";

export type { AcceptanceCheckStatus, AcceptanceCriteriaCategory };

export interface AcceptanceCriteriaRecord {
  criteriaId: string;
  projectId: string;
  requirementId?: string;
  decisionId?: string;
  name: string;
  category: AcceptanceCriteriaCategory;
}

export interface AcceptanceCriteriaRegistry {
  registryId: string;
  records: AcceptanceCriteriaRecord[];
  count: number;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface AcceptanceCheckRecord {
  checkId: string;
  criteriaId: string;
  projectId: string;
  status: AcceptanceCheckStatus;
  confidence: number;
}

export interface AcceptanceCheckRegistry {
  registryId: string;
  records: AcceptanceCheckRecord[];
  count: number;
  passCount: number;
  warningCount: number;
  failCount: number;
  passRate: number;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface DeliveryReadinessAssessment {
  assessmentId: string;
  milestoneCompletionRate: number;
  taskCompletionRate: number;
  riskClosureRate: number;
  issueClosureRate: number;
  acceptancePassRate: number;
  readinessScore: number;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface ProjectDeliveryFoundationStats {
  projectCount: number;
  milestoneCount: number;
  taskCount: number;
  riskCount: number;
  issueCount: number;
  criteriaCount: number;
  checkCount: number;
  passCount: number;
  readinessScore: number;
}

export interface ProjectDeliveryFoundationContext {
  contextId: string;
  projects: ProjectRegistry;
  milestones: MilestoneRegistry;
  execution: ExecutionContext;
  risks: DeliveryRiskRegistry;
  issues: DeliveryIssueRegistry;
  acceptanceCriteria: AcceptanceCriteriaRegistry;
  acceptanceChecks: AcceptanceCheckRegistry;
  readiness: DeliveryReadinessAssessment;
  stats: ProjectDeliveryFoundationStats;
  foundationValid: boolean;
  freezeTag: typeof PDI_FREEZE_TAG;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface AcceptanceLayerValidation {
  valid: boolean;
  criteriaCount: number;
  acceptancePassRate: number;
  readinessScore: number;
  foundationValid: boolean;
  summary: string;
}
