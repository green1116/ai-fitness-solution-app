/**
 * PG-1.2 — Runtime Health Foundation
 * Read-only deterministic health contract (no live probes).
 * Baseline: pg1-release-health-v1 (derives from PG-1.1).
 * No DB / UI / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import { RELEASE_ID } from "../release-readiness";
import {
  PG_1_1_ID,
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_REGISTRY_VERSION,
  buildReleaseHealthRegistry,
  getReleaseHealthRegistry,
  type ReleaseHealthRecord,
  type ReleaseHealthVerificationStatus,
} from "./release-health-registry";

export const PG_1_2_ID = "PG-1.2" as const;
export const RUNTIME_HEALTH_CAPABILITY = "RuntimeHealthFoundation" as const;
export const RUNTIME_HEALTH_VERSION =
  "pg-1.2-runtime-health-foundation-1" as const;
/** PG-1.1 release health pack baseline. */
export const PG1_RELEASE_HEALTH_BASELINE = "pg1-release-health-v1" as const;

export type ApplicationHealthStatus = "UP" | "DEGRADED" | "DOWN";
export type ReleaseHealthStatus = ReleaseHealthVerificationStatus;
export type ReadinessSignal = "READY" | "NOT_READY" | "UNDECLARED";
export type DependencyHealthStatus = "HEALTHY" | "DEGRADED" | "UNAVAILABLE";

export type RuntimeDependencyStatus = Readonly<{
  id: string;
  name: string;
  status: DependencyHealthStatus;
  kind: "runtime" | "platform" | "data" | "edge";
}>;

/**
 * Runtime health contract — signals only; no live DB/API calls.
 * Readiness is derived from the release health registry.
 */
export type RuntimeHealthFoundation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_1_2_ID;
  capability: typeof RUNTIME_HEALTH_CAPABILITY;
  version: typeof RUNTIME_HEALTH_VERSION;
  baselineTag: typeof PG1_RELEASE_HEALTH_BASELINE;
  parentPack: typeof PG_1_1_ID;
  parentBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  parentVersion: typeof RELEASE_HEALTH_REGISTRY_VERSION;
  applicationStatus: ApplicationHealthStatus;
  releaseStatus: ReleaseHealthStatus;
  databaseReadiness: ReadinessSignal;
  apiReadiness: ReadinessSignal;
  dependencies: readonly RuntimeDependencyStatus[];
  releaseHealthFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noLiveProbes: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
  };
}>;

const DEPENDENCY_DEFS = [
  { id: "dep-next", name: "next", kind: "runtime" },
  { id: "dep-prisma", name: "prisma", kind: "data" },
  { id: "dep-vercel", name: "vercel", kind: "platform" },
  { id: "dep-ga-release", name: "ga-release-train", kind: "edge" },
] as const satisfies ReadonlyArray<{
  id: string;
  name: string;
  kind: RuntimeDependencyStatus["kind"];
}>;

let cached: RuntimeHealthFoundation | null = null;

function cloneFoundation(
  row: RuntimeHealthFoundation,
): RuntimeHealthFoundation {
  return {
    ...row,
    dependencies: row.dependencies.map((d) => ({ ...d })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<RuntimeHealthFoundation, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentBaseline: row.parentBaseline,
    parentVersion: row.parentVersion,
    applicationStatus: row.applicationStatus,
    releaseStatus: row.releaseStatus,
    databaseReadiness: row.databaseReadiness,
    apiReadiness: row.apiReadiness,
    dependencies: row.dependencies,
    releaseHealthFingerprint: row.releaseHealthFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RuntimeHealthFoundation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function mapApplication(
  status: ReleaseHealthVerificationStatus,
): ApplicationHealthStatus {
  if (status === "PASS") return "UP";
  if (status === "FAIL") return "DOWN";
  return "DEGRADED";
}

function mapReadiness(status: ReleaseHealthVerificationStatus): ReadinessSignal {
  if (status === "PASS") return "READY";
  if (status === "FAIL") return "NOT_READY";
  return "UNDECLARED";
}

function mapDependency(
  status: ReleaseHealthVerificationStatus,
): DependencyHealthStatus {
  if (status === "PASS") return "HEALTHY";
  if (status === "FAIL") return "UNAVAILABLE";
  return "DEGRADED";
}

function deriveFromReleaseHealth(
  health: ReleaseHealthRecord,
): RuntimeHealthFoundation {
  const releaseStatus = health.verificationStatus;
  const depStatus = mapDependency(releaseStatus);
  const withoutFp: Omit<RuntimeHealthFoundation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_1_2_ID,
    capability: RUNTIME_HEALTH_CAPABILITY,
    version: RUNTIME_HEALTH_VERSION,
    baselineTag: PG1_RELEASE_HEALTH_BASELINE,
    parentPack: PG_1_1_ID,
    parentBaseline: POST_GA_PRODUCTION_BASELINE,
    parentVersion: RELEASE_HEALTH_REGISTRY_VERSION,
    applicationStatus: mapApplication(releaseStatus),
    releaseStatus,
    databaseReadiness: mapReadiness(releaseStatus),
    apiReadiness: mapReadiness(releaseStatus),
    dependencies: DEPENDENCY_DEFS.map((d) => ({
      id: d.id,
      name: d.name,
      kind: d.kind,
      status: depStatus,
    })),
    releaseHealthFingerprint: health.fingerprint,
    scope: {
      readOnly: true,
      noLiveProbes: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build runtime health foundation from PG-1.1 release health. */
export function buildRuntimeHealthFoundation(): RuntimeHealthFoundation {
  const health = getReleaseHealthRegistry();
  const out = deriveFromReleaseHealth(health);
  cached = cloneFoundation(out);
  return cloneFoundation(cached);
}

/** Get last built foundation, or build if none cached. */
export function getRuntimeHealthFoundation(): RuntimeHealthFoundation {
  if (!cached) {
    return buildRuntimeHealthFoundation();
  }
  return cloneFoundation(cached);
}

/** Stable content fingerprint for determinism checks. */
export function runtimeHealthFoundationFingerprint(
  row?: RuntimeHealthFoundation,
): string {
  const v = row ?? getRuntimeHealthFoundation();
  return v.fingerprint;
}

/** Test helper — clears runtime health cache only. */
export function clearRuntimeHealthFoundation(): void {
  cached = null;
}

/** Ensure release health then build runtime foundation (verify scripts). */
export function ensureReleaseHealthThenBuildRuntime(): RuntimeHealthFoundation {
  buildReleaseHealthRegistry();
  clearRuntimeHealthFoundation();
  return buildRuntimeHealthFoundation();
}
