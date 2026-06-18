import {
  PDI_MIN_MILESTONE_COUNT,
  PDI_MIN_PROJECT_COUNT,
  PDI_MIN_REQUIREMENT_LINK_COUNT,
  PDI_MIN_TENDER_LINK_COUNT,
} from "../shared/constants";
import { buildMilestoneRegistry } from "./milestone-registry";
import { buildProjectRegistry } from "./project-registry";
import { buildProjectRequirementLinks } from "./project-requirement-link";
import { buildProjectTenderLinks } from "./project-tender-link";
import type { ProjectFoundationValidation } from "./project-types";

let cachedValidation: ProjectFoundationValidation | undefined;

export function validateProjectFoundation(): ProjectFoundationValidation {
  if (cachedValidation) return cachedValidation;

  const projects = buildProjectRegistry();
  const milestones = buildMilestoneRegistry();
  const tenderLinks = buildProjectTenderLinks();
  const requirementLinks = buildProjectRequirementLinks();

  const projectCount = projects.count;
  const milestoneCount = milestones.count;
  const tenderLinkCount = tenderLinks.length;
  const requirementLinkCount = requirementLinks.length;

  const valid =
    projectCount >= PDI_MIN_PROJECT_COUNT &&
    milestoneCount >= PDI_MIN_MILESTONE_COUNT &&
    tenderLinkCount >= PDI_MIN_TENDER_LINK_COUNT &&
    requirementLinkCount >= PDI_MIN_REQUIREMENT_LINK_COUNT;

  cachedValidation = {
    valid,
    projectCount,
    milestoneCount,
    tenderLinkCount,
    requirementLinkCount,
    summary: `project-foundation projects=${projectCount} milestones=${milestoneCount} tenderLinks=${tenderLinkCount} requirementLinks=${requirementLinkCount} valid=${valid}`,
  };

  return cachedValidation;
}
