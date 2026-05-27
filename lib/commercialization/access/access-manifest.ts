/**
 * V3.7-H9 Production Access — access review manifest (static aggregation)
 */

import { BUILD_FREEZE_MANIFEST } from "../stabilization/build-freeze";
import { PRODUCTION_AUDIT_VERSION } from "../audit";
import { PRODUCTION_RELEASE_LEDGER_VERSION } from "../release-ledger";
import { PRODUCTION_OPS_PORTAL_VERSION } from "../ops";
import { buildOpsPortalManifest } from "../ops/ops-portal-manifest";
import { ACCESS_MATRIX_VERSION } from "./access-matrix";

export const ACCESS_MANIFEST_VERSION = "3.7-h9-manifest-1" as const;

export type AccessManifest = {
  version: typeof ACCESS_MANIFEST_VERSION;
  manifestId: string;
  ACCESS_MATRIX_VERSION: typeof ACCESS_MATRIX_VERSION;
  OPS_PORTAL_VERSION: typeof PRODUCTION_OPS_PORTAL_VERSION;
  AUDIT_VERSION: typeof PRODUCTION_AUDIT_VERSION;
  RELEASE_LEDGER_VERSION: typeof PRODUCTION_RELEASE_LEDGER_VERSION;
  buildPassed: boolean;
  tscPassed: boolean;
  verificationPassed: boolean;
  readyForOps: boolean;
  readyForReview: boolean;
  summary: string;
};

export function buildAccessManifest(input?: { deploymentId?: string }): AccessManifest {
  const deploymentId = input?.deploymentId ?? "access-manifest";
  const manifestId = `ACM-V37H9-${deploymentId.slice(0, 8)}`;
  const freeze = BUILD_FREEZE_MANIFEST;
  const ops = buildOpsPortalManifest({ deploymentId });

  const verificationPassed =
    freeze.runtimeVerified && freeze.evidenceVerified && freeze.executiveVerified;
  const readyForOps = ops.readyForOps;
  const readyForReview =
    readyForOps &&
    freeze.buildPassed &&
    freeze.tscPassed &&
    verificationPassed &&
    ops.auditStatus === "pass" &&
    ops.releaseLedgerStatus === "pass";

  return {
    version: ACCESS_MANIFEST_VERSION,
    manifestId,
    ACCESS_MATRIX_VERSION,
    OPS_PORTAL_VERSION: PRODUCTION_OPS_PORTAL_VERSION,
    AUDIT_VERSION: PRODUCTION_AUDIT_VERSION,
    RELEASE_LEDGER_VERSION: PRODUCTION_RELEASE_LEDGER_VERSION,
    buildPassed: freeze.buildPassed,
    tscPassed: freeze.tscPassed,
    verificationPassed,
    readyForOps,
    readyForReview,
    summary: `access-manifest id=${manifestId} readyForOps=${readyForOps} readyForReview=${readyForReview} matrix=${ACCESS_MATRIX_VERSION} ops=${PRODUCTION_OPS_PORTAL_VERSION}`,
  };
}
