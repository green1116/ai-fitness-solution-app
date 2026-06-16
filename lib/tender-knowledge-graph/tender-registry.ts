import { buildTenderRegistryRecords as buildTenderHubRegistryRecords } from "@/lib/tender-hub";
import { getAllTenderProfiles } from "@/lib/tender-marketplace/tender-profile/data";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import type { TenderGraphRecord, TenderPriority, TenderRegistry, TenderGraphValidation } from "./shared/types";
import { CANONICAL_TENDER_GRAPH_TENDER_ID, TKG_MIN_TENDER_COUNT } from "./shared/constants";

function resolvePriority(score: number, mandatory?: boolean): TenderPriority {
  if (mandatory && score >= 85) return "critical";
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function seedFromRequirementTenders(): TenderGraphRecord[] {
  const seen = new Set<string>();
  const records: TenderGraphRecord[] = [];

  for (const req of buildRequirementRegistryRecords()) {
    if (seen.has(req.tenderId)) continue;
    seen.add(req.tenderId);

    const budget = Math.round(req.coverageScore * 1000 + req.matchScore * 100);
    records.push({
      tenderId: req.tenderId,
      projectType: req.requirementKind,
      budget,
      region: req.metadata.region ?? "China",
      status: req.requirementStatus,
      priority: req.priority,
      title: req.title,
      mode: "tender-knowledge-graph",
    });
  }

  return records;
}

function seedFromTenderHub(): TenderGraphRecord[] {
  return buildTenderHubRegistryRecords().map((tender) => ({
    tenderId: tender.tenderId,
    projectType: tender.metadata.venueType ?? tender.sourceType,
    budget: Math.round(tender.score.budgetScore * 1000),
    region: tender.metadata.region ?? "China",
    status: tender.tenderStatus,
    priority: resolvePriority(tender.score.matchingScore),
    title: tender.title,
    mode: "tender-knowledge-graph" as const,
  }));
}

function seedFromMarketplace(): TenderGraphRecord[] {
  return getAllTenderProfiles().map((profile) => ({
    tenderId: profile.tenderId,
    projectType: profile.industry,
    budget: profile.budget,
    region: profile.city,
    status: profile.status,
    priority: resolvePriority(profile.budget >= 1000000 ? 85 : 70, true),
    title: profile.title,
    mode: "tender-knowledge-graph" as const,
  }));
}

let cachedTenderRecords: TenderGraphRecord[] | undefined;

export function buildTenderRegistryRecords(): TenderGraphRecord[] {
  if (cachedTenderRecords) return cachedTenderRecords;

  const merged = new Map<string, TenderGraphRecord>();
  for (const record of [
    ...seedFromMarketplace(),
    ...seedFromTenderHub(),
    ...seedFromRequirementTenders(),
  ]) {
    merged.set(record.tenderId, record);
  }

  cachedTenderRecords = [...merged.values()];
  return cachedTenderRecords;
}

export function buildTenderRegistry(): TenderRegistry {
  const records = buildTenderRegistryRecords();
  return {
    registryId: "tender-knowledge-graph-registry-v41-p1",
    records,
    recordCount: records.length,
    registryReady: records.length >= TKG_MIN_TENDER_COUNT,
    mode: "tender-knowledge-graph",
  };
}

export function findTenderGraphRecordById(tenderId: string): TenderGraphRecord | undefined {
  return buildTenderRegistryRecords().find((record) => record.tenderId === tenderId);
}

export function validateTenderRegistry(): TenderGraphValidation {
  const records = buildTenderRegistryRecords();
  const canonical = findTenderGraphRecordById(CANONICAL_TENDER_GRAPH_TENDER_ID);
  const valid = records.length >= TKG_MIN_TENDER_COUNT && Boolean(canonical);

  return {
    valid,
    count: records.length,
    summary: `tender-registry count=${records.length} canonical=${Boolean(canonical)} valid=${valid}`,
  };
}
