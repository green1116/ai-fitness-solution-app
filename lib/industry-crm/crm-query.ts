import { validateCRMContextRegistry } from "./crm-context";
import {
  buildIndustryCRM,
  getCRMBySubject,
  getCRMByType,
  validateCRMRegistry,
} from "./crm-registry";
import type {
  CRMQuery,
  CRMQueryResult,
  IndustryCRM,
  IndustryCRMValidation,
  RegistryValidation,
} from "./shared/types";
import { CANONICAL_CRM_QUERY, CANONICAL_CRM_SUBJECT_ID, TOP_CRM_SCORE_THRESHOLD } from "./shared/types";

function applyCRMQuery(input: CRMQuery, source: IndustryCRM[]): IndustryCRM[] {
  let crmRecords = [...source];

  if (input.subjectId) {
    crmRecords = crmRecords.filter((crm) => crm.subjectId === input.subjectId);
  }

  if (input.crmType) {
    crmRecords = crmRecords.filter((crm) => crm.crmType === input.crmType);
  }

  if (input.crmStatus) {
    crmRecords = crmRecords.filter((crm) => crm.crmStatus === input.crmStatus);
  }

  if (input.minCRMScore !== undefined) {
    crmRecords = crmRecords.filter(
      (crm) => crm.score.totalCRMScore >= input.minCRMScore!,
    );
  }

  if (input.limit !== undefined) {
    crmRecords = crmRecords.slice(0, input.limit);
  }

  return crmRecords;
}

function toQueryResult(query: CRMQuery, crmRecords: IndustryCRM[]): CRMQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.crmType ?? "all-types",
    query.crmStatus ?? "all-status",
    query.minCRMScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `crm-query-${queryParts.join("-")}`,
    query,
    crmRecords,
    hitCount: crmRecords.length,
    crmReady: crmRecords.length > 0,
  };
}

export function findSupplierCRM(limit = 5): CRMQueryResult {
  return toQueryResult(
    { crmType: "supplier", limit },
    applyCRMQuery({ crmType: "supplier", limit }, getCRMByType("supplier")),
  );
}

export function findBrandCRM(limit = 5): CRMQueryResult {
  return toQueryResult(
    { crmType: "brand", limit },
    applyCRMQuery({ crmType: "brand", limit }, getCRMByType("brand")),
  );
}

export function findTenderCRM(limit = 5): CRMQueryResult {
  return toQueryResult(
    { crmType: "tender", limit },
    applyCRMQuery({ crmType: "tender", limit }, getCRMByType("tender")),
  );
}

export function findPartnershipCRM(limit = 5): CRMQueryResult {
  return toQueryResult(
    { crmType: "partnership", limit },
    applyCRMQuery({ crmType: "partnership", limit }, getCRMByType("partnership")),
  );
}

export function findTopCRM(limit = 5): CRMQueryResult {
  return toQueryResult(
    { minCRMScore: TOP_CRM_SCORE_THRESHOLD, limit },
    applyCRMQuery({ minCRMScore: TOP_CRM_SCORE_THRESHOLD, limit }, buildIndustryCRM()),
  );
}

export function executeCRMQuery(query: CRMQuery = {}): CRMQueryResult {
  return toQueryResult(query, applyCRMQuery(query, buildIndustryCRM()));
}

export function validateCRMQueryRegistry(): RegistryValidation {
  const canonical = executeCRMQuery(CANONICAL_CRM_QUERY);
  const suppliers = findSupplierCRM(3);
  const brands = findBrandCRM(3);
  const tenders = findTenderCRM(3);
  const partnerships = findPartnershipCRM(3);
  const top = findTopCRM(5);
  const subject = getCRMBySubject(CANONICAL_CRM_SUBJECT_ID);

  const valid =
    canonical.crmReady &&
    canonical.hitCount >= 1 &&
    suppliers.hitCount >= 1 &&
    brands.hitCount >= 1 &&
    tenders.hitCount >= 2 &&
    partnerships.hitCount >= 1 &&
    top.hitCount >= 3 &&
    subject.length >= 1 &&
    canonical.crmRecords.every(
      (crm) =>
        crm.score.relationshipStrength > 0 &&
        crm.score.lifecycleStrength > 0 &&
        crm.score.confidence > 0 &&
        crm.score.retentionScore > 0 &&
        crm.score.expansionScore > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `crm-query canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}

export function validateIndustryCRM(): IndustryCRMValidation {
  const crmRegistry = validateCRMRegistry();
  const crmContext = validateCRMContextRegistry();
  const crmQuery = validateCRMQueryRegistry();

  return {
    valid: crmRegistry.valid && crmContext.valid && crmQuery.valid,
    crmRegistry,
    crmContext,
    crmQuery,
  };
}
