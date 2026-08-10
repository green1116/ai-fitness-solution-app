/**
 * PG-3.3 — Growth Evidence
 * Read-only deterministic growth evidence contract (no live billing/CRM store).
 * Baseline: pg3-commercial-health-v1 (derives from PG-3.2).
 * No DB / UI / billing / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import { RELEASE_ID } from "../release-readiness";
import {
  COMMERCIAL_HEALTH_VERSION,
  PG_3_2_ID,
  PG3_REVENUE_LIFECYCLE_BASELINE,
  buildCommercialHealth,
  getCommercialHealth,
  type CommercialHealthFoundation,
  type CommercialHealthRecord,
  type CommercialHealthStatus,
  type ExpansionReadiness,
  type GrowthSignal,
} from "./commercial-health";

export const PG_3_3_ID = "PG-3.3" as const;
export const GROWTH_EVIDENCE_CAPABILITY = "GrowthEvidence" as const;
export const GROWTH_EVIDENCE_VERSION = "pg-3.3-growth-evidence-1" as const;
/** PG-3.2 commercial health pack baseline. */
export const PG3_COMMERCIAL_HEALTH_BASELINE = "pg3-commercial-health-v1" as const;

export const GROWTH_SIGNAL_TYPES = [
  "COMMERCIAL_OBSERVED",
  "GROWTH_SCORED",
  "RETENTION_SIGNALED",
  "EXPANSION_OPPORTUNITY",
] as const;
export type GrowthSignalType = (typeof GROWTH_SIGNAL_TYPES)[number];

export const OPPORTUNITY_SIGNALS = [
  "NONE",
  "WATCH",
  "QUALIFIED",
  "ACTIVE",
] as const;
export type OpportunitySignal = (typeof OPPORTUNITY_SIGNALS)[number];

export type GrowthEvidenceSource = Readonly<{
  actor: "system";
  source: "pg-3-revenue-chain";
  capability: typeof GROWTH_EVIDENCE_CAPABILITY;
}>;

export type GrowthEvidenceReference = Readonly<{
  commercialHealthFingerprint: string;
  commercialHealth: CommercialHealthStatus;
  growthSignal: GrowthSignal;
  contractVersion: "pg-3.3-growth-evidence-1";
}>;

export type GrowthEvidenceRecord = Readonly<{
  customerId: string;
  growthEventId: string;
  signalType: GrowthSignalType;
  source: GrowthEvidenceSource;
  evidenceReference: GrowthEvidenceReference;
  opportunitySignal: OpportunitySignal;
  expansionReadiness: ExpansionReadiness;
  customerOrdinal: number;
  ordinal: number;
}>;

export type GrowthEvidenceFoundation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_3_3_ID;
  capability: typeof GROWTH_EVIDENCE_CAPABILITY;
  version: typeof GROWTH_EVIDENCE_VERSION;
  baselineTag: typeof PG3_COMMERCIAL_HEALTH_BASELINE;
  parentPack: typeof PG_3_2_ID;
  parentVersion: typeof COMMERCIAL_HEALTH_VERSION;
  parentBaseline: typeof PG3_REVENUE_LIFECYCLE_BASELINE;
  events: readonly GrowthEvidenceRecord[];
  commercialHealthFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDatabase: true;
    noUi: true;
    noBilling: true;
    additiveOnly: true;
  };
}>;

let cached: GrowthEvidenceFoundation | null = null;

