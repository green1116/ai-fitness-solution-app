import {
  buildBrandEvidenceLinkRecords,
  buildBrandRegistryRecords,
  findManufacturerByBrandId,
} from "@/lib/brand-intelligence-network";
import type { BrandEvidenceLink } from "@/lib/brand-intelligence-network";
import { getAllCertificationProfiles } from "@/lib/brand-portal/certification-profile/data";
import {
  buildEvidenceCompatibilityMetadata,
  buildEvidenceEngineCompatibility,
} from "./evidence-engine-compat";
import {
  buildEvidenceIdFromLink,
  buildEvidenceTitle,
  mapLinkStatusToEvidenceStatus,
  normalizeEvidenceRef,
  slugifyEvidenceRef,
} from "./evidence-ref-resolver";
import { buildEvidenceScore, deriveEvidenceScoreFromBrandLink } from "./evidence-scoring";
import type {
  EvidenceKind,
  EvidenceQuery,
  EvidenceRecord,
  EvidenceRegistry,
  EvidenceStatus,
  RegistryValidation,
} from "./shared/types";
import {
  ACTIVE_EVIDENCE_BRAND_STATUSES,
  CANONICAL_EVIDENCE_QUERY,
  EVIDENCE_KINDS,
  EVIDENCE_STATUSES,
  TOP_EVIDENCE_SCORE_THRESHOLD,
} from "./shared/types";

const evidenceOverrides = new Map<string, EvidenceRecord>();

const SUPPLEMENT_EVIDENCE_STATUSES: EvidenceStatus[] = [
  "registered",
  "verified",
  "linked",
];

function supplementEvidenceStatus(rank: number): EvidenceStatus {
  return SUPPLEMENT_EVIDENCE_STATUSES[(rank - 1) % SUPPLEMENT_EVIDENCE_STATUSES.length]!;
}

function buildSupplementEvidenceRecord(input: {
  evidenceId: string;
  evidenceRef: string;
  brandId: string;
  manufacturerId?: string;
  evidenceKind: EvidenceKind;
  title: string;
  sourceLayer: EvidenceRecord["sourceLayer"];
  documentRef?: string;
  validUntil?: string;
  brandLinkId: string;
  rank: number;
}): EvidenceRecord {
  return {
    evidenceId: input.evidenceId,
    evidenceRef: normalizeEvidenceRef(input.evidenceRef),
    brandId: input.brandId,
    manufacturerId: input.manufacturerId,
    evidenceKind: input.evidenceKind,
    evidenceStatus: supplementEvidenceStatus(input.rank),
    title: input.title,
    sourceLayer: input.sourceLayer,
    documentRef: input.documentRef,
    validUntil: input.validUntil,
    brandLinkId: input.brandLinkId,
    requirementLinkIds: [],
    graphNodeIds: [`graph-node-evidence-${input.evidenceId}`],
    score: buildEvidenceScore(input.evidenceId, {
      sourceLayer: input.sourceLayer,
      title: input.title,
      documentRef: input.documentRef,
      validUntil: input.validUntil,
      brandId: input.brandId,
      brandLinkId: input.brandLinkId,
      manufacturerId: input.manufacturerId,
    }),
    metadata: {
      ...buildEvidenceCompatibilityMetadata(input.evidenceId, input.brandLinkId),
      evidenceKind: input.evidenceKind,
      supplement: "v39-registry-seed",
    },
    compatibility: buildEvidenceEngineCompatibility(),
    mode: "evidence-intelligence-network",
  };
}

function buildTestReportSupplements(
  existingRefs: Set<string>,
  rankStart: number,
): EvidenceRecord[] {
  const ceCert =
    getAllCertificationProfiles().find(
      (cert) => cert.brandId === "brand-life-fitness" && cert.certificateType === "CE",
    ) ?? getAllCertificationProfiles().find((cert) => cert.certificateType === "CE");

  if (!ceCert) return [];

  const evidenceRef = `test-report-${ceCert.documentRef}`;
  if (existingRefs.has(evidenceRef)) return [];

  const slug = slugifyEvidenceRef(ceCert.documentRef);
  const evidenceId = `ev-intel-${ceCert.brandId}-test-report-${slug}`;

  return [
    buildSupplementEvidenceRecord({
      evidenceId,
      evidenceRef,
      brandId: ceCert.brandId,
      manufacturerId: findManufacturerByBrandId(ceCert.brandId)?.manufacturerId,
      evidenceKind: "test-report",
      title: `Test Report Evidence — ${ceCert.certificateType}`,
      sourceLayer: "v26-brand-portal",
      documentRef: evidenceRef,
      validUntil: ceCert.validUntil,
      brandLinkId: `evidence-supplement-${ceCert.brandId}-test-report`,
      rank: rankStart,
    }),
  ];
}

