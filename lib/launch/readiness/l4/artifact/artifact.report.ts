/**
 * Launch L4 — Artifact report
 */

import {
  listArtifactVerifications,
  listDeliveryArtifacts,
} from "./artifact.verify";
import type {
  ArtifactReport,
  GenerateArtifactReportInput,
} from "./artifact.types";

const reports = new Map<string, ArtifactReport>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReport(report: ArtifactReport): ArtifactReport {
  return { ...report };
}

export function generateArtifactReport(
  input: GenerateArtifactReportInput,
): ArtifactReport {
  const scenarioId = input.scenarioId.trim();
  if (!scenarioId) throw new Error("artifactReport.scenarioId is required");

  const artifacts = listDeliveryArtifacts({ scenarioId });
  if (artifacts.length < 1) {
    throw new Error(`no delivery artifacts for scenario: ${scenarioId}`);
  }

  const verifications = artifacts.flatMap((a) =>
    listArtifactVerifications({ artifactId: a.id }),
  );
  if (verifications.length < 1) {
    throw new Error(
      `no artifact verifications for scenario: ${scenarioId}`,
    );
  }

  const validCount = verifications.filter((v) => v.result === "VALID").length;
  const invalidCount = verifications.filter(
    (v) => v.result === "INVALID",
  ).length;
  const missingCount = verifications.filter(
    (v) => v.result === "MISSING",
  ).length;

  const id = input.id?.trim() || createId("l4rep");
  if (reports.has(id)) {
    throw new Error(`artifact report already exists: ${id}`);
  }

  const report: ArtifactReport = {
    id,
    scenarioId,
    artifactCount: artifacts.length,
    validCount,
    invalidCount,
    missingCount,
    detail: `artifacts=${artifacts.length} valid=${validCount} invalid=${invalidCount} missing=${missingCount}`,
    generatedAt: nowIso(),
  };
  reports.set(id, report);
  return cloneReport(report);
}

export function getArtifactReport(id: string): ArtifactReport | undefined {
  const report = reports.get(id.trim());
  return report ? cloneReport(report) : undefined;
}

export function listArtifactReports(filter?: {
  scenarioId?: string;
}): ArtifactReport[] {
  let result = [...reports.values()];
  if (filter?.scenarioId) {
    const sid = filter.scenarioId.trim();
    result = result.filter((r) => r.scenarioId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneReport);
}

export function clearArtifactReports(): void {
  reports.clear();
}
