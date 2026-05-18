import type {
  RuntimeEventOrchestrationResult,
  RuntimeEventType,
} from "../types";
import type {
  EventTimelineIntelligence,
  RuntimeEventAnomaly,
} from "./types";

export function detectRuntimeEventAnomalies(
  orchestration: RuntimeEventOrchestrationResult,
  timeline: EventTimelineIntelligence,
): RuntimeEventAnomaly[] {
  const anomalies: RuntimeEventAnomaly[] = [];
  const types = timeline.orderedSteps.map((s) => s.eventType);
  const typeSet = new Set(types);

  const counts = new Map<string, number>();
  for (const t of types) counts.set(t, (counts.get(t) ?? 0) + 1);
  for (const [t, c] of counts) {
    if (c >= 4) {
      anomalies.push({
        code: "DUPLICATE_EVENT_BURST",
        message: `事件 ${t} 重复 ${c} 次，可能存在编排环路`,
        severity: c >= 6 ? "high" : "medium",
        relatedEventTypes: [t as RuntimeEventType],
      });
    }
  }

  if (
    typeSet.has("GOVERNANCE_ESCALATED") &&
    !typeSet.has("VALIDATION_FAILED") &&
    !typeSet.has("GOVERNANCE_FAILED")
  ) {
    anomalies.push({
      code: "ORPHAN_GOVERNANCE_ESCALATION",
      message: "治理升级未伴随明确校验失败事件",
      severity: "medium",
      relatedEventTypes: ["GOVERNANCE_ESCALATED"],
    });
  }

  if (typeSet.has("RELEASE_ENABLED") && typeSet.has("RELEASE_BLOCKED")) {
    const firstBlock = timeline.orderedSteps.findIndex(
      (s) => s.eventType === "RELEASE_BLOCKED",
    );
    const firstEnable = timeline.orderedSteps.findIndex(
      (s) => s.eventType === "RELEASE_ENABLED",
    );
    if (firstEnable < firstBlock) {
      anomalies.push({
        code: "RELEASE_ENABLE_BEFORE_BLOCK",
        message: "释放启用出现在阻断之前，时序异常",
        severity: "high",
        relatedEventTypes: ["RELEASE_ENABLED", "RELEASE_BLOCKED"],
      });
    } else if (orchestration.flags.releaseBlocked && orchestration.flags.releaseEnabled) {
      anomalies.push({
        code: "RELEASE_FLAG_CONFLICT",
        message: "同时存在 releaseBlocked 与 releaseEnabled 编排标志",
        severity: "high",
        relatedEventTypes: ["RELEASE_BLOCKED", "RELEASE_ENABLED"],
      });
    }
  }

  if (
    typeSet.has("VALIDATION_FAILED") &&
    !typeSet.has("COVERAGE_RE_EVALUATED") &&
    !typeSet.has("OCR_COMPLETED")
  ) {
    anomalies.push({
      code: "VALIDATION_WITHOUT_COVERAGE_TRACE",
      message: "校验失败但缺少 OCR/覆盖事件轨迹，证据链不完整",
      severity: "medium",
      relatedEventTypes: ["VALIDATION_FAILED"],
    });
  }

  if (timeline.escalationChain.length >= 3) {
    anomalies.push({
      code: "ESCALATION_CHAIN_DENSE",
      message: `升级链密集（${timeline.escalationChain.length} 步），治理瓶颈明显`,
      severity: "high",
    });
  }

  return anomalies;
}
