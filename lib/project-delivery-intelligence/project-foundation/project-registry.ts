import { buildTenderRegistryRecords } from "@/lib/tender-knowledge-graph";
import { PDI_CANONICAL_ID } from "../shared/constants";
import type { ProjectRecord } from "../shared/types";
import type { ProjectRegistry } from "./project-types";

const PROJECT_DEFINITIONS: Array<{
  projectId: string;
  name: string;
  region: string;
  status: ProjectRecord["status"];
}> = [
  {
    projectId: "pdi-project-school-gym",
    name: "School Gym Project",
    region: "east-china",
    status: "active",
  },
  {
    projectId: "pdi-project-enterprise-fitness",
    name: "Enterprise Fitness Center",
    region: "north-china",
    status: "planned",
  },
  {
    projectId: "pdi-project-sports-hall",
    name: "Sports Hall Upgrade",
    region: "south-china",
    status: "active",
  },
  {
    projectId: "pdi-project-community-fitness",
    name: "Community Fitness Project",
    region: "west-china",
    status: "planned",
  },
  {
    projectId: "pdi-project-corporate-wellness",
    name: "Corporate Wellness Center",
    region: "national",
    status: "completed",
  },
];

let cachedRegistry: ProjectRegistry | undefined;

export function buildProjectRegistry(): ProjectRegistry {
  if (cachedRegistry) return cachedRegistry;

  const tenders = buildTenderRegistryRecords();
  const records: ProjectRecord[] = PROJECT_DEFINITIONS.map((definition, index) => ({
    projectId: definition.projectId,
    tenderId: tenders[index % tenders.length]?.tenderId ?? tenders[0]!.tenderId,
    name: definition.name,
    status: definition.status,
    region: definition.region,
  }));

  cachedRegistry = {
    registryId: "pdi-project-registry-v45-p1",
    records,
    count: records.length,
    mode: PDI_CANONICAL_ID,
  };

  return cachedRegistry;
}