function cloneFoundation(
  row: GrowthEvidenceFoundation,
): GrowthEvidenceFoundation {
  return {
    ...row,
    events: row.events.map((e) => ({
      ...e,
      source: { ...e.source },
      evidenceReference: { ...e.evidenceReference },
    })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<GrowthEvidenceFoundation, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    events: row.events,
    commercialHealthFingerprint: row.commercialHealthFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<GrowthEvidenceFoundation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function mapOpportunity(
  row: CommercialHealthRecord,
): OpportunitySignal {
  switch (row.expansionReadiness) {
    case "IN_MOTION":
      return "ACTIVE";
    case "READY":
      return "QUALIFIED";
    case "CANDIDATE":
      return "WATCH";
    default:
      return "NONE";
  }
}

function signalTypesFor(
  row: CommercialHealthRecord,
): readonly GrowthSignalType[] {
  const types: GrowthSignalType[] = [
    "COMMERCIAL_OBSERVED",
    "GROWTH_SCORED",
    "RETENTION_SIGNALED",
  ];
  if (
    row.expansionReadiness === "CANDIDATE" ||
    row.expansionReadiness === "READY" ||
    row.expansionReadiness === "IN_MOTION"
  ) {
    types.push("EXPANSION_OPPORTUNITY");
  }
  return types;
}

function buildEvents(
  commercial: CommercialHealthFoundation,
): GrowthEvidenceRecord[] {
  const source: GrowthEvidenceSource = {
    actor: "system",
    source: "pg-3-revenue-chain",
    capability: GROWTH_EVIDENCE_CAPABILITY,
  };
  const out: GrowthEvidenceRecord[] = [];
  let ordinal = 0;

  for (const row of commercial.records) {
    const opportunitySignal = mapOpportunity(row);
    for (const signalType of signalTypesFor(row)) {
      ordinal += 1;
      out.push({
        customerId: row.customerId,
        growthEventId: `grw-pg33-${String(ordinal).padStart(2, "0")}-${signalType
          .toLowerCase()
          .replace(/_/g, "-")}`,
        signalType,
        source,
        evidenceReference: {
          commercialHealthFingerprint: commercial.fingerprint,
          commercialHealth: row.commercialHealth,
          growthSignal: row.growthSignal,
          contractVersion: "pg-3.3-growth-evidence-1",
        },
        opportunitySignal,
        expansionReadiness: row.expansionReadiness,
        customerOrdinal: row.ordinal,
        ordinal,
      });
    }
  }

  return out;
}

function deriveFromCommercial(
  commercial: CommercialHealthFoundation,
): GrowthEvidenceFoundation {
  const withoutFp: Omit<GrowthEvidenceFoundation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_3_3_ID,
    capability: GROWTH_EVIDENCE_CAPABILITY,
    version: GROWTH_EVIDENCE_VERSION,
    baselineTag: PG3_COMMERCIAL_HEALTH_BASELINE,
    parentPack: PG_3_2_ID,
    parentVersion: COMMERCIAL_HEALTH_VERSION,
    parentBaseline: PG3_REVENUE_LIFECYCLE_BASELINE,
    events: buildEvents(commercial),
    commercialHealthFingerprint: commercial.fingerprint,
    scope: {
      readOnly: true,
      noDatabase: true,
      noUi: true,
      noBilling: true,
      additiveOnly: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build growth evidence from PG-3.2 commercial health. */
export function buildGrowthEvidence(): GrowthEvidenceFoundation {
  const commercial = getCommercialHealth();
  const out = deriveFromCommercial(commercial);
  cached = cloneFoundation(out);
  return cloneFoundation(cached);
}

/** Get last built foundation, or build if none cached. */
export function getGrowthEvidence(): GrowthEvidenceFoundation {
  if (!cached) {
    return buildGrowthEvidence();
  }
  return cloneFoundation(cached);
}

/** Stable content fingerprint for determinism checks. */
export function growthEvidenceFingerprint(
  row?: GrowthEvidenceFoundation,
): string {
  const v = row ?? getGrowthEvidence();
  return v.fingerprint;
}

/** Test helper — clears growth evidence cache only. */
export function clearGrowthEvidence(): void {
  cached = null;
}

/** Ensure commercial health then build growth evidence (verify scripts). */
export function ensureCommercialThenBuildGrowthEvidence(): GrowthEvidenceFoundation {
  buildCommercialHealth();
  clearGrowthEvidence();
  return buildGrowthEvidence();
}
