/**
 * V72 P5 — Intelligence governance builder (read-only)
 */
import { buildIntelligenceCompatibility } from "./compatibility.builder";
import { V72_INTELLIGENCE_COMPATIBILITY_VERSION } from "./intelligence.compatibility";
import {
  buildEscalationManifest,
  buildFreezeGateManifest,
  buildGovernanceAuditTrailManifest,
  buildGovernanceExceptionManifest,
  buildGovernanceRuleManifest,
  buildReviewManifest,
  buildSignoffManifest,
  isIntelligenceGovernanceRefsAligned,
} from "./governance.rules";
import type {
  IntelligenceGovernanceReport,
  IntelligenceGovernanceSignals,
} from "./intelligence.governance";
import {
  V72_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
  V72_INTELLIGENCE_GOVERNANCE_VERSION,
} from "./intelligence.governance";

const DEFAULT_SIGNALS: IntelligenceGovernanceSignals = {
  intelligenceCompatibilityReady: true,
  rulesComplete: true,
  reviewsComplete: true,
  exceptionsComplete: true,
  escalationsComplete: true,
  auditTrailsComplete: true,
  freezeGatesComplete: true,
  signoffsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildIntelligenceGovernance(input?: {
  deploymentId?: string;
  signals?: IntelligenceGovernanceSignals;
}): IntelligenceGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v72-intelligence-governance-default";

  const intelligenceCompatibility = buildIntelligenceCompatibility({ deploymentId });
  const rules = buildGovernanceRuleManifest();
  const reviews = buildReviewManifest();
  const exceptions = buildGovernanceExceptionManifest();
  const escalations = buildEscalationManifest();
  const auditTrails = buildGovernanceAuditTrailManifest();
  const freezeGates = buildFreezeGateManifest();
  const signoffs = buildSignoffManifest();
  const refsAligned = isIntelligenceGovernanceRefsAligned();

  const signals: IntelligenceGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    intelligenceCompatibilityReady: intelligenceCompatibility.compatibilityReady,
    rulesComplete: rules.catalogComplete,
    reviewsComplete: reviews.catalogComplete,
    exceptionsComplete: exceptions.catalogComplete,
    escalationsComplete: escalations.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    freezeGatesComplete: freezeGates.catalogComplete,
    signoffsComplete: signoffs.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V72_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const governanceReady =
    intelligenceCompatibility.compatibilityReady &&
    rules.catalogComplete &&
    reviews.catalogComplete &&
    exceptions.catalogComplete &&
    escalations.catalogComplete &&
    auditTrails.catalogComplete &&
    freezeGates.catalogComplete &&
    signoffs.catalogComplete &&
    refsAligned &&
    signals.intelligenceCompatibilityReady !== false;

  return {
    version: V72_INTELLIGENCE_GOVERNANCE_VERSION,
    freezeVersion: V72_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
    reportId: `intelligence-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    intelligenceCompatibilityVersion: V72_INTELLIGENCE_COMPATIBILITY_VERSION,
    intelligenceCompatibilityReady: intelligenceCompatibility.compatibilityReady,
    rules,
    reviews,
    exceptions,
    escalations,
    auditTrails,
    freezeGates,
    signoffs,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `intelligence-governance ready=${governanceReady}`,
      `rules=${rules.ruleCount}`,
      `reviews=${reviews.entryCount}`,
      `exceptions=${exceptions.entryCount}`,
      `escalations=${escalations.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `freezeGates=${freezeGates.entryCount}`,
      `signoffs=${signoffs.entryCount}`,
      `refsAligned=${refsAligned}`,
      `compatibility=${intelligenceCompatibility.compatibilityReady}`,
    ].join(" "),
  };
}

export function assertIntelligenceGovernancePass(
  report: IntelligenceGovernanceReport,
): asserts report is IntelligenceGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V72 intelligence governance not ready: ${report.summary}`);
  }
}
