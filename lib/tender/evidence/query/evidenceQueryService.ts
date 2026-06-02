import { getEvidenceById, getEvidenceByRequirement, getLinksForRequirement } from "../registry";
import type {
  EvidenceRegistry,
  RequirementCoverageResult,
  TenderEvidenceMatrixRow,
} from "../types";
import type {
  EvidenceQueryFilters,
  EvidenceQueryResult,
  RequirementEvidenceBundle,
} from "./types";

function matchesFilters(
  filters: EvidenceQueryFilters | undefined,
  ctx: {
    requirementId?: string;
    evidenceId?: string;
    evidenceType?: string;
    skuId?: string;
    coverageStatus?: string;
    requirementText?: string;
  },
): boolean {
  if (!filters) return true;
  if (filters.requirementId && ctx.requirementId !== filters.requirementId)
    return false;
  if (
    filters.requirementIds?.length &&
    ctx.requirementId &&
    !filters.requirementIds.includes(ctx.requirementId)
  ) {
    return false;
  }
  if (filters.evidenceId && ctx.evidenceId !== filters.evidenceId) return false;
  if (filters.evidenceType && ctx.evidenceType !== filters.evidenceType)
    return false;
  if (filters.skuId && ctx.skuId !== filters.skuId) return false;
  if (
    filters.coverageStatus &&
    ctx.coverageStatus !== filters.coverageStatus
  ) {
    return false;
  }
  if (
    filters.requirementTextIncludes &&
    ctx.requirementText &&
    !ctx.requirementText.includes(filters.requirementTextIncludes)
  ) {
    return false;
  }
  return true;
}

function collectRequirementIds(
  registry: EvidenceRegistry,
  coverage: RequirementCoverageResult[],
  matrix: TenderEvidenceMatrixRow[],
  filters?: EvidenceQueryFilters,
): string[] {
  const ids = new Set<string>();

  for (const l of registry.links) ids.add(l.requirementId);
  for (const d of registry.documents) {
    for (const rid of d.linkedRequirements || []) ids.add(rid);
  }
  for (const c of coverage) ids.add(c.requirementId);

  if (filters?.requirementId) return [filters.requirementId];
  if (filters?.requirementIds?.length) return [...filters.requirementIds];

  return [...ids];
}

function bundleForRequirement(
  registry: EvidenceRegistry,
  matrix: TenderEvidenceMatrixRow[],
  coverage: RequirementCoverageResult[],
  requirementId: string,
): RequirementEvidenceBundle {
  const documents = getEvidenceByRequirement(registry, requirementId);
  const links = getLinksForRequirement(registry, requirementId);
  const cov = coverage.find((c) => c.requirementId === requirementId);
  const matrixRow = matrix.find((m) => m.requirementId === requirementId);

  return {
    requirementId,
    documents,
    links,
    coverage: cov,
    matrixRow,
  };
}

/**
 * 在 EvidenceRegistry 上执行只读查询（确定性，无 AI）
 */
export function queryEvidenceRegistry(
  registry: EvidenceRegistry,
  matrix: TenderEvidenceMatrixRow[] = [],
  coverage: RequirementCoverageResult[] = [],
  filters?: EvidenceQueryFilters,
): EvidenceQueryResult {
  const reqIds = collectRequirementIds(registry, coverage, matrix, filters);

  let documents = [...registry.documents];
  let links = [...registry.links];
  let matrixRows = [...matrix];
  let coverageRows = [...coverage];

  if (filters?.requirementId) {
    documents = getEvidenceByRequirement(registry, filters.requirementId);
    links = getLinksForRequirement(registry, filters.requirementId);
    matrixRows = matrixRows.filter((m) =>
      matchesFilters(filters, { requirementText: m.requirement }),
    );
    coverageRows = coverageRows.filter(
      (c) => c.requirementId === filters.requirementId,
    );
  }

  if (filters?.evidenceId) {
    const doc = getEvidenceById(registry, filters.evidenceId);
    documents = doc ? [doc] : [];
    links = links.filter((l) => l.evidenceId === filters.evidenceId);
  }

  if (filters?.evidenceType) {
    documents = documents.filter((d) => d.type === filters.evidenceType);
    const docIds = new Set(documents.map((d) => d.id));
    links = links.filter((l) => docIds.has(l.evidenceId));
  }

  if (filters?.skuId) {
    documents = documents.filter((d) => d.skuId === filters.skuId);
    const docIds = new Set(documents.map((d) => d.id));
    links = links.filter((l) => docIds.has(l.evidenceId));
  }

  if (filters?.coverageStatus) {
    coverageRows = coverageRows.filter(
      (c) => c.status === filters.coverageStatus,
    );
    const allowedReqs = new Set(coverageRows.map((c) => c.requirementId));
    documents = documents.filter((d) =>
      (d.linkedRequirements || []).some((rid) => allowedReqs.has(rid)),
    );
    links = links.filter((l) => allowedReqs.has(l.requirementId));
    matrixRows = matrixRows.filter(
      (m) => m.evidenceStatus === filters.coverageStatus,
    );
  }

  if (filters?.requirementTextIncludes) {
    matrixRows = matrixRows.filter((m) =>
      m.requirement.includes(filters.requirementTextIncludes!),
    );
  }

  const byRequirement = reqIds
    .filter((id) =>
      matchesFilters(filters, {
        requirementId: id,
      }),
    )
    .map((id) => bundleForRequirement(registry, matrix, coverage, id))
    .filter((b) => {
      if (!filters) return b.documents.length > 0 || b.coverage;
      if (filters.requirementId) return true;
      return b.documents.length > 0;
    });

  const statusCounts = {
    fullyEvidenced: coverageRows.filter((c) => c.status === "fully_evidenced")
      .length,
    partiallyEvidenced: coverageRows.filter(
      (c) => c.status === "partially_evidenced",
    ).length,
    unsupported: coverageRows.filter((c) => c.status === "unsupported").length,
    risky: coverageRows.filter((c) => c.status === "risky").length,
  };

  return {
    documents,
    links,
    matrixRows,
    coverage: coverageRows,
    byRequirement,
    summary: {
      documentCount: documents.length,
      linkCount: links.length,
      matrixRowCount: matrixRows.length,
      ...statusCounts,
    },
  };
}
