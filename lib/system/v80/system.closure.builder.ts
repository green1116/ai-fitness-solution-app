/**
 * V80 P5 — System meta closure builder (read-only)
 */
import { buildSystemIntegrityCatalog } from "./system.integrity.builder";
import { V80_SYSTEM_INTEGRITY_VERSION } from "./system.integrity";
import {
  buildSystemClosureCatalogManifest,
  isSystemClosureCatalogRefsAligned,
} from "./system.closure.catalog";
import { buildSystemCompletenessManifest } from "./system.closure.completeness";
import { buildSystemFinalFreezeManifest } from "./system.closure.freeze";
import { buildSystemInvariantCertManifest } from "./system.closure.invariant";
import { collectSystemPhaseReadiness } from "./system.closure.readiness";
import type { SystemClosureReport, SystemClosureSignals } from "./system.closure";
import {
  V80_SYSTEM_CLOSURE_FREEZE_VERSION,
  V80_SYSTEM_CLOSURE_VERSION,
  V80_SYSTEM_SIGNOFF_VERSION,
} from "./system.closure";

const DEFAULT_SIGNALS: SystemClosureSignals = {
  systemIntegrityCatalogReady: true,
  catalogComplete: true,
  completenessComplete: true,
  certificationComplete: true,
  sealComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

function formatClosingSummary(input: {
  readiness: ReturnType<typeof collectSystemPhaseReadiness>;
  sealed: boolean;
  score: number;
}): string {
  return [
    "V80 System Meta — Final Closure",
    `  sealed: ${input.sealed}`,
    `  score: ${input.score}/100`,
    `  P1 Ontology: ${input.readiness.p1 ? "PASS" : "FAIL"}`,
    `  P2 Policy: ${input.readiness.p2 ? "PASS" : "FAIL"}`,
    `  P3 Simulation: ${input.readiness.p3 ? "PASS" : "FAIL"}`,
    `  P4 Integrity: ${input.readiness.p4 ? "PASS" : "FAIL"}`,
    `  P5 Closure: ${input.sealed ? "SEALED" : "OPEN"}`,
  ].join("\n");
}

export function buildSystemClosure(input?: {
  deploymentId?: string;
  signals?: SystemClosureSignals;
}): SystemClosureReport {
  const deploymentId = input?.deploymentId ?? "v80-system-meta-closure-default";

  const systemIntegrity = buildSystemIntegrityCatalog({ deploymentId });
  const catalog = buildSystemClosureCatalogManifest();
  const completeness = buildSystemCompletenessManifest();
  const invariantCert = buildSystemInvariantCertManifest();
  const freeze = buildSystemFinalFreezeManifest({ deploymentId });
  const readiness = collectSystemPhaseReadiness(deploymentId);
  const refsAligned = isSystemClosureCatalogRefsAligned();

  const signals: SystemClosureSignals = {
    ...DEFAULT_SIGNALS,
    systemIntegrityCatalogReady: systemIntegrity.catalogReady,
    catalogComplete: catalog.catalogComplete,
    completenessComplete: completeness.completenessComplete,
    certificationComplete: invariantCert.certificationComplete,
    sealComplete: freeze.sealed,
    refsAligned,
    freezeVersionDeclared: V80_SYSTEM_CLOSURE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const closureReady =
    systemIntegrity.catalogReady &&
    readiness.ready &&
    catalog.catalogComplete &&
    completeness.completenessComplete &&
    invariantCert.certificationComplete &&
    freeze.sealed &&
    refsAligned &&
    signals.systemIntegrityCatalogReady !== false &&
    signals.refsAligned !== false;

  const readinessScore = closureReady ? 100 : 0;

  return {
    version: V80_SYSTEM_CLOSURE_VERSION,
    freezeVersion: V80_SYSTEM_CLOSURE_FREEZE_VERSION,
    signoffVersion: V80_SYSTEM_SIGNOFF_VERSION,
    reportId: `system-meta-closure-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    systemIntegrityVersion: V80_SYSTEM_INTEGRITY_VERSION,
    systemIntegrityReady: systemIntegrity.catalogReady,
    readiness,
    catalog,
    completeness,
    invariantCert,
    freeze,
    closureReady,
    readinessScore,
    closingSummary: formatClosingSummary({
      readiness,
      sealed: freeze.sealed,
      score: readinessScore,
    }),
    summary: [
      `system-meta-closure ready=${closureReady}`,
      `proofs=${catalog.entryCount}`,
      `completeness=${completeness.proofCount}`,
      `invariantCerts=${invariantCert.certCount}`,
      `sealed=${freeze.sealed}`,
      `integrity=${systemIntegrity.catalogReady}`,
    ].join(" "),
  };
}

export function assertSystemClosurePass(
  report: SystemClosureReport,
): asserts report is SystemClosureReport & { closureReady: true } {
  if (!report.closureReady) {
    throw new Error(`V80 system meta closure not ready: ${report.summary}`);
  }
}

export function closeV80System(input?: {
  deploymentId?: string;
}): SystemClosureReport & { closureReady: true } {
  const report = buildSystemClosure(input);
  assertSystemClosurePass(report);
  return report;
}
