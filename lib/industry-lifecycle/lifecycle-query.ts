import { validateLifecycleContextRegistry } from "./lifecycle-context";
import {
  buildIndustryLifecycles,
  getLifecyclesBySubject,
  getLifecyclesByType,
  validateLifecycleRegistry,
} from "./lifecycle-registry";
import type {
  IndustryLifecycle,
  IndustryLifecycleValidation,
  RegistryValidation,
  LifecycleQuery,
  LifecycleQueryResult,
} from "./shared/types";
import {
  CANONICAL_LIFECYCLE_QUERY,
  CANONICAL_LIFECYCLE_SUBJECT_ID,
  TOP_LIFECYCLE_SCORE_THRESHOLD,
} from "./shared/types";

function applyLifecycleQuery(input: LifecycleQuery, source: IndustryLifecycle[]): IndustryLifecycle[] {
  let lifecycles = [...source];

  if (input.subjectId) {
    lifecycles = lifecycles.filter((lifecycle) => lifecycle.subjectId === input.subjectId);
  }

  if (input.lifecycleType) {
    lifecycles = lifecycles.filter((lifecycle) => lifecycle.lifecycleType === input.lifecycleType);
  }

  if (input.lifecycleStatus) {
    lifecycles = lifecycles.filter(
      (lifecycle) => lifecycle.lifecycleStatus === input.lifecycleStatus,
    );
  }

  if (input.minLifecycleScore !== undefined) {
    lifecycles = lifecycles.filter(
      (lifecycle) => lifecycle.score.totalLifecycleScore >= input.minLifecycleScore!,
    );
  }

  if (input.limit !== undefined) {
    lifecycles = lifecycles.slice(0, input.limit);
  }

  return lifecycles;
}

function toQueryResult(query: LifecycleQuery, lifecycles: IndustryLifecycle[]): LifecycleQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.lifecycleType ?? "all-types",
    query.lifecycleStatus ?? "all-status",
    query.minLifecycleScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `lifecycle-query-${queryParts.join("-")}`,
    query,
    lifecycles,
    hitCount: lifecycles.length,
    lifecycleReady: lifecycles.length > 0,
  };
}

export function findSupplierLifecycles(limit = 5): LifecycleQueryResult {
  return toQueryResult(
    { lifecycleType: "supplier", limit },
    applyLifecycleQuery({ lifecycleType: "supplier", limit }, getLifecyclesByType("supplier")),
  );
}

export function findBrandLifecycles(limit = 5): LifecycleQueryResult {
  return toQueryResult(
    { lifecycleType: "brand", limit },
    applyLifecycleQuery({ lifecycleType: "brand", limit }, getLifecyclesByType("brand")),
  );
}

export function findTenderLifecycles(limit = 5): LifecycleQueryResult {
  return toQueryResult(
    { lifecycleType: "tender", limit },
    applyLifecycleQuery({ lifecycleType: "tender", limit }, getLifecyclesByType("tender")),
  );
}

export function findPartnershipLifecycles(limit = 5): LifecycleQueryResult {
  return toQueryResult(
    { lifecycleType: "partnership", limit },
    applyLifecycleQuery(
      { lifecycleType: "partnership", limit },
      getLifecyclesByType("partnership"),
    ),
  );
}

export function findTopLifecycles(limit = 5): LifecycleQueryResult {
  return toQueryResult(
    { minLifecycleScore: TOP_LIFECYCLE_SCORE_THRESHOLD, limit },
    applyLifecycleQuery(
      { minLifecycleScore: TOP_LIFECYCLE_SCORE_THRESHOLD, limit },
      buildIndustryLifecycles(),
    ),
  );
}

export function executeLifecycleQuery(query: LifecycleQuery = {}): LifecycleQueryResult {
  return toQueryResult(query, applyLifecycleQuery(query, buildIndustryLifecycles()));
}

export function validateLifecycleQueryRegistry(): RegistryValidation {
  const canonical = executeLifecycleQuery(CANONICAL_LIFECYCLE_QUERY);
  const suppliers = findSupplierLifecycles(3);
  const brands = findBrandLifecycles(3);
  const tenders = findTenderLifecycles(3);
  const partnerships = findPartnershipLifecycles(3);
  const top = findTopLifecycles(5);
  const subject = getLifecyclesBySubject(CANONICAL_LIFECYCLE_SUBJECT_ID);

  const valid =
    canonical.lifecycleReady &&
    canonical.hitCount >= 1 &&
    suppliers.hitCount >= 1 &&
    brands.hitCount >= 1 &&
    tenders.hitCount >= 2 &&
    partnerships.hitCount >= 1 &&
    top.hitCount >= 3 &&
    subject.length >= 1 &&
    canonical.lifecycles.every(
      (lifecycle) =>
        lifecycle.score.feasibility > 0 &&
        lifecycle.score.readiness > 0 &&
        lifecycle.score.impact > 0 &&
        lifecycle.score.urgency > 0 &&
        lifecycle.score.confidence > 0 &&
        lifecycle.score.pipelineStrength > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `lifecycle-query canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}

export function validateIndustryLifecycle(): IndustryLifecycleValidation {
  const lifecycleRegistry = validateLifecycleRegistry();
  const lifecycleContext = validateLifecycleContextRegistry();
  const lifecycleQuery = validateLifecycleQueryRegistry();

  return {
    valid: lifecycleRegistry.valid && lifecycleContext.valid && lifecycleQuery.valid,
    lifecycleRegistry,
    lifecycleContext,
    lifecycleQuery,
  };
}