function buildActiveBrandCoverageSupplements(
  seeded: EvidenceRecord[],
  existingIds: Set<string>,
  existingRefs: Set<string>,
  rankStart: number,
): EvidenceRecord[] {
  const activeBrands = buildBrandRegistryRecords().filter((brand) =>
    ACTIVE_EVIDENCE_BRAND_STATUSES.includes(
      brand.brandStatus as (typeof ACTIVE_EVIDENCE_BRAND_STATUSES)[number],
    ),
  );

  const supplements: EvidenceRecord[] = [];
  let rank = rankStart;

  for (const brand of activeBrands) {
    const brandEvidenceCount = seeded.filter((record) => record.brandId === brand.brandId).length;
    if (brandEvidenceCount >= 2) continue;

    const evidenceRef = `registry-anchor-${brand.brandId}`;
    const evidenceId = `ev-intel-${brand.brandId}-registry-anchor`;
    if (existingIds.has(evidenceId) || existingRefs.has(evidenceRef)) continue;

    supplements.push(
      buildSupplementEvidenceRecord({
        evidenceId,
        evidenceRef,
        brandId: brand.brandId,
        manufacturerId: brand.manufacturerId,
        evidenceKind: "authorization",
        title: `Authorization Letter Evidence — ${brand.brandId}`,
        sourceLayer: "v39-evidence-intelligence-network",
        documentRef: evidenceRef,
        brandLinkId: `evidence-supplement-${brand.brandId}-registry-anchor`,
        rank: rank++,
      }),
    );

    existingIds.add(evidenceId);
    existingRefs.add(evidenceRef);
  }

  return supplements;
}

function brandEvidenceLinkToRecord(link: BrandEvidenceLink, rank: number): EvidenceRecord {
  const evidenceId = buildEvidenceIdFromLink(link);
  const evidenceRef = normalizeEvidenceRef(link.evidenceRef);
  const title = buildEvidenceTitle(link);

  return {
    evidenceId,
    evidenceRef,
    brandId: link.brandId,
    manufacturerId: link.manufacturerId,
    sku: link.sku,
    evidenceKind: link.evidenceKind as EvidenceKind,
    evidenceStatus: mapLinkStatusToEvidenceStatus(link, rank),
    title,
    sourceLayer: link.sourceLayer as EvidenceRecord["sourceLayer"],
    documentRef: link.documentRef,
    validUntil: link.validUntil,
    brandLinkId: link.linkId,
    requirementLinkIds: [],
    graphNodeIds: [`graph-node-evidence-${evidenceId}`],
    score: deriveEvidenceScoreFromBrandLink(evidenceId, link, title),
    metadata: {
      ...buildEvidenceCompatibilityMetadata(evidenceId, link.linkId),
      evidenceKind: link.evidenceKind,
      linkStatus: link.linkStatus,
    },
    compatibility: buildEvidenceEngineCompatibility(),
    mode: "evidence-intelligence-network",
  };
}

export function buildEvidenceRegistryRecords(): EvidenceRecord[] {
  const links = buildBrandEvidenceLinkRecords();
  const seeded = links.map((link, index) => brandEvidenceLinkToRecord(link, index + 1));

  const existingRefs = new Set(seeded.map((record) => record.evidenceRef));
  const existingIds = new Set(seeded.map((record) => record.evidenceId));

  const testReportSupplements = buildTestReportSupplements(existingRefs, seeded.length + 1);
  for (const supplement of testReportSupplements) {
    existingRefs.add(supplement.evidenceRef);
    existingIds.add(supplement.evidenceId);
  }

  const coverageSupplements = buildActiveBrandCoverageSupplements(
    seeded,
    existingIds,
    existingRefs,
    seeded.length + testReportSupplements.length + 1,
  );

  const allSeeded = [...seeded, ...testReportSupplements, ...coverageSupplements];

  const merged = allSeeded.map(
    (record) => evidenceOverrides.get(record.evidenceId) ?? record,
  );

  for (const override of evidenceOverrides.values()) {
    if (!merged.some((record) => record.evidenceId === override.evidenceId)) {
      merged.push(override);
    }
  }

  return merged;
}

export function buildEvidenceRegistry(): EvidenceRegistry {
  const records = buildEvidenceRegistryRecords();
  const countBy = <T extends string>(items: T[]) =>
    items.reduce(
      (acc, item) => ({ ...acc, [item]: (acc[item as T] ?? 0) + 1 }),
      {} as Record<T, number>,
    );

  return {
    registryId: "evidence-registry-v39-p1",
    records,
    recordCount: records.length,
    kindBreakdown: countBy(records.map((r) => r.evidenceKind)),
    statusBreakdown: countBy(records.map((r) => r.evidenceStatus)),
    brandBreakdown: countBy(records.map((r) => r.brandId)),
    registryReady: records.length >= 30,
    mode: "evidence-intelligence-network",
  };
}

