import type {
  BuildExecutiveReleaseSurfaceInput,
  ExecutiveReleaseDecision,
  ExecutiveReleaseManifest,
  ExecutiveReleaseSurface,
  ExecutiveReleaseSurfacePackage,
  ExecutiveReleaseSurfaceStatus,
} from "../types";
import {
  EXECUTIVE_GATE_REASON_LABELS,
  EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION,
} from "../types";
import { formatExecutiveReleaseSurfaceDebug } from "../debug/executiveReleaseSurfaceDebug";
import { buildReleaseManifestLines } from "../release/surfaceAdapters";

function mapStatus(
  gateStatus: ExecutiveReleaseSurface["gateStatus"],
): ExecutiveReleaseSurfaceStatus {
  return gateStatus;
}

function mapDecision(
  recommendation: ExecutiveReleaseDecision,
): ExecutiveReleaseDecision {
  return recommendation;
}

function buildBlockReasons(
  gateReasons: string[],
  decision: ExecutiveReleaseDecision,
): string[] | undefined {
  if (decision === "release") return undefined;
  return gateReasons.length ? gateReasons : ["Executive gate blocked release"];
}

function buildLabels(input: {
  surface: Pick<
    ExecutiveReleaseSurface,
    "status" | "decision" | "releasable" | "executiveScore" | "conditionalRelease"
  >;
}): string[] {
  const { surface } = input;
  const labels: string[] = [
    `executive-gate:${surface.status}`,
    `executive-decision:${surface.decision}`,
    surface.releasable ? "releasable" : "non-releasable",
    `executive-score:${surface.executiveScore}`,
  ];
  if (surface.conditionalRelease) {
    labels.push("conditional-release-marker");
  }
  if (surface.decision === "block-release") {
    labels.push("block-release");
  }
  return labels;
}

/**
 * V3.4-E11 — 从 E10 Gate + E9 Oversight 构建统一 Release Surface
 */
export function buildExecutiveReleaseSurface(
  input: BuildExecutiveReleaseSurfaceInput,
): ExecutiveReleaseSurfacePackage {
  const gate = input.executiveApprovalGate;
  const oversight = input.executiveOversight;

  const gateReasons = gate.reasons.map(
    (r) => EXECUTIVE_GATE_REASON_LABELS[r] ?? r,
  );

  const decision = mapDecision(gate.recommendation);
  const status = mapStatus(gate.status);
  const conditionalRelease = status === "conditional" || decision === "conditional-release";

  const surface: ExecutiveReleaseSurface = {
    status,
    decision,
    releasable: gate.releasable,
    executiveScore: gate.executiveScore,
    gateStatus: gate.status,
    gateReasons,
    blockReasons: buildBlockReasons(gateReasons, decision),
    labels: [],
    executiveRecommendation: oversight?.recommendation,
    tenderReleaseDecision: gate.tenderReleaseDecision,
    conditionalRelease,
  };

  surface.labels = buildLabels({ surface });

  const generatedAt = new Date().toISOString();
  const manifest: ExecutiveReleaseManifest = {
    version: EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION,
    generatedAt,
    surface,
    lines: buildReleaseManifestLines(surface, {
      runId: input.runId,
      documentId: input.documentId,
    }),
  };

  const debug = formatExecutiveReleaseSurfaceDebug({ surface, manifest });

  return {
    version: EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION,
    ...surface,
    manifest,
    debug,
  };
}
