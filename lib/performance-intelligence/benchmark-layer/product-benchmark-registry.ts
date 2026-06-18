import { runEquivalentDecisionEngine } from "@/lib/equivalent-product-intelligence";
import { buildProjectRequirementLinks } from "@/lib/project-delivery-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import { buildPerformanceRegistry } from "../performance-foundation/performance-registry";
import {
  rankBenchmarkRecords,
  type ProductBenchmarkRecord,
  type ProductBenchmarkRegistry,
} from "./benchmark-types";

function buildPerformanceByProject(): Map<string, number> {
  return new Map(
    buildPerformanceRegistry().records.map((record) => [record.projectId, record.score]),
  );
}

function buildProjectIdsByProduct(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const link of buildProjectRequirementLinks()) {
    const decision = runEquivalentDecisionEngine(link.requirementId);
    if (!decision?.optimalProductId) continue;

    const projects = map.get(decision.optimalProductId) ?? new Set<string>();
    projects.add(link.projectId);
    map.set(decision.optimalProductId, projects);
  }

  return map;
}

let cachedRegistry: ProductBenchmarkRegistry | undefined;

export function buildProductBenchmarkRegistry(): ProductBenchmarkRegistry {
  if (cachedRegistry) return cachedRegistry;

  const performanceByProject = buildPerformanceByProject();
  const projectsByProduct = buildProjectIdsByProduct();
  const drafts: Omit<ProductBenchmarkRecord, "rank">[] = [];

  for (const [productId, projectIds] of projectsByProduct.entries()) {
    const scores = [...projectIds]
      .map((projectId) => performanceByProject.get(projectId))
      .filter((score): score is number => score !== undefined);

    if (scores.length === 0) continue;

    drafts.push({
      entityId: productId,
      entityName: productId,
      projectCount: scores.length,
      averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    });
  }

  const records = rankBenchmarkRecords<ProductBenchmarkRecord>(drafts);

  cachedRegistry = {
    registryId: "pi-product-benchmark-registry-v46-p2",
    records,
    count: records.length,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
