/**
 * V70 P1 — Release catalog (declarative)
 */
import type { ReleaseCatalogEntry, ReleaseCatalogManifest } from "./release.types";
import { V70_RELEASE_VERSION } from "./release.types";

export const RELEASE_CATALOG: ReleaseCatalogEntry[] = [
  {
    id: "DLV-REL-001",
    release: "technical-governance-baseline",
    version: "v69-technical-governance-freeze-1",
    channel: "stable",
    stage: "production",
    artifact: "lib/technical-governance/v69/",
    owner: "platform-engineering",
    status: "active",
    compatibility: "backward-compatible",
    supportWindow: "LTS-12m",
    rollbackTarget: "v68-platform-freeze-1",
    required: true,
    description: "V69 technical governance frozen baseline release",
  },
  {
    id: "DLV-REL-002",
    release: "platform-governance-baseline",
    version: "v68-platform-freeze-1",
    channel: "stable",
    stage: "production",
    artifact: "lib/platform/v68/",
    owner: "platform-engineering",
    status: "active",
    compatibility: "backward-compatible",
    supportWindow: "LTS-12m",
    rollbackTarget: "v67-monitoring-freeze-1",
    required: true,
    description: "V68 platform governance frozen baseline release",
  },
  {
    id: "DLV-REL-003",
    release: "application-runtime",
    version: "0.1.0",
    channel: "stable",
    stage: "production",
    artifact: "app/",
    owner: "product-engineering",
    status: "active",
    compatibility: "patch-only",
    supportWindow: "90d",
    rollbackTarget: "DLV-REL-003-prev",
    required: true,
    description: "Next.js application production release track",
  },
  {
    id: "DLV-REL-004",
    release: "api-surface",
    version: "0.1.0",
    channel: "stable",
    stage: "production",
    artifact: "app/api/",
    owner: "api-platform",
    status: "active",
    compatibility: "backward-compatible",
    supportWindow: "90d",
    rollbackTarget: "DLV-REL-004-prev",
    required: true,
    description: "API route orchestration release track",
  },
  {
    id: "DLV-REL-005",
    release: "delivery-lifecycle-foundation",
    version: "v70-release-catalog-1",
    channel: "internal",
    stage: "build",
    artifact: "lib/delivery/v70/",
    owner: "release-engineering",
    status: "draft",
    compatibility: "none",
    supportWindow: "n/a",
    rollbackTarget: "n/a",
    required: true,
    description: "V70 P1 enterprise delivery lifecycle foundation",
  },
  {
    id: "DLV-REL-006",
    release: "staging-candidate",
    version: "0.1.0-rc.1",
    channel: "beta",
    stage: "staging",
    artifact: "dist/staging/",
    owner: "release-engineering",
    status: "draft",
    compatibility: "breaking",
    supportWindow: "14d",
    rollbackTarget: "DLV-REL-003",
    required: true,
    description: "Staging release candidate channel",
  },
  {
    id: "DLV-REL-007",
    release: "canary-probe",
    version: "0.1.0-canary.1",
    channel: "canary",
    stage: "staging",
    artifact: "dist/canary/",
    owner: "sre",
    status: "draft",
    compatibility: "patch-only",
    supportWindow: "7d",
    rollbackTarget: "DLV-REL-003",
    required: true,
    description: "Canary delivery probe release",
  },
  {
    id: "DLV-REL-008",
    release: "legacy-portal",
    version: "0.0.9",
    channel: "stable",
    stage: "archived",
    artifact: "legacy/portal/",
    owner: "product-engineering",
    status: "retired",
    compatibility: "none",
    supportWindow: "expired",
    rollbackTarget: "n/a",
    required: true,
    description: "Retired legacy portal release track",
  },
];

export function buildReleaseCatalogManifest(): ReleaseCatalogManifest {
  const releases = RELEASE_CATALOG;
  const channels = new Set(releases.map((r) => r.channel));
  const stages = new Set(releases.map((r) => r.stage));
  const catalogComplete = releases.length >= 6 && channels.size >= 3 && stages.size >= 4;

  return {
    version: V70_RELEASE_VERSION,
    entryCount: releases.length,
    channelCount: channels.size,
    stageCount: stages.size,
    catalogComplete,
    releases,
    summary: [
      `release-catalog count=${releases.length}`,
      `channels=${channels.size}`,
      `stages=${stages.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getReleaseById(id: string): ReleaseCatalogEntry | undefined {
  return RELEASE_CATALOG.find((r) => r.id === id);
}

export function getReleasesByChannel(
  channel: ReleaseCatalogEntry["channel"],
): ReleaseCatalogEntry[] {
  return RELEASE_CATALOG.filter((r) => r.channel === channel);
}

export function getReleasesByStage(
  stage: ReleaseCatalogEntry["stage"],
): ReleaseCatalogEntry[] {
  return RELEASE_CATALOG.filter((r) => r.stage === stage);
}
