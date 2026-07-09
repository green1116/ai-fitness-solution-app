/**
 * V66 P5 — Artifact integrity inventory (declarative catalog)
 */
import type { ArtifactIntegrityEntry, ArtifactIntegrityManifest } from "./security.types";
import { V66_DEPLOYMENT_SECURITY_VERSION } from "./security.types";

export const ARTIFACT_INTEGRITY_INVENTORY: ArtifactIntegrityEntry[] = [
  {
    id: "AI-001",
    path: "package-lock.json",
    kind: "lockfile",
    required: true,
    integrityCheck: "presence",
    description: "Reproducible dependency install",
  },
  {
    id: "AI-002",
    path: "prisma/schema.prisma",
    kind: "schema",
    required: true,
    integrityCheck: "frozen-reference",
    description: "Prisma schema — not modified by V66 layer",
  },
  {
    id: "AI-003",
    path: "lib/deployment/v66/index.ts",
    kind: "module",
    required: true,
    integrityCheck: "presence",
    description: "V66 deployment module entry",
  },
  {
    id: "AI-004",
    path: ".env.example",
    kind: "config",
    required: true,
    integrityCheck: "presence",
    description: "Env template without live secrets",
  },
  {
    id: "AI-005",
    path: "scripts/verify-v66-p1-deployment-baseline.ts",
    kind: "script",
    required: true,
    integrityCheck: "catalog",
    description: "P1 verify script",
  },
  {
    id: "AI-006",
    path: "scripts/verify-v66-p4-release-orchestration.ts",
    kind: "script",
    required: true,
    integrityCheck: "catalog",
    description: "P4 verify script",
  },
  {
    id: "AI-007",
    path: "docs/deployment/V66-DEPLOYMENT-BASELINE.md",
    kind: "doc",
    required: true,
    integrityCheck: "catalog",
    description: "P1 deployment documentation",
  },
  {
    id: "AI-008",
    path: "docs/deployment/V66-RELEASE-ORCHESTRATION.md",
    kind: "doc",
    required: true,
    integrityCheck: "catalog",
    description: "P4 release documentation",
  },
  {
    id: "AI-009",
    path: "lib/deployment/v66/security.ts",
    kind: "module",
    required: true,
    integrityCheck: "presence",
    description: "P5 security module entry",
  },
  {
    id: "AI-010",
    path: "docs/deployment/V66-DEPLOYMENT-SECURITY.md",
    kind: "doc",
    required: true,
    integrityCheck: "catalog",
    description: "P5 security documentation",
  },
];

export function buildArtifactIntegrityManifest(): ArtifactIntegrityManifest {
  const entries = ARTIFACT_INTEGRITY_INVENTORY;
  const requiredCount = entries.filter((e) => e.required).length;
  const integrityComplete = entries.length >= 8 && requiredCount >= 7;

  return {
    version: V66_DEPLOYMENT_SECURITY_VERSION,
    entryCount: entries.length,
    requiredCount,
    integrityComplete,
    entries,
    summary: [
      `artifact-integrity entries=${entries.length}`,
      `required=${requiredCount}`,
      `complete=${integrityComplete}`,
    ].join(" "),
  };
}

export function getArtifactsByKind(
  kind: ArtifactIntegrityEntry["kind"],
): ArtifactIntegrityEntry[] {
  return ARTIFACT_INTEGRITY_INVENTORY.filter((e) => e.kind === kind);
}
