import {
  buildRequirementRegistryRecords,
  executeRequirementQuery,
  findRequirementByBrand,
  findRequirementByKind,
  findRequirementByPriority,
  findRequirementByTender,
  findTopRequirementRecords,
} from "./requirement-registry";
import type { RequirementQuery, RequirementValidation } from "./shared/types";
import {
  CANONICAL_REQUIREMENT_QUERY,
  HIGH_PRIORITY_REQUIREMENT_THRESHOLD,
  TOP_REQUIREMENT_SCORE_THRESHOLD,
} from "./shared/types";

export function findRequirements(query: RequirementQuery = {}) {
  return executeRequirementQuery(query);
}

export function findRequirementsByTender(tenderId: string, limit?: number) {
  return findRequirementByTender(tenderId, limit);
}

export function findRequirementsByBrand(brandId: string, limit?: number) {
  return findRequirementByBrand(brandId, limit);
}

export function findRequirementsByKind(
  kind: Parameters<typeof findRequirementByKind>[0],
  limit?: number,
) {
  return findRequirementByKind(kind, limit);
}

export function findRequirementsByPriority(
  priority: Parameters<typeof findRequirementByPriority>[0],
  limit?: number,
) {
  return findRequirementByPriority(priority, limit);
}

export function findTopRequirements(limit = 5) {
  return findTopRequirementRecords(limit);
}

export function validateRequirementQueryRegistry(): RequirementValidation {
  const canonical = executeRequirementQuery(CANONICAL_REQUIREMENT_QUERY);
  const byTender = findRequirementByTender("tender-sh-commercial-gym-2025-001");
  const byBrand = findRequirementByBrand("brand-life-fitness");
  const byKind = findRequirementByKind("equipment", 5);
  const byPriority = findRequirementByPriority("high", 5);
  const top = findTopRequirementRecords(5);
  const all = buildRequirementRegistryRecords();

  const valid =
    canonical.length >= 1 &&
    byTender.length >= 1 &&
    byKind.length >= 1 &&
    byPriority.length >= 1 &&
    top.length >= 3 &&
    all.length >= 30 &&
    top[0]!.score.totalRequirementScore >= TOP_REQUIREMENT_SCORE_THRESHOLD;

  return {
    valid,
    count: canonical.length,
    summary: `requirement-query canonical=${canonical.length} tender=${byTender.length} brand=${byBrand.length} kind=${byKind.length} top=${top.length} valid=${valid}`,
  };
}

export {
  CANONICAL_REQUIREMENT_QUERY,
  HIGH_PRIORITY_REQUIREMENT_THRESHOLD,
  TOP_REQUIREMENT_SCORE_THRESHOLD,
};
