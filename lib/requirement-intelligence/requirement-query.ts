import {
  buildRequirementRegistryRecords,
  executeRequirementQuery,
  findRequirementByBrand,
  findRequirementByKind,
  findRequirementByPriority,
  findRequirementByTender,
  findTopRequirementRecords,
} from "./requirement-registry";
import {
  buildRequirementComplianceRecords,
  findSatisfiedRequirements as findComplianceSatisfiedRequirements,
} from "./requirement-compliance/compliance-registry";
import type {
  RequirementKind,
  RequirementPriority,
  RequirementQuery,
  RequirementQuerySnapshot,
  RequirementValidation,
} from "./shared/types";
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

export function findRequirement(query: RequirementQuery = {}) {
  return executeRequirementQuery(query);
}

export function findRequirementByKindQuery(
  kind: RequirementKind,
  limit?: number,
) {
  return findRequirementByKind(kind, limit);
}

export function findRequirementByPriorityQuery(
  priority: RequirementPriority,
  limit?: number,
) {
  return findRequirementByPriority(priority, limit);
}

export function findSatisfiedRequirementRecords(limit?: number) {
  const satisfiedIds = new Set(
    findComplianceSatisfiedRequirements().map((record) => record.requirementId),
  );
  const records = buildRequirementRegistryRecords().filter((record) =>
    satisfiedIds.has(record.requirementId),
  );
  return limit === undefined ? records : records.slice(0, limit);
}

export function findBlockedRequirements(limit?: number) {
  const blockedIds = new Set(
    buildRequirementComplianceRecords()
      .filter((record) => record.complianceStatus === "blocked")
      .map((record) => record.requirementId),
  );
  const records = buildRequirementRegistryRecords().filter((record) =>
    blockedIds.has(record.requirementId),
  );
  return limit === undefined ? records : records.slice(0, limit);
}

export function findCriticalRequirements(limit?: number) {
  return findRequirementByPriority("critical", limit);
}

export function buildRequirementQuerySnapshot(): RequirementQuerySnapshot {
  return {
    canonical: findRequirement(CANONICAL_REQUIREMENT_QUERY),
    byTender: findRequirementByTender("tender-sh-commercial-gym-2025-001"),
    byBrand: findRequirementByBrand("brand-life-fitness"),
    byKind: findRequirementByKindQuery("equipment", 5),
    byPriority: findRequirementByPriorityQuery("high", 5),
    top: findTopRequirements(5),
    satisfied: findSatisfiedRequirementRecords(),
    blocked: findBlockedRequirements(),
    critical: findCriticalRequirements(5),
    all: buildRequirementRegistryRecords(),
  };
}

export function validateRequirementQueryFromSnapshot(
  snapshot: RequirementQuerySnapshot,
): RequirementValidation {
  const valid =
    snapshot.canonical.length >= 1 &&
    snapshot.byTender.length >= 1 &&
    snapshot.byKind.length >= 1 &&
    snapshot.byPriority.length >= 1 &&
    snapshot.top.length >= 3 &&
    snapshot.satisfied.length >= 10 &&
    snapshot.blocked.length >= 1 &&
    snapshot.critical.length >= 1 &&
    snapshot.all.length >= 30 &&
    snapshot.top[0]!.score.totalRequirementScore >= TOP_REQUIREMENT_SCORE_THRESHOLD;

  return {
    valid,
    count: snapshot.canonical.length,
    summary: `requirement-query canonical=${snapshot.canonical.length} tender=${snapshot.byTender.length} brand=${snapshot.byBrand.length} kind=${snapshot.byKind.length} satisfied=${snapshot.satisfied.length} blocked=${snapshot.blocked.length} critical=${snapshot.critical.length} top=${snapshot.top.length} valid=${valid}`,
  };
}

export function validateRequirementQuery(): RequirementValidation {
  return validateRequirementQueryFromSnapshot(buildRequirementQuerySnapshot());
}

export function validateRequirementQueryRegistryFromSnapshot(
  snapshot: RequirementQuerySnapshot,
): RequirementValidation {
  const valid =
    snapshot.canonical.length >= 1 &&
    snapshot.byTender.length >= 1 &&
    snapshot.byKind.length >= 1 &&
    snapshot.byPriority.length >= 1 &&
    snapshot.top.length >= 3 &&
    snapshot.all.length >= 30 &&
    snapshot.top[0]!.score.totalRequirementScore >= TOP_REQUIREMENT_SCORE_THRESHOLD;

  return {
    valid,
    count: snapshot.canonical.length,
    summary: `requirement-query canonical=${snapshot.canonical.length} tender=${snapshot.byTender.length} brand=${snapshot.byBrand.length} kind=${snapshot.byKind.length} top=${snapshot.top.length} valid=${valid}`,
  };
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
