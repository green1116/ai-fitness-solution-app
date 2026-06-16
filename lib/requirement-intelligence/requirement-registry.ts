import { buildIndustryWorkflows } from "@/lib/industry-workflow";
import {
  buildEnrichedRequirementStubRecords,
  findRequirementEvidenceEdgesByRequirementId,
} from "@/lib/evidence-intelligence-network";
import type { RequirementType } from "@/lib/evidence-intelligence-network/shared/types";
import { buildTenderRegistryRecords } from "@/lib/tender-hub";
import {
  getAllRequirementProfiles,
} from "@/lib/tender-marketplace/requirement-profile/data";
import { getAllTenderProfiles } from "@/lib/tender-marketplace/tender-profile/data";
import {
  buildRequirementCompatibilityMetadata,
  buildRequirementEngineCompatibility,
} from "./requirement-engine-compat";
import type {
  RequirementKind,
  RequirementMandatoryLevel,
  RequirementPriority,
  RequirementQuery,
  RequirementRecord,
  RequirementRegistry,
  RequirementScore,
  RequirementSource,
  RequirementStatus,
  RequirementValidation,
} from "./shared/types";
import {
  ACTIVE_TENDER_MARKETPLACE_STATUSES,
  CANONICAL_REQUIREMENT_QUERY,
  HIGH_PRIORITY_REQUIREMENT_THRESHOLD,
  REQUIREMENT_KINDS,
  TOP_REQUIREMENT_SCORE_THRESHOLD,
} from "./shared/types";

const requirementOverrides = new Map<string, RequirementRecord>();

const STUB_KIND_MAP: Record<RequirementType, RequirementKind> = {
  "technical-compliance": "compliance",
  "brand-authorization": "authorization",
  "case-reference": "reference",
  "commercial-qualification": "commercial",
  "equipment-spec": "equipment",
};

