import { buildProjectRegistry } from "@/lib/project-delivery-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import { buildPerformanceRegistry } from "../performance-foundation/performance-registry";
import {
  rankBenchmarkRecords,
  type ProjectBenchmarkRecord,
  type ProjectBenchmarkRegistry,
} from "./benchmark-types";

let cachedRegistry: ProjectBenchmarkRegistry | undefined;

export function buildProjectBenchmarkRegistry(): ProjectBenchmarkRegistry {
  if (cachedRegistry) return cachedRegistry;

  const performanceByProject = new Map(
    buildPerformanceRegistry().records.map((record) => [record.projectId, record]),
  );

  const drafts: Omit<ProjectBenchmarkRecord, "rank">[] = buildProjectRegistry().records.map(
    (project) => {
      const performance = performanceByProject.get(project.projectId);

      return {
        entityId: project.projectId,
        entityName: project.name,
        projectId: project.projectId,
        projectCount: 1,
        averageScore: performance?.score ?? 0,
      };
    },
  );

  const records = rankBenchmarkRecords<ProjectBenchmarkRecord>(drafts);

  cachedRegistry = {
    registryId: "pi-project-benchmark-registry-v46-p2",
    records,
    count: records.length,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
