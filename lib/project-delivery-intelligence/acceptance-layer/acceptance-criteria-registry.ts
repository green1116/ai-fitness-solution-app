import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { runEquivalentDecisionEngine } from "@/lib/equivalent-product-intelligence";
import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildProjectRegistry } from "../project-foundation/project-registry";
import { buildProjectRequirementLinks } from "../project-foundation/project-requirement-link";
import { buildExecutionContext } from "../execution-layer/execution-context";
import type { AcceptanceCriteriaRecord, AcceptanceCriteriaRegistry } from "./acceptance-types";

function buildRequirementCriteria(): AcceptanceCriteriaRecord[] {
  const requirementsById = new Map(
    buildRequirementRegistryRecords().map((requirement) => [requirement.requirementId, requirement]),
  );

  return buildProjectRequirementLinks()
    .filter((link) => requirementsById.has(link.requirementId))
    .map((link) => ({
      criteriaId: `pdi-criteria-requirement-${link.projectId}-${link.requirementId}`,
      projectId: link.projectId,
      requirementId: link.requirementId,
      name: `requirement acceptance for ${link.requirementId}`,
      category: "requirement" as const,
    }));
}

function buildProductCriteria(): AcceptanceCriteriaRecord[] {
  const records: AcceptanceCriteriaRecord[] = [];

  for (const link of buildProjectRequirementLinks()) {
    const decision = runEquivalentDecisionEngine(link.requirementId);
    if (!decision) continue;

    records.push({
      criteriaId: `pdi-criteria-product-${link.projectId}-${link.requirementId}`,
      projectId: link.projectId,
      requirementId: link.requirementId,
      decisionId: decision.decisionId,
      name: `product decision acceptance for ${link.requirementId}`,
      category: "product",
    });
  }

  return records;
}

function buildProcurementCriteria(): AcceptanceCriteriaRecord[] {
  const procurementByProject = new Map<string, number>();

  for (const entry of buildExecutionContext().entries) {
    if (!entry.procurement) continue;
    procurementByProject.set(entry.projectId, (procurementByProject.get(entry.projectId) ?? 0) + 1);
  }

  return [...procurementByProject.entries()].map(([projectId, linkCount]) => ({
    criteriaId: `pdi-criteria-procurement-${projectId}`,
    projectId,
    name: `procurement acceptance for ${projectId} (${linkCount} links)`,
    category: "procurement" as const,
  }));
}

function buildExecutionCriteria(): AcceptanceCriteriaRecord[] {
  return buildProjectRegistry().records.map((project) => ({
    criteriaId: `pdi-criteria-execution-${project.projectId}`,
    projectId: project.projectId,
    name: `execution acceptance for ${project.projectId}`,
    category: "execution" as const,
  }));
}

let cachedRegistry: AcceptanceCriteriaRegistry | undefined;

export function buildAcceptanceCriteriaRegistry(): AcceptanceCriteriaRegistry {
  if (cachedRegistry) return cachedRegistry;

  const records = [
    ...buildRequirementCriteria(),
    ...buildProductCriteria(),
    ...buildProcurementCriteria(),
    ...buildExecutionCriteria(),
  ];

  cachedRegistry = {
    registryId: "pdi-acceptance-criteria-registry-v45-p4",
    records,
    count: records.length,
    mode: PDI_CANONICAL_ID,
  };

  return cachedRegistry;
}
