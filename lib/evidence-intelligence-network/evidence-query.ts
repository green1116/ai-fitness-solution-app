import { buildBrandEvidenceCoverage, buildEvidenceCoverageRecords } from "./evidence-coverage/coverage-registry";
import {
  buildEvidenceRegistryRecords,
  findEvidenceByBrand as registryFindEvidenceByBrand,
  findEvidenceByKind as registryFindEvidenceByKind,
  findTopEvidenceRecords,
} from "./evidence-registry";
import { buildEvidenceReadinessResults } from "./evidence-readiness/readiness-context";
import type {
  EvidenceCoverageLevel,
  EvidenceQueryContext,
  EvidenceRecord,
  RegistryValidation,
  UnifiedEvidenceQuery,
} from "./shared/types";
import {
  CANONICAL_EVIDENCE_QUERY,
  TOP_EVIDENCE_SCORE_THRESHOLD,
} from "./shared/types";

const VERIFIED_STATUSES = new Set<EvidenceRecord["evidenceStatus"]>([
  "verified",
  "linked",
  "covered",
]);

function toQueryContext(query: UnifiedEvidenceQuery, records: EvidenceRecord[]): EvidenceQueryContext {
  return {
    queryId: `evidence-query-${JSON.stringify(query)}`,
    query,
    records,
    hitCount: records.length,
    queryReady: records.length > 0,
    mode: "evidence-intelligence-network",
  };
}

function applyUnifiedEvidenceQuery(query: UnifiedEvidenceQuery): EvidenceRecord[] {
  let records = [...buildEvidenceRegistryRecords()];

  if (query.brandId) {
    records = records.filter((record) => record.brandId === query.brandId);
  }
  if (query.evidenceKind) {
    records = records.filter((record) => record.evidenceKind === query.evidenceKind);
  }
  if (query.evidenceStatus) {
    records = records.filter((record) => record.evidenceStatus === query.evidenceStatus);
  }
  if (query.verifiedOnly) {
    records = records.filter((record) => VERIFIED_STATUSES.has(record.evidenceStatus));
  }
  if (query.minEvidenceScore !== undefined) {
    records = records.filter(
      (record) => record.score.totalEvidenceScore >= query.minEvidenceScore!,
    );
  }
  if (query.coverageLevel) {
    const coverageRecords = buildEvidenceCoverageRecords().filter(
      (coverage) => coverage.coverageLevel === query.coverageLevel,
    );
    const evidenceIds = new Set(coverageRecords.flatMap((coverage) => coverage.evidenceIds));
    records = records.filter((record) => evidenceIds.has(record.evidenceId));
  }
  if (query.minReadinessScore !== undefined) {
    const readyBrands = new Set(
      buildEvidenceReadinessResults()
        .filter((result) => result.score.totalReadinessScore >= query.minReadinessScore!)
        .map((result) => result.brandId),
    );
    records = records.filter((record) => readyBrands.has(record.brandId));
  }
  if (query.limit !== undefined) {
    records = records.slice(0, query.limit);
  }

  return records;
}

export function findEvidence(query: UnifiedEvidenceQuery = {}): EvidenceQueryContext {
  return toQueryContext(query, applyUnifiedEvidenceQuery(query));
}

export function findEvidenceByBrand(brandId: string, limit?: number): EvidenceQueryContext {
  return findEvidence({ brandId, limit });
}

export function findEvidenceByKind(kind: EvidenceRecord["evidenceKind"], limit?: number): EvidenceQueryContext {
  return findEvidence({ evidenceKind: kind, limit });
}

export function findVerifiedEvidence(limit = 10): EvidenceQueryContext {
  return findEvidence({ verifiedOnly: true, limit });
}

export function findTopEvidence(limit = 5): EvidenceQueryContext {
  const records = findTopEvidenceRecords(limit);
  return toQueryContext(
    { minEvidenceScore: TOP_EVIDENCE_SCORE_THRESHOLD, limit },
    records,
  );
}

export function findEvidenceByCoverageLevel(
  level: EvidenceCoverageLevel,
  limit?: number,
): EvidenceQueryContext {
  return findEvidence({ coverageLevel: level, limit });
}

export function findEvidenceByReadiness(minReadinessScore: number, limit?: number): EvidenceQueryContext {
  return findEvidence({ minReadinessScore, limit });
}

export function validateEvidenceQueryRegistry(): RegistryValidation {
  const canonical = findEvidence(CANONICAL_EVIDENCE_QUERY);
  const verified = findVerifiedEvidence(5);
  const top = findTopEvidence(5);
  const byBrand = findEvidenceByBrand("brand-life-fitness");
  const byKind = findEvidenceByKind("certificate", 5);
  const byCoverage = findEvidenceByCoverageLevel("partial", 10);
  const byReadiness = findEvidenceByReadiness(70, 10);

  const valid =
    canonical.queryReady &&
    canonical.hitCount >= 1 &&
    verified.queryReady &&
    verified.hitCount >= 1 &&
    top.queryReady &&
    top.hitCount >= 3 &&
    byBrand.queryReady &&
    byKind.queryReady &&
    byCoverage.hitCount >= 1 &&
    byReadiness.hitCount >= 1;

  return {
    valid,
    count: canonical.hitCount,
    summary: `evidence-query canonical=${canonical.hitCount} verified=${verified.hitCount} top=${top.hitCount} byBrand=${byBrand.hitCount} byReadiness=${byReadiness.hitCount} valid=${valid}`,
  };
}

export { registryFindEvidenceByBrand, registryFindEvidenceByKind };
