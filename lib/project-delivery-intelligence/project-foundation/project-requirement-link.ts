import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildProjectRegistry } from "./project-registry";
import type { ProjectRequirementLink } from "./project-types";

let cachedLinks: ProjectRequirementLink[] | undefined;

export function buildProjectRequirementLinks(): ProjectRequirementLink[] {
  if (cachedLinks) return cachedLinks;

  const requirements = buildRequirementRegistryRecords();
  const requirementsByTender = new Map<string, string[]>();

  for (const requirement of requirements) {
    const existing = requirementsByTender.get(requirement.tenderId) ?? [];
    existing.push(requirement.requirementId);
    requirementsByTender.set(requirement.tenderId, existing);
  }

  const links: ProjectRequirementLink[] = [];

  for (const project of buildProjectRegistry().records) {
    const requirementIds = requirementsByTender.get(project.tenderId) ?? [];
    for (const requirementId of requirementIds) {
      links.push({
        linkId: `pdi-project-requirement-${project.projectId}-${requirementId}`,
        projectId: project.projectId,
        requirementId,
        tenderId: project.tenderId,
        mode: PDI_CANONICAL_ID,
      });
    }
  }

  cachedLinks = links;
  return links;
}
