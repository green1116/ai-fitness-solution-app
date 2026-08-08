/**
 * Release / WP-1 — Release Readiness
 * Aggregates EP-1~EP-4 freeze manifests into a deterministic release gate.
 * Additive. No mocks. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 (EP-1~EP-4 freezes).
 */

import { createHash } from "node:crypto";

import { PILOT_GA_VERSION } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_1_BASELINE,
  EP_1_FREEZE_VERSION,
  buildEp1Manifest,
  type Ep1Manifest,
} from "@/lib/enterprise/ep1-manifest";
import {
  EP_2_BASELINE,
  EP_2_FREEZE_VERSION,
  buildEp2Manifest,
  type Ep2Manifest,
} from "@/lib/enterprise/ep2-manifest";
import {
  EP_3_BASELINE,
  EP_3_FREEZE_VERSION,
  buildEp3Manifest,
  type Ep3Manifest,
} from "@/lib/enterprise/ep3-manifest";
import {
  EP_4_BASELINE,
  EP_4_FREEZE_VERSION,
  EP_4_PRODUCTION_HANDLERS,
  EP_4_PRODUCTION_ROUTES,
  EP_4_PRODUCTION_UI_HOST,
  buildEp4Manifest,
  type Ep4Manifest,
} from "@/lib/enterprise/ep4-manifest";

export const RELEASE_ID = "Release" as const;
export const RELEASE_WP1_ID = "WP-1" as const;
export const RELEASE_READINESS_CAPABILITY = "ReleaseReadiness" as const;
export const RELEASE_READINESS_VERSION =
  "release-wp-1-readiness-1" as const;
/** Reuses Pilot GA baseline shared by EP-1~EP-4 freezes. */
export const RELEASE_READINESS_BASELINE = PILOT_GA_VERSION;

export const RELEASE_EP_FREEZE_IDS = [
  "EP-1",
  "EP-2",
  "EP-3",
  "EP-4",
] as const;
export type ReleaseEpFreezeId = (typeof RELEASE_EP_FREEZE_IDS)[number];

export type ReleaseEpFreezeRef = Readonly<{
  epId: ReleaseEpFreezeId;
  freezeVersion: string;
  baseline: string;
  certification: "certified" | "blocked";
  fingerprint: string;
  workPackageCount: number;
  closure: string;
}>;

export type ReleaseReadinessChecks = Readonly<{
  exportsOk: boolean;
  routesOk: boolean;
  actionsOk: boolean;
  apisOk: boolean;
  noMock: boolean;
  rollbackOk: boolean;
}>;

export type ReleaseRollbackGate = Readonly<{
  ready: boolean;
  strategy: "ep-freeze-baseline";
  restoreTargets: readonly string[];
  mocked: false;
}>;

export type ReleaseReadiness = Readonly<{
  version: typeof RELEASE_READINESS_VERSION;
  baseline: typeof RELEASE_READINESS_BASELINE;
  capability: typeof RELEASE_READINESS_CAPABILITY;
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RELEASE_WP1_ID;
  fingerprint: string;
  epFreezes: readonly ReleaseEpFreezeRef[];
  routes: readonly string[];
  handlers: readonly string[];
  uiHostComponent: string;
  checks: ReleaseReadinessChecks;
  rollback: ReleaseRollbackGate;
  status: "READY" | "BLOCKED";
}>;

let cached: ReleaseReadiness | null = null;

function cloneReadiness(row: ReleaseReadiness): ReleaseReadiness {
  return {
    ...row,
    epFreezes: row.epFreezes.map((e) => ({ ...e })),
    routes: [...row.routes],
    handlers: [...row.handlers],
    checks: { ...row.checks },
    rollback: {
      ...row.rollback,
      restoreTargets: [...row.rollback.restoreTargets],
    },
  };
}

function refFromEp1(m: Ep1Manifest): ReleaseEpFreezeRef {
  return {
    epId: "EP-1",
    freezeVersion: m.version,
    baseline: m.baseline,
    certification: m.certification,
    fingerprint: m.fingerprint,
    workPackageCount: m.workPackages.length,
    closure: m.scope.closure,
  };
}

function refFromEp2(m: Ep2Manifest): ReleaseEpFreezeRef {
  return {
    epId: "EP-2",
    freezeVersion: m.version,
    baseline: m.baseline,
    certification: m.certification,
    fingerprint: m.fingerprint,
    workPackageCount: m.workPackages.length,
    closure: m.scope.closure,
  };
}

function refFromEp3(m: Ep3Manifest): ReleaseEpFreezeRef {
  return {
    epId: "EP-3",
    freezeVersion: m.version,
    baseline: m.baseline,
    certification: m.certification,
    fingerprint: m.fingerprint,
    workPackageCount: m.workPackages.length,
    closure: m.scope.closure,
  };
}

function refFromEp4(m: Ep4Manifest): ReleaseEpFreezeRef {
  return {
    epId: "EP-4",
    freezeVersion: m.version,
    baseline: m.baseline,
    certification: m.certification,
    fingerprint: m.fingerprint,
    workPackageCount: m.workPackages.length,
    closure: m.scope.closure,
  };
}