const PROFILE_KIND_MAP: Record<string, RequirementKind> = {
  equipment: "equipment",
  service: "service",
  installation: "installation",
  maintenance: "maintenance",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function normalizeRequirementRef(ref: string): string {
  return ref.trim();
}

function resolveMandatoryLevel(mandatory: boolean): RequirementMandatoryLevel {
  return mandatory ? "mandatory" : "optional";
}

function resolvePriority(input: {
  mandatory: boolean;
  matchScore: number;
  rank: number;
}): RequirementPriority {
  if (input.mandatory && input.matchScore >= HIGH_PRIORITY_REQUIREMENT_THRESHOLD) return "critical";
  if (input.mandatory) return "high";
  if (input.matchScore >= TOP_REQUIREMENT_SCORE_THRESHOLD) return "medium";
  return input.rank % 2 === 0 ? "medium" : "low";
}

function resolveStatus(input: {
  source: RequirementSource;
  matchScore: number;
  rank: number;
  tenderStatus?: string;
}): RequirementStatus {
  if (input.tenderStatus === "archived" || input.tenderStatus === "closed") return "archived";
  if (input.matchScore >= TOP_REQUIREMENT_SCORE_THRESHOLD && input.rank % 5 === 0) return "matched";
  if (input.source === "v39-evidence-stub" && input.matchScore >= 50) return "active";
  if (input.source === "v28-requirement-profile") return "active";
  if (input.source === "v34-requirement-anchor") return "active";
  if (input.source === "v36-tender-requirement") return "active";
  return "draft";
}

export function buildRequirementScore(
  requirementId: string,
  input: {
    title: string;
    description: string;
    evidenceLinkIds: string[];
    mandatoryLevel: RequirementMandatoryLevel;
    priority: RequirementPriority;
    matchScore: number;
    coverageScore: number;
    source: RequirementSource;
  },
): RequirementScore {
  const completenessScore = Math.min(
    100,
    40 +
      (input.title.length > 0 ? 10 : 0) +
      (input.description.length > 20 ? 15 : 5) +
      (input.evidenceLinkIds.length > 0 ? 15 : 0) +
      (input.mandatoryLevel === "mandatory" ? 10 : 0) +
      (input.source === "v39-evidence-stub" ? 10 : 5),
  );

  const clarityScore = Math.min(
    100,
    50 + Math.round(Math.min(input.description.length, 120) / 4) + (input.title.length > 10 ? 10 : 0),
  );

  const evidenceLinkScore = Math.min(
    100,
    input.evidenceLinkIds.length === 0 ? 35 : 55 + input.evidenceLinkIds.length * 8,
  );

  const priorityAlignmentScore =
    input.priority === "critical"
      ? 95
      : input.priority === "high"
        ? 85
        : input.priority === "medium"
          ? 70
          : 55;

  const freshnessScore =
    input.source === "v36-tender-requirement" || input.source === "v28-requirement-profile" ? 88 : 80;

  const confidenceScore = Math.round(
    (input.matchScore * 0.35 + input.coverageScore * 0.35 + evidenceLinkScore * 0.3),
  );

  const totalRequirementScore = Math.round(
    completenessScore * 0.2 +
      clarityScore * 0.15 +
      evidenceLinkScore * 0.2 +
      priorityAlignmentScore * 0.15 +
      freshnessScore * 0.1 +
      confidenceScore * 0.2,
  );

  return {
    scoreId: `requirement-score-${requirementId}`,
    requirementId,
    completenessScore,
    clarityScore,
    evidenceLinkScore,
    priorityAlignmentScore,
    freshnessScore,
    confidenceScore,
    totalRequirementScore,
    mode: "requirement-intelligence",
  };
}

function buildRecordBase(input: {
  requirementId: string;
  requirementRef: string;
  tenderId: string;
  brandId?: string;
  proposalId?: string;
  anchorId?: string;
  requirementType: string;
  requirementKind: RequirementKind;
  requirementStatus: RequirementStatus;
  priority: RequirementPriority;
  source: RequirementSource;
  mandatoryLevel: RequirementMandatoryLevel;
  title: string;
  description: string;
  evidenceLinkIds: string[];
  matchScore: number;
  coverageScore: number;
  sourceRecordId: string;
  metadata?: Record<string, string>;
}): RequirementRecord {
  const score = buildRequirementScore(input.requirementId, {
    title: input.title,
    description: input.description,
    evidenceLinkIds: input.evidenceLinkIds,
    mandatoryLevel: input.mandatoryLevel,
    priority: input.priority,
    matchScore: input.matchScore,
    coverageScore: input.coverageScore,
    source: input.source,
  });

  return {
    requirementId: input.requirementId,
    requirementRef: normalizeRequirementRef(input.requirementRef),
    tenderId: input.tenderId,
    brandId: input.brandId,
    proposalId: input.proposalId,
    anchorId: input.anchorId,
    requirementType: input.requirementType,
    requirementKind: input.requirementKind,
    requirementStatus: input.requirementStatus,
    priority: input.priority,
    source: input.source,
    mandatoryLevel: input.mandatoryLevel,
    title: input.title,
    description: input.description,
    evidenceLinkIds: input.evidenceLinkIds,
    matchScore: input.matchScore,
    coverageScore: input.coverageScore,
    confidenceScore: score.confidenceScore,
    score,
    metadata: {
      ...buildRequirementCompatibilityMetadata(input.requirementId, input.sourceRecordId),
      ...input.metadata,
    },
    compatibility: buildRequirementEngineCompatibility(),
    mode: "requirement-intelligence",
  };
}

function seedFromRequirementStubs(): RequirementRecord[] {
  return buildEnrichedRequirementStubRecords()
    .filter((stub) => stub.stubReady)
    .map((stub, index) => {
      const edges = findRequirementEvidenceEdgesByRequirementId(stub.requirementId);
      const matchScore =
        edges.length === 0
          ? 50
          : Math.round(edges.reduce((sum, edge) => sum + edge.matchScore, 0) / edges.length);
      const requirementKind = STUB_KIND_MAP[stub.requirementType];
      const mandatoryLevel = stub.mandatory ? "mandatory" : "recommended";
      const priority = resolvePriority({ mandatory: stub.mandatory, matchScore, rank: index + 1 });

      return buildRecordBase({
        requirementId: `req-intel-v39-${stub.requirementId.replace(/^req-stub-/, "")}`,
        requirementRef: stub.requirementId,
        tenderId: stub.tenderId,
        brandId: stub.brandId,
        proposalId: stub.proposalId,
        requirementType: stub.requirementType,
        requirementKind,
        requirementStatus: resolveStatus({
          source: "v39-evidence-stub",
          matchScore,
          rank: index + 1,
        }),
        priority,
        source: "v39-evidence-stub",
        mandatoryLevel,
        title: `${requirementKind} requirement — ${stub.brandId}`,
        description: `Upgraded from V39 requirement stub ${stub.requirementType} for tender ${stub.tenderId}.`,
        evidenceLinkIds: stub.evidenceLinkIds,
        matchScore,
        coverageScore: Math.min(100, matchScore + stub.evidenceLinkIds.length * 5),
        sourceRecordId: stub.requirementId,
        metadata: { stubReady: String(stub.stubReady), upgradeLayer: "v39-evidence-stub" },
      });
    });
}

function seedFromRequirementProfiles(): RequirementRecord[] {
  return getAllRequirementProfiles().map((profile, index) => {
    const requirementKind = PROFILE_KIND_MAP[profile.requirementType] ?? "equipment";
    const requirementRef = `req-profile-${profile.tenderId}-${profile.requirementType}-${slugify(profile.equipmentCategory)}`;
    const mandatoryLevel = resolveMandatoryLevel(profile.mandatory);
    const matchScore = profile.mandatory ? 72 : 58;
    const priority = resolvePriority({ mandatory: profile.mandatory, matchScore, rank: index + 1 });
    const tenderProfile = getAllTenderProfiles().find((t) => t.tenderId === profile.tenderId);

    return buildRecordBase({
      requirementId: `req-intel-v28-${profile.tenderId}-${profile.requirementType}-${slugify(profile.equipmentCategory)}`,
      requirementRef,
      tenderId: profile.tenderId,
      requirementType: profile.requirementType,
      requirementKind,
      requirementStatus: resolveStatus({
        source: "v28-requirement-profile",
        matchScore,
        rank: index + 1,
        tenderStatus: tenderProfile?.status,
      }),
      priority,
      source: "v28-requirement-profile",
      mandatoryLevel,
      title: `${profile.equipmentCategory} — ${profile.requirementType}`,
      description: profile.technicalRequirement,
      evidenceLinkIds: [],
      matchScore,
      coverageScore: profile.mandatory ? 75 : 55,
      sourceRecordId: requirementRef,
      metadata: {
        quantity: String(profile.quantity),
        equipmentCategory: profile.equipmentCategory,
        upgradeLayer: "v28-requirement-profile",
      },
    });
  });
}

function seedFromRequirementAnchors(): RequirementRecord[] {
  return buildIndustryWorkflows()
    .filter((workflow) => workflow.workflowType === "tender")
    .map((workflow, index) => {
      const anchorId = workflow.workflowId;
      const requirementRef = `req-anchor-${anchorId}`;
      const matchScore = Math.min(100, Math.round(workflow.score.totalWorkflowScore * 0.85));
      const priority = resolvePriority({ mandatory: true, matchScore, rank: index + 1 });
      const tenderId = workflow.metadata.tenderRef ?? `tender-anchor-${workflow.subjectId}`;

      return buildRecordBase({
        requirementId: `req-intel-v34-${anchorId}`,
        requirementRef,
        tenderId,
        anchorId,
        requirementType: "industry-anchor",
        requirementKind: "compliance",
        requirementStatus: resolveStatus({
          source: "v34-requirement-anchor",
          matchScore,
          rank: index + 1,
        }),
        priority,
        source: "v34-requirement-anchor",
        mandatoryLevel: "recommended",
        title: workflow.title.replace(" — Workflow", " — Requirement Anchor"),
        description: workflow.summary,
        evidenceLinkIds: [],
        matchScore,
        coverageScore: Math.round(workflow.score.readiness),
        sourceRecordId: anchorId,
        metadata: {
          subjectId: workflow.subjectId,
          workflowType: workflow.workflowType,
          upgradeLayer: "v34-requirement-anchor",
        },
      });
    });
}

function seedFromTenderRequirements(): RequirementRecord[] {
  return buildTenderRegistryRecords().map((tender, index) => {
    const requirementRef = `req-tender-${tender.tenderId}`;
    const matchScore = Math.min(100, Math.round(tender.score.totalTenderScore * 0.9));
    const priority = resolvePriority({ mandatory: true, matchScore, rank: index + 1 });
    const marketplaceTender = getAllTenderProfiles().find(
      (profile) => profile.title.toLowerCase().includes(tender.metadata.region?.toLowerCase() ?? ""),
    );

    return buildRecordBase({
      requirementId: `req-intel-v36-${tender.tenderId}`,
      requirementRef,
      tenderId: marketplaceTender?.tenderId ?? tender.tenderId,
      requirementType: "tender-summary",
      requirementKind: tender.metadata.venueType?.includes("gym") ? "equipment" : "compliance",
      requirementStatus: resolveStatus({
        source: "v36-tender-requirement",
        matchScore,
        rank: index + 1,
        tenderStatus: tender.tenderStatus,
      }),
      priority,
      source: "v36-tender-requirement",
      mandatoryLevel: "mandatory",
      title: `${tender.title} — Tender Requirement`,
      description: tender.summary,
      evidenceLinkIds: [],
      matchScore,
      coverageScore: Math.round(tender.score.matchingScore),
      sourceRecordId: tender.tenderId,
      metadata: {
        hubTenderId: tender.tenderId,
        tenderStatus: tender.tenderStatus,
        upgradeLayer: "v36-tender-requirement",
      },
    });
  });
}

let cachedRegistryRecords: RequirementRecord[] | undefined;

export function buildRequirementRegistryRecords(): RequirementRecord[] {
  if (cachedRegistryRecords) {
    return cachedRegistryRecords;
  }

  const seeded = [
    ...seedFromRequirementStubs(),
    ...seedFromRequirementProfiles(),
    ...seedFromRequirementAnchors(),
    ...seedFromTenderRequirements(),
  ];

  const merged = seeded.map((record) => requirementOverrides.get(record.requirementId) ?? record);

  for (const override of requirementOverrides.values()) {
    if (!merged.some((record) => record.requirementId === override.requirementId)) {
      merged.push(override);
    }
  }

  cachedRegistryRecords = merged;
  return cachedRegistryRecords;
}

export function buildRequirementRegistry(): RequirementRegistry {
  const records = buildRequirementRegistryRecords();
  const countBy = <T extends string>(items: T[]) =>
    items.reduce(
      (acc, item) => ({ ...acc, [item]: (acc[item as T] ?? 0) + 1 }),
      {} as Record<T, number>,
    );

  return {
    registryId: "requirement-registry-v40-p1",
    records,
    recordCount: records.length,
    kindBreakdown: countBy(records.map((record) => record.requirementKind)),
    sourceBreakdown: countBy(records.map((record) => record.source)),
    statusBreakdown: countBy(records.map((record) => record.requirementStatus)),
    registryReady: records.length >= 30,
    mode: "requirement-intelligence",
  };
}

export function registerRequirement(record: RequirementRecord): RequirementRecord {
  const normalized = { ...record, mode: "requirement-intelligence" as const };
  requirementOverrides.set(record.requirementId, normalized);
  cachedRegistryRecords = undefined;
  return normalized;
}

export function updateRequirement(
  requirementId: string,
  patch: Partial<RequirementRecord>,
): RequirementRecord {
  const existing = findRequirementById(requirementId);
  if (!existing) {
    throw new Error(`Requirement not found: ${requirementId}`);
  }
  const updated: RequirementRecord = {
    ...existing,
    ...patch,
    requirementId,
    mode: "requirement-intelligence",
  };
  requirementOverrides.set(requirementId, updated);
  cachedRegistryRecords = undefined;
  return updated;
}

export function resolveRequirementRef(ref: string): RequirementRecord | undefined {
  const normalized = normalizeRequirementRef(ref);
  return buildRequirementRegistryRecords().find((record) => record.requirementRef === normalized);
}

export function resolveRequirementId(requirementId: string): RequirementRecord | undefined {
  return findRequirementById(requirementId);
}

export function findRequirementById(requirementId: string): RequirementRecord | undefined {
  return buildRequirementRegistryRecords().find((record) => record.requirementId === requirementId);
}

export function findRequirementByTender(tenderId: string, limit?: number): RequirementRecord[] {
  const records = buildRequirementRegistryRecords().filter((record) => record.tenderId === tenderId);
  return limit !== undefined ? records.slice(0, limit) : records;
}

export function findRequirementByBrand(brandId: string, limit?: number): RequirementRecord[] {
  const records = buildRequirementRegistryRecords().filter((record) => record.brandId === brandId);
  return limit !== undefined ? records.slice(0, limit) : records;
}

export function findRequirementByKind(kind: RequirementKind, limit?: number): RequirementRecord[] {
  const records = buildRequirementRegistryRecords().filter((record) => record.requirementKind === kind);
  return limit !== undefined ? records.slice(0, limit) : records;
}

export function findRequirementByPriority(
  priority: RequirementPriority,
  limit?: number,
): RequirementRecord[] {
  const records = buildRequirementRegistryRecords().filter((record) => record.priority === priority);
  return limit !== undefined ? records.slice(0, limit) : records;
}

function applyRequirementQuery(query: RequirementQuery, source: RequirementRecord[]): RequirementRecord[] {
  let records = [...source];

  if (query.tenderId) records = records.filter((record) => record.tenderId === query.tenderId);
  if (query.brandId) records = records.filter((record) => record.brandId === query.brandId);
  if (query.proposalId) records = records.filter((record) => record.proposalId === query.proposalId);
  if (query.requirementKind) {
    records = records.filter((record) => record.requirementKind === query.requirementKind);
  }
  if (query.requirementStatus) {
    records = records.filter((record) => record.requirementStatus === query.requirementStatus);
  }
  if (query.priority) records = records.filter((record) => record.priority === query.priority);
  if (query.source) records = records.filter((record) => record.source === query.source);
  if (query.minRequirementScore !== undefined) {
    records = records.filter(
      (record) => record.score.totalRequirementScore >= query.minRequirementScore!,
    );
  }
  if (query.limit !== undefined) records = records.slice(0, query.limit);

  return records;
}

export function executeRequirementQuery(query: RequirementQuery = {}): RequirementRecord[] {
  return applyRequirementQuery(query, buildRequirementRegistryRecords());
}

export function findTopRequirementRecords(limit = 5): RequirementRecord[] {
  return [...buildRequirementRegistryRecords()]
    .filter((record) => record.score.totalRequirementScore >= TOP_REQUIREMENT_SCORE_THRESHOLD)
    .sort((a, b) => b.score.totalRequirementScore - a.score.totalRequirementScore)
    .slice(0, limit);
}

function getActiveMarketplaceTenderIds(): string[] {
  return getAllTenderProfiles()
    .filter((profile) =>
      ACTIVE_TENDER_MARKETPLACE_STATUSES.includes(
        profile.status as (typeof ACTIVE_TENDER_MARKETPLACE_STATUSES)[number],
      ),
    )
    .map((profile) => profile.tenderId);
}

export function validateRequirementRegistry(): RequirementValidation {
  const records = buildRequirementRegistryRecords();
  const requirementIds = new Set(records.map((record) => record.requirementId));
  const requirementRefs = new Set(records.map((record) => record.requirementRef));
  const idUnique = requirementIds.size === records.length;
  const refUnique = requirementRefs.size === records.length;

  const kindCoverage = REQUIREMENT_KINDS.every((kind) =>
    records.some((record) => record.requirementKind === kind),
  );

  const sources: RequirementSource[] = [
    "v39-evidence-stub",
    "v28-requirement-profile",
    "v34-requirement-anchor",
    "v36-tender-requirement",
  ];
  const sourceCoverage = sources.every((source) =>
    records.some((record) => record.source === source),
  );

  const hasBrandSource = records.some((record) => Boolean(record.brandId));
  const hasProposalSource = records.some((record) => Boolean(record.proposalId));
  const hasAnchorSource = records.some((record) => Boolean(record.anchorId));
  const hasTenderSource = records.some((record) => record.source === "v36-tender-requirement");

  const activeTenderCoverage = getActiveMarketplaceTenderIds().every(
    (tenderId) => findRequirementByTender(tenderId).length >= 1,
  );

  const scoreValid = records.every(
    (record) =>
      record.score.completenessScore > 0 &&
      record.score.clarityScore > 0 &&
      record.score.totalRequirementScore > 0,
  );

  const canonical = executeRequirementQuery(CANONICAL_REQUIREMENT_QUERY);
  const kindCount = REQUIREMENT_KINDS.filter((kind) =>
    records.some((record) => record.requirementKind === kind),
  ).length;

  const valid =
    records.length >= 30 &&
    idUnique &&
    refUnique &&
    kindCoverage &&
    sourceCoverage &&
    hasBrandSource &&
    hasProposalSource &&
    hasAnchorSource &&
    hasTenderSource &&
    activeTenderCoverage &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: records.length,
    summary: `requirement-registry count=${records.length} kinds=${kindCount}/8 sources=4/4 idUnique=${idUnique} refUnique=${refUnique} activeTendersOk=${activeTenderCoverage} valid=${valid}`,
  };
}

export type { RequirementKind, RequirementPriority, RequirementQuery, RequirementSource, RequirementStatus };
