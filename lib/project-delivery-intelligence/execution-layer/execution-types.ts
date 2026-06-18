import type {
  ExecutionStatus,
  MilestonePhase,
  ProjectDeliveryIntelligenceMode,
} from "../shared/constants";

export type { ExecutionStatus };

export interface ExecutionTaskRecord {
  taskId: string;
  milestoneId: string;
  requirementId?: string;
  productId?: string;
  supplierId?: string;
  name: string;
  status: ExecutionStatus;
}

export interface ExecutionTaskRegistry {
  registryId: string;
  records: ExecutionTaskRecord[];
  count: number;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface ExecutionStatusCoverage {
  totalTasks: number;
  plannedCount: number;
  inProgressCount: number;
  blockedCount: number;
  completedCount: number;
  coverageRatio: number;
  progressPercent: number;
}

export interface ExecutionProcurementLink {
  linkId: string;
  taskId: string;
  requirementId: string;
  decisionId: string;
  supplierId: string;
  productId: string;
  procurementLevel: string;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface ExecutionDecisionLink {
  linkId: string;
  taskId: string;
  requirementId: string;
  decisionId: string;
  productId: string;
  decisionLevel: string;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface ExecutionContextEntry {
  projectId: string;
  milestoneId: string;
  taskId: string;
  status: ExecutionStatus;
  decision?: ExecutionDecisionLink;
  procurement?: ExecutionProcurementLink;
}

export interface ExecutionContext {
  contextId: string;
  entries: ExecutionContextEntry[];
  tasks: ExecutionTaskRecord[];
  procurementLinks: ExecutionProcurementLink[];
  decisionLinks: ExecutionDecisionLink[];
  statusCoverage: ExecutionStatusCoverage;
  mode: ProjectDeliveryIntelligenceMode;
}

export interface ExecutionLayerValidation {
  valid: boolean;
  taskCount: number;
  statusCoverage: number;
  procurementLinkCount: number;
  decisionLinkCount: number;
  summary: string;
}

export type ExecutionTaskTemplate = {
  name: string;
  status: ExecutionStatus;
};

export const EXECUTION_TASK_TEMPLATES: Record<MilestonePhase, ExecutionTaskTemplate[]> = {
  design: [
    { name: "requirement analysis", status: "completed" },
    { name: "solution design", status: "in-progress" },
    { name: "blueprint confirmation", status: "planned" },
  ],
  procurement: [
    { name: "supplier selection", status: "in-progress" },
    { name: "quotation comparison", status: "planned" },
    { name: "purchase order", status: "planned" },
  ],
  installation: [
    { name: "site entry", status: "planned" },
    { name: "installation", status: "planned" },
    { name: "debugging", status: "planned" },
  ],
  acceptance: [
    { name: "initial inspection", status: "planned" },
    { name: "correction", status: "planned" },
    { name: "final acceptance", status: "planned" },
  ],
};
