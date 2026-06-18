export type {
  MilestonePhase,
  MilestoneStatus,
  ProjectStatus,
} from "../shared/constants";
export type { MilestoneRecord, ProjectRecord } from "../shared/types";
import type { PDI_CANONICAL_ID } from "../shared/constants";
import type { MilestoneRecord, ProjectRecord } from "../shared/types";

export interface ProjectRegistry {
  registryId: string;
  records: ProjectRecord[];
  count: number;
  mode: typeof PDI_CANONICAL_ID;
}

export interface MilestoneRegistry {
  registryId: string;
  records: MilestoneRecord[];
  count: number;
  mode: typeof PDI_CANONICAL_ID;
}

export interface ProjectTenderLink {
  linkId: string;
  projectId: string;
  tenderId: string;
  mode: typeof PDI_CANONICAL_ID;
}

export interface ProjectRequirementLink {
  linkId: string;
  projectId: string;
  requirementId: string;
  tenderId: string;
  mode: typeof PDI_CANONICAL_ID;
}

export interface ProjectFoundationValidation {
  valid: boolean;
  projectCount: number;
  milestoneCount: number;
  tenderLinkCount: number;
  requirementLinkCount: number;
  summary: string;
}
