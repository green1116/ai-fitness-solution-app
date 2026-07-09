/**
 * V66 P6 — Retention matrix (declarative catalog)
 */
import type { RetentionMatrixEntry, RetentionMatrixManifest } from "./dr.types";
import { V66_DEPLOYMENT_DR_VERSION } from "./dr.types";

export const RETENTION_MATRIX: RetentionMatrixEntry[] = [
  {
    id: "RET-001",
    asset: "PostgreSQL database",
    tier: "hot",
    duration: "7 days",
    rpo: "24h",
    rto: "4h",
    required: true,
  },
  {
    id: "RET-002",
    asset: "Prisma schema snapshots",
    tier: "warm",
    duration: "90 days",
    rpo: "on-change",
    rto: "1h",
    required: true,
  },
  {
    id: "RET-003",
    asset: "Env config templates",
    tier: "warm",
    duration: "365 days",
    rpo: "on-change",
    rto: "30m",
    required: true,
  },
  {
    id: "RET-004",
    asset: "package-lock.json revisions",
    tier: "hot",
    duration: "180 days",
    rpo: "on-change",
    rto: "15m",
    required: true,
  },
  {
    id: "RET-005",
    asset: "V66 deployment artifacts",
    tier: "warm",
    duration: "365 days",
    rpo: "per-release",
    rto: "1h",
    required: true,
  },
  {
    id: "RET-006",
    asset: "Structured deployment logs",
    tier: "cold",
    duration: "30 days",
    rpo: "continuous",
    rto: "2h",
    required: false,
  },
  {
    id: "RET-007",
    asset: "Verify script outputs",
    tier: "cold",
    duration: "14 days",
    rpo: "per-deploy",
    rto: "30m",
    required: false,
  },
  {
    id: "RET-008",
    asset: "Migration rollback plans",
    tier: "archive",
    duration: "indefinite",
    rpo: "per-migration",
    rto: "2h",
    required: true,
  },
];

export function buildRetentionMatrixManifest(): RetentionMatrixManifest {
  const entries = RETENTION_MATRIX;
  const tiers = new Set(entries.map((e) => e.tier));
  const matrixComplete = entries.length >= 6 && tiers.size >= 3;

  return {
    version: V66_DEPLOYMENT_DR_VERSION,
    entryCount: entries.length,
    tierCount: tiers.size,
    matrixComplete,
    entries,
    summary: [
      `retention-matrix entries=${entries.length}`,
      `tiers=${tiers.size}`,
      `complete=${matrixComplete}`,
    ].join(" "),
  };
}

export function getRetentionByTier(tier: RetentionMatrixEntry["tier"]): RetentionMatrixEntry[] {
  return RETENTION_MATRIX.filter((e) => e.tier === tier);
}
