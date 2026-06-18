import { buildBrandRegistryRecords } from "@/lib/brand-intelligence-network";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { buildProjectRequirementLinks } from "@/lib/project-delivery-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import { buildPerformanceRegistry } from "../performance-foundation/performance-registry";
import {
  type BrandBenchmarkRecord,
  type BrandBenchmarkRegistry,
  rankBenchmarkRecords,
} from "./benchmark-types";

function buildPerformanceByProject(): Map<string, number> {
  return new Map(
    buildPerformanceRegistry().records.map((record) => [record.projectId, record.score]),
  );
}

function buildProjectIdsByBrand(): Map<string, Set<string>> {
  const requirementsById = new Map(
    buildRequirementRegistryRecords().map((requirement) => [
      requirement.requirementId,
      requirement.brandId,
    ]),
  );
  const map = new Map<string, Set<string>>();

  for (const link of buildProjectRequirementLinks()) {
    const brandId = requirementsById.get(link.requirementId);
    if (!brandId) continue;

    const projects = map.get(brandId) ?? new Set<string>();
    projects.add(link.projectId);
    map.set(brandId, projects);
  }

  return map;
}

let cachedRegistry: BrandBenchmarkRegistry | undefined;

export function buildBrandBenchmarkRegistry(): BrandBenchmarkRegistry {
  if (cachedRegistry) return cachedRegistry;

  const performanceByProject = buildPerformanceByProject();
  const projectsByBrand = buildProjectIdsByBrand();
  const drafts: Omit<BrandBenchmarkRecord, "rank">[] = [];

  for (const brand of buildBrandRegistryRecords()) {
    const projectIds = projectsByBrand.get(brand.brandId) ?? new Set<string>();
    const scores = [...projectIds]
      .map((projectId) => performanceByProject.get(projectId))
      .filter((score): score is number => score !== undefined);

    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : Math.round(brand.score.totalBrandScore);

    drafts.push({
      entityId: brand.brandId,
      entityName: brand.brandName,
      projectCount: scores.length,
      averageScore,
    });
  }

  const records = rankBenchmarkRecords<BrandBenchmarkRecord>(
    drafts.filter((record) => record.projectCount > 0 || record.averageScore > 0),
  );

  cachedRegistry = {
    registryId: "pi-brand-benchmark-registry-v46-p2",
    records,
    count: records.length,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
