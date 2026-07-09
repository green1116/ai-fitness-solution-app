/**
 * V80 P5 — System meta closure entry (read-only)
 */
export {
  SYSTEM_CLOSURE_CATALOG,
  buildSystemClosureCatalogManifest,
  computeSystemDeclarativeClosureSealed,
  getSystemClosureProofById,
  getSystemClosureProofsByKind,
  isSystemClosureCatalogRefsAligned,
} from "./system.closure.catalog";
export {
  SYSTEM_COMPLETENESS_PROOFS,
  buildSystemCompletenessManifest,
  getSystemCompletenessProofByPhase,
  isSystemCompletenessProofComplete,
} from "./system.closure.completeness";
export {
  SYSTEM_GLOBAL_INVARIANT_CERTS,
  buildSystemInvariantCertManifest,
  getSystemGlobalInvariantCertById,
  getSystemGlobalInvariantCertByInvariantRef,
  isSystemGlobalInvariantCertComplete,
} from "./system.closure.invariant";
export {
  SYSTEM_ROLLBACK_INDEX,
  V80_SYSTEM_LAYER_VERSION_LOCK,
  buildSystemFinalFreezeManifest,
  getSystemRollbackEntryByPhase,
  isSystemLayerVersionLockIntact,
  isSystemRollbackIndexComplete,
  systemVersionLockMatchesExpected,
} from "./system.closure.freeze";
export { collectSystemPhaseReadiness } from "./system.closure.readiness";
export {
  assertSystemClosurePass,
  buildSystemClosure,
  closeV80System,
} from "./system.closure.builder";
export {
  V80_SYSTEM_CLOSURE_FREEZE_VERSION,
  V80_SYSTEM_CLOSURE_VERSION,
  V80_SYSTEM_FREEZE_VERSION,
  V80_SYSTEM_SIGNOFF_VERSION,
} from "./system.closure";
export type {
  SystemClosureProof,
  SystemClosureReport,
  SystemClosureSignals,
  SystemCompletenessProof,
  SystemFinalFreezeManifest,
  SystemGlobalInvariantCert,
  SystemVersionLock,
} from "./system.closure";

import { buildSystemClosure } from "./system.closure.builder";
import type { SystemClosureReport, SystemClosureSignals } from "./system.closure";

export function runSystemClosure(input?: {
  deploymentId?: string;
  signals?: SystemClosureSignals;
}): SystemClosureReport {
  return buildSystemClosure(input);
}

export function formatSystemClosureSummary(report: SystemClosureReport): string {
  return [
    "V80 System Meta Closure",
    `  ready: ${report.closureReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  signoff: ${report.signoffVersion}`,
    `  freeze: ${report.freeze.version}`,
    `  sealed: ${report.freeze.sealed}`,
    `  integrity: ${report.systemIntegrityVersion} (ready=${report.systemIntegrityReady})`,
    `  closure-proofs: ${report.catalog.entryCount}`,
    `  completeness: ${report.completeness.proofCount}`,
    `  invariant-certs: ${report.invariantCert.certCount}`,
  ].join("\n");
}
