import type {
  MilestonePhase,
  MilestoneStatus,
  PDI_P1_PHASE,
  PDI_P1_TAG,
  ProjectStatus,
} from "./constants";

export interface ProjectRecord {
  projectId: string;
  tenderId: string;
  name: string;
  status: ProjectStatus;
  region: string;
}

export interface MilestoneRecord {
  milestoneId: string;
  projectId: string;
  name: string;
  phase: MilestonePhase;
  targetDate: string;
  status: MilestoneStatus;
}

export interface ProjectDeliveryIntelligencePhase1FreezeMeta {
  tag: typeof PDI_P1_TAG;
  version: typeof PDI_P1_TAG;
  phase: typeof PDI_P1_PHASE;
  valid: boolean;
}
