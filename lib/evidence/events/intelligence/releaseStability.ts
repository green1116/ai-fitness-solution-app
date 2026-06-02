import type { RuntimeEventOrchestrationResult } from "../types";
import { LIFECYCLE_PHASE_ORDER } from "./constants";
import type {
  ConfidenceLevel,
  EventTimelineIntelligence,
  ReleaseStabilityIntelligence,
  TimelinePhase,
} from "./types";

function confidenceFromScore(score: number): ConfidenceLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function buildReleaseStabilityIntelligence(
  orchestration: RuntimeEventOrchestrationResult,
  timeline: EventTimelineIntelligence,
): ReleaseStabilityIntelligence {
  const blockCount = timeline.orderedSteps.filter(
    (s) => s.eventType === "RELEASE_BLOCKED",
  ).length;
  const enableCount = timeline.orderedSteps.filter(
    (s) => s.eventType === "RELEASE_ENABLED",
  ).length;

  let stabilityScore = 100;
  stabilityScore -= blockCount * 18;
  stabilityScore -= timeline.failureNodes.length * 6;
  if (orchestration.flags.releaseBlocked) stabilityScore -= 12;
  if (blockCount > 0 && enableCount > 0) stabilityScore -= 10;
  stabilityScore = Math.max(0, Math.min(100, stabilityScore));

  const phaseFailures = new Map<TimelinePhase, number>();
  for (const step of timeline.failureNodes) {
    phaseFailures.set(step.phase, (phaseFailures.get(step.phase) ?? 0) + 1);
  }
  const fragileStages = LIFECYCLE_PHASE_ORDER.filter(
    (p) => (phaseFailures.get(p) ?? 0) > 0,
  );

  const frequentBlockSources: string[] = [];
  if (timeline.orderedSteps.some((s) => s.eventType === "VALIDATION_FAILED")) {
    frequentBlockSources.push("validation-failure");
  }
  if (timeline.orderedSteps.some((s) => s.eventType === "GOVERNANCE_ESCALATED")) {
    frequentBlockSources.push("governance-escalation");
  }
  if (timeline.orderedSteps.some((s) => s.eventType === "AUDIT_REJECTED")) {
    frequentBlockSources.push("audit-rejection");
  }
  if (orchestration.flags.governanceEscalated) {
    frequentBlockSources.push("governance-flag");
  }

  const confidence = stabilityScore;
  const health = confidenceFromScore(stabilityScore);

  const summary =
    blockCount === 0
      ? `释放稳定：${enableCount} 次启用，无阻断`
      : `释放不稳定：${blockCount} 次阻断 / ${enableCount} 次启用；脆弱阶段: ${fragileStages.join(", ") || "无"}`;

  return {
    health,
    confidence,
    stabilityScore,
    blockCount,
    enableCount,
    fragileStages,
    frequentBlockSources,
    summary,
  };
}