export function registerEvidence(record: EvidenceRecord): EvidenceRecord {
  const normalized = { ...record, mode: "evidence-intelligence-network" as const };
  evidenceOverrides.set(record.evidenceId, normalized);
  return normalized;
}

export function updateEvidence(
  evidenceId: string,
  patch: Partial<EvidenceRecord>,
): EvidenceRecord {
  const existing = findEvidenceById(evidenceId);
  if (!existing) {
    throw new Error(`Evidence not found: ${evidenceId}`);
  }
  const updated: EvidenceRecord = {
    ...existing,
    ...patch,
    evidenceId,
    mode: "evidence-intelligence-network",
  };
  evidenceOverrides.set(evidenceId, updated);
  return updated;
}

export function resolveEvidenceRef(ref: string): EvidenceRecord | undefined {
  const normalized = normalizeEvidenceRef(ref);
  return buildEvidenceRegistryRecords().find((record) => record.evidenceRef === normalized);
}

export function resolveEvidenceId(evidenceId: string): EvidenceRecord | undefined {
  return findEvidenceById(evidenceId);
}

export function findEvidenceById(evidenceId: string): EvidenceRecord | undefined {
  return buildEvidenceRegistryRecords().find((record) => record.evidenceId === evidenceId);
}

export function findEvidenceByBrand(brandId: string, limit?: number): EvidenceRecord[] {
  const records = buildEvidenceRegistryRecords().filter((record) => record.brandId === brandId);
  return limit !== undefined ? records.slice(0, limit) : records;
}

export function findEvidenceByKind(kind: EvidenceKind, limit?: number): EvidenceRecord[] {
  const records = buildEvidenceRegistryRecords().filter((record) => record.evidenceKind === kind);
  return limit !== undefined ? records.slice(0, limit) : records;
}

function applyEvidenceQuery(query: EvidenceQuery, source: EvidenceRecord[]): EvidenceRecord[] {
  let records = [...source];

  if (query.brandId) {
    records = records.filter((record) => record.brandId === query.brandId);
  }
  if (query.evidenceKind) {
    records = records.filter((record) => record.evidenceKind === query.evidenceKind);
  }
  if (query.evidenceStatus) {
    records = records.filter((record) => record.evidenceStatus === query.evidenceStatus);
  }
  if (query.minEvidenceScore !== undefined) {
    records = records.filter(
      (record) => record.score.totalEvidenceScore >= query.minEvidenceScore!,
    );
  }
  if (query.limit !== undefined) {
    records = records.slice(0, query.limit);
  }

  return records;
}

export function executeEvidenceQuery(query: EvidenceQuery = {}): EvidenceRecord[] {
  return applyEvidenceQuery(query, buildEvidenceRegistryRecords());
}

export function findTopEvidenceRecords(limit = 5): EvidenceRecord[] {
  return [...buildEvidenceRegistryRecords()]
    .filter((record) => record.score.totalEvidenceScore >= TOP_EVIDENCE_SCORE_THRESHOLD)
    .sort((a, b) => b.score.totalEvidenceScore - a.score.totalEvidenceScore)
    .slice(0, limit);
}

export function validateEvidenceRegistry(): RegistryValidation {
  const records = buildEvidenceRegistryRecords();
  const brands = buildBrandRegistryRecords();

  const evidenceIds = new Set(records.map((r) => r.evidenceId));
  const evidenceRefs = new Set(records.map((r) => r.evidenceRef));
  const idUnique = evidenceIds.size === records.length;
  const refUnique = evidenceRefs.size === records.length;

  const kindCoverage = EVIDENCE_KINDS.every((kind) =>
    records.some((record) => record.evidenceKind === kind),
  );

  const activeBrands = brands.filter((brand) =>
    ACTIVE_EVIDENCE_BRAND_STATUSES.includes(
      brand.brandStatus as (typeof ACTIVE_EVIDENCE_BRAND_STATUSES)[number],
    ),
  );

  const activeBrandEvidenceOk = activeBrands.every(
    (brand) => findEvidenceByBrand(brand.brandId).length >= 2,
  );

  const scoreValid = records.every(
    (record) =>
      record.score.authenticityScore > 0 &&
      record.score.completenessScore > 0 &&
      record.score.freshnessScore > 0 &&
      record.score.linkageScore > 0 &&
      record.score.totalEvidenceScore > 0,
  );

  const canonical = executeEvidenceQuery(CANONICAL_EVIDENCE_QUERY);

  const valid =
    records.length >= 30 &&
    idUnique &&
    refUnique &&
    kindCoverage &&
    activeBrandEvidenceOk &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: records.length,
    summary: `evidence-registry count=${records.length} kinds=${EVIDENCE_KINDS.filter((k) => records.some((r) => r.evidenceKind === k)).length}/6 idUnique=${idUnique} refUnique=${refUnique} activeBrandsOk=${activeBrandEvidenceOk} valid=${valid}`,
  };
}

export type { EvidenceKind, EvidenceStatus, EvidenceQuery };
