import { buildSupplierRegistry, runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { buildProjectRegistry, buildProjectRequirementLinks } from "@/lib/project-delivery-intelligence";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import { buildPerformanceRegistry } from "../performance-foundation/performance-registry";
import {
  rankBenchmarkRecords,
  type SupplierBenchmarkRecord,
  type SupplierBenchmarkRegistry,
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

function buildProjectIdsBySupplier(): Map<string, Set<string>> {
  const requirementToProject = new Map<string, Set<string>>();
  for (const link of buildProjectRequirementLinks()) {
    const projects = requirementToProject.get(link.requirementId) ?? new Set<string>();
    projects.add(link.projectId);
    requirementToProject.set(link.requirementId, projects);
  }

  const projectsByBrand = buildProjectIdsByBrand();
  const map = new Map<string, Set<string>>();

  for (const decision of runProcurementDecisionEngine()) {
    if (!decision.supplierId) continue;

    const projects = map.get(decision.supplierId) ?? new Set<string>();
    const linkedProjects = requirementToProject.get(decision.requirementId) ?? new Set<string>();
    for (const projectId of linkedProjects) {
      projects.add(projectId);
    }
    map.set(decision.supplierId, projects);
  }

  for (const supplier of buildSupplierRegistry().records) {
    const projects = map.get(supplier.id) ?? new Set<string>();

    for (const brandId of supplier.brandIds) {
      const brandProjects = projectsByBrand.get(brandId) ?? new Set<string>();
      for (const projectId of brandProjects) {
        projects.add(projectId);
      }
    }

    if (projects.size === 0) {
      for (const project of buildProjectRegistry().records) {
        if (supplier.region === "national" || project.region === supplier.region) {
          projects.add(project.projectId);
        }
      }
    }

    if (projects.size > 0) {
      map.set(supplier.id, projects);
    }
  }

  return map;
}

let cachedRegistry: SupplierBenchmarkRegistry | undefined;

export function buildSupplierBenchmarkRegistry(): SupplierBenchmarkRegistry {
  if (cachedRegistry) return cachedRegistry;

  const performanceByProject = buildPerformanceByProject();
  const projectsBySupplier = buildProjectIdsBySupplier();
  const drafts: Omit<SupplierBenchmarkRecord, "rank">[] = [];

  for (const supplier of buildSupplierRegistry().records) {
    const projectIds = projectsBySupplier.get(supplier.id) ?? new Set<string>();
    const scores = [...projectIds]
      .map((projectId) => performanceByProject.get(projectId))
      .filter((score): score is number => score !== undefined);

    if (scores.length === 0) continue;

    drafts.push({
      entityId: supplier.id,
      entityName: supplier.name,
      projectCount: scores.length,
      averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    });
  }

  const records = rankBenchmarkRecords<SupplierBenchmarkRecord>(drafts);

  cachedRegistry = {
    registryId: "pi-supplier-benchmark-registry-v46-p2",
    records,
    count: records.length,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
