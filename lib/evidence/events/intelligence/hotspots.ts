import type {
  RuntimeEventOrchestrationResult,
  RuntimeEventType,
} from "../types";
import type {
  EventTimelineIntelligence,
  GovernanceHotspot,
  GovernanceHotspotIntelligence,
  TimelinePhase,
} from "./types";

export function buildGovernanceHotspotIntelligence(
  orchestration: RuntimeEventOrchestrationResult,
  timeline: EventTimelineIntelligence,
): GovernanceHotspotIntelligence {
  const uniqueTypes = new Set(
    timeline.orderedSteps.map((s) => s.eventType),
  );
  const total = Math.max(1, timeline.orderedSteps.length);

  const escalationCount = timeline.escalationChain.length;
  const blockCount = timeline.orderedSteps.filter(
    (s) => s.eventType === "RELEASE_BLOCKED",
  ).length;
  const execCount = timeline.orderedSteps.filter((s) =>
    ["EXECUTIVE_REVIEW_UNLOCKED", "EXECUTIVE_APPROVED", "EXECUTIVE_REJECTED"].includes(
      s.eventType,
    ),
  ).length;
  const policyBlocks =
    orchestration.flags.releaseBlocked && blockCount > 0 ? 1 : 0;

  const hotspots: GovernanceHotspot[] = [];

  if (escalationCount > 0) {
    hotspots.push({
      id: "hotspot-escalation",
      kind: "escalation",
      density: escalationCount / total,
      eventTypes: timeline.escalationChain.map((s) => s.eventType),
      summary: `治理升级 ${escalationCount} 次，密度 ${Math.round((escalationCount / total) * 100)}%`,
    });
  }

  if (blockCount > 0) {
    hotspots.push({
      id: "hotspot-release-freeze",
      kind: "release-freeze",
      density: blockCount / total,
      eventTypes: (
        ["RELEASE_BLOCKED", "GOVERNANCE_ESCALATED", "VALIDATION_FAILED"] as const
      ).filter((t) => uniqueTypes.has(t)) as RuntimeEventType[],
      summary: `释放冻结 ${blockCount} 次，常与校验/治理链路联动`,
    });
  }

  if (policyBlocks > 0 || uniqueTypes.has("RELEASE_BLOCKED")) {
    hotspots.push({
      id: "hotspot-policy",
      kind: "policy-rejection",
      density: (blockCount + (orchestration.flags.governanceEscalated ? 1 : 0)) / total,
      eventTypes: ["RELEASE_BLOCKED", "GOVERNANCE_FAILED"],
      summary: "策略/治理导致释放阻断",
    });
  }

  if (execCount > 0) {
    hotspots.push({
      id: "hotspot-executive",
      kind: "executive-intervention",
      density: execCount / total,
      eventTypes: (
        [
          "EXECUTIVE_REVIEW_UNLOCKED",
          "EXECUTIVE_APPROVED",
          "MANIFEST_GENERATION_REQUESTED",
        ] as const
      ).filter((t) => uniqueTypes.has(t)) as RuntimeEventType[],
      summary: `高管介入节点 ${execCount} 个`,
    });
  }

  const phaseCounts = new Map<TimelinePhase, number>();
  for (const step of timeline.orderedSteps) {
    if (step.escalated || step.failed) {
      phaseCounts.set(step.phase, (phaseCounts.get(step.phase) ?? 0) + 1);
    }
  }
  let bottleneckPhase: TimelinePhase | null = null;
  let maxPhase = 0;
  for (const [phase, count] of phaseCounts) {
    if (count > maxPhase) {
      maxPhase = count;
      bottleneckPhase = phase;
    }
  }

  const escalationDensity = escalationCount / total;
  const summary =
    hotspots.length === 0
      ? "本 run 未检测到显著治理热点"
      : `检测到 ${hotspots.length} 个治理热点；瓶颈阶段: ${bottleneckPhase ?? "无"}`;

  return {
    hotspots,
    escalationDensity: Math.round(escalationDensity * 100) / 100,
    bottleneckPhase,
    summary,
  };
}
