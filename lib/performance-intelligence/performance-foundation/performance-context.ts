import { buildProjectDeliveryFoundationContext } from "@/lib/project-delivery-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import type { PerformanceContext } from "../shared/types";
import { buildPerformanceRegistry } from "./performance-registry";

let cachedContext: PerformanceContext | undefined;

export function buildPerformanceContext(): PerformanceContext {
  if (cachedContext) return cachedContext;

  const foundation = buildProjectDeliveryFoundationContext();
  const registry = buildPerformanceRegistry();

  cachedContext = {
    contextId: "pi-performance-context-v46-p1",
    projects: foundation.projects.records.map((project) => ({
      projectId: project.projectId,
      name: project.name,
      region: project.region,
    })),
    performances: registry.records,
    averageScore: registry.averageScore,
    mode: PI_CANONICAL_ID,
  };

  return cachedContext;
}