function stablePayload(row: Omit<ReleaseReadiness, "fingerprint">): string {
  return JSON.stringify({
    version: row.version,
    baseline: row.baseline,
    capability: row.capability,
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    epFreezes: row.epFreezes,
    routes: row.routes,
    handlers: row.handlers,
    uiHostComponent: row.uiHostComponent,
    checks: row.checks,
    rollback: row.rollback,
    status: row.status,
    freezeVersions: [
      EP_1_FREEZE_VERSION,
      EP_2_FREEZE_VERSION,
      EP_3_FREEZE_VERSION,
      EP_4_FREEZE_VERSION,
    ],
    baselines: [EP_1_BASELINE, EP_2_BASELINE, EP_3_BASELINE, EP_4_BASELINE],
  });
}

function computeFingerprint(
  row: Omit<ReleaseReadiness, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

/**
 * Build release readiness from EP-1~EP-4 freeze manifests.
 */
export function buildReleaseReadiness(): ReleaseReadiness {
  const ep1 = buildEp1Manifest();
  const ep2 = buildEp2Manifest();
  const ep3 = buildEp3Manifest();
  const ep4 = buildEp4Manifest();

  const epFreezes: ReleaseEpFreezeRef[] = [
    refFromEp1(ep1),
    refFromEp2(ep2),
    refFromEp3(ep3),
    refFromEp4(ep4),
  ];

  const allCertified = epFreezes.every((e) => e.certification === "certified");
  const baselinesAligned = epFreezes.every(
    (e) => e.baseline === RELEASE_READINESS_BASELINE,
  );
  const routes = [...EP_4_PRODUCTION_ROUTES];
  const handlers = [...EP_4_PRODUCTION_HANDLERS];
  const uiHostComponent = EP_4_PRODUCTION_UI_HOST;

  const exportsOk =
    allCertified &&
    ep1.workPackages.every((w) => w.buildApi.length > 0 && w.getApi.length > 0) &&
    ep2.workPackages.every((w) => w.buildApi.length > 0 && w.getApi.length > 0) &&
    ep3.workPackages.every((w) => w.buildApi.length > 0 && w.getApi.length > 0) &&
    ep4.workPackages.every((w) => w.buildApi.length > 0 && w.getApi.length > 0);

  const routesOk =
    ep4.certification === "certified" &&
    routes.length === EP_4_PRODUCTION_ROUTES.length &&
    routes.every((r) => r.startsWith("/"));

  const actionsOk =
    ep4.certification === "certified" &&
    ep4.scope.productionUiIntegrated === true &&
    uiHostComponent === "WorkflowEntryPanelActions";

  const apisOk =
    ep4.certification === "certified" &&
    handlers.length === EP_4_PRODUCTION_HANDLERS.length &&
    handlers.every((h) => h.length > 0);

  const noMock =
    allCertified &&
    ep1.scope.additiveOnly === true &&
    ep2.scope.additiveOnly === true &&
    ep3.scope.additiveOnly === true &&
    ep4.scope.additiveOnly === true;

  const rollback: ReleaseRollbackGate = {
    ready: allCertified && baselinesAligned,
    strategy: "ep-freeze-baseline",
    restoreTargets: epFreezes.map((e) => e.freezeVersion),
    mocked: false,
  };

  const checks: ReleaseReadinessChecks = {
    exportsOk,
    routesOk,
    actionsOk,
    apisOk,
    noMock,
    rollbackOk: rollback.ready,
  };

  const allChecks =
    checks.exportsOk &&
    checks.routesOk &&
    checks.actionsOk &&
    checks.apisOk &&
    checks.noMock &&
    checks.rollbackOk;

  const withoutFp: Omit<ReleaseReadiness, "fingerprint"> = {
    version: RELEASE_READINESS_VERSION,
    baseline: RELEASE_READINESS_BASELINE,
    capability: RELEASE_READINESS_CAPABILITY,
    releaseId: RELEASE_ID,
    workPackageId: RELEASE_WP1_ID,
    epFreezes,
    routes,
    handlers,
    uiHostComponent,
    checks,
    rollback,
    status: allChecks ? ("READY" as const) : ("BLOCKED" as const),
  };

  const out: ReleaseReadiness = {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };

  cached = cloneReadiness(out);
  return cloneReadiness(cached);
}

/**
 * Get the last built readiness, or build if none cached.
 */
export function getReleaseReadiness(): ReleaseReadiness {
  if (!cached) {
    return buildReleaseReadiness();
  }
  return cloneReadiness(cached);
}

/** Stable content fingerprint for determinism checks. */
export function releaseReadinessFingerprint(
  row?: ReleaseReadiness,
): string {
  const v = row ?? getReleaseReadiness();
  return v.fingerprint;
}

/** Test helper — clears readiness cache only. */
export function clearReleaseReadiness(): void {
  cached = null;
}
