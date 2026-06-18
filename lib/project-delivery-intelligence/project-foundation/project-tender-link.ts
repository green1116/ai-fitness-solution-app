import { buildTenderRegistryRecords } from "@/lib/tender-knowledge-graph";
import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildProjectRegistry } from "./project-registry";
import type { ProjectTenderLink } from "./project-types";

let cachedLinks: ProjectTenderLink[] | undefined;

export function buildProjectTenderLinks(): ProjectTenderLink[] {
  if (cachedLinks) return cachedLinks;

  const tenderIds = new Set(buildTenderRegistryRecords().map((tender) => tender.tenderId));
  const links: ProjectTenderLink[] = [];

  for (const project of buildProjectRegistry().records) {
    if (!tenderIds.has(project.tenderId)) continue;

    links.push({
      linkId: `pdi-project-tender-${project.projectId}-${project.tenderId}`,
      projectId: project.projectId,
      tenderId: project.tenderId,
      mode: PDI_CANONICAL_ID,
    });
  }

  cachedLinks = links;
  return links;
}
