import type { RuntimeEventOrchestrationResult } from "../types";
import type {
  ConfidenceLevel,
  GovernanceHotspotIntelligence,
  ReleaseStabilityIntelligence,
  RuntimeHealthIntelligence,
  RuntimeHealthLabels,
  RuntimeRiskIntelligence,
} from "./types";

function labelConfidence(level: ConfidenceLevel): string {
  switch (level) {
    case "high":
      return "HIGH";
    case "medium":
      return "MEDIUM";
    default:
      return "LOW";
  }
}

function auditIntegrityFromRisk(risk: RuntimeRiskIntelligence): ConfidenceLevel {
  const audit = risk.dimensions.audit.score;
  if (audit <= 15) return "high";
  if (audit <= 40) return "medium";
  return "low";
}

export function buildRuntimeHealthIntelligence(
  orchestration: RuntimeEventOrchestrationResult,
  risk: RuntimeRiskIntelligence,
  release: ReleaseStabilityIntelligence,
  hotspots: GovernanceHotspotIntelligence,
): RuntimeHealthIntelligence {
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          risk.overallScore * 0.45 -
          (100 - release.stabilityScore) * 0.35 -
          hotspots.escalationDensity * 20,
      ),
    ),
  );

  const governanceStability: ConfidenceLevel =
    hotspots.escalationDensity > 0.35 || risk.dimensions.governance.score >= 50
      ? "low"
      : hotspots.escalationDensity > 0.15
        ? "medium"
        : "high";

  const releaseConfidence = release.health;
  const auditIntegrity = auditIntegrityFromRisk(risk);

  let executiveReadiness: RuntimeHealthIntelligence["executiveReadiness"] =
    "ready";
  if (orchestration.flags.releaseBlocked) executiveReadiness = "blocked";
  else if (
    !orchestration.flags.executiveReviewUnlocked &&
    risk.dimensions.executive.score >= 20
  ) {
    executiveReadiness = "conditional";
  } else if (orchestration.flags.executiveReviewUnlocked) {
    executiveReadiness = "ready";
  }

  const labels: RuntimeHealthLabels = {
    runtimeHealth: String(healthScore),
    governanceStability: labelConfidence(governanceStability),
    releaseConfidence: labelConfidence(releaseConfidence),
    auditIntegrity:
      auditIntegrity === "high"
        ? "STRONG"
        : auditIntegrity === "medium"
          ? "MODERATE"
          : "WEAK",
    executiveReadiness:
      executiveReadiness === "ready"
        ? "READY"
        : executiveReadiness === "conditional"
          ? "CONDITIONAL"
          : "BLOCKED",
  };

  return {
    healthScore,
    governanceStability,
    releaseConfidence,
    auditIntegrity,
    executiveReadiness,
    labels,
  };
}
